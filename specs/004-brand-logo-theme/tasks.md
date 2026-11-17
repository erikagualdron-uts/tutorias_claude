# Tasks: Logo de marca según el tema

**Input**: `specs/004-brand-logo-theme/` (plan.md, spec.md, research.md, data-model.md, contracts/brand-logo.md, quickstart.md)

**Repo de trabajo**: `tutorias_uts_mobile` para el código; el repo de docs (`Claude`) para `docs/` y `specs/`

**Formato**: `- [ ] T### [P?] [US?] Descripción con ruta`. `[P]` = se puede hacer en paralelo (archivos distintos, sin dependencias abiertas).

**Estado de partida**: el código y la documentación ya están implementados (D-068, commit `898f7b1` en la rama `003-brand-pattern-inputs` del repo móvil). Quedan abiertas la prueba del componente y la verificación en dispositivo.

**Alcance**: solo visual y documentación. No cambiar reglas de negocio ni funcionalidades (FR-008).

## Phase 1: Setup

- [X] T001 Confirmar la línea base: `npm run typecheck`, `npm run lint` y `npm test` en `tutorias_uts_mobile` pasan (75 pruebas) con el cambio aplicado

## Phase 2: Foundational

Sin tareas: los archivos `assets/brand/logo-uts-no-bg-letras-blancas.png` y `assets/brand/logo-uts-blanco.png` ya existen y se usan sin modificar.

## Phase 3: User Story 1 - Logo legible en tema claro y oscuro (P1) MVP

**Meta**: logo de la variante correcta sobre el degradado, sin recuadro y sin deformar (FR-001 a FR-006).

**Prueba independiente**: abrir el login en tema claro y en oscuro (quickstart pasos 2 a 4).

- [X] T002 [US1] En `src/components/BrandLogo.tsx` elegir con `useColorScheme()` entre `logo-uts-no-bg-letras-blancas.png` (claro) y `logo-uts-blanco.png` (oscuro), con `contentFit="contain"` y `accessible={false}`
- [X] T003 [US1] En `src/components/AuthLayout.tsx` quitar la insignia (`logoBadge`) y colocar `BrandLogo` directo sobre el degradado, con ancho 200 (120 con teclado)
- [X] T004 [US1] En `src/components/BrandLogo.tsx` usar la proporción real `aspectRatio: 1448 / 1086` de ambos archivos, en lugar de 632/210 (que estiraba la imagen)
- [X] T005 [US1] Crear `src/components/__tests__/BrandLogo.test.tsx`: con `useColorScheme` simulado en `light` la imagen es `logo-uts-no-bg-letras-blancas.png`; en `dark`, `logo-uts-blanco.png`; en ambos la proporción es 1448/1086 y la imagen está oculta a lectores de pantalla (`accessible` falso)
- [X] T006 [P] [US1] Añadir a `src/components/__tests__/BrandLogo.test.tsx` un caso para `AuthLayout` en `src/components/AuthLayout.tsx`: el logo no tiene un contenedor con fondo de tarjeta detrás (FR-002)
- [X] T007 [US1] Ejecutar `npm run typecheck`, `npm run lint` y `npm test` en `tutorias_uts_mobile` y corregir lo que falle sin cambiar la intención de las pruebas existentes

**Checkpoint**: la historia 1 se valida sola con el quickstart.

## Phase 4: User Story 2 - Documentación alineada con el logo (P2)

**Meta**: la regla está escrita una sola vez y sin referencias a archivos que ya no se usan (FR-007).

**Prueba independiente**: buscar los nombres de logo en `docs/` y `specs/` (quickstart paso 5).

- [X] T008 [P] [US2] `docs/Design.md`: indicar la variante por tema, que va sobre el degradado y que el logo a color queda para superficies blancas, y actualizar la descripción de la cabecera
- [X] T009 [P] [US2] `docs/Conventions.md`: añadir la regla del logo por tema en la línea de marca
- [X] T010 [P] [US2] `docs/Decisions.md`: registrar D-068 con decisión y motivo
- [X] T011 [P] [US2] `specs/002-ui-refresh/contracts/ui-components.md`: corregir las filas de `BrandLogo` y `AuthLayout`
- [X] T012 [US2] Buscar `uts-logo` y `logo-uts` en `docs/` y `specs/`; confirmar que ninguna mención vigente contradice la regla (la tarea histórica T015 de `specs/002-ui-refresh/tasks.md` queda como registro de lo que se hizo entonces) y anotar el resultado en `specs/004-brand-logo-theme/quickstart.md` si hay algo que corregir

## Phase 5: Polish y cierre

- [ ] T013 Recorrer `quickstart.md` en dispositivo o emulador: tema claro, tema oscuro, cambio de tema con la app abierta y teclado abierto (SC-001 a SC-003)
- [ ] T014 Decidir con el usuario si el splash en claro también usa el símbolo lima (hoy usa `logo-uts-blanco.png` en ambos temas, ver spec 003); si cambia, actualizar `docs/Design.md` y registrar la decisión
- [ ] T015 Commitear la spec 004 en el repo de docs y la prueba nueva en el repo móvil (Conventional Commits) y aplicar la "Definición de terminado" de `docs/Conventions.md` (skill `feature-done-check`)

## Dependencias y orden

- T001 primero. T002 a T004 ya están hechas; T005 depende de ellas; T006 depende de T003; T007 va después de T005 y T006.
- La historia 2 es independiente de la 1; T012 va después de T008 a T011.
- T013 a T015 al final, tras las dos historias.

## Paralelismo

- T008, T009, T010 y T011 son archivos distintos y ya están hechas.
- La historia 2 completa puede revisarse en paralelo con T005 a T007.

## Estrategia

- MVP: la historia 1 (T001 a T007); es lo único que cambia lo que ve el usuario y lo único que aún tiene trabajo de código (la prueba).
- Un solo cambio pequeño: no hay código nuevo, solo la prueba y la verificación.
