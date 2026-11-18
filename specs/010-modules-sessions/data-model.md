# Data Model: Módulos y sesiones (CAE)

Convenciones de `docs/Conventions.md` §4: modelos `PascalCase` singular, tablas `snake_case` plural con `@@map`, columnas `snake_case` con `@map`; todas con `id` (UUID), `createdAt`, `updatedAt` y, las que se pueden borrar, `deletedAt`. Toda consulta filtra `deletedAt: null`. Las migraciones aplicadas nunca se editan. Los índices parciales, los `CHECK` y las restricciones de exclusión se escriben en el SQL de la migración (Prisma no los modela). Las fechas-hora van en UTC (`TIMESTAMPTZ`).

## Module (`modules`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| periodId | uuid | FK a `academic_periods`. Obligatorio; no cambia después de crear |
| name | texto | Obligatorio, recortado, 1 a 120 caracteres |
| description | texto, nulo | Hasta 1000 caracteres |
| teacherId | uuid | FK a `users` (rol `TEACHER`, `ACTIVE`, no borrado al asignar) |
| roomId | uuid | FK a `rooms` (`ACTIVE`, no borrado al asignar) |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | Solo sin inscritos activos |

- **Cupo**: no se guarda; es `rooms.capacity` del `roomId` actual (FR-008).
- **Sin estado propio**: vigente mientras `deletedAt` sea nulo; "solo lectura" se deriva del periodo `CLOSED` (R-11).
- Índices: `(period_id)` y `(teacher_id)` y `(room_id)` para los filtros del listado.

## ModuleSchedule (`module_schedules`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| moduleId | uuid | FK a `modules` |
| periodId | uuid | Copia de `modules.period_id` (para la exclusión) |
| teacherId | uuid | Copia de `modules.teacher_id` (para la exclusión) |
| roomId | uuid | Copia de `modules.room_id` (para la exclusión) |
| dayOfWeek | smallint | 1 (lunes) a 7 (domingo); `CHECK` |
| startMinute | smallint | Minutos desde la medianoche de Bogotá; `CHECK` `0 <= start_minute < end_minute` |
| endMinute | smallint | `CHECK` `end_minute <= 1439` (la API no admite 24:00, R-3) |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | Al reemplazar horarios o eliminar el módulo |

Restricciones en la base de datos (solo filas con `deleted_at IS NULL`), con rango semiabierto `int4range(start_minute, end_minute, '[)')`:
- `module_schedules_teacher_no_overlap`: `EXCLUDE USING gist (teacher_id WITH =, period_id WITH =, day_of_week WITH =, <rango> WITH &&)`.
- `module_schedules_room_no_overlap`: igual con `room_id`.
- `module_schedules_self_no_overlap`: igual con `module_id` (sin `period_id`).

Las tres columnas copiadas se actualizan en la misma transacción que `modules` (R-1).

## ModuleSession (`module_sessions`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| moduleId | uuid | FK a `modules` |
| scheduleId | uuid | FK a `module_schedules` (el horario que la originó; puede estar eliminado si fue reemplazado) |
| teacherId | uuid | Docente con que se dicta; se actualiza solo en sesiones futuras |
| roomId | uuid | Salón con que se dicta; se actualiza solo en sesiones futuras |
| originalStartsAt | fecha-hora UTC | Inicio generado; no cambia (trazabilidad para reprogramaciones) |
| startsAt | fecha-hora UTC | Igual a `originalStartsAt` al crear; la spec 012 puede cambiarla |
| endsAt | fecha-hora UTC | `> startsAt` (`CHECK`) |
| status | enum `SessionStatus` | `SCHEDULED` (por defecto), `RESCHEDULED`, `CANCELLED` |
| cancelReason | enum, nulo | `HOLIDAY` por ahora; obligatorio si `status = 'CANCELLED'` (`CHECK`) |
| holidayId | uuid, nulo | FK a `holidays`; solo si `cancelReason = 'HOLIDAY'` |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | Al reemplazar horarios (solo futuras) o eliminar el módulo |

- Índice único parcial `(schedule_id, original_starts_at) WHERE deleted_at IS NULL`: la generación es idempotente (R-4).
- Índices: `(module_id, starts_at)` para el detalle y `(starts_at)` para las consultas de sesiones futuras.

### Transiciones de estado (esta funcionalidad)

```text
(generar) ──▶ SCHEDULED ──registrar festivo en esa fecha──▶ CANCELLED (cancelReason = HOLIDAY, holidayId)
                  ▲                                              │
                  └────────eliminar el festivo (sin cruces)──────┘
RESCHEDULED y las demás cancelaciones las introduce la spec 012. Las sesiones pasadas no cambian de estado aquí.
```

## Holiday (`holidays`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| date | fecha (`DATE`) | Fecha de calendario de Bogotá. Único entre no borrados (índice parcial) |
| name | texto | Obligatorio, recortado, 1 a 120 caracteres |
| source | enum `HolidaySource` | `MANUAL` (por defecto) o `IMPORTED` |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | Solo si `date` es hoy o futura |

- Global: no pertenece a un periodo. Se aplica a cualquier módulo cuyo periodo contenga la fecha y no esté `CLOSED`: los festivos no cancelan, restauran ni generan sesiones de módulos de periodos Cerrados.
- Un festivo no se crea, edita ni elimina con fecha anterior a hoy en Bogotá (`HOLIDAY_IN_PAST`).
- Editar permite cambiar el nombre y la fecha de un festivo futuro; cambiar la fecha equivale a quitar el festivo anterior y registrar el nuevo (misma transacción, mismos efectos sobre las sesiones).

## OutboxEvent (`outbox_events`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| type | enum `OutboxEventType` | `MODULE_TEACHER_CHANGED`, `MODULE_ROOM_CHANGED`, `SESSIONS_CANCELLED_HOLIDAY`, `SESSIONS_RESTORED_HOLIDAY` |
| moduleId | uuid | FK a `modules` |
| payload | JSON | Datos mínimos: docente o salón anterior y nuevo, o fecha del festivo y cantidad de sesiones; sin datos personales de los inscritos |
| createdAt | fecha-hora | |
| processedAt | fecha-hora, nulo | Lo fija la spec 013 al notificar |

Se escribe en la misma transacción que el cambio (R-10). No se borra (no tiene `deletedAt`: es un registro de eventos).

## Entidades existentes que se usan

- `AcademicPeriod` (spec 006): `startsOn` y `endsOn` acotan las sesiones; `status = 'CLOSED'` bloquea toda escritura.
- `Room` (spec 006): `capacity` define el cupo; `status = 'ACTIVE'` y no borrado para asignarse.
- `User` con `TeacherProfile` (spec 001): `role = 'TEACHER'`, `status = 'ACTIVE'` y `deletedAt` nulo para asignarse; el nombre sale del perfil.
- `Enrollment` (spec 011, aún no existe): los inscritos se cuentan mediante `ConfigUsageService.countActiveEnrollments`, hoy en cero.

## Cambios en servicios existentes

- `ConfigUsageService.countModulesInPeriod(periodId)`: módulos no borrados del periodo.
- `ConfigUsageService.getRoomUsage(roomId)`: módulos en el periodo activo y en periodos Próximos reales; `maxEnrolled` sigue en cero hasta la spec 011.
- `ConfigUsageService.countActiveEnrollments(moduleId)`: nuevo, devuelve 0.
- Las reglas de la spec 006 (`PERIOD_HAS_MODULES`, `ROOM_IN_ACTIVE_PERIOD`, `ROOM_CAPACITY_BELOW_ENROLLED`) ya llaman a estos métodos y empiezan a bloquear sin cambiar sus servicios (FR-018).

## Códigos de error nuevos (`code` estable)

| Code | HTTP | Cuándo |
|---|---|---|
| `MODULE_SCHEDULE_OUT_OF_HOURS` | 422 | Un horario empieza antes de `MODULE_EARLIEST_TIME` (06:00) o termina después de `MODULE_LATEST_TIME` (18:00); `details`: `earliest` y `latest` |
| `MODULE_SCHEDULE_INVALID` | 422 | Hora de fin no posterior al inicio, día fuera de 1 a 7, horas fuera de rango o sin horarios |
| `MODULE_SCHEDULE_SELF_OVERLAP` | 409 | Dos horarios del mismo módulo se solapan |
| `MODULE_TEACHER_CONFLICT` | 409 | El docente tiene otro módulo solapado; `details` trae módulo, día y horas |
| `MODULE_ROOM_CONFLICT` | 409 | El salón tiene otro módulo solapado; `details` trae módulo, día y horas |
| `MODULE_TEACHER_UNAVAILABLE` | 409 | Docente desactivado, eliminado o sin rol docente |
| `MODULE_ROOM_UNAVAILABLE` | 409 | Salón inactivo o eliminado |
| `MODULE_ROOM_CAPACITY_BELOW_ENROLLED` | 409 | Capacidad del nuevo salón menor que los inscritos; `details` trae `capacity` y `enrolled` |
| `MODULE_HAS_ENROLLMENTS` | 409 | Cambio de horarios o eliminación con inscritos activos; `details` trae `enrolled` |
| `HOLIDAY_DATE_TAKEN` | 409 | Ya existe un festivo en esa fecha |
| `HOLIDAY_IN_PAST` | 409 | Se intenta registrar, editar o eliminar un festivo pasado (el alta en fecha pasada se rechaza igual) |
| `HOLIDAYS_IMPORT_UNAVAILABLE` | 502 | El servicio externo falló, tardó más del límite o respondió algo inválido |

Se reutilizan `PERIOD_CLOSED_READ_ONLY`, `NOT_FOUND`, `VALIDATION_FAILED` y `FORBIDDEN_ROLE`.
