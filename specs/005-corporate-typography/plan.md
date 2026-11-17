# Implementation Plan: Tipografía corporativa

**Branch**: `005-corporate-typography` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-corporate-typography/spec.md`

## Summary

Reemplazar Roboto por Source Sans 3 (respaldo de Myriad Pro, D-051) y Roboto Mono por Source Code Pro, cambiando solo los tokens `fonts` y `typography` del tema (con el peso medio pasando a Semibold y los tamaños nuevos de `Design.md`). Hoy ningún componente escribe `fontFamily` ni `fontWeight`, así que el cambio es de tema, de carga de fuentes y de arranque (mantener el splash hasta que carguen, con tiempo máximo) más una prueba que impida volver a escribir fuentes en componentes. Detalle en [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript (Expo y React Native del proyecto)

**Primary Dependencies**: expo-font (`useFonts`), expo-splash-screen, `@expo-google-fonts/source-sans-3`, `@expo-google-fonts/source-code-pro`

**Storage**: N/A

**Testing**: jest + jest-expo

**Target Platform**: Android e iOS

**Project Type**: mobile-app (solo `tutorias_uts_mobile`; sin impacto en la API)

**Performance Goals**: primera pantalla ya con la fuente correcta; carga de fuentes dentro del splash; tiempo máximo de espera de 5 s

**Constraints**: nombres de fuente solo en los tokens `fonts`; sin `fontWeight`; no incluir archivos de Myriad Pro (licencia, D-051); sin colores ni textos nuevos

**Scale/Scope**: 2 archivos de tema, 1 hook de carga, 1 layout raíz, 13 componentes y pantallas que consumen los estilos (sin editarlos salvo que usen tamaños propios)

## Constitution Check

| Principio | Estado |
|---|---|
| I. Fuente de verdad en docs/ | Cumple: aplica `Design.md` (Typography) y D-051; se actualiza `Decisions.md` (D-041 queda sustituida). |
| II y V. Reglas de negocio y pruebas | No aplica: no se toca ninguna regla. |
| III y IV. Datos y seguridad | No aplica. Licencia de Myriad Pro respetada (FR-009). |
| VI. i18n | Cumple: no hay texto nuevo. |
| VII. Diseño | Cumple: sin colores nuevos; controles de mínimo 48 px con tipografía más grande. |
| VIII y IX | Cumple. |

Resultado: sin violaciones; igual tras el diseño.

## Project Structure

### Documentation (this feature)

```text
specs/005-corporate-typography/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/typography.md
└── tasks.md   # lo crea /speckit-tasks
```

### Source Code

```text
tutorias_uts_mobile/
├── package.json                      # + source-sans-3, source-code-pro; - roboto, roboto-mono
├── src/theme/tokens.ts               # fonts (regular, semibold, bold, mono) y typography nuevos
├── src/theme/index.ts                # useAppFonts con Source Sans 3 y Source Code Pro
├── app/_layout.tsx                   # splash retenido hasta cargar fuentes (con tiempo máximo)
├── src/__tests__/noInlineFonts.test.ts   # prohíbe fontFamily y fontWeight fuera del tema
└── src/theme/__tests__/typography.test.ts  # tamaños, pesos y tokens de Design.md
docs/Decisions.md, docs/Design.md     # D-041 sustituida; nota del respaldo activo
```

**Structure Decision**: solo `tutorias_uts_mobile` y `docs/`; el backend no se toca. Los componentes siguen usando `typography.*` sin cambios de código.

## Complexity Tracking

Sin violaciones que justificar.
