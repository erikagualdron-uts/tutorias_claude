# Tasks: Administración del CAE renovada

**Input**: `specs/029-admin-screens/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden de forma implícita en la spec (FR-002, FR-003, FR-013, FR-014, SC-003, SC-008) y por la constitución (V aplicada en el plan): las guardas se escriben antes de corregir y deben fallar con el código actual.

**Repositorios**: código en `tutorias_uts_mobile` (rama `029-admin-screens`, desde `028-modules-schedule`); documentos en `Claude` (rama `029-admin-screens`, ya creada desde `028-modules-schedule`). Backend y base de datos no se tocan.

## Formato: `[ID] [P?] [Story] Descripción`

Rutas del front relativas a `tutorias_uts_mobile/`; las de documentos, a `Claude/`.

## Phase 1: Setup

- [X] T001 En `tutorias_uts_mobile`, comprobar que la rama `029-admin-screens` (desde `028-modules-schedule`, PR #18 abierto) está activa y que `npm test`, `npm run lint` y `npm run typecheck` pasan antes de cambiar nada.

---

## Phase 2: Foundational (documento y guardas primero; bloquea las historias)

**Propósito**: el registro nuevo en `Design.md` (FR-012), la pieza `ScreenHeader` y las guardas que fallan con el código actual.

- [X] T002 [P] En `docs/Design.md`: (a) en "Visual registers" agregar el registro **Sober with header** (listas de administración, cambios e índice de «Más»: un solo `ScreenHeader` compacto de degradado de marca arriba, con título, línea lima de 4 px y número opcional; sin `BrandPattern`; el resto igual que el sobrio); (b) ajustar la regla 2: una pantalla sobria con cabecera tiene exactamente un `ScreenHeader` y ningún `BrandPattern`, una sobria pura ninguno; (c) en "Component states", fila del campo de texto, cambiar el borde de error de `error` a `errorText` (1 px). Ejecutar `npx jest src/theme/__tests__/designDoc.test.ts`.
- [X] T003 [P] Crear `src/components/__tests__/ScreenHeader.test.tsx`: renderiza título y número (`17`); sin `count` no muestra número; el título tiene `accessibilityRole="header"`; con `count={0}` muestra `0`; el degradado es `gradients.brand`; el texto usa `onGradient.text`; y `contrast(onGradient.text, extremo) >= 4.5` para los dos extremos de `gradients.brand.colors` (usa `@/testing/contrast`). Debe fallar (el componente no existe).
- [X] T004 Crear `src/components/ScreenHeader.tsx` con `{ title: string; count?: number }`: `LinearGradient` con `{...gradients.brand}` y `colors={[...gradients.brand.colors]}`, `borderRadius: radius.card`, `padding: spacing.lg`, sombra `useShadows().level1`; título `typography.screenTitle` color `onGradient.text` con `accessibilityRole="header"`; línea de 4 px (`radius.line`, color `palette.accent`) bajo el título (patrón de `HeroSessionCard`); número con `typography.metricNumber` color `onGradient.text` a la derecha; el contenedor sin `accessible` (un padre accesible ocultaría el `accessibilityRole="header"` del título; el lector dice «título, número» al leer los dos textos). Sin `BrandPattern`. Ejecutar T003: debe pasar.
- [X] T005 [P] En `src/theme/__tests__/severityIndicators.test.ts` agregar a `REVIEWED` las rutas `src/features/accounts`, `src/features/periods`, `src/features/holidays`, `src/features/rooms`, `src/features/modules`, `src/features/dropdown-lists`, `src/features/smtp`, `src/features/teachers`, `src/components/AppBar.tsx`, `src/components/FieldBox.tsx` y `src/features/dashboard/components/StatusStackBar.tsx` (no `shell`: sus insignias son rellenos). Ejecutarla: debe fallar con `AppBar.tsx`, `AccountCard.tsx`, `StatusStackBar.tsx`, `SmtpSettingsScreen.tsx` y `FieldBox.tsx` (constitución V).
- [X] T006 [P] Crear `src/theme/__tests__/headerBudget.test.ts` con el patrón de `severityIndicators.test.ts`: (a) cada una de las 10 pantallas con cabecera contiene exactamente una aparición de `<ScreenHeader`: `src/features/modules/screens/ModulesScreen.tsx`, `src/features/rooms/screens/LocationsScreen.tsx`, `RoomsScreen.tsx`, `src/features/accounts/screens/AccountsListScreen.tsx`, `src/features/periods/screens/PeriodsScreen.tsx`, `src/features/holidays/screens/HolidaysScreen.tsx`, `src/features/dropdown-lists/screens/DropdownListsScreen.tsx`, `DropdownItemsScreen.tsx`, `src/features/dashboard/screens/ChangesScreen.tsx`, `src/features/shell/screens/MoreScreen.tsx`; (b) ninguna de ellas ni de los formularios (`ModuleFormScreen`, `ModuleDetailScreen`, `LocationFormScreen`, `RoomFormScreen`, `CreateTeacherScreen`, `TeacherEditScreen`, `PeriodFormScreen`, `HolidayFormScreen`, `HolidaysImportScreen`, `DropdownItemFormScreen`, `SmtpSettingsScreen`) importa `BrandPattern` ni `HeroCard`; (c) los formularios no contienen `<ScreenHeader`. Debe fallar en (a).

**Checkpoint**: el documento define el registro, el componente existe y las dos guardas fallan con el código actual.

---

## Phase 3: User Story 1 - Indicadores y estados legibles en administración (Priority: P1)

**Goal**: los 5 indicadores pendientes con roles de texto, legibles en ambos modos.

**Independent Test**: cuentas activas e inactivas, SMTP en sus 3 estados, barra de PQRS, menú de perfil y un campo con error, en claro y oscuro; `severityIndicators` pasa.

- [X] T007 [P] [US1] En `src/components/AppBar.tsx` (línea 97) cambiar `borderColor: palette.error` por `palette.errorText` en el ítem «Cerrar sesión».
- [X] T008 [P] [US1] En `src/features/accounts/components/AccountCard.tsx` (ícono de estado) cambiar `palette.success` por `palette.successText`.
- [X] T009 [P] [US1] En `src/features/dashboard/components/StatusStackBar.tsx` cambiar el mapa `colors`: `IN_REVIEW: palette.warningText`, `RESOLVED: palette.successText` (`FILED` queda en `textSecondary`).
- [X] T010 [P] [US1] En `src/features/smtp/screens/SmtpSettingsScreen.tsx` eliminar la constante `color` (success/warning/textSecondary) y usar `textColor` también en `borderColor` de la insignia y en el `color` del `Icon`.
- [X] T011 [P] [US1] En `src/components/FieldBox.tsx` (`fieldVisual`, rama `error`) cambiar `borderColor: palette.error` por `palette.errorText`. Actualizar la prueba de `fieldVisual` que compare con `palette.error` (buscar con `grep -rn "fieldVisual" src --include=*.test.*`) para que espere `errorText`.
- [X] T012 [US1] Crear `src/components/__tests__/adminIndicators.test.tsx`, en claro y oscuro (`jest.spyOn(ReactNative, 'useColorScheme')`): `AccountCard` activa pinta su ícono con `successText`; `StatusStackBar` pinta los segmentos `segment-IN_REVIEW` y `segment-RESOLVED` con `warningText` y `successText`; `fieldVisual({ error: 'x', ... }, palette).borderColor` es `errorText`. Ejecutar `npx jest src/theme/__tests__/severityIndicators.test.ts src/components`: deben pasar.
- [X] T013 [P] [US1] En la prueba existente de `SmtpSettingsScreen` (carpeta `src/features/smtp/__tests__/`) agregar que, con el estado `NEEDS_RECONFIGURATION` y `CONFIGURED`, el borde de la insignia coincide con el color de su texto (`warningText` y `successText`) en oscuro; sin cambiar los textos esperados.

**Checkpoint**: `severityIndicators` pasa con las carpetas de la fase.

---

## Phase 4: User Story 2 - Listas de administración consistentes (Priority: P1)

**Goal**: 10 pantallas con la misma cabecera de marca y estados iguales.

**Independent Test**: cada lista con datos, sin datos, cargando y con error, en claro y oscuro; `headerBudget` pasa.

- [X] T014 [P] [US2] En `src/features/modules/screens/ModulesScreen.tsx` (línea 50) reemplazar el `<Text screenTitle>` por `<ScreenHeader title={t('modules.title')} count={modules.data?.data.length} />` (import de `@/components/ScreenHeader`; quitar `typography`/`Text` si quedan sin uso).
- [X] T015 [P] [US2] En `src/features/rooms/screens/LocationsScreen.tsx` (título `locations.title`, `count={locations.data?.data.length}`) y en `src/features/rooms/screens/RoomsScreen.tsx` (título `rooms.title`, `count={rooms.data?.data.length}`) reemplazar el `<Text screenTitle>` por `ScreenHeader`.
- [X] T016 [P] [US2] En `src/features/accounts/screens/AccountsListScreen.tsx` reemplazar el título del `header` (`t(\`more.${kinds}\`)`) por `<ScreenHeader title={t(\`more.${kinds}\`)} count={list.data?.pages[0]?.meta.total} />` (docentes y estudiantes usan la misma pantalla).
- [X] T017 [P] [US2] En `src/features/periods/screens/PeriodsScreen.tsx` (`periods.title`, `count={periods.data?.data.length}`) y `src/features/holidays/screens/HolidaysScreen.tsx` (`holidays.title`, `count={holidays.data?.data.length}`) reemplazar el título por `ScreenHeader`.
- [X] T018 [P] [US2] En `src/features/dropdown-lists/screens/DropdownListsScreen.tsx` (`dropdowns.title`, `count={lists.data?.data.length}`) y `DropdownItemsScreen.tsx` (el mismo texto de título que ya calcula según idioma, `count={list.data ? items.length : undefined}`) reemplazar el título por `ScreenHeader`.
- [X] T019 [P] [US2] En `src/features/dashboard/screens/ChangesScreen.tsx` agregar `ListHeaderComponent={<ScreenHeader title={t('dashboard.admin.changes.title')} count={list.data?.pages[0]?.meta.total} />}` a la `FlatList` (texto existente; la lista vacía sigue mostrando su `EmptyState` debajo).
- [X] T020 [P] [US2] En `src/features/shell/screens/MoreScreen.tsx` agregar `<ScreenHeader title={t('tabs.more')} />` (sin número) como primer hijo del `SafeAreaView`.
- [X] T021 [US2] Ampliar las pruebas existentes de cada pantalla de T014 a T020 (en la carpeta `__tests__` de su feature) comprobando que la cabecera muestra el título existente y el número correcto con datos, que muestra `0` sin datos (y el estado vacío sigue debajo, una sola vez) y que no hay textos nuevos; sin cambiar las demás aserciones. Buscar el título con `getByRole('header', { name })` y el número con una consulta acotada a la cabecera, no con un `getByText` numérico global, que puede repetirse en la pantalla. Ejecutar `npx jest src/theme/__tests__/headerBudget.test.ts src/features`: deben pasar.
- [X] T022 [US2] Auditar con las 8 reglas de `Design.md` (más el registro nuevo) las 10 pantallas con cabecera: un solo bloque de color, ningún patrón, un solo botón primario por área, filtros y tarjetas con espaciado 16/12/24 px, regla visible en toda acción bloqueada (FR-007: periodo con módulos, salón con capacidad menor a la de inscritos, módulo con inscritos o con eliminación bloqueada), estado vacío, carga y error con las piezas compartidas. Anotar el resultado (cumple, o defecto con causa y corrección) en `specs/026-design-system/screen-inventory.md` y corregir solo lo que se anote.

**Checkpoint**: las 10 pantallas con cabecera cumplen y `headerBudget` pasa.

---

## Phase 5: User Story 3 - Formularios de administración consistentes (Priority: P2)

**Goal**: formularios con estructura común y error legible.

**Independent Test**: cada formulario en creación y edición con error de campo y de regla, en claro y oscuro.

- [X] T023 [US3] Auditar con las 8 reglas las 11 pantallas sin cabecera: `ModuleFormScreen`, `ModuleDetailScreen`, `LocationFormScreen`, `RoomFormScreen`, `CreateTeacherScreen`, `TeacherEditScreen`, `PeriodFormScreen`, `HolidayFormScreen`, `HolidaysImportScreen`, `DropdownItemFormScreen` y `SmtpSettingsScreen`: un solo botón primario con ícono a la izquierda, acciones secundarias, error de campo con `errorText` e ícono, confirmación con `ConfirmDialog`, objetivos de 48 px, clave temporal visible una sola vez (FR-005, FR-007). Anotar el resultado en `screen-inventory.md` y corregir solo lo que se anote.
- [X] T024 [P] [US3] En `src/components/__tests__/darkMode.test.tsx` agregar a `samples`: `ScreenHeader` con `count={3}` y `AccountCard` activa, para que la guarda de modo oscuro los cubra (colores solo de `darkPalette`).

**Checkpoint**: formularios y detalle auditados, piezas nuevas cubiertas en oscuro.

---

## Phase 6: Polish y documentos

- [X] T025 Ejecutar `npm test`, `npm run lint` y `npm run typecheck` completos en `tutorias_uts_mobile`; confirmar SC-005 y SC-006 (0 textos o reglas de negocio cambiados, guardas de las specs 026 a 028 en verde, `severityIndicators` y `headerBudget` en verde).
- [X] T026 [P] En `docs/Decisions.md` agregar D-126 (registro «sobrio con cabecera» y `ScreenHeader`, 10 pantallas con cabecera y formularios sin ella, 5 indicadores corregidos, guarda `headerBudget`), con su motivo y alternativas descartadas (R-1, R-2, R-4, R-5).
- [X] T027 [P] Completar `specs/026-design-system/screen-inventory.md`: estado de cada una de las 22 pantallas de la fase 3 en claro y oscuro, los 5 indicadores corregidos y lo que queda para la fase 4 (`StatusBadge`, `PqrsFiledScreen`, chat, PQRS, perfil).
- [ ] T028 [manual, usuario] Recorrido de `quickstart.md` en el teléfono: las 10 pantallas con cabecera y los formularios en claro y oscuro, español e inglés, con datos, sin datos y con error; cambio de modo con cada pantalla abierta (SC-002, SC-007, SC-008).
- [ ] T029 Marcar la spec como implementada (`Status` en `spec.md`) cuando T028 esté confirmado.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational**: T002, T003, T005 y T006 en paralelo; T004 después de T003 (el componente cumple su prueba).
- **US1 (T007–T013)** puede ir desde que T005 falla (T007 a T011 en paralelo; T012 y T013 después).
- **US2 (T014–T022)** necesita T004 (el componente) y T006; T014 a T020 en paralelo; T021 y T022 después.
- **US3 (T023–T024)** después de US1 y US2 (T024 incluye `ScreenHeader`).
- **Polish (T025–T029)** al final; T026 y T027 pueden empezar tras US2.

## Parallel Opportunities

- Foundational: T002, T003, T005 y T006 en paralelo (archivos distintos).
- US1: T007 a T011 en paralelo (5 archivos).
- US2: T014 a T020 en paralelo (10 archivos, 7 tareas).
- Polish: T026 y T027 en paralelo.

## Implementation Strategy

- **MVP**: Foundational + US1 (T001–T013): corrige los cinco indicadores medidos y deja la guarda extendida.
- **Incremento 2**: US2 (cabecera en las 10 pantallas): es el cambio visible que pidió la persona dueña del producto.
- **Incremento 3**: US3, auditoría de formularios y cierre (documentos, inventario y recorrido manual).
