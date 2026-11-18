# Research: Cronograma del docente: reprogramar y cancelar sesiones

Decisiones técnicas de la funcionalidad 012. No quedaron marcadores `NEEDS CLARIFICATION`.

## R-1. Qué sesiones afecta "esta y las futuras"

- **Decisión**: el alcance `SERIES` toma la sesión elegida y las **sesiones futuras del mismo horario semanal** (`schedule_id`) del módulo, con `starts_at` posterior o igual a la elegida, no borradas y con estado `SCHEDULED` o `RESCHEDULED` (reprogramar y cancelar) o canceladas por el docente (reactivar). El alcance `SESSION` toma solo la elegida.
- **Motivo**: un cambio de día y hora pertenece a un horario semanal. Un módulo con martes y jueves, al mover un martes a miércoles, no debe mover también los jueves. Las sesiones de un mismo horario caen el mismo día de la semana, así que un mismo desplazamiento las deja a todas dentro de su semana.
- **Alternativas**: todas las futuras del módulo (mueve horarios que el docente no eligió); elegir sesión por sesión (obliga a repetir la acción cada semana, lo que D-069 quería evitar). Se añade una línea a los supuestos de la spec.

## R-2. Qué cambia al reprogramar

- **Decisión**: el docente propone el nuevo inicio de la sesión elegida (fecha y hora de Bogotá). Se conserva la **duración**. El desplazamiento `delta = nuevoInicio − inicioActual` se aplica a cada sesión afectada. Cada sesión movida queda `RESCHEDULED` con `original_starts_at` intacto; si vuelve a su hora original queda `SCHEDULED`. Salón y docente de la sesión no cambian.
- **Reglas de la nueva hora** (cada sesión movida, antes de escribir, en este orden):
  1. `NO_CHANGE`: el desplazamiento no es cero.
  2. `PAST`: el nuevo inicio es posterior a ahora.
  3. `OUT_OF_WEEK`: cae en la misma semana de la sesión (lunes a domingo, hora de Bogotá).
  4. `OUT_OF_PERIOD`: cae dentro de las fechas del periodo del módulo.
  5. `HOLIDAY`: no es un festivo (`holidays`, spec 010).
  6. Horario permitido: empieza desde `MODULE_EARLIEST_TIME` y termina hasta `MODULE_LATEST_TIME` (D-089), con el error `MODULE_SCHEDULE_OUT_OF_HOURS` ya existente.
  7. Salón y docente libres (R-4) y estudiantes sin cruce (R-5).
- La ventana de 2 horas se mide contra el inicio de la **primera sesión afectada** (D-069) con el reloj del servidor.

## R-3. Cancelar y reactivar

- **Decisión**: cancelar pasa la sesión a `CANCELLED` con `cancel_reason = TEACHER` (valor nuevo del enum); no se borra. Reactivar solo aplica a sesiones `CANCELLED` con motivo `TEACHER`: deja `SCHEDULED` (o `RESCHEDULED` si `starts_at ≠ original_starts_at`) y vuelve a validar salón, docente y estudiantes (R-4, R-5). Las canceladas por festivo (`HOLIDAY`) o por el CAE no se tocan.
- **Interacción con festivos (spec 010)**: la cancelación por festivo solo mira sesiones `SCHEDULED` y la restauración solo mira las del festivo (`holiday_id`), así que ninguna pisa a una sesión cancelada por el docente; sin cambios en esa parte.
- **Cupo (spec 011)**: una sesión `CANCELLED` ya no tiene cupo ni cuenta en la oferta; reactivar la devuelve sin tocar inscripciones ni ausencias.

## R-4. Disponibilidad de salón y docente por sesión

- **Decisión**: la comprobación se hace **sobre sesiones reales**, no sobre el horario semanal: existe conflicto si hay otra sesión `SCHEDULED` o `RESCHEDULED`, no borrada, con `starts_at < nuevoFin` y `ends_at > nuevoInicio`, del mismo `room_id` o del mismo `teacher_id`, que no sea una de las movidas. Es la misma consulta que usa la spec 010 al restaurar festivos. El error es `MODULE_ROOM_CONFLICT` o `MODULE_TEACHER_CONFLICT` con `details.conflict` (módulo, día y horas de la sesión que choca).
- **Concurrencia**: transacción con el orden de bloqueo `periodo (FOR SHARE) → módulo (FOR UPDATE, lockModule) → salones afectados → docentes afectados` (ordenados por id). Dos cambios sobre el mismo salón o docente se serializan en la fila del salón o del docente. La edición de capacidad de un salón (spec 011) y el cambio de salón del CAE toman el módulo y luego el salón, el mismo orden, sin ciclos.
- **Límite conocido**: el cruce del CAE al cambiar salón o docente y la inscripción de un estudiante (spec 011) comprueban el horario **semanal**; una sesión ya movida a otra hora no la ven. No se corrige en esta spec (habría que mover esas validaciones a sesiones); se registra en D-096.
- **Alternativa descartada**: restricción de exclusión sobre `module_sessions`. Sesiones pasadas o generadas con la historia del módulo (salón o docente reasignados, D-086) podrían solaparse legítimamente y la migración fallaría sobre datos reales.

## R-5. Cruces con los estudiantes inscritos

- **Decisión**: por cada sesión movida, se cuenta (`COUNT(DISTINCT student_id)`) los **asistentes** de esa sesión (mismo cálculo de la spec 011, R-1) que asisten a otra sesión de otro módulo (`SCHEDULED` o `RESCHEDULED`, no borrada) que se solape con la nueva hora. Si el conteo es mayor que cero: `409 SESSION_STUDENT_CONFLICT` con `details.students` (cantidad) y sin ningún dato de las personas (Principio IV).
- **Consulta**: una sola consulta SQL por sesión movida (unas 16 como máximo en una serie); objetivo de reprogramar en menos de 1 s.
- Para reactivar se aplica la misma comprobación.

## R-6. Eventos para las notificaciones

- **Decisión**: se agregan los tipos `SESSION_RESCHEDULED`, `SESSION_CANCELLED_TEACHER` y `SESSION_RESTORED_TEACHER` a `OutboxEventType`. Un evento **por acción** (no por sesión): `{ scope, sessions: [{ sessionId, from, to }] }` con `from`/`to` en ISO UTC (solo `from` al cancelar). Solo ids, fechas y cantidades; nunca datos de los estudiantes. Se escribe con `OutboxService.record(tx, …)` en la misma transacción que el cambio (D-087).
- Una acción rechazada no deja evento ni cambio (la transacción se revierte).

## R-7. Quién puede qué

- **Decisión**: todos los endpoints `/teacher/*` con `@Roles('TEACHER')`; el docente es el `userId` del token, nunca un parámetro. Una sesión es "suya" si `module_sessions.teacher_id = userId` (la sesión guarda el docente con que se dicta, D-086) y su módulo no está borrado; cualquier otra responde `404`. Un docente desactivado o eliminado no inicia sesión (spec 001).

## R-8. Consulta de disponibilidad antes de confirmar

- **Decisión**: `POST /teacher/sessions/{id}/reschedule` acepta `dryRun: true`: ejecuta **todas** las validaciones sin escribir ni emitir eventos y responde `200` con las nuevas horas, o el mismo error que daría al confirmar. La app lo usa al elegir la hora para mostrar el motivo antes de confirmar. Sin bloqueos de escritura largos: el `dryRun` no toma `FOR UPDATE`, así que el resultado puede cambiar al confirmar y la confirmación vuelve a validar.
- **Alternativa**: endpoint de disponibilidad separado (duplica validaciones y contrato).

## R-9. Configuración

- **Decisión**: `TEACHER_CHANGE_LEAD_MINUTES` (por defecto `120`, entero positivo) en `Env`, validada al arrancar como `STUDENT_CANCEL_LEAD_MINUTES`.

## R-10. App

- **Decisión**: la pestaña `schedule` del docente pasa de archivo a carpeta (`index.tsx` y `_layout.tsx`), como las demás. Lista de sesiones próximas agrupadas por día (un `FilterChips` para el módulo), tarjeta de módulo con inscritos, y una hoja de acciones por sesión (Reprogramar, Cancelar, Reactivar) con la elección de alcance, el selector de fecha y hora (se reutilizan `DateField` y `PickerSheet`), la regla visible cuando una acción está bloqueada y la confirmación antes de cancelar. Los estudiantes ven la sesión con la nueva hora o "cancelada por el docente" en las pantallas de la spec 011; el CAE, en la lista de sesiones de la spec 010. Íconos solo Iconify en el registro único.
- **Fuera de alcance**: el calendario semanal compartido de `Design.md` (otra funcionalidad) y las notificaciones (spec 013).

## R-11. Pruebas

- Backend (Vitest): reglas puras (ventana de 120 minutos, semana, desplazamiento), e2e de cada acción y alcance, cruces de salón, docente y estudiantes, festivos, periodo Cerrado, eventos (uno por acción, ninguno al rechazar), concurrencia (dos reprogramaciones al mismo salón y hora; reprogramar y cancelar la misma sesión), roles contra el contrato y contrato contra las respuestas reales. App (Jest): hoja de acciones, bloqueos y paridad es/en.
