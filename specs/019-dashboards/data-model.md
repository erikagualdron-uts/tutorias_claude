# Data Model: Dashboards de los tres roles

**Sin tablas, columnas, enums ni migraciones.** Los resúmenes se calculan al consultar. Esta spec no toca `tutorias_uts_db`.

## Configuración nueva

| Clave | Tipo | Por defecto | Uso |
|---|---|---|---|
| `dashboard.lowEnrollmentPercent` | entero 1 a 100 | 30 | Un módulo activo con inscritos / capacidad por debajo de este porcentaje, y que no esté lleno, cuenta como "baja inscripción" (FR-005). |

Va en `SETTING_DEFAULTS` de `settings.service.ts`; sin pantalla de edición.

## Fuentes de lectura

| Cifra | Tablas | Filtros |
|---|---|---|
| Módulos activos y ocupación | `modules`, `rooms`, `academic_periods`, `enrollments`, `users` | módulo no eliminado del periodo `ACTIVE`; inscritos `ACTIVE` con cuenta activa |
| Estudiantes y docentes activos | `users` | rol, `status = 'ACTIVE'`, `deleted_at IS NULL` |
| PQRS por estado y tiempo de respuesta | `pqrs` | `deleted_at IS NULL`; promedio de `resolved_at - created_at` de las resueltas |
| Cambios recientes | `module_sessions`, `modules` | estado `RESCHEDULED` o `CANCELLED`, `cancel_reason <> 'HOLIDAY'`, no eliminada; por `updated_at` descendente |
| Salones | `rooms`, `modules`, `enrollments` | promedio de ocupación de sus módulos activos |
| Próxima sesión y semana (docente) | `module_sessions`, `rooms` | `teacher_id` del usuario, estado `SCHEDULED` o `RESCHEDULED`; inscritos por `sessionSeats` |
| Próxima sesión y semana (estudiante) | `module_sessions`, `enrollments`, `session_absences` | `ATTENDS_SESSION`; estado `SCHEDULED` o `RESCHEDULED` |
| Cupo por módulo (docente) | `modules`, `rooms`, `enrollments` | módulos del docente en el periodo `ACTIVE` |

Todos reutilizan los índices existentes (`module_sessions(teacher_id, starts_at)`, `module_sessions(starts_at)`, `enrollments(student_id, status)`, `enrollments(module_id, status)`, `pqrs(status, created_at)`); no se agregan índices nuevos.

## Resúmenes devueltos (no se guardan)

**Resumen del CAE** (tres respuestas independientes)

- `overview`: `occupancy {enrolled, capacity, percent}`, `modules {active, full, lowEnrollment}`, `lowEnrollmentPercent`, `accounts {students, teachers}`, `pqrs {filed, inReview, resolved, avgResponseSeconds | null}`.
- `changes`: página de `Cambio reciente`.
- `rooms`: `most[]` y `least[]` con `{roomId, name, location, percent, modules}`.

**Resumen del docente**: `nextSession | null` `{sessionId, moduleId, moduleName, startsAt, endsAt, room, attendees}`, `weekSessions`, `modules[] {id, name, enrolled, capacity}`.

**Resumen del estudiante**: `nextSession | null` `{sessionId, moduleId, moduleName, startsAt, endsAt, room}`, `weekSessions`, `changes[]` (hasta 5 `Cambio reciente`).

**Cambio reciente**: `{sessionId, moduleId, moduleName, kind: RESCHEDULED | CANCELLED, originalStartsAt, startsAt, changedAt}`.

Los avisos y mensajes sin leer y las 3 PQRS propias salen de los endpoints existentes (R-1).

## Reglas de cálculo

- Capacidad total 0 → ocupación 0 %. Un módulo es "lleno" con inscritos ≥ capacidad; "baja inscripción" si no está lleno y está por debajo del umbral.
- "Semana" = lunes a domingo en `America/Bogota`; las sesiones canceladas no se cuentan.
- Sin datos: las listas son `[]`, `nextSession` es `null`, el tiempo de respuesta es `null`; nunca `NaN`.
- Todas las fechas salen en UTC (ISO 8601) y la app las muestra en `America/Bogota`.
