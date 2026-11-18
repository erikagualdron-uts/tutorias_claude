---

description: "Task list for Calendario semanal del docente"
---

# Tasks: Calendario semanal del docente

**Input**: Design documents from `/specs/013-teacher-weekly-calendar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/teacher-calendar-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principio V) y `docs/Conventions.md` §6 exigen pruebas de roles (`403`), contrato y reglas de fechas. Escribirlas primero y comprobar que fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1, US2 y US3 son P1 y van primero; US4 y US5 son P2. No hay cambios en `tutorias_uts_db`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 ver mi semana, US2 moverme entre semanas, US3 estados de cada sesión, US4 abrir la hoja de acciones, US5 vista Día y Semana
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas junto al código en `__tests__/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí (la base de datos de prueba es compartida)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ramas, íconos, textos y tipos compartidos. Sin dependencias nuevas.

- [X] T001 Crear la rama `013-teacher-weekly-calendar` en `tutorias_uts_back` y en `tutorias_uts_mobile` con `git switch -c 013-teacher-weekly-calendar` partiendo de `012-teacher-sessions` (la 013 usa su código: `TeacherSession`, `sessionChangeActions`, `SessionActionsSheet`; hoy ambos repos están en esa rama), y comprobar que `tutorias_uts_db` no necesita rama porque no cambia. El código de la 013 nunca se commitea en la rama 012. Orden de cierre: primero los PRs de la 012; los de la 013 se rebasan sobre `main` cuando la 012 se una
- [X] T002 [P] Agregar al registro `tutorias_uts_mobile/src/icons/registry.ts` (set `solar`, variantes `linear` y `bold` como las demás) los íconos que faltan: `chevronLeft` (`solar:alt-arrow-left-linear`) y `today` (`solar:calendar-mark-linear`); los demás (`chevronRight`, `list`, `dateRange`, `clock`, `schedule`) ya existen. Reiniciar Metro con `npx expo start -c`
- [X] T003 [P] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (claves ordenadas, mismas en ambos) el bloque `calendar.*`: `today`, `previousWeek`, `nextWeek`, `viewDay`, `viewWeek`, `weekRange` (con rango interpolado), `outsidePeriod` ("Fuera del periodo académico" / "Outside the academic period"), `noSessionsDay` ("No hay sesiones este día" / "No sessions this day"), `now`, `students` (plural: "{{count}} estudiante(s)"), `status.scheduled`, `status.rescheduled`, `status.cancelledHoliday`, `status.cancelledTeacher`, `originalTime` ("Hora original {{time}}") y `a11y.*` para los controles; y a `teacher.schedule.*` los títulos de sección "Próximas sesiones" y "Mis módulos". Correr `check_i18n.py` (skill `i18n-strings`)
- [X] T004 [P] Agregar a `tutorias_uts_mobile/src/api/types.ts` los tipos del contrato `teacher-calendar-api.yaml`: `TeacherCalendar` con `data: TeacherSession[]` y `meta: { from, to, period: { id, name, startsOn, endsOn, status: 'ACTIVE' | 'CLOSED' } | null, hours: { earliest, latest }, changeLeadMinutes }`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El endpoint de lectura, las funciones puras de fechas y la consulta por semana. Todas las historias dependen de esto.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase.

### Pruebas (escribirlas primero y ver que fallan)

- [X] T005 [P] Pruebas unitarias de `tutorias_uts_back/src/teacher-sessions/calendar.rules.spec.ts` para `parseCalendarRange(from, to)` y `pickCalendarPeriod(active, lastClosed)`: ambos días obligatorios y válidos (`VALIDATION_FAILED` si no), `to` no anterior a `from`, máximo 7 días inclusivos (el día 7 pasa, el 8 se rechaza), el periodo Activo gana, sin Activo se usa el Cerrado más reciente por fecha de fin, y sin ninguno el resultado es nulo
- [X] T006 [P] Prueba e2e de `GET /teacher/calendar` en `tutorias_uts_back/test/teacher-calendar.e2e-spec.ts` (con `ctx.clock.freezeAt`; ampliar `teacherApi` de `test/utils/teacher.ts` con `calendar(query)`): devuelve sesiones pasadas y futuras de cualquier estado dentro del rango y ninguna fuera; ordenadas por `startsAt` y `id`; solo las del docente del token (las de otro docente no aparecen); las pasadas llevan `blockReason: 'PAST'` y ninguna acción; una sesión de las 23:30 en Bogotá cae en su día de Bogotá aunque en UTC sea el siguiente; `meta.period` es el Activo, el Cerrado más reciente en solo lectura (`blockReason: 'PERIOD_CLOSED'`) o `null` con `data: []` sin ninguno; `meta.hours` coincide con `MODULE_EARLIEST_TIME` y `MODULE_LATEST_TIME`; `400 VALIDATION_FAILED` sin `from` o `to`, con días inválidos, con `to` anterior a `from` y con rango de 8 días
- [X] T007 [P] Prueba e2e de roles en `tutorias_uts_back/test/teacher-calendar-roles.e2e-spec.ts` (mismo patrón de `test/teacher-sessions-roles.e2e-spec.ts`): la lista de endpoints sale de `contracts/teacher-calendar-api.yaml` con `loadContract` y `specPath('013-teacher-weekly-calendar/contracts/teacher-calendar-api.yaml')`; `403 FORBIDDEN_ROLE` para estudiante y para CAE, `401` sin token y el docente pasa
- [X] T008 [P] Prueba de contrato en `tutorias_uts_back/test/teacher-calendar-contract.e2e-spec.ts` (mismo patrón de `test/teacher-sessions-contract.e2e-spec.ts`): la respuesta real cumple `CalendarResponse` y `Error` del contrato y cada código HTTP está documentado
- [X] T009 [P] Pruebas de `tutorias_uts_mobile/src/components/calendar/__tests__/calendarMath.test.ts` para las funciones puras de T014: `weekStartOf(day)` (lunes; domingo y lunes de borde), `weekDaysOf(start)` (7 días), `clampWeek(start, period)` (nunca antes del lunes de `startsOn` ni después del de `endsOn`), `visibleRange(hours, items)` (horas enteras, ampliado si alguna sesión cae fuera), `blockPosition(item, range)` (arriba y alto en proporción, mínimo de alto para 44 px), `layoutOverlaps(items)` (partes iguales si se solapan y ninguna tapa a otra), `daysWithSessions(items)` y `placeInBogota(startsAt)` en tres zonas horarias del dispositivo (UTC, `America/Bogota` y `Asia/Tokyo`) para comprobar que un cambio de día en UTC no mueve la sesión

### Implementación

- [X] T010 Crear `tutorias_uts_back/src/teacher-sessions/calendar.rules.ts` con `parseCalendarRange(from, to)` (reutiliza `parseCalendarDay` de `src/periods/periods.rules.ts`; lanza `AppException(400, 'VALIDATION_FAILED', ...)`; máximo 7 días inclusivos) y `pickCalendarPeriod(active, lastClosed)`; las pruebas de T005 pasan
- [X] T011 [P] Agregar a `tutorias_uts_back/src/teacher-sessions/dto/teacher-sessions.dto.ts` `TeacherCalendarQueryDto` con `from` y `to` obligatorios (`@Matches(/^\d{4}-\d{2}-\d{2}$/)`, `@ApiProperty`)
- [X] T012 Agregar `calendar(teacherId, query)` a `tutorias_uts_back/src/teacher-sessions/teacher-schedule.service.ts`: llama `periods.closeExpired()`, busca el periodo Activo y, si no hay, el Cerrado más reciente (`pickCalendarPeriod`); sin periodo responde `meta.period: null` y `data: []`; consulta `moduleSession` con `teacherId`, `deletedAt: null`, `module: { deletedAt: null, periodId }` y `startsAt` entre `bogotaToUtc(from, 0)` (incluido) y `bogotaToUtc(to + 1 día, 0)` (excluido), sin el límite "desde ahora"; ordena por `startsAt` y `id`; arma la respuesta con el método `views()` existente y `meta` con `from`, `to`, `period` (`id`, `name`, `startsOn`, `endsOn`, `status`), `hours` (`MODULE_EARLIEST_TIME` y `MODULE_LATEST_TIME` de `ConfigService`) y `changeLeadMinutes`
- [X] T013 Agregar a `tutorias_uts_back/src/teacher-sessions/teacher-sessions.controller.ts` `GET calendar` (`@Query() TeacherCalendarQueryDto`, el `userId` del token como docente, nunca de un parámetro; el controlador ya tiene `@Roles('TEACHER')`, `@ApiOperation` y `@ApiResponse`); las pruebas de T006 a T008 pasan
- [X] T014 [P] Crear `tutorias_uts_mobile/src/components/calendar/calendarMath.ts` y `types.ts` con las funciones puras de T009 y el tipo `CalendarItem` (`id`, `title`, `room`, `detail`, `startsAt`, `endsAt`, `status`, `badge`, `strike`); usa `src/date/day.ts` (D-081) y `bogotaParts`; sin librería de fechas; las pruebas de T009 pasan
- [X] T015 [P] Crear `tutorias_uts_mobile/src/features/teacher-sessions/hooks/useTeacherCalendar.ts` con `useTeacherCalendar(from, to)` (clave `['teacher','calendar',from]`, llama `/teacher/calendar?from=&to=`, conserva los datos anteriores mientras carga la semana nueva con `placeholderData` pero marca `isFetching` para no mostrarlos como la semana nueva); `useInvalidateTeacher()` de la 012 ya la invalida
- [X] T016 [P] Crear `tutorias_uts_mobile/src/features/teacher-sessions/calendarItems.ts` con `toCalendarItem(session, t)` que traduce `TeacherSession` a `CalendarItem` (módulo como título, `detail` con los estudiantes, insignia y tachado según estado y motivo) y su prueba en `__tests__/calendarItems.test.ts`

**Checkpoint**: el endpoint responde y está probado; las funciones de fechas y el hook existen.

---

## Phase 3: User Story 1 - Ver mi semana de un vistazo (Priority: P1) 🎯 MVP

**Goal**: El cronograma abre con el calendario de la semana actual (vista Día) y debajo las tarjetas y el resumen de módulos.

**Independent Test**: Con un docente con dos módulos en días distintos, la semana actual muestra la marca en esos dos días, cada día muestra sus sesiones y debajo están las tarjetas.

- [X] T017 [P] [US1] Pruebas de la app en `tutorias_uts_mobile/src/features/teacher-sessions/__tests__/calendar.test.tsx` (mock de `@/api/client` y `expo-router`, reloj fijo en Bogotá, como en `schedule.test.tsx`): semana actual con hoy seleccionado, marca en los días con sesiones, sesiones del día por hora con módulo, horas, salón e inscritos, tocar otro día cambia la lista, día vacío con "No hay sesiones este día", línea de hora actual solo en hoy y dentro del rango, sin módulos muestra el estado vacío, y el orden de la pantalla (calendario, tarjetas y resumen de módulos, FR-018); también estados de carga y error con reintento
- [X] T018 [P] [US1] Crear `tutorias_uts_mobile/src/components/calendar/SessionBlock.tsx`: bloque con relleno y borde izquierdo de 4 px según tokens del tema, radio 8, relleno 8, alto mínimo de 44 px, rango de horas, título, salón y `detail`; objetivo táctil de 48 px (`MIN_TOUCH_TARGET`), `accessibilityLabel` con todos los datos, texto acortado con `numberOfLines`; sin colores nuevos
- [X] T019 [P] [US1] Crear `tutorias_uts_mobile/src/components/calendar/DayStrip.tsx`: siete píldoras (inicial del día y número, con formato del idioma), hoy con aro, día elegido relleno, punto bajo los días con sesiones (`daysWithSessions`), cada una con objetivo de 48 px y `accessibilityState.selected`; el hoy y el elegido se distinguen sin depender solo del color (FR-002)
- [X] T020 [P] [US1] Crear `tutorias_uts_mobile/src/components/calendar/NowLine.tsx`: línea de 2 px con punto de 8 px con el token de error del tema, posicionada por la hora actual de Bogotá, con etiqueta accesible `calendar.now`
- [X] T021 [US1] Crear `tutorias_uts_mobile/src/components/calendar/DayTimeline.tsx`: filas de hora de 64 px con etiquetas en el estilo de metadatos, los bloques posicionados con `blockPosition` y `layoutOverlaps`, la `NowLine` solo si es hoy y la hora cae en el rango, y el estado vacío con `EmptyState` y `calendar.noSessionsDay`; el rango sale de `visibleRange(meta.hours, items)` (FR-017); desplazamiento vertical sin perder la cabecera
- [X] T022 [US1] Crear `tutorias_uts_mobile/src/components/calendar/WeekCalendar.tsx` (por ahora solo vista Día): recibe `weekStart`, `selectedDay`, `items`, `hours`, `onSelectDay`, `onPressItem` y renderiza `DayStrip` y `DayTimeline`; sin conocimiento del docente (FR-015); animación corta con `FadeInView` que respeta "reducir movimiento"
- [X] T023 [US1] Actualizar `tutorias_uts_mobile/src/features/teacher-sessions/screens/TeacherScheduleScreen.tsx`: calendario arriba (con `useTeacherCalendar` de la semana actual, `toCalendarItem` y `BrandLoader`/error con reintento/vacío), luego la sección "Próximas sesiones" con las tarjetas de la 012 y al final "Mis módulos" con el resumen y su filtro (FR-018); las tarjetas siguen usando `useTeacherSessions` y no cambian con el calendario (FR-008); las pruebas de T017 pasan

**Checkpoint**: el docente ve su semana (vista Día) con el resto de la pantalla como antes.

---

## Phase 4: User Story 2 - Moverme entre semanas (Priority: P1)

**Goal**: Flechas, "Hoy" y límite del periodo.

**Independent Test**: Avanzar y retroceder hasta los extremos del periodo; más allá la flecha no avanza y se lee "Fuera del periodo académico"; "Hoy" regresa.

- [X] T024 [P] [US2] Ampliar `calendar.test.tsx`: la flecha siguiente muestra la semana siguiente con su rango y su `selectedDay` dentro de ella; "Hoy" vuelve a la semana actual con hoy seleccionado; en la primera y la última semana la flecha no avanza y aparece "Fuera del periodo académico"; una semana pasada se ve en solo lectura; si hoy cae fuera del periodo el calendario abre en la semana del periodo más cercana y sin línea de hora actual; una falla de red al cambiar de semana muestra el error con reintento y no deja la semana anterior como si fuera la nueva; "hoy" se recalcula al volver a la pantalla
- [X] T025 [US2] Crear `tutorias_uts_mobile/src/components/calendar/CalendarHeader.tsx`: rango de la semana con el formato del idioma (`calendar.weekRange`), flechas `chevronLeft` y `chevronRight` como botones solo de ícono de 48 px con etiqueta accesible, botón tonal "Hoy" con ícono `today` a la izquierda, y el aviso `calendar.outsidePeriod` cuando la flecha está desactivada por el límite; botones apilados con 16 px entre sí si el ancho obliga
- [X] T026 [US2] Agregar la navegación a `TeacherScheduleScreen.tsx` y `WeekCalendar.tsx`: estado `weekStart` y `selectedDay` según `data-model.md` (`clampWeek` con `meta.period`; al cambiar de semana el mismo día de la semana o hoy si está en ella), consulta por semana con `useTeacherCalendar`, "Hoy" recalculado con `todayInBogota()`, y la lógica de abrir en la semana del periodo más cercana cuando hoy queda fuera; las pruebas de T024 pasan

**Checkpoint**: se puede navegar por todo el periodo.

---

## Phase 5: User Story 3 - Ver el estado de cada sesión en el calendario (Priority: P1)

**Goal**: Programada, reprogramada y cancelada visibles por texto e ícono.

**Independent Test**: Reprogramar una sesión y cancelar otra; el calendario las muestra con su estado sin recarga manual.

- [X] T027 [P] [US3] Ampliar `calendar.test.tsx` y `calendarItems.test.ts`: la reprogramada aparece en su hora nueva con la insignia "Reprogramada" y la hora original; la cancelada por festivo o por el docente sigue visible, tachada, con insignia y motivo; ninguna depende solo del color (hay texto e ícono); un festivo deja las sesiones del día canceladas y el día conserva su marca; en un periodo Cerrado no hay acciones; tras reprogramar a otro día de la semana la sesión sale del día original y aparece en el nuevo (invalidación de `['teacher']`)
- [X] T028 [US3] Completar `SessionBlock.tsx` y `toCalendarItem` con los estados: insignia de advertencia "Reprogramada" con la nueva hora y la original (`calendar.originalTime`), insignia de error "Cancelada" con su motivo y texto tachado, borde izquierdo de error en las canceladas y estado también por ícono del registro (`reschedule` y `error`/`closeCircle`); sin colores nuevos y con el texto de `calendar.status.*`; las pruebas de T027 pasan

**Checkpoint**: los tres estados se leen sin color.

---

## Phase 6: User Story 4 - Abrir una sesión desde el calendario (Priority: P2)

**Goal**: Tocar un bloque abre la hoja de acciones de la spec 012.

**Independent Test**: Tocar una sesión a más de 2 horas ve las acciones; una a menos de 2 horas ve el bloqueo con su regla.

- [X] T029 [P] [US4] Ampliar `calendar.test.tsx`: tocar un bloque abre `SessionActionsSheet` con los datos de esa sesión y las acciones que permiten las banderas del servidor; una sesión a menos de 2 horas o de un periodo Cerrado no ofrece acciones y muestra la regla que bloquea; tras confirmar un cambio, el calendario y las tarjetas se refrescan sin recargar a mano
- [X] T030 [US4] Conectar `onPressItem` de `WeekCalendar` con `setPicked` de `TeacherScheduleScreen.tsx` para abrir la hoja existente `SessionActionsSheet` por el id de la sesión (sin segunda vía de cambio, FR-009), buscando la sesión en los datos del calendario o de las tarjetas; verificar que `useInvalidateTeacher()` refresca el calendario (FR-010); las pruebas de T029 pasan

**Checkpoint**: el calendario es un acceso más a las acciones de la 012.

---

## Phase 7: User Story 5 - Cambiar entre la vista Día y la vista Semana (Priority: P2)

**Goal**: Selector Día/Semana; vista Semana de 7 columnas.

**Independent Test**: En un teléfono y en una ventana ancha, comprobar la vista inicial, cambiar de vista y navegar semanas con la elegida.

- [X] T031 [P] [US5] Ampliar `calendar.test.tsx` y crear `tutorias_uts_mobile/src/components/__tests__/SegmentedControl.test.tsx`: la vista inicial es Día con ancho menor de 600 dp y Semana con 600 dp o más (mock de `useWindowDimensions`); el selector cambia de vista; la vista se conserva al navegar semanas y al tocar "Hoy"; la vista Semana muestra siete columnas con bloques de hora y salón y abre la misma hoja al tocar un bloque; objetivos de 48 px y estado seleccionado accesible
- [X] T032 [P] [US5] Crear `tutorias_uts_mobile/src/components/SegmentedControl.tsx`: control genérico de opciones con ícono a la izquierda y texto, opción seleccionada rellena con tokens del tema, objetivo de 48 px, `accessibilityRole="tab"`/`selected`; usa `list` (Día) y `dateRange` (Semana) del registro
- [X] T033 [US5] Crear `tutorias_uts_mobile/src/components/calendar/WeekGrid.tsx`: siete columnas con desplazamiento horizontal, cabecera de día con marca y hoy resaltado, bloques compactos (hora y salón) posicionados con `blockPosition` y `layoutOverlaps`, `NowLine` en la columna de hoy y el mismo rango visible; los textos acortados y la hoja se abren al tocar
- [X] T034 [US5] Agregar el selector y la vista inicial por ancho (`useWindowDimensions`, umbral de 600 dp en una constante de `src/theme/`) a `CalendarHeader.tsx`, `WeekCalendar.tsx` y `TeacherScheduleScreen.tsx`; la vista se guarda en estado local mientras la pantalla está abierta; las pruebas de T031 pasan

**Checkpoint**: las dos vistas funcionan y se conservan al navegar.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T035 [P] Actualizar `docs/Design.md`: ajustar "Weekly schedule (all roles)" a lo implementado (selector Día/Semana, umbral de 600 dp, rango de horas desde configuración, estado por texto e ícono) y el párrafo del cronograma del docente (calendario arriba, tarjetas y resumen de módulos); `docs/Architecture.md`: el endpoint `GET /teacher/calendar` y `components/calendar/`; `docs/Context.md` §4.2: el calendario semanal del docente con sus dos vistas
- [X] T036 [P] Registrar en `docs/Decisions.md` (CRLF) la decisión nueva: endpoint por rango separado de `/teacher/sessions`, periodo Activo o último Cerrado en solo lectura, horas permitidas desde el servidor y calendario reutilizable en `components/calendar/`; la deuda conocida de que `EARLIEST_TIME` y `LATEST_TIME` de `features/modules/schemas.ts` siguen fijos en la app (R-3); y la **renumeración**: la spec de notificaciones pasa a ser la **014**. Procedimiento: (1) listar con `grep -rn "spec 013" docs/Decisions.md specs/010-modules-sessions specs/011-student-enrollment specs/012-teacher-sessions` (hoy unas 37 coincidencias en `Decisions.md` y en `spec.md`, `plan.md`, `research.md`, `quickstart.md` y `tasks.md` de las tres specs); (2) revisar cada coincidencia y cambiar a "spec 014" solo las que se refieren a las notificaciones, conservando CRLF; (3) **no tocar** `specs/013-teacher-weekly-calendar/` (su supuesto explica la renumeración), ni `D-013` ("Una sola institución") ni otras coincidencias de "013" que no sean "spec 013"; (4) dejar escrito en la 012 (`tasks.md` T052) que la condición de D-087 de sus PRs menciona la spec 014; (5) repetir el `grep` y confirmar que no quedan "spec 013" de notificaciones
- [X] T037 Verificar que ningún componente nuevo contiene textos fijos, colores hexadecimales, nombres de fuente ni íconos fuera del registro (pruebas existentes en `tutorias_uts_mobile/src/__tests__/`), que `es.json` y `en.json` tienen las mismas claves, y revisar objetivos de 48 px, ícono a la izquierda en cada botón (salvo los solo de ícono), 16 px entre botones apilados, los cuatro estados de pantalla, modo oscuro, fuente grande y "reducir movimiento" (depende de las historias de la app)
- [X] T038 Ejecutar todas las verificaciones de `quickstart.md`: `npm run test`, `npm run test:e2e` y `npm run lint` en `tutorias_uts_back`; `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`. Correr cada comando solo (sin otros procesos en paralelo)
- [X] T039 Recorrer `specs/013-teacher-weekly-calendar/quickstart.md` de punta a punta en español e inglés, con modo oscuro, fuente grande y "reducir movimiento", incluida la medición de SC-001 y SC-002 y la prueba de SC-004 con docentes, y anotar los resultados con fecha en la sección "Resultados". Si hay íconos nuevos, reiniciar Metro con `npx expo start -c`
- [ ] T040 Ejecutar la skill `feature-done-check`, atender sus observaciones, marcar `Status` de la spec como implementada y abrir los Pull Requests de `tutorias_uts_back`, `tutorias_uts_mobile` y `Claude` solo con la autorización del equipo (`tutorias_uts_db` no cambia)

---

## Dependencies & Execution Order

- **Phase 1**: T001 (ramas) va primero y solo; T002 a T004 no dependen de nada y son paralelas entre sí.
- **Phase 2** depende de la Phase 1 solo para los tipos (T004): las pruebas T005 a T009 van primero y deben fallar; T010 a T013 (backend) en orden; T014 a T016 (app) en paralelo con el backend.
- **US1** (T017 a T023) depende de la Phase 2; es el MVP.
- **US2** (T024 a T026) depende de US1 (usa `WeekCalendar` y la pantalla).
- **US3** (T027, T028) depende de US1; puede ir en paralelo con US2.
- **US4** (T029, T030) depende de US1; puede ir en paralelo con US2 y US3.
- **US5** (T031 a T034) depende de US1 y US2 (cabecera y navegación).
- **Polish** (T035 a T040) al final; T035 y T036 pueden ir en paralelo desde que termina US1.

### Parallel opportunities

- Phase 1: T002, T003 y T004.
- Phase 2: T005 a T009 juntas; T011 con T010; T014 a T016 con T010 a T013.
- US1: T017 a T020 juntas (T021 y T022 dependen de T018 a T020).
- US5: T031 y T032 juntas.
- Polish: T035 y T036.

## Implementation Strategy

1. **MVP**: Phase 1, Phase 2 y US1 (T001 a T023): el docente ya ve su semana en la vista Día con el resto de la pantalla. Detenerse y validar.
2. Agregar US2 (navegar), US3 (estados) y US4 (hoja de acciones) en cualquier orden; las tres son P1/P2 y comparten solo los componentes de US1.
3. Terminar con US5 (vista Semana) y el cierre (T035 a T040).
4. Un commit por historia en Conventional Commits (`feat(teacher-calendar): ...`) en inglés.
