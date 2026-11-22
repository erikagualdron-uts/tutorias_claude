# Data Model: Cronograma del docente: reprogramar y cancelar sesiones

Sin tablas nuevas. Convenciones de `docs/Conventions.md` §4. Las fechas son `timestamptz` en UTC. La migración la crea `tutorias_uts_db` con `migrate diff` y se aplica con `migrate deploy`.

## Enum SessionCancelReason

Se agrega `TEACHER` (la cancelación la hizo el docente) a `HOLIDAY`. El `CHECK` existente `module_sessions_holiday_check` (`holiday_id` solo con `HOLIDAY`) sigue valiendo.

Nota de migración: `ALTER TYPE … ADD VALUE` no se usa en la misma transacción que lo añade; ninguna fila nueva usa `TEACHER` dentro de la migración.

## Enum OutboxEventType

Se agregan `SESSION_RESCHEDULED`, `SESSION_CANCELLED_TEACHER` y `SESSION_RESTORED_TEACHER`.

Carga útil (`payload`, solo ids, fechas y cantidades):

| Tipo | payload |
|---|---|
| `SESSION_RESCHEDULED` | `{ scope: "SESSION" \| "SERIES", sessions: [{ sessionId, from, to }] }` |
| `SESSION_CANCELLED_TEACHER` | `{ scope, sessions: [{ sessionId, from }] }` |
| `SESSION_RESTORED_TEACHER` | `{ scope, sessions: [{ sessionId, to }] }` |

`from` y `to` son el inicio en ISO 8601 UTC.

## ModuleSession (`module_sessions`)

Sin columnas nuevas. Cómo se usan los campos existentes:

| Campo | Al reprogramar | Al cancelar | Al reactivar |
|---|---|---|---|
| `startsAt`, `endsAt` | nuevo inicio y fin (misma duración) | sin cambio | sin cambio |
| `originalStartsAt` | no cambia nunca | no cambia | no cambia |
| `status` | `RESCHEDULED` (o `SCHEDULED` si `startsAt = originalStartsAt`) | `CANCELLED` | `SCHEDULED`, o `RESCHEDULED` si `startsAt ≠ originalStartsAt` |
| `cancelReason` | nulo | `TEACHER` | nulo |
| `teacherId`, `roomId`, `scheduleId`, `holidayId` | sin cambio | sin cambio | sin cambio |

Índices nuevos para las consultas de disponibilidad (R-4):
- `(room_id, starts_at)` y `(teacher_id, starts_at)`.

## Transiciones de estado

```
SCHEDULED ──reprogramar──▶ RESCHEDULED ──reprogramar──▶ RESCHEDULED / SCHEDULED (vuelve a su hora)
SCHEDULED | RESCHEDULED ──cancelar (docente)──▶ CANCELLED(TEACHER)
CANCELLED(TEACHER) ──reactivar──▶ SCHEDULED | RESCHEDULED
SCHEDULED ──festivo──▶ CANCELLED(HOLIDAY) ──quitar festivo──▶ SCHEDULED   (spec 010; el docente no lo cambia)
```

## Cálculos (no son tablas)

**Asistentes de una sesión**: los de la spec 011 (R-1): estudiantes distintos con inscripción vigente, cuenta activa y sin ausencia viva en esa sesión.

**Cruce con estudiantes** de una sesión movida: asistentes de esa sesión que también asisten a otra sesión `SCHEDULED` o `RESCHEDULED` de otro módulo cuyo intervalo `[starts_at, ends_at)` se solape con el nuevo.

**Puede cambiar una sesión** = es del docente del token, su módulo y su periodo no están borrados ni `CLOSED`, la sesión es futura, y `starts_at − ahora ≥ TEACHER_CHANGE_LEAD_MINUTES`. Reprogramar y cancelar exigen estado `SCHEDULED` o `RESCHEDULED`; reactivar exige `CANCELLED` con motivo `TEACHER`.

## Validaciones y errores

| Código | HTTP | Cuándo |
|---|---|---|
| `VALIDATION_FAILED` | 400 | Cuerpo o parámetros mal formados o con campos desconocidos |
| `SESSION_CHANGE_WINDOW_PASSED` | 409 | Falta menos del límite; `details.minutes` |
| `SESSION_NOT_CHANGEABLE` | 409 | La sesión ya pasó, ya está cancelada (reprogramar o cancelar) o no está cancelada por el docente (reactivar); `details.reason`: `PAST`, `CANCELLED`, `NOT_CANCELLED`, `CANCELLED_BY_OTHER` |
| `SESSION_RESCHEDULE_INVALID_DATE` | 422 | `details.reason`: `NO_CHANGE`, `PAST`, `OUT_OF_WEEK`, `OUT_OF_PERIOD`, `HOLIDAY` (con `details.date`) |
| `MODULE_SCHEDULE_OUT_OF_HOURS` | 422 | Fuera de 6:00 a 18:00 (spec 010); `details.earliest`, `details.latest` |
| `MODULE_ROOM_CONFLICT` | 409 | El salón está ocupado; `details.conflict` (spec 010) |
| `MODULE_TEACHER_CONFLICT` | 409 | El docente está ocupado; `details.conflict` (spec 010) |
| `SESSION_STUDENT_CONFLICT` | 409 | Algún inscrito se cruza; `details.students` (cantidad) |
| `PERIOD_CLOSED_READ_ONLY` | 409 | Periodo Cerrado |
| `NOT_FOUND` | 404 | Sesión inexistente, borrada o de otro docente |
| `FORBIDDEN_ROLE` | 403 | Quien llama no es docente |

Cuando `details.conflict` o `details.students` existen, no incluyen datos de personas. En una serie, los errores de cruce añaden `details.sessionId` con la primera sesión que falla.

## Cambios en servicios existentes

- `SessionsController`/`listSessions` (spec 010, CAE) y `OfferService` (spec 011): devuelven `cancelReason: 'TEACHER'`; las pantallas muestran "cancelada por el docente".
- `ConfigService`/`Env`: `TEACHER_CHANGE_LEAD_MINUTES` (por defecto 120).
- `SchedulesService.findConflict` no cambia (sigue para horarios semanales); las sesiones usan `session-availability.ts` nuevo.
