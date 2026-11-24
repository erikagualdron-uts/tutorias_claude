# Tasks: Sistema de diseño renovado

**Input**: `specs/026-design-system/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden en la spec (FR-010, SC-001 a SC-003) y la constitución (V aplicada por el plan, R-10): las guardas se escriben antes de corregir los valores y deben fallar con el tema actual.

**Repositorios**: código en `tutorias_uts_mobile` (rama `026-design-system`); documentos en `Claude` (rama `026-design-system`, ya creada). Backend y base de datos no se tocan.

**Decisiones por defecto** (se cambian si el CAE de producto lo pide): `Design.md` se mantiene en inglés y se anota la deuda (R-8); el borde tenue de los campos queda exento de 3:1 (R-6).

## Formato: `[ID] [P?] [Story] Descripción`

Rutas del front relativas a `tutorias_uts_mobile/`; las de documentos, a `Claude/`.

## Phase 1: Setup

- [X] T001 En `tutorias_uts_mobile`, crear la rama `026-design-system`: desde `024-fix-hidden-tab-navigation` si el PR #15 sigue abierto (PR apilado), o desde `origin/main` si ya se fusionó (R-9). Comprobar que `npm test`, `npm run lint` y `npm run typecheck` pasan antes de tocar nada.
- [ ] T002 [P] [manual, usuario] Recorrido base en modo oscuro (teléfono con Expo Go): anotar en `specs/026-design-system/screen-inventory.md` los defectos visibles actuales por pantalla (fondo claro residual, texto ilegible, componente sin cambiar de modo). Es la entrada de T029 y la lista de verificación de T015.

---

## Phase 2: Foundational (bloquea todas las historias)

**Propósito**: la base compartida de las guardas.

- [X] T003 En `src/theme/colors.ts` agregar los 7 roles nuevos al tipo `Palette` y a ambas paletas con un valor provisional igual al del rol más cercano (`onSurfaceWarm`, `shadow`, `successText`, `warningText`, `selected`, `tabActive`, `tabInactive`; ver `data-model.md`), sin cambiar valores existentes, para que el tipo compile. Los valores definitivos van en T012.
- [X] T004 [P] Crear `src/theme/__tests__/paletteParity.test.ts`: `lightPalette` y `darkPalette` tienen exactamente las mismas llaves (las 39 de `data-model.md`) y cada valor es un color válido (hex de 6 u 8 dígitos o `rgba(...)`). Debe pasar con T003.
- [X] T005 En `src/testing/contrast.ts` (o junto a él) exportar `contrastPairs(palette)` con la matriz completa de pares de `data-model.md` ("Pares de contraste"): texto 4.5:1, íconos e indicadores 3:1, con los exentos listados (`disabledText`, `inputBorder`, `border`, `scrim`, `accent` como relleno). Debe poder usarlo la prueba de T007 y, más tarde, T021.

**Checkpoint**: tipo ampliado, paridad verde, matriz exportada.

---

## Phase 3: User Story 1 - Modo oscuro sin errores visuales (P1) 🎯 MVP

**Goal**: ninguna pantalla tiene fondos claros residuales, textos ilegibles ni componentes sin cambiar de modo, en lo que provenga de un rol de color o de un componente compartido.

**Independent Test**: `npx jest src/theme src/components` pasa; el recorrido manual de `quickstart.md` en modo oscuro no encuentra defectos de color de rol o de componente compartido.

### Pruebas primero (deben fallar con el tema actual)

- [X] T006 [P] [US1] En `src/theme/__tests__/contrast.test.ts` sustituir la lista de 20 pares por `contrastPairs` de T005, para `lightPalette` y `darkPalette`. Con los valores actuales debe fallar en los huecos 1 a 4 de R-2 (crema sin variante oscura, `surface` igual a `card`, texto de éxito y advertencia). Confirmar los fallos.
- [X] T007 [P] [US1] Crear `src/components/__tests__/darkMode.test.tsx`: con `useColorScheme` simulado a `dark`, renderizar `Card`, `Banner` (todas las variantes), `AnnouncementCard`, `Button`, `TextField`, `FilterChips`, `SegmentedControl`, `EmptyState` y `AppBar`, y comprobar que cada color de fondo y de texto de los estilos resueltos pertenece a `darkPalette`, y que ningún rol cuyo valor claro y oscuro sean distintos aparece con su valor claro. Debe fallar para `Banner` info y `AnnouncementCard` (crema).

### Implementación

- [X] T008 [US1] En `src/theme/colors.ts` fijar `surfaceWarm` oscuro (crema oscura derivada) y `onSurfaceWarm` ("4.5:1 sobre `surfaceWarm`") en ambos modos; marcar como derivados. Medir con T006 hasta que pase.
- [X] T009 [US1] En `src/theme/colors.ts` fijar `surface` oscuro "más claro que `card`" (derivado) manteniendo "`textPrimary` y `textSecondary` 4.5:1"; fijar `selected` (4.5:1 con `textPrimary`) y `successText`, `warningText` ("4.5:1 sobre `card` y `screen`") en ambos modos.
- [X] T010 [US1] En `src/theme/colors.ts` fijar `shadow` (`#132F20` claro, `#000000` oscuro) y en `src/theme/tokens.ts` hacer que `shadows` use el color del rol por modo (por ejemplo, una función `shadowFor(palette, level)`); actualizar los 11 usos de `shadows.` para aplicar el color del rol. En oscuro, `Card` agrega borde de 1 px (`border`) y no depende de la sombra para separarse (FR-004).
- [X] T011 [P] [US1] En `src/components/Banner.tsx` y `src/features/chat/components/AnnouncementCard.tsx` usar `surfaceWarm` con `onSurfaceWarm` para texto e íconos (hoy usan `onAccent`).
- [X] T012 [US1] En `src/theme/colors.ts` fijar `tabActive` y `tabInactive` ("3:1 sobre el fondo de la barra") y en `src/features/shell/RoleTabs.tsx` usarlos para `tabBarActiveTintColor` y `tabBarInactiveTintColor`; confirmar que `AppBar` y la barra usan `card` y bordes del tema en ambos modos. Sin cambiar estructura ni destinos (FR-012a).
- [X] T013 [US1] Usar `successText` y `warningText` donde hoy un estado se dibuja con `success` o `warning` como texto (buscar `palette.success` y `palette.warning` en `src/` y `app/`); los rellenos y los íconos siguen igual.
- [X] T014 [US1] Ejecutar `npx jest src/theme src/components` y confirmar que T004, T006 y T007 pasan, y que las pruebas de la spec 023 y 024 (`hiddenScreens`, `setupA11y`) siguen verdes.
- [ ] T015 [US1] [manual, usuario] Recorrido manual en modo oscuro de los tres roles con la lista de T002; corregir en esta spec solo lo que venga de un rol o de un componente compartido y dejar el resto en `screen-inventory.md` con su fase (FR-012). Repetir en modo claro: nada debe cambiar salvo lo previsto. Cambiar el modo con la app abierta, sin reiniciar.
- [ ] T016 [US1] [manual, usuario] Revisar `BrandLogo` y las imágenes de marca con fondo blanco en modo oscuro: decidir si se usa la variante de marca para oscuro o una superficie que la acepte, aplicarlo en `src/components/BrandLogo.tsx` si hace falta y anotar el resultado en `specs/026-design-system/screen-inventory.md`.

**Checkpoint**: modo oscuro coherente en el sistema; las pantallas con defecto propio quedan en el inventario.

---

## Phase 4: User Story 2 - Un documento de diseño que sirve para decidir (P1)

**Goal**: `Design.md` define roles, escalas, estados y registros de forma comprobable, y coincide con el tema.

**Independent Test**: `designDoc.test.ts` pasa; una revisión cruzada no encuentra valores sin definir.

- [X] T017 [US2] En `docs/Design.md` reescribir "Colors" y "Dark mode" como una **tabla de roles** (rol, claro, oscuro, origen marca o derivado, uso) con los 39 roles de `data-model.md` y los valores de T008 a T012; ampliar "Contrast reference" con los pares del modo oscuro y la nota del borde tenue de los campos (R-6). Conservar las reglas de `CLAUDE.md` (lima, 48 px, Iconify, botones con ícono, campos con borde, solo patrón de marca).
- [X] T018 [P] [US2] En `docs/Design.md` ampliar "Elevation", "Spacing", "Border Radius" y "Typography" con el nombre y uso de cada valor de `tokens.ts`; en "Elevation", la regla de oscuro: superficie más clara, borde de 1 px y color `shadow`.
- [X] T019 [P] [US2] En `docs/Design.md` agregar a cada componente de "Components" su tabla de estados (normal, presionado, enfocado, deshabilitado, cargando, error, seleccionado) sin repetir lo ya decidido.
- [X] T020 [US2] En `docs/Design.md` agregar la sección de **registros visuales** (FR-007a): sobrio (listas, horario, detalle, administración, chat, PQRS; 0 degradados, 0 patrón de marca, un acento por pantalla) y expresivo (inicio de sesión, inicio de cada rol, estados vacíos; un bloque de degradado o cabecera y un patrón por pantalla), con la lista de qué tipo de pantalla va en cada uno; y las reglas comprobables de "elegante", "moderno", "consistente" y "cercano a la UTS" (FR-007). Ampliar "Navigation" y "Screen patterns" con acceso a pantallas sin pestaña, regreso, vacíos y errores en claro y oscuro (FR-006).
- [X] T021 [US2] Crear `src/theme/__tests__/designDoc.test.ts`: lee `../Claude/docs/Design.md` (o la ruta de `DESIGN_MD_PATH`), extrae la tabla de roles y comprueba que cada fila coincide con `lightPalette` y `darkPalette` (mismo nombre, mismo valor, mismo origen); si no encuentra el archivo, falla con el mensaje "Design.md no encontrado: defina DESIGN_MD_PATH". Debe fallar con la tabla vacía y pasar con T017.
- [ ] T022 [US2] Revisión cruzada (SC-005): dos personas que no escribieron `Design.md` arman una pantalla de ejemplo usando solo `Design.md` y el tema, y anotan en `specs/026-design-system/quickstart.md` cada valor de diseño que no encontraron definido; corregir `Design.md` hasta que la lista quede vacía.
- [X] T023 [P] [US2] En `docs/Decisions.md` registrar **D-123** (roles de color por modo, sombra y elevación en oscuro, dos registros visuales, barra y cabecera solo de color, borde tenue exento de 3:1) y la deuda del idioma de `Design.md` (R-8). En `docs/Context.md`, `docs/Architecture.md` y `CLAUDE.md` actualizar solo lo que cambie (FR-013) (cuenta de roles, guardas); `CLAUDE.md` debe seguir coherente con `Design.md`.

**Checkpoint**: documento fiel al tema y a las reglas del proyecto.

---

## Phase 5: User Story 3 - La app usa los roles del sistema y no valores sueltos (P2)

**Goal**: ningún componente compartido escribe colores, fuentes o espaciados fuera del tema, y reaccionan al cambio de modo.

**Independent Test**: `noLooseColors.test.ts` pasa; los componentes cambian de modo en `darkMode.test.tsx`.

- [X] T024 [US3] Crear `src/theme/__tests__/noLooseColors.test.ts`: recorre `src/` y `app/` (`.ts` y `.tsx`) y falla si encuentra hex, `rgb()`, `rgba()` o nombres de color (`white`, `black`, `red`...), y en los componentes de `src/components` también `fontFamily` y valores numéricos fijos de `padding`, `margin`, `gap`, `borderRadius` y `fontSize` (deben salir de `spacing`, `radius` y `typography`), fuera de `src/theme`, de `__tests__` y de la lista de excepciones de marca (`BrandPattern.tsx`, `brandPatternLayouts.ts`, `BrandLogo.tsx` si lo requiere), cada una con su motivo en un comentario.
- [X] T025 [US3] Migrar al tema cualquier color suelto que T024 reporte; al 2026-11-23 no hay ninguno medido fuera de `src/theme`, así que lo esperado es solo ajustar la lista de excepciones. Corregir en los componentes compartidos las fuentes, espaciados y radios fuera de `fonts`, `typography`, `spacing` y `radius` que reporte T024 (SC-002); los de pantallas sueltas van al inventario con su fase.
- [X] T026 [P] [US3] Ampliar `src/components/__tests__/darkMode.test.tsx` a una "pantalla de muestra" con todos los componentes compartidos juntos (`Button`, `TextField`, `Card`, `Banner`, `FilterChips`, `SegmentedControl`, `EmptyState`, `ConfirmDialog`, `BrandLoader`): al cambiar de `light` a `dark` ninguno conserva un color del otro modo (FR-009).
- [X] T027 [US3] Ejecutar `npx jest` completo y `npm run lint`; el error de lint o de tipos de un componente migrado se corrige en el mismo cambio.

**Checkpoint**: el tema es la única fuente de color.

---

## Phase 6: User Story 4 - Ruta clara para rediseñar por fases (P2)

**Goal**: inventario completo de pantallas con defectos y fase.

**Independent Test**: las 58 pantallas de `app/` aparecen en `screen-inventory.md`.

- [X] T028 [US4] Generar la lista de rutas de `tutorias_uts_mobile/app` (58 archivos `.tsx` de pantalla (sin `_layout`)) y volcarla a `specs/026-design-system/screen-inventory.md` con las columnas: ruta, rol, registro (sobrio o expresivo, según T020), componentes compartidos, defecto en claro, defecto en oscuro y fase.
- [ ] T029 [US4] Completar defectos con lo anotado en T002 y T015 y con lo que reporten las guardas; asignar fase: 1 entrada y portada (inicio de sesión, inicio de cada rol, bandeja de avisos, estados vacíos); 2 módulos y horario; 3 administración del CAE; 4 resto. Marcar las que esta spec ya corrigió.
- [X] T030 [P] [US4] Verificar que el inventario tiene 58 filas y que las pantallas de la fase 1 reúnen los defectos que usará la spec siguiente; anotar en el inventario la spec que seguirá a esta (027, entrada y portada).

**Checkpoint**: la siguiente spec puede apoyarse en `Design.md`, el tema y el inventario.

---

## Phase 7: Polish y cierre

- [X] T031 En `tutorias_uts_mobile` ejecutar `npm test`, `npm run lint`, `npm run typecheck`; ejecutar `quickstart.md` completo y confirmar SC-001 a SC-006; la guarda de letra al 200 % de la spec 023 debe seguir verde con los espaciados y radios tocados.
- [X] T032 Comprobar que no hay cambios en backend, textos, rutas ni en la estructura de la barra y la cabecera (FR-012, FR-012a): revisar el `git diff` contra la rama base.
- [ ] T033 Marcar la spec como implementada (Status en `spec.md`) y las tareas como `[X]`. Commit y PR solo cuando el usuario lo pida.

---

## Dependencias y orden

- T001 → T003 → T004 y T005 (T004 y T005 en paralelo).
- US1: T006 y T007 (pruebas, en paralelo) → T008 a T013 → T014 → T015 y T016 (manuales, en paralelo). T008 a T010 y T012 editan `colors.ts`: van en orden; T011 es paralelo a ellos.
- US2: T017 depende de T008 a T012 (valores definitivos); T018 y T019 son paralelos entre sí; T020 depende de T017 para la tabla; T021 depende de T017; T022 (revisión cruzada) depende de T017 a T021; T023 al final de US2.
- US3: T024 → T025; T026 puede ir en paralelo con T025; T027 al final.
- US4: T028 depende de T020 (registros) y de T002; T029 depende de T015 y T016; T030 al final.
- Polish (T031 a T033) al final. La spec 027 (entrada y portada) empieza después de esta.

## Ejemplo paralelo

```text
Foundational: T004 (paridad) y T005 (matriz de contraste) a la vez.
US1 pruebas: T006 (contrast.test.ts) y T007 (darkMode.test.tsx) a la vez.
US2: T018 (escalas) y T019 (estados de componentes) a la vez.
```

## Estrategia

- **MVP**: T001 a T015 (modo oscuro sin errores visuales en el sistema). Es el defecto más visible.
- **Entrega incremental**: US2 deja el documento fiel; US3 cierra las guardas; US4 prepara las fases de pantallas.
- **Riesgo**: `RoleTabs.tsx` también lo toca el PR de la spec 024 (T001 lo resuelve apilando la rama).
