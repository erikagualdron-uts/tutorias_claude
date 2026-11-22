# Implementation Plan: Dashboards de los tres roles

**Branch**: `019-dashboards` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/019-dashboards/spec.md`

## Summary

El CAE, el docente y el estudiante abren su pantalla de entrada y ven las cifras de su rol: ocupación, cuentas, PQRS, cambios recientes y salones (CAE); próxima sesión, semana, cupo por módulo (docente); próxima sesión, semana y cambios que lo afectan (estudiante). Todo es lectura sobre datos que ya existen.

Enfoque técnico (detalle en [research.md](research.md)):

- **Sin tablas ni migraciones**: ningún dato nuevo. Un módulo nuevo `dashboard/` en el backend solo lee.
- **Cinco endpoints nuevos**, solo para lo que hoy no existe: `GET /dashboard/admin/overview`, `/admin/changes` y `/admin/rooms` (CAE), `GET /dashboard/teacher` y `GET /dashboard/student`. Los del CAE van separados para que el fallo de un bloque no tumbe a los demás (FR-012).
- **Se reutiliza lo que ya responde**: mensajes sin leer (`GET /chat/unread-count`), avisos sin leer (`GET /notifications/unread-count`) y "Mis PQRS" (`GET /pqrs/mine?limit=3`). La cifra coincide con el contador de la pestaña porque es la misma consulta.
- **Reglas de cupo y asistencia reutilizadas**: `ATTENDS_SESSION` y `sessionSeats` de `enrollments/seats.ts` deciden quién asiste a cada sesión (sesiones omitidas, inscripciones canceladas con vigencia), y la semana usa el helper de `calendar.rules.ts` en `America/Bogota`.
- **Cambios recientes sin tabla de historial**: sesiones con estado `RESCHEDULED` o `CANCELLED` por el docente, ordenadas por última modificación. Las cancelaciones por festivo no cuentan (R-4).
- **Un solo valor nuevo de configuración**: `dashboard.lowEnrollmentPercent` (30 por defecto) para "baja inscripción" (FR-005).
- **Sin dependencias nuevas** en backend ni en la app.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7 (consultas SQL agregadas con `$queryRaw`, como `seats.ts`), `@nestjs/swagger`. App: Expo Router, TanStack Query, i18next, `react-native-iconify`, Reanimated (presentes). **Ninguna dependencia nueva.**

**Storage**: PostgreSQL, solo lectura. **Sin migración** y sin cambios en `tutorias_uts_db`. Un valor nuevo en `settings` con valor por defecto en código (ver [data-model.md](data-model.md)).

**Testing**: Backend: Vitest (unitarias de las funciones puras: ocupación, baja inscripción, ranking de salones, cambios; e2e con Supertest sobre PostgreSQL de prueba: roles `403`, concordancia con los datos, estados vacíos, cuentas inactivas, semana en `America/Bogota`) y contrato contra `contracts/dashboard-api.yaml`. App: Jest + React Native Testing Library con paridad de i18n es/en.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service. Toca `tutorias_uts_back` y `tutorias_uts_mobile`; `tutorias_uts_db` no cambia.

**Performance Goals**: cada endpoint responde en menos de 300 ms en el servidor con 200 módulos y 200 PQRS (SC-001 son 3 s de pantalla completa, medidos a mano). Agregados en una consulta por bloque, sin consultar módulo por módulo; se usan los índices existentes.

**Constraints**: guard de rol por endpoint (`SUPERADMIN` el del CAE, `TEACHER` el del docente, `STUDENT` el del estudiante) y las cifras personales se filtran por el usuario autenticado, nunca por un parámetro; los borrados lógicos se excluyen; fechas en UTC y "esta semana" de lunes a domingo en `America/Bogota`; textos solo en `es.json` y `en.json`; colores solo de `Design.md`; el estado nunca solo por color; objetivos de 48 px; íconos solo Iconify en `src/icons/`; todo botón con ícono a la izquierda; los cuatro estados por bloque; animaciones cortas que respetan "reducir movimiento"; sin datos de contacto en respuestas ni logs.

**Scale/Scope**: una institución; cientos de módulos, PQRS y cuentas. Endpoints nuevos: 5. Pantallas: 3 dashboards (reemplazan `EmptyTabScreen`) y 1 lista paginada de cambios del CAE para "Ver todo" (R-5).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Context.md` §8 y `Design.md` "Dashboards". Se actualizan `Context.md` (definiciones de ocupación, baja inscripción y tiempo de respuesta), `Architecture.md`, `Design.md` (lista de cambios) y `Decisions.md` (D-116; la numeración sigue a D-115 de la 018) en el mismo cambio. |
| II. Reglas de negocio en backend | Esta spec no crea ni cambia reglas de cupo, cruces, ventanas ni cambio de salón; las lee. Quién asiste a una sesión lo decide el servidor con `ATTENDS_SESSION`, no la app. |
| III. Integridad de datos | Solo lectura; todas las consultas filtran `deleted_at`; fechas en UTC y semana en `America/Bogota`; el umbral de baja inscripción vive en configuración. |
| IV. Seguridad y privacidad | Guard por rol en los 5 endpoints con prueba de `403`; docente y estudiante reciben solo sus datos; el CAE ve agregados, sin textos de PQRS ni de chat. |
| V. Pruebas primero en lo crítico | No toca las reglas del Principio II. Se prueban antes de implementar las funciones de cálculo y los permisos. |
| VI. Internacionalización | Todos los textos y estados vacíos en es y en. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; el estado de las PQRS y del cupo con texto además de color; lima nunca como texto sobre blanco. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/019-dashboards/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-api.yaml
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_back/
├── src/dashboard/
│   ├── dashboard.module.ts
│   ├── dashboard.controller.ts                # los 5 endpoints, @Roles por ruta
│   ├── admin-dashboard.service.ts             # overview, changes, rooms (SQL agregado)
│   ├── person-dashboard.service.ts            # teacher y student: próxima sesión, semana, cupo, cambios
│   ├── dashboard.rules.ts                     # funciones puras: ocupación, baja inscripción, ranking de salones
│   ├── dto/                                   # ChangesQueryDto (page, limit)
│   └── dashboard.rules.spec.ts
├── src/settings/settings.service.ts           # + dashboard.lowEnrollmentPercent (30)
├── src/app.module.ts                          # importa DashboardModule
└── test/dashboard-*.e2e-spec.ts               # roles, concordancia, contrato

tutorias_uts_mobile/
├── app/(admin)/index.tsx, (teacher)/index.tsx, (student)/index.tsx   # pasan de EmptyTabScreen a su dashboard
├── app/(admin)/changes/index.tsx              # "Ver todo" de cambios recientes
├── src/features/dashboard/
│   ├── api.ts, hooks/                         # useAdminOverview, useAdminChanges, useAdminRooms, useTeacherDashboard, useStudentDashboard
│   ├── components/                            # MetricCard, HeroSessionCard, CapacityBar, StatusStackBar, ChangeRow, RoomBars
│   └── screens/                               # AdminDashboardScreen, TeacherDashboardScreen, StudentHomeScreen, ChangesScreen
├── src/i18n/{es,en}.json                      # textos nuevos
└── src/icons/registry.ts                      # íconos nuevos del set solar

Claude/docs/                                   # Context, Architecture, Design, Decisions
```

**Structure Decision**: mismo patrón de las specs 010 a 018: un módulo de negocio de solo lectura en el backend (`src/dashboard/`) y una carpeta por funcionalidad en la app (`src/features/dashboard/`). Los bloques que ya tienen endpoint (sin leer, mis PQRS) lo reutilizan y no se duplican en el backend.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
