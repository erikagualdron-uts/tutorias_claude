# Tasks: Tipografía corporativa

**Input**: `specs/005-corporate-typography/` (plan.md, spec.md, research.md, data-model.md, contracts/typography.md, quickstart.md)

**Repo de trabajo**: `tutorias_uts_mobile` (rutas relativas a ese repo, salvo que se indique)

**Formato**: `- [ ] T### [P?] [US?] Descripción con ruta`. `[P]` = se puede hacer en paralelo (archivos distintos, sin dependencias abiertas).

**Alcance**: solo tipografía y arranque. No cambiar reglas de negocio ni funcionalidades (FR-010); las pruebas de 001 a 004 deben seguir pasando. No incluir archivos de Myriad Pro (FR-009).

## Phase 1: Setup

- [X] T001 Confirmar la línea base: `npm run typecheck`, `npm run lint` y `npm test` en `tutorias_uts_mobile` pasan antes de empezar
- [X] T002 Instalar `@expo-google-fonts/source-sans-3` y `@expo-google-fonts/source-code-pro` con `npm i` en `package.json` y anotar los nombres exactos que exportan (400, 600 y 700 de Source Sans 3; 400 de Source Code Pro)

## Phase 2: Foundational (bloquea las historias)

- [X] T003 Reescribir `fonts` en `src/theme/tokens.ts`: `regular` (Source Sans 3 400), `semibold` (600, reemplaza a `medium`), `bold` (700) y `mono` (Source Code Pro 400), con un comentario que indique que cambiar a Myriad Pro es cambiar solo estos valores
- [X] T004 Actualizar `useAppFonts` en `src/theme/index.ts` para cargar con `useFonts` las cuatro fuentes nuevas y devolver `true` cuando carguen o cuando fallen (para no bloquear el arranque)

**Checkpoint**: la app compila con las fuentes nuevas aunque `typography` aún use los tamaños anteriores.

## Phase 3: User Story 1 - Texto con la tipografía institucional (P1) MVP

**Meta**: todos los textos con la fuente corporativa (respaldo) y los tamaños y pesos de `Design.md` (FR-001, FR-002, FR-005, FR-006, FR-008).

**Prueba independiente**: recorrer login, registro, verificación, recuperar, restablecer, cambio de clave, alta de docente, pestañas por rol y el diálogo de clave temporal (quickstart pasos 3 y 6).

- [X] T005 [US1] Actualizar `typography` en `src/theme/tokens.ts` con los valores de `Design.md`: `screenTitle` 26/32 `fonts.bold`; `sectionTitle` 19/26 `fonts.semibold`; `cardTitle` 17/22 `fonts.semibold`; `body` 15/22 `fonts.regular`; `bodySmall` 13/18 `fonts.regular`; `metadata` 13/18 `fonts.regular`; `label` 12/16 `fonts.semibold` con `letterSpacing: 0.24`; `button` 15/20 `fonts.semibold`; `code` 14/20 `fonts.mono`
- [X] T006 [US1] Añadir el estilo `metricNumber` (30/36, `fonts.bold`) a `typography` en `src/theme/tokens.ts`
- [X] T007 [US1] Reemplazar en el código cualquier uso de `fonts.medium` por `fonts.semibold` (buscar `fonts.medium` en `src/` y `app/`)
- [X] T008 [P] [US1] Revisar `src/components/Button.tsx`, `src/components/FieldBox.tsx` y `src/components/AppBar.tsx`: con la tipografía más grande, el alto mínimo de 48 px se mantiene y las etiquetas largas en español no se cortan (ajustar con `flexWrap` o `numberOfLines` solo si hace falta)
- [X] T009 [P] [US1] Revisar `src/components/TemporaryPasswordDialog.tsx`: la clave temporal usa `typography.code` (Source Code Pro) y cabe sin cortarse
- [ ] T010 [P] [US1] Limitar los títulos de tarjeta a 2 líneas con `numberOfLines={2}` y `ellipsizeMode="tail"` donde se use `typography.cardTitle` (`src/components/EmptyState.tsx`, `src/components/Banner.tsx` y otros que lo usen)
- [X] T011 [P] [US1] Prueba en `src/theme/__tests__/typography.test.ts`: cada estilo de `typography` tiene el tamaño, interlineado, fuente y peso de `Design.md` (incluidos `label` con espaciado 0,24 y `metricNumber`), y `fonts.semibold` existe mientras `fonts.medium` no
- [X] T012 [US1] Ejecutar `npm run typecheck`, `npm run lint` y `npm test`; corregir roturas causadas por los tamaños nuevos sin cambiar la intención de las pruebas

**Checkpoint**: la historia 1 se valida sola con el quickstart.

## Phase 4: User Story 2 - Cambio de fuente en un solo lugar (P2)

**Meta**: ningún nombre de fuente ni peso fuera del tema (FR-003, FR-004, FR-009).

**Prueba independiente**: buscar `fontFamily` y `fontWeight` fuera de `src/theme/` (quickstart paso 2).

- [X] T013 [P] [US2] Crear `src/__tests__/noInlineFonts.test.ts`: falla si algún archivo de `src/` o `app/` fuera de `src/theme/` y de `__tests__` contiene `fontFamily` o `fontWeight`
- [X] T014 [P] [US2] Añadir a `src/theme/__tests__/typography.test.ts` una comprobación de que todo nombre de `fonts` es uno de los que carga `useAppFonts` (para que un token nunca apunte a una fuente sin cargar)
- [X] T015 [US2] Quitar los paquetes `@expo-google-fonts/roboto` y `@expo-google-fonts/roboto-mono` de `package.json` y confirmar con búsqueda que `Roboto` no aparece en `src/`, `app/` ni `package.json`
- [X] T016 [US2] Documentar en `docs/Decisions.md` que D-041 (Roboto) queda sustituida por D-051, que el respaldo activo es Source Sans 3 con Source Code Pro, y el procedimiento para pasar a Myriad Pro (agregar archivos con licencia en `assets/fonts/`, cargarlos en `useAppFonts` y cambiar los valores de `fonts`), en el repo de docs

**Checkpoint**: las historias 1 y 2 funcionan juntas.

## Phase 5: User Story 3 - Arranque sin parpadeo de fuente (P3)

**Meta**: splash retenido hasta que cargan las fuentes, con tiempo máximo (FR-007).

**Prueba independiente**: arranques en frío y fallo simulado de carga (quickstart pasos 4 y 5).

- [X] T017 [US3] En `app/_layout.tsx` llamar `SplashScreen.preventAutoHideAsync()` al cargar el módulo y `SplashScreen.hideAsync()` cuando `useAppFonts` indique que terminó, o cuando pasen 5 segundos (lo que ocurra primero); mientras tanto no renderizar la app
- [X] T018 [P] [US3] Prueba en `src/__tests__/splash.test.tsx`: el splash no se oculta mientras las fuentes cargan, se oculta al terminar y se oculta igualmente al fallar o pasar 5 s (con `jest.useFakeTimers` y `expo-splash-screen` simulado)
- [X] T019 [US3] Simular el módulo de fuentes en `jest.setup.tsx` para que las pruebas no dependan de los archivos reales
- [X] T020 [US3] Ejecutar `npm run typecheck`, `npm run lint` y `npm test`

## Phase 6: Polish y cierre

- [ ] T021 Recorrer `quickstart.md` en dispositivo o emulador: textos, clave temporal, arranque en frío, fallo de carga, fuente grande del sistema y español (SC-001 a SC-005)
- [ ] T022 [P] Confirmar en `docs/Design.md` (sección Typography) que lo escrito coincide con lo implementado (respaldo activo y estilos) y ajustarlo solo si difiere
- [ ] T023 Confirmar con la universidad el estado de la licencia y los archivos de Myriad Pro (D-051); no copiarlos desde un equipo sin confirmar
- [ ] T024 Aplicar la "Definición de terminado" de `docs/Conventions.md` (skill `feature-done-check`) y commitear en Conventional Commits, un commit por historia

## Dependencias y orden

- Fase 1 y 2 primero; T003 y T004 bloquean todas las historias.
- US1 (T005 a T012) depende de la fase 2. US2 depende de T003 y T005 (T013 falla si quedan fuentes escritas). US3 depende de T004.
- T015 va después de T003 y T004 (ya no se importa Roboto). T012 va al final de US1.

## Paralelismo

- T008, T009, T010 y T011 son archivos distintos y pueden hacerse a la vez tras T005 a T007.
- T013 y T014 a la vez; T018 en paralelo con T017 si se escribe primero la prueba.
- US3 puede hacerse en paralelo con US1 una vez hecha la fase 2.

## Estrategia

- MVP: fases 1 y 2 más la historia 1 (T001 a T012): la app ya se ve con la tipografía nueva.
- Después US2 (candado que evita regresiones) y al final US3 (arranque).
- Un commit por historia, en Conventional Commits.
- Decisión abierta: la licencia de Myriad Pro (T023) no bloquea esta entrega; se retoma cuando lleguen los archivos.
