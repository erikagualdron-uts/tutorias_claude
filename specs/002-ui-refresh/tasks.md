# Tasks: Renovación visual de la app (UI refresh)

**Input**: `specs/002-ui-refresh/` (plan.md, spec.md, research.md, contracts/ui-components.md, quickstart.md)

**Repo de trabajo**: `tutorias_uts_mobile` (rutas relativas a ese repo, salvo que se indique)

**Formato**: `- [ ] T### [P?] [US?] Descripción con ruta`. `[P]` = se puede hacer en paralelo (archivos distintos, sin dependencias abiertas).

## Phase 1: Setup

- [X] T001 Instalar `react-native-iconify`, `react-native-svg` y `expo-linear-gradient` (`npx expo install react-native-svg expo-linear-gradient` y `npm i react-native-iconify`) y confirmar que arranca en Expo Go, en `package.json`
- [X] T002 [P] Pedir a la universidad o al usuario los logos oficiales y copiarlos sin modificar a `assets/brand/` (entregado solo `logo-uts.png` a color; ver D-066). Si faltan, no dibujar un logo propio: detener la historia 1 en T018

## Phase 2: Foundational (bloquea todas las historias)

- [X] T003 Portar a `src/theme/tokens.ts` los tokens de `.claude/skills/uts-ui/assets/theme.ts` del repo de docs: `spacing`, `radius` (badge 8, input 12, card 16, hero 20, sheet 24, header 32, pill), `shadows` con `elevation`, `gradients.brand`, `motion`, `iconSize`, `buttonHeight`
- [X] T004 [P] Añadir `screen` y `card` a `Palette` en `src/theme/colors.ts` (claro: `#F2F4EF` y `#FFFFFF`; oscuro: paleta actual, `screen` `#0B1710`, `card` `#132F20`) y exportarlos desde `src/theme/index.ts`
- [X] T005 Crear el registro único `src/icons/registry.ts` con nombres `solar:*` como literales: letter, lock-password, eye, eye-closed, login-3, logout-2, user-plus, user, home-2, book-2, calendar, chat-round-dots, clipboard-text, hamburger-menu, check-circle, danger-triangle, close-circle, arrow-left, copy, key; verificar cada nombre en icones.js.org
- [X] T006 Crear `src/icons/Icon.tsx` (`<Icon name size color />`, decorativo y oculto a lectores de pantalla, `size` por defecto `iconSize.button`) según `contracts/ui-components.md`
- [X] T007 [P] Mockear `Icon` en `jest.setup.ts` para que Jest no renderice SVG
- [X] T008 [P] Crear `src/components/useMotion.ts`: hook sobre `useReducedMotion` de Reanimated que devuelve duraciones y si el movimiento está permitido
- [X] T009 [P] Añadir etiquetas de accesibilidad nuevas (si hacen falta) en `src/i18n/es.json` y `src/i18n/en.json`, claves ordenadas, y comprobar que pasa la prueba de paridad
- [X] T010 Reescribir `src/components/Button.tsx`: prop `icon` obligatoria a la izquierda (20 px, 8 px de separación), variante `link` sin ícono, alto 52, `radius.pill`, escala 0.97 en 150 ms (sin escala con reducir movimiento); crear `IconButton` (solo ícono, `accessibilityLabel` obligatorio, 48 px) en el mismo archivo
- [X] T011 [P] Crear `src/components/Card.tsx` (fondo `card`, `radius.card`, `shadows.level1`, sin borde)
- [X] T012 [P] Crear `src/components/FadeInView.tsx` (fundido y subida de 8 px en 250 ms; con reducir movimiento solo fundido)
- [X] T013 [P] Pruebas en `src/components/__tests__/Button.test.tsx` e `Icon.test.tsx`: el botón muestra ícono y etiqueta, está deshabilitado sin acción, y con movimiento reducido no escala; el `Icon` está oculto a lectores de pantalla

**Checkpoint**: tema, íconos y `Button` listos; las pantallas aún compilan tras T014.

## Phase 3: User Story 1 - Acceso con identidad UTS (P1) MVP

**Meta**: pantallas de acceso con logo, cabecera de degradado, tarjeta y botones con ícono.

**Prueba independiente**: abrir la app sin sesión y recorrer las 5 pantallas de acceso (quickstart 1 a 3).

- [X] T014 [US1] Migrar todos los `<Button>` existentes a la nueva API con `icon` (19 usos en `src/features/**/screens/*.tsx` y `src/components/*.tsx`) para que el proyecto compile; botones apilados con `gap: spacing.lg`
- [X] T015 [P] [US1] Crear `src/components/BrandLogo.tsx` con `expo-image` y los SVG de `assets/brand/`, variantes `full`, `white` y `mark`, sin deformar el logo
- [X] T016 [US1] Crear `src/components/AuthLayout.tsx`: cabecera con `gradients.brand` (35 % de alto, borde inferior curvo de 32, círculos decorativos al 6 a 10 % blanco), logo blanco, título "UTS Tutorías" con línea lima de 4 px, tarjeta de formulario (radio 24, `shadows.level3`) que solapa 24 px, logo reducido con el teclado y formulario desplazable
- [X] T017 [US1] Actualizar `src/components/TextField.tsx` con `leadingIcon` y el botón de mostrar u ocultar con `IconButton` (`eye` y `eye-closed`), radio `input` 12 y fondo `surface`
- [X] T018 [US1] Usar `AuthLayout`, `FadeInView` e íconos (letter, lock-password, login-3, user-plus) en `src/features/auth/screens/LoginScreen.tsx` según el patrón de `Design.md` (separador "o" con 16 px arriba y abajo, enlace "¿Olvidaste tu contraseña?" sin ícono, pie institucional); depende de T002
- [X] T019 [P] [US1] Aplicar `AuthLayout` e íconos en `src/features/auth/screens/RegisterScreen.tsx` y `VerifyEmailScreen.tsx`
- [X] T020 [P] [US1] Aplicar `AuthLayout` e íconos en `src/features/auth/screens/ForgotPasswordScreen.tsx`, `ResetPasswordScreen.tsx` y `ChangePasswordScreen.tsx`
- [X] T021 [P] [US1] Configurar el splash con el logo oficial en `app.json` y el fondo del splash con el verde de marca, usando `assets/brand/`
- [X] T022 [P] [US1] Actualizar `src/components/Banner.tsx` con ícono (success, warning, error) y `radius.input`; actualizar `LoadingScreen.tsx` con fondo `screen`
- [X] T023 [US1] Ajustar las pruebas de las pantallas de acceso en `src/features/auth/**/__tests__` y `src/components/__tests__` a los nuevos componentes; `npm test` debe seguir en verde

**Checkpoint**: acceso renovado de punta a punta (MVP).

## Phase 4: User Story 2 - Pantallas internas renovadas (P2)

**Meta**: pestañas, barra, menú, diálogos y alta de docente con el mismo estilo.

**Prueba independiente**: iniciar sesión con estudiante, docente y CAE y recorrer todo (quickstart 4 y 5).

- [X] T024 [US2] Migrar `src/features/shell/RoleTabs.tsx` de `Ionicons` a `Icon` (`-linear` inactivo, `-bold` activo, 24 px), fondo `card` y barra con `shadows.level1`
- [X] T025 [P] [US2] Migrar `src/features/shell/screens/EmptyTabScreen.tsx` y `src/components/EmptyState.tsx` a `Icon` de 40 px y `FadeInView`
- [X] T026 [P] [US2] Actualizar `src/components/AppBar.tsx` con `IconButton` y el menú de perfil con íconos (user, logout-2), `shadows.level2` y fondo `screen`
- [X] T027 [P] [US2] Actualizar `src/components/TemporaryPasswordDialog.tsx` con radio `hero` (20), `shadows.level3`, ícono de copiar, scrim, aparición con resorte (`motion.spring`) y solo fundido con reducir movimiento
- [X] T028 [P] [US2] Usar `Card`, fondo `screen` e íconos en `src/features/teachers/screens/CreateTeacherScreen.tsx` y `src/features/shell/screens/MoreScreen.tsx`
- [X] T029 [US2] Aplicar el fondo `screen` en los `_layout` de `app/(student)`, `app/(teacher)`, `app/(admin)` y `app/(admin)/more`
- [X] T030 [US2] Eliminar `@expo/vector-icons` y `expo-symbols` de `package.json` y `npm install`; confirmar que no queda ninguna importación en `app/` ni `src/`

**Checkpoint**: toda la app existente renovada.

## Phase 5: User Story 3 - Movimiento reducido y tema único (P3)

**Meta**: accesibilidad del movimiento y tema sin valores sueltos.

**Prueba independiente**: activar "reducir movimiento" y cambiar `radius.card` (quickstart 6 y 9).

- [X] T031 [US3] Revisar todas las animaciones (`Button`, `FadeInView`, diálogo, pantallas) para que pasen por `useMotion` y con reducir movimiento queden solo en fundido
- [X] T032 [P] [US3] Eliminar valores literales de color, radio, sombra y espaciado en `app/` y `src/features/` y en `src/components/`; cada uno viene de `@/theme`
- [X] T033 [P] [US3] Prueba estática en `src/__tests__/noOtherIconLibs.test.ts`: falla si `app/` o `src/` importan `@expo/vector-icons`, `expo-symbols` u otra librería de íconos, o si `app/` y `src/features/` contienen colores hexadecimales
- [X] T034 [P] [US3] Prueba en `src/components/__tests__/FadeInView.test.tsx` con `useReducedMotion` simulado: sin desplazamiento cuando está activo

## Phase 6: Polish

- [X] T035 `npm run typecheck`, `npm run lint`, `npm test` y `npm run format` limpios
- [ ] T036 Recorrido manual de `quickstart.md` (escenarios 1 a 10) en Expo Go con los 3 roles, modo oscuro, fuente grande y reducir movimiento; registrar resultados en `specs/002-ui-refresh/quickstart.md` del repo de docs
- [X] T037 [P] Actualizar `docs/Architecture.md` y `docs/Decisions.md` del repo de docs si cambió algo (por ejemplo, retiro de `@expo/vector-icons` y `expo-symbols`) y la fila "No incluido" del README de la app si aplica
- [X] T038 Revisar con `feature-done-check` y preparar el PR

## Dependencias y orden

- Phase 1 → Phase 2 → historias. T014 (migrar botones) bloquea cualquier pantalla porque rompe la API anterior.
- US1 (MVP) primero; US2 depende de Phase 2 y puede ir en paralelo con US1 salvo en `Banner` y `LoadingScreen` (T022); US3 va al final porque audita lo construido.
- T018 depende de T002 (logos) y de T015 y T016.
- Dentro de cada historia, las tareas `[P]` tocan archivos distintos.

## Estrategia

1. Phase 1 y 2, luego US1 completa. **Parar y validar** en Expo Go (MVP).
2. US2, luego US3 y Polish.
3. Un commit por fase y un PR único al repo `tutorias_uts_mobile`.
