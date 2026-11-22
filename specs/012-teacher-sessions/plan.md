# Implementation Plan: Cronograma del docente: reprogramar y cancelar sesiones

**Branch**: `012-teacher-sessions` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-teacher-sessions/spec.md`

## Summary

El docente ve sus módulos y próximas sesiones, y reprograma, cancela o reactiva una sesión (o ella y las futuras de su mismo horario semanal) hasta 2 horas antes. Antes de aceptar una nueva hora se comprueba el salón, el docente y los estudiantes inscritos, y cada cambio deja un evento para las notificaciones de la spec 014.

Enfoque técnico (detalle en [research.md](research.md)): sin tablas nuevas. Las sesiones ya guardan hora original, estado, docente y salón; se agrega el motivo `TEACHER` y tres tipos de evento. La disponibilidad se comprueba **sobre sesiones reales** (como ya hace la restauración de festivos de la spec 010) y se serializa con bloqueos en orden fijo: periodo (`FOR SHARE`) → módulo (`FOR UPDATE`) → salones → docentes. Los cruces con estudiantes cuentan asistentes de la spec 011 sin exponer a nadie. `dryRun` permite consultar la disponibilidad antes de confirmar.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK vigente en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7 (`@prisma/adapter-pg`), class-validator y `@nestjs/swagger` (ya presentes); sin dependencias nuevas. App: Expo Router, TanStack Query, i18next y `react-native-iconify` (ya presentes); sin dependencias nuevas.

**Storage**: PostgreSQL. Sin tablas nuevas: `module_sessions` (valor `TEACHER` en el motivo y dos índices), `outbox_events` (tres tipos). Se reutilizan `modules`, `module_schedules`, `rooms`, `holidays`, `academic_periods`, `enrollments` y `session_absences`.

**Testing**: Backend: Vitest (unitarias de reglas puras y e2e con Supertest sobre PostgreSQL de prueba), con `TestClock` congelable para las ventanas de 119, 120 y 121 minutos. Pruebas de concurrencia (dos reprogramaciones al mismo salón y hora; reprogramar y cancelar la misma sesión), de roles contra la misma lista del contrato y de contrato contra `contracts/teacher-sessions-api.yaml`. App: Jest + React Native Testing Library, con paridad de i18n es/en.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service en tres repositorios hermanos: `tutorias_uts_db` (esquema y migración), `tutorias_uts_back` (API) y `tutorias_uts_mobile` (app).

**Performance Goals**: Lista de sesiones del docente en menos de 1 s; reprogramar una serie de hasta 20 sesiones en menos de 1 s (una consulta de salón/docente y una de estudiantes por sesión, con índices por `(room_id, starts_at)` y `(teacher_id, starts_at)`).

**Constraints**: Reglas siempre en el backend y respaldadas por transacción y bloqueos; borrado lógico y ninguna sesión se elimina; fechas en UTC y hora local de `America/Bogota`; guard `@Roles('TEACHER')` en cada endpoint y la sesión siempre se filtra por el docente del token; errores con `code` estable traducido en la app; el límite de 2 horas en configuración; nada de datos personales de estudiantes en respuestas de cruce ni en eventos; el periodo Cerrado es de solo lectura; sin notificaciones (D-087).

**Scale/Scope**: Una institución; decenas de módulos por docente y hasta unas 20 sesiones por horario semanal. Pantallas nuevas: cronograma del docente, hoja de acciones por sesión. Endpoints nuevos: 5.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respetan `Context.md` §4.2 y las reglas de módulos. Se ajusta D-069 (el docente elige el alcance) y se resuelve la pregunta abierta de `Context.md` §10 sobre cruces con estudiantes; `Architecture.md` §5 y §6, `Context.md`, `Design.md` y `Decisions.md` (D-093 a D-096) se actualizan en el mismo cambio (ver abajo). |
| II. Reglas de negocio en backend | Ventana de 2 horas, semana, festivos, horario permitido, disponibilidad de salón y docente, cruces con estudiantes, periodo Cerrado y rol docente viven en servicios y transacciones con bloqueos. La app solo refleja y usa `dryRun` para mostrar el motivo. |
| III. Integridad de datos | `deletedAt: null` en todas las consultas; ninguna sesión se borra (cancelar es un estado). `original_starts_at` no cambia nunca. Fechas en UTC con conversión a Bogotá en un solo punto. El límite de 2 horas en configuración (`TEACHER_CHANGE_LEAD_MINUTES`). Evento y cambio en la misma transacción. |
| IV. Seguridad y privacidad | `@Roles('TEACHER')` en cada endpoint; las consultas parten del docente del token (ajeno es `404`). Los rechazos por estudiantes y los eventos llevan solo cantidades e ids, nunca contacto ni nombres de estudiantes. |
| V. Pruebas primero | Pruebas de ventana (119, 120, 121), disponibilidad, cruces con estudiantes, alcance, festivos, semana, eventos, concurrencia, roles (`403` estudiante y CAE, `401` sin token) y contrato. |
| VI. Internacionalización | Textos y `code` de error en `es.json` y `en.json`; paridad verificada por la prueba existente. |
| VII. Diseño consistente | Tokens y componentes existentes; objetivos de 48 px; íconos Iconify en el registro único; toda acción bloqueada muestra la regla; botones con ícono a la izquierda y 16 px entre botones apilados. |
| VIII. Desarrollo incremental | Una rama; historias entregables por prioridad: ver (US1), reprogramar (US2), cancelar y reactivar (US3) y eventos (US4, transversal a las anteriores). |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones. Condición de publicación (FR-015, D-087): esta rama no se publica en producción sin la spec 014 o sin un consumidor del outbox; se anota en el PR.

**Re-evaluación tras el diseño (Fase 1)**: sin cambios. El límite conocido de R-4 (cruces del CAE y de la inscripción que miran el horario semanal) no viola ningún principio y se registra en D-096.

## Project Structure

### Documentation (this feature)

```text
specs/012-teacher-sessions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── teacher-sessions-api.yaml
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
└── prisma/
    ├── schema.prisma                # + TEACHER en SessionCancelReason, 3 tipos en OutboxEventType, 2 índices
    └── migrations/<ts>_add_teacher_session_changes/migration.sql

tutorias_uts_back/
├── src/
│   ├── teacher-sessions/
│   │   ├── teacher-sessions.module.ts
│   │   ├── teacher-sessions.controller.ts   # /teacher/modules y /teacher/sessions y sus acciones
│   │   ├── teacher-sessions.service.ts      # reprogramar, cancelar y reactivar (transacción y bloqueos)
│   │   ├── teacher-schedule.service.ts      # lista de módulos y sesiones del docente
│   │   ├── session-availability.ts          # salón, docente y estudiantes por sesión (SQL compartido)
│   │   ├── teacher-sessions.rules.ts        # ventana, semana, desplazamiento (funciones puras)
│   │   ├── dto/
│   │   └── *.spec.ts
│   ├── config/env.ts                        # + TEACHER_CHANGE_LEAD_MINUTES
│   └── common/errors/app.exception.ts       # + códigos nuevos
└── test/
    ├── teacher-sessions.e2e-spec.ts
    ├── teacher-sessions-change.e2e-spec.ts
    ├── teacher-sessions-concurrency.e2e-spec.ts
    ├── teacher-sessions-roles.e2e-spec.ts   # 403/401 en todos los endpoints del contrato
    └── teacher-sessions-contract.e2e-spec.ts

tutorias_uts_mobile/
├── app/(teacher)/
│   └── schedule/
│       ├── _layout.tsx
│       └── index.tsx                        # cronograma (antes: pantalla vacía)
└── src/
    ├── features/teacher-sessions/           # screens, hooks, componentes (TeacherSessionCard, SessionActionsSheet)
    ├── api/                                 # + tipos y claves de consulta
    ├── i18n/{es,en}.json                    # + textos y códigos de error; "cancelada por el docente" en las pantallas de 010 y 011
    └── icons/registry.ts                    # + íconos nuevos (set solar)
```

**Structure Decision**: Se sigue la estructura por módulo de `docs/Conventions.md` §4 y §5. La pestaña `schedule` del docente pasa de archivo a carpeta, como las de la spec 010 y 011. Se reutilizan `DateField`, `PickerSheet` (horas), `FilterChips`, `ConfirmDialog` y los formatos de `src/features/modules/format.ts`.

## Actualizaciones de docs/

En el mismo cambio (`CLAUDE.md`, "Forma de trabajar"):

- `docs/Architecture.md` §5: nota sobre `ModuleSession` (`cancelReason` `TEACHER`, hora original conservada) y los tipos nuevos del outbox; §6: filas "Cambio o cancelación del docente" (`TEACHER_CHANGE_LEAD_MINUTES`, alcance elegido, cruces con estudiantes) y "Sin cruces de salón ni docente" (también por sesión).
- `docs/Context.md` §4.2 y §10: el docente cambia o cancela una sesión o ella y las futuras de su horario, puede reactivar su cancelación, y se rechaza si un inscrito se cruza; se cierra la pregunta abierta de cruces con estudiantes.
- `docs/Decisions.md`:
  - D-069: se ajusta (el docente elige el alcance; "futuras" son las de su horario semanal).
  - D-093 Cruces con estudiantes inscritos: se rechaza, solo cantidad.
  - D-094 Reprogramación solo dentro de la misma semana.
  - D-095 El docente puede reactivar lo que canceló.
  - D-096 Disponibilidad por sesión y orden de bloqueo; límite conocido de los cruces semanales del CAE y de la inscripción.
- `docs/Design.md`: pantalla del cronograma del docente y la hoja de acciones por sesión.

## Complexity Tracking

Sin violaciones de la constitución que justificar. Una complejidad deliberada: la comprobación de disponibilidad es por sesión (no por horario semanal) para ser exacta con sesiones ya movidas; se acota con índices por `(room_id, starts_at)` y `(teacher_id, starts_at)` y con una consulta por sesión movida.
