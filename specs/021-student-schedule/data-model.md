# Data Model: Cronograma semanal del estudiante

**Sin tablas, columnas, enums ni migraciones.** Esta spec no toca `tutorias_uts_db`.

## Fuentes de lectura

| Dato | Tabla y columna | Filtros |
|---|---|---|
| Sesión: hora, estado, motivo, hora original | `module_sessions` (`starts_at`, `ends_at`, `original_starts_at`, `status`, `cancel_reason`) | `deleted_at IS NULL`, `starts_at` dentro del rango; módulo no eliminado del periodo mostrado |
| Módulo | `modules` (`id`, `name`, `period_id`) | `deleted_at IS NULL` |
| Salón y sede | `rooms` (`name`), `locations` (`name`) | por `module_sessions.room_id` |
| Docente | `teacher_profiles` (`first_name`, `last_name`) por `module_sessions.teacher_id` | docente de la sesión (puede diferir del del módulo si cambió) |
| Cobertura de la inscripción | `enrollments` (`student_id`, `module_id`, `status`, `effective_until`, `deleted_at`) | `ENROLLED_IN_SESSION`: no eliminada y (`ACTIVE`, o `CANCELLED` con `starts_at < effective_until`) |
| Sesión omitida por el estudiante | `session_absences` (`enrollment_id`, `session_id`, `deleted_at`) | ausencia vigente (no eliminada) del propio estudiante |
| Periodo y horas | `academic_periods` y la configuración (`MODULE_EARLIEST_MINUTE`, `MODULE_LATEST_MINUTE`) | el activo; sin él, el último cerrado |

Índices que se reutilizan: `module_sessions(starts_at)`, `module_sessions(module_id, starts_at)`, `enrollments(student_id, status)`, `enrollments(module_id, status)`. No se agregan índices.

## Respuesta (no se guarda)

`GET /student/calendar?from=&to=` devuelve:

- `data[]`, ordenado por `startsAt` y `id`: `{ id, moduleId, moduleName, teacherName, room: { id, name, location, capacity }, startsAt, endsAt, originalStartsAt, status: SCHEDULED | RESCHEDULED | CANCELLED, cancelReason: HOLIDAY | TEACHER | null, absent: boolean }`.
- `meta`: `{ from, to, period: { id, name, startsOn, endsOn, status } | null, hours: { earliest, latest }, hasEnrollments: boolean }`.

## Reglas de cálculo

- Una sesión aparece si algún enrollment del estudiante la cubre (`ENROLLED_IN_SESSION`); una inscripción cancelada solo cubre las sesiones anteriores a su `effective_until`.
- `absent` es verdadero si el estudiante tiene una ausencia vigente para esa sesión (cancelada solo para sí). La sesión sigue en la lista.
- `hasEnrollments` es verdadero si tiene alguna inscripción no eliminada en un módulo del periodo mostrado, cubra o no sesiones de esa semana.
- La sesión sale con el estado que le dio el docente o el festivo (`status`, `cancelReason`); el servidor no mezcla ese estado con `absent`: la app decide el texto (R-3).
- Sin periodo (ni activo ni cerrado): `data` vacío, `period` nulo y `hasEnrollments` falso.
- Rango de 1 a 7 días en días de Bogotá; el servidor lo convierte a instantes UTC con el mismo cálculo del docente.
- Fechas en UTC (ISO 8601) en la respuesta y en `America/Bogota` en pantalla.
