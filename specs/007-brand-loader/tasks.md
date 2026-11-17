---

description: "Task list for Loader de la marca"
---

# Tasks: Loader de la marca

**Input**: Design documents from `/specs/007-brand-loader/`

**Prerequisites**: plan.md, spec.md, research.md, contracts/brand-loader.md, quickstart.md

**Tests**: Incluidas. El plan compromete pruebas de las fases, la secuencia, "reducir movimiento", la accesibilidad y la prohibición de `ActivityIndicator`. Escribirlas primero y comprobar que fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. El componente compartido se construye en la fase fundacional; cada historia lo aplica y lo prueba por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1 pantallas, US2 botones, US3 accesibilidad y reducir movimiento, US4 sin spinner del sistema)
- Todas las rutas son relativas al repositorio `tutorias_uts_mobile` (D-077), salvo las de `docs/` y `specs/`, que van en el repositorio `Claude`

## Path Conventions

- Componentes en `src/components/`, pruebas en `src/components/__tests__/`
- Pantallas en `src/features/<feature>/screens/`
- Textos solo en `src/i18n/es.json` y `en.json`; nunca en componentes
- Colores y tiempos solo desde `src/theme/tokens.ts` y la paleta; ningún hexadecimal en componentes
- Comandos: `npm run lint`, `npm run typecheck`, `npm test` (con `--forceExit` si Jest no termina)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Rama de trabajo; no hay dependencias nuevas.

- [X] T001 Crear la rama `007-brand-loader` en `tutorias_uts_mobile` desde `006-cae-configuration` y verificar que `src/icons/registry.ts` ya declara `openBook`, `feather` y `leaf` y que existe `src/components/useMotion.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Constantes de tiempo, textos, fases de espera y el componente `BrandLoader` con su secuencia. Bloquea todas las historias.

**⚠️ CRITICAL**: Ninguna historia empieza hasta terminar esta fase.

- [X] T002 Agregar a `src/theme/tokens.ts`, dentro de `motion`, `loader: { iteration: 900, fadeIn: 250, hold: 400, fadeOut: 250, showAfter: 300, slowAfter: 1000 }` (milisegundos, según `contracts/brand-loader.md`)
- [X] T003 [P] Agregar la clave `common.loadingSlow` en `src/i18n/es.json` ("Cargando… Esto está tardando más de lo normal.") y en `src/i18n/en.json` ("Loading… This is taking longer than usual.") manteniendo `common.loading` y la paridad de claves
- [X] T004 [P] Escribir `src/components/__tests__/useLoaderPhase.test.tsx` con temporizadores simulados: la fase es `hidden` antes de 300 ms, `loader` entre 300 y 1000 ms y `slow` pasados 1000 ms; al desmontar se cancelan los temporizadores; al volver a montar el conteo empieza de cero
- [X] T005 Implementar `src/components/useLoaderPhase.ts`: hook que al montarse programa dos temporizadores con `motion.loader.showAfter` y `motion.loader.slowAfter`, devuelve `'hidden' | 'loader' | 'slow'` y los limpia al desmontarse
- [X] T006 [P] Escribir `src/components/__tests__/BrandLoader.test.tsx` (primera parte): el tamaño regular no pinta nada antes de 300 ms; después muestra un solo ícono visible y el primero es el libro; el orden es libro → pluma → hoja → libro; el tamaño compacto se pinta de inmediato y nunca muestra aviso; pasados 1000 ms el tamaño regular muestra `common.loadingSlow`; el color por defecto es el primario del tema y la propiedad `color` lo cambia
- [X] T007 Implementar `src/components/BrandLoader.tsx` según `contracts/brand-loader.md`: propiedades `size` (`regular` 48 px, `compact` 20 px) y `color`; tres `Icon` apilados (`openBook`, `feather`, `leaf`) cuya opacidad deriva de un único valor compartido de Reanimated que recorre 0 a 3 en `3 × motion.loader.iteration` en bucle, con mapa `[i, i + 0.278, i + 0.722, i + 1] → [0, 1, 1, 0]`; el tamaño regular usa `useLoaderPhase` (no pinta en `hidden`, muestra el aviso debajo en `slow` con el estilo `typography.body` y el color secundario del tema); el tamaño compacto se pinta de inmediato y sin aviso; sin textos ni hexadecimales escritos en el archivo

**Checkpoint**: `BrandLoader` listo y probado — las historias pueden comenzar.

---

## Phase 3: User Story 1 - Ver un loader propio de la UTS al cargar una pantalla (Priority: P1) 🎯 MVP

**Goal**: Las pantallas y áreas de contenido muestran el loader de la marca en su primera carga, con las fases de espera, y nunca en actualizaciones en segundo plano.

**Independent Test**: Abrir el listado de periodos con la red lenta: nada en los primeros 300 ms, luego un solo ícono en secuencia y, pasado 1 segundo, el aviso de demora; con datos ya visibles, volver a la pantalla no muestra el loader.

### Tests for User Story 1 ⚠️ (escribir primero, deben fallar)

- [X] T008 [P] [US1] Escribir `src/components/__tests__/LoadingScreen.test.tsx`: la pantalla de espera no muestra el loader antes de 300 ms y sí después, y expone el elemento de progreso
- [X] T009 [P] [US1] Escribir `src/features/periods/__tests__/loader.test.tsx`: `PeriodsScreen` muestra el loader (tras 300 ms) mientras la consulta no tiene datos, lo retira al llegar los datos y no lo muestra en una actualización en segundo plano (invalidar la consulta con datos ya visibles)

### Implementation for User Story 1

- [X] T010 [US1] Reemplazar `ActivityIndicator` por `BrandLoader` regular en `src/components/LoadingScreen.tsx`, conservando el fondo `palette.screen` y el centrado
- [X] T011 [P] [US1] Reemplazar `ActivityIndicator` por `BrandLoader` regular en `src/features/periods/screens/PeriodsScreen.tsx` y `src/features/periods/screens/PeriodFormScreen.tsx`, y ajustar `src/features/periods/__tests__/periods.test.tsx` si dependía del indicador anterior
- [X] T012 [P] [US1] Reemplazar `ActivityIndicator` por `BrandLoader` regular en `src/features/rooms/screens/RoomsScreen.tsx`, `RoomFormScreen.tsx`, `LocationsScreen.tsx` y `LocationFormScreen.tsx`, y ajustar `src/features/rooms/__tests__/rooms.test.tsx` si dependía del indicador anterior
- [X] T013 [P] [US1] Reemplazar `ActivityIndicator` por `BrandLoader` regular en `src/features/dropdown-lists/screens/DropdownListsScreen.tsx`, `DropdownItemsScreen.tsx` y `DropdownItemFormScreen.tsx`, y ajustar `src/features/dropdown-lists/__tests__/dropdowns.test.tsx` si dependía del indicador anterior

**Checkpoint**: US1 funcional: todas las pantallas cargan con el loader de la marca.

---

## Phase 4: User Story 2 - Ver el loader dentro de un botón en carga (Priority: P1)

**Goal**: Un botón con acción en curso muestra el loader compacto de inmediato, sin cambiar de tamaño y sin aceptar otra pulsación.

**Independent Test**: Pulsar "Guardar" con la red lenta: el ícono del botón se reemplaza de inmediato por el loader compacto, el botón no cambia de tamaño y la acción no se repite.

### Tests for User Story 2 ⚠️

- [X] T014 [P] [US2] Ampliar `src/components/__tests__/Button.test.tsx`: un botón en `loading` muestra el loader compacto de inmediato, no muestra el aviso de demora aunque pasen 1500 ms, conserva su contenido dentro de la misma caja (el ancho no cambia), y una segunda pulsación no vuelve a llamar a la acción

### Implementation for User Story 2

- [X] T015 [US2] Reemplazar en `src/components/Button.tsx` el `ActivityIndicator` por `BrandLoader` compacto con el color del texto del botón (`colors.text`), manteniendo el contenido oculto dentro de la misma caja, el botón deshabilitado y el estado ocupado accesible

**Checkpoint**: US1 y US2 funcionan por separado.

---

## Phase 5: User Story 3 - Accesibilidad y "reducir movimiento" (Priority: P2)

**Goal**: Los lectores de pantalla anuncian la carga una sola vez y, con "reducir movimiento", el ícono cambia sin fundido.

**Independent Test**: Con lector de pantalla, una carga se anuncia como "Cargando…" y el aviso de demora se anuncia una sola vez; con "reducir movimiento", los íconos cambian de golpe cada 900 ms.

### Tests for User Story 3 ⚠️

- [X] T016 [P] [US3] Escribir `src/components/__tests__/BrandLoader.a11y.test.tsx`: el contenedor tiene rol `progressbar`, etiqueta `common.loading` y estado ocupado; los íconos están ocultos a los lectores y la etiqueta no cambia con el ícono; `AccessibilityInfo.announceForAccessibility` se llama una sola vez cuando aparece el aviso de demora; con "reducir movimiento" la opacidad de los íconos es 1 o 0 sin valores intermedios y cambia cada 900 ms; con el idioma en inglés la etiqueta es "Loading…"

### Implementation for User Story 3

- [X] T017 [US3] Completar `src/components/BrandLoader.tsx`: contenedor con `accessibilityRole="progressbar"`, `accessibilityLabel` de `common.loading` y `accessibilityState={{ busy: true }}`; íconos con `importantForAccessibility="no-hide-descendants"`; anuncio único del aviso con `AccessibilityInfo.announceForAccessibility(t('common.loadingSlow'))` al pasar a `slow`; con `useMotion().movement` en falso, la opacidad de cada ícono es 1 mientras `floor(t) === i` y 0 en los demás casos

**Checkpoint**: US3 verificada en las pruebas.

---

## Phase 6: User Story 4 - Ningún spinner del sistema en la app (Priority: P2)

**Goal**: Todo estado de carga usa el loader de la marca y una verificación automática impide volver al spinner del sistema.

**Independent Test**: La prueba automática recorre `app/` y `src/` y no encuentra `ActivityIndicator`; si se agrega uno, falla.

### Tests for User Story 4 ⚠️

- [X] T018 [P] [US4] Escribir `src/__tests__/noActivityIndicator.test.ts` (mismo patrón que `noOtherIconLibs.test.ts`): recorre `app/` y `src/` excluyendo `__tests__/` y falla si algún archivo contiene `ActivityIndicator`

### Implementation for User Story 4

- [X] T019 [US4] Buscar con `grep` cualquier `ActivityIndicator` que haya quedado en `app/` y `src/` (incluidas las pantallas de acceso y registro), reemplazarlo por `BrandLoader`, quitar imports sin uso y confirmar que `src/__tests__/noActivityIndicator.test.ts` pasa

**Checkpoint**: todas las historias funcionales.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentación y cierre según la Definición de terminado.

- [X] T020 [P] Actualizar en el repositorio `Claude`: `docs/Decisions.md` (D-078 pasa a "Implementada"; en D-049 agregar que los íconos de hoja, pluma y libro también se usan, de forma funcional, en el loader) y revisar que `docs/Design.md`, sección Loader, coincida con los valores finales
- [X] T021 Ejecutar `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; corregir todo error y confirmar que la suite completa pasa
- [X] T022 Verificar que no hay hexadecimales, nombres de fuente ni textos escritos en `src/components/BrandLoader.tsx`, `useLoaderPhase.ts`, `Button.tsx` ni `LoadingScreen.tsx`, que el botón en carga conserva sus 48 px de alto y que los íconos salen del registro
- [ ] T023 Recorrer `specs/007-brand-loader/quickstart.md` en el emulador (red lenta, error tras demora, actualización en segundo plano, botones, arranque, "reducir movimiento", lector de pantalla e idioma) y medir SC-007 con al menos 5 personas
- [ ] T024 Ejecutar la skill `feature-done-check` y atender sus observaciones antes de abrir el Pull Request

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias. Orden interno: T002 → T005 → T007; T003 es independiente; T004 antes de T005 y T006 antes de T007 (pruebas primero).
- **US1 (Phase 3)** y **US2 (Phase 4)**: dependen de Foundational y no dependen entre sí.
- **US3 (Phase 5)**: depende de Foundational (modifica `BrandLoader.tsx`, así que va después de T007).
- **US4 (Phase 6)**: depende de que US1 y US2 hayan reemplazado los usos (T010 a T013 y T015); T018 puede escribirse antes y debe fallar hasta entonces.
- **Polish (Phase 7)**: depende de las historias deseadas.

### User Story Dependencies

- **US1**: tras Foundational; sin dependencias de otras historias.
- **US2**: tras Foundational; sin dependencias de otras historias.
- **US3**: tras Foundational; refina el componente que usan US1 y US2.
- **US4**: verifica el resultado de US1 y US2.

### Within Each User Story

- Pruebas primero y deben fallar.
- Componente compartido antes que las pantallas que lo usan.
- Un cambio de pantalla por archivo: las tareas [P] tocan archivos distintos.

### Parallel Opportunities

- T003 junto con T002; T004 y T006 (pruebas) en paralelo.
- Dentro de US1: T008 y T009; T011, T012 y T013 (pantallas distintas).
- US1 y US2 pueden repartirse entre personas tras Foundational.
- T016 y T018 (pruebas de US3 y US4) en paralelo.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 juntas:
Task: "Prueba de LoadingScreen en src/components/__tests__/LoadingScreen.test.tsx"
Task: "Prueba de PeriodsScreen en src/features/periods/__tests__/loader.test.tsx"

# Reemplazos de pantallas en paralelo:
Task: "Pantallas de periodos en src/features/periods/screens/"
Task: "Pantallas de salones y ubicaciones en src/features/rooms/screens/"
Task: "Pantallas de listas desplegables en src/features/dropdown-lists/screens/"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup y Foundational (el componente y sus fases, con pruebas).
2. US1: todas las pantallas cargan con el loader de la marca.
3. **Detener y validar** con el recorrido de `quickstart.md` (pasos 1 a 5 y 7).

### Incremental Delivery

1. Foundational → componente listo.
2. US1 → pantallas con loader (MVP).
3. US2 → botones con loader compacto.
4. US3 → accesibilidad y "reducir movimiento".
5. US4 → prueba que impide volver al spinner del sistema.
6. Polish, recorrido manual y `feature-done-check`.

---

## Notes

- Una tarea por commit o grupo lógico, en Conventional Commits en inglés (`feat(loader): ...`).
- Las pantallas ya usan `isPending` de TanStack Query, por lo que "solo en la primera carga" no requiere cambiar las consultas (research R-4).
- Si el plan contradice `docs/Architecture.md` o `docs/Design.md`, detenerse y preguntar.
