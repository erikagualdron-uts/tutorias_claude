# Tasks: Ajustes visuales de marca e inputs

**Input**: `specs/003-brand-pattern-inputs/` (plan.md, spec.md, research.md, data-model.md, contracts/ui-components.md, quickstart.md)

**Repo de trabajo**: `tutorias_uts_mobile` (rutas relativas a ese repo, salvo que se indique)

**Formato**: `- [ ] T### [P?] [US?] Descripción con ruta`. `[P]` = se puede hacer en paralelo (archivos distintos, sin dependencias abiertas).

**Alcance**: solo visual y de texto. No cambiar reglas de negocio ni funcionalidades (FR-016); las pruebas de 001 y 002 deben seguir pasando.

## Phase 1: Setup

- [X] T001 Confirmar la línea base: ejecutar `npm run typecheck`, `npm run lint` y `npm test` en `tutorias_uts_mobile` y anotar que todo pasa antes de empezar

## Phase 2: Foundational (bloquea las historias)

- [X] T002 [P] Añadir a `Palette` en `src/theme/colors.ts` los tokens derivados `inputFill`, `inputBorder` y `inputBorderFocus`, y exportarlos desde `src/theme/index.ts`. Claro: relleno `#F2F4EF` sobre tarjeta, `#FFFFFF` sobre fondo de pantalla, borde `#C9D0C3`, foco `#4E7A2F`. Oscuro: relleno `#0B1710`, borde `rgba(255,255,255,0.16)`, foco `#C3D730`. Marcarlos como derivados en el comentario
- [X] T003 [P] Registrar en `src/icons/registry.ts` los íconos nuevos como literales: `leaf` (`mdi:leaf`), `feather` (`mdi:feather`), `openBook` (`mdi:book-open-page-variant`) con comentario "decorativos, set mdi permitido por D-049", y `chevronDown` y `search` del set `solar` (verificar nombres en icones.js.org)
- [X] T004 [P] Ajustar `src/__tests__/noOtherIconLibs.test.ts` para permitir `mdi:` solo en las tres claves decorativas del patrón y seguir rechazando otras librerías

**Checkpoint**: tokens e íconos disponibles; la app sigue compilando.

## Phase 3: User Story 1 - Campos que se leen como campos (P1) MVP

**Meta**: todo campo con relleno, borde tenue, ícono a la izquierda y estados de foco, error y deshabilitado.

**Prueba independiente**: abrir login, registro, verificación, recuperar, restablecer, cambio de clave y alta de docente y comprobar cada estado (quickstart pasos 1 a 3).

- [X] T005 [US1] Reescribir `src/components/TextField.tsx`: alto 52, radio `radius.input` (12), relleno horizontal 16, borde 1 px `inputBorder`, relleno `inputFill` (prop `onCard`, true por defecto; blanco si es false), `leadingIcon` obligatorio de 20 px en `textSecondary`, placeholder `#767676`, botón mostrar/ocultar a la derecha en contraseñas
- [X] T006 [US1] En `src/components/TextField.tsx` añadir estados con transición de 150 ms (Reanimated, sin animación con reducir movimiento vía `useMotion`): foco = borde 2 px `inputBorderFocus`, relleno blanco, halo `0 0 0 4px rgba(78,122,47,0.15)` y etiqueta `#34531F`; error = borde 1 px `#B3261E`, halo `rgba(179,38,30,0.12)` y mensaje debajo con ícono `error` en `#B3261E`; el error prevalece sobre el foco; deshabilitado = opacidad 0.6 y sin halo (`editable=false`)
- [X] T007 [P] [US1] Crear `src/components/TextAreaField.tsx` sobre la base de `TextField`: crece hasta 6 líneas y muestra el contador dentro, abajo a la derecha
- [X] T008 [P] [US1] Crear `src/components/SelectField.tsx` sobre la base de `TextField`: ícono a la izquierda, chevron `chevronDown` al final, abre la lista recibida por props, mismos estados
- [X] T009 [P] [US1] Crear `src/components/SearchField.tsx` sobre la base de `TextField`: ícono `search` a la izquierda y botón de limpiar al final cuando hay texto (`accessibilityLabel` desde i18n)
- [X] T010 [US1] Extraer de `TextField.tsx` la caja visual (relleno, borde, halo, ícono) a un componente interno compartido `src/components/FieldBox.tsx` y reutilizarlo en `TextField`, `TextAreaField`, `SelectField` y `SearchField`; dejar listo el campo del chat (mínimo 48 px, hasta 5 líneas) usando la misma caja, sin crear la pantalla de chat
- [X] T011 [US1] Pasar `leadingIcon` en todos los usos de `TextField` que aún no lo tengan: `src/features/auth/screens/{Login,Register,VerifyEmail,ForgotPassword,ResetPassword,ChangePassword}Screen.tsx` y `src/features/teachers/screens/CreateTeacherScreen.tsx`; en las que van sobre el fondo de pantalla (no sobre tarjeta) usar `onCard={false}`
- [X] T012 [P] [US1] Añadir las etiquetas nuevas (limpiar búsqueda, abrir selector) en `src/i18n/es.json` y `src/i18n/en.json`, claves ordenadas, y comprobar `src/i18n/__tests__/parity.test.ts`
- [X] T013 [P] [US1] Pruebas en `src/components/__tests__/TextField.test.tsx`: en reposo muestra borde y relleno; con foco cambia el borde a 2 px; con error muestra el mensaje con ícono y el error gana sobre el foco; deshabilitado a 0.6 y sin edición; el botón de contraseña alterna la visibilidad; con reducir movimiento no hay transición
- [X] T014 [US1] Ejecutar `npm run typecheck`, `npm run lint` y `npm test`; corregir roturas de las pruebas de `src/features/auth/__tests__/` causadas por el nuevo `TextField` sin cambiar su intención

**Checkpoint**: la historia 1 se puede validar sola con el quickstart.

## Phase 4: User Story 2 - Patrón de marca en lugar de círculos (P2)

**Meta**: `BrandPattern` en cabeceras de acceso, splash y tarjetas destacadas; 0 círculos o arcos decorativos.

**Prueba independiente**: recorrer las pantallas de acceso y el splash sin círculos, con la zona del logo libre (quickstart pasos 2, 3 y 6).

- [X] T015 [P] [US2] Crear `src/components/brandPatternLayouts.ts` con las listas fijas y deterministas de ubicaciones `{ x, y, size, rotation, icon, tone }`: `header` con 14 íconos de 30 a 64 px, rotación entre -30° y 30°, mezcla de hoja, pluma y libro escalonada (sin filas rectas), la zona central del logo y el título libre, hasta 3 en tono lima; `hero` con 3 íconos en la esquina inferior derecha
- [X] T016 [US2] Crear `src/components/BrandPattern.tsx` con prop `variant` (`header` o `hero`): íconos del registro, blanco al 8 a 12 % y lima al 14 a 18 % (blanco al 6 % en oscuro) en `header`, 10 % en `hero`; `pointerEvents="none"`, oculto a lectores de pantalla (`accessible={false}` e `importantForAccessibility="no-hide-descendants"`), `React.memo`, un único `FadeIn` de 350 ms y sin animación con reducir movimiento; los íconos pueden quedar cortados por el borde
- [X] T017 [US2] En `src/components/AuthLayout.tsx` eliminar `circle`, `circleTop`, `circleBottom` y sus estilos, montar `<BrandPattern variant="header" />` dentro del degradado de la cabecera (debajo del logo y el título) y comprobar que no se vuelve a dibujar al abrir el teclado
- [X] T018 [P] [US2] Eliminar `onGradient.circle` de `src/theme/tokens.ts` y confirmar con búsqueda que ningún archivo lo usa
- [X] T019 [P] [US2] Crear `src/components/HeroCard.tsx`: tarjeta destacada con degradado de marca, `radius.hero` y `<BrandPattern variant="hero" />`, lista para cuando exista el próximo módulo; no se monta en ninguna pantalla todavía
- [X] T020 [US2] Generar la imagen del splash (logo `assets/brand/logo-uts-blanco.png` sin modificar, compuesto sobre el degradado y el patrón) como `assets/brand/splash-light.png` y `assets/brand/splash-dark.png`, y referenciarlas en el plugin `expo-splash-screen` de `app.json` (claro y oscuro)
- [X] T021 [P] [US2] Pruebas en `src/components/__tests__/BrandPattern.test.tsx`: `header` renderiza 14 íconos y `hero` 3; misma salida en dos renders (determinista); ninguna ubicación cae en la zona central; no recibe toques y está oculto a lectores de pantalla
- [X] T022 [P] [US2] Prueba en `src/__tests__/noGeometricDecoration.test.ts` que falle si algún archivo de `src/` o `app/` usa `circle`, `arc` o `blob` como estilo de decoración
- [X] T023 [US2] Ejecutar `npm run typecheck`, `npm run lint` y `npm test`

**Checkpoint**: las historias 1 y 2 funcionan juntas.

## Phase 5: User Story 3 - Nombre oficial de la institución (P3)

**Meta**: "Institución Universitaria Tecnológica de Santander – UTS" donde se nombre a la institución, y 0 apariciones del nombre antiguo.

**Prueba independiente**: buscar el nombre anterior (quickstart pasos 4 y 5).

- [X] T024 [P] [US3] Cambiar `brand.institution` por "Institución Universitaria Tecnológica de Santander – UTS" en `src/i18n/es.json` y `src/i18n/en.json` (con raya "–", no guion)
- [X] T025 [US3] Prueba en `src/i18n/__tests__/brandName.test.ts`: `brand.institution` es el nombre oficial en es y en, y ninguna cadena de las traducciones contiene "Unidades Tecnológicas de Santander"
- [X] T026 [P] [US3] Buscar el nombre antiguo en `tutorias_uts_mobile/src`, `tutorias_uts_mobile/app`, `tutorias_uts_mobile/app.json` y `tutorias_uts_back/src/mail/templates`; confirmar 0 resultados (los correos hoy solo dicen "UTS Tutorías", ver research R-4) y no agregar texto nuevo a los correos
- [X] T027 [US3] Ajustar el tamaño del pie en `src/components/AuthLayout.tsx` para que el nombre largo se lea en dos líneas sin cortarse con fuente grande del sistema

## Phase 6: Polish y cierre

- [X] T028 [P] Actualizar `docs/Design.md` (sección Inputs y Brand pattern) en el repo de docs solo si el resultado difiere de lo ya escrito, y añadir una decisión a `docs/Decisions.md` si algo cambió respecto de D-049 y D-050
- [X] T029 Recorrer `quickstart.md` completo en dispositivo o emulador: claro y oscuro, "reducir movimiento", fuente grande y teclado abierto
- [ ] T030 Ejecutar `npm run typecheck`, `npm run lint` y `npm test` en `tutorias_uts_mobile`, y `npm test` en `tutorias_uts_back` si se tocó algo allí; luego aplicar la "Definición de terminado" de `docs/Conventions.md` (skill `feature-done-check`)

## Dependencias y orden

- Fase 1 y 2 primero. T002 y T003 bloquean a la historia 1 (T005, T006, T008, T009) y a la 2 (T016).
- Historia 1 (P1) no depende de las otras. Historia 2 (P2) usa solo la fase 2. Historia 3 (P3) es independiente y puede hacerse en cualquier momento tras T001.
- T010 depende de T005 y T006; T007 a T009 dependen de T010 si se quiere reutilizar la caja (pueden empezar en paralelo y converger).
- T017 depende de T016; T020 depende de T015 y T016.

## Paralelismo

- Fase 2: T002, T003 y T004 a la vez.
- Historia 1: T007, T008, T009, T012 y T013 a la vez tras T005 y T006.
- Historia 2: T015, T018, T019, T021 y T022 a la vez.
- Historia 3 completa en paralelo con las historias 1 y 2.

## Estrategia

- MVP: fases 1 y 2 más la historia 1 (T001 a T014). Luego historia 2 y, al final, historia 3 (es la más corta).
- Un cambio pequeño y revisable por historia, con un commit por historia en formato Conventional Commits.
- Decisión abierta (research R-4): si se quiere agregar un pie con el nombre completo en los correos, añadir una tarea nueva en `tutorias_uts_back/src/mail/templates/` con su prueba antes de implementar.
