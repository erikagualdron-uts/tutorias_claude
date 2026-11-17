---

description: "Task list for Configuración del CAE"
---

# Tasks: Configuración del CAE (periodos, salones y listas desplegables)

**Input**: Design documents from `/specs/006-cae-configuration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/config-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principio V) y `docs/Conventions.md` §6 exigen pruebas de las reglas de negocio y de roles (`403`). Escribirlas primero y comprobar que fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. Las historias P1 (US1, US2, US4) van primero; US3 (P2) al final.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1 periodos, US2 ubicaciones y salones, US3 listas, US4 acceso del CAE)
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma, migraciones y `seed.ts` (el esquema se edita solo aquí)
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas en `__tests__/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`
- Backend: comandos `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dependencias y andamiaje mínimo.

- [X] T001 Agregar la dependencia `@nestjs/schedule` en `tutorias_uts_back/package.json` e importar `ScheduleModule.forRoot()` en `tutorias_uts_back/src/app.module.ts`
- [X] T002 [P] Registrar en `tutorias_uts_mobile/src/icons/registry.ts` los íconos solar nuevos (periodo/calendario de inicio y fin, ubicación, salón, capacidad, activar, cerrar, desactivar, reactivar, eliminar, editar, subir, bajar, lista, buscar, filtro, candado de solo lectura), con el nombre escrito como texto literal
- [X] T003 [P] Crear las carpetas vacías de funcionalidad `tutorias_uts_mobile/src/features/periods/`, `tutorias_uts_mobile/src/features/rooms/` y `tutorias_uts_mobile/src/features/dropdown-lists/` con `screens/`, `hooks/` y `schemas.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de datos, restricciones, errores, servicio de uso, contrato de la app y navegación base. Bloquea todas las historias.

**⚠️ CRITICAL**: Ninguna historia empieza hasta terminar esta fase.

- [X] T004 Agregar a `tutorias_uts_db/prisma/schema.prisma` los enums `PeriodStatus` (`UPCOMING`, `ACTIVE`, `CLOSED`), `PeriodClosedBy` (`MANUAL`, `AUTOMATIC`), `RoomStatus` (`ACTIVE`, `INACTIVE`) e `ItemStatus` (`ACTIVE`, `INACTIVE`), y los modelos `AcademicPeriod` (`academic_periods`: `name` 1 a 50 caracteres, `startsOn` y `endsOn` `DATE`, `status` por defecto `UPCOMING`, `closedAt` nulo, `closedBy` nulo, `deletedAt` nulo), `Location` (`locations`: `name` 1 a 80 caracteres, `deletedAt` nulo), `Room` (`rooms`: `locationId` obligatoria, `name` 1 a 40 caracteres, `capacity` entero, `status` por defecto `ACTIVE`, `deletedAt` nulo), `DropdownList` (`dropdown_lists`: `key` único `UPPER_SNAKE_CASE`, `nameEs`, `nameEn`, sin `deletedAt`) y `DropdownItem` (`dropdown_items`: `listId`, `labelEs` y `labelEn` obligatorias de 1 a 80 caracteres, `sortOrder` entero, `status` por defecto `ACTIVE`, `deletedAt` nulo); todas con `id` UUID, `createdAt`, `updatedAt`, `@@map` y `@map` en `snake_case`
- [X] T005 Crear la migración `tutorias_uts_db/prisma/migrations/<timestamp>_add_cae_configuration/migration.sql` generada por Prisma y completarla con SQL a mano: `CREATE EXTENSION IF NOT EXISTS btree_gist`; `CHECK (ends_on > starts_on)` en `academic_periods`; `CHECK (capacity > 0)` en `rooms` (sin tope máximo); índice único parcial de un solo periodo `ACTIVE` (`WHERE status = 'ACTIVE' AND deleted_at IS NULL`); `EXCLUDE USING gist (daterange(starts_on, ends_on, '[]') WITH &&) WHERE (deleted_at IS NULL)`; índices únicos parciales sobre `lower(btrim(name))` donde `deleted_at IS NULL` para periodos, ubicaciones y salones (este último con `location_id`); e inserción de la lista `PQRS_TYPE` con sus cuatro elementos (Petición/Request, Queja/Complaint, Reclamo/Claim, Sugerencia/Suggestion) con ids fijos y `sort_order` 1 a 4
- [X] T006 Aplicar la migración en la base local, ejecutar `npm run prisma:generate` en `tutorias_uts_back` y verificar con `prisma migrate diff` que Prisma no propone eliminar las restricciones escritas a mano (riesgo R-2 de `research.md`); anotar el resultado en un comentario al inicio de la migración
- [X] T007 [P] Agregar los códigos de error de R-14 (`PERIOD_NAME_TAKEN`, `PERIOD_DATES_INVALID`, `PERIOD_DATES_OVERLAP`, `PERIOD_ACTIVE_EXISTS`, `PERIOD_CLOSED_READ_ONLY`, `PERIOD_HAS_MODULES`, `PERIOD_NOT_UPCOMING`, `PERIOD_ALREADY_ENDED`, `PERIOD_NOT_ACTIVE`, `LOCATION_NAME_TAKEN`, `LOCATION_HAS_ACTIVE_ROOMS`, `ROOM_NAME_TAKEN`, `ROOM_CAPACITY_INVALID`, `ROOM_IN_ACTIVE_PERIOD`, `ROOM_CAPACITY_BELOW_ENROLLED`, `ROOM_INACTIVE_OR_DELETED`, `DROPDOWN_LABEL_REQUIRED`, `DROPDOWN_ITEM_IN_USE`, `DROPDOWN_ORDER_INVALID`) al catálogo de errores en `tutorias_uts_back/src/common/errors/app.exception.ts`
- [X] T008 [P] Crear `tutorias_uts_back/src/config-usage/config-usage.module.ts` y `tutorias_uts_back/src/config-usage/config-usage.service.ts` con `countModulesInPeriod(periodId)`, `getRoomUsage(roomId)` (devuelve `modulesInActivePeriod`, `modulesInUpcomingPeriods`, `maxEnrolled`) e `isDropdownItemInUse(itemId)`, que hoy devuelven 0, 0, 0 y `false`; el módulo exporta el servicio
- [X] T009 [P] Agregar helper de fechas de calendario en `tutorias_uts_back/src/common/clock.ts`: `endOfDayInBogotaUtc(date)` que devuelve el instante UTC en que termina el día `endsOn` en `America/Bogota` (`endsOn + 1 día` a las 00:00 hora de Bogotá), con prueba unitaria en `tutorias_uts_back/src/common/clock.spec.ts`
- [X] T010 [P] Agregar a `tutorias_uts_back/test/utils/factories.ts` fábricas de periodo, ubicación, salón, lista y elemento, y registrar un doble de `ConfigUsageService` reemplazable en `tutorias_uts_back/test/utils/test-app.ts` para simular uso
- [X] T011 [P] Agregar en `tutorias_uts_mobile/src/api/types.ts` los tipos de la API (`Period`, `PeriodInput`, `Location`, `Room`, `RoomImpact`, `DropdownList`, `DropdownItem`, `Page<T>`) según `contracts/config-api.yaml`
- [X] T012 [P] Agregar en `tutorias_uts_mobile/src/i18n/es.json` y `en.json` las claves de error `errors.<CODE>` para los 19 códigos de T007, con la regla explicada al usuario en cada una
- [X] T013 Agregar en `tutorias_uts_mobile/src/features/shell/screens/MoreScreen.tsx` el grupo "Configuración" con filas agrupadas con flecha (solo la fila Periodos; la fila Listas desplegables se agrega en T044 cuando exista su pantalla), visible solo para el CAE, con textos en `es.json` y `en.json`, e íconos del registro; crear la ruta vacía `tutorias_uts_mobile/app/(admin)/more/periods.tsx`

**Checkpoint**: Base lista — las historias pueden comenzar.

---

## Phase 3: User Story 1 - Gestionar periodos académicos (Priority: P1) 🎯 MVP

**Goal**: El CAE crea, edita, activa (con confirmación), cierra (manual o automático) y elimina periodos; los estudiantes ven solo el activo.

**Independent Test**: Crear "2026-2", activarlo y comprobar que es el único activo; crear otro con fechas solapadas y ver que se rechaza.

### Tests for User Story 1 ⚠️ (escribir primero, deben fallar)

- [X] T014 [P] [US1] Pruebas de reglas de periodos: lo puro (fechas reales, fin posterior al inicio, vencimiento en Bogotá) en `tutorias_uts_back/src/periods/periods.rules.spec.ts`; lo que toca la base de datos (se cubre en `tutorias_uts_back/test/periods.e2e-spec.ts`, T015, porque el servicio depende de PostgreSQL y de sus restricciones): nombre duplicado ignorando mayúsculas y espacios, `endsOn` no posterior a `startsOn`, solapamiento incluido fin = inicio (con el periodo en `details`), transiciones de estado, edición bloqueada en `CLOSED`, edición de nombre y fechas permitida en `UPCOMING` y `ACTIVE` (en `ACTIVE`, `endsOn` anterior a hoy rechazado con `PERIOD_DATES_INVALID`), activación sin y con `confirmCloseActive`, activar un periodo con `endsOn` vencido, eliminar solo `UPCOMING` sin módulos (doble de `ConfigUsageService`), y reutilizar el nombre de un periodo eliminado
- [X] T015 [P] [US1] Prueba e2e en `tutorias_uts_back/test/periods.e2e-spec.ts`: ciclo completo contra PostgreSQL, dos activaciones simultáneas (queda un solo `ACTIVE`), inserción directa de dos `ACTIVE` y de rangos solapados rechazada por las restricciones, y cierre automático al vencer `endsOn` con reloj controlado
- [X] T016 [P] [US1] Pruebas de la app en `tutorias_uts_mobile/src/features/periods/__tests__/`: formulario (validaciones de nombre y fechas), aviso de confirmación al activar con otro activo, solo lectura de un periodo cerrado y los cuatro estados de la pantalla (cargando, vacío, error, datos)

### Implementation for User Story 1

- [X] T017 [P] [US1] Crear los DTO en `tutorias_uts_back/src/periods/dto/` (`create-period.dto.ts`, `update-period.dto.ts`, `activate-period.dto.ts`, `list-periods.query.ts`, `period.response.ts`): `name` recortado de 1 a 50 caracteres, `startsOn` y `endsOn` en formato `YYYY-MM-DD`, `confirmCloseActive` booleano opcional, `status` y paginación en el listado; la respuesta incluye `hasModules`
- [X] T018 [US1] Implementar `tutorias_uts_back/src/periods/periods.service.ts` según `data-model.md` y R-1 a R-5: crear, editar, listar con filtro de estado, detalle, activar (transacción con `SELECT ... FOR UPDATE` que cierra el activo antes de activar), cerrar, eliminar lógico solo `UPCOMING` sin módulos, `getActive()` y `closeExpired()` idempotente; traducir violaciones de unicidad y exclusión (`P2002`, `23505`, `23P01`) a los códigos correctos; filtrar siempre `deletedAt: null`
- [X] T019 [US1] Crear `tutorias_uts_back/src/periods/periods.controller.ts` con los endpoints de `contracts/config-api.yaml` bajo `/api/v1/academic-periods`, `@Roles(SUPERADMIN)` en todos salvo `GET /academic-periods/active` (cualquier rol autenticado, declarado antes de `/:id`), y documentación Swagger
- [X] T020 [US1] Crear `tutorias_uts_back/src/periods/periods-expiry.task.ts` con una tarea `@Cron` cada 15 minutos que llama a `closeExpired()`, y `tutorias_uts_back/src/periods/periods.module.ts`; importar el módulo en `tutorias_uts_back/src/app.module.ts`
- [X] T021 [P] [US1] Crear el esquema Zod y los hooks de TanStack Query en `tutorias_uts_mobile/src/features/periods/schemas.ts` y `hooks/` (`usePeriods`, `usePeriod`, `useActivePeriod`, `useSavePeriod`, `useActivatePeriod`, `useClosePeriod`, `useDeletePeriod`) con claves `['periods', { status }]`
- [X] T022 [US1] Crear `tutorias_uts_mobile/src/features/periods/screens/PeriodsScreen.tsx`: listado con nombre, fechas y estado (Activo, Cerrado, Próximo, con ícono y no solo color), filtros por estado, estados de carga, vacío y error, tarjetas con sombra suave, y botón de crear con ícono; conectar `tutorias_uts_mobile/app/(admin)/more/periods.tsx`
- [X] T023 [US1] Crear `tutorias_uts_mobile/src/features/periods/screens/PeriodFormScreen.tsx` y la ruta `tutorias_uts_mobile/app/(admin)/more/period-form.tsx`: campos con relleno y borde tenue, fechas `AAAA-MM-DD` validadas (si se necesita un selector nativo, preguntar antes de sumar una dependencia, R-8), vista de solo lectura con la regla explicada para periodos cerrados, y acciones Activar, Cerrar y Eliminar con ícono a la izquierda, 16 px entre botones y diálogo de confirmación; al recibir `PERIOD_ACTIVE_EXISTS` mostrar el aviso de cierre del activo y reenviar con `confirmCloseActive`
- [X] T024 [US1] Agregar los textos de periodos (títulos, etiquetas, estados, avisos, confirmaciones y estados vacíos) en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`, con las claves ordenadas

**Checkpoint**: US1 funcional y probable de forma independiente.

---

## Phase 4: User Story 2 - Gestionar ubicaciones y salones (Priority: P1)

**Goal**: El CAE administra ubicaciones y salones con capacidad, estado y las reglas de bloqueo que dependen de módulos.

**Independent Test**: Crear una ubicación y un salón de capacidad 30, desactivarlo, reactivarlo y buscarlo por nombre.

### Tests for User Story 2 ⚠️

- [X] T025 [P] [US2] Pruebas de ubicaciones, cubiertas en `tutorias_uts_back/test/rooms.e2e-spec.ts` (el servicio depende de PostgreSQL): nombre único ignorando mayúsculas, bloqueo con salones activos (`LOCATION_HAS_ACTIVE_ROOMS`), cascada lógica a salones inactivos en una transacción, cascada bloqueada si un salón inactivo tiene uso (`ROOM_IN_ACTIVE_PERIOD`) y `roomCounts` en el detalle
- [X] T026 [P] [US2] Pruebas de salones, cubiertas en `tutorias_uts_back/test/rooms.e2e-spec.ts` (el servicio depende de PostgreSQL): unicidad por ubicación (permitida en otra), capacidad vacía, cero, negativa o decimal rechazada, desactivar y reactivar, bloqueo por módulos en periodo activo, desactivación permitida con módulos solo en Próximos y cifra en `impact`, bajar capacidad por debajo de inscritos rechazado, y búsqueda y filtros (usando el doble de `ConfigUsageService`)
- [X] T027 [P] [US2] Prueba e2e en `tutorias_uts_back/test/rooms.e2e-spec.ts` de ubicaciones y salones contra PostgreSQL, incluida la unicidad parcial tras borrado lógico, y tras cada borrado una consulta directa a la tabla que verifica que la fila sigue existiendo con `deleted_at` fijado (SC-003)
- [X] T028 [P] [US2] Pruebas de la app en `tutorias_uts_mobile/src/features/rooms/__tests__/`: formulario de salón, confirmación de borrado de ubicación con el número de salones, aviso de impacto al desactivar y los cuatro estados del listado

### Implementation for User Story 2

- [X] T029 [P] [US2] Crear los DTO en `tutorias_uts_back/src/rooms/dto/` (`location-input.dto.ts`, `room-input.dto.ts`, `list-rooms.query.ts`, respuestas): `name` de ubicación recortado de 1 a 80 caracteres, `name` de salón recortado de 1 a 40 caracteres, `capacity` entero positivo (mínimo 1, sin tope máximo), `locationId` UUID, `search`, `locationId` y `status` como filtros, y paginación
- [X] T030 [US2] Implementar `tutorias_uts_back/src/rooms/locations.service.ts` (crear, renombrar, listar con `roomCounts`, detalle, eliminar con cascada lógica a salones inactivos en transacción) según R-12
- [X] T031 [US2] Implementar `tutorias_uts_back/src/rooms/rooms.service.ts`: crear, editar (nombre, ubicación, capacidad), listar con búsqueda por nombre (sin distinguir mayúsculas) y filtros, detalle, `impact`, desactivar, reactivar y eliminar lógico, consultando `ConfigUsageService` para los bloqueos de FR-021; traducir violaciones de unicidad a `ROOM_NAME_TAKEN` y `LOCATION_NAME_TAKEN`; filtrar siempre `deletedAt: null`
- [X] T032 [US2] Crear `tutorias_uts_back/src/rooms/locations.controller.ts` y `tutorias_uts_back/src/rooms/rooms.controller.ts` con los endpoints de `contracts/config-api.yaml` bajo `/api/v1/locations` y `/api/v1/rooms`, `@Roles(SUPERADMIN)` en todos, Swagger, y `tutorias_uts_back/src/rooms/rooms.module.ts` importado en `tutorias_uts_back/src/app.module.ts`
- [X] T033 [P] [US2] Crear esquemas Zod y hooks en `tutorias_uts_mobile/src/features/rooms/schemas.ts` y `hooks/` (`useLocations`, `useSaveLocation`, `useDeleteLocation`, `useRooms` con búsqueda y filtros, `useRoom`, `useSaveRoom`, `useRoomImpact`, `useToggleRoom`, `useDeleteRoom`)
- [X] T034 [US2] Crear `tutorias_uts_mobile/src/features/rooms/screens/RoomsScreen.tsx`: listado de salones en la pestaña Módulos del CAE con `SearchField`, filtros por ubicación y estado, estados de carga, vacío y error, y acceso a ubicaciones; conectar `tutorias_uts_mobile/app/(admin)/modules.tsx` (reemplaza `EmptyTabScreen`)
- [X] T035 [US2] Crear `tutorias_uts_mobile/src/features/rooms/screens/RoomFormScreen.tsx` y `LocationsScreen.tsx` con sus rutas en `tutorias_uts_mobile/app/(admin)/modules/`: campos con relleno y borde tenue, acciones Desactivar, Reactivar y Eliminar con ícono, confirmación y regla visible cuando una acción se bloquea; al desactivar, consultar `impact` y mostrar cuántos módulos Próximos quedan afectados; al eliminar una ubicación, mostrar cuántos salones se eliminarán
- [X] T036 [US2] Agregar los textos de ubicaciones y salones en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`, con las claves ordenadas

**Checkpoint**: US1 y US2 funcionan por separado.

---

## Phase 5: User Story 3 - Administrar listas desplegables (Priority: P2)

**Goal**: El CAE administra los elementos bilingües de las listas predefinidas; los selectores muestran solo activos, en el idioma del dispositivo y en orden.

**Independent Test**: Agregar "Felicitación / Compliment" a "Tipos de PQRS", reordenarlo y verlo en un selector.

### Tests for User Story 3 ⚠️

- [X] T037 [P] [US3] Pruebas de listas, cubiertas en `tutorias_uts_back/test/dropdown-lists.e2e-spec.ts` (el servicio depende de PostgreSQL): ambas etiquetas obligatorias y solo espacios cuenta como vacío, elemento nuevo al final, reordenamiento que renumera 1..n y rechaza ids faltantes o sobrantes, lectura de selector solo con activos y en orden, elemento en uso que no se elimina (doble de `ConfigUsageService`), eliminación lógica sin uso, y que no existe forma de crear, renombrar o eliminar listas
- [X] T038 [P] [US3] Prueba e2e en `tutorias_uts_back/test/dropdown-lists.e2e-spec.ts`: la lista `PQRS_TYPE` precargada con sus cuatro elementos bilingües, ciclo de elementos y orden persistente, y tras cada borrado una consulta directa a la tabla que verifica que la fila sigue existiendo con `deleted_at` fijado (SC-003)
- [X] T039 [P] [US3] Pruebas de la app en `tutorias_uts_mobile/src/features/dropdown-lists/__tests__/`: subir y bajar elementos, error al faltar una etiqueta, elemento en uso que solo se desactiva con la regla visible, y selección de etiqueta por idioma del dispositivo con respaldo a español

### Implementation for User Story 3

- [X] T040 [P] [US3] Crear los DTO en `tutorias_uts_back/src/settings/dropdown-lists/dto/`: `labelEs` y `labelEn` recortadas, obligatorias y de 1 a 80 caracteres; `status` `ACTIVE` o `INACTIVE` en la edición; `itemIds` como arreglo de UUID en el reordenamiento
- [X] T041 [US3] Implementar `tutorias_uts_back/src/settings/dropdown-lists/dropdown-lists.service.ts`: listar listas con cantidad de elementos, detalle con elementos activos e inactivos (con `inUse`), lectura para selector solo de activos, crear al final, editar, activar o desactivar, reordenar en transacción y eliminar lógico solo sin uso (`DROPDOWN_ITEM_IN_USE`); filtrar siempre `deletedAt: null`
- [X] T042 [US3] Crear `tutorias_uts_back/src/settings/dropdown-lists/dropdown-lists.controller.ts` con los endpoints de `contracts/config-api.yaml` bajo `/api/v1/dropdown-lists` (`GET /:key/items` para cualquier rol autenticado; el resto con `@Roles(SUPERADMIN)`; `PUT /:key/items/order` declarado antes de `/:itemId`), y registrarlo en `tutorias_uts_back/src/settings/settings.module.ts`
- [X] T043 [P] [US3] Crear esquemas Zod, hooks y el helper de etiqueta por idioma en `tutorias_uts_mobile/src/features/dropdown-lists/schemas.ts` y `hooks/` (`useDropdownLists`, `useDropdownList`, `useDropdownItems(key)` con `staleTime` corto para cumplir SC-006, `useSaveItem`, `useReorderItems`, `useDeleteItem`), eligiendo `labelEs` o `labelEn` según `i18n.language` y español por defecto
- [X] T044 [US3] Crear `tutorias_uts_mobile/src/features/dropdown-lists/screens/DropdownListsScreen.tsx` y `DropdownItemsScreen.tsx`, crear `tutorias_uts_mobile/app/(admin)/more/dropdown-lists.tsx` y la ruta del editor de elemento, agregar la fila "Listas desplegables" al grupo "Configuración" de `tutorias_uts_mobile/src/features/shell/screens/MoreScreen.tsx` con sus textos `es`/`en`, y pedir confirmación al desactivar un elemento (FR-005): botones subir y bajar de 48 px con `accessibilityLabel`, estados de carga, vacío y error, formulario con ambas etiquetas, y regla visible cuando solo se puede desactivar
- [X] T045 [US3] Agregar los textos de listas desplegables en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`, con las claves ordenadas

**Checkpoint**: todas las historias funcionales.

---

## Phase 6: User Story 4 - Acceso exclusivo del CAE (Priority: P1)

**Goal**: Solo el CAE ve o modifica la configuración; otros roles solo leen elementos activos y el periodo activo.

**Independent Test**: Con docente y estudiante, todos los endpoints de administración responden `403` sin cambiar datos.

### Tests for User Story 4 ⚠️

- [X] T046 [US4] Prueba e2e en `tutorias_uts_back/test/config-roles.e2e-spec.ts` que recorre todos los endpoints de `contracts/config-api.yaml` con docente y estudiante esperando `403` (y comprobando que la base no cambia), con CAE esperando éxito, y con ambos roles esperando `200` solo en `GET /academic-periods/active` y `GET /dropdown-lists/:key/items`; sin token, `401`

### Implementation for User Story 4

- [X] T047 [US4] Revisar que cada controlador nuevo declare su guard de roles y corregir cualquier endpoint sin `@Roles` en `tutorias_uts_back/src/periods/periods.controller.ts`, `tutorias_uts_back/src/rooms/locations.controller.ts`, `tutorias_uts_back/src/rooms/rooms.controller.ts` y `tutorias_uts_back/src/settings/dropdown-lists/dropdown-lists.controller.ts`
- [X] T048 [P] [US4] Proteger las rutas de la app: confirmar en `tutorias_uts_mobile/src/features/auth/RouteGate.tsx` que las pantallas de configuración solo existen dentro del grupo `(admin)`, y agregar una prueba en `tutorias_uts_mobile/src/features/auth/__tests__/` que verifica la redirección de docente y estudiante

**Checkpoint**: acceso verificado en servidor y app.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Datos de ejemplo, documentación, decisiones y cierre según la Definición de terminado.

- [X] T049 [P] Agregar a `tutorias_uts_db/prisma/seed.ts` (idempotente) un periodo de ejemplo, una ubicación y varios salones con capacidades distintas
- [X] T050 [P] Actualizar `docs/Architecture.md` (§3 `config-usage/` y `settings/dropdown-lists/`; §5 entidades `Location`, `AcademicPeriod` con `UPCOMING`, `closedAt` y cierre automático, `Room`, `DropdownList` y `DropdownItem`) y `docs/Context.md` (reglas de periodo, salones y listas) en `Claude/docs/`
- [X] T051 [P] Registrar en `docs/Decisions.md` las decisiones D-071 (estado del periodo), D-072 (un activo y sin solapamientos en la base de datos), D-073 (listas predefinidas), D-074 (desactivar salón con módulos solo en Próximos), D-075 (eliminar ubicación elimina salones inactivos) y D-076 (solo se eliminan periodos Próximos sin módulos), con motivo y alternativas descartadas; dejar anotado en D-071 o en una nota para la spec de módulos que esa funcionalidad debe cumplir FR-013 (módulos de periodo cerrado en solo lectura), FR-022 (cupo igual a la capacidad del salón) y FR-023 (salón inactivo o eliminado no se asigna), y que debe reemplazar `ConfigUsageService`
- [ ] T052 Preguntar al usuario si corrige en `CLAUDE.md` los nombres `backend/` y `mobile/` por los repositorios reales (`tutorias_uts_back`, `tutorias_uts_mobile`, `tutorias_uts_db`); no cambiarlo sin respuesta
- [X] T053 Ejecutar `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back`, y `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; corregir todo error
- [X] T054 Verificar que ningún componente nuevo contiene textos fijos, colores hexadecimales, nombres de fuente ni íconos fuera del registro (pruebas existentes en `tutorias_uts_mobile/src/__tests__/`), y revisar manualmente objetivos de 48 px, ícono en cada botón y 16 px entre botones apilados
- [ ] T055 Recorrer `specs/006-cae-configuration/quickstart.md` de punta a punta en español e inglés, incluida la medición de SC-001 (menos de 5 minutos) y las comprobaciones de seguridad
- [X] T056 Ejecutar la skill `feature-done-check` y atender sus observaciones antes de abrir el Pull Request

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias. Orden interno: T004 → T005 → T006; T007 a T013 son independientes entre sí tras T006 (T012 y T013 solo necesitan T007 y T002).
- **US1 (Phase 3), US2 (Phase 4), US3 (Phase 5)**: dependen de Foundational; son independientes entre sí y pueden ir en paralelo.
- **US4 (Phase 6)**: la prueba T046 necesita los endpoints de US1, US2 y US3, por eso va después de las tres.
- **Polish (Phase 7)**: depende de las historias deseadas.

### User Story Dependencies

- **US1**: sin dependencias de otras historias.
- **US2**: sin dependencias de otras historias.
- **US3**: sin dependencias de otras historias.
- **US4**: verifica a las demás (T046) pero cada controlador ya nace con su guard.

### Within Each User Story

- Pruebas primero y deben fallar.
- DTO → servicio → controlador → módulo.
- Backend antes de las pantallas que lo consumen.
- Textos `es`/`en` junto con cada pantalla.

### Parallel Opportunities

- T002 y T003 en Setup.
- T007 a T012 en Foundational (archivos distintos).
- Dentro de cada historia: todas las pruebas [P], DTO y hooks de la app [P].
- US1, US2 y US3 pueden repartirse entre personas tras Foundational.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 juntas:
Task: "Pruebas unitarias de PeriodsService en tutorias_uts_back/src/periods/periods.service.spec.ts"
Task: "Prueba e2e en tutorias_uts_back/test/periods.e2e-spec.ts"
Task: "Pruebas de la app en tutorias_uts_mobile/src/features/periods/__tests__/"

# Piezas independientes de US1:
Task: "DTO en tutorias_uts_back/src/periods/dto/"
Task: "Esquema Zod y hooks en tutorias_uts_mobile/src/features/periods/"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Setup y Foundational.
2. US1 (periodos) y US2 (salones): son el prerrequisito de los módulos.
3. **Detener y validar** con el recorrido de `quickstart.md` y la prueba de roles T046 sobre lo existente.

### Incremental Delivery

1. Foundational → base lista.
2. US1 → probar → demostrar.
3. US2 → probar → demostrar (con US1 ya se puede preparar un semestre).
4. US3 → listas para PQRS.
5. US4 → cerrar el acceso exclusivo.
6. Polish y `feature-done-check`.

---

## Notes

- Una tarea por commit o grupo lógico, en Conventional Commits en inglés (`feat(periods): ...`).
- Las restricciones SQL de T005 no las modela Prisma: nunca editar una migración aplicada (crear otra).
- `ConfigUsageService` (T008) devuelve ceros hasta que existan módulos y PQRS; esas funcionalidades reemplazan su cuerpo.
- Si el plan contradice `docs/Architecture.md` o `docs/Design.md`, detenerse y preguntar.
