# Implementation Plan: Módulos y horario renovados

**Branch**: `028-modules-schedule` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/028-modules-schedule/spec.md`

## Summary

La fase 2 aplica el sistema de las specs 026 y 027 a las 4 pantallas de módulos y horario. El teléfono no mostró defectos, pero la revisión del código sí: el color de severidad se usa como **indicador** (ícono, línea, barra) con los roles de relleno `error`, `warning` y `success`, que no llegan a 3:1 en uno de los modos (detalle medido en [research.md](research.md)).

Hallazgos que fijan el alcance:

- **7 usos con contraste insuficiente** (6 archivos con color de severidad más el borde de `DayStrip`): línea e ícono de `SessionBlock`, de `TeacherSessionCard`, la línea de la hora actual, la barra de cupo de `OfferCard` y de `CapacityBar`, el borde de las insignias de `OfferCard` (solo `LAST_SPOTS` y `BLOCKED`) y el borde de los días sin seleccionar de `DayStrip` (rol `border`, lo cubre su prueba).
- **Lo demás ya cumple**: texto de las 4 pantallas, estados como texto más ícono, estado vacío, carga y error con piezas compartidas, y botón bloqueado con su regla. Estudiante y docente ya comparten `WeekCalendar`.

Enfoque:

- **Sin roles nuevos**: indicadores con `errorText`, `warningText` y `primary` (ya miden 3:1 sobre `card`, `screen` y `surface`); `controlBorder` para el borde de los días.
- **Guarda**: `severityIndicators.test.ts` recorre los archivos de la fase 2 y falla si usan `palette.error`, `palette.warning` o `palette.success`; la matriz de contraste añade los pares sobre `surface` y `screen`. La lista crece en cada fase.
- **Pruebas por pieza** y orden de la tarjeta de módulo.
- **Documento**: regla «indicador = rol de texto de severidad, relleno = rol de relleno» en `Design.md`; D-125.
- **Sin backend, sin textos nuevos, sin dependencias nuevas.**

## Technical Context

**Language/Version**: TypeScript; React Native + Expo (Expo Router 58), Jest con `@testing-library/react-native` v14.

**Primary Dependencies**: las existentes (`usePalette`, `contrastPairs`, `controlBorder`). **Ninguna nueva.**

**Storage**: N/A.

**Testing**: Jest (`src/theme/__tests__`, `src/components/__tests__`, pruebas de las 4 pantallas); recorrido manual en teléfono en claro y oscuro, español e inglés.

**Target Platform**: Android e iOS.

**Project Type**: mobile + documentación (`tutorias_uts_mobile`, `Claude/docs`, `Claude/specs`).

**Performance Goals**: sin cambios.

**Constraints**: reglas de `CLAUDE.md` intactas; textos, rutas, permisos y reglas de negocio sin cambios; barra de pestañas y cabecera sin cambios; guardas de las specs 026 y 027 en verde; registro sobrio (sin degradado ni patrón).

**Scale/Scope**: 7 usos corregidos en 6 archivos (`SessionBlock`, `TeacherSessionCard`, `NowLine`, `OfferCard`, `CapacityBar`, `DayStrip`), 1 prueba de guarda nueva, ~6 pruebas por pieza, 4 pantallas auditadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Design.md` recibe la regla de indicador; `designDoc.test.ts` sigue exigiendo coincidencia. Decisión D-125 |
| II. Reglas de negocio en backend | No aplica; cupo, cruces y ventanas no cambian |
| III. Integridad de datos | No aplica |
| IV. Seguridad y privacidad | Sin datos nuevos |
| V. Pruebas primero en lo crítico | La guarda y los pares de contraste se escriben antes de corregir y deben fallar con el código actual (6 archivos) |
| VI. Internacionalización | Sin textos nuevos |
| VII. Diseño consistente | Es el objeto de la spec: mismos indicadores en estudiante y docente |
| VIII. Desarrollo incremental | Una fase por rama; fases 3 y 4 quedan aparte |
| IX. Idioma | Docs en español; código y commits en inglés |

**Resultado**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/028-modules-schedule/
├── plan.md
├── research.md
├── data-model.md        # uso de roles como indicador
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ninguna API. `screen-inventory.md` de la 026 se actualiza (estado de las 4 pantallas).

### Source Code

```text
tutorias_uts_mobile/
├── src/testing/contrastPairs.ts                       # pares sobre surface y screen
├── src/components/calendar/{SessionBlock,NowLine,DayStrip}.tsx
├── src/features/enrollments/components/OfferCard.tsx
├── src/features/teacher-sessions/components/TeacherSessionCard.tsx
├── src/features/dashboard/components/CapacityBar.tsx  # barra compartida
└── src/theme/__tests__/severityIndicators.test.ts     # nueva: guarda de la fase

Claude/docs/Design.md        # regla de indicador
Claude/docs/Decisions.md     # D-125
Claude/specs/026-design-system/screen-inventory.md
```

**Structure Decision**: sin carpeta nueva; los cambios viven en las piezas compartidas y la guarda junto al tema.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
