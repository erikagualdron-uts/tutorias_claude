# Implementation Plan: Chat, PQRS y perfil renovados

**Branch**: `030-chat-pqrs-profile` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/030-chat-pqrs-profile/spec.md`

## Summary

La fase 4 cierra el inventario: lleva el sistema de las specs 026 a 029 a las pantallas de chat, PQRS y cambio de clave. El defecto que vio la persona dueña del producto es que los **filtros de PQRS son feos y molestos**: la lista del CAE apila tres filas de chips de 48 px con salto de línea. La revisión del código añade dos indicadores de color con menos de 3:1 y un borde que falta en la burbuja ajena en oscuro (detalle en [research.md](research.md)).

Hallazgos que fijan el alcance:

- **Filtros**: `FilterChips` gana la propiedad `scroll` (fila de chips compactos con desplazamiento horizontal, 36 px visuales y 48 px de toque por `hitSlop`) y las tres listas de PQRS la usan. Es la opción B por defecto: la persona dueña del producto no respondió y se deja como supuesto cambiable.
- **Cabecera**: `ScreenHeader` en mensajes (sin número, dos pestañas), mis PQRS y PQRS del CAE (con total).
- **Indicadores**: `StatusBadge` y `PqrsFiledScreen` pasan a `successText`/`warningText`/`primary`; el chat ya usaba `errorText`.
- **Burbuja ajena en oscuro**: el mismo borde de 1 px que `Card` (spec 026).
- **Lo demás ya cumple**: composer, avisos, indicador de escritura, formularios y cambio de clave.

Enfoque:

- **Documento primero** (FR-012): `Design.md` suma las tres pantallas al registro «sobrio con cabecera» y define la fila de filtros compacta; D-127.
- **Sin roles nuevos ni textos nuevos ni dependencias nuevas.**
- **Guardas**: `severityIndicators` y `headerBudget` se amplían a la fase; prueba de `FilterChips` con `scroll`.

## Technical Context

**Language/Version**: TypeScript; React Native + Expo (Expo Router 58), Jest con `@testing-library/react-native` v14.

**Primary Dependencies**: las existentes (`ScreenHeader`, `FilterChips`, `usePalette`). **Ninguna nueva.**

**Storage**: N/A.

**Testing**: Jest (`src/theme/__tests__`, `src/components/__tests__`, pruebas de chat y PQRS); recorrido manual en teléfono en claro y oscuro, español e inglés.

**Target Platform**: Android e iOS.

**Project Type**: mobile + documentación (`tutorias_uts_mobile`, `Claude/docs`, `Claude/specs`).

**Performance Goals**: sin cambios; el cambio de modo sigue siendo reactivo.

**Constraints**: reglas de `CLAUDE.md` intactas; textos, rutas, permisos, reglas de chat y de PQRS sin cambios; objetivo táctil de 48 px también en los chips compactos; guardas de las specs 026 a 029 en verde.

**Scale/Scope**: 1 propiedad nueva en 1 pieza, 3 cabeceras, 3 listas con filtros compactos, 3 cambios de color/borde, 2 guardas ampliadas, ~5 pruebas nuevas o ampliadas, 11 pantallas auditadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Design.md` recibe las pantallas del registro y la fila de filtros antes del código; `designDoc.test.ts` sigue exigiendo coincidencia. Decisión D-127 |
| II. Reglas de negocio en backend | No aplica; chat, retención y estados de PQRS no cambian |
| III. Integridad de datos | No aplica |
| IV. Seguridad y privacidad | Sin datos nuevos |
| V. Pruebas primero en lo crítico | Se amplían las guardas antes de corregir y deben fallar con el código actual (`pqrs` en `severityIndicators`, 3 pantallas en `headerBudget`) |
| VI. Internacionalización | Sin textos nuevos (R-3); «All» se comprueba en español e inglés |
| VII. Diseño consistente | Es el objeto de la spec: mismas cabeceras y filtros que las demás listas |
| VIII. Desarrollo incremental | Última fase del inventario; sin pantallas pendientes después |
| IX. Idioma | Docs en español; código y commits en inglés |

**Resultado**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/030-chat-pqrs-profile/
├── plan.md
├── research.md
├── data-model.md        # FilterChips scroll, cabeceras e indicadores
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ninguna API. `screen-inventory.md` de la 026 se actualiza (estado de las pantallas de la fase 4).

### Source Code

```text
tutorias_uts_mobile/
├── src/components/FilterChips.tsx                      # propiedad scroll
├── src/components/__tests__/FilterChips.test.tsx       # prueba de scroll
├── src/features/pqrs/components/StatusBadge.tsx        # roles de texto
├── src/features/pqrs/screens/{PqrsFiledScreen,MyPqrsScreen,AdminPqrsScreen}.tsx
├── src/features/chat/screens/MessagesScreen.tsx        # cabecera
├── src/features/chat/components/MessageBubble.tsx      # borde en oscuro
└── src/theme/__tests__/{severityIndicators,headerBudget}.test.ts

Claude/docs/Design.md        # registro y fila de filtros
Claude/docs/Decisions.md     # D-127
Claude/specs/026-design-system/screen-inventory.md
```

**Structure Decision**: sin carpeta ni pieza nueva; una propiedad en `FilterChips` y las guardas junto al tema.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
