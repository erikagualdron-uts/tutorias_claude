# Implementation Plan: Calendario semanal del docente

**Branch**: `013-teacher-weekly-calendar` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/013-teacher-weekly-calendar/spec.md`

## Summary

El cronograma del docente pasa a abrir con un calendario semanal (franja de 7 días con marcas, vista Día con línea de tiempo y vista Semana de 7 columnas), seguido de las tarjetas de próximas sesiones y del resumen de módulos de la spec 012. Tocar un bloque abre la hoja de acciones existente.

Enfoque técnico (detalle en [research.md](research.md)): **sin cambios en la base de datos y sin dependencias nuevas**. El backend suma un único endpoint de lectura, `GET /teacher/calendar?from&to`, que reutiliza la vista `TeacherSession` de la 012 y entrega también el periodo y las horas permitidas de la configuración. La app suma un componente de calendario reutilizable y sin conocimiento del docente (`src/components/calendar/`) y una pantalla que lo alimenta; el refresco tras un cambio sale de la invalidación que la 012 ya hace.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK vigente en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7, class-validator y `@nestjs/swagger` (ya presentes); sin dependencias nuevas. App: Expo Router, TanStack Query, i18next, Reanimated y `react-native-iconify` (ya presentes); sin dependencias nuevas ni librería de calendario ni de fechas (D-081).

**Storage**: PostgreSQL, solo lectura. Sin tablas, columnas ni migraciones nuevas; usa el índice `(teacher_id, starts_at)` de la spec 012.

**Testing**: Backend: Vitest (unitarias de las reglas de rango y e2e con Supertest sobre PostgreSQL de prueba, `TestClock` congelable) y contrato contra `contracts/teacher-calendar-api.yaml`. App: Jest + React Native Testing Library, con paridad de i18n es/en y pruebas de las funciones puras de semana, rango de horas y ubicación de bloques en zonas horarias distintas.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service. Esta funcionalidad toca `tutorias_uts_back` y `tutorias_uts_mobile`; `tutorias_uts_db` no cambia.

**Performance Goals**: Semana cargada en menos de 2 s en red normal (SC-002); una consulta de sesiones acotada a 7 días, más una de cupos y una de salones (las mismas de la 012).

**Constraints**: Solo el docente del token (`@Roles('TEACHER')`, sesiones ajenas nunca visibles); fechas en UTC y hora de `America/Bogota` calculada en un solo punto; sin textos escritos en componentes (es y en); horas permitidas y límite de cambio desde configuración; colores solo de `Design.md`; objetivos de 48 px; "reducir movimiento"; sin hexadecimales, `fontFamily` ni `fontWeight` en componentes; íconos solo Iconify en `src/icons/`.

**Scale/Scope**: Una institución; un docente tiene del orden de decenas de sesiones por semana. Pantallas: 1 modificada (cronograma del docente). Endpoints: 1 nuevo. Componentes nuevos reutilizables: calendario (encabezado, franja de días, vista Día, vista Semana, bloque de sesión, línea de hora actual) y control segmentado.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respetan `Context.md` §4.2 y la sección "Weekly schedule (all roles)" de `Design.md`. Se actualizan `Design.md`, `Architecture.md`, `Context.md` y `Decisions.md` en el mismo cambio (ver abajo). |
| II. Reglas de negocio en backend | El calendario no decide reglas: las banderas `canReschedule`, `canCancel`, `canRestore` y `blockReason` vienen del servidor (reutiliza `sessionChangeActions`), y el rol y la propiedad se validan allí. La app solo dibuja. |
| III. Integridad de datos | Solo lectura; `deletedAt: null` en la consulta; fechas en UTC y conversión a Bogotá en un solo punto; horas y límites desde configuración. |
| IV. Seguridad y privacidad | `@Roles('TEACHER')` y consulta siempre por el docente del token; respuesta con cantidades de asistentes, sin datos personales de estudiantes. |
| V. Pruebas primero | Pruebas de rango y límite de 7 días, pasadas y futuras, estados, periodo Activo/Cerrado/ausente, roles (`403` estudiante y CAE, `401` sin token), solo propias, contrato, y de las funciones puras de la app (semana, rango de horas, ubicación en Bogotá). |
| VI. Internacionalización | Textos del calendario bajo `calendar.*` y del cronograma en `es.json` y `en.json`; paridad verificada por la prueba existente; fechas y semana con el formato del idioma. |
| VII. Diseño consistente | Componentes y tokens existentes; íconos Iconify en el registro único; objetivos de 48 px; los cuatro estados de pantalla; animaciones cortas con respeto a "reducir movimiento"; estado por texto e ícono, no solo color. |
| VIII. Desarrollo incremental | Una rama y una funcionalidad; historias por prioridad: ver la semana (US1), navegar (US2), estados (US3) y abrir la hoja (US4). |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones.

**Re-evaluación tras el diseño (Fase 1)**: sin cambios. No hay migraciones y la única superficie nueva es de lectura.

## Project Structure

### Documentation (this feature)

```text
specs/013-teacher-weekly-calendar/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── teacher-calendar-api.yaml
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_back/
├── src/teacher-sessions/
│   ├── teacher-sessions.controller.ts    # + GET /teacher/calendar
│   ├── teacher-schedule.service.ts       # + calendar(): periodo, rango y sesiones (reutiliza views())
│   ├── calendar.rules.ts                 # validación del rango (días válidos, orden, máximo 7) y elección del periodo
│   ├── dto/teacher-sessions.dto.ts       # + TeacherCalendarQueryDto
│   └── *.spec.ts
└── test/
    ├── teacher-calendar.e2e-spec.ts      # rango, estados, periodos, solo propias
    ├── teacher-calendar-roles.e2e-spec.ts# 403/401
    └── teacher-calendar-contract.e2e-spec.ts

tutorias_uts_mobile/
├── app/(teacher)/schedule/index.tsx      # sin cambios de ruta; usa la pantalla actualizada
└── src/
    ├── components/calendar/              # reutilizable, sin lógica del docente
    │   ├── WeekCalendar.tsx              # encabezado + franja + vista elegida
    │   ├── CalendarHeader.tsx            # rango, flechas, "Hoy" y selector Día/Semana
    │   ├── DayStrip.tsx                  # 7 días con marca
    │   ├── DayTimeline.tsx               # vista Día
    │   ├── WeekGrid.tsx                  # vista Semana
    │   ├── SessionBlock.tsx              # bloque (estado por texto e ícono)
    │   ├── NowLine.tsx
    │   ├── calendarMath.ts               # semana, rango de horas, posición y solape (funciones puras)
    │   ├── types.ts                      # CalendarItem
    │   └── __tests__/
    ├── components/SegmentedControl.tsx   # Día/Semana (nuevo, genérico)
    ├── features/teacher-sessions/
    │   ├── hooks/useTeacherCalendar.ts   # consulta por semana: ['teacher','calendar',from]
    │   ├── screens/TeacherScheduleScreen.tsx  # calendario, tarjetas y resumen de módulos
    │   └── __tests__/calendar.test.tsx
    ├── api/types.ts                      # + TeacherCalendar
    ├── i18n/{es,en}.json                 # + calendar.* y textos del cronograma
    └── icons/registry.ts                 # + íconos nuevos si faltan (set solar)
```

**Structure Decision**: Se sigue la estructura por módulo de `docs/Conventions.md` §4 y §5. El calendario vive en `src/components/calendar/` porque es transversal (FR-015); la lógica del docente (consulta, traducción de `TeacherSession` a `CalendarItem` y apertura de la hoja) queda en `features/teacher-sessions/`. Se reutilizan `Card`, `Button`, `EmptyState`, `FadeInView`/`useMotion`, `BrandLoader`, `SessionActionsSheet`, `TeacherSessionCard`, `bogotaParts` y `src/date/day.ts`.

## Actualizaciones de docs/

En el mismo cambio (`CLAUDE.md`, "Forma de trabajar"):

- `docs/Design.md`: sección "Weekly schedule (all roles)" ajustada a lo decidido (selector Día/Semana, umbral de 600 dp, orden de la pantalla del docente, rango de horas desde configuración, bloques por estado) y el párrafo del cronograma del docente.
- `docs/Architecture.md`: el endpoint `GET /teacher/calendar` y el componente reutilizable `components/calendar/`.
- `docs/Context.md` §4.2: el calendario semanal del docente con sus vistas.
- `docs/Decisions.md`: nueva decisión (endpoint por rango separado de `/teacher/sessions`, periodo Activo o último Cerrado en solo lectura, calendario reutilizable) y la renumeración: la spec de notificaciones pasa a ser la **014**, con la referencia de D-087 y de la spec 012 actualizadas.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
