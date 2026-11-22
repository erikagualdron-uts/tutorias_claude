# Architecture.md

> El cómo técnico del proyecto. Para el qué y el porqué ver `Context.md`.

## 1. Visión general

```
┌──────────────────────┐        HTTPS (REST)        ┌─────────────────────────┐
│  App móvil           │ ─────────────────────────► │  API NestJS             │
│  React Native (Expo) │ ◄───────────────────────── │  - Auth / RBAC          │
│  Android + iOS       │      WebSocket (Socket.IO) │  - Módulos de negocio   │
└──────────────────────┘ ◄────────────────────────► │  - Gateway de chat      │
         ▲                                           └───────┬───────┬─────────┘
         │ push (FCM / APNs)                                 │       │
         │                                         ┌─────────▼──┐ ┌──▼────────┐
   Expo Push Service ◄──────────────────────────── │ PostgreSQL │ │ Redis     │
                                                   └────────────┘ │ (colas)   │
                                                                  └──┬────────┘
                                                                     │
                                                          Worker: correos (SMTP),
                                                          push, limpieza de datos
```

## 2. Stack tecnológico

### App móvil
| Necesidad | Tecnología |
|---|---|
| Framework | React Native + **Expo** (TypeScript) |
| Navegación | Expo Router, con grupos de rutas por rol |
| Datos del servidor | TanStack Query |
| Estado local | Zustand |
| Formularios | React Hook Form + Zod |
| Idiomas (es / en) | i18next + expo-localization (sigue el idioma del dispositivo) |
| Chat en tiempo real | socket.io-client |
| Push | expo-notifications |
| Sesión segura | expo-secure-store (tokens) |
| Calendario semanal | react-native-big-calendar (o vista propia) |
| Selector de fecha | `@react-native-community/datetimepicker` (compatible con Expo Go), detrás del componente `DateField`; en iOS se muestra en la hoja `DatePickerSheet` con Confirmar y Cancelar |
| Fechas de calendario | Módulo propio `src/date/day.ts` sobre texto `YYYY-MM-DD`, sin librería de fechas (D-081) |
| Indicador de carga | Componente propio `BrandLoader` con Reanimated y `react-native-svg` (ya presente por Iconify): un ícono de la marca por iteración (libro, pluma, hoja) dentro de un anillo giratorio; cada ícono crece al entrar y se reduce al salir, sin sacudida |

### Backend
| Necesidad | Tecnología |
|---|---|
| Framework | **NestJS** (TypeScript) |
| Base de datos | **PostgreSQL** |
| ORM | Prisma |
| Autenticación | JWT (access + refresh), contraseñas con argon2 |
| Tiempo real | NestJS WebSockets (Socket.IO) |
| Colas y tareas | BullMQ + Redis |
| Tareas programadas | `@nestjs/schedule` (limpieza por retención) |
| Correo | Nodemailer con configuración SMTP leída desde BD |
| Validación | class-validator / class-transformer |
| Documentación API | Swagger (OpenAPI) |

## 3. Estructura del repositorio

```
/
├── CLAUDE.md
├── docs/            # Context.md, Architecture.md, Design.md, etc.
├── mobile/          # App Expo
│   ├── app/         # Rutas (Expo Router)
│   │   ├── (auth)/
│   │   ├── (admin)/       # SUPERADMIN (CAE)
│   │   ├── (teacher)/     # DOCENTE
│   │   └── (student)/     # ESTUDIANTE
│   ├── src/
│   │   ├── components/
│   │   ├── features/      # una carpeta por funcionalidad
│   │   ├── api/           # cliente HTTP y hooks de TanStack Query
│   │   ├── i18n/          # es.json, en.json
│   │   └── store/
└── backend/         # API NestJS
    ├── src/
    │   ├── auth/
    │   ├── users/         # base común de usuarios
    │   ├── teachers/
    │   ├── students/
    │   ├── rooms/         # salones y ubicaciones
    │   ├── periods/       # periodos académicos (semestres)
    │   ├── modules/       # tutorías: módulos, horarios semanales y sesiones
    │   ├── holidays/      # calendario de festivos e importación desde Nager.Date
    │   ├── outbox/        # eventos de módulo para las notificaciones
    │   ├── enrollments/   # inscripciones
    │   ├── chat/
    │   ├── notifications/
    │   ├── pqrs/
    │   ├── dashboard/
    │   ├── settings/      # configuración, listas (dropdown-lists/) y SMTP
    │   ├── config-usage/  # ¿está en uso un salón, periodo o elemento de lista? (módulos y PQRS lo completan)
    │   └── mail/
    └── prisma/
```

## 4. Una sola app, tres roles

- Hay **una sola app**. Al iniciar sesión, según el rol, se redirige al grupo de rutas correspondiente.
- Roles: `SUPERADMIN`, `TEACHER`, `STUDENT`.
- El backend es la **fuente de verdad** de los permisos: cada endpoint usa un guard de roles. Ocultar pantallas en la app no es seguridad.

## 5. Modelo de datos (entidades principales)

| Entidad | Campos clave |
|---|---|
| `User` | id, email, passwordHash, role, status (ACTIVE / INACTIVE), deletedAt, mustChangePassword, locale |
| `TeacherProfile` | userId, nombres, datos de contacto |
| `StudentProfile` | userId, nombres, programa |
| `Location` | id, name (único entre no borrados), deletedAt |
| `Room` | id, locationId, name (único por ubicación), capacity (entero > 0), status (ACTIVE / INACTIVE), deletedAt |
| `AcademicPeriod` | id, name (ej. 2026-2, único entre no borrados), startsOn y endsOn (fechas de calendario), status (UPCOMING / ACTIVE / CLOSED), closedAt, closedBy (MANUAL / AUTOMATIC), deletedAt |
| `Module` | id, periodId, name, description, teacherId, roomId, deletedAt. Sin estado propio; el cupo se deriva de `Room.capacity` |
| `ModuleSchedule` | id, moduleId, periodId, teacherId, roomId (copias para las restricciones de cruce), dayOfWeek (1 a 7), startMinute, endMinute (minutos locales de Bogotá), deletedAt. Un módulo puede tener varios |
| `ModuleSession` | id, moduleId, scheduleId, teacherId, roomId (los de esa sesión), originalStartsAt, startsAt, endsAt, status (SCHEDULED / RESCHEDULED / CANCELLED), cancelReason (HOLIDAY / TEACHER), holidayId, deletedAt. Reprogramar cambia `startsAt` y `endsAt` y nunca `originalStartsAt` |

> **Calendario del docente (spec 013):** sin tablas nuevas. `GET /teacher/calendar?from&to` (rol TEACHER, máximo 7 días, días de Bogotá inclusivos) devuelve las sesiones del docente del token en el rango, pasadas y futuras y de cualquier estado, con la misma forma que `/teacher/sessions`, más `meta.period` (periodo Activo o, sin él, el Cerrado más reciente en solo lectura) y `meta.hours` (`MODULE_EARLIEST_TIME` y `MODULE_LATEST_TIME`). En la app, el calendario vive en `src/components/calendar/` (reutilizable) y la pantalla del docente lo alimenta desde `features/teacher-sessions/`.
| `Holiday` | id, date (fecha de calendario, única entre no borrados), name, source (MANUAL / IMPORTED), deletedAt |
| `OutboxEvent` | id, type (cambio de docente, de salón, festivos y, del docente, `SESSION_RESCHEDULED`, `SESSION_CANCELLED_TEACHER`, `SESSION_RESTORED_TEACHER`, y de una PQRS, `PQRS_IN_REVIEW`, `PQRS_RESPONDED`, `PQRS_RESOLVED`), moduleId o pqrsId (exactamente uno de los dos, con `CHECK`), payload (ids, fechas y alcance, nunca datos de estudiantes), createdAt, processedAt (eventos que las notificaciones envían después) |
| `Enrollment` | id, studentId, moduleId, status (ACTIVE / CANCELLED), cancelledAt, effectiveUntil (`cancelledAt` + `STUDENT_CANCEL_LEAD_MINUTES`: las sesiones que empiezan antes conservan al estudiante), createdAt, deletedAt. Una sola ACTIVE por estudiante y módulo (índice único parcial) |
| `SessionAbsence` | id, enrollmentId, sessionId, createdAt, deletedAt (el estudiante sigue inscrito pero no asiste a esa sesión; `deletedAt` marca que la reactivó). Una sola viva por inscripción y sesión |
| `Conversation` | id, type (DIRECT / MODULE), moduleId? (único: un chat por módulo, creado cuando alguien lo necesita), directKey? (`VarChar(73)`, los dos ids ordenados y unidos por `:`, único: una conversación por pareja), lastMessageAt, createdAt, updatedAt, deletedAt. `CHECK`: una DIRECT tiene `directKey` y no `moduleId`; una MODULE, al revés (spec 018) |
| `ConversationMember` | conversationId, userId (clave de los dos), lastReadAt (hasta cuándo leyó; de ahí salen los sin leer), createdAt. En un chat de módulo la fila se crea al leer o enviar; quién lo ve sale de las inscripciones |
| `Message` | id, conversationId, senderId, kind (TEXT / ANNOUNCEMENT), body (`VarChar(4000)`; el máximo que se aplica es `chat.messageMaxLength`, 2000), clientMessageId (único con conversación y remitente: un reintento devuelve el mismo mensaje), createdAt, deletedAt |
| `Notification` | id, userId, eventId (único con userId: un aviso por cambio y persona), type, moduleId o pqrsId (exactamente uno de los dos), locale, title, body (ya redactados en el idioma del destinatario), readAt, createdAt. Sin borrado: nada lo elimina y se conservan todos (spec 014) |
| `NotificationDelivery` | id (también es el id del trabajo de la cola), notificationId, channel (PUSH / EMAIL), status (PENDING / SENT / FAILED / SKIPPED), attempts, lastError (solo un código de causa), sentAt. Único por aviso y canal |
| `PushToken` | id, userId, sessionId, token (único: un dispositivo pertenece a un solo usuario), platform (ANDROID / IOS), deletedAt (cierre de sesión o dispositivo inválido) |
| `Pqrs` | id, authorId (docente o estudiante), typeId (elemento de `PQRS_TYPE`), subject (`VarChar(200)`), description (`VarChar(4000)`), status (FILED / IN_REVIEW / RESOLVED), clientRequestId (único con authorId: un reintento devuelve la misma PQRS), reviewedAt, resolvedAt, createdAt, updatedAt, deletedAt (spec 017). Los largos máximos que se aplican viven en configuración: `pqrs.subjectMaxLength` (120), `pqrs.descriptionMaxLength` (2000) y `pqrs.responseMaxLength` (2000) |
| `PqrsMessage` | id, pqrsId, authorId (el CAE), body (`VarChar(4000)`), createdAt, deletedAt: la respuesta del CAE dentro de una PQRS |
| `Setting` | configuración general |
| `DropdownList` | key único (ej. `PQRS_TYPE`), nameEs, nameEn; las crea el sistema, no la API |
| `DropdownItem` | listId, labelEs, labelEn, sortOrder, status (ACTIVE / INACTIVE), deletedAt |
| `SmtpConfig` | host, port, user, passwordEncrypted, from. Una sola fila; la gestiona el CAE desde la app (spec 014) |

Notas:
- Los borrados lógicos usan `deletedAt`; siempre se filtra por él en las consultas.
- Todas las fechas se guardan en **UTC**. La app las muestra en la zona horaria `America/Bogota`.

### Tutorías recurrentes por periodo

- Un módulo pertenece a un `AcademicPeriod` y define su horario en `ModuleSchedule` (día de la semana y hora local).
- Al crear el módulo, el backend **genera una `ModuleSession` por cada semana** del periodo (de `startsOn` a `endsOn`), convirtiendo la hora local de `America/Bogota` a UTC.
- La `Enrollment` es al **módulo**, no a cada sesión: el estudiante queda inscrito en todas las sesiones del periodo. Si no puede asistir a una, la cancela con una `SessionAbsence` y sigue inscrito en las demás.
- El **cupo se mide por sesión** (D-090): los asistentes de una sesión son los estudiantes activos con una inscripción ACTIVE (o cancelada cuyo `effectiveUntil` es posterior al inicio de la sesión) sin una ausencia viva en ella. Un módulo está lleno si alguna de sus sesiones futuras lo está.
- Cancelar o reprogramar una sesión modifica solo esa `ModuleSession` (guarda `originalStartsAt` para trazabilidad) y notifica a los inscritos. El docente elige si el cambio aplica solo a la sesión o a ella y a las futuras de su mismo horario semanal (D-069); reprogramar solo mueve dentro de la misma semana (D-094) y el docente puede reactivar lo que canceló (D-095).
- Si el CAE cambia salón o docente de un módulo, se aplica solo a las sesiones futuras: cada sesión guarda el docente y el salón con que se dicta, y las pasadas no cambian (D-086).
- Los cruces de docente, de salón y entre horarios del mismo módulo los impiden restricciones de exclusión sobre `ModuleSchedule` dentro del mismo periodo; un horario que termina cuando otro empieza no se solapa (D-085).
- Toda escritura de módulos, horarios o sesiones bloquea con `FOR SHARE` la fila del periodo y se rechaza si está `CLOSED`.
- **Festivos**: el CAE los administra en `Holiday` (global, no por periodo) y puede importarlos de Nager.Date; el servidor consulta el servicio con límite de 10 s y los guarda localmente, así generar sesiones nunca depende de él (D-083). La generación omite los festivos; al registrar uno, las sesiones futuras de esa fecha pasan a `CANCELLED` con motivo `HOLIDAY`, y al eliminarlo se restauran o se generan. No se tocan módulos de periodos `CLOSED` ni se admiten festivos con fecha anterior a hoy.
- Los cambios de docente, salón y festivo escriben un `OutboxEvent` en la misma transacción; la funcionalidad de notificaciones (spec 014) lo consume y avisa a los inscritos (D-087, D-098).
- Solo un periodo puede estar `ACTIVE` a la vez; el estudiante ve los módulos del periodo activo. La base de datos lo garantiza con un índice único parcial, y los periodos no se solapan por una restricción de exclusión sobre el rango de fechas (D-072).
- Todo periodo nace `UPCOMING`; el CAE lo activa a mano y, si ya hay uno activo, el servidor exige confirmar su cierre. El periodo activo se cierra a mano o solo al terminar su `endsOn` en `America/Bogota` (tarea programada cada 15 minutos más una comprobación en cada lectura). Un periodo `CLOSED` no se reabre (D-071).
- Al cerrar un periodo, sus módulos pasan a solo lectura.
- Solo se eliminan (lógico) periodos `UPCOMING` sin módulos (D-076).

## 6. Reglas críticas que se validan en el backend

| Regla | Cómo se garantiza |
|---|---|
| Cupo máximo = capacidad del salón | Cupo **por sesión** (D-090). Al inscribir: transacción que bloquea, en este orden, el periodo (`FOR SHARE`), la fila del estudiante y el módulo (`FOR UPDATE`) (D-092); se cuentan los asistentes de cada sesión futura y se compara con `Room.capacidad`. Índices únicos parciales respaldan una inscripción activa por estudiante y módulo. |
| Sin cruces de horario del estudiante | Antes de inscribir: compara los `ModuleSchedule` de sus módulos activos del mismo periodo (mismo día y horas que se solapen). |
| Sin cruces de salón ni docente | Al crear o mover un módulo: validación de disponibilidad sobre los horarios semanales. Al reprogramar o reactivar una sesión: sobre las sesiones reales, con bloqueos del periodo, el módulo, los salones y los docentes en ese orden (D-096). |
| Sin cruces con los estudiantes | Al reprogramar o reactivar una sesión se rechaza si algún inscrito asiste a otra sesión a esa hora; el error dice solo cuántos (D-093). |
| Cambio de salón | Solo si `nuevoSalón.capacidad >= inscritosActivos`. |
| Cancelación del estudiante | Una sesión se rechaza si falta menos de `STUDENT_CANCEL_LEAD_MINUTES` (1 hora) para `startsAt`. Cancelar el módulo aplica desde la primera sesión a más de esa ventana (`effectiveUntil`, D-091). |
| Cambio o cancelación del docente | Reprogramar, cancelar o reactivar se rechaza si falta menos de `TEACHER_CHANGE_LEAD_MINUTES` (2 horas) para `startsAt` de la primera sesión afectada. |
| Dominios de correo | Estudiantes: `@uts.edu.co`. Docentes y administrativos: `@correo.uts.edu.co`. |
| Reinscripción | Permitida si el módulo tiene cupo en todas sus sesiones futuras; crea otra inscripción y la cancelada queda en el historial. |

Los límites de horas y los dominios se leen de **configuración**, no se escriben fijos en el código.

## 7. Autenticación y seguridad

- **Estudiantes:** registro con correo `@uts.edu.co` y verificación por código o enlace.
- **Docentes:** los crea el CAE con clave temporal y `mustChangePassword = true`.
- Access token de vida corta y refresh token rotativo, guardados en `expo-secure-store`.
- Una cuenta desactivada o borrada no puede iniciar sesión ni refrescar tokens.
- La contraseña SMTP se guarda **cifrada** (AES-256-GCM) con una clave que vive en variables de entorno.
- Rate limiting en login, registro y recuperación de contraseña.
- Secretos y claves siempre en variables de entorno; nunca en el repositorio.

## 8. Chat en tiempo real

- **Las órdenes van por REST y la entrega por WebSocket** (spec 018, D-113): enviar, leer, listar y paginar son endpoints con los guards de siempre (`GET /chat/contacts`, `GET` y `POST /chat/conversations`, `GET /chat/conversations/:id`, `GET` y `POST /chat/conversations/:id/messages`, `POST /chat/conversations/:id/read` y `GET /chat/unread-count`); una conversación ajena responde `404 CHAT_NOT_FOUND`. El WebSocket (Socket.IO, espacio `/chat`, mismo puerto) solo entrega: ver `specs/018-chat/contracts/chat-socket.md`.
- **Autenticación del socket:** el token de acceso viaja en el saludo y se valida con la misma regla del guard HTTP (sesión viva y cuenta activa). El guard JWT global ignora los eventos que no son HTTP; el socket ya se autenticó al conectar.
- **A quién se emite:** nunca a una sala de conversación, solo a las salas `user:<id>` de quienes el servidor calcula en ese momento (cuenta activa y visibilidad). Un mensaje se guarda antes de emitirse; un reintento no se vuelve a emitir.
- **Permisos calculados, no copiados** (`chat-access.ts`): la pareja docente-estudiante, el solo lectura y los anuncios salen de las inscripciones, módulos, periodos y cuentas vivos; la ventana de visibilidad del chat de un módulo, de las inscripciones del estudiante.
- **Presencia y push:** `ChatPresence` guarda en memoria qué conversación tiene abierta cada dispositivo; si el destinatario no la tiene abierta se envía **push** (D-114). **Límite conocido:** la presencia en memoria sirve para una sola instancia del servidor; con varias haría falta el adaptador de Redis de Socket.IO.
- **Retención:** una tarea programada (`ChatRetentionTask`, a las 03:00 de `America/Bogota`) pone `deletedAt` en los mensajes de módulo con más de `chat.moduleRetentionMonths` (6 meses) y en los individuales con más de `chat.directRetentionMonths` (24 meses). Las claves de configuración del chat son `chat.messageMaxLength` (2000), `chat.directRetentionMonths`, `chat.moduleRetentionMonths` y `chat.pushBurstSeconds` (60).

## 9. Notificaciones

Un consumidor del registro de eventos (`OutboxEvent`, D-087) crea el aviso de cada estudiante inscrito y lo entrega por tres canales (spec 014):

1. **En la app:** una fila de `Notification`, ya redactada en el idioma del destinatario (`User.locale`) y con las fechas en `America/Bogota`. Es el canal que siempre funciona.
2. **Push:** vía Expo Push Service (que usa FCM y APNs), a todos los dispositivos vivos del destinatario (D-100).
3. **Correo:** vía SMTP. La configuración sale, en este orden, de la fila `SmtpConfig` que gestiona el CAE desde la app, de las variables `SMTP_*` o, si no hay ninguna, el envío queda pendiente sin perderse. Se lee en cada envío, así un cambio rige sin reiniciar.

**Del evento al aviso (D-098):**

- Un trabajo repetible de BullMQ sondea el registro cada `OUTBOX_POLL_SECONDS` (5 s). Cada evento se procesa **en su propia transacción** (`FOR UPDATE SKIP LOCKED`, en orden de creación): crea los avisos, una fila `NotificationDelivery` por aviso y canal, y marca el evento como procesado. Si el servicio cae a mitad, se repite el evento entero; el índice único `(eventId, userId)` evita duplicados.
- **Destinatarios**: solo estudiantes, resueltos al procesar con la misma regla del cupo por sesión (inscripción vigente, o cancelada cuya fecha efectiva aún no llega, sin ausencia en la sesión y con la cuenta activa). Un cambio de varias sesiones da **un solo aviso** que resume las fechas que le tocan a ese estudiante. El docente y el CAE no reciben avisos de esta funcionalidad; si se agregan, usarán plantillas aparte.
- **Plantillas**: un solo lugar para los textos de aviso, push y correo (`notifications/templates/{es,en}.ts` y `mail/templates/`), con funciones puras que se prueban sin base de datos.

**Entrega:**

- Después de confirmar la transacción se encola un trabajo por entrega con `jobId = deliveryId`, de modo que repetirlo no duplica el envío. Reintentos con espera exponencial (`NOTIFICATION_DELIVERY_ATTEMPTS` = 8 desde `NOTIFICATION_BACKOFF_SECONDS` = 15 s, unos 31 min); agotados, la entrega pasa a `FAILED` y queda un registro con el tipo de evento, el canal y una causa estable, sin correos, tokens ni claves.
- Un **barrido** cada `NOTIFICATION_SWEEP_SECONDS` (60 s) vuelve a encolar las entregas que siguen `PENDING`: cola caída tras la transacción, o correo esperando a que haya configuración. Así ninguna entrega se pierde.
- El estado de cada canal (`PENDING`, `SENT`, `FAILED`, `SKIPPED`) permite diagnosticar qué pasó. `SKIPPED`: sin dispositivos, dispositivo inválido, o correo de un dominio que no es el de estudiantes.
- Un fallo de un canal o de un destinatario no afecta a los demás: cada aviso y canal es su propio trabajo.

**Dispositivos y cierre de sesión:** `PUT /notifications/devices` es idempotente por token y mueve un dispositivo al usuario que lo registra. Al terminar una sesión (`SessionService.revoke`) se descartan los dispositivos de esa sesión en el servidor, aunque la app no lo pida. Un dispositivo que Expo informa como inválido (en el ticket o en los recibos, que se consultan 15 min después) se descarta y no se reintenta.

**Contador (D-099):** la app consulta `GET /notifications/unread-count` cada minuto con la app abierta, al volver a primer plano, al recibir un push y tras marcar leído. No hay WebSocket todavía; cuando exista el del chat, se reutiliza sin cambiar el contrato.

**Configuración del correo (CAE):** `GET` y `PUT /settings/smtp` y `POST /settings/smtp/test`, solo rol `SUPERADMIN`. La clave se cifra con AES-256-GCM y nunca se devuelve (solo `hasPassword`); si la clave de cifrado del servidor cambia, el estado es `NEEDS_RECONFIGURATION` y el correo queda pendiente hasta que el CAE la escriba de nuevo. La prueba responde con una causa estable (`AUTH_FAILED`, `CONNECTION_FAILED`, `TIMEOUT`, `SENDER_REJECTED`, `UNKNOWN`), nunca con el texto del servidor.

**Correo (spec 015):** todos los correos de la API (código de verificación, código de restablecimiento, aviso de módulo y prueba SMTP) salen por un solo armador, `MessageBuilder` (módulo `mail`), que los usan `MailProcessor`, `DeliveriesService` y `SmtpService.test` (D-103). Las plantillas (`mail/templates/`) devuelven un `MailContent` (asunto, idioma, insignia, título, tono y bloques) y `composeMail` produce de él el HTML con estilos en línea y el texto simple equivalente, con el logo `logo-uts.png` incrustado por `cid` (D-102). Cada tipo de aviso tiene su propia insignia, tono e introducción; el título y el cuerpo siguen saliendo de `notifications/templates` (D-104). El nombre de la institución, el correo de contacto y el pie legal salen de `MAIL_BRAND_NAME`, `MAIL_CONTACT_EMAIL` y `MAIL_FOOTER_TEXT`, y la vigencia de un código llega al correo en `MailJob.expiresAt` (D-105). El lenguaje visual y las reglas de accesibilidad están en `Design.md` (sección "Emails") y en D-106; las pruebas de contraste y de accesibilidad del marco viven en `layout.spec.ts`.

Eventos que notifican hoy: los diez tipos del registro (cambio de docente y de salón, festivo que cancela o restaura, sesión reprogramada, cancelada o reactivada por el docente y, desde la spec 017, PQRS en revisión, respondida y resuelta). Los anuncios del docente y los mensajes nuevos reutilizarán la bandeja, los dispositivos y la cola con plantillas propias.

**PQRS (spec 017, D-111 y D-112):** `POST /pqrs`, `GET /pqrs/mine` y `GET /pqrs/mine/:id` para docentes y estudiantes (una PQRS ajena es `404 PQRS_NOT_FOUND`); `GET /pqrs`, `GET /pqrs/:id`, `POST /pqrs/:id/review`, `/responses` y `/resolve` solo para `SUPERADMIN`; `GET /pqrs/limits` para cualquier rol con sesión. Cada acción del CAE bloquea la fila de la PQRS (`FOR UPDATE`), valida con `pqrs-transitions.ts` y guarda su evento de aviso en la misma transacción. El evento de una PQRS tiene `pqrsId` y no `moduleId`; el consumidor avisa solo al autor si su cuenta está activa, con el asunto y sin el texto de la respuesta. Radicar es idempotente por `clientRequestId`. `isDropdownItemInUse` cuenta las PQRS del tipo (también las de borrado lógico).

**Dashboards (spec 019, D-116):** sin tablas nuevas ni migración. Módulo `src/dashboard/` de solo lectura con cinco endpoints, cada uno con su `@Roles`: `GET /dashboard/admin/overview`, `/admin/changes` (paginado, `limit` de 1 a 50) y `/admin/rooms` para `SUPERADMIN`; `GET /dashboard/teacher` para `TEACHER` y `GET /dashboard/student` para `STUDENT`. Las cifras personales salen del usuario autenticado, nunca de un parámetro. Se reutilizan `ATTENDS_SESSION` y `sessionSeats` (quién asiste a cada sesión), `countActiveEnrollments`, `Clock` y `weekRangeBogota` (semana en `America/Bogota`). Los mensajes y avisos sin leer y las 3 PQRS propias no tienen endpoint nuevo: la app usa `GET /chat/unread-count`, `GET /notifications/unread-count` y `GET /pqrs/mine?limit=3`. El umbral de baja inscripción es la clave `dashboard.lowEnrollmentPercent` (30 por defecto) en `settings`. Contrato: `specs/019-dashboards/contracts/dashboard-api.yaml`.

**Gestión de cuentas (spec 016, D-108):** sin tablas nuevas. Solo rol `SUPERADMIN`; un administrativo, un eliminado o un estudiante sin verificar responden `404 ACCOUNT_NOT_FOUND`. Docentes: `GET /teachers` y `GET /teachers/:id` (con `email` y `modulesCount`), `PATCH /teachers/:id`, `POST /teachers/:id/deactivate`, `/reactivate` y `/temporary-password`, y `DELETE /teachers/:id`. Estudiantes: `GET /students`, `GET /students/:id`, `POST /students/:id/deactivate` y `/reactivate`, y `DELETE /students/:id`. Las acciones que no crean un recurso responden `200`; un dato inválido, `400 VALIDATION_FAILED`. La búsqueda usa la extensión `unaccent` de PostgreSQL (migración `enable_unaccent`) sobre nombre, apellido y correo, con el patrón escapado. El estado de la cuenta y el cierre de sus sesiones viven en `AccountStatusService` (`src/accounts/`).

**Baja de un estudiante (D-092, D-109):** una transacción que bloquea en este orden el periodo activo (`FOR SHARE`), la fila del estudiante (`FOR UPDATE`) y los módulos de sus inscripciones vigentes ordenados por `id` (`FOR UPDATE`); cancela esas inscripciones con `cancelledAt` y `effectiveUntil` iguales a la hora de la baja y cambia el estado, todo o nada. La inscripción toma los mismos bloqueos en el mismo orden y, tras bloquear al estudiante, rechaza con `401 ACCOUNT_DISABLED` a quien se desactivó mientras tanto. Después de confirmar se cierran las sesiones. `DeliveriesService` omite (`SKIPPED`, `ACCOUNT_UNAVAILABLE`) la entrega de correo o push de una cuenta desactivada o eliminada.

## 10. Internacionalización (es / en)

- La app usa i18next y toma el idioma del dispositivo; si no es español ni inglés, usa español.
- Las plantillas de correo y push se generan en el idioma guardado en `User.locale`.
- Las listas desplegables administrables guardan sus etiquetas en ambos idiomas.

## 11. Estrategia de demo en iOS

El límite no es React Native: **compilar y ejecutar apps de iOS requiere macOS + Xcode**. Android Studio no puede correr iOS. Alternativas, de más simple a más completa:

1. **iPhone físico + Expo Go:** se escanea un QR. No necesita Mac ni cuenta de pago. Sirve para casi toda la demo.
2. **Build de simulador en la nube con EAS + Appetize.io:** se genera el build iOS en la nube y se ejecuta en un iPhone simulado desde el navegador.
3. **Mac en la nube** (MacinCloud o similar) o un Mac prestado, con Xcode y simulador.
4. **TestFlight:** instalación en iPhones reales. Requiere cuenta Apple Developer de pago.

Para Android, se usa el emulador de Android Studio sin ningún inconveniente.

## 12. Entornos y despliegue

- **Desarrollo:** `docker-compose` con PostgreSQL y Redis; API local.
- **Producción:** por definir (VPS, contenedor en la nube o servicio gestionado).
- **Builds de la app:** EAS Build.

## 13. Decisiones pendientes

- [ ] Alcance de los cambios del docente: ¿una sola sesión o las semanas restantes? (supuesto actual: una sola sesión)
- [ ] Alcance de la cancelación del estudiante: ¿módulo completo o una sesión? (supuesto actual: inscripción al módulo)
- [ ] ¿Se valida el cruce con los horarios de los estudiantes al reprogramar una sesión?
- [x] ¿Festivos o semanas sin tutoría dentro del periodo? **Resuelto (D-083): calendario de festivos del CAE con importación opcional.**
- [ ] ¿Dónde se desplegará el backend?
- [ ] ¿Se cuenta con Mac, iPhone físico o cuenta Apple Developer para la demo?
- [ ] ¿Qué proveedor de SMTP usa la institución?
