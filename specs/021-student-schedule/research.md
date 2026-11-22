# Research: Cronograma semanal del estudiante

Sin `NEEDS CLARIFICATION` abiertos. Cada punto resume qué se decidió y por qué.

## R-1. Un endpoint nuevo, gemelo del del docente

- **Decisión**: `GET /student/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD` (rol `STUDENT`) con la misma forma que `GET /teacher/calendar`: `data` con las sesiones y `meta` con `from`, `to`, `period`, `hours` y, nuevo, `hasEnrollments`. Rango de 1 a 7 días con la misma validación (`parseCalendarRange`).
- **Razón**: la app ya pide una semana por vez y guarda la semana anterior mientras carga la siguiente; un contrato igual al del docente deja que el calendario y su estado de navegación se compartan. `GET /enrollments` (que ya existe) devuelve inscripciones, no sesiones por semana.
- **Alternativas**: armar el calendario en la app con `GET /modules/:id` de cada módulo (muchas peticiones y las reglas de asistencia quedarían en el cliente, contra el Principio II).

## R-2. Asistencia sin copiar la regla

- **Decisión**: en `enrollments/seats.ts`, `ATTENDS_SESSION` se parte en `ENROLLED_IN_SESSION` (inscripción no eliminada, `ACTIVE` o `CANCELLED` con la sesión antes de `effective_until`) y la condición de "sin ausencia"; `ATTENDS_SESSION` sigue siendo la suma de ambas y no cambia para nadie. El calendario usa `ENROLLED_IN_SESSION` en un `EXISTS` y calcula `absent` con otro `EXISTS` sobre `session_absences` del estudiante.
- **Razón**: la spec pide mostrar la sesión que el estudiante omitió ("Cancelada por ti"), así que no se puede filtrar con `ATTENDS_SESSION`, pero la parte de inscripción y vigencia debe ser exactamente la misma que usan el cupo y el dashboard (SC-002).
- **Alternativas**: copiar las condiciones en el nuevo servicio (se desviarían con el tiempo); listar solo las que asiste y esconder las omitidas (la spec decidió mostrarlas).

## R-3. Estado de cada sesión

- **Decisión**: cada sesión lleva `status` (`SCHEDULED`, `RESCHEDULED`, `CANCELLED`), `cancelReason` (`HOLIDAY`, `TEACHER` o `null`), `originalStartsAt` y `absent` (verdadero si el estudiante la omitió). En la app, el estado se traduce a una clave: cancelada por festivo o por el docente (`cancelReason`), reprogramada (con la hora original), o "cancelada por ti" cuando `absent` y la sesión no está cancelada por otra causa. Si la sesión ya está cancelada por festivo o docente, gana esa causa.
- **Razón**: la causa de la institución es más informativa que la decisión personal; una sesión que el docente ya canceló no necesita que el estudiante la omita.
- **Alternativas**: un estado nuevo en el servidor (mezcla dos cosas distintas: lo que le pasó a la sesión y lo que decidió el estudiante).

## R-4. Periodo y horas compartidos con el docente

- **Decisión**: la resolución del periodo (el activo o, sin él, el último cerrado) y de las horas permitidas (`MODULE_EARLIEST_MINUTE` y `MODULE_LATEST_MINUTE`) que hoy vive dentro de `TeacherScheduleService.calendar` pasa a `src/periods/calendar-meta.ts` y la usan los dos servicios. Las pruebas e2e del cronograma del docente protegen que su respuesta no cambie.
- **Razón**: son unas 25 líneas delicadas (cierre de periodos vencidos, formato de fechas, horas) que no deben quedar duplicadas.
- **Alternativas**: copiarlas (dos fuentes de verdad); dejar al docente como está y escribir otra para el estudiante (lo mismo).

## R-5. Sin inscripciones

- **Decisión**: `meta.hasEnrollments` es verdadero si el estudiante tiene alguna inscripción no eliminada en un módulo del periodo mostrado. Sin inscripciones, la app muestra el estado vacío con la invitación a explorar módulos en lugar del calendario.
- **Razón**: una semana sin sesiones también devuelve `data` vacío; sin este dato no se puede distinguir "no estás inscrito" de "esta semana no tienes tutorías". Evita además pedir `GET /enrollments` aparte y su propio fallo.
- **Alternativas**: consultar `GET /enrollments` desde la pantalla (otra petición y otro estado de error).

## R-6. Estado de semana y vista compartidos

- **Decisión**: `useWeekNavigation` (en `src/components/calendar/`) recibe el resultado de la consulta del calendario y devuelve `weekStart`, `selectedDay`, `view`, `meta`, `today`, `now` y los manejadores `onWeekChange`, `onSelectDay` y `onViewChange`, con las mismas reglas de la spec 013: vista Día bajo 600 dp y Semana desde 600 dp, semana inicial la más cercana a hoy cuando hoy cae fuera del periodo, y el periodo anterior mientras otra semana carga. `TeacherScheduleScreen` pasa a usarlo y su comportamiento no cambia.
- **Razón**: es la parte más delicada de la pantalla y no depende de quién es el dueño de las sesiones.
- **Alternativas**: copiar ~25 líneas en la pantalla del estudiante.

## R-7. Solo lectura y navegación al módulo

- **Decisión**: `onPressItem` abre `targetFor('STUDENT', moduleId)` (el detalle del módulo de la spec 011, donde ya están las sesiones y su cancelación). El calendario no tiene hoja de acciones. La pantalla del cronograma queda montada en su pestaña, así que al volver conserva semana y día.
- **Razón**: `Design.md` pide mantener los cronogramas del estudiante en solo lectura y las reglas de cancelación (hasta 1 hora antes) ya viven en el detalle del módulo.
- **Alternativas**: una hoja de detalle propia con "Cancelar" (duplicaría reglas y es lo que la spec descartó).

## R-8. Frescura

- **Decisión**: `useRefreshOnFocus` pasa de `features/dashboard/hooks/` a `src/hooks/` y la pantalla lo usa con el `refetch` del calendario; al volver a la pestaña o al refrescar se ven los cambios (FR-015). La consulta usa `placeholderData: keepPreviousData` como la del docente.
- **Razón**: ya lo usan los dashboards; solo cambia de lugar.
- **Alternativas**: un sondeo periódico (no hace falta: los cambios llegan además por aviso y push).

## R-9. Estados y textos

- **Decisión**: claves nuevas `student.schedule.*` (título, estados `SCHEDULED`, `RESCHEDULED`, `HOLIDAY`, `TEACHER`, `STUDENT`, "hora original", estado vacío sin inscripciones con su botón) y se reutilizan `calendar.*` (hoy, semanas, vistas, "Fuera del periodo académico", "No hay sesiones este día", error de carga).
- **Razón**: coherencia con el cronograma del docente y menos textos nuevos.
