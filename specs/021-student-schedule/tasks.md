---

description: "Task list for Cronograma semanal del estudiante"
---

# Tasks: Cronograma semanal del estudiante

**Input**: Design documents from `/specs/021-student-schedule/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/student-calendar-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principios IV y V) y `docs/Conventions.md` §6 exigen pruebas de roles (`403`) y de contrato; aquí se suman las de las reglas que más pueden desviar el calendario del detalle del módulo (asistencia, ausencias y vigencia de una inscripción cancelada) y las de las dos extracciones. Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1 y US2 son P1; US3 y US4 son P2. **No cambia `tutorias_uts_db`** (sin migración); cambian `tutorias_uts_back`, `tutorias_uts_mobile` y `Claude/docs`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 ver mi semana, US2 estado de cada sesión, US3 moverme entre semanas, US4 abrir el módulo y estados vacíos
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas en `__tests__/` y ayudas de prueba en `testing/` (una ayuda dentro de `__tests__/` falla: Jest la toma por una prueba sin casos)
- `Claude/` = `docs/` y `specs/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes; el estado nunca se indica solo por color; objetivos táctiles de 48 px como mínimo
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Roles por endpoint con `@Roles('STUDENT')`; el estudiante sale del usuario autenticado (`@CurrentAuth()`), nunca de un parámetro
- Hora actual siempre con `Clock` (`common/clock.ts`), nunca `new Date()`; las fechas salen en UTC y la semana va de lunes a domingo en `America/Bogota`
- Todas las consultas excluyen filas con `deleted_at`; el calendario no ofrece acciones de cambio sobre las sesiones
- Esta versión de Testing Library es asíncrona: `await render(...)`, `await fireEvent.press(...)`; el `screen` es el del último `render`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí ni con la API de desarrollo en marcha; una corrida de muchos archivos e2e a la vez puede dar "Hook timed out" por carga: repartirla
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF; `Architecture.md` está en LF

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Las extracciones que comparten el docente y el estudiante, sin cambiar lo que hace el docente

- [X] T001 En `tutorias_uts_back/src/enrollments/seats.ts` partir `ATTENDS_SESSION` en dos fragmentos exportados: `ENROLLED_IN_SESSION` (`e.deleted_at IS NULL AND (e.status = 'ACTIVE' OR (e.status = 'CANCELLED' AND s.starts_at < e.effective_until))`) y la condición de ausencia; `ATTENDS_SESSION` queda como la suma de ambas, con el mismo texto SQL de antes. Correr `npm run test:e2e` sobre `enrollments*`, `teacher-sessions*`, `teacher-calendar*` y `dashboard-student` (por lotes de pocos archivos) y confirmar que siguen en verde
- [X] T002 Crear `tutorias_uts_back/src/periods/calendar-meta.ts` con la resolución del periodo (el activo o, sin él, el último cerrado, con `closeExpired()` antes) y de las horas permitidas (`MODULE_EARLIEST_MINUTE` y `MODULE_LATEST_MINUTE`, formateadas con `formatTime`), y usarla desde `TeacherScheduleService.calendar` en `tutorias_uts_back/src/teacher-sessions/teacher-schedule.service.ts` sin cambiar su respuesta; confirmar que `teacher-calendar`, `teacher-calendar-contract` y `teacher-calendar-roles` siguen en verde
- [X] T003 [P] Mover `tutorias_uts_mobile/src/features/dashboard/hooks/useRefreshOnFocus.ts` a `tutorias_uts_mobile/src/hooks/useRefreshOnFocus.ts` y actualizar los imports de `AdminDashboardScreen.tsx`, `TeacherDashboardScreen.tsx` y `StudentHomeScreen.tsx`; las pruebas de los dashboards siguen en verde
- [X] T004 [P] Escribir `tutorias_uts_mobile/src/components/calendar/__tests__/useWeekNavigation.test.tsx` (debe fallar): sin datos, abre en la semana de hoy con hoy seleccionado y la vista Día bajo 600 dp y Semana desde 600 dp; al llegar el periodo con hoy fuera de él, abre en la semana del periodo más cercana a hoy; conserva el periodo de la semana anterior mientras otra carga (`isPlaceholderData`); `onWeekChange` fija semana y día y `onViewChange` conserva la vista al navegar
- [X] T005 Crear `tutorias_uts_mobile/src/components/calendar/useWeekNavigation.ts` sacando de `TeacherScheduleScreen.tsx` el estado de `week`, `selected`, `view` y `meta`, el cálculo de `weekStart` y `selectedDay` y el ajuste de la semana inicial con `initialWeek`; hacer que `TeacherScheduleScreen` lo use y que sus pruebas (`calendar.test.tsx`, `schedule.test.tsx` en `src/features/teacher-sessions/__tests__/`) sigan en verde
- [X] T006 [P] Añadir a `tutorias_uts_mobile/src/api/types.ts` `StudentSession` (`id`, `moduleId`, `moduleName`, `teacherName`, `room`, `startsAt`, `endsAt`, `originalStartsAt`, `status`, `cancelReason`, `absent`) y `StudentCalendar` (`data` y `meta` con `period`, `hours` y `hasEnrollments`), según `contracts/student-calendar-api.yaml`

**Checkpoint**: Las extracciones están hechas y el docente no cambió; las historias pueden empezar.

---

## Phase 2: User Story 1 - Ver mi semana de tutorías (Priority: P1) 🎯 MVP

**Goal**: El estudiante abre "Cronograma" y ve su semana con módulo, salón y docente de cada sesión, en vista Día o Semana, solo de los módulos donde asiste.

**Independent Test**: Con un estudiante inscrito en dos módulos con sesiones esta semana, abrir "Cronograma" y comprobar cada sesión en su día y hora, y que un módulo ajeno no aparece.

### Tests for User Story 1 ⚠️

- [X] T007 [P] [US1] Escribir `tutorias_uts_back/test/student-calendar-roles.e2e-spec.ts` (debe fallar): `GET /student/calendar` responde `401` sin sesión y `403` a docente y CAE; `400 VALIDATION_FAILED` sin `from` o `to`, con un día inválido, con `to` antes de `from` y con un rango de más de 7 días; `200` con un rango válido
- [X] T008 [P] [US1] Escribir `tutorias_uts_back/test/student-calendar.e2e-spec.ts` (debe fallar; fixtures de `test/utils/teacher-fixture.ts`): devuelve solo las sesiones de los módulos en los que el estudiante está inscrito, ordenadas por `startsAt` e `id`, con `moduleName`, `teacherName` (nombre y apellido del docente de la sesión), `room` con `name`, `location` y `capacity`, `startsAt`, `endsAt`, `originalStartsAt`, `status`, `cancelReason` y `absent: false`; no trae sesiones de un módulo ajeno, de otra semana, eliminadas ni de un módulo eliminado; trae las pasadas y las futuras de la semana pedida; `meta` lleva `from`, `to`, `period` (el activo con `id`, `name`, `startsOn`, `endsOn`, `status`), `hours` (`earliest` y `latest` de la configuración) y `hasEnrollments: true`; sin inscripciones `data` es `[]` y `hasEnrollments` es `false`; sin periodo activo ni cerrado `period` es `null`; con solo un periodo cerrado lo muestra como `CLOSED`
- [X] T009 [P] [US1] Escribir `tutorias_uts_mobile/src/features/student-schedule/__tests__/calendarItems.test.ts` (debe fallar) para `toCalendarItem(session, t)`: `title` es el módulo, `room` el nombre del salón, `detail` el nombre del docente, `badge` el texto del estado, `strike` falso en una programada
- [X] T010 [P] [US1] Escribir `tutorias_uts_mobile/src/features/student-schedule/__tests__/StudentScheduleScreen.test.tsx` (debe fallar): con una semana de sesiones muestra, en la vista Día, las del día seleccionado por hora con módulo, salón y docente, y pide `/student/calendar?from=<lunes>&to=<domingo>` de la semana de hoy; en una pantalla de 600 dp o más abre en Semana; el encabezado trae el rango, las flechas, "Hoy" y los siete días con marca en los que tienen sesiones; un día sin sesiones dice "No hay sesiones este día"; los textos salen en español e inglés

### Implementation for User Story 1

- [X] T011 [US1] Crear `tutorias_uts_back/src/enrollments/dto/student-calendar-query.dto.ts` (`from` y `to` con el mismo patrón `YYYY-MM-DD` de `TeacherCalendarQueryDto`) y `tutorias_uts_back/src/enrollments/student-calendar.service.ts` con `calendar(userId, query)`: `parseCalendarRange`, `calendar-meta` de T002, y una consulta `$queryRaw` de las sesiones del rango del periodo mostrado cuyo módulo tiene un enrollment del estudiante que cumple `ENROLLED_IN_SESSION` en un `EXISTS` (sin duplicar filas), con módulo, salón, sede y docente (`teacher_profiles`), `deleted_at IS NULL` en sesión y módulo, ordenadas por `starts_at` e `id`; `meta.hasEnrollments` con otro `EXISTS` de enrollments no eliminados en módulos del periodo
- [X] T012 [US1] Añadir `@Get('student/calendar')` en `tutorias_uts_back/src/enrollments/enrollments.controller.ts` (ya `@Roles('STUDENT')` por clase) y registrar el servicio en `tutorias_uts_back/src/enrollments/enrollments.module.ts`
- [X] T013 [P] [US1] Añadir los textos a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`student.schedule.title`, `student.schedule.state.SCHEDULED`, `student.schedule.original`) con las claves ordenadas, y ejecutar `check_i18n.py`
- [X] T014 [P] [US1] Crear `tutorias_uts_mobile/src/features/student-schedule/calendarItems.ts` con `toCalendarItem(session, t)` (módulo, salón, docente en `detail`, estado como texto, `strike`, nota con la hora original si fue reprogramada)
- [X] T015 [P] [US1] Crear `tutorias_uts_mobile/src/features/student-schedule/hooks/useStudentCalendar.ts`: `useStudentCalendar(from, to)` sobre `/student/calendar?from=&to=` con clave `['student', 'calendar', from]` y `placeholderData: keepPreviousData`, como `useTeacherCalendar.ts`
- [X] T016 [US1] Crear `tutorias_uts_mobile/src/features/student-schedule/screens/StudentScheduleScreen.tsx` con `useWeekNavigation` (T005), `useNow`, `useStudentCalendar` y `WeekCalendar` dentro de una `Card` con el título, el cuerpo de carga y error con "Reintentar" y el periodo nulo como en `TeacherScheduleScreen.tsx`; sin lista de próximas sesiones ni hoja de acciones
- [X] T017 [US1] Cambiar `tutorias_uts_mobile/app/(student)/schedule.tsx` para exportar `StudentScheduleScreen` en lugar de `EmptyTabScreen`

**Checkpoint**: US1 funciona y se prueba sola; es el MVP.

---

## Phase 3: User Story 2 - Entender el estado de cada sesión (Priority: P1)

**Goal**: Cada sesión muestra su estado en texto e ícono: programada, reprogramada con la hora original, cancelada por festivo, por el docente o por el propio estudiante.

**Independent Test**: Con una sesión programada, una reprogramada, una cancelada por festivo, una por el docente y una omitida por el estudiante, comprobar el estado de cada una.

### Tests for User Story 2 ⚠️

- [X] T018 [P] [US2] Añadir a `tutorias_uts_back/test/student-calendar.e2e-spec.ts` (debe fallar): una sesión que el estudiante omitió (`createAbsence`) sale con `absent: true` y sigue en la lista; una ausencia eliminada (`deletedAt`) no cuenta; una sesión reprogramada trae `status: RESCHEDULED`, la hora nueva en `startsAt` y la original en `originalStartsAt`; una cancelada por festivo y una por el docente traen `status: CANCELLED` con `cancelReason` `HOLIDAY` y `TEACHER`; una inscripción cancelada con `effectiveUntil` cubre las sesiones anteriores a esa fecha y no las posteriores; un cambio del docente a la sesión se ve en la siguiente consulta sin cerrar sesión
- [X] T019 [P] [US2] Añadir a `tutorias_uts_mobile/src/features/student-schedule/__tests__/calendarItems.test.ts` (debe fallar) para `sessionStateKey(session)`: reprogramada da `RESCHEDULED` con la nota de la hora original; cancelada por festivo da `HOLIDAY` y por el docente `TEACHER`, ambas con `strike`; una sesión con `absent` y no cancelada da `STUDENT` con `strike`; una cancelada por festivo o docente que además tiene `absent` conserva la causa de la institución, no `STUDENT`
- [X] T020 [P] [US2] Añadir a `tutorias_uts_mobile/src/features/student-schedule/__tests__/StudentScheduleScreen.test.tsx` (debe fallar): cada estado se ve con su texto ("Reprogramada" con la hora original, "Cancelada por festivo", "Cancelada por el docente", "Cancelada por ti") y su ícono, las canceladas tachadas, y el bloque lleva una etiqueta de accesibilidad con módulo, horas, salón, docente y estado

### Implementation for User Story 2

- [X] T021 [US2] Modificar `tutorias_uts_back/src/enrollments/student-calendar.service.ts` para calcular `absent` con un `EXISTS` sobre `session_absences` (ausencia no eliminada) del enrollment del propio estudiante para esa sesión, sin filtrar la sesión por ausencia
- [X] T022 [P] [US2] Añadir los estados a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`student.schedule.state.RESCHEDULED`, `HOLIDAY`, `TEACHER`, `STUDENT`) y ejecutar `check_i18n.py`
- [X] T023 [US2] Completar `tutorias_uts_mobile/src/features/student-schedule/calendarItems.ts` con `sessionStateKey` (cancelada: la causa de la institución primero; luego `absent` como `STUDENT`; luego reprogramada y programada) y la nota de la hora original

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 4: User Story 3 - Moverme entre semanas del periodo (Priority: P2)

**Goal**: Navegar semanas dentro del periodo, volver con "Hoy", ver el límite del periodo y semanas pasadas en solo lectura.

**Independent Test**: Con un periodo activo, avanzar y retroceder hasta los límites, comprobar el mensaje y que "Hoy" vuelve a la semana actual.

### Tests for User Story 3 ⚠️

- [X] T024 [P] [US3] Añadir a `tutorias_uts_mobile/src/features/student-schedule/__tests__/StudentScheduleScreen.test.tsx` (debe fallar): la flecha siguiente pide la semana siguiente y muestra sus sesiones; en la última semana del periodo la flecha se ve deshabilitada y al tocarla dice "Fuera del periodo académico" sin pedir otra semana; "Hoy" desde otra semana vuelve a la actual con hoy seleccionado; una semana pasada muestra sus sesiones; sin periodo (`period: null`) muestra "Sin periodo académico"; mientras la primera semana carga las flechas esperan; un error de la semana muestra "Reintentar" y conserva la semana y el día elegidos
- [X] T025 [P] [US3] Añadir a `tutorias_uts_back/test/student-calendar.e2e-spec.ts` (debe fallar): una semana fuera de las fechas del periodo devuelve `data` vacío con el periodo en `meta`; con un periodo cerrado y ninguno activo devuelve las sesiones de ese periodo; con un activo, las del activo y no las de un cerrado anterior

### Implementation for User Story 3

- [X] T026 [US3] Comprobar en `tutorias_uts_mobile/src/features/student-schedule/screens/StudentScheduleScreen.tsx` que `period`, `meta.hours` y los manejadores de `useWeekNavigation` llegan a `WeekCalendar` como en el docente, y ajustar solo lo que las pruebas de T024 muestren que falta; las semanas pasadas y los periodos cerrados quedan en solo lectura sin ninguna acción

**Checkpoint**: Las tres primeras historias funcionan.

---

## Phase 5: User Story 4 - Abrir el módulo de una sesión y estados vacíos (Priority: P2)

**Goal**: Tocar una sesión abre el detalle de su módulo, el estudiante sin inscripciones recibe una invitación a explorar módulos, y los cambios se ven al volver a la pestaña.

**Independent Test**: Tocar una sesión y comprobar que abre su módulo y que no hay acciones de cambio; entrar sin inscripciones y ver la invitación.

### Tests for User Story 4 ⚠️

- [X] T027 [P] [US4] Añadir a `tutorias_uts_mobile/src/features/student-schedule/__tests__/StudentScheduleScreen.test.tsx` (debe fallar): tocar una sesión llama a `router.push` con `/(student)/modules/[id]` y el `moduleId`; el calendario no muestra botones de cancelar, restaurar ni reprogramar; con `hasEnrollments: false` muestra el estado vacío con "Explorar módulos" (ícono a la izquierda) que abre `/(student)/modules`, en lugar del calendario; al volver a enfocar la pantalla vuelve a pedir la semana visible
- [X] T028 [P] [US4] Añadir a `tutorias_uts_back/test/student-calendar-roles.e2e-spec.ts` (debe fallar): un estudiante nunca recibe sesiones de otro estudiante aunque compartan módulo (cada uno ve las suyas, con su propio `absent`), una cuenta desactivada recibe `401` o `403` con el código de cuenta y un docente o el CAE reciben `403`

### Implementation for User Story 4

- [X] T029 [P] [US4] Añadir los textos a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`student.schedule.empty.title`, `student.schedule.empty.description`, `student.schedule.empty.action`) y ejecutar `check_i18n.py`
- [X] T030 [US4] Modificar `tutorias_uts_mobile/src/features/student-schedule/screens/StudentScheduleScreen.tsx`: `onPressItem` abre `targetFor('STUDENT', moduleId)` (de `notifications/openTarget.ts`); con `meta.hasEnrollments === false` muestra `EmptyState` con el botón "Explorar módulos" hacia `/(student)/modules` en lugar del calendario; usa `useRefreshOnFocus` (T003) con el `refetch` del calendario

**Checkpoint**: Las cuatro historias funcionan.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Contrato, documentación, decisión, revisión y cierre

- [X] T031 [P] Escribir `tutorias_uts_back/test/student-calendar-contract.e2e-spec.ts` que valide las respuestas reales (con sesiones, vacía, sin periodo y los errores `400`, `401` y `403`) contra `specs/021-student-schedule/contracts/student-calendar-api.yaml` (mismo patrón de `teacher-calendar-contract.e2e-spec.ts` y `test/utils/contract.ts`)
- [X] T032 [P] Añadir a `tutorias_uts_back/test/log-redaction.e2e-spec.ts` que consultar `GET /student/calendar` no escribe nombres de módulos, de docentes ni correos en los registros
- [X] T033 [P] Actualizar `Claude/docs/Context.md` §4.3: el cronograma del estudiante es un calendario semanal de solo lectura con las sesiones de sus módulos, con su estado (programada, reprogramada, cancelada por festivo, por el docente o por él) y navegación por el periodo
- [X] T034 [P] Actualizar `Claude/docs/Architecture.md`: `GET /student/calendar` (rol `STUDENT`, rango de 7 días, `meta` con periodo, horas y `hasEnrollments`), el fragmento `ENROLLED_IN_SESSION` de `seats.ts`, `calendar-meta.ts` compartido y que no hay tablas nuevas
- [X] T035 [P] Actualizar `Claude/docs/Design.md` en "Weekly schedule": el cronograma del estudiante construido (solo lectura, bloque con rango de horas, módulo, salón y docente, estados con "Cancelada por ti", estado vacío con "Explorar módulos", toque al módulo) y que la pestaña ya no está vacía
- [X] T036 Registrar en `Claude/docs/Decisions.md` D-118 (cronograma del estudiante: un endpoint gemelo del del docente, la regla de asistencia partida en dos fragmentos, la sesión omitida se muestra como "Cancelada por ti", la causa de la institución gana sobre la del estudiante, `hasEnrollments` en `meta`, extracciones de `calendar-meta`, `useWeekNavigation` y `useRefreshOnFocus`, sin lista de próximas sesiones y solo lectura), con su motivo y lo descartado
- [X] T037 [P] Comprobar en `tutorias_uts_back` y `tutorias_uts_mobile` que `npm run test`, `npm run lint`, `npm run typecheck` y `check_i18n.py` dan resultado limpio, que no hay hexadecimales, `fontFamily`, `fontWeight` ni librerías de íconos distintas de Iconify en los componentes nuevos, que no queda ninguna importación de `useRefreshOnFocus` en la ruta vieja y que `grep` de `Unidades Tecnológicas` no encuentra nada
- [X] T038 Correr las e2e del backend de `student-calendar*`, `teacher-calendar*`, `enrollments*`, `dashboard*` y `log-redaction` por lotes pequeños con la base de datos de prueba y anotar el resultado; correr `npm test` en la app tres veces seguidas y anotar que no hay fallos
- [ ] T039 Recorrer los 16 escenarios de `specs/021-student-schedule/quickstart.md` en español e inglés con la app y la API en marcha y anotar el resultado en ese archivo, incluidos SC-001 (próxima tutoría en menos de 10 s) y SC-004 (cambio de semana en menos de 2 s)
- [X] T040 Ejecutar la habilidad `feature-done-check` (spec, pruebas, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte
- [ ] T041 Cambiar `Status` de `specs/021-student-schedule/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de la rama `021-student-schedule` a la rama principal: `tutorias_uts_back` y `tutorias_uts_mobile` contra `main` y `Claude` contra `master`; cerrar con un comentario los PRs de la 020 que quedan incluidos (`tutorias_uts_back` #12, `tutorias_uts_front` #11 y `tutorias_claude` #13); `tutorias_uts_db` no lleva PR nuevo porque esta spec no lo cambia

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: sin dependencias; bloquea las historias. T001 y T002 (backend) son independientes de T003 a T006 (app); T005 depende de T004 y T016 depende de T005 y T006.
- **US1** (MVP) depende de la fase 1. **US2** depende de US1 (agrega `absent` al servicio y los estados al mapeo). **US3** y **US4** dependen de US1 y no entre sí.
- **Polish**: depende de las historias que se quieran entregar; T039 a T041 van al final y en ese orden.

### Dentro de cada historia

- Las pruebas primero y deben fallar; luego servicio del backend, hook, mapeo, pantalla, ruta y textos.
- El backend (T011, T012, T021) y la app pueden avanzar a la vez con `contracts/student-calendar-api.yaml` como acuerdo; las pruebas de la app usan respuestas simuladas.

### Parallel Opportunities

- Fase 1: T001 y T002 (backend) en paralelo con T003, T004 y T006 (app).
- US1: T007 a T010 en paralelo; T013 a T015 en paralelo.
- US2: T018 a T020 en paralelo. US3: T024 y T025 en paralelo. US4: T027 y T028 en paralelo.
- Dos personas pueden llevar el backend (T001, T002, T007, T008, T011, T012, T018, T021, T025, T028) y la app (el resto).

### Parallel Example: User Story 1

```text
T007 student-calendar-roles.e2e   T008 student-calendar.e2e   T009 calendarItems.test   T010 StudentScheduleScreen.test
T013 textos es/en                 T014 calendarItems.ts       T015 useStudentCalendar.ts
```

## Implementation Strategy

- **MVP**: Fase 1 y US1 (ver la semana con módulo, salón y docente). Se puede probar y mostrar sola.
- **Entrega incremental**: US2 (estados), luego US3 (navegación) y US4 (módulo y estados vacíos); cada una se prueba sin las siguientes.
- Un commit por tarea o grupo pequeño, en formato Conventional Commits (`feat(student-schedule): ...`, `refactor(calendar): ...`), y la rama `021-student-schedule` en cada repositorio que cambie.
- Las dos extracciones de la fase 1 son refactors puros: se commitean aparte, con las pruebas del docente en verde antes y después.

## Notas de implementación (2026-11-22)

- Hecho: fundamentos, las cuatro historias, contrato, documentación, D-118 y la revisión de calidad. Pendientes: **T039** (recorrido manual de los 16 escenarios) y **T041** (spec en "Implemented" y PRs). T040 (`feature-done-check`) se cumplió con las corridas de abajo.
- **Backend** (commits `f7a5b8f`, `094693a`, `8f222d0` y el de la cuenta desactivada): 285 pruebas unitarias, lint y tipos en verde. e2e: calendario del estudiante, del docente, inscripciones, dashboards, sesiones del docente y logs pasan (39, 61 y 102 pruebas por lotes; roles del estudiante 10 de 10). La prueba "keeps passwords, temporary passwords, codes and tokens out of the logs" de `log-redaction` falló dos veces por "Hook timed out in 10000ms" (la primera dentro de un lote y la segunda sola) y pasó en las dos corridas siguientes (6 de 6); es una espera de arranque, no del contenido.
- **App** (commits `2fc565e`, `a272d31` y `bd56d59`): lint, tipos y paridad es/en (760 claves) en verde; 722 pruebas en 91 suites, tres corridas seguidas sin fallos.
- Las dos extracciones (`calendar-meta.ts` y `useWeekNavigation`) no cambiaron al docente: sus e2e y sus pruebas siguen en verde.
- Se nombró `StudentCalendarSession` en la app porque `StudentSession` ya existía para el detalle del módulo.
- T013: no se agregó la clave `student.schedule.title`; la pestaña ya lleva su título en la barra superior y la pantalla no repite un título. Se agregó `student.schedule.noPeriodHint` para el estado sin periodo.
- T033 a T036: `Context.md` §4.3, `Architecture.md`, `Design.md` y D-118 en `Decisions.md`; `Architecture.md` sigue en LF.
- Las pantallas no se han visto corriendo en un simulador.

