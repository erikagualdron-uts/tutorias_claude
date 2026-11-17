---

description: "Task list for Loader de la marca, versión 2"
---

# Tasks: Loader de la marca, versión 2

**Input**: Design documents from `/specs/009-brand-loader-v2/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/brand-loader.md, quickstart.md

**Tests**: Incluidas. El plan compromete pruebas de los desplazamientos, el giro, los fundidos de los botones, "reducir movimiento" y la accesibilidad. Escribirlas primero y comprobar que fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. Las cuatro historias modifican el mismo componente (`BrandLoader.tsx`), así que se implementan en orden de prioridad y no en paralelo entre sí; dentro de cada una, las pruebas y los archivos distintos sí van en paralelo.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1 anillo, US2 sacudida de entrada y salida, US3 botones, US4 "reducir movimiento" y accesibilidad)
- Todas las rutas son relativas al repositorio `tutorias_uts_mobile` (D-077), salvo las de `docs/` y `specs/`, que van en el repositorio `Claude`

## Path Conventions

- Componentes en `src/components/`, pruebas en `src/components/__tests__/`
- Tiempos, desplazamientos y tamaños solo desde `src/theme/tokens.ts`; colores solo desde la paleta; ningún hexadecimal ni texto escrito en los componentes
- Comandos: `npm run lint`, `npm run typecheck`, `npm test` (con `--forceExit` si Jest no termina)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Rama limpia y prueba de concepto que decide cómo se logra la salida animada (research R-2).

- [X] T001 Dejar limpio el árbol de `tutorias_uts_mobile` antes de empezar: confirmar en su propia rama (por ejemplo `008-date-field`) o guardar con `git stash` los cambios sin commit de otras sesiones (hoy `jest.setup.tsx`, `src/features/periods/`, `src/i18n/`), porque T004 edita `jest.setup.tsx` y no debe mezclarse con trabajo ajeno; verificar con `git status` y crear la rama `009-brand-loader-v2` desde la rama que contiene la 007 (`008-date-field` o la que la haya unido)
- [ ] T002 Prueba de concepto en el emulador, con un componente temporal que no se confirma: comprobar con `Keyframe`/`FadeOut` de Reanimated 4.7 que (a) al quitar el loader su salida se reproduce, (b) el contenido ocupa su sitio al instante y la salida se superpone, (c) si se quita durante la entrada la salida no salta; anotar el resultado y la estrategia elegida (animaciones de salida de Reanimated o propiedad `visible` con el componente montado durante la salida) en `specs/009-brand-loader-v2/research.md`, sección R-2

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tokens, simulación de pruebas y la matemática pura del movimiento. Bloquea todas las historias.

**⚠️ CRITICAL**: Ninguna historia empieza hasta terminar esta fase.

- [X] T003 Agregar a `src/theme/tokens.ts`, dentro de `motion.loader`, `ring: { regular: { size: 64, stroke: 3 }, compact: { size: 28, stroke: 2 }, sweepDegrees: 90, turn: 1000, pulse: 1200, pulseMin: 0.4, trackOpacity: 0.2 }` y `shake: { enter: { duration: 350, offsets: [0, -6, 6, -3, 3, 0] }, exit: { duration: 250, offsets: [0, 6, -6, 3, 0] }, fade: 150 }` (milisegundos y píxeles, según `contracts/brand-loader.md`)
- [X] T004 [P] Ampliar la simulación global de Reanimated en `jest.setup.tsx` con lo que usará el componente (`Keyframe`, `FadeOut`, `withSequence`, `Easing.bezier`) para que registre qué animaciones de entrada y salida recibe una vista, conservando lo que ya simula
- [X] T005 [P] Escribir `src/components/__tests__/brandLoaderMotion.test.ts` con las funciones puras: los desplazamientos de la entrada (`0, −6, +6, −3, +3, 0`) y de la salida (`0, +6, −6, +3, 0`) con sus duraciones de 350 y 250 ms, la opacidad de 0 a 1 en la entrada y de 1 a 0 en la salida, que cada salida puede arrancar desde un desplazamiento y una opacidad actuales sin saltos, el giro de 0° a 360° en 1000 ms y el pulso entre 0,4 y 1 cada 1200 ms
- [X] T006 Implementar `src/components/brandLoaderMotion.ts` con las funciones puras probadas en T005 (construcción de los fotogramas de entrada y salida a partir de los tokens, ángulo del anillo y opacidad del pulso por instante), sin importar Reanimated

**Checkpoint**: Base lista — las historias pueden comenzar.

---

## Phase 3: User Story 1 - Ver un anillo que indica que la app está cargando (Priority: P1) 🎯 MVP

**Goal**: El ícono de la marca va rodeado de un anillo giratorio (pista tenue y arco de 90°) en pantallas y botones.

**Independent Test**: Con la red lenta, pasados 300 ms aparece el ícono dentro de un anillo cuyo arco da una vuelta por segundo sin saltos, y desaparece junto con el ícono al llegar los datos.

### Tests for User Story 1 ⚠️ (escribir primero, deben fallar)

- [X] T007 [P] [US1] Escribir `src/components/__tests__/LoaderRing.test.tsx`: dibuja una pista y un arco del mismo radio; el tamaño regular mide 64 px con trazo de 3 px y el compacto 28 px con trazo de 2 px; el arco abarca un cuarto de la circunferencia con extremos redondeados; la pista tiene opacidad 0,2 y el color recibido; el giro recorre 0° a 360° en 1000 ms en bucle y de forma lineal; el anillo está oculto a los lectores de pantalla
- [X] T008 [P] [US1] Ampliar `src/components/__tests__/BrandLoader.test.tsx`: el tamaño regular reserva 64 px y el compacto 28 px; el ícono sigue midiendo 48 y 20 px y queda centrado dentro del anillo; el color por defecto es el verde primario en claro y el texto casi blanco en oscuro, y la propiedad `color` lo cambia en ícono y anillo; el aviso de demora aparece debajo sin solaparse con el anillo

### Implementation for User Story 1

- [X] T009 [US1] Implementar `src/components/LoaderRing.tsx`: dos círculos de `react-native-svg` (pista con `strokeOpacity` igual a `motion.loader.ring.trackOpacity` y arco con `strokeDasharray` de un cuarto de la circunferencia y `strokeLinecap="round"`), contenidos en una vista de Reanimated que rota con un valor compartido lineal en bucle (`motion.loader.ring.turn`); propiedades `size` (`regular` o `compact`) y `color`; sin hexadecimales
- [X] T010 [US1] Integrar el anillo en `src/components/BrandLoader.tsx`: el contenedor visible mide `motion.loader.ring.regular.size` o `compact.size`, el anillo rodea el ícono (48 o 20 px) centrado y derecho, y el aviso de demora se coloca debajo con separación suficiente para no tocar el anillo; las fases, la secuencia de íconos, el color y la accesibilidad de la 007 se conservan

**Checkpoint**: US1 funcional: ícono con anillo giratorio en pantallas y botones.

---

## Phase 4: User Story 2 - Entrada y salida con una sacudida lateral suave (Priority: P1)

**Goal**: El loader regular entra (350 ms) y sale (250 ms) con una sacudida lateral amortiguada mientras se desvanece, sin retrasar el contenido.

**Independent Test**: Con la red lenta, el loader aparece con una sacudida de unos 350 ms y, al llegar los datos, se va con una de unos 250 ms mientras el contenido ya se ve; en cargas de menos de 300 ms no se ve nada.

### Tests for User Story 2 ⚠️

- [X] T011 [P] [US2] Escribir `src/components/__tests__/BrandLoader.motion.test.tsx`: el tamaño regular recibe una animación de entrada de 350 ms con los desplazamientos `0, −6, +6, −3, +3, 0` y una de salida de 250 ms con `0, +6, −6, +3, 0`; antes de 300 ms no se pinta ni se anima nada y el espacio de 64 px queda reservado; al desmontar durante la espera no queda ninguna animación pendiente; si el loader se quita con la entrada a medias, la salida parte del desplazamiento y la opacidad que tenía en ese instante, sin saltos; el tamaño compacto no recibe sacudida; el aviso de demora sale junto con el conjunto

### Implementation for User Story 2

- [X] T012 [US2] Aplicar en `src/components/BrandLoader.tsx` la entrada y la salida con los fotogramas de `src/components/brandLoaderMotion.ts` siguiendo la estrategia validada en T002: la vista animada solo existe cuando la fase es `loader` o `slow`, el espacio de 64 px se reserva durante la fase `hidden`, la salida se superpone al contenido sin retrasarlo y, si se quita durante la entrada, arranca desde el estado actual
- [X] T013 [US2] Ajustar `src/features/periods/__tests__/loader.test.tsx` y las pruebas de pantallas de salones, ubicaciones y listas si dependían de la estructura del loader v1, y comprobar que el contenido aparece sin esperar la salida

- [X] T014 [US2] *(no aplicable por ahora: se usaron las animaciones de salida de Reanimated; se retoma si T023 muestra que no funcionan)* **Solo si T002 elige la propiedad `visible`** (research R-2): agregar la propiedad `visible` a `src/components/BrandLoader.tsx` para que el componente siga montado durante la salida, y pasarla desde las 9 pantallas (`src/features/periods/screens/PeriodsScreen.tsx` y `PeriodFormScreen.tsx`, `src/features/rooms/screens/RoomsScreen.tsx`, `RoomFormScreen.tsx`, `LocationsScreen.tsx` y `LocationFormScreen.tsx`, `src/features/dropdown-lists/screens/DropdownListsScreen.tsx`, `DropdownItemsScreen.tsx` y `DropdownItemFormScreen.tsx`) y desde `src/components/LoadingScreen.tsx`, mostrando el contenido ya listo mientras el loader termina su salida; con pruebas en las pantallas afectadas. Si T002 elige las animaciones de salida de Reanimated, marcar esta tarea como no aplicable

**Checkpoint**: US1 y US2 funcionan juntas en pantallas.

---

## Phase 5: User Story 3 - Loader compacto con anillo dentro de los botones (Priority: P2)

**Goal**: El botón en carga muestra el ícono compacto con su anillo, con un fundido de 150 ms, sin sacudida y sin cambiar de tamaño.

**Independent Test**: Al pulsar "Guardar" con la red lenta, el ícono del botón se reemplaza de inmediato, con un fundido corto, por el ícono pequeño con su anillo girando; el botón no cambia de tamaño y no hay sacudida ni aviso.

### Tests for User Story 3 ⚠️

- [X] T015 [P] [US3] Ampliar `src/components/__tests__/Button.test.tsx`: el botón en `loading` muestra el loader compacto con su anillo de 28 px con el color del texto del botón; recibe un fundido de entrada y uno de salida de 150 ms y ninguna sacudida; no muestra aviso de demora; conserva su contenido dentro de la misma caja (el ancho y el alto no cambian) y no repite la acción

### Implementation for User Story 3

- [X] T016 [US3] Aplicar en `src/components/BrandLoader.tsx` el camino compacto: sin espera de 300 ms, `FadeIn` y `FadeOut` de `motion.loader.shake.fade` (150 ms), sin sacudida y sin aviso; comprobar en `src/components/Button.tsx` que el anillo de 28 px cabe en el botón más bajo sin recortarse ni cambiar su tamaño y ajustar el contenedor del loader si hiciera falta

**Checkpoint**: US1 a US3 funcionan en pantallas y botones.

---

## Phase 6: User Story 4 - "Reducir movimiento" y accesibilidad (Priority: P2)

**Goal**: Con "reducir movimiento" no hay sacudida ni giro; la accesibilidad de la 007 se mantiene con el anillo.

**Independent Test**: Con "reducir movimiento" activado, el loader entra y sale con un fundido corto, el anillo queda fijo con el arco pulsando y no hay sacudida; con el lector de pantalla, se anuncia un solo "Cargando…".

### Tests for User Story 4 ⚠️

- [X] T017 [P] [US4] Ampliar `src/components/__tests__/BrandLoader.a11y.test.tsx`: con "reducir movimiento" la entrada y la salida son `FadeIn` y `FadeOut` de 150 ms y no hay sacudida, el anillo no rota y su arco pulsa entre 0,4 y 1 de opacidad cada 1200 ms, y el ícono cambia sin fundido; con o sin "reducir movimiento" el contenedor es un único elemento de progreso con la etiqueta traducida, el anillo y el ícono ocultos a los lectores, y el aviso de demora se anuncia una sola vez

### Implementation for User Story 4

- [X] T018 [US4] Implementar la rama de "reducir movimiento" (`useMotion().movement` en falso) en `src/components/BrandLoader.tsx` y `src/components/LoaderRing.tsx`: fundidos de 150 ms en lugar de sacudida, anillo sin rotación con el arco pulsando entre `motion.loader.ring.pulseMin` y 1 cada `motion.loader.ring.pulse` ms, e ícono con `iconOpacity(..., animated = false)`; verificar que el anillo y el ícono siguen ocultos a los lectores

**Checkpoint**: todas las historias funcionales.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentación y cierre según la Definición de terminado.

- [X] T019 [P] Actualizar `specs/007-brand-loader/contracts/brand-loader.md` con una nota al inicio que indique que fue reemplazado por el contrato de la 009, agregar en `specs/007-brand-loader/spec.md` una nota junto a FR-004 y FR-005 ("Reemplazado por la spec 009"), y revisar que las pruebas de la 007 que asumían un solo ícono sin anillo (`BrandLoader.test.tsx`, `BrandLoader.a11y.test.tsx`) reflejen el comportamiento nuevo
- [X] T020 [P] Actualizar en el repositorio `Claude` `docs/Decisions.md` (D-080 pasa a "Implementada"; D-078 conserva la nota de reemplazo parcial) y `docs/Design.md` (sección Loader) si la prueba de concepto (T002) cambió cómo se logra la salida, sin cambiar el comportamiento visible
- [X] T021 Ejecutar `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; corregir todo error y confirmar que la suite completa pasa, incluida la prueba contra `ActivityIndicator`
- [X] T022 Verificar que no hay hexadecimales, nombres de fuente ni textos escritos en `src/components/BrandLoader.tsx`, `LoaderRing.tsx` ni `brandLoaderMotion.ts`, que el anillo usa solo colores del tema y que el botón en carga conserva su tamaño
- [ ] T023 Recorrer `specs/009-brand-loader-v2/quickstart.md` en el emulador (anillo, sacudida de entrada y salida, aviso de demora, carga rápida, botones, modo oscuro, "reducir movimiento", lector de pantalla y texto grande) y medir SC-008 con al menos 5 personas
- [ ] T024 Ejecutar la skill `feature-done-check` y atender sus observaciones antes de abrir el Pull Request

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 antes de T002 y de cualquier edición (árbol limpio, sin cambios de otras sesiones en `jest.setup.tsx`); T002 bloquea T012 (la estrategia de salida) y decide si se hace T014 (propiedad `visible`).
- **Foundational (Phase 2)**: depende de Setup; bloquea las historias. Orden interno: T003 antes de T006; T004 antes de las pruebas que usan la simulación; T005 antes de T006 (pruebas primero).
- **US1 (Phase 3) → US2 (Phase 4) → US3 (Phase 5) → US4 (Phase 6)**: las cuatro modifican `BrandLoader.tsx`, así que van en ese orden; las pruebas de cada historia se escriben antes de su implementación.
- **Polish (Phase 7)**: depende de las historias deseadas.

### User Story Dependencies

- **US1**: tras Foundational; entrega el anillo y es el alcance mínimo útil.
- **US2**: tras US1; depende del resultado de la prueba de concepto (T002).
- **US3**: tras US2 (comparte el componente; usa el tamaño compacto).
- **US4**: tras US3; refina el componente para el modo de movimiento reducido.

### Within Each User Story

- Pruebas primero y deben fallar.
- Módulo puro y tokens antes del componente.
- Componente antes de las pantallas que lo usan (las pantallas no cambian de código).

### Parallel Opportunities

- T004 y T005 (simulación y pruebas puras) en paralelo tras T003.
- Dentro de US1: T007 y T008 (pruebas de archivos distintos).
- T019 y T020 (documentación) en paralelo.
- Las historias no se paralelizan entre sí porque comparten `BrandLoader.tsx`.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 juntas:
Task: "Prueba del anillo en src/components/__tests__/LoaderRing.test.tsx"
Task: "Ampliar src/components/__tests__/BrandLoader.test.tsx con el anillo"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup, con la prueba de concepto de la salida (T002).
2. Foundational (tokens, simulación y movimiento puro).
3. US1: el anillo giratorio en pantallas y botones.
4. **Detener y validar** con el recorrido de `quickstart.md` (pasos 1, 6 y 7).

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → anillo (MVP).
3. US2 → sacudida de entrada y salida.
4. US3 → botones con fundido.
5. US4 → "reducir movimiento" y accesibilidad.
6. Polish, recorrido manual y `feature-done-check`.

---

## Notes

- Una tarea por commit o grupo lógico, en Conventional Commits en inglés (`feat(loader): ...`).
- Si la prueba de concepto (T002) obliga a usar la propiedad `visible`, las pantallas dejan de ser solo consumidoras: la tarea T014 pasa esa propiedad desde los 9 puntos de uso; si no hace falta, T014 se marca como no aplicable.
- Si el plan contradice `docs/Architecture.md` o `docs/Design.md`, detenerse y preguntar.
