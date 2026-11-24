# Implementation Plan: Entrada y portada renovadas

**Branch**: `027-entry-front-page` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/027-entry-front-page/spec.md`

## Summary

Se corrigen primero los dos defectos que vio el dueño del producto en el teléfono, ambos en piezas compartidas, y se completa la unificación de las 12 pantallas de la fase 1 con el sistema de la spec 026.

Hallazgos que fijan el alcance (detalle en [research.md](research.md)):

- **Contraste en oscuro**: el texto de todos los botones ya pasa; lo que falla es lo no textual. El borde de los botones `outlined` y `tonal` y de los chips sin seleccionar es casi invisible (blanco al 8 %), y `primaryPressed` oscuro es igual a `primary`. La matriz de la 026 no medía bordes de controles.
- **«All» → «Al»**: `FilterChips` no impide que el chip y su texto se encojan; con Myriad Pro y `letterSpacing` Android recorta la última letra.
- **Las 12 pantallas**: ya comparten `AuthLayout`, `HeroCard`, `MetricCard`, `Card`. Faltan el bloque destacado del inicio del CAE y un estado vacío con identidad de marca.

Enfoque:

- **Tema**: un rol nuevo `controlBorder` y un `primaryPressed` oscuro distinto (40 roles).
- **Piezas**: `Button`, `FilterChips`, `EmptyState` y una variante `empty` del patrón de marca.
- **Pantallas**: inicio del CAE con `HeroCard`; auditoría con las 8 reglas de las otras 11.
- **Guardas**: se amplía `contrastPairs`; no se añade prueba de contraste nueva.
- **Documento**: `Design.md` con el rol, el estado presionado y la variante del patrón; D-124.
- **Sin backend, sin textos nuevos, sin dependencias nuevas.**

## Technical Context

**Language/Version**: TypeScript; React Native + Expo (Expo Router 58), Jest con `@testing-library/react-native` v14.

**Primary Dependencies**: las existentes (`usePalette`, `useShadows`, `BrandPattern`, `HeroCard`). **Ninguna nueva.**

**Storage**: N/A.

**Testing**: Jest (`src/theme/__tests__`, `src/components/__tests__`, pruebas de pantallas); revisión manual en teléfono con Expo Go en claro y oscuro, español e inglés.

**Target Platform**: Android e iOS. El defecto de recorte se manifiesta en Android; se verifica allí.

**Project Type**: mobile + documentación (`tutorias_uts_mobile`, `Claude/docs`, `Claude/specs`).

**Performance Goals**: sin cambios; el cambio de modo sigue siendo reactivo.

**Constraints**: reglas de `CLAUDE.md` intactas; textos, rutas, permisos, pestañas y cabecera sin cambios; un solo bloque de color y un patrón por pantalla expresiva; guardas de la 026 en verde.

**Scale/Scope**: 1 rol nuevo, 1 valor cambiado, 4 componentes tocados, 1 variante de patrón, 1 pantalla con bloque nuevo, 12 pantallas auditadas, 53 usos de `EmptyState` afectados.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Design.md` recibe el rol, el estado presionado y la variante; `designDoc.test.ts` exige coincidencia. Decisión D-124 |
| II. Reglas de negocio en backend | No aplica |
| III. Integridad de datos | No aplica |
| IV. Seguridad y privacidad | Sin datos nuevos |
| V. Pruebas primero en lo crítico | Se amplía `contrastPairs` antes de tocar los valores; debe fallar con el tema actual (borde 1.1:1) |
| VI. Internacionalización | Sin textos nuevos; el recorte de «All» se verifica en español e inglés |
| VII. Diseño consistente | Es el objeto de la spec: tres inicios con la misma estructura y un estado vacío único |
| VIII. Desarrollo incremental | Una fase del rediseño por rama; fases 2 a 4 quedan aparte |
| IX. Idioma | Docs en español; código y commits en inglés (`Design.md` sigue en inglés, deuda de D-123) |

**Resultado**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/027-entry-front-page/
├── plan.md
├── research.md
├── data-model.md        # roles y piezas
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ninguna API. `screen-inventory.md` de la spec 026 se actualiza (defectos y estado de las 12 pantallas).

### Source Code

```text
tutorias_uts_mobile/
├── src/theme/colors.ts                          # controlBorder; primaryPressed oscuro
├── src/testing/contrastPairs.ts                 # pares de borde de controles
├── src/components/
│   ├── Button.tsx                               # borde outlined y tonal
│   ├── FilterChips.tsx                          # borde, sin encoger, ancho mínimo
│   ├── EmptyState.tsx                           # patrón de marca detrás del ícono
│   ├── BrandPattern.tsx, brandPatternLayouts.ts # variante empty
│   └── __tests__/                               # chips, botón, modo oscuro
├── src/features/dashboard/screens/AdminDashboardScreen.tsx   # bloque destacado
└── src/theme/__tests__/                         # paridad (40 roles), contraste

Claude/docs/Design.md       # rol, presionado, variante empty, estado vacío
Claude/docs/Decisions.md    # D-124
Claude/specs/026-design-system/screen-inventory.md   # defectos de la fase 1
```

**Structure Decision**: sin carpeta nueva. Los cambios viven en el tema y en piezas compartidas; las pantallas solo cambian donde la estructura común lo exige (CAE).

## Complexity Tracking

Sin violaciones de la constitución que justificar.
