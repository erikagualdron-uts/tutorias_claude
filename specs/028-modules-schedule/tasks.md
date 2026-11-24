# Tasks: Módulos y horario renovados

**Input**: `specs/028-modules-schedule/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden de forma implícita en la spec (FR-003, FR-010, SC-003, SC-006) y por la constitución (V aplicada en el plan): la guarda se escribe antes de corregir y debe fallar con el código actual (6 archivos).

**Repositorios**: código en `tutorias_uts_mobile` (rama `028-modules-schedule`, desde `027-entry-front-page`); documentos en `Claude` (rama `028-modules-schedule`, ya creada desde `027-entry-front-page`). Backend y base de datos no se tocan.

## Formato: `[ID] [P?] [Story] Descripción`

Rutas del front relativas a `tutorias_uts_mobile/`; las de documentos, a `Claude/`.

## Phase 1: Setup

- [X] T001 En `tutorias_uts_mobile`, comprobar que la rama `028-modules-schedule` (desde `027-entry-front-page`, PR #17 abierto) está activa y que `npm test`, `npm run lint` y `npm run typecheck` pasan antes de cambiar nada.

---

## Phase 2: Foundational (guardas primero; bloquea las historias)

**Propósito**: la regla y la guarda que fijan «indicador = rol de texto de severidad; relleno = rol de relleno».

- [X] T002 [P] En `docs/Design.md`, sección "Component states", agregar la regla (FR-012: primero el documento): un ícono, línea o relleno de barra que indica un estado usa `errorText`, `warningText`, `successText` o `primary` (3:1); los roles `error`, `warning` y `success` son solo para rellenos (botones, avisos, insignia numérica). Ejecutar `npx jest src/theme/__tests__/designDoc.test.ts`.
- [X] T003 En `src/testing/contrastPairs.ts` agregar a `ICON_PAIRS` los pares de indicador sobre `surface` y `screen` con 3:1 (`ICON_RATIO`): `errorText`, `warningText` y `primary` (hoy solo sobre `card`), en ambos modos. Ejecutar `npx jest src/theme`: deben pasar (confirma que los roles de texto sirven como indicador, `research.md` R-1).
- [X] T004 Crear `src/theme/__tests__/severityIndicators.test.ts` con el patrón de `noLooseColors.test.ts`: recorrer las carpetas `src/components/calendar`, `src/features/enrollments`, `src/features/student-schedule`, `src/features/teacher-sessions` y el archivo `src/features/dashboard/components/CapacityBar.tsx`, y fallar si alguna línea no comentada contiene `palette.error`, `palette.warning` o `palette.success` seguido de un límite de palabra (`\b`; `errorText` y `errorPressed` no coinciden). La lista de rutas es una constante con un comentario «cada fase añade sus carpetas». Ejecutarla: debe fallar con los 6 archivos con color de severidad de `research.md` R-1 (el borde de `DayStrip`, de rol `border`, lo cubre T015; constitución V).

**Checkpoint**: la guarda falla con los usos actuales y la regla está documentada.

---

## Phase 3: User Story 1 - Explorar módulos con claridad (Priority: P1)

**Goal**: lista y detalle de módulos con indicadores legibles en ambos modos.

**Independent Test**: lista y detalle con módulos disponibles, últimos cupos, llenos, con cruce e inscritos, en claro y oscuro; pruebas de inscripción verdes.

- [X] T005 [US1] En `src/features/enrollments/components/OfferCard.tsx` usar `palette.warningText` como relleno de la barra de cupo entre 80 y 99 % (línea del `barColor`). Dejar un solo mapa de colores de insignia (`badgeText`, que ya tiene `warningText` para `LAST_SPOTS` y `errorText` para `BLOCKED`) y usarlo también para `borderColor`; eliminar el mapa `badge` duplicado. `AVAILABLE` (`primary`), `ENROLLED` (`link`) y `FULL` (`textSecondary`) no cambian. `palette.textSecondary` (lleno) y `palette.primary` (menos de 80 %) tampoco.
- [X] T006 [US1] En `src/features/dashboard/components/CapacityBar.tsx` usar `palette.warningText` en lugar de `palette.warning` para el relleno entre 80 y 99 % (barra compartida con los tableros; el resto no cambia).
- [X] T007 [P] [US1] En `src/features/enrollments/__tests__/offer.test.tsx` agregar: (a) el orden de la tarjeta, comprobando la secuencia de textos nombre y estado (misma fila), docente, horario, sala y cupo (FR-002); (b) en oscuro, el relleno de la barra con 80 a 99 % es `darkPalette.warningText` y el borde de la insignia «últimos cupos» coincide con el color de su texto; (c) en claro, lo mismo con `lightPalette.warningText`. Usar `jest.spyOn(ReactNative, 'useColorScheme')` como en `darkMode.test.tsx`.
- [X] T008 [P] [US1] En `src/features/dashboard/__tests__/components.test.tsx` agregar que `CapacityBar` entre 80 y 99 % pinta el relleno con `warningText` del modo (claro y oscuro).
- [X] T009 [US1] Auditar con las 8 reglas de `Design.md` las rutas `app/(student)/modules/index.tsx` y `app/(student)/modules/[id].tsx` (pantallas `StudentModulesScreen` y `StudentModuleDetailScreen`): registro sobrio (sin degradado ni patrón), un solo botón primario por área, regla visible en el botón bloqueado (FR-008), espaciado de la escala; incluir `CancelSheet` (hoja de cancelación: botones, borde de controles `controlBorder`, texto con 4.5:1). Anotar el resultado (cumple, o defecto con causa y corrección) en `specs/026-design-system/screen-inventory.md` y corregir solo lo que se anote.

**Checkpoint**: módulos del estudiante cumplen las reglas en ambos modos.

---

## Phase 4: User Story 2 - Un horario legible y coherente entre roles (Priority: P1)

**Goal**: el mismo calendario, con los mismos indicadores de estado, para estudiante y docente.

**Independent Test**: horario de estudiante y de docente con sesiones programadas, reprogramadas y canceladas y con la hora actual, en claro y oscuro.

- [X] T010 [US2] En `src/components/calendar/SessionBlock.tsx` cambiar la constante `accent` (línea 22) a `cancelled ? palette.errorText : moved ? palette.warningText : palette.primary`; la línea izquierda y el ícono de estado usan ese color.
- [X] T011 [P] [US2] En `src/features/teacher-sessions/components/TeacherSessionCard.tsx` cambiar la constante `color` (línea 20) a `cancelled ? palette.errorText : moved ? palette.warningText : palette.primary` (línea, ícono e insignia).
- [X] T012 [P] [US2] En `src/components/calendar/NowLine.tsx` usar `palette.errorText` en el punto y en la línea (hoy `palette.error`).
- [X] T013 [P] [US2] En `src/components/calendar/DayStrip.tsx` usar `palette.controlBorder` como borde del día sin seleccionar y sin ser hoy (línea 49: `isToday || isSelected ? palette.primary : palette.controlBorder`); el día de hoy (2 px `primary`) y el seleccionado (relleno `primary`) no cambian.
- [X] T014 [P] [US2] Crear `src/components/calendar/__tests__/calendarColors.test.tsx`: renderizar `SessionBlock` cancelada, reprogramada y programada, y `NowLine`, en claro y oscuro, y comprobar que el color del ícono y de la línea es `errorText`, `warningText`, `primary` y `errorText` del modo (FR-003, FR-005).
- [X] T015 [US2] En el mismo archivo agregar que `DayStrip` pinta con `controlBorder` del modo el borde de un día sin seleccionar (FR-007), y que `TeacherSessionCard` usa los mismos colores de estado que `SessionBlock` (FR-004).
- [X] T016 [US2] Verificar que `StudentScheduleScreen` y `TeacherScheduleScreen` siguen montando el mismo `WeekCalendar` (FR-004, SC-004) y auditar las dos rutas (`app/(student)/schedule.tsx` y `app/(teacher)/schedule/index.tsx`) con las 8 reglas, más `SessionActionsSheet` y los chips del horario del docente (botones, borde de controles `controlBorder`, texto con 4.5:1; FR-007); anotar el resultado en `screen-inventory.md` y corregir solo lo que se anote.

**Checkpoint**: estudiante y docente comparten calendario e indicadores.

---

## Phase 5: User Story 3 - Estados de lista y de carga consistentes (Priority: P2)

**Goal**: vacío, carga y error con las piezas compartidas en las 4 pantallas.

**Independent Test**: provocar vacío, carga y error en cada pantalla.

- [X] T017 [US3] Comprobar con las pruebas existentes (`offer.test.tsx`, `StudentScheduleScreen.test.tsx`, `schedule.test.tsx`) que las 4 pantallas muestran `EmptyState`, `BrandLoader` y `Banner` con reintento; donde falte la prueba de un estado, agregar una en la misma carpeta sin cambiar los textos esperados. Anotar en `screen-inventory.md` (FR-006).
- [X] T018 [P] [US3] En `src/components/__tests__/darkMode.test.tsx` agregar `OfferCard` (con una oferta de ejemplo) y `SessionBlock` a `samples`, para que la guarda de modo oscuro cubra estas piezas (colores solo de `darkPalette`).

**Checkpoint**: estados consistentes.

---

## Phase 6: Polish y documentos

- [X] T019 Ejecutar `npx jest src/theme/__tests__/severityIndicators.test.ts`: debe pasar sin usos restantes. Ejecutar `npm test`, `npm run lint` y `npm run typecheck` completos; confirmar SC-005 y SC-006 (0 textos o reglas de negocio cambiados, guardas de las 026 y 027 en verde, incluidas las pruebas de chips y botones de la 027, `FilterChips.test.tsx` y `darkMode.test.tsx`, que cubren US1 escenario 2).
- [X] T020 [P] En `docs/Decisions.md` agregar D-125 (indicadores con roles de texto de severidad, relleno con roles de relleno, `controlBorder` en los días, guarda por fase), con su motivo y alternativas descartadas (R-1, R-2).
- [X] T021 [P] Completar `specs/026-design-system/screen-inventory.md`: estado de cada una de las 4 pantallas de la fase 2 en claro y oscuro, los 7 usos corregidos y los usos de `error`, `warning` y `success` que quedan en las fases 3 y 4 (`AppBar`, `AccountCard`, `StatusStackBar`, `StatusBadge`, `PqrsFiledScreen`, `SmtpSettingsScreen`), para que esas fases los traten.
- [X] T022 [manual, usuario] Recorrido de `quickstart.md` en el teléfono: las 4 pantallas en claro y oscuro, español e inglés, con módulos de todos los estados y sesiones canceladas, reprogramadas y la hora actual; cambio de modo con cada pantalla abierta (SC-002, SC-007).
- [X] T023 Marcar la spec como implementada (`Status` en `spec.md`) cuando T022 esté confirmado.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002 a T004)**: T004 debe fallar antes de cualquier corrección.
- **US1 (T005–T009)** y **US2 (T010–T016)** son independientes entre sí y pueden ir en paralelo tras la Foundational.
- **US3 (T017–T018)** después de US1 y US2 (T018 incluye piezas que ellas tocan).
- **Polish (T019–T023)** al final; T020 y T021 pueden empezar tras US2.

## Parallel Opportunities

- Foundational: T002 en paralelo con T003.
- US1: T007 y T008 en paralelo tras T005 y T006.
- US2: T011, T012 y T013 en paralelo con T010; T014 y T015 escriben el mismo archivo: van en orden.
- Polish: T020 y T021 en paralelo.

## Implementation Strategy

- **MVP**: Foundational + US2 (T001–T004 y T010–T016): corrige los indicadores del calendario, que se ven a diario en dos roles, y deja la guarda en verde.
- **Incremento 2**: US1 (barras e insignias de módulos).
- **Incremento 3**: US3 y cierre (estados, documentos, inventario y recorrido manual).
