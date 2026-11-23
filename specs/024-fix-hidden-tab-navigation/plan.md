# Implementation Plan: Corregir la navegación a las pantallas sin pestaña

**Branch**: `024-fix-hidden-tab-navigation` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/024-fix-hidden-tab-navigation/spec.md`

## Summary

La campana de la barra superior y el enlace "Cambios" del dashboard del CAE no abren su pantalla porque `RoleTabs` oculta las pantallas sin pestaña con `href: null`, y con Expo Router 58 una pantalla oculta así no se puede abrir (la ruta se queda en el inicio). Se reprodujo con el router real.

Enfoque técnico (detalle en [research.md](research.md)):

- **Ocultar sin bloquear**: las pantallas sin pestaña pasan a ocultarse con `tabBarItemStyle: { display: 'none' }`, que sí permite navegar y no deja hueco ni pestaña en la barra (comprobado con el router real).
- **Volver atrás**: `RoleTabs` fija `backBehavior="history"`. Por defecto, "atrás" desde una pestaña oculta lleva al inicio; con `history` regresa a la pantalla de origen (FR-002, comprobado).
- **Una sola declaración**: un archivo `roleTabs.config.ts` guarda, por rol, las pestañas y las pantallas sin pestaña (hoy `notifications` en los tres y `changes` en el CAE). Los tres `_layout.tsx` y la prueba leen de ahí, de modo que una pantalla nueva queda cubierta sin editar la prueba (FR-007). La bandeja deja de estar escrita a mano dentro de `RoleTabs`.
- **Prueba con el router real**: `expo-router/testing-library` monta `RoleTabs` con cada rol y pantallas de relleno, abre cada pantalla sin pestaña, comprueba que la barra solo muestra sus pestañas, y toca la campana desde el inicio y desde otra pestaña. Una segunda comprobación revisa que cada archivo de ruta de nivel superior de `app/(rol)` sea una pestaña o una pantalla sin pestaña declarada.
- **Sin dependencias nuevas**, sin cambios de backend, de base de datos ni de diseño visual.

## Technical Context

**Language/Version**: TypeScript; Expo SDK 58, Expo Router 58.

**Primary Dependencies**: `expo-router` (`Tabs`, `router`, `expo-router/testing-library`), Jest y React Native Testing Library (presentes). **Ninguna dependencia nueva.**

**Storage**: N/A.

**Testing**: Jest con `renderRouter` (router real) para la navegación; las pruebas de la campana y de la bandeja existentes (con router simulado) se conservan. La guarda de accesibilidad global de la spec 023 sigue aplicando.

**Target Platform**: Android e iOS.

**Project Type**: mobile-app. Toca solo `tutorias_uts_mobile` y `docs/`; backend y base de datos no cambian.

**Performance Goals**: sin cambios.

**Constraints**: ningún cambio visual (la barra inferior muestra las mismas pestañas); la guarda de rutas (`RouteGate`) y el cambio de contraseña obligatorio se mantienen; textos solo en es y en (no se esperan textos nuevos).

**Scale/Scope**: 3 layouts de rol, 1 componente (`RoleTabs`), 1 archivo de configuración nuevo y 1 prueba nueva.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Architecture.md` y `Conventions.md` se actualizan con la regla "pantalla sin pestaña" y se registra D-121 en `Decisions.md`. |
| II. Reglas de negocio en backend | No se toca ninguna regla. |
| III. Integridad de datos | No aplica (sin datos). |
| IV. Seguridad y privacidad | Se mantiene `RouteGate` (la API sigue siendo la barrera real); la prueba comprueba que sin sesión no se abre la bandeja. |
| V. Pruebas primero en lo crítico | No es una de las reglas críticas; aun así la prueba de navegación real se escribe antes de corregir y debe fallar con el código actual. |
| VI. Internacionalización | Sin textos nuevos. |
| VII. Diseño consistente | Sin cambio visual; la barra mantiene sus pestañas y objetivos de 48 px. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; cambio pequeño. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Revisado tras el diseño: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/024-fix-hidden-tab-navigation/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ningún endpoint ni interfaz externa.

### Source Code

```text
tutorias_uts_mobile/
├── src/features/shell/roleTabs.config.ts      # por rol: pestañas y pantallas sin pestaña (única declaración)
├── src/features/shell/RoleTabs.tsx            # oculta con tabBarItemStyle y backBehavior="history"; ya no escribe `notifications` a mano
├── app/(student)/_layout.tsx                  # lee su entrada de roleTabs.config
├── app/(teacher)/_layout.tsx                  # ídem
├── app/(admin)/_layout.tsx                    # ídem (suma el contador de PQRS radicadas a su pestaña)
└── src/features/shell/__tests__/hiddenScreens.test.tsx   # router real: pantallas sin pestaña, barra y campana

Claude/docs/                                   # Architecture, Conventions, Decisions (D-121)
```

**Structure Decision**: la declaración vive junto a `RoleTabs` en `features/shell` y la leen tanto los layouts de `app/` como la prueba; así la prueba nunca se desactualiza respecto a la app.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
