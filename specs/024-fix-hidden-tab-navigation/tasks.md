# Tasks: Corregir la navegación a las pantallas sin pestaña

**Input**: `specs/024-fix-hidden-tab-navigation/` (plan.md, spec.md, research.md, data-model.md, quickstart.md). No hay `contracts/`: no cambia ningún endpoint.

**Tests**: son parte de la spec (FR-006): la prueba con el router real se escribe antes de la corrección y debe fallar con el código actual.

**Organization**: por historia de usuario. Todo el código está en `tutorias_uts_mobile`; los documentos, en `Claude/docs`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin depender de una tarea incompleta).
- Repositorios (D-077): `mobile/` = `tutorias_uts_mobile`, `docs/` = `Claude/docs`.
- Sin dependencias nuevas, sin cambios de backend, de base de datos ni de diseño visual (FR-008).

---

## Phase 1: Setup

- [X] T001 En `mobile/`: `git fetch origin`, crear la rama `024-fix-hidden-tab-navigation` desde `origin/main` (la 023 ya está fusionada) y correr la línea base (`npm run lint`, `npm run typecheck`, `npm test`); anotar en Notas cuántas pruebas pasan y cualquier falla previa, sin corregirla.

**Checkpoint**: rama lista y línea base conocida.

---

## Phase 2: Foundational

**Purpose**: la declaración única que leen la app y la prueba; no cambia ningún comportamiento todavía.

- [X] T002 Crear `mobile/src/features/shell/roleTabs.config.ts` que exporte `ROLE_TABS: Record<Role, { tabs: TabSpec[]; hidden: Pick<TabSpec, 'name' | 'titleKey'>[] }>` (el tipo `TabSpec` ya está en `RoleTabs.tsx`; moverlo o importarlo sin ciclo). `tabs` copia tal cual lo que declaran hoy `mobile/app/(student)/_layout.tsx`, `(teacher)/_layout.tsx` y `(admin)/_layout.tsx` (sin el `badge` del CAE, que es un dato vivo y lo sigue sumando su layout). `hidden`: `{ name: 'notifications', titleKey: 'notifications.title' }` en los tres roles y, en el CAE, además `{ name: 'changes', titleKey: 'dashboard.admin.changes.title' }`. Sin cambiar los layouts ni `RoleTabs` en esta tarea. Los nombres, títulos e íconos de `tabs` deben quedar idénticos a los de los layouts actuales; T004 no debe cambiarlos.

**Checkpoint**: la configuración existe y `npm run typecheck` pasa.

---

## Phase 3: User Story 1 - La campana abre la bandeja de avisos (Priority: P1) 🎯 MVP

**Goal**: tocar la campana abre la bandeja del rol, y "atrás" regresa a la pestaña de origen, sin cambiar la barra inferior.

**Independent Test**: con los tres roles, tocar la campana desde el inicio y desde otra pestaña y ver la bandeja; volver atrás y regresar al origen.

- [X] T003 [US1] Escribir `mobile/src/features/shell/__tests__/hiddenScreens.test.tsx` (debe fallar con el código actual): con `renderRouter` de `expo-router/testing-library`, la sesión iniciada en `useSession` (`status: 'signedIn'`, `mustChangePassword: false`, el `role` de cada caso), `@/api/client` simulado como en `src/features/notifications/__tests__/inbox.test.tsx` (`unread-count` y listas vacías), y `useChatSocket` y `PushRegistration` simulados. Árbol de rutas: `(rol)/_layout` monta el `RoleTabs` real con `ROLE_TABS[rol]` y una pantalla de relleno por cada `tabs` y cada `hidden` (la de `notifications` muestra `INBOX`). Casos por rol (`it.each` sobre `ROLE_TABS`): (a) desde `index`, tocar la campana real (etiqueta `Notificaciones` o la de `notifications.bellUnread`) deja la ruta en `/notifications` y muestra `INBOX`; (b) desde la primera pestaña que no sea `index`, `router.navigate` a ella, tocar la campana, y `router.back()` regresa a esa pestaña (`screen.getPathname()`); (c) tocar la campana dos veces seguidas deja `/notifications` y un solo `router.back()` regresa a la pestaña de origen. Si la guarda global de accesibilidad (`src/testing/setupA11y.ts`) falla por un control real de `AppBar` o de la barra, es un hallazgo a corregir; si falla solo por los rellenos, llamar a `allowControlIssues()` con un comentario del motivo.
- [X] T004 [US1] Corregir `mobile/src/features/shell/RoleTabs.tsx`: recibir `hidden` y ocultar cada una con `options={{ title: t(titleKey), tabBarItemStyle: { display: 'none' } }}` en lugar de `href: null`; fijar `backBehavior="history"` en `<Tabs>`; quitar la pantalla `notifications` escrita a mano (ahora viene en `hidden`). Actualizar `mobile/app/(student)/_layout.tsx`, `(teacher)/_layout.tsx` y `(admin)/_layout.tsx` para leer su entrada de `ROLE_TABS` (el CAE sigue pasando `badge: filed` a su pestaña de PQRS). Sin tocar estilos de la barra.
- [X] T005 [US1] Correr `hiddenScreens.test.tsx` (debe pasar), `src/features/notifications/__tests__/inbox.test.tsx` y `npm test`; anotar en Notas el resultado antes (T003 fallando con `href: null`) y después.

**Checkpoint**: la campana abre la bandeja en los tres roles; US1 entregable sola.

---

## Phase 4: User Story 2 - El enlace "Cambios" del CAE abre su lista (Priority: P1)

**Goal**: "Ver todos" en el bloque de cambios del dashboard del CAE abre la lista, y "atrás" regresa al dashboard.

**Independent Test**: como CAE, tocar el enlace y ver la lista; volver atrás y ver el dashboard.

- [X] T006 [US2] Ampliar `mobile/src/features/shell/__tests__/hiddenScreens.test.tsx` con el caso del CAE: navegar con `router.push('/(admin)/changes')` (la misma ruta que usa el botón `dashboard.admin.changes.seeAll` en `mobile/src/features/dashboard/screens/AdminDashboardScreen.tsx`) muestra la pantalla `changes` y `router.back()` regresa a `index`. Comprobar que `AdminDashboardScreen.test.tsx` (en `mobile/src/features/dashboard/__tests__/`) ya afirma que el botón empuja exactamente `'/(admin)/changes'`; si no lo afirma, agregar esa línea para que la ruta de la prueba y la del botón no se separen.

**Checkpoint**: la lista de cambios abre; US2 entregable sola (usa la misma corrección de T004).

---

## Phase 5: User Story 3 - Una pantalla sin pestaña nunca vuelve a quedar inalcanzable (Priority: P1)

**Goal**: la suite falla, nombrando la pantalla, si una pantalla sin pestaña no abre o aparece en la barra, o si una ruta nueva no está declarada.

**Independent Test**: volver temporalmente a `href: null` en `RoleTabs` y ver que la prueba falla nombrando la pantalla; devolver la corrección y ver que pasa.

- [X] T007 [US3] En `mobile/src/features/shell/__tests__/hiddenScreens.test.tsx`: por cada rol y cada entrada de `ROLE_TABS[rol].hidden`, navegar a ella y comprobar que se muestra su relleno (el mensaje de fallo debe nombrar la pantalla, por ejemplo `expect(..., name)`); y comprobar que la barra muestra exactamente `tabs.length` pestañas (`screen.getAllByRole('tab')` o el rol que use la barra) y que ninguna lleva el título de una pantalla de `hidden`. Afirmar los conteos esperados escritos a mano (estudiante 5, docente 4, CAE 5), no solo `tabs.length`, para que un error al copiar `tabs` en T002 también falle (SC-004). `display: 'none'` saca el elemento del árbol de accesibilidad de la prueba, por eso el conteo con `getAllByRole` sirve también para FR-005; no cambiarlo por una consulta con `hidden: true`.
- [X] T008 [US3] En el mismo archivo: sin sesión (`status: 'signedOut'`), navegar a la bandeja no la muestra y deja en el inicio de sesión; con `mustChangePassword: true`, navegar a la bandeja (`router.push` a `/(rol)/notifications`) termina en `/change-password` y no muestra `INBOX` (FR-009; las pestañas ni se montan, así que no hay campana que tocar). Si el árbol de relleno no tiene esas rutas, agregarlas como rellenos (`login`, `change-password`).
- [X] T009 [US3] En el mismo archivo (o en `mobile/src/features/shell/__tests__/routeDeclarations.test.ts` si no necesita el router): por cada rol, leer con `fs` las entradas de nivel superior de `mobile/app/(rol)` (archivos `.tsx` sin extensión y carpetas, salvo `_layout`) y comprobar que cada una está en `ROLE_TABS[rol].tabs` o en `ROLE_TABS[rol].hidden`; el mensaje nombra la ruta no declarada.
- [X] T010 [US3] Comprobar que la prueba detecta el error: cambiar temporalmente `tabBarItemStyle: { display: 'none' }` por `href: null` en `RoleTabs.tsx`, ver que `hiddenScreens.test.tsx` falla nombrando `notifications` y `changes`, y devolverlo; anotar en Notas la salida.

**Checkpoint**: las tres historias entregadas; la prueba protege contra una repetición.

---

## Phase 6: Polish y documentación

- [X] T011 [P] Actualizar `docs/Conventions.md` (sección 5, App móvil): una pantalla sin pestaña se declara en `roleTabs.config.ts` (`hidden`) y nunca con `href: null`; toda ruta de nivel superior de `app/(rol)` es una pestaña o una pantalla oculta declarada, y `hiddenScreens.test.tsx` lo vigila.
- [X] T012 [P] Registrar **D-121** en `docs/Decisions.md` (la numeración sigue a D-120): ocultar con `tabBarItemStyle: { display: 'none' }` porque `href: null` bloquea la navegación en Expo Router 58; `backBehavior="history"` (efecto en Android: el botón atrás recorre las pestañas visitadas) y la prueba con router real; descartado `tabBarButton: () => null` (puede dejar un hueco) y probar solo con router simulado. Dejar anotado como pendiente que iOS no tiene botón atrás y que agregarlo a la barra superior sería otra spec.
- [X] T013 Recorrido manual con dispositivo o emulador, con los tres roles, siguiendo "Recorrido manual" de `specs/024-fix-hidden-tab-navigation/quickstart.md` (campana desde el inicio y desde otra pestaña, atrás en Android, "Ver todos" del CAE, la barra sin huecos ni pestañas nuevas con letra grande y modo oscuro, lector de pantalla y salida de la bandeja en iOS); anotar en Notas lo que falle y corregirlo.
- [X] T014 Validación final: `npm run lint`, `npm run typecheck` y `npm test` en `mobile/`; cambiar `Status` de `specs/024-fix-hidden-tab-navigation/spec.md` a `Implemented` y completar Notas.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001) → Foundational (T002) → US1 (T003 → T004 → T005) → US2 (T006) y US3 (T007 a T010), que dependen de la corrección de T004 y escriben en el mismo archivo de prueba, así que van en orden.
- Polish (T011 a T014) al final; T011 y T012 son independientes entre sí.

### Oportunidades de paralelismo

- Solo T011 y T012 (documentos distintos). El resto toca `RoleTabs.tsx` o el mismo archivo de prueba y va en orden.

## Implementation Strategy

### MVP primero (solo US1)

1. T001, T002.
2. T003 (ver fallar), T004, T005.
3. **Parar y validar**: la campana abre la bandeja en los tres roles. Como T004 corrige la causa común, US2 queda resuelta de paso y T006 la deja probada.

### Entrega incremental

1. US1 (campana) → US2 (cambios del CAE) → US3 (guardas) → Polish.
2. Commits en inglés, uno por tarea o grupo lógico (`test(nav): ...`, `fix(nav): ...`, `docs(specs): ...`).

## Notas

- Límite honesto (research.md R-5): la prueba usa pantallas de relleno; comprueba navegación y barra, no el contenido de la bandeja, que ya cubre `inbox.test.tsx`. Que la barra conserve su ancho y que el lector de pantalla no anuncie una pestaña vacía solo se verifica a mano (T013), porque Jest no mide diseño.
- Los documentos usan `mobile/` y `docs/` como atajos de D-077.
- Resultados de la línea base, del antes y después de la corrección y del recorrido manual: se anotan aquí al ejecutar cada tarea.
- **T001**: rama `024-fix-hidden-tab-navigation` en `mobile/` desde `origin/main`; línea base: 99 suites y 821 pruebas en verde, lint y tipos limpios.
- **T003**: la prueba de la campana falló con el código anterior por pantallas duplicadas (`RoleTabs` escribía `notifications` a mano); la causa real (`href: null`) se comprobó en T010.
- **T004/T005**: `RoleTabs` oculta con `tabBarItemStyle` y `backBehavior="history"`; los tres layouts leen `ROLE_TABS` (el CAE suma el contador de PQRS). Hallazgos del camino: (1) en Expo Router 58, `href: null` es `hidden: true`, que redirige a la primera pestaña (era la causa); (2) la barra contaba las pantallas ocultas en la etiqueta de las pestañas ("1 of 6" con 5): se agregó `tabBarAccessibilityLabel` con la posición y el total de las visibles (`tabs.position`, es y en); (3) la guarda de accesibilidad global tenía dos falsos positivos con la barra real: no leía el atributo `role` y no saltaba lo oculto con `display: 'none'`; `src/testing/a11y.ts` se ajustó. Resultado: 100 suites y 844 pruebas en verde, lint y tipos limpios.
- **T006**: `AdminDashboardScreen.test.tsx` ahora afirma que "Ver todo" empuja `/(admin)/changes`, la misma ruta que abre la prueba de `changes`.
- **T007 a T009**: pestañas de cada barra 5, 4 y 5 con su etiqueta de posición; sin sesión y con cambio de contraseña pendiente la bandeja no se abre; cada ruta de `app/(rol)` está declarada. Las pestañas no tienen rol `tab` en esta versión, así que se cuentan por su etiqueta.
- **T010**: con `href: null` fallan 13 casos nombrando el rol y la pantalla (`notifications` en los tres roles y `changes` en el CAE; las campanas); con la corrección, los 22 pasan.
- **T011/T012**: `Conventions.md` §5 y D-121.
- **Hallazgo tras abrir la bandeja (2026-11-23)**: al volverse alcanzable, la bandeja mostró una franja blanca bajo la lista: `NotificationsScreen` reservaba el margen inferior de seguridad (que ya cubre la barra de pestañas) y no pintaba ese espacio. Se quitó el borde inferior y se pintó con el color de la pantalla; prueba en `inbox.test.tsx` (falla sin el arreglo).
- **T013/T014**: recorrido manual hecho por el equipo en el celular (Expo Go): la campana abre la bandeja y los avisos llegan a la bandeja (probado también con un evento de prueba, procesado por el worker en menos de 3 s, y con un aviso de PQRS para `docente.ejemplo`). Spec en `Implemented`. Validación final: 100 suites y 845 pruebas en verde, lint y tipos limpios.
- **Fuera de alcance, detectado**: el correo de avisos solo se envía al dominio de estudiantes (`auth.studentEmailDomain`), por lo que docentes y CAE no reciben correo (`EMAIL_DOMAIN_NOT_ALLOWED`); y el push no puede registrarse en Expo Go. Ambos requieren una spec propia.
