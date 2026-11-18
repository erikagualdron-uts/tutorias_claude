# Implementation Plan: Configuración del CAE

**Branch**: `006-cae-configuration` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-cae-configuration/spec.md`

## Summary

Tres áreas de configuración solo para el CAE: **periodos académicos** (crear, editar, activar con confirmación, cerrar a mano o automáticamente al vencer, eliminar solo si Próximo y sin módulos), **ubicaciones y salones** (CRUD con borrado lógico, capacidad entera positiva, reglas de bloqueo que dependen de módulos) y **elementos de listas desplegables** (bilingües, ordenables, activos o inactivos; lista "Tipos de PQRS" precargada).

Enfoque técnico (detalle en [research.md](research.md)): la integridad se garantiza en PostgreSQL además del servicio: un índice único parcial para "un solo periodo activo" y una restricción de exclusión sobre rangos de fechas para "sin solapamientos", ambos solo sobre registros no borrados. La activación es una transacción que cierra el activo y activa el nuevo; el servidor exige una bandera de confirmación cuando ya hay un activo. El cierre automático lo ejecuta una tarea programada (`@nestjs/schedule`, ya prevista en `Architecture.md`) y se aplica también al leer, para no depender del reloj de la tarea. Como los módulos aún no existen, las reglas que dependen de ellos pasan por un servicio de uso (`ConfigUsageService`) que hoy devuelve cero y que la funcionalidad de módulos reemplaza; las pruebas lo sustituyen por un doble para verificar los bloqueos. La app agrega pantallas por funcionalidad, con reordenamiento por botones subir/bajar.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS en backend; Expo SDK vigente en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7 (`@prisma/adapter-pg`), class-validator, `@nestjs/schedule` (nueva), `@nestjs/swagger`. App: Expo Router, TanStack Query, React Hook Form + Zod, i18next, `react-native-iconify`, Reanimated. Sin dependencias nuevas en la app (selector de fecha: ver research.md R-8).

**Storage**: PostgreSQL. Tablas nuevas: `academic_periods`, `locations`, `rooms`, `dropdown_lists`, `dropdown_items`. Extensión `btree_gist` para la exclusión de fechas.

**Testing**: Backend: Vitest (unitarias de servicios y e2e con Supertest sobre PostgreSQL de prueba, como en 001). App: Jest + React Native Testing Library para formularios y estados de pantalla.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service en tres repositorios hermanos: `tutorias_uts_db` (esquema, migraciones, seed), `tutorias_uts_back` (API) y `tutorias_uts_mobile` (app).

**Performance Goals**: Listados de salones y periodos por debajo de 1 s con miles de registros; reordenar una lista de hasta 50 elementos en una sola petición; el cambio de una lista se ve en la siguiente apertura del selector (SC-006).

**Constraints**: Reglas siempre en el backend; borrado lógico; sin textos fijos en componentes; guards de rol en cada endpoint; errores con `code` estable traducido por la app; fechas de periodo como fecha de calendario de Bogotá; cierre automático al terminar el día de `endsOn` en `America/Bogota`.

**Scale/Scope**: Una institución; decenas de salones, unos pocos periodos por año, listas de menos de 50 elementos. Pantallas nuevas: listado y formulario de periodos, listado y formulario de salones, listado y formulario de ubicaciones, listado de listas y editor de elementos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Architecture.md` (`rooms/`, `periods/`, `settings/`, `@nestjs/schedule`). Se amplía el modelo (estado `UPCOMING`, entidad `Location`, campos de listas) y se registra en `Decisions.md` (D-071 a D-076). Ver "Actualizaciones de docs/". |
| II. Reglas de negocio en backend | Todas las validaciones (solapamiento, un solo activo, capacidad, bloqueos por uso, rol) viven en servicios y en restricciones de la base de datos; la app solo refleja. La regla "capacidad = cupo" y el cambio de salón se completan en la funcionalidad de módulos. |
| III. Integridad de datos | `deletedAt` en todo; consultas filtran `deletedAt: null`. Los límites y las horas de cierre salen de configuración. **Nota sobre UTC**: `startsOn` y `endsOn` son fechas de calendario (sin hora) y no instantes; el instante de cierre se calcula desde `America/Bogota` y se compara en UTC. Sin violación. |
| IV. Seguridad y privacidad | `@Roles(SUPERADMIN)` en cada endpoint de administración; solo lectura de elementos activos y del periodo activo para otros roles. Sin secretos nuevos. |
| V. Pruebas primero | Pruebas automáticas de solapamiento, un solo activo (incluida concurrencia), activación con confirmación, cierre automático, bloqueos por uso (con doble del servicio de uso), cascada de ubicación y `403` por rol en cada endpoint. |
| VI. Internacionalización | Textos de la app en `es.json` y `en.json`; los errores devuelven `code` que la app traduce; las etiquetas de elementos de lista se guardan en ambos idiomas. |
| VII. Diseño consistente | Pantallas según `Design.md`; toda acción bloqueada muestra la regla; objetivos táctiles de 48 px; íconos solo Iconify registrados en `src/icons/`. |
| VIII. Desarrollo incremental | Una rama; historias entregables por prioridad (periodos y salones primero). |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones. Se vuelve a revisar tras el diseño (ver abajo): pasa.

## Project Structure

### Documentation (this feature)

```text
specs/006-cae-configuration/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── config-api.yaml
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

El código vive en tres repositorios hermanos de `Claude/` (los nombres `backend/` y `mobile/` de `CLAUDE.md` corresponden a `tutorias_uts_back` y `tutorias_uts_mobile`).

```text
tutorias_uts_db/
└── prisma/
    ├── schema.prisma                # + enums, Location, Room, AcademicPeriod, DropdownList, DropdownItem
    ├── migrations/<ts>_add_cae_configuration/migration.sql   # incluye btree_gist, índices parciales, exclusión, lista precargada
    └── seed.ts                      # + periodo, ubicación y salones de ejemplo

tutorias_uts_back/
├── src/
│   ├── periods/
│   │   ├── periods.module.ts
│   │   ├── periods.controller.ts
│   │   ├── periods.service.ts
│   │   ├── periods-expiry.task.ts   # cierre automático (cron)
│   │   ├── dto/
│   │   └── periods.service.spec.ts
│   ├── rooms/
│   │   ├── rooms.module.ts
│   │   ├── locations.controller.ts / locations.service.ts
│   │   ├── rooms.controller.ts / rooms.service.ts
│   │   ├── dto/
│   │   └── *.spec.ts
│   ├── settings/
│   │   └── dropdown-lists/          # controller, service, dto, spec
│   ├── config-usage/
│   │   └── config-usage.service.ts  # uso de salones, periodos y elementos (cero hasta que existan módulos y PQRS)
│   └── common/errors/               # + códigos nuevos
└── test/
    ├── periods.e2e-spec.ts
    ├── rooms.e2e-spec.ts
    ├── dropdown-lists.e2e-spec.ts
    └── config-roles.e2e-spec.ts     # 403 por rol en todos los endpoints

tutorias_uts_mobile/
├── app/(admin)/
│   ├── modules.tsx                  # pestaña Módulos: Salones y ubicaciones
│   ├── modules/                     # rutas de formularios de salón y ubicación
│   └── more/                        # + configuration/{periods,dropdown-lists}
└── src/
    ├── features/
    │   ├── periods/                 # screens, hooks, schemas
    │   ├── rooms/                   # screens (salones y ubicaciones), hooks, schemas
    │   └── dropdown-lists/          # screens, hooks, schemas
    ├── api/                         # + tipos y claves de consulta
    ├── i18n/{es,en}.json            # + textos y códigos de error
    └── icons/registry.ts            # + íconos nuevos (set solar)
```

**Structure Decision**: Se sigue la estructura por módulo de `docs/Conventions.md` §4 y §5 en los repositorios existentes. `periods/` y `rooms/` ya están previstos en `Architecture.md`; las listas viven en `settings/` como indica ese documento. El esquema y las migraciones se editan solo en `tutorias_uts_db` (el backend copia el esquema con `scripts/sync-schema.mjs`).

## Actualizaciones de docs/

En el mismo cambio que la implementación (`CLAUDE.md`, "Forma de trabajar"):

- `docs/Architecture.md` §5: entidad `Location`; `AcademicPeriod` con estado `UPCOMING`, `closedAt` y cierre automático; `Room` con `locationId` y estado; campos de `DropdownList` y `DropdownItem`. §3: `config-usage/` y `settings/dropdown-lists/`.
- `docs/Context.md`: reglas de periodo (activación manual con confirmación, cierre automático, eliminación solo de Próximos sin módulos) y de salones y listas.
- `docs/Decisions.md` (continúa tras D-070):
  - D-071 Estado del periodo: activación manual, cierre manual o automático, sin reapertura.
  - D-072 Un solo activo y sin solapamientos garantizados en la base de datos.
  - D-073 Listas predefinidas por el sistema; el CAE solo administra elementos.
  - D-074 Desactivar un salón con módulos solo en periodos Próximos se permite con aviso.
  - D-075 Eliminar una ubicación elimina (lógico) sus salones inactivos.
  - D-076 Solo se eliminan periodos Próximos sin módulos.
- `CLAUDE.md`: los nombres `backend/` y `mobile/` no coinciden con los repositorios reales (`tutorias_uts_back`, `tutorias_uts_mobile`, `tutorias_uts_db`); conviene corregirlo, pero es una decisión de estructura que se consulta antes de cambiar.

## Re-evaluación tras el diseño

El diseño no añade principios nuevos en juego: las reglas siguen en backend y base de datos (II), el borrado es lógico y las fechas de periodo son de calendario con cierre calculado en `America/Bogota` (III), cada endpoint tiene su guard (IV), los textos van en `es.json` y `en.json` (VI). **Resultado**: pasa sin violaciones.

## Complexity Tracking

Sin violaciones de la constitución. Complejidad deliberada y justificada:

| Elemento | Por qué es necesario | Alternativa más simple descartada |
|---|---|---|
| Restricción de exclusión (`btree_gist`) y índice único parcial en SQL crudo | SC-002 exige imposibilidad absoluta de solapamientos y de dos activos, incluso con peticiones simultáneas | Solo validar en el servicio: una carrera entre dos peticiones puede violar la regla |
| `ConfigUsageService` con ceros | Las reglas de salón, periodo y elemento dependen de módulos y PQRS que aún no existen, pero deben quedar probadas y cableadas | Dejar las reglas para la spec de módulos: se perdería la cobertura de FR-014, FR-021 y FR-027 |
