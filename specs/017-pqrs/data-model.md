# Data Model: PQRS: radicación y gestión

Una migración en `tutorias_uts_db` con dos tablas nuevas, un enum nuevo, tres valores nuevos de `OutboxEventType` y un cambio en `outbox_events` y `notifications`.

## Enum nuevo

| Enum | Valores |
|---|---|
| `PqrsStatus` | `FILED` (Radicada), `IN_REVIEW` (En revisión), `RESOLVED` (Resuelta) |

`OutboxEventType` suma `PQRS_IN_REVIEW`, `PQRS_RESPONDED` y `PQRS_RESOLVED`.

## Pqrs (nueva, tabla `pqrs`)

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | clave |
| `authorId` | uuid → `User` | solo `TEACHER` o `STUDENT`; lo valida el servicio, no la base |
| `typeId` | uuid → `DropdownItem` | del listado `PQRS_TYPE`, activo y sin borrar al radicar |
| `subject` | `VarChar(200)` | obligatorio, sin espacios sobrantes; largo máximo por `pqrs.subjectMaxLength` |
| `description` | `VarChar(4000)` | obligatorio; largo máximo por `pqrs.descriptionMaxLength` |
| `status` | `PqrsStatus` | por defecto `FILED` |
| `clientRequestId` | uuid | clave de idempotencia del intento de radicar |
| `reviewedAt` | timestamptz, nulo | hora en que pasó a `IN_REVIEW` |
| `resolvedAt` | timestamptz, nulo | hora en que pasó a `RESOLVED` |
| `createdAt`, `updatedAt` | timestamptz | UTC |
| `deletedAt` | timestamptz, nulo | borrado lógico; ninguna ruta de esta spec lo escribe |

Índices: único `(authorId, clientRequestId)`; `(status, createdAt DESC)`; `(authorId, createdAt DESC)`; `(typeId)`.

## PqrsMessage (nueva, tabla `pqrs_messages`)

Respuesta del CAE dentro de una PQRS.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | uuid | clave |
| `pqrsId` | uuid → `Pqrs` | |
| `authorId` | uuid → `User` | el CAE que respondió |
| `body` | `VarChar(4000)` | obligatorio; largo máximo por `pqrs.responseMaxLength` |
| `createdAt` | timestamptz | UTC |
| `deletedAt` | timestamptz, nulo | borrado lógico |

Índice `(pqrsId, createdAt)`.

## Cambios en tablas existentes

| Tabla | Cambio |
|---|---|
| `outbox_events` | `module_id` pasa a opcional; se suma `pqrs_id` opcional → `pqrs`; `CHECK (num_nonnulls(module_id, pqrs_id) = 1)` |
| `notifications` | igual: `module_id` opcional, `pqrs_id` opcional → `pqrs`, mismo `CHECK` |

Los registros actuales tienen `module_id`, así que la restricción se cumple sin migrar datos.

## Transiciones

```text
FILED --(CAE: pasar a revisión)--> IN_REVIEW --(CAE: resolver, con ≥ 1 respuesta)--> RESOLVED
```

| Acción | Estado requerido | Efecto | Aviso |
|---|---|---|---|
| Radicar | (nueva) | crea en `FILED` | ninguno |
| Pasar a revisión | `FILED` | `IN_REVIEW`, `reviewedAt` | `PQRS_IN_REVIEW` |
| Responder | `IN_REVIEW` | crea `PqrsMessage` | `PQRS_RESPONDED` |
| Resolver | `IN_REVIEW` con ≥ 1 respuesta | `RESOLVED`, `resolvedAt` | `PQRS_RESOLVED` |

Cualquier otra combinación responde `409` (ver contrato). `RESOLVED` es final.

## Quién ve qué

| Rol | Lista | Detalle |
|---|---|---|
| `STUDENT`, `TEACHER` | solo `authorId` = quien consulta | solo la propia; otra responde `404 PQRS_NOT_FOUND` |
| `SUPERADMIN` | todas, con filtros | cualquiera, con nombre y correo del autor |

## Elemento de `PQRS_TYPE` (sin cambios de estructura)

`isDropdownItemInUse` pasa a contar filas de `pqrs` con ese `typeId` (incluidas las de borrado lógico). Una PQRS conserva su tipo aunque el elemento se desactive.
