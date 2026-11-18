# Implementation Plan: Módulos y sesiones (CAE)

**Branch**: `010-modules-sessions` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-modules-sessions/spec.md`

## Summary

El CAE crea y gestiona **módulos** (tutorías) de un periodo: nombre, descripción, docente, salón y uno o más **horarios semanales**. Al guardar, el backend genera una **sesión** por cada ocurrencia semanal dentro del periodo (en UTC, desde la hora de Bogotá), omitiendo los **festivos** y las sesiones ya pasadas. El cupo es siempre la capacidad del salón. El CAE puede cambiar salón (regla de capacidad) y docente (aplica a sesiones futuras), editar nombre y descripción, cambiar horarios solo sin inscritos y eliminar de forma lógica solo sin inscritos. Un periodo Cerrado es de solo lectura. Un calendario de **festivos** (manual, con importación opcional de Nager.Date) completa la funcionalidad.

Enfoque técnico (detalle en [research.md](research.md)): igual que en la spec 006, la integridad se garantiza en PostgreSQL además del servicio. Los cruces de docente, de salón y entre horarios del mismo módulo se impiden con **restricciones de exclusión** (`btree_gist`) sobre `module_schedules`, que lleva copiados `period_id`, `teacher_id` y `room_id`; el servicio valida antes para devolver el módulo con el que se cruza. Las operaciones que tocan horarios y sesiones van en una transacción que bloquea (`FOR SHARE`) la fila del periodo, de modo que un cierre simultáneo no deje escribir en un periodo Cerrado. Cada sesión guarda el docente y el salón con que se dicta, así el historial no cambia al reasignar. El número de inscritos pasa por `ConfigUsageService`, que hoy devuelve cero hasta que exista la inscripción (spec 011). Los eventos que deben avisar a los inscritos se guardan en una tabla de eventos (`outbox_events`) que consumirá la spec 013. Los festivos importados se consultan **en el servidor** (nunca desde la app), con límite de 10 s, y se guardan localmente: generar sesiones nunca depende del servicio externo.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK vigente en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7 (`@prisma/adapter-pg`), class-validator, `@nestjs/schedule` y `@nestjs/swagger` (ya presentes). `fetch` y `AbortSignal.timeout` nativos de Node para Nager.Date: sin dependencia nueva. App: Expo Router, TanStack Query, React Hook Form + Zod, i18next, `react-native-iconify`, Reanimated, `DateField` (spec 008). Sin dependencias nuevas.

**Storage**: PostgreSQL. Tablas nuevas: `modules`, `module_schedules`, `module_sessions`, `holidays`, `outbox_events`. Extensión `btree_gist` ya instalada por la spec 006.

**Testing**: Backend: Vitest (unitarias de reglas puras y e2e con Supertest sobre PostgreSQL de prueba, como en 001 y 006), con un doble de `ConfigUsageService` para los inscritos y un doble del cliente de festivos. App: Jest + React Native Testing Library para formularios y estados de pantalla.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service en tres repositorios hermanos: `tutorias_uts_db` (esquema, migraciones, seed), `tutorias_uts_back` (API) y `tutorias_uts_mobile` (app).

**Performance Goals**: Listado de módulos de un periodo en menos de 1 s con cientos de módulos; crear un módulo con 2 horarios y un periodo de 20 semanas (unas 40 sesiones) en menos de 1 s; la lista de sesiones de un módulo paginada.

**Constraints**: Reglas siempre en el backend y respaldadas por la base de datos; borrado lógico; fechas en UTC y hora local de `America/Bogota` (UTC-5 fijo, sin horario de verano); guards de rol en cada endpoint; errores con `code` estable que la app traduce; textos en `es.json` y `en.json`; URL del servicio de festivos y país en configuración, no en el código; solo el año y el país salen hacia el servicio externo.

**Scale/Scope**: Una institución; cientos de módulos por periodo, decenas de festivos por año. Pantallas nuevas: listado de módulos, formulario de módulo (crear/editar), detalle con sesiones, selectores de docente y salón, listado de festivos, formulario de festivo y vista previa de importación.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Architecture.md` (`modules/`, `ModuleSchedule`, `ModuleSession`, generación semanal en UTC). Se amplía el modelo (festivos, docente y salón por sesión, eventos, minutos en vez de hora) y se registra en `Decisions.md` (D-083 a D-087). Ver "Actualizaciones de docs/". Se cierran las preguntas abiertas de festivos y de varios horarios. |
| II. Reglas de negocio en backend | Cupo, cruces de docente y salón, cambio de salón, periodo cerrado y rol CAE viven en servicios y en restricciones de la base de datos. La app solo refleja. Las notificaciones a inscritos llegan con la spec 013 y la inscripción (spec 011) no se publica sin ellas (D-087); los festivos no tocan módulos de periodos Cerrados. |
| III. Integridad de datos | `deletedAt` en todo y consultas con `deletedAt: null`. Sesiones en UTC con la hora local convertida en un único punto. El servicio externo de festivos no es requisito para operar. Los límites de espera y la URL salen de configuración. |
| IV. Seguridad y privacidad | `@Roles(SUPERADMIN)` en cada endpoint de módulos y festivos. Al servicio externo solo viaja el año y el país; sin datos de personas ni secretos. La respuesta externa se valida antes de guardar. |
| V. Pruebas primero | Pruebas de cruce de docente y salón (incluida concurrencia), generación y conteo de sesiones, cambio de salón con capacidad, periodo cerrado, festivos (alta, baja, importación con fallo) y `403` por rol en cada endpoint. Ver `business-rule-tests`. |
| VI. Internacionalización | Textos y `code` de error en `es.json` y `en.json`; los nombres de festivos importados se guardan como vienen (español) y pueden editarse. |
| VII. Diseño consistente | Pantallas según `Design.md` ("Module management" y "Admin management patterns"); toda acción bloqueada muestra la regla; objetivos táctiles de 48 px; íconos Iconify en `src/icons/`. |
| VIII. Desarrollo incremental | Una rama; historias entregables por prioridad: módulos (US1 a US3) antes que docente, edición y festivos. |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/010-modules-sessions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── modules-api.yaml
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
└── prisma/
    ├── schema.prisma                # + enums, Module, ModuleSchedule, ModuleSession, Holiday, OutboxEvent
    ├── migrations/<ts>_add_modules_sessions/migration.sql   # exclusiones, índices parciales y CHECK a mano
    └── seed.ts                      # + festivos de ejemplo y un módulo de ejemplo

tutorias_uts_back/
├── src/
│   ├── modules/
│   │   ├── modules.module.ts
│   │   ├── modules.controller.ts
│   │   ├── modules.service.ts           # crear, editar, cambiar salón y docente, eliminar
│   │   ├── schedules.service.ts         # validación y reemplazo de horarios
│   │   ├── sessions.generator.ts        # generación idempotente de sesiones (función pura + escritura)
│   │   ├── sessions.rules.ts            # fechas de ocurrencias, conversión Bogotá a UTC (pura)
│   │   ├── dto/
│   │   └── *.spec.ts
│   ├── holidays/
│   │   ├── holidays.module.ts
│   │   ├── holidays.controller.ts
│   │   ├── holidays.service.ts          # alta, edición, baja y efecto sobre sesiones
│   │   ├── holidays-import.service.ts   # consulta a Nager.Date, validación y vista previa
│   │   ├── dto/
│   │   └── *.spec.ts
│   ├── outbox/
│   │   └── outbox.service.ts            # registra eventos para notificaciones (spec 013)
│   ├── teachers/
│   │   └── teachers.controller.ts       # + GET /teachers (listado de solo lectura para el selector)
│   ├── config-usage/
│   │   └── config-usage.service.ts      # ahora cuenta módulos reales; inscritos siguen en cero
│   ├── config/env.ts                    # + HOLIDAYS_API_BASE_URL, HOLIDAYS_COUNTRY, HOLIDAYS_TIMEOUT_MS
│   └── common/errors/app.exception.ts   # + códigos nuevos
└── test/
    ├── modules.e2e-spec.ts
    ├── modules-concurrency.e2e-spec.ts
    ├── holidays.e2e-spec.ts
    └── modules-roles.e2e-spec.ts        # 403 por rol en todos los endpoints

tutorias_uts_mobile/
├── app/(admin)/
│   ├── modules/
│   │   ├── index.tsx                    # ahora: listado de módulos (antes: salones)
│   │   ├── [id].tsx                     # detalle con sesiones
│   │   ├── module-form.tsx              # crear y editar
│   │   └── rooms.tsx                    # salones y ubicaciones (movido desde index)
│   └── more/
│       ├── holidays.tsx
│       ├── holiday-form.tsx
│       └── holidays-import.tsx
└── src/
    ├── features/
    │   ├── modules/                     # screens, hooks, schemas, componentes (ModuleCard, SessionRow, picker)
    │   └── holidays/                    # screens, hooks, schemas
    ├── api/                             # + tipos y claves de consulta
    ├── i18n/{es,en}.json               # + textos y códigos de error
    └── icons/registry.ts                # + íconos nuevos (set solar)
```

**Structure Decision**: Se sigue la estructura por módulo de `docs/Conventions.md` §4 y §5. `modules/` ya está previsto en `Architecture.md`; `holidays/` y `outbox/` son carpetas nuevas del mismo nivel. El esquema y las migraciones se editan solo en `tutorias_uts_db` (el backend copia el esquema con `scripts/sync-schema.mjs`). La pestaña Módulos del CAE pasa a mostrar los módulos y los salones y ubicaciones quedan un nivel más adentro (botón en la barra superior), porque `Design.md` define "Módulos" como la gestión de módulos.

## Actualizaciones de docs/

En el mismo cambio (`CLAUDE.md`, "Forma de trabajar"). Ya aplicadas junto con este plan:

- `docs/Architecture.md` §5: entidad `Holiday`, `OutboxEvent`; `Module`, `ModuleSchedule` (minutos locales, `periodId`, `teacherId` y `roomId` copiados) y `ModuleSession` (docente y salón vigentes, motivo de cancelación); regla de festivos; `holidays/` y `outbox/` en §3; se cierra la pregunta de festivos en §13.
- `docs/Context.md` §6 y §10: reglas de módulos (cambio de horario solo sin inscritos, eliminación) y de festivos; se cierran las preguntas de festivos y de varios horarios por módulo.
- `docs/Decisions.md`:
  - D-083 Calendario de festivos del CAE con importación opcional desde Nager.Date.
  - D-084 Varios horarios por módulo; el CAE solo los cambia sin inscritos.
  - D-085 Cruces de docente y salón impedidos por restricciones de exclusión en la base de datos.
  - D-086 La sesión guarda el docente y el salón con que se dicta.
  - D-087 Eventos de módulo en una tabla de eventos para las notificaciones.

## Re-evaluación tras el diseño

El diseño mantiene las reglas en backend y base de datos (II), el borrado lógico y UTC (III), el guard en cada endpoint y solo año y país hacia el servicio externo (IV), y los textos en `es.json` y `en.json` (VI). **Resultado**: pasa sin violaciones.

## Complexity Tracking

Sin violaciones de la constitución. Complejidad deliberada y justificada:

| Elemento | Por qué es necesario | Alternativa más simple descartada |
|---|---|---|
| Tres restricciones de exclusión sobre `module_schedules` con columnas copiadas | SC-002 exige que ningún cruce de docente o salón sea posible ni con peticiones simultáneas | Solo validar en el servicio: una carrera entre dos peticiones puede violar la regla |
| Bloqueo `FOR SHARE` de la fila del periodo | FR-015 y el caso límite del cierre mientras se edita: sin él, un cierre concurrente permitiría escribir en un periodo Cerrado | Comprobar el estado al inicio: queda una ventana entre la lectura y la escritura |
| Tabla `outbox_events` | FR-021 exige dejar registrado el evento aunque aún no existan las notificaciones | Omitirlo hasta la spec 013: los cambios de docente, salón y festivo hechos antes no avisarían a nadie |
| `ConfigUsageService` con inscritos en cero | Deja cableada y probada la regla de capacidad hasta que exista la inscripción | Esperar a la spec 011: se perdería la cobertura de FR-010, FR-013 y FR-014 |
| Mover Salones y ubicaciones un nivel adentro en la app | La pestaña Módulos debe mostrar módulos (`Design.md`) | Dejar los salones en la pestaña y crear otra entrada para módulos: la barra de pestañas del CAE está fijada en `Design.md` |
