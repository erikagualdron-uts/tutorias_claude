# Implementation Plan: Inscripción de estudiantes a módulos

**Branch**: `011-student-enrollment` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-student-enrollment/spec.md`

## Summary

El estudiante ve las tutorías del periodo Activo en tarjetas, se inscribe a un módulo, cancela una sesión o el módulo completo y vuelve a inscribirse. Con inscripciones reales, las reglas que la spec 010 dejó listas (cambio de salón, edición de horarios, eliminación) se aplican con datos verdaderos.

Enfoque técnico (detalle en [research.md](research.md)): la inscripción es una fila `Enrollment` por estudiante y módulo (una activa a la vez); la ausencia a una sola sesión es una fila `SessionAbsence`. El cupo se mide **por sesión** (aclaración del 2026-11-17): los asistentes de una sesión son las inscripciones activas que no la cancelaron, y nadie se inscribe si alguna sesión futura está llena. La integridad se garantiza con una transacción que bloquea, en un orden fijo, el periodo (`FOR SHARE`), el estudiante y el módulo (`FOR UPDATE`, el mismo bloqueo que ya usa la spec 010), y con índices únicos parciales en la base de datos. La ventana de 1 hora para cancelar vive en configuración. La cancelación del módulo se mide contra la hora de la acción: las sesiones que empiezan en menos de 1 hora se conservan gracias a `effective_until`. Sin eventos nuevos en el outbox: las notificaciones leen las tablas.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK vigente en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7 (`@prisma/adapter-pg`), class-validator y `@nestjs/swagger` (ya presentes); sin dependencias nuevas. App: Expo Router, TanStack Query, i18next y `react-native-iconify` (ya presentes); sin dependencias nuevas.

**Storage**: PostgreSQL. Tablas nuevas: `enrollments` y `session_absences`. Se reutilizan `modules`, `module_schedules`, `module_sessions`, `rooms`, `academic_periods` y `users`.

**Testing**: Backend: Vitest (unitarias de reglas puras y e2e con Supertest sobre PostgreSQL de prueba), con `TestClock` para las ventanas de 1 hora. Prueba de concurrencia: 20 estudiantes sobre un módulo de cupo 5 (SC-002). Prueba de contrato contra `contracts/enrollments-api.yaml` y de roles contra la misma lista de endpoints. App: Jest + React Native Testing Library, con paridad de i18n es/en.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service en tres repositorios hermanos: `tutorias_uts_db` (esquema, migración, seed), `tutorias_uts_back` (API) y `tutorias_uts_mobile` (app).

**Performance Goals**: Oferta del periodo activo en menos de 1 s con cientos de módulos (un par de consultas por petición, sin una consulta por tarjeta); inscribirse o cancelar en menos de 500 ms en condiciones normales; 20 inscripciones simultáneas a un módulo sin sobrecupo ni bloqueos mutuos.

**Constraints**: Reglas siempre en el backend y respaldadas por la base de datos; borrado lógico; fechas en UTC y hora local de `America/Bogota`; guard `@Roles('STUDENT')` en cada endpoint y siempre se filtra por el estudiante autenticado (nunca por un id recibido); errores con `code` estable traducido en la app; el límite de 1 hora en configuración; el periodo Cerrado es de solo lectura; la inscripción no se publica sin notificaciones (D-087).

**Scale/Scope**: Una institución; miles de estudiantes y cientos de módulos por periodo. Pantallas nuevas: oferta de tarjetas, detalle del módulo, "mis tutorías" y la hoja de cancelación con alcance. Endpoints nuevos: 7.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respetan `Architecture.md` (`Enrollment`, inscripción al módulo, transacción con bloqueo de fila) y `Design.md` ("Module card (students)"). Se amplía el modelo (`SessionAbsence`, `effective_until`) y se precisa el cupo por sesión; `Architecture.md` §5 y §6, `Context.md` §6 y D-090 se actualizan en el mismo cambio (ver abajo). |
| II. Reglas de negocio en backend | Cupo, cruces de horario del estudiante, ventana de 1 hora, periodo Cerrado y rol estudiante viven en servicios, transacciones y restricciones de la base de datos. La regla del cambio de salón ("mayor o igual a los inscritos") se **mantiene tal cual**: ahora cuenta inscripciones reales. La app solo refleja. Las notificaciones a inscritos son de la spec 013 (D-087). |
| III. Integridad de datos | `deletedAt` en todo y consultas con `deletedAt: null`; ninguna inscripción ni ausencia se borra físicamente (reactivar una sesión marca `deleted_at`). Fechas en UTC con conversión a Bogotá en un solo punto. El límite de 1 hora en configuración (`STUDENT_CANCEL_LEAD_MINUTES`). |
| IV. Seguridad y privacidad | `@Roles('STUDENT')` en cada endpoint; las consultas parten del `userId` del token, de modo que un estudiante no ve ni toca inscripciones ajenas; las respuestas no incluyen datos de otros estudiantes (solo cantidades). |
| V. Pruebas primero | Pruebas de cupo por sesión (incluida concurrencia con 20 estudiantes), cruce de horarios, ventana de 1 hora (59, 60 y 61 minutos), reinscripción, reactivación, periodo Cerrado, cuenta desactivada, roles (`403` docente y CAE, `401` sin token) y contrato. |
| VI. Internacionalización | Textos y `code` de error en `es.json` y `en.json`; paridad verificada por la prueba existente. |
| VII. Diseño consistente | Tarjeta según `Design.md` ("Module card (students)"); objetivos de 48 px; íconos Iconify en `src/icons/`; toda acción bloqueada muestra la regla; botones con ícono a la izquierda y 16 px entre botones apilados. |
| VIII. Desarrollo incremental | Una rama; historias entregables por prioridad: inscribirse (US1) y cancelar (US2) antes de "mis tutorías" (US3) y las reglas del CAE (US4). |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones. Condición de publicación (FR-019, D-087): esta rama no se publica en producción sin la spec 013 o sin un consumidor del outbox; se anota en el PR.

**Re-evaluación tras el diseño (Fase 1)**: sin cambios; el modelo, el contrato y el orden de bloqueos respetan los mismos principios.

## Project Structure

### Documentation (this feature)

```text
specs/011-student-enrollment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── enrollments-api.yaml
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
└── prisma/
    ├── schema.prisma                # + enum EnrollmentStatus, Enrollment, SessionAbsence
    ├── migrations/<ts>_add_enrollments/migration.sql   # índices únicos parciales y CHECK a mano
    └── seed.ts                      # + estudiante de ejemplo inscrito al módulo de ejemplo

tutorias_uts_back/
├── src/
│   ├── enrollments/
│   │   ├── enrollments.module.ts
│   │   ├── enrollments.controller.ts   # /student/modules, /student/enrollments y sus acciones
│   │   ├── enrollments.service.ts      # inscribir, cancelar módulo, cancelar y reactivar sesión
│   │   ├── offer.service.ts            # oferta y detalle de módulos con cupos y cruces
│   │   ├── seats.ts                    # asistentes y cupos por sesión (SQL compartido)
│   │   ├── enrollments.rules.ts        # ventana de cancelación y cruces (funciones puras)
│   │   ├── dto/
│   │   └── *.spec.ts
│   ├── config-usage/
│   │   └── config-usage.service.ts     # inscritos y maxEnrolled reales (hoy devuelven 0)
│   ├── config/env.ts                   # + STUDENT_CANCEL_LEAD_MINUTES
│   └── common/errors/app.exception.ts  # + códigos nuevos
└── test/
    ├── enrollments.e2e-spec.ts
    ├── enrollments-cancel.e2e-spec.ts
    ├── enrollments-concurrency.e2e-spec.ts
    ├── enrollments-roles.e2e-spec.ts   # 403/401 en todos los endpoints del contrato
    └── enrollments-contract.e2e-spec.ts

tutorias_uts_mobile/
├── app/(student)/
│   ├── modules/
│   │   ├── _layout.tsx
│   │   ├── index.tsx                   # oferta y "mis tutorías" (antes: pantalla vacía)
│   │   └── [id].tsx                    # detalle del módulo con sus sesiones
└── src/
    ├── features/enrollments/           # screens, hooks, componentes (OfferCard, SessionRow, CancelSheet)
    ├── api/                            # + tipos y claves de consulta
    ├── i18n/{es,en}.json               # + textos y códigos de error
    └── icons/registry.ts               # + íconos nuevos (set solar)
```

**Structure Decision**: Se sigue la estructura por módulo de `docs/Conventions.md` §4 y §5. `enrollments/` ya está previsto en `Architecture.md`. La pestaña "modules" del estudiante pasa de archivo a carpeta, como se hizo con la del CAE en la spec 010, y reutiliza `ModulesScreen`-style y `SessionRow` de la spec 010 solo si encajan; si no, componentes propios en `features/enrollments/`.

## Actualizaciones de docs/

En el mismo cambio (`CLAUDE.md`, "Forma de trabajar"):

- `docs/Architecture.md` §5: entidades `Enrollment` (con `effectiveUntil`) y `SessionAbsence`; §6: la fila de "Cupo máximo" pasa a "por sesión" y la de "Cancelación del estudiante" cita `STUDENT_CANCEL_LEAD_MINUTES`.
- `docs/Context.md` §6: el cupo se mide por sesión; cancelar el módulo se acepta y aplica desde la primera sesión a más de 1 hora; reactivar una sesión; inscripción solo al periodo Activo.
- `docs/Decisions.md`:
  - D-070: se cierra el pendiente (cupo por sesión).
  - D-090 Cupo por sesión: una cancelación suelta libera el lugar de esa sesión.
  - D-091 La cancelación del módulo aplica desde la primera sesión a más de 1 hora.
  - D-092 El orden de bloqueo en la inscripción (periodo, estudiante, módulo) y los índices únicos parciales.
- `docs/Design.md`: "Module card (students)" ya existe; se añaden los estados del detalle y la hoja de cancelación con alcance.

## Complexity Tracking

Sin violaciones de la constitución que justificar. Una complejidad deliberada: el cupo por sesión exige calcular asistentes con una consulta sobre sesiones futuras en cada inscripción (R-1); se acota a las sesiones futuras de un solo módulo, con índice por `(module_id, starts_at)`.
