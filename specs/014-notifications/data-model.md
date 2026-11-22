# Data Model: Notificaciones de cambios en los módulos

Migración única en `tutorias_uts_db` (`<timestamp>_add_notifications`). Nada de las tablas existentes cambia: `OutboxEvent`, `SmtpConfig`, `User`, `Enrollment` y `SessionAbsence` se leen tal como están. Convenciones: UUID, `created_at`/`updated_at` en `timestamptz` (UTC), nombres en `snake_case` con `@@map`.

## Enums nuevos

| Enum | Valores |
|---|---|
| `NotificationChannel` | `PUSH`, `EMAIL` |
| `DeliveryStatus` | `PENDING`, `SENT`, `FAILED`, `SKIPPED` |
| `DevicePlatform` | `ANDROID`, `IOS` |

## Notification (`notifications`)

Aviso dirigido a un usuario. Registro sin borrado (nada lo elimina); la retención la fijará otra spec.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `userId` | UUID → `users` | destinatario |
| `eventId` | UUID → `outbox_events` | evento que lo originó |
| `type` | `OutboxEventType` | mismo tipo del evento (las plantillas lo usan) |
| `moduleId` | UUID → `modules` | módulo al que se refiere; el toque abre este módulo |
| `locale` | `Locale` | idioma en que se redactó |
| `title` | `VarChar(160)` | ya redactado |
| `body` | `VarChar(1000)` | ya redactado |
| `readAt` | `timestamptz?` | vacío si no se leyó (FR-011) |
| `createdAt`, `updatedAt` | `timestamptz` | |

- **Único**: `(eventId, userId)`: un aviso por evento y persona (SC-003, idempotencia de R-1).
- **Índices**: `(userId, createdAt DESC, id DESC)` para la bandeja; parcial `(userId) WHERE read_at IS NULL` (en el SQL de la migración) para el contador.
- **Transición**: `readAt` pasa de vacío a fecha una sola vez; marcar leído de nuevo no cambia la fecha.

## NotificationDelivery (`notification_deliveries`)

Estado de un aviso en un canal (FR-023). Una fila por aviso y canal, creada en la misma transacción que el aviso.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | también es el `jobId` de BullMQ |
| `notificationId` | UUID → `notifications` | |
| `channel` | `NotificationChannel` | |
| `status` | `DeliveryStatus` | `PENDING` al crearse |
| `attempts` | `Int` (0) | intentos hechos |
| `lastError` | `VarChar(60)?` | código de la causa (`SMTP_NOT_CONFIGURED`, `PUSH_DEVICE_NOT_REGISTERED`, `SMTP_AUTH_FAILED`…), nunca texto libre ni datos personales |
| `sentAt` | `timestamptz?` | |
| `createdAt`, `updatedAt` | `timestamptz` | |

- **Único**: `(notificationId, channel)`.
- **Índice**: `(status, updatedAt)` para el barrido de pendientes.
- **Transiciones**: `PENDING → SENT | FAILED | SKIPPED`. `PENDING` puede quedar así con `lastError = SMTP_NOT_CONFIGURED` hasta que haya configuración. `SENT`, `FAILED` y `SKIPPED` son finales.
- **`SKIPPED`**: sin dispositivos vivos (push), correo vacío o de un dominio no válido (correo).

## PushToken (`push_tokens`)

Dispositivo con permiso de push (FR-014 a FR-016). Ya figuraba en `Architecture.md` §5; se completan sus campos.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | |
| `userId` | UUID → `users` | un dispositivo pertenece a un solo usuario |
| `sessionId` | UUID → `sessions` | sesión con la que se registró; al cerrarla, el dispositivo se descarta |
| `token` | `VarChar(200)` | `ExponentPushToken[...]`; **único** en toda la tabla |
| `platform` | `DevicePlatform` | |
| `createdAt`, `updatedAt` | `timestamptz` | |
| `deletedAt` | `timestamptz?` | cierre de sesión o token inválido |

- **Registro**: `PUT` hace `upsert` por `token`: si existe (de otro usuario o borrado) se reasigna a quien lo registra, con su `sessionId`, y `deletedAt = null`.
- **Índice**: `(userId) WHERE deleted_at IS NULL`.
- Se consideran vivos los dispositivos con `deletedAt = NULL` cuya sesión no esté revocada.

## Configuración del correo (existente, `smtp_configs`)

Sin cambios de esquema. Una sola fila gestionada por el CAE; `passwordEncrypted` es AES-256-GCM con `SMTP_ENCRYPTION_KEY`. Estado derivado en tiempo de lectura (no se guarda):

| Estado | Condición |
|---|---|
| `NOT_CONFIGURED` | no hay fila y faltan las variables `SMTP_*` |
| `CONFIGURED` | hay fila que se descifra, o variables `SMTP_*` completas |
| `NEEDS_RECONFIGURATION` | hay fila pero la clave no se descifra |

`usingEnvironment` es verdadero cuando no hay fila y se usan las variables.

## Evento de cambio (existente, `outbox_events`)

Sin cambios. `processed_at` lo fija el consumidor en la transacción de R-1. Cargas esperadas por tipo (las escriben las specs 010 y 012):

| Tipo | Payload |
|---|---|
| `MODULE_TEACHER_CHANGED` | `{ fromTeacherId, toTeacherId, enrolled }` |
| `MODULE_ROOM_CHANGED` | `{ fromRoomId, toRoomId, enrolled }` |
| `SESSIONS_CANCELLED_HOLIDAY` | `{ date, sessions }` |
| `SESSIONS_RESTORED_HOLIDAY` | `{ date, restored, generated }` |
| `SESSION_RESCHEDULED` | `{ scope, sessions: [{ sessionId, from, to }] }` |
| `SESSION_CANCELLED_TEACHER` | `{ scope, sessions: [{ sessionId, from }] }` |
| `SESSION_RESTORED_TEACHER` | `{ scope, sessions: [{ sessionId, to }] }` |

## Relaciones

```text
OutboxEvent 1 ──< Notification >── 1 User
                      │ 1
                      └──< NotificationDelivery (PUSH | EMAIL)
User 1 ──< PushToken >── 1 Session
Notification >── 1 Module
```

## Reglas de validación

- `title` y `body` los produce la plantilla; ninguna entrada de usuario los escribe.
- `token`: cadena con forma `ExponentPushToken[...]` o `ExpoPushToken[...]`, hasta 200 caracteres; `platform` ∈ {`ANDROID`, `IOS`}.
- Configuración del correo: `host` y `user` no vacíos (hasta 255), `port` entero de 1 a 65535, `from` correo válido, `password` obligatoria al crear y opcional al editar.
