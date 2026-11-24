# Tasks: Cabecera de marca en estudiante y docente

**Input**: `specs/031-student-teacher-header/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden de forma implícita en la spec (FR-001, FR-002, FR-008, SC-001) y por la constitución (V aplicada en el plan): la guarda se amplía antes de implementar y debe fallar con las 3 pantallas.

**Repositorios**: código en `tutorias_uts_mobile` (rama `031-student-teacher-header`, desde `030-chat-pqrs-profile`); documentos en `Claude` (rama `031-student-teacher-header`, ya creada desde `030-chat-pqrs-profile`). Backend y base de datos no se tocan.

## Formato: `[ID] [P?] [Story] Descripción`

Rutas del front relativas a `tutorias_uts_mobile/`; las de documentos, a `Claude/`.

## Phase 1: Setup

- [X] T001 En `tutorias_uts_mobile`, comprobar que la rama `031-student-teacher-header` (desde `030-chat-pqrs-profile`) está activa y que `npm test`, `npm run lint` y `npm run typecheck` pasan antes de cambiar nada.

---

## Phase 2: Foundational (documento y guarda primero; bloquea las historias)

- [X] T002 [P] En `docs/Design.md`: (a) en "Visual registers", fila **Sober with header**, agregar a las pantallas la lista de módulos del estudiante y los horarios (calendario) del estudiante y del docente; (b) en la fila **Sober**, quitar «schedule» de la lista de pantallas para que el horario no figure en dos registros y dejar «module and session detail» (siguen sin cabecera). Ejecutar `npx jest src/theme/__tests__/designDoc.test.ts`.
- [X] T003 [P] En `src/theme/__tests__/headerBudget.test.ts` agregar a `WITH_HEADER` `src/features/enrollments/screens/StudentModulesScreen.tsx`, `src/features/student-schedule/screens/StudentScheduleScreen.tsx` y `src/features/teacher-sessions/screens/TeacherScheduleScreen.tsx`, y a `FORMS` `src/features/enrollments/screens/StudentModuleDetailScreen.tsx` (sobrio sin cabecera). Ejecutarla: debe fallar con las 3 pantallas con cabecera (constitución V).

**Checkpoint**: el documento define las pantallas y la guarda falla con el código actual.

---

## Phase 3: User Story 1 - Cabecera de marca en los módulos del estudiante (Priority: P1)

**Goal**: la lista de módulos con la cabecera compacta (título y número).

**Independent Test**: lista con módulos, vacía, cargando y con error, en claro y oscuro; `headerBudget` pasa para esta pantalla.

- [X] T004 [US1] En `src/features/enrollments/screens/StudentModulesScreen.tsx` (línea 31) reemplazar el `<Text screenTitle>` de `student.modules.title` por `<ScreenHeader title={t('student.modules.title')} count={segment === 'available' ? offer.data?.data.length : undefined} />` (import de `@/components/ScreenHeader`; quitar `Text` y `typography` de los imports si quedan sin uso).
- [X] T005 [US1] Ampliar `src/features/enrollments/__tests__/offer.test.tsx` y `my-enrollments.test.tsx`: la cabecera muestra el título existente (`getByRole('header', { name: i18n.t('student.modules.title') })`); en el segmento «disponibles» muestra el número de módulos (esperar primero un módulo con `findByText` y luego `getByText` del número, como en la spec 030); en «mis módulos» no muestra número (`queryByText(/^\d+$/)` nulo en la cabecera). Sin cambiar las demás aserciones. Ejecutar `npx jest src/features/enrollments src/theme/__tests__/headerBudget.test.ts`: la pantalla de módulos pasa la guarda.

**Checkpoint**: módulos del estudiante con cabecera.

---

## Phase 4: User Story 2 - Cabecera en los horarios sin recargar el calendario (Priority: P1)

**Goal**: cabecera de marca encima del calendario del estudiante y del docente.

**Independent Test**: horario de cada rol con sesiones y sin ellas, en vista de día y de semana; el calendario no cambia.

- [X] T006 [P] [US2] En `src/features/student-schedule/screens/StudentScheduleScreen.tsx` agregar `<ScreenHeader title={t('tabs.schedule')} />` como primer hijo del `ScrollView`, encima de la `Card` del calendario (import de `@/components/ScreenHeader`).
- [X] T007 [P] [US2] En `src/features/teacher-sessions/screens/TeacherScheduleScreen.tsx` (línea 57) reemplazar el `<Text screenTitle>` de `teacher.schedule.title` por `<ScreenHeader title={t('teacher.schedule.title')} />` (quitar imports sin uso).
- [X] T008 [US2] Ampliar `src/features/student-schedule/__tests__/StudentScheduleScreen.test.tsx` y `src/features/teacher-sessions/__tests__/schedule.test.tsx`: cada horario muestra la cabecera con su título existente (`getByRole('header', { name })`) y ningún número; el calendario se sigue mostrando (la prueba existente de la semana actual pasa sin cambio). Ejecutar `npx jest src/features/student-schedule src/features/teacher-sessions src/theme/__tests__/headerBudget.test.ts`: deben pasar y `headerBudget` queda en verde.
- [X] T009 [US2] Verificar que `WeekCalendar`, `CalendarHeader`, la navegación de semana y las vistas de día y de semana no se tocaron (`git diff` solo en las 3 pantallas y los archivos de prueba) y que sus pruebas (`calendarMath.test.ts`, `useWeekNavigation.test.tsx`, `calendar.test.tsx`) siguen sin cambio y en verde (FR-003, FR-007).

**Checkpoint**: los dos horarios con cabecera y el calendario intacto.

---

## Phase 5: User Story 3 - Consistencia entre estudiante y docente (Priority: P2)

**Goal**: las pantallas con cabecera de estudiante, docente y administración comparten estructura, y el detalle y los inicios se mantienen.

**Independent Test**: comparar las pantallas en claro y oscuro con la lista de reglas.

- [X] T010 [US3] Auditar con las 8 reglas de `Design.md` (y el registro «sobrio con cabecera») `StudentModulesScreen`, `StudentScheduleScreen` y `TeacherScheduleScreen`: un solo bloque de color por pantalla, ningún patrón, un solo botón primario por área, espaciado 16/12/24 px, estado vacío, carga y error con las piezas compartidas debajo de la cabecera; y confirmar que `StudentModuleDetailScreen` y los inicios siguen en su registro. Anotar el resultado (cumple, o defecto con causa y corrección) en `specs/026-design-system/screen-inventory.md` y corregir solo lo que se anote.
- [X] T011 [P] [US3] En `src/components/__tests__/darkMode.test.tsx` no agregar nada si `ScreenHeader` ya está en `samples` (lo agregó la spec 029); si falta, agregarlo con `count={3}`. Confirmar con `npx jest src/components/__tests__/darkMode.test.tsx` que pasa.

**Checkpoint**: consistencia comprobada y piezas cubiertas en oscuro.

---

## Phase 6: Polish y documentos

- [X] T012 Ejecutar `npm test`, `npm run lint` y `npm run typecheck` completos en `tutorias_uts_mobile`; confirmar SC-004 y SC-005 (0 textos o reglas de negocio cambiados, guardas de las specs 026 a 030 en verde).
- [X] T013 [P] En `docs/Decisions.md` agregar D-128 (cabecera de marca en módulos del estudiante y en los dos horarios, dentro del área que se desplaza para no restar altura al calendario, detalle de módulo e inicios sin cabecera, guarda ampliada), con su motivo y alternativas descartadas (R-1, R-3).
- [X] T014 [P] Completar `specs/026-design-system/screen-inventory.md`: estado de las 3 pantallas en claro y oscuro y una línea indicando que el detalle de módulo y los inicios siguen en su registro.
- [X] T015 [manual, usuario] Recorrido de `quickstart.md` en el teléfono: las 3 pantallas en claro y oscuro, español e inglés, vista de día y de semana, con y sin sesiones e inscripciones, comprobando que la vista del día muestra las primeras horas sin desplazar en un teléfono de unos 640 px (SC-003); si no se ve, avisarme para reducir el relleno de la cabecera solo en estas pantallas (SC-002, SC-006).
- [X] T016 Marcar la spec como implementada (`Status` en `spec.md`) cuando T015 esté confirmado.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational**: T002 y T003 en paralelo.
- **US1 (T004–T005)** y **US2 (T006–T009)** son independientes entre sí y necesitan solo T003: T004, T006 y T007 en paralelo; T005 después de T004; T008 y T009 después de T006 y T007.
- **US3 (T010–T011)** después de US1 y US2.
- **Polish (T012–T016)** al final; T013 y T014 pueden empezar tras US2.

## Parallel Opportunities

- Foundational: T002 y T003 en paralelo.
- US1 y US2 en paralelo entre sí; dentro de US2: T006 y T007.
- Polish: T013 y T014 en paralelo.

## Implementation Strategy

- **MVP**: Foundational + US2 (T001–T003 y T006–T009): el horario es lo que la persona dueña del producto nombró primero («el calendario, las tutorías») y es donde está el riesgo de espacio.
- **Incremento 2**: US1 (módulos del estudiante).
- **Incremento 3**: US3 y cierre (auditoría, documentos y recorrido manual).
