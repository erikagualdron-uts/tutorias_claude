# Research: Notificaciones de cambios en los módulos

Formato: Decisión, motivo y alternativas descartadas. No quedaban marcas `NEEDS CLARIFICATION`; las decisiones aplazadas por `/speckit-clarify` (reintentos, espera y lotes) se cierran en R-4 y R-5.

## R-1 · Cómo se consume el outbox sin perder ni duplicar avisos

- **Decisión**: un sondeo cada `OUTBOX_POLL_SECONDS` (5 s por defecto), como trabajo repetible de BullMQ (así dos instancias de la API no lo ejecutan a la vez). Cada vuelta toma hasta 50 eventos con `processed_at IS NULL` ordenados por `(created_at, id)` y procesa **uno por transacción**: `SELECT … FOR UPDATE SKIP LOCKED`, crea los avisos, crea las entregas y fija `processed_at`. El índice único `(event_id, user_id)` en `notifications` hace idempotente cualquier repetición.
- **Motivo**: la transacción une "avisos creados" y "evento procesado" (FR-001); si el servicio muere a mitad, la transacción se revierte y el evento se reintenta entero. `SKIP LOCKED` evita bloquear otra instancia. Un evento por transacción mantiene el orden (FR-002) y un fallo no revierte a los demás.
- **Evento con error inesperado**: se registra (id y tipo, sin datos personales), se deja pendiente y se reintenta en la siguiente vuelta; nunca se marca procesado sin avisar. Un evento sin destino válido (módulo o sesión eliminados, sin inscritos) sí se marca procesado y se registra el motivo (FR-001 y casos límite).
- **Descartado**: `LISTEN/NOTIFY` de PostgreSQL (más piezas y sin reanudar pendientes al arrancar); encolar en BullMQ desde la transacción del cambio (la spec 010 lo descartó en D-087); un campo `attempts` en el evento para rendirse (perder un aviso viola SC-002; mejor reintentar y alertar en el registro).

## R-2 · Quién recibe cada tipo de evento

- **Decisión**: se resuelve al procesar, nunca se copia al evento (FR-003 y FR-004), con el fragmento `ATTENDS_SESSION` de la spec 011 (inscripción ACTIVE, o CANCELLED con la sesión antes de `effective_until`, usuario activo, sin ausencia viva):
  - **Cambio de docente o salón** (`MODULE_TEACHER_CHANGED`, `MODULE_ROOM_CHANGED`): inscritos con alguna sesión futura que asistan a ella; el aviso nombra al nuevo docente o salón, leídos en ese momento.
  - **Eventos con `sessions[]`** (`SESSION_RESCHEDULED`, `SESSION_CANCELLED_TEACHER`, `SESSION_RESTORED_TEACHER`): un estudiante recibe el aviso si asiste a **al menos una** de las sesiones afectadas; el texto solo lista las que le tocan.
  - **Festivos** (`SESSIONS_CANCELLED_HOLIDAY`, `SESSIONS_RESTORED_HOLIDAY`): el payload trae la fecha y cantidades, no ids; se buscan las sesiones del módulo de ese día de Bogotá y se aplica la misma regla.
  - Solo estudiantes: el docente y el CAE no reciben avisos en esta spec (clarificación del 2026-11-18).
- **Motivo**: coincide con el cupo por sesión (D-090) y evita avisar a quien ya canceló o marcó ausencia. Un solo aviso por cambio (FR-007).
- **Descartado**: copiar los estudiantes al evento (rompe D-087); avisar a toda inscripción ACTIVE sin mirar ausencias (viola el caso límite de la spec).

## R-3 · Plantillas, idioma y fechas

- **Decisión**: plantillas TypeScript por idioma (`templates/es.ts`, `en.ts`) con una función por tipo de evento que recibe un contexto ya resuelto (módulo, fechas, docente o salón, alcance) y devuelve `{ title, body }`. Las fechas se formatean con `Intl.DateTimeFormat` en `America/Bogota` y el idioma del destinatario (`User.locale`). El correo reutiliza título y cuerpo con un pie y el saludo propios (texto plano, como los correos de la spec 001).
- **Resumen de varias sesiones**: una sesión → fecha y hora; de 2 a 3 → lista corta; más de 3 → primera, última y cantidad ("5 sesiones, del lun 24 nov al lun 22 dic").
- **Motivo**: FR-006 exige un solo lugar para los textos; las funciones puras se prueban sin base de datos, en ambos idiomas y en zona de Bogotá. El aviso se guarda ya redactado (los viejos no se retraducen).
- **Descartado**: i18next en el servidor (dependencia nueva para 7 plantillas); guardar solo la clave y traducir en la app (el push y el correo no pasan por la app y el idioma cambiaría el pasado).

## R-4 · Entrega por cola, reintentos y barrido

- **Decisión**: la transacción de R-1 crea una fila `notification_deliveries` por aviso y canal (`PUSH`, `EMAIL`) en estado `PENDING`. Tras confirmar, se encola un trabajo por entrega en la cola `notifications` con `jobId = deliveryId` (idempotente: repetir `add` no duplica). Un **barrido** cada `NOTIFICATION_SWEEP_SECONDS` (60 s) vuelve a encolar las entregas `PENDING` sin trabajo vivo y con más de un minuto, cubriendo Redis caído y cierres entre la transacción y el encolado.
- **Reintentos**: `NOTIFICATION_DELIVERY_ATTEMPTS` = 8 con espera exponencial desde `NOTIFICATION_BACKOFF_SECONDS` = 15 s (15, 30, 60, 120, 240, 480 y 960 s, unos 31 min en total). Cubre con holgura una caída de 10 min (SC-004). Agotados, la entrega pasa a `FAILED` y se registra el tipo de evento, el canal y la causa, sin correo, token ni clave (FR-022).
- **Estados** (FR-023): `PENDING`, `SENT`, `FAILED`, `SKIPPED` (sin dispositivos, sin permiso, correo de dominio no válido).
- **Correo sin configurar**: el procesador no cuenta intento ni falla; deja la entrega `PENDING` con causa `SMTP_NOT_CONFIGURED` y el barrido la reencola solo cuando hay configuración (FR-020). Así nada se pierde y no se acumulan trabajos inútiles.
- **Fallos aislados** (FR-021): un trabajo por aviso y canal, de modo que un destinatario fallido no afecta a los demás (historia 5, escenario 3).
- **Motivo**: el estado en la base de datos es la fuente de verdad y la cola solo es el medio; sobrevive a reinicios y a perder Redis.
- **Descartado**: reintentos infinitos (acumulan basura); un trabajo por evento (un destinatario lento frena al resto); marcar `FAILED` el correo sin configurar (contradice FR-020).

## R-5 · Push con Expo y dispositivos inválidos

- **Decisión**: cliente propio detrás de la interfaz `PUSH_GATEWAY` (`push/push-gateway.ts`), igual que `holidays-client` con `nager`. Envía a `https://exp.host/--/api/v2/push/send` en lotes de 100 mensajes, con `to`, `title`, `body`, `data: { notificationId, moduleId }` y el canal de Android. Un trabajo envía a **todos** los dispositivos vivos del usuario (FR-015). Una respuesta con `DeviceNotRegistered` descarta ese dispositivo (soft delete) y no se reintenta (historia 3, escenario 6). Los demás errores del ticket reintentan.
- **Recibos**: Expo informa muchos `DeviceNotRegistered` solo en los recibos. Tras enviar, se encola un trabajo diferido (15 min) con los `ticketId` y el token de cada uno, que consulta `getReceipts` y descarta lo inválido. Si ese trabajo se pierde, el siguiente envío al dispositivo vuelve a recibir el error.
- **Cierre de sesión** (FR-016): `push_tokens` guarda `sessionId`; `POST /auth/logout` descarta los dispositivos de esa sesión en el servidor, aunque la app no alcance a pedirlo. La app además llama a `DELETE /notifications/devices/{token}` antes de cerrar sesión.
- **Registro** (FR-014): `PUT /notifications/devices` con `{ token, platform }` es idempotente por `token`, que es único en toda la tabla: si el token ya existía para otro usuario se reasigna al nuevo (un dispositivo pertenece a un solo usuario).
- **Motivo**: sin dependencia nueva (`expo-server-sdk` solo envuelve estas dos llamadas), pruebas con un falso y cumplimiento de FR-016 sin depender de la app.
- **Descartado**: `expo-server-sdk` (dependencia por dos endpoints); FCM y APNs directos (más credenciales y código, D-024 ya eligió Expo Push); verificar recibos en el mismo trabajo con espera (bloquea el worker).

## R-6 · Configuración del correo del CAE

- **Decisión**: `SmtpConfigService` (en `mail/`) resuelve la configuración en este orden: fila de `smtp_configs` (más reciente), variables `SMTP_*`, ninguna (FR-020). Calcula el estado: `NOT_CONFIGURED`, `CONFIGURED` o `NEEDS_RECONFIGURATION` (la clave no se descifra con la clave del servidor, p. ej. cambió `SMTP_ENCRYPTION_KEY`), más `usingEnvironment`. Crea el transporte en cada envío, por lo que un cambio rige para los envíos siguientes sin reiniciar (FR-030). `MailProcessor` (códigos de la spec 001) y el procesador de avisos usan este servicio y se elimina el duplicado actual.
- **API**: `GET /settings/smtp`, `PUT /settings/smtp` (mantiene una sola fila; clave vacía conserva la anterior) y `POST /settings/smtp/test` (envía al correo del CAE del token y responde `{ ok, cause }` con una causa en lenguaje simple: `AUTH_FAILED`, `CONNECTION_FAILED`, `TIMEOUT`, `SENDER_REJECTED`, `UNKNOWN`). La clave nunca se devuelve completa: solo `hasPassword: true`.
- **Motivo**: FR-019 y FR-026 a FR-030. El mapeo de causas evita mostrar el texto del servidor SMTP, que puede incluir datos sensibles.
- **Descartado**: variables de entorno como única fuente (el CAE no puede corregirlas); una fila por versión (nadie la necesita, `orderBy updatedAt` ya cubre filas heredadas).

## R-7 · Bandeja y contador en la app

- **Decisión**: la bandeja consulta `GET /notifications?page&limit` (más reciente primero, paginación acumulada con `useInfiniteQuery`) y el contador `GET /notifications/unread-count`. No hay WebSocket todavía (el chat es otra spec), así que el contador se refresca: cada 60 s con la app abierta, al volver a primer plano, al recibir un push con la app abierta y tras marcar leído (invalidación). La campana vive en `AppBar`, junto al avatar, para los tres roles; la ruta es `notifications` dentro de cada grupo.
- **Abrir el destino** (FR-012): `openTarget` convierte `{ moduleId }` en la ruta del módulo según el rol (`/(student)/modules/[id]`, `/(teacher)/schedule` y `/(admin)/modules`). Si la consulta del módulo responde `404`, la pantalla de detalle ya muestra el error traducido; se agrega el mensaje `errors.NOT_FOUND` específico de aviso ("Este módulo ya no está disponible").
- **Push al tocar**: `expo-notifications` entrega `data.moduleId`; con la app cerrada, la respuesta inicial se lee al arrancar. Se marca el aviso como leído al abrirlo.
- **Permiso explicado** (FR-014): una hoja propia explica el motivo antes del permiso del sistema, se muestra una vez tras el primer inicio de sesión del estudiante y, si se rechaza, no vuelve a molestar (se ofrece desde la bandeja). Rechazar no afecta a los otros canales (FR-017).
- **Descartado**: WebSocket para el contador (es la spec del chat; se reutilizará después sin romper el contrato); `refetchInterval` agresivo (gasto de batería); pedir el permiso al abrir la app por primera vez (sin contexto, más rechazos).

## R-8 · Modelo de datos

- **Decisión**: tres tablas nuevas (ver [data-model.md](data-model.md)) y ningún cambio a tablas existentes. `notifications` guarda título y cuerpo ya redactados, idioma, módulo y evento; `notification_deliveries` el estado por canal; `push_tokens` el dispositivo con `session_id`. Índices: `(user_id, created_at DESC, id)` para la bandeja, `(user_id) WHERE read_at IS NULL` para el contador, `(status, updated_at)` para el barrido y único `(event_id, user_id)` para la idempotencia.
- **Motivo**: `Architecture.md` §5 ya prevé `Notification` y `PushToken`; la entrega y la idempotencia piden dos detalles más que se agregan sin tocar nada existente.
- **Descartado**: reutilizar `outbox_events` como bandeja (mezcla log con estado de lectura); estados de entrega dentro de `notifications` (no escalan a más canales ni guardan intentos por separado).

## R-9 · Pruebas y Expo Go

- **Decisión**: las pruebas e2e inyectan `PUSH_GATEWAY` y un transporte de correo falsos (como `FakeMailbox` y el `HolidaysClient` falso de `test-app.ts`) y llaman al consumidor directamente en lugar de esperar el sondeo, con `TestClock` para las fechas. Las pruebas de la app simulan `expo-notifications`. La verificación del push real queda en el recorrido manual del [quickstart](quickstart.md): Expo Go en Android ya no admite push remoto, por lo que se prueba con iPhone y Expo Go o con una compilación de desarrollo.
- **Motivo**: pruebas deterministas, sin red, sin esperar temporizadores, y la limitación de la plataforma anotada como pidió la spec.
