# Tasks: Chat, PQRS y perfil renovados

**Input**: `specs/030-chat-pqrs-profile/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden de forma implícita en la spec (FR-002, FR-003, FR-004, FR-013, SC-003, SC-004, SC-008) y por la constitución (V aplicada en el plan): las guardas se escriben antes de corregir y deben fallar con el código actual.

**Repositorios**: código en `tutorias_uts_mobile` (rama `030-chat-pqrs-profile`, desde `029-admin-screens`); documentos en `Claude` (rama `030-chat-pqrs-profile`, ya creada desde `029-admin-screens`). Backend y base de datos no se tocan.

**Supuesto por defecto**: la forma de los filtros de PQRS es la opción B (fila compacta con desplazamiento horizontal); si la persona dueña del producto prefiere A o C, se ajusta FR-013 y las tareas T005, T006, T010 y T011 antes de implementar.

## Formato: `[ID] [P?] [Story] Descripción`

Rutas del front relativas a `tutorias_uts_mobile/`; las de documentos, a `Claude/`.

## Phase 1: Setup

- [X] T001 En `tutorias_uts_mobile`, comprobar que la rama `030-chat-pqrs-profile` (desde `029-admin-screens`) está activa y que `npm test`, `npm run lint` y `npm run typecheck` pasan antes de cambiar nada.

---

## Phase 2: Foundational (documento y guardas primero; bloquea las historias)

**Propósito**: el documento (FR-012), las guardas ampliadas y la propiedad `scroll` de `FilterChips`.

- [X] T002 [P] En `docs/Design.md`: (a) en "Visual registers", fila **Sober with header**, agregar a las pantallas la lista de mensajes y las listas de PQRS (mis PQRS y PQRS del CAE); (b) en "Component states", fila **Chip / segment**, documentar la fila compacta de filtros (`scroll`): una fila por grupo, alto visual de 36 px con zona de toque de 48 px, desplazamiento horizontal sin barra, activo con relleno `primary` y texto `onPrimary`; úsala solo en listas con más de un grupo de filtros o con una lista dinámica de opciones. Ejecutar `npx jest src/theme/__tests__/designDoc.test.ts`.
- [X] T003 [P] En `src/theme/__tests__/severityIndicators.test.ts` agregar a `REVIEWED` las rutas `src/features/chat`, `src/features/pqrs` y `src/features/auth`. Ejecutarla: debe fallar con `src/features/pqrs` (`StatusBadge.tsx` y `PqrsFiledScreen.tsx`; constitución V).
- [X] T004 [P] En `src/theme/__tests__/headerBudget.test.ts` agregar a `WITH_HEADER` `src/features/chat/screens/MessagesScreen.tsx`, `src/features/pqrs/screens/MyPqrsScreen.tsx` y `src/features/pqrs/screens/AdminPqrsScreen.tsx`, y a `FORMS` `src/features/chat/screens/ChatScreen.tsx`, `src/features/chat/screens/NewChatScreen.tsx`, `src/features/pqrs/screens/PqrsDetailScreen.tsx`, `src/features/pqrs/screens/AdminPqrsDetailScreen.tsx`, `src/features/pqrs/screens/NewPqrsScreen.tsx` y `src/features/pqrs/screens/PqrsFiledScreen.tsx` (`ChangePasswordScreen` queda fuera: es expresiva con `AuthLayout`). Ejecutarla: debe fallar con las 3 pantallas con cabecera.
- [X] T005 [P] En `src/components/__tests__/FilterChips.test.tsx` agregar pruebas de `scroll` (deben fallar: la propiedad no existe): con `scroll`, la fila es un `ScrollView` horizontal (`horizontal` verdadero y `showsHorizontalScrollIndicator` falso); cada chip tiene `minHeight` 36 y `hitSlop` vertical de 6 en cada lado (36 + 12 = 48, como cuenta `src/testing/a11y.ts`); no se pierde ningún chip; el activo mantiene relleno `primary` y texto `onPrimary`; y sin `scroll` el chip conserva su `minHeight` de `MIN_TOUCH_TARGET` y el salto de línea.
- [X] T006 En `src/components/FilterChips.tsx` agregar la propiedad opcional `scroll` (por defecto `false`): con `true`, envolver los chips en un `ScrollView` con `horizontal`, `showsHorizontalScrollIndicator={false}` y `contentContainerStyle` de fila con `gap: spacing.sm`; cada chip con `minHeight: 36` y `hitSlop={{ top: 6, bottom: 6 }}`; el resto de estilos (borde `controlBorder`, activo `primary` y `onPrimary`, etiqueta con relleno horizontal y `letterSpacing: 0`) no cambia. Ejecutar T005: debe pasar.

**Checkpoint**: el documento define las pantallas y los filtros, y las guardas fallan con el código actual.

---

## Phase 3: User Story 1 - PQRS con estados legibles y listas con presencia (Priority: P1)

**Goal**: insignias e ícono de PQRS legibles, listas con la cabecera de marca y filtros compactos.

**Independent Test**: mis PQRS y PQRS del CAE con solicitudes de los tres estados, con vacío, carga y error, en claro y oscuro; `severityIndicators` y `headerBudget` pasan para PQRS.

- [X] T007 [P] [US1] En `src/features/pqrs/components/StatusBadge.tsx` (línea 14) cambiar `const color = status === 'RESOLVED' ? palette.success : status === 'IN_REVIEW' ? palette.warning : palette.primary` a `... ? palette.successText : ... ? palette.warningText : palette.primary` (borde e ícono).
- [X] T008 [P] [US1] En `src/features/pqrs/screens/PqrsFiledScreen.tsx` (línea 28) cambiar `color={palette.success}` por `color={palette.successText}` en el ícono de 48 px.
- [X] T009 [US1] Crear `src/features/pqrs/__tests__/statusColors.test.tsx`, en claro y oscuro (`jest.spyOn(ReactNative, 'useColorScheme')`): `StatusBadge` pinta su borde (`borderColor` del `View` que envuelve el texto) con `successText` (RESOLVED), `warningText` (IN_REVIEW) y `primary` (FILED). Ejecutar `npx jest src/theme/__tests__/severityIndicators.test.ts src/features/pqrs`: deben pasar.
- [X] T010 [P] [US1] En `src/features/pqrs/screens/MyPqrsScreen.tsx` (línea 30) reemplazar el `<Text screenTitle>` de `pqrs.list.title` por `<ScreenHeader title={t('pqrs.list.title')} count={list.data?.pages[0]?.meta.total} />` (import de `@/components/ScreenHeader`; quitar `Text` y `typography` si quedan sin uso) y pasar `scroll` al `FilterChips` de estado.
- [X] T011 [P] [US1] En `src/features/pqrs/screens/AdminPqrsScreen.tsx` (línea 37) reemplazar el título `pqrs.admin.title` por `<ScreenHeader title={t('pqrs.admin.title')} count={list.data?.pages[0]?.meta.total} />` (quitar imports sin uso) y pasar `scroll` a los tres `FilterChips` (estado, tipo y rol del autor).
- [X] T012 [US1] Ampliar `src/features/pqrs/__tests__/MyPqrsScreen.test.tsx` y `AdminPqrsScreen.test.tsx`: la cabecera muestra el título existente (`getByRole('header', { name })`) y el total; los chips de filtro siguen todos presentes y operables (misma prueba de filtrado actual); y el filtro usa la fila con `scroll` (el `ScrollView` horizontal). Sin cambiar las demás aserciones. Ejecutar `npx jest src/theme/__tests__/headerBudget.test.ts src/features/pqrs`: deben pasar.
- [X] T013 [US1] Auditar con las 8 reglas de `Design.md` (más el registro «sobrio con cabecera») `MyPqrsScreen`, `AdminPqrsScreen`, `PqrsDetailScreen`, `AdminPqrsDetailScreen`, `NewPqrsScreen` y `PqrsFiledScreen`: un solo bloque de color por pantalla con cabecera, ningún patrón, un solo botón primario por área, estado vacío, carga y error con las piezas compartidas, regla visible en acciones bloqueadas (FR-008: responder una PQRS ya resuelta). Anotar el resultado (cumple, o defecto con causa y corrección) en `specs/026-design-system/screen-inventory.md` y corregir solo lo que se anote.

**Checkpoint**: PQRS cumple las reglas, los filtros ocupan una línea por grupo y `headerBudget` pasa para PQRS.

---

## Phase 4: User Story 2 - Mensajes con una conversación clara y coherente (Priority: P1)

**Goal**: lista de mensajes con cabecera y burbujas coherentes en claro y oscuro.

**Independent Test**: mensajes y una conversación con mensajes propios, ajenos, un aviso y el indicador de escritura, en claro y oscuro, en los tres roles.

- [X] T014 [P] [US2] En `src/features/chat/screens/MessagesScreen.tsx` agregar `<ScreenHeader title={t('tabs.messages')} />` (sin número) como primer hijo del `SafeAreaView`, encima del `View` de `tabs` con el `SegmentedControl` (import de `@/components/ScreenHeader`); envolver la cabecera en un `View` con `padding: spacing.lg` y `paddingBottom: 0`, igual que `tabs`, para que tenga el margen de 16 px de la pantalla.
- [X] T015 [P] [US2] En `src/features/chat/components/MessageBubble.tsx` agregar el mismo borde de 1 px que `Card` tiene en oscuro a la burbuja ajena: leer `useColorScheme() === 'dark'` y, cuando `!mine && dark`, aplicar `borderWidth: 1` y `borderColor: palette.border` al estilo de la burbuja (la propia, de relleno `primary`, y el modo claro no cambian).
- [X] T016 [US2] Ampliar `src/features/chat/__tests__/ChatScreens.test.tsx` con: la pantalla de mensajes muestra la cabecera con `tabs.messages` y sin número; y la burbuja ajena, en oscuro, lleva `borderColor` igual a `darkPalette.border` y la propia no lleva borde. Agregar `MessageBubble` (ajena) a `samples` de `src/components/__tests__/darkMode.test.tsx` y ejecutar `npx jest src/features/chat src/components/__tests__/darkMode.test.tsx src/theme/__tests__/headerBudget.test.ts`: deben pasar.
- [X] T017 [US2] Auditar con las 8 reglas `ChatScreen`, `NewChatScreen`, `MessagesScreen` y las piezas `Composer`, `AnnouncementCard` y `TypingIndicator`: contraste de texto 4.5:1 y de bordes e íconos 3:1 en ambos modos, mensajes propios y ajenos distintos por posición y forma (FR-005), campo de escritura con foco, error y deshabilitado, indicador de escritura que respeta «reducir movimiento», y regla visible con contraste suficiente cuando el envío está bloqueado (FR-008). Anotar el resultado en `screen-inventory.md` y corregir solo lo que se anote.

**Checkpoint**: mensajes con cabecera y burbujas coherentes.

---

## Phase 5: User Story 3 - Formularios y perfil de PQRS y cambio de clave (Priority: P2)

**Goal**: formularios con la estructura común y error legible.

**Independent Test**: cada formulario en estado inicial, con error de campo y con regla bloqueada, en claro y oscuro.

- [X] T018 [US3] Auditar con las 8 reglas `NewPqrsScreen`, `AdminPqrsDetailScreen` (respuesta del CAE con `ConfirmDialog`) y `ChangePasswordScreen` (expresiva con `AuthLayout`): un solo botón principal con ícono a la izquierda, acciones secundarias, error de campo con `errorText` e ícono, confirmación coherente y objetivos de 48 px (FR-005 y US3). El selector de tipo de `NewPqrsScreen` conserva su `FilterChips` con salto de línea (es una elección de formulario, no un filtro de lista). Anotar el resultado en `screen-inventory.md` y corregir solo lo que se anote.
- [X] T019 [P] [US3] En `src/components/__tests__/darkMode.test.tsx` agregar `StatusBadge` (los tres estados) a `samples`, para que la guarda de modo oscuro lo cubra (colores solo de `darkPalette`).

**Checkpoint**: formularios y cambio de clave auditados, y la insignia cubierta en oscuro.

---

## Phase 6: Polish y documentos

- [X] T020 Ejecutar `npm test`, `npm run lint` y `npm run typecheck` completos en `tutorias_uts_mobile`; confirmar SC-005 y SC-006 (0 textos o reglas de negocio cambiados, guardas de las specs 026 a 029 en verde, `severityIndicators` y `headerBudget` en verde).
- [X] T021 [P] En `docs/Decisions.md` agregar D-127 (filtros compactos de PQRS con `scroll`, cabecera en mensajes y las dos listas de PQRS, `StatusBadge` y `PqrsFiledScreen` con roles de texto, borde de la burbuja ajena en oscuro, guardas ampliadas), con su motivo y alternativas descartadas (R-1, R-2, R-3).
- [X] T022 [P] Completar `specs/026-design-system/screen-inventory.md`: estado de cada pantalla de la fase 4 en claro y oscuro, el defecto de los filtros con su causa y corrección, la confirmación pendiente de «All» y una línea de cierre: con esta fase queda cubierto todo el inventario.
- [ ] T023 [manual, usuario] Recorrido de `quickstart.md` en el teléfono: las 3 pantallas con cabecera, los filtros de PQRS (CAE con sus 3 grupos, y la primera solicitud visible sin desplazar la pantalla en un teléfono de unos 640 px de alto: SC-008), una conversación, el ícono de radicada y las insignias en claro y oscuro, en español e inglés (incluido «All» con letra grande), y el cambio de modo con cada pantalla abierta (SC-002, SC-007, SC-008).
- [ ] T024 Marcar la spec como implementada (`Status` en `spec.md`) cuando T023 esté confirmado.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational**: T002 a T005 en paralelo; T006 después de T005 (la propiedad cumple su prueba).
- **US1 (T007–T013)**: T007, T008, T010 y T011 en paralelo (T010 y T011 necesitan T006); T009 después de T007; T012 después de T010 y T011; T013 al final.
- **US2 (T014–T017)** es independiente de US1: T014 y T015 en paralelo; T016 después; T017 al final.
- **US3 (T018–T019)** después de US1 y US2 (T019 incluye `StatusBadge`).
- **Polish (T020–T024)** al final; T021 y T022 pueden empezar tras US2.

## Parallel Opportunities

- Foundational: T002, T003, T004 y T005 en paralelo (archivos distintos).
- US1 y US2 en paralelo entre sí; dentro de US1: T007, T008, T010 y T011; dentro de US2: T014 y T015.
- Polish: T021 y T022 en paralelo.

## Implementation Strategy

- **MVP**: Foundational + US1 (T001–T013): corrige los filtros de PQRS, que es el defecto que vio la persona dueña del producto, y los dos indicadores medidos.
- **Incremento 2**: US2 (cabecera y burbuja de mensajes).
- **Incremento 3**: US3 y cierre (formularios, documentos, inventario y recorrido manual).
