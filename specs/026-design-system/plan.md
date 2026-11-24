# Implementation Plan: Sistema de diseño renovado

**Branch**: `026-design-system` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/026-design-system/spec.md`

## Summary

Se reescribe `docs/Design.md` por roles de color semánticos (claro y oscuro), escalas y estados, se completan los roles que faltan en el tema de la app, y se agregan guardas automáticas para que el documento, el tema y los componentes no se desalineen. No se rediseñan pantallas: se deja un inventario con la fase que corrige cada una (primera fase: entrada y portada).

Hallazgo que cambia el plan (detalle en [research.md](research.md)): el tema **ya es semántico y completo en lo básico** (32 roles, claro y oscuro; 0 colores fuera de `src/theme`). El trabajo real es cerrar cinco huecos del modo oscuro, ampliar la prueba de contraste y documentar. Enfoque:

- **Documento**: `Design.md` con tabla de roles (rol, claro, oscuro, origen, uso), dos registros visuales (sobrio y expresivo), elevación en oscuro, estados de componentes y reglas comprobables de "elegante" y "moderno".
- **Tema** (`tutorias_uts_mobile/src/theme`): roles nuevos y valores oscuros corregidos; ningún nombre existente se elimina (sin cascada de cambios).
- **Componentes compartidos**: solo los que leen un rol corregido (`Banner`, `AnnouncementCard`, `Card`, barra de pestañas y cabecera por color; FR-012a).
- **Guardas**: paridad claro/oscuro, matriz de contraste completa, ausencia de colores sueltos, y coincidencia `Design.md` ↔ tema.
- **Inventario**: `screen-inventory.md` con las 58 pantallas, defectos en claro y oscuro y fase.
- **Sin backend, sin textos nuevos, sin dependencias nuevas.**

## Technical Context

**Language/Version**: TypeScript; React Native + Expo (Expo Router 58), Jest con `@testing-library/react-native` v14.

**Primary Dependencies**: las existentes (`useColorScheme`, `usePalette`, tokens de `src/theme`). **Ninguna dependencia nueva.**

**Storage**: N/A. Sin cambios de base de datos.

**Testing**: Jest en `tutorias_uts_mobile` (`src/theme/__tests__`, guarda global de accesibilidad `setupA11y`); revisión manual en modo oscuro en un teléfono con Expo Go.

**Target Platform**: Android e iOS. Sin cambios de backend.

**Project Type**: mobile + documentación. Toca `tutorias_uts_mobile` y `Claude/docs`, `Claude/specs`.

**Performance Goals**: sin cambios; el cambio de modo sigue siendo reactivo (sin reinicio).

**Constraints**: reglas de diseño de `CLAUDE.md` intactas; contraste de la spec 023; la barra y la cabecera solo cambian de color; sin colores nuevos de marca (los derivados se marcan como tales); sin cambios de textos.

**Scale/Scope**: ~35 roles de color en dos modos, 58 pantallas a inventariar, 4 pruebas nuevas, 5 a 8 componentes tocados, 1 documento reescrito.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Design.md` es la fuente; una prueba comprueba que la tabla de roles coincide con el tema. Decisión D-123. |
| II. Reglas de negocio en backend | No aplica (sin reglas de negocio). |
| III. Integridad de datos | No aplica; los valores de diseño viven en el tema, no en componentes. |
| IV. Seguridad y privacidad | Sin datos nuevos. |
| V. Pruebas primero en lo crítico | No es regla crítica; aun así, las guardas se escriben antes de corregir los valores y deben fallar con el tema actual (crema clara en oscuro, tarjeta igual a superficie). |
| VI. Internacionalización | Sin textos nuevos; los existentes no cambian. |
| VII. Diseño consistente | Es el objeto de la spec: refuerza el principio con guardas. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; las pantallas van en fases siguientes. |
| IX. Idioma | Docs en español; ver aviso de idioma de `Design.md` en research R-8. Código y commits en inglés. |

**Resultado**: sin violaciones. Un punto a decidir con el CAE de producto, no una violación: R-8 (idioma de `Design.md`).

## Project Structure

### Documentation (this feature)

```text
specs/026-design-system/
├── plan.md
├── research.md
├── data-model.md        # roles de color: existentes, nuevos y cambiados
├── quickstart.md
├── screen-inventory.md  # lo produce la implementación (FR-011)
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ninguna API.

### Source Code

```text
tutorias_uts_mobile/
├── src/theme/
│   ├── colors.ts                         # roles nuevos y valores oscuros corregidos
│   ├── tokens.ts                         # sombra por modo
│   └── __tests__/
│       ├── contrast.test.ts              # matriz completa de pares, claro y oscuro
│       ├── paletteParity.test.ts         # nueva: mismas llaves y colores válidos
│       ├── noLooseColors.test.ts         # nueva: sin colores fuera de src/theme
│       └── designDoc.test.ts             # nueva: tabla de Design.md == paletas
├── src/components/                       # Banner, Card, ... solo si leen un rol corregido
├── src/features/chat/components/AnnouncementCard.tsx
└── src/features/shell/RoleTabs.tsx       # colores de la barra de pestañas (sin cambiar estructura)

Claude/docs/Design.md                     # reescrito por roles; Decisions.md (D-123); Context/CLAUDE.md si cambian reglas
```

**Structure Decision**: sin carpeta nueva; las guardas viven junto al tema. `designDoc.test.ts` lee `Design.md` del repo hermano (`../Claude/docs/Design.md`) y falla con un mensaje claro si no lo encuentra, salvo que `DESIGN_MD_PATH` indique otra ruta.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
