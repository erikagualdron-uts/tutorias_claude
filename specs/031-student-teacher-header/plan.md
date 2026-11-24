# Implementation Plan: Cabecera de marca en estudiante y docente

**Branch**: `031-student-teacher-header` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/031-student-teacher-header/spec.md`

## Summary

La spec lleva a estudiante y docente el aspecto más moderno y refrescante que administración recibió en la 029, reutilizando la misma pieza `ScreenHeader`. No hubo defectos en el teléfono; el pedido es de aspecto (detalle en [research.md](research.md)).

Hallazgos que fijan el alcance:

- **Tres pantallas**: módulos del estudiante y horario del docente reemplazan su título de texto por la cabecera; el horario del estudiante, que hoy no tiene título, la recibe encima de la tarjeta del calendario. Los textos ya existen (`student.modules.title`, `tabs.schedule`, `teacher.schedule.title`).
- **Sin pieza nueva**: no cambia el calendario, `CalendarHeader`, las vistas ni las tarjetas de sesión.
- **Riesgo real**: el espacio del calendario (SC-003). La cabecera va dentro del `ScrollView` (no fija) para no restar altura permanente; se verifica en el teléfono y, si hace falta, se reduce el relleno de la cabecera solo en estas pantallas.
- **Fuera de alcance**: el detalle de módulo del estudiante (sobrio) y los inicios (expresivos).

Enfoque:

- **Documento primero** (FR-010): `Design.md` suma las pantallas al registro «sobrio con cabecera»; D-128.
- **Guarda**: `headerBudget.test.ts` suma las 3 pantallas y el detalle de módulo como sobrio sin cabecera.
- **Sin backend, sin textos nuevos, sin dependencias nuevas, sin roles nuevos.**

## Technical Context

**Language/Version**: TypeScript; React Native + Expo (Expo Router 58), Jest con `@testing-library/react-native` v14.

**Primary Dependencies**: las existentes (`ScreenHeader`). **Ninguna nueva.**

**Storage**: N/A.

**Testing**: Jest (`src/theme/__tests__`, pruebas de módulos, horario del estudiante y horario del docente); recorrido manual en teléfono en claro y oscuro, español e inglés.

**Target Platform**: Android e iOS.

**Project Type**: mobile + documentación (`tutorias_uts_mobile`, `Claude/docs`, `Claude/specs`).

**Performance Goals**: sin cambios; el cambio de modo sigue siendo reactivo.

**Constraints**: reglas de `CLAUDE.md` intactas (sin patrón; un solo bloque de color por pantalla); textos, rutas, permisos y reglas de negocio sin cambios; calendario y su navegación sin cambios; guardas de las specs 026 a 030 en verde.

**Scale/Scope**: 3 pantallas con una línea cambiada cada una, 1 guarda ampliada, ~3 pruebas de pantalla ampliadas, 1 documento actualizado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Design.md` recibe las pantallas antes del código; `designDoc.test.ts` sigue exigiendo coincidencia. Decisión D-128 |
| II. Reglas de negocio en backend | No aplica; inscripción, cupo y horarios no cambian |
| III. Integridad de datos | No aplica |
| IV. Seguridad y privacidad | Sin datos nuevos |
| V. Pruebas primero en lo crítico | `headerBudget` se amplía antes de implementar y debe fallar con las 3 pantallas |
| VI. Internacionalización | Sin textos nuevos; los tres títulos ya existen en español e inglés |
| VII. Diseño consistente | Es el objeto de la spec: estudiante, docente y administración con la misma cabecera |
| VIII. Desarrollo incremental | Una spec pequeña tras cerrar el rediseño de las 58 pantallas |
| IX. Idioma | Docs en español; código y commits en inglés |

**Resultado**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/031-student-teacher-header/
├── plan.md
├── research.md
├── data-model.md        # pantallas y qué muestra cada cabecera
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ninguna API. `screen-inventory.md` de la 026 se actualiza (estado de las pantallas).

### Source Code

```text
tutorias_uts_mobile/
├── src/features/enrollments/screens/StudentModulesScreen.tsx
├── src/features/student-schedule/screens/StudentScheduleScreen.tsx
├── src/features/teacher-sessions/screens/TeacherScheduleScreen.tsx
└── src/theme/__tests__/headerBudget.test.ts

Claude/docs/Design.md        # registro «sobrio con cabecera»
Claude/docs/Decisions.md     # D-128
Claude/specs/026-design-system/screen-inventory.md
```

**Structure Decision**: sin carpeta ni pieza nueva; solo se monta `ScreenHeader` en tres pantallas y se amplía una guarda.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
