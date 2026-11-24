# Tasks: Entrada y portada renovadas

**Input**: `specs/027-entry-front-page/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden de forma implícita en la spec (FR-011, FR-013, FR-014, SC-005, SC-007) y por la constitución (V aplicada en el plan): la matriz de contraste se amplía antes de corregir los valores y debe fallar con el tema actual.

**Repositorios**: código en `tutorias_uts_mobile` (rama `027-entry-front-page`, desde `026-design-system`); documentos en `Claude` (rama `027-entry-front-page`, ya creada desde `026-design-system`). Backend y base de datos no se tocan.

## Formato: `[ID] [P?] [Story] Descripción`

Rutas del front relativas a `tutorias_uts_mobile/`; las de documentos, a `Claude/`.

## Phase 1: Setup

- [X] T001 En `tutorias_uts_mobile`, crear la rama `027-entry-front-page` desde `026-design-system` (PR #16 abierto; PR apilado). Comprobar que `npm test`, `npm run lint` y `npm run typecheck` pasan antes de cambiar nada.

---

## Phase 2: Foundational (defectos del teléfono; bloquea las historias)

**Propósito**: cerrar los dos defectos dictados en las piezas compartidas, con las guardas primero.

- [X] T002 En `src/testing/contrastPairs.ts` agregar a `contrastPairs` los pares no textuales de `data-model.md`: `controlBorder` sobre `card`, `screen` y `selected` con 3:1 (`ICON_RATIO`), y `onPrimary` sobre `primaryPressed` con 4.5:1. Agregar `controlBorder: string` al tipo `Palette` y a ambas paletas en `src/theme/colors.ts` con el valor provisional de `border`. Ejecutar `npx jest src/theme`: el par de `controlBorder` debe fallar (R-1; constitución V).
- [X] T003 En `src/theme/colors.ts` poner `controlBorder` claro `#76827A` y oscuro `#7A9A85` (derivados; marcar con comentario con su razón y la medida) y `primaryPressed` oscuro `#9FB01F`. `npx jest src/theme`: `contrast`, `paletteParity` y `designDoc` pasan o fallan solo por la tabla de `Design.md`, que se corrige aquí mismo: agregar `controlBorder` y el nuevo `primaryPressed` oscuro a la tabla de roles de `docs/Design.md` (FR-012: primero el documento y el tema) y ejecutar `npx jest src/theme/__tests__/designDoc.test.ts` hasta que pase.
- [X] T004 [P] En `src/theme/__tests__/` cambiar en `paletteParity.test.ts` el número de roles de 39 a 40 (línea 14, `has the 39 roles`) y agregar la comprobación de que en oscuro `primaryPressed` es distinto de `primary` (FR-013, `data-model.md`, "Reglas de validación").
- [X] T005 En `src/components/Button.tsx` usar `palette.controlBorder` como `border` de las variantes `outlined` y `tonal` (el estado deshabilitado conserva el borde `surface`: está exento y no debe parecer activo); el resto de variantes no cambia (R-1).
- [X] T006 En `src/components/FilterChips.tsx` aplicar R-2: borde de chip sin seleccionar `palette.controlBorder`; el chip con `flexShrink: 0` y `minWidth: MIN_TOUCH_TARGET`; la etiqueta con `flexShrink: 0` y `marginRight: spacing.xs`; mantener los roles `primary`/`onPrimary` del chip seleccionado.
- [X] T007 [P] Crear `src/components/__tests__/FilterChips.test.tsx`: cada chip tiene `minWidth` ≥ 48 y la etiqueta no se encoge (FR-014); la etiqueta `All` y una larga se renderizan completas; agregar en el mismo archivo una comprobación de que la etiqueta de `Button` y la de `NotificationsBell` no se encogen (`flexShrink` 0 o sin ancho fijo); en oscuro el borde del chip es `darkPalette.controlBorder` (usar la técnica de `darkMode.test.tsx`).
- [X] T008 [P] En `src/components/__tests__/darkMode.test.tsx` agregar un caso por variante de `Button` (`outlined`, `tonal`, `primary` presionado) comprobando que el borde y el relleno salen de `darkPalette`.
- [ ] T009 [manual, usuario] En el teléfono (Expo Go): en oscuro, ver que se distingue el borde de un botón `outlined`, de uno `tonal` y de los chips; que el botón primario cambia de color al presionar; y que «All» se lee completo en inglés y con letra grande. Si «Al» persiste, anotarlo en `screen-inventory.md` y ajustar T006.

**Checkpoint**: las guardas están en verde y los dos defectos corregidos.

---

## Phase 3: User Story 1 - Una entrada que se siente de la UTS (Priority: P1)

**Goal**: arranque y cinco pantallas de autenticación como una familia, en claro y oscuro.

**Independent Test**: recorrer las 6 pantallas en ambos modos con la lista de 8 reglas de `Design.md`.

- [X] T010 [US1] Auditar con las 8 reglas de `Design.md` las rutas `app/(auth)/login.tsx`, `register.tsx`, `verify-email.tsx`, `forgot-password.tsx`, `reset-password.tsx` y `app/index.tsx`: un solo botón principal por área, un patrón y un bloque de color, espaciado de la escala. Anotar en `specs/026-design-system/screen-inventory.md` (columnas de defecto) lo que falle.
- [X] T011 [US1] Corregir en `src/components/AuthLayout.tsx` y en las pantallas de `src/features/auth/` solo lo que T010 haya anotado (sin textos ni rutas nuevos); si no hay fallos, registrar «cumple» en el inventario.
- [X] T012 [P] [US1] Crear `src/features/auth/__tests__/authDark.test.tsx` (o ampliar la prueba existente del módulo): cada pantalla de autenticación renderizada en oscuro usa solo colores de `darkPalette` y su botón principal tiene objetivo de 48 px.
- [X] T013 [US1] Verificar en `app/index.tsx` / `src/components/LoadingScreen.tsx` que el fondo viene de `palette.screen` desde el primer cuadro (FR-006); registrar el resultado en el inventario.

**Checkpoint**: la entrada cumple las reglas en ambos modos.

---

## Phase 4: User Story 2 - Un inicio con presencia y consistente entre roles (Priority: P1)

**Goal**: los tres inicios con el mismo orden: bloque destacado, métricas, bloques.

**Independent Test**: abrir cada inicio y comprobar el orden y el presupuesto expresivo; las pruebas de tableros pasan.

- [X] T014 [US2] En `src/features/dashboard/screens/AdminDashboardScreen.tsx` mover la ocupación de módulos (los datos y textos que ya muestra la primera `Card`) a un `HeroCard` (con texto `onGradient`), sin textos nuevos y con legibilidad sobre el degradado: la etiqueta de `CapacityBar` usa `onGradient.text` y su pista un tono claro de `onGradient`; si `CapacityBar` no admite ese modo, el bloque muestra solo el porcentaje y la barra queda en una tarjeta (decidir al leer el componente; hoy pinta con `textPrimary` y `surface`, ilegible sobre el degradado en claro). El orden sea bloque destacado, métricas, bloques (R-4). El `HeroCard` es el único bloque de color de la pantalla.
- [X] T015 [P] [US2] Ajustar la prueba de `AdminDashboardScreen` (en `src/features/dashboard/__tests__/`) para el nuevo contenedor sin cambiar los textos esperados; agregar una comprobación de que el bloque destacado aparece antes de las métricas.
- [X] T016 [P] [US2] Auditar `StudentHomeScreen.tsx` y `TeacherDashboardScreen.tsx` contra las 8 reglas (un bloque de color, un patrón, 16/12/24 px, sin tarjeta dentro de tarjeta); corregir lo anotado y registrar en el inventario.
- [X] T017 [P] [US2] En `src/components/__tests__/darkMode.test.tsx` agregar el `HeroCard` con contenido de la ocupación y una `MetricCard` en oscuro (colores solo de `darkPalette`), y comprobar que el texto del bloque cumple 4.5:1 con `onGradient.text` sobre `#34531F` y sobre `#132F20` (extremos del degradado).
- [X] T018 [US2] Verificar con las pruebas de los tres tableros y `npx jest src/features/dashboard` (FR-008, SC-004).

**Checkpoint**: los tres inicios comparten estructura.

---

## Phase 5: User Story 4 - Estados vacíos y de carga con identidad (Priority: P2)

**Goal**: una sola pieza de estado vacío con el patrón de marca. Va antes de la bandeja porque esta la usa.

**Independent Test**: provocar el estado vacío en un inicio y en una bandeja, en ambos modos.

- [X] T019 [US4] En `src/components/brandPatternLayouts.ts` agregar la variante `empty` a `PatternVariant` y a `brandPatternLayouts` (3 a 5 colocaciones fijas y pequeñas, deterministas, con los íconos del patrón existente); en `src/components/BrandPattern.tsx` no cambiar la lógica salvo lo que la variante requiera (R-5).
- [X] T020 [US4] En `src/components/EmptyState.tsx` montar `BrandPattern variant="empty"` detrás del ícono, con el tono de decoración del registro (un solo patrón); sin cambiar `title`, `description`, `icon` ni `action` (53 usos).
- [X] T021 [P] [US4] Crear `src/components/__tests__/EmptyState.test.tsx`: muestra título, descripción, ícono y acción; lleva el patrón; en oscuro no usa colores de `lightPalette`; con «reducir movimiento» no anima.
- [X] T022 [US4] Ejecutar `npx jest src` completo para confirmar que ninguna de las 53 pantallas con `EmptyState` cambia de texto ni de comportamiento (SC-004).

**Checkpoint**: estado vacío único en toda la app.

---

## Phase 6: User Story 3 - Bandeja de avisos clara y sin errores visuales (Priority: P2)

**Goal**: las tres bandejas iguales, con leído/no leído sin depender solo del color.

**Independent Test**: bandeja con avisos, sin avisos, cargando y con error, en ambos modos.

- [X] T023 [US3] Auditar `src/features/notifications/screens/NotificationsScreen.tsx` y `components/NotificationCard.tsx` contra las 8 reglas: no leído con peso o marca además del color, sin franja de fondo en ninguna zona, botones con `controlBorder` donde corresponda; corregir lo anotado.
- [X] T024 [P] [US3] Ampliar las pruebas de `NotificationsScreen` (vacío, error, lista) para comprobar el nuevo estado vacío y, en oscuro, que ningún contenedor usa colores de `lightPalette`; sin cambiar los textos esperados ni las pruebas de la spec 024.
- [X] T025 [US3] Comprobar que las rutas `(student)`, `(teacher)` y `(admin)/notifications.tsx` siguen montando la misma pantalla (FR-004) y que `npx jest src/features/notifications src/features/shell` pasa.

**Checkpoint**: las tres bandejas cumplen.

---

## Phase 7: Polish y documentos

- [X] T026 [P] En `docs/Design.md` agregar la variante `empty` del patrón y la regla de borde de controles en "Component states" (3:1 en botones `outlined` y `tonal` y chips sin seleccionar; botones rellenos por texto 4.5:1; el campo de texto sigue exento). La tabla de roles (`controlBorder`, `primaryPressed`) ya se actualizó en T003. Ejecutar `npx jest src/theme/__tests__/designDoc.test.ts`.
- [X] T027 [P] En `docs/Decisions.md` agregar D-124 (rol `controlBorder`, `primaryPressed` oscuro, chip sin recorte, bloque destacado del CAE y variante `empty`), con su motivo y alternativas descartadas (R-1, R-2, R-4, R-5).
- [X] T028 [P] Completar `specs/026-design-system/screen-inventory.md`: los dos defectos del teléfono con causa y corrección; estado de cada una de las 12 pantallas de la fase 1 en claro y oscuro; los chips «All» de las fases 2 a 4 como cerrados por la pieza compartida.
- [X] T029 Ejecutar `npm test`, `npm run lint` y `npm run typecheck` completos en `tutorias_uts_mobile`; confirmar SC-004 y SC-005 (0 textos cambiados, guardas en verde).
- [ ] T030 [manual, usuario] Recorrido de `quickstart.md` en el teléfono: 12 pantallas de la fase 1 en claro y oscuro, español e inglés, letra grande, cambio de modo con la pantalla abierta (SC-002, SC-006).
- [ ] T031 Marcar la spec como implementada (`Status` en `spec.md`) cuando T009 y T030 estén confirmados.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002 → T003 → T004 a T008 → T009)** bloquea todo.
- **US1 (T010–T013)** y **US2 (T014–T018)** son independientes entre sí y pueden ir en paralelo tras la Foundational.
- **US4 (T019–T022)** va antes de **US3 (T023–T025)**, porque la bandeja usa el estado vacío nuevo.
- **Polish (T026–T031)** al final; T026 puede empezar tras T020 (la tabla de roles ya se hizo en T003).

## Parallel Opportunities

- Tras T003: T004, T007 y T008 en paralelo (archivos distintos).
- US1 y US2 en paralelo; dentro de US2: T015, T016 y T017.
- Polish: T026, T027 y T028 en paralelo.

## Implementation Strategy

- **MVP**: Foundational completo (T001–T009): corrige los dos defectos que vio el dueño del producto y deja la guarda que evita que vuelvan.
- **Incremento 2**: US1 y US2 (entrada y tres inicios consistentes).
- **Incremento 3**: US4 y US3 (estado vacío único y bandeja).
- **Cierre**: documentos, inventario y recorrido manual.
