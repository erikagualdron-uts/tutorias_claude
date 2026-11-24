# Implementation Plan: Mi cuenta

**Branch**: `032-my-account` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/032-my-account/spec.md`

## Summary

Se agrega una pantalla «Mi cuenta» para los tres roles, alcanzable desde el avatar, que muestra los datos de la sesión, el estado de las notificaciones push y las acciones de cambiar la contraseña y cerrar sesión. Es de solo consulta (decisión de la persona dueña del producto) y no toca el backend (detalle en [research.md](research.md)).

Hallazgos que fijan el alcance:

- **La clave se puede cambiar en cualquier momento en el backend**, pero la ruta `/change-password` solo se abre con clave temporal (`RouteGate`), así que el cambio voluntario necesita su propia pantalla; el obligatorio no cambia.
- **El patrón de pantallas sin pestaña ya existe** (`ROLE_TABS[...].hidden`, D-121): `account` y `account-password` se suman ahí por rol y las cubre `hiddenScreens.test.tsx` sin editarlo.
- **Todo lo demás se reutiliza**: la sesión, `usePushPermission`, el botón de activar, `useChangePassword`, `changePasswordSchema`, `ScreenHeader`, `Button`, `useSignOut`.
- **Excepción a «sin textos nuevos»**: 14 claves nuevas en español e inglés.

Enfoque:

- **Documento primero** (FR-012 de las fases de diseño, aquí por constitución I): `Design.md` actualiza la navegación y las pantallas sin pestaña; D-129.
- **Un componente extraído**: `PasswordFields`, para no duplicar los dos campos entre el cambio obligatorio y el voluntario, sin cambiar el comportamiento del obligatorio.
- **Guardas**: `headerBudget` y `severityIndicators` se amplían; la paridad de traducciones ya existe.
- **Sin backend, sin dependencias nuevas, sin roles de color nuevos.**

## Technical Context

**Language/Version**: TypeScript; React Native + Expo (Expo Router 58), Jest con `@testing-library/react-native` v14 (rutas con `expo-router/testing-library`).

**Primary Dependencies**: las existentes. **Ninguna nueva.**

**Storage**: N/A (la sesión ya guarda al usuario; sin base de datos nueva).

**Testing**: Jest (`src/features/account`, `auth`, `shell`, `components`, `theme`); recorrido manual en teléfono con los tres roles.

**Target Platform**: Android e iOS.

**Project Type**: mobile + documentación (`tutorias_uts_mobile`, `Claude/docs`, `Claude/specs`). Sin backend ni base de datos.

**Performance Goals**: «Mi cuenta» abre al instante, sin esperar red (los datos vienen de la sesión).

**Constraints**: reglas de `CLAUDE.md` (textos en es y en, colores solo de roles, íconos Iconify solar con botones con ícono a la izquierda, objetivos de 48 px); la contraseña y la sesión se validan en el backend; el cambio obligatorio por clave temporal no cambia; guardas de las specs 026 a 031 en verde.

**Scale/Scope**: 2 pantallas nuevas, 1 componente extraído, 6 archivos de ruta, 1 ítem nuevo en el menú del avatar, 6 entradas en `ROLE_TABS`, 14 claves de traducción, ~4 archivos de prueba.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Design.md` (navegación y pantallas sin pestaña) y `Context.md` si lista el menú se actualizan en el mismo cambio. Decisión D-129 |
| II. Reglas de negocio en backend | Las reglas de contraseña y de sesión siguen en el backend; la pantalla no define reglas nuevas |
| III. Integridad de datos | No aplica: sin datos nuevos |
| IV. Seguridad y privacidad | Se muestra solo la cuenta propia; la contraseña no se guarda ni se muestra; el cambio exige la clave actual |
| V. Pruebas primero en lo crítico | El cambio de contraseña es sensible: sus pruebas (válido, clave incorrecta, clave inválida, el obligatorio sin cambio) se escriben antes de la pantalla |
| VI. Internacionalización | 14 claves nuevas en español e inglés; la paridad la comprueba una prueba existente |
| VII. Diseño consistente | Registro «sobrio con cabecera»; mismas piezas que el resto de la app |
| VIII. Desarrollo incremental | Una funcionalidad por rama; la edición del nombre queda para otra spec |
| IX. Idioma | Docs en español; código y commits en inglés |

**Resultado**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/032-my-account/
├── plan.md
├── research.md
├── data-model.md        # pantallas, rutas, estados
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ninguna API (se usa `POST /auth/change-password` ya existente).

### Source Code

```text
tutorias_uts_mobile/
├── app/(student)|(teacher)|(admin)/{account,account-password}.tsx   # 6 archivos que reexportan
├── src/features/account/screens/{AccountScreen,AccountPasswordScreen}.tsx
├── src/features/account/__tests__/
├── src/features/auth/components/PasswordFields.tsx                  # extraído de ChangePasswordScreen
├── src/features/auth/screens/ChangePasswordScreen.tsx               # usa PasswordFields, sin cambio de comportamiento
├── src/features/shell/roleTabs.config.ts                            # 2 pantallas sin pestaña por rol
├── src/components/AppBar.tsx                                        # ítem «Mi cuenta»
├── src/i18n/{es,en}.json                                            # 14 claves
└── src/theme/__tests__/{headerBudget,severityIndicators}.test.ts

Claude/docs/Design.md        # navegación y pantallas sin pestaña
Claude/docs/Decisions.md     # D-129
Claude/docs/Context.md       # si lista el menú del avatar
Claude/specs/026-design-system/screen-inventory.md
```

**Structure Decision**: una carpeta de feature nueva, `src/features/account`, con las dos pantallas, siguiendo la estructura por feature de la app; la pieza compartida con autenticación vive en `features/auth`.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
