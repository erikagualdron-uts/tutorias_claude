# Research: Chat y anuncios

No quedaron marcadores `NEEDS CLARIFICATION`. Decisiones de diseño, con lo que se revisó en el código el 2026-11-22.

## R-1: Transporte en tiempo real

- **Hallazgo**: el backend no tiene ninguna conexión en tiempo real y `Architecture.md` §8 ya prescribe Socket.IO con JWT, salas por conversación y mensajes guardados antes de emitirse.
- **Decisión**: Socket.IO con `@nestjs/websockets` y `@nestjs/platform-socket.io` (versión 12, igual que el resto de NestJS), en el mismo puerto de la API, y `socket.io-client` en la app. Son dependencias nuevas, justificadas porque SC-001 pide menos de 2 s.
- **Alternativas descartadas**: consultar la API cada pocos segundos (gasta batería y multiplica peticiones); WebSocket nativo sin Socket.IO (habría que escribir reconexión, ack y salas a mano); Server-Sent Events (React Native no los soporta bien).

## R-2: Las órdenes van por REST, solo la entrega por WebSocket

- **Decisión**: enviar (`POST /chat/conversations/:id/messages`), leer, listar y paginar son REST con `JwtAuthGuard` y los mismos `AppException`; el WebSocket solo recibe `conversation:open` y `conversation:close` del cliente y emite `message:new` y `unread:changed` del servidor.
- **Razón**: se reutilizan guards, validación, errores con código estable y pruebas con Supertest; un reintento por REST es idempotente por `clientMessageId`; y un fallo del socket no impide enviar. El mensaje se guarda antes de emitirse por construcción: se emite después del `INSERT`.
- **Alternativa descartada**: enviar por el socket con acuse (obliga a duplicar la validación, los guards y el mapa de errores para el canal WebSocket).

## R-3: Autenticación y a quién se emite

- **Decisión**: al conectar, el cliente manda el token de acceso en el saludo; el servidor lo verifica con `JwtService` y `SessionService.validate` (la misma sesión viva y cuenta activa que el guard HTTP) y mete el socket en la sala `user:<id>`. `conversation:open` revalida la pertenencia y registra la conversación abierta de ese dispositivo.
- **Emisión**: nunca a una sala de conversación. Por cada mensaje, el servidor calcula en la base los destinatarios que hoy pueden verlo (cuenta activa y visibilidad) y emite `message:new` solo a sus salas `user:<id>`.
- **Razón**: si se desactiva una cuenta con un socket abierto, ya no entra en el cálculo y no recibe nada aunque su conexión siga viva hasta que venza el token. No hace falta engancharse a la baja de cuentas.

## R-4: Presencia y push

- **Decisión**: `ChatPresence` guarda en memoria qué conversación tiene abierta cada socket. Un destinatario "la tiene abierta" si alguno de sus sockets la abrió. Si no, y según la regla, se envía push:
  - **Chat individual**: un push por ráfaga, con `SET chat:push:<conversación>:<destinatario> NX EX <chat.pushBurstSeconds>` en Redis (60 s por defecto): el primer mensaje manda el push y los siguientes dentro del plazo no.
  - **Chat del módulo**: push solo para los anuncios, a todos los inscritos que no lo tengan abierto; los mensajes normales solo suman al contador (aclaración del 2026-11-22).
- **Contenido**: título con el nombre de quien escribe (o "Anuncio · <módulo>" en el idioma del destinatario) y el texto del mensaje recortado a 140 caracteres; `data` con `conversationId`. Nunca correo ni teléfono (SC-007).
- **Envío**: el servidor lo hace después de confirmar la transacción, sin esperar la respuesta, con `PushGateway`. Un dispositivo que Expo informa como inexistente en el ticket se descarta. Es de mejor esfuerzo: si falla, el mensaje igual está guardado y sin leer.
- **Dispositivos vivos**: el criterio ya existe en `DeliveriesService` (token sin borrar, sesión sin revocar ni vencida). Se extrae a `notifications/devices.ts` y lo usan los dos para no tener dos copias.
- **Límite conocido**: la presencia en memoria sirve para una sola instancia del servidor, que es lo que hay hoy; con varias haría falta el adaptador de Redis de Socket.IO. Queda anotado en `Architecture.md`.
- **Alternativas descartadas**: guardar el push en la bandeja de avisos (los mensajes tendrían dos contadores y la bandeja se llenaría de chat); un trabajo de cola por push (la entrega ya es de mejor esfuerzo y el volumen es bajo).

## R-5: Quién puede hablar con quién (calculado, no copiado)

- **Decisión**: `chat-access.ts` es la única función que responde, a partir de las filas vivas:
  - **Individual CAE y docente**: siempre, mientras las dos cuentas estén activas.
  - **Individual docente y estudiante**: pueden escribir si el estudiante tiene una inscripción `ACTIVE` (sin borrar) en un módulo vivo de ese docente cuyo periodo no está cerrado. Si no, la conversación existente es de solo lectura para los dos (`CHAT_READ_ONLY`, motivo `NO_SHARED_MODULE`).
  - **Módulo**: ven y escriben el docente del módulo y los estudiantes con inscripción `ACTIVE`, mientras el periodo no esté cerrado (si lo está, solo lectura `PERIOD_CLOSED`). Un estudiante sin inscripción `ACTIVE` no tiene acceso: el chat ni se lista ni se abre (`404 CHAT_NOT_FOUND`), como pide la spec. Solo el docente del módulo publica anuncios (`CHAT_ANNOUNCEMENT_FORBIDDEN`).
  - **Cuenta de la otra persona desactivada o eliminada**: `CHAT_READ_ONLY` con motivo `PARTNER_UNAVAILABLE`. La cuenta propia desactivada ya no pasa el guard.
- **Razón**: derivar de las inscripciones evita copiar participantes y mantenerlos al día cuando alguien se inscribe o se da de baja. Las reglas viven en una función pura probada.

## R-6: Ventana de visibilidad del chat del módulo

- **Decisión**: el estudiante accede al chat solo con una inscripción `ACTIVE`; dentro del chat un mensaje es visible si existe una inscripción suya al módulo con `createdAt` ≤ la fecha del mensaje y (`status` = `ACTIVE` o la fecha del mensaje < `effectiveUntil`). La ventana solo sirve para ocultar lo publicado mientras no estuvo inscrito si se da de baja y vuelve a inscribirse. El docente ve todo. No hay copias de participantes.
- **Razón**: cumple "desde su inscripción" y "hasta su baja" con los datos de la spec 011, también si se inscribe, se da de baja y vuelve a inscribirse (varias filas).

## R-7: Chat del módulo bajo demanda

- **Decisión**: la fila `conversations` de un módulo se crea la primera vez que alguien con acceso la necesita, con `INSERT ... ON CONFLICT (module_id) DO NOTHING` (índice único por módulo). `GET /chat/conversations` la asegura para los módulos del usuario y la devuelve aunque no tenga mensajes (con "sin mensajes"); los individuales sin mensajes vivos no se listan.
- **Razón**: no hay que tocar la creación de módulos (spec 010) ni migrar los que ya existen.

## R-8: Sin leer

- **Decisión**: `conversation_members.last_read_at` por usuario y conversación. Sin leer = mensajes visibles, de otros, sin borrar, posteriores a `last_read_at` (sin fila: todos los visibles). Marcar leída pone `last_read_at` = ahora, de la conversación pedida. El total para la pestaña sale de una sola consulta agrupada. Al leer o recibir se emite `unread:changed` a las salas del propio usuario para que dos dispositivos coincidan.
- **Razón**: SC-005 pide que el contador coincida también con dos dispositivos.

## R-9: Idempotencia, orden y paginación

- **Decisión**: índice único `(conversation_id, sender_id, client_message_id)`: un reintento devuelve el mensaje ya guardado con `200` y no emite otra vez. Los mensajes se ordenan y paginan por `(created_at, id)` descendente con `before` (cursor de la última fila vista), sin saltos ni repeticiones.
- **Razón**: FR-010 y SC-004.

## R-10: Mensajes sin conexión en la app

- **Decisión**: la app mantiene en memoria una cola de envíos pendientes con su `clientMessageId`. Un fallo de red deja el mensaje en "enviando" y se reintenta al reconectar el socket y al volver la app a primer plano; una respuesta `4xx` lo deja en "falló" con reintento manual. Si la app se cierra, la cola se pierde (decisión de la aclaración).
- **Razón**: FR-011; sin almacenamiento local nuevo.

## R-11: Retención

- **Decisión**: `chat-retention.task.ts` con `@Cron` diario (03:00 de `America/Bogota`), mismo patrón de `PeriodsExpiryTask`: marca `deleted_at` en los mensajes de módulo con más de `chat.moduleRetentionMonths` (6) y en los individuales con más de `chat.directRetentionMonths` (24). Es idempotente y registra solo el número de filas. Las conversaciones individuales sin mensajes vivos salen de la lista; no se borran.
- **Razón**: FR-017; borrado lógico por la constitución.

## R-12: Límites de texto y de ráfaga

- **Decisión**: `chat.messageMaxLength` = 2000, `chat.directRetentionMonths` = 24, `chat.moduleRetentionMonths` = 6 y `chat.pushBurstSeconds` = 60, en `SettingValues` con su valor por defecto. La columna admite hasta 4000 para no migrar si cambia el límite. La app lee el largo de `GET /chat/conversations/:id` (campo `limits`).
- **Razón**: la constitución pide que los límites vivan en configuración; los valores concretos no están en `docs/` y se proponen.

## R-13: Contactos para iniciar una conversación

- **Decisión**: `GET /chat/contacts` devuelve a quién puede escribir quien consulta: el CAE a los docentes activos; el docente a los estudiantes con inscripción `ACTIVE` en sus módulos vivos (periodo no cerrado) y al CAE; el estudiante a los docentes de sus módulos con inscripción `ACTIVE`. Con búsqueda por nombre sin tildes (`unaccent`, ya habilitada).
- **Razón**: la pantalla "Nuevo mensaje" y la regla del servidor usan la misma lógica de `chat-access.ts`.

## R-14: Fuera de esta spec

Imágenes y archivos, editar o borrar mensajes, "escribiendo", "leído por el otro", correo por mensaje, adaptador de Redis para varias instancias, límite de mensajes por minuto y almacenamiento local de pendientes.
