# Implementation Plan: Cronograma semanal del estudiante

**Branch**: `021-student-schedule` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/021-student-schedule/spec.md`

## Summary

La pestaña "Cronograma" del estudiante deja de estar vacía y muestra el calendario semanal de solo lectura con las sesiones de los módulos donde asiste, con el estado de cada una.

Enfoque técnico (detalle en [research.md](research.md)):

- **Un endpoint nuevo de lectura**, `GET /student/calendar?from&to`, gemelo del `GET /teacher/calendar` de la spec 013: una semana, el periodo activo (o el último cerrado) y las horas permitidas en `meta`, y las sesiones del estudiante en `data`. Sin tablas ni migración.
- **Quién asiste, con la regla que ya existe.** `ATTENDS_SESSION` (de `enrollments/seats.ts`) mezcla dos condiciones: la inscripción cubre la sesión y no hay ausencia. Se parte en dos fragmentos para poder listar también las sesiones que el estudiante omitió y marcarlas (`absent`), sin copiar la regla.
- **El periodo y las horas, una sola vez.** La resolución del periodo y de las horas que hoy está dentro de `TeacherScheduleService.calendar` pasa a una función compartida que usan el docente y el estudiante; el comportamiento del docente no cambia.
- **El calendario ya es genérico** (`src/components/calendar/`). La app agrega `StudentScheduleScreen`, la conversión de una sesión a un bloque (docente en la segunda línea, estados con "Cancelada por ti") y un gancho `useWeekNavigation` que saca de `TeacherScheduleScreen` el estado de semana, día y vista para que lo compartan ambos.
- **Solo lectura**: tocar una sesión abre el detalle del módulo que ya existe; no hay hoja de acciones.
- **Frescura**: el gancho `useRefreshOnFocus` (hoy en el dashboard) pasa a `src/hooks/` para refrescar el calendario al volver a la pestaña.
- **Sin dependencias nuevas.**

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7 (`$queryRaw`, como `seats.ts`), `@nestjs/swagger`. App: Expo Router, TanStack Query, i18next, `react-native-iconify` (presentes). **Ninguna dependencia nueva.**

**Storage**: PostgreSQL, solo lectura. **Sin migración** y sin cambios en `tutorias_uts_db` (ver [data-model.md](data-model.md)).

**Testing**: Backend: Vitest (unitarias del fragmento de asistencia y de la conversión de estado; e2e con Supertest: roles, concordancia con inscripciones, ausencias, vigencia de una inscripción cancelada, festivos, periodo activo o cerrado, rango de 7 días) y contrato contra `contracts/student-calendar-api.yaml`. App: Jest + React Native Testing Library (pantalla, bloques y estados, navegación de semanas, toque a módulo) con paridad de i18n es/en; las pruebas del cronograma del docente deben seguir en verde tras sacar el gancho.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service. Toca `tutorias_uts_mobile` y `tutorias_uts_back`; `tutorias_uts_db` no cambia.

**Performance Goals**: el endpoint responde en menos de 300 ms en el servidor con 200 módulos (una consulta por semana, índices existentes `module_sessions(starts_at)` y `module_sessions(module_id, starts_at)`); cambiar de semana muestra las sesiones en menos de 2 s (SC-004).

**Constraints**: guard de rol `STUDENT` en el endpoint y datos del usuario autenticado, nunca de un parámetro; rango de 1 a 7 días (`400 VALIDATION_FAILED` fuera de él); borrados lógicos excluidos; fechas en UTC y semana de lunes a domingo en `America/Bogota`; textos solo en `es.json` y `en.json`; colores solo de `Design.md`; el estado nunca solo por color; objetivos de 48 px; íconos solo Iconify; animaciones que respetan "reducir movimiento"; el calendario sin acciones de cambio.

**Scale/Scope**: una institución; cientos de módulos y miles de sesiones por periodo. Endpoints nuevos: 1. Pantallas nuevas: 1 (reemplaza `EmptyTabScreen`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Context.md` §4.3 y `Design.md` ("Weekly schedule", "Student block", "keep student schedules read-only"). Se actualizan `Context.md`, `Architecture.md`, `Design.md` y `Decisions.md` (D-118; la numeración sigue a D-117 de la 020) en el mismo cambio. |
| II. Reglas de negocio en backend | No cambia ninguna regla de cupo, cruces ni ventanas. Quién asiste a una sesión lo decide el servidor con la regla que ya existe, no la app. |
| III. Integridad de datos | Solo lectura; consultas con `deleted_at`; fechas en UTC y semana en `America/Bogota`; las horas visibles salen de la configuración. |
| IV. Seguridad y privacidad | `@Roles('STUDENT')`, prueba de `403` y de que nunca salen sesiones de otro estudiante; el nombre del docente es el que ya ven los estudiantes en el detalle del módulo; nada nuevo en logs. |
| V. Pruebas primero en lo crítico | No toca las reglas del Principio II. Se prueban antes de implementar la asistencia, las ausencias y la vigencia (las que más pueden desviar el calendario del detalle del módulo). |
| VI. Internacionalización | Todos los textos, estados y estados vacíos en es y en. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; estados con texto e ícono. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/021-student-schedule/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── student-calendar-api.yaml
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_back/
├── src/enrollments/
│   ├── seats.ts                               # ENROLLED_IN_SESSION + ATTENDS_SESSION (parte en dos el fragmento)
│   ├── student-calendar.service.ts            # calendar(userId, from, to): sesiones, ausencias, periodo y horas
│   ├── enrollments.controller.ts              # GET student/calendar (rol STUDENT)
│   ├── enrollments.module.ts                  # registra el servicio
│   └── dto/student-calendar-query.dto.ts      # from y to (YYYY-MM-DD)
├── src/teacher-sessions/teacher-schedule.service.ts   # usa la resolución compartida del periodo y las horas
├── src/periods/calendar-meta.ts               # resolución del periodo y las horas, compartida
└── test/student-calendar*.e2e-spec.ts         # roles, concordancia, ausencias, vigencia, contrato

tutorias_uts_mobile/
├── app/(student)/schedule.tsx                 # exporta StudentScheduleScreen
├── src/components/calendar/useWeekNavigation.ts   # semana, día y vista; sale de TeacherScheduleScreen
├── src/hooks/useRefreshOnFocus.ts             # sale de features/dashboard/hooks
├── src/features/student-schedule/
│   ├── hooks/useStudentCalendar.ts            # GET /student/calendar?from&to
│   ├── calendarItems.ts                       # sesión del estudiante a bloque del calendario
│   ├── screens/StudentScheduleScreen.tsx
│   └── __tests__/
├── src/features/teacher-sessions/screens/TeacherScheduleScreen.tsx   # usa useWeekNavigation
├── src/features/dashboard/ (imports de useRefreshOnFocus)
├── src/api/types.ts                           # StudentCalendar, StudentSession
└── src/i18n/{es,en}.json

Claude/docs/                                   # Context, Architecture, Design, Decisions
```

**Structure Decision**: mismo patrón de las specs 010 a 020: un servicio de lectura junto al módulo de inscripciones, una carpeta por funcionalidad en la app y dos extracciones pequeñas (resolución del periodo en el backend, estado de semana y refresco al enfocar en la app) para no copiar lógica delicada entre el docente y el estudiante.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
