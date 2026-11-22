# Implementation Plan: Pulido de PQRS, dashboards y pruebas

**Branch**: `020-polish` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/020-polish/spec.md`

## Summary

Cinco pulidos sin reglas nuevas: pantalla de confirmación con número de radicado al radicar, línea de tiempo del estado de una PQRS, insignia de PQRS radicadas en la pestaña del CAE, cifras que cuentan hacia arriba en los dashboards y una prueba de la app estable.

Enfoque técnico (detalle en [research.md](research.md)):

- **Casi todo es app.** Sin tablas, sin migración y sin endpoints nuevos. El único cambio de backend es aditivo: el detalle de la PQRS del autor (`GET /pqrs/mine/:id`) pasa a incluir `reviewedAt` y `resolvedAt`, que el CAE ya recibe, para poder dibujar la línea de tiempo.
- **Número de radicado sin dato nuevo**: los 8 primeros caracteres del identificador (sin guiones, en mayúsculas), calculados en una función de la app y mostrados en la confirmación, la lista y el detalle del autor y del CAE.
- **Confirmación como pantalla nueva** a la que se llega con `router.replace` tras radicar; recibe por parámetros lo que devolvió el servidor, así que no hace otra consulta.
- **Línea de tiempo** como un componente que usa `PqrsBody`, así el autor y el CAE ven lo mismo.
- **Insignia** con `tabBarBadge` de las pestañas, alimentada por `GET /pqrs?status=FILED&limit=1` (su `meta.total`), el endpoint del CAE que ya existe; los cambios de estado ya invalidan `['pqrs']`, así que se actualiza sola, y un sondeo de 60 s con el regreso a primer plano cubre las PQRS que llegan nuevas.
- **Conteo animado** en `MetricCard` con un gancho propio de JavaScript (sin dependencias): 600 ms, solo en el primer montaje y solo para números enteros; con "reducir movimiento" muestra el valor final.
- **Prueba estable** con un `testTimeout` global de 15 s en la configuración de Jest, sin quitar verificaciones.
- **Sin dependencias nuevas.**

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: App: Expo Router, TanStack Query, i18next, `react-native-iconify`, Reanimated (`useReducedMotion`) (presentes). Backend: NestJS 12, Prisma 7 (presentes). **Ninguna dependencia nueva.**

**Storage**: PostgreSQL, sin cambios. **Sin migración** y sin cambios en `tutorias_uts_db` (ver [data-model.md](data-model.md)).

**Testing**: App: Jest + React Native Testing Library (confirmación, línea de tiempo, insignia, conteo animado con temporizadores simulados, función del número de radicado) con paridad de i18n es/en. Backend: e2e del detalle del autor con las dos fechas y contrato contra `specs/017-pqrs/contracts/pqrs-api.yaml` actualizado.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service. Toca `tutorias_uts_mobile` y, con un campo, `tutorias_uts_back`; `tutorias_uts_db` no cambia.

**Performance Goals**: el conteo dura 600 ms y no bloquea la interacción; la consulta de la insignia pide una sola fila (`limit=1`) y responde en menos de 300 ms con 200 PQRS.

**Constraints**: textos solo en `es.json` y `en.json`; colores solo de `Design.md` (la insignia es #B3261E con número blanco); íconos solo Iconify en `src/icons/`; objetivos de 48 px; estado nunca solo por color; todo botón con ícono a la izquierda y 16 px entre botones apilados; animaciones cortas que respetan "reducir movimiento"; fechas en UTC y mostradas en `America/Bogota`; la insignia solo la ve el CAE.

**Scale/Scope**: una institución; cientos de PQRS. Endpoints nuevos: 0 (un campo aditivo). Pantallas nuevas: 1 (confirmación) y 3 componentes (línea de tiempo, insignia como opción de pestaña, conteo animado).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Design.md` (confirmación, línea de tiempo, insignia, conteo). Se actualizan `Design.md` (quitar lo que ya no es "Not built yet"), `Architecture.md` (campo aditivo y consulta de la insignia) y `Decisions.md` (D-117; la numeración sigue a D-116 de la 019) en el mismo cambio. |
| II. Reglas de negocio en backend | No cambia ninguna regla: ni estados, ni permisos, ni cupos. El campo nuevo sale del mismo endpoint con el mismo guard (`STUDENT` y `TEACHER`, PQRS propias). |
| III. Integridad de datos | Sin datos nuevos; las fechas salen en UTC y se muestran en `America/Bogota`; una fecha ausente se muestra sin hora, nunca inventada. |
| IV. Seguridad y privacidad | El detalle del autor sigue siendo solo del autor (`404` en una ajena); la insignia reutiliza `GET /pqrs`, solo `SUPERADMIN`; nada nuevo en logs. |
| V. Pruebas primero en lo crítico | No toca las reglas del Principio II. Se escribe primero la prueba del campo aditivo y de la función del número. |
| VI. Internacionalización | Todos los textos en es y en. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; el estado de la línea de tiempo con texto e ícono. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/020-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── changes.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_back/
├── src/pqrs/pqrs.service.ts                   # detail() del autor incluye reviewedAt y resolvedAt
└── test/pqrs-mine.e2e-spec.ts, pqrs-contract.e2e-spec.ts   # casos del campo nuevo

tutorias_uts_mobile/
├── app/(student)/pqrs/filed.tsx, (teacher)/pqrs/filed.tsx  # ruta de la confirmación
├── app/(admin)/_layout.tsx                    # la pestaña PQRS lleva la insignia
├── src/features/pqrs/
│   ├── code.ts                                # número de radicado: pqrsCode(id)
│   ├── components/StatusTimeline.tsx          # línea de tiempo vertical
│   ├── components/PqrsBody.tsx, PqrsCard.tsx  # muestran el número y la línea de tiempo
│   ├── hooks/useFiledCount.ts                 # cantidad de PQRS radicadas para el CAE
│   ├── screens/PqrsFiledScreen.tsx            # confirmación al radicar
│   └── screens/NewPqrsScreen.tsx              # al radicar, replace hacia la confirmación
├── src/features/shell/RoleTabs.tsx            # opción de insignia por pestaña
├── src/features/dashboard/
│   ├── hooks/useCountUp.ts                    # conteo de 600 ms, una vez, con reducir movimiento
│   └── components/MetricCard.tsx              # usa useCountUp
├── src/api/types.ts                           # PqrsDetail con reviewedAt y resolvedAt
├── src/i18n/{es,en}.json, src/icons/registry.ts
└── package.json                               # jest.testTimeout

Claude/docs/                                   # Design, Architecture, Decisions
```

**Structure Decision**: mismo patrón de las specs 010 a 019: una carpeta por funcionalidad en la app (`features/pqrs`, `features/dashboard`) y, para el único campo de backend, el módulo `pqrs/` existente. Ninguna pieza nueva fuera de esas carpetas.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
