# Implementation Plan: Administración del CAE renovada

**Branch**: `029-admin-screens` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/029-admin-screens/spec.md`

## Summary

La fase 3 lleva el sistema de las specs 026 a 028 a las 22 pantallas de administración del CAE y, por petición de la persona dueña del producto, les da un aspecto más moderno y llamativo con un tercer registro, **«sobrio con cabecera»**: un bloque compacto de marca arriba y el resto sobrio. El teléfono no mostró defectos; la revisión del código encontró cinco usos de color de severidad con menos de 3:1 en un modo (detalle en [research.md](research.md)).

Hallazgos que fijan el alcance:

- **Pieza compartida nueva**: `ScreenHeader` (degradado de marca, título, línea lima y número). Las 8 listas ya abren con un `Text` de título que ella reemplaza; el índice de «Más» y los cambios la ganan con textos que ya existen (`tabs.more`, `dashboard.admin.changes.title`). Sin textos nuevos: el número no necesita etiqueta.
- **Cinco indicadores corregidos**: borde del ítem de cerrar sesión (`AppBar`), ícono de cuenta activa (`AccountCard`), segmentos de PQRS (`StatusStackBar`), borde e ícono del estado SMTP y borde de campo con error (`FieldBox`).
- **Lo demás ya cumple**: los 9 formularios, los botones y chips (spec 027) y los estados vacío, de carga y de error.

Enfoque:

- **Documento primero** (FR-012): `Design.md` define el registro nuevo y ajusta la regla 2; D-126.
- **Sin roles nuevos**: indicadores con `errorText`, `warningText`, `successText`; cabecera con `gradients.brand`, `onGradient.text` y `accent` (ya existen).
- **Guardas**: `severityIndicators.test.ts` suma las carpetas de la fase; `headerBudget.test.ts` nueva (una cabecera, ningún patrón); prueba del componente.
- **Sin backend, sin textos nuevos, sin dependencias nuevas.**

## Technical Context

**Language/Version**: TypeScript; React Native + Expo (Expo Router 58), Jest con `@testing-library/react-native` v14.

**Primary Dependencies**: las existentes (`expo-linear-gradient`, `usePalette`, `useShadows`, `gradients`, `onGradient`). **Ninguna nueva.**

**Storage**: N/A.

**Testing**: Jest (`src/theme/__tests__`, `src/components/__tests__`, pruebas de las pantallas); recorrido manual en teléfono en claro y oscuro, español e inglés.

**Target Platform**: Android e iOS.

**Project Type**: mobile + documentación (`tutorias_uts_mobile`, `Claude/docs`, `Claude/specs`).

**Performance Goals**: sin cambios; el cambio de modo sigue siendo reactivo.

**Constraints**: reglas de `CLAUDE.md` intactas (decoración solo con `BrandPattern`; el degradado es el de marca y no hay patrón en el registro nuevo); textos, rutas, permisos y reglas de negocio sin cambios; barra de pestañas y cabecera superior solo cambian de color; guardas de las specs 026 a 028 en verde.

**Scale/Scope**: 1 componente nuevo, 5 usos corregidos en 5 archivos, 10 pantallas con cabecera (8 listas, índice y cambios), 2 pruebas de guarda (1 ampliada, 1 nueva), 1 prueba de componente, ~10 pruebas de pantalla ampliadas, 22 pantallas auditadas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Design.md` recibe el registro nuevo y la regla antes del código; `designDoc.test.ts` sigue exigiendo coincidencia. Decisión D-126 |
| II. Reglas de negocio en backend | No aplica; periodos, salones, feriados, SMTP y cuentas no cambian de reglas |
| III. Integridad de datos | No aplica |
| IV. Seguridad y privacidad | Sin datos nuevos; la clave temporal sigue mostrándose una sola vez |
| V. Pruebas primero en lo crítico | Se amplía la guarda antes de corregir y debe fallar con el código actual (5 archivos) |
| VI. Internacionalización | Sin textos nuevos (R-3) |
| VII. Diseño consistente | Es el objeto de la spec: 10 pantallas con la misma cabecera y estados sin color como único vehículo |
| VIII. Desarrollo incremental | Una fase por rama; la fase 4 (chat, PQRS, perfil) queda aparte |
| IX. Idioma | Docs en español; código y commits en inglés |

**Regla de `CLAUDE.md`**: «Decoración solo con el patrón de hojas, plumas y libros; nada de círculos o arcos geométricos». La cabecera es un bloque de degradado de marca sin forma decorativa, igual que el `HeroCard`, y la línea lima es un detalle de marca ya definido en `Design.md`.

**Resultado**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/029-admin-screens/
├── plan.md
├── research.md
├── data-model.md        # ScreenHeader y uso de roles
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ninguna API. `screen-inventory.md` de la 026 se actualiza (estado de las 22 pantallas).

### Source Code

```text
tutorias_uts_mobile/
├── src/components/ScreenHeader.tsx                    # nueva: cabecera compacta
├── src/components/__tests__/ScreenHeader.test.tsx     # nueva
├── src/components/{AppBar,FieldBox}.tsx               # indicador con errorText
├── src/features/accounts/components/AccountCard.tsx   # successText
├── src/features/dashboard/components/StatusStackBar.tsx
├── src/features/smtp/screens/SmtpSettingsScreen.tsx
├── src/features/{modules,rooms,accounts,periods,holidays,dropdown-lists}/screens/  # cabecera en 8 listas
├── src/features/dashboard/screens/ChangesScreen.tsx   # cabecera
├── src/features/shell/screens/MoreScreen.tsx          # cabecera
└── src/theme/__tests__/{severityIndicators,headerBudget}.test.ts

Claude/docs/Design.md        # registro nuevo, regla 2, error de campo
Claude/docs/Decisions.md     # D-126
Claude/specs/026-design-system/screen-inventory.md
```

**Structure Decision**: sin carpeta nueva; una sola pieza compartida junto a `HeroCard` y las guardas junto al tema.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
