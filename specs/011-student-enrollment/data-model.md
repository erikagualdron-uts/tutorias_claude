# Data Model: Inscripción de estudiantes a módulos

Convenciones de `docs/Conventions.md` §4: modelos `PascalCase` singular, tablas `snake_case` plural con `@@map`, columnas `snake_case` con `@map`; todas con `id` (UUID), `createdAt`, `updatedAt` y `deletedAt`. Todas las fechas son `timestamptz` en UTC. Las restricciones que Prisma no modela (índices únicos parciales y `CHECK`) se escriben a mano en la migración y se verifica con `prisma migrate diff` que no proponga eliminarlas, como en las specs 006 y 010.

## Enum EnrollmentStatus

`ACTIVE` | `CANCELLED`.

## Enrollment (`enrollments`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| studentId | uuid | FK a `users` (rol `STUDENT`). Se toma del token, nunca del cuerpo |
| moduleId | uuid | FK a `modules` |
| status | `EnrollmentStatus` | `ACTIVE` al crear |
| cancelledAt | fecha-hora, nulo | Momento en que el estudiante canceló el módulo |
| effectiveUntil | fecha-hora, nulo | `cancelledAt` + `STUDENT_CANCEL_LEAD_MINUTES`. Las sesiones que empiezan antes conservan al estudiante (R-4) |
| createdAt, updatedAt | fecha-hora | `createdAt` es la fecha de inscripción |
| deletedAt | fecha-hora, nulo | No lo usa ninguna acción de esta spec (reservado al borrado lógico de datos) |

Restricciones en la base de datos:
- `enrollments_one_active`: índice único parcial `(student_id, module_id) WHERE status = 'ACTIVE' AND deleted_at IS NULL`. Un estudiante tiene como máximo una inscripción activa por módulo y varias canceladas en su historial.
- `enrollments_status_dates`: `CHECK ((status = 'ACTIVE' AND cancelled_at IS NULL AND effective_until IS NULL) OR (status = 'CANCELLED' AND cancelled_at IS NOT NULL AND effective_until IS NOT NULL AND effective_until >= cancelled_at))`.
- Índices: `(module_id, status)` para contar inscritos y asistentes; `(student_id, status)` para "mis tutorías" y los cruces.

Transiciones: `ACTIVE` → `CANCELLED` (cancelar el módulo, irreversible). Volver a inscribirse crea **otra** fila `ACTIVE`; la cancelada queda en el historial.

## SessionAbsence (`session_absences`)

La "cancelación de sesión" de la spec: el estudiante sigue inscrito pero no asiste a esa sesión.

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| enrollmentId | uuid | FK a `enrollments` |
| sessionId | uuid | FK a `module_sessions`; debe ser del mismo módulo que la inscripción (lo valida el servicio) |
| createdAt, updatedAt | fecha-hora | `createdAt` es el momento de la cancelación |
| deletedAt | fecha-hora, nulo | Marca la reactivación de la sesión (borrado lógico) |

Restricciones:
- `session_absences_one_live`: índice único parcial `(enrollment_id, session_id) WHERE deleted_at IS NULL`.
- Índice `(session_id)` para contar asistentes de una sesión.

## Relaciones con las entidades existentes

- `User` (estudiante) 1 — N `Enrollment`. `Module` 1 — N `Enrollment`. `Enrollment` 1 — N `SessionAbsence`. `ModuleSession` 1 — N `SessionAbsence`.
- Se añaden las relaciones inversas en `User`, `Module` y `ModuleSession`; sin cambios de columnas en las tablas de la spec 010.
- **Cupo**: no se guarda. Es `rooms.capacity` del `room_id` de la sesión (R-1). Los **asistentes** de una sesión se calculan (ver abajo).

## Cálculos (no son tablas)

**Asistentes de una sesión futura** (R-1): estudiantes distintos con una inscripción del módulo que cumple todo esto:
- no está borrada y el estudiante está `ACTIVE` y sin borrar (R-7);
- `status = 'ACTIVE'`, o `status = 'CANCELLED'` y `session.starts_at < effective_until`;
- no tiene una ausencia viva (`deleted_at IS NULL`) para esa sesión.

**Lugares libres de una sesión** = capacidad de su salón − asistentes. **Cupos disponibles de un módulo** = mínimo de los lugares libres de sus sesiones futuras con estado `SCHEDULED` o `RESCHEDULED` (0 si alguna está llena). **Inscritos activos de un módulo** = inscripciones `ACTIVE` de estudiantes activos (es lo que usa la spec 010 en `countActiveEnrollments`).

**Puede inscribirse** = periodo `ACTIVE`, módulo no borrado, docente y salón disponibles, al menos una sesión futura, cupos disponibles ≥ 1, sin inscripción activa al módulo y sin cruce con sus otras inscripciones activas del periodo.

**Puede cancelar una sesión** = inscripción `ACTIVE`, periodo no `CLOSED`, sesión futura `SCHEDULED` o `RESCHEDULED` y `starts_at − ahora ≥ STUDENT_CANCEL_LEAD_MINUTES`. **Puede reactivarla** = lo mismo, con una ausencia viva y un lugar libre en esa sesión.

## Validaciones y errores

| Código | HTTP | Cuándo |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Cuerpo o parámetros mal formados o con campos desconocidos |
| `ENROLLMENT_MODULE_FULL` | 409 | Alguna sesión futura no tiene lugar; `details`: `availableSeats` (0) y `capacity` |
| `ENROLLMENT_SCHEDULE_CONFLICT` | 409 | El horario se cruza con otra inscripción activa del periodo; `details.conflict`: `moduleName`, `dayOfWeek`, `startTime`, `endTime` |
| `ENROLLMENT_ALREADY_ACTIVE` | 409 | Ya tiene una inscripción activa a ese módulo |
| `ENROLLMENT_MODULE_UNAVAILABLE` | 409 | Docente o salón no disponibles, o sin sesiones futuras |
| `ENROLLMENT_PERIOD_NOT_OPEN` | 409 | El periodo del módulo es Próximo |
| `PERIOD_CLOSED_READ_ONLY` | 409 | El periodo del módulo es Cerrado (solo lectura) |
| `ENROLLMENT_NOT_ACTIVE` | 409 | La inscripción ya está cancelada |
| `ENROLLMENT_CANCEL_WINDOW_PASSED` | 409 | Falta menos de la ventana; `details.minutes`: el límite configurado |
| `ENROLLMENT_SESSION_NOT_CANCELLABLE` | 409 | La sesión ya pasó o está cancelada (festivo) |
| `NOT_FOUND` | 404 | Módulo, inscripción o sesión inexistente, borrado o ajeno |
| `FORBIDDEN_ROLE` | 403 | Quien llama no es estudiante |

`ENROLLMENT_MODULE_FULL` también se usa al reactivar una sesión sin lugar. Un reintento idempotente (cancelar una sesión ya cancelada, reactivar una que no lo está) responde `200` con el estado actual.

## Cambios en servicios de la spec 010 y 006

- `ConfigUsageService.countActiveEnrollments(moduleId)` deja de devolver 0 y cuenta las inscripciones `ACTIVE` de estudiantes activos.
- `ConfigUsageService.maxEnrolled` (regla de salones de la spec 006) pasa a ser el máximo de inscritos activos entre los módulos del salón en periodos no cerrados.
- `ModulesService` no cambia: ya llama a `countActiveEnrollments` para el listado, el detalle, el cambio de salón, la edición de horarios y la eliminación.
- El módulo de pruebas de la spec 010 que usa `FakeConfigUsage` sigue funcionando.
