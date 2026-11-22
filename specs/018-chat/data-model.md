# Data Model: Chat y anuncios

Una migración en `tutorias_uts_db` con tres tablas nuevas y dos enums. Los nombres siguen la tabla de `Architecture.md` (`Conversation`, `ConversationMember`, `Message`) con los campos que la spec exige.

## Enums nuevos

| Enum | Valores |
|---|---|
| `ConversationType` | `DIRECT`, `MODULE` |
| `MessageKind` | `TEXT`, `ANNOUNCEMENT` |

## Conversation (nueva, tabla `conversations`)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | clave |
| `type` | `ConversationType` | |
| `moduleId` | uuid → `Module`, nulo | obligatorio si `MODULE`, nulo si `DIRECT`; único (un chat por módulo) |
| `directKey` | `VarChar(73)`, nulo | obligatorio si `DIRECT`: los dos ids de usuario ordenados y unidos por `:`; único (una conversación por pareja) |
| `lastMessageAt` | timestamptz, nulo | fecha del último mensaje; se actualiza en la misma transacción que el mensaje |
| `createdAt`, `updatedAt` | timestamptz | UTC |
| `deletedAt` | timestamptz, nulo | borrado lógico; ninguna ruta de esta spec lo escribe |

Restricción: `CHECK ((type = 'DIRECT' AND direct_key IS NOT NULL AND module_id IS NULL) OR (type = 'MODULE' AND module_id IS NOT NULL AND direct_key IS NULL))`.

Índices: único `(module_id)`, único `(direct_key)`, `(last_message_at DESC)`.

## ConversationMember (nueva, tabla `conversation_members`)

| Campo | Tipo | Regla |
|---|---|---|
| `conversationId` | uuid → `Conversation` | parte de la clave |
| `userId` | uuid → `User` | parte de la clave |
| `lastReadAt` | timestamptz, nulo | hasta cuándo leyó; nulo = no ha leído nada |
| `createdAt` | timestamptz | UTC |

Clave `(conversation_id, user_id)`; índice `(user_id)`. En una conversación individual las dos filas se crean con la conversación. En una de módulo, la fila de cada usuario se crea la primera vez que lee o envía (no se copia la lista de inscritos: quién ve el chat sale de las inscripciones).

## Message (nueva, tabla `messages`)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | clave |
| `conversationId` | uuid → `Conversation` | |
| `senderId` | uuid → `User` | |
| `kind` | `MessageKind` | por defecto `TEXT`; `ANNOUNCEMENT` solo en un chat de módulo y solo del docente del módulo |
| `body` | `VarChar(4000)` | obligatorio, sin espacios sobrantes; el máximo que se aplica es `chat.messageMaxLength` |
| `clientMessageId` | uuid | lo genera la app por mensaje |
| `createdAt` | timestamptz | UTC |
| `deletedAt` | timestamptz, nulo | borrado lógico; lo escribe la tarea de retención |

Índices: único `(conversation_id, sender_id, client_message_id)`; `(conversation_id, created_at DESC, id DESC)`.

## Quién ve qué y quién escribe

Los permisos se calculan en `chat-access.ts` a partir de filas vivas (detalle y razones en `research.md`, R-5 y R-6).

| Conversación | Ve | Escribe |
|---|---|---|
| `DIRECT` CAE y docente | los dos | los dos mientras las dos cuentas estén activas |
| `DIRECT` docente y estudiante | los dos, siempre | los dos mientras el estudiante tenga una inscripción `ACTIVE` en un módulo vivo del docente con periodo no cerrado; si no, solo lectura (`NO_SHARED_MODULE`) |
| `MODULE` | el docente del módulo (todo) y cada estudiante con una inscripción `ACTIVE` al módulo, solo los mensajes de los periodos en que estuvo inscrito (desde `enrollment.createdAt` y, en una inscripción cancelada, hasta `effectiveUntil`); quien se dio de baja deja de ver el chat (`404`) | el docente y los estudiantes con inscripción `ACTIVE`, con periodo no cerrado (si está cerrado, solo lectura `PERIOD_CLOSED`); anuncios solo el docente del módulo |

La cuenta de la otra persona desactivada o eliminada deja la conversación individual en solo lectura (`PARTNER_UNAVAILABLE`).

## Sin leer

Para un usuario y una conversación: mensajes vivos, enviados por otra persona, visibles para él y con `created_at` posterior a su `last_read_at` (todos los visibles si es nulo). El total de la pestaña es la suma de todas sus conversaciones.

## Retención

| Tipo de conversación | Plazo (configuración) | Valor por defecto |
|---|---|---|
| `MODULE` (mensajes y anuncios) | `chat.moduleRetentionMonths` | 6 meses |
| `DIRECT` | `chat.directRetentionMonths` | 24 meses |

La tarea pone `deleted_at` en los mensajes que superan el plazo de su tipo. Una conversación individual sin mensajes vivos no se lista; la de un módulo se lista siempre que el usuario tenga acceso.
