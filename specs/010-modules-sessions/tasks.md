---

description: "Task list for Módulos y sesiones (CAE)"
---

# Tasks: Módulos y sesiones (CAE)

**Input**: Design documents from `/specs/010-modules-sessions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/modules-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principio V) y `docs/Conventions.md` §6 exigen pruebas de cupo, cruces de horario, cambio de salón y roles (`403`). Escribirlas primero y comprobar que fallan antes de implementar (skill `business-rule-tests`).

**Organization**: Tareas agrupadas por historia de usuario. Las historias P1 (US1, US2, US3) van primero; US4, US5 y US6 (P2) después.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 crear módulo, US2 consultar y filtrar, US3 cambiar salón, US4 cambiar docente, US5 editar y eliminar, US6 festivos
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma, migraciones y `seed.ts` (el esquema se edita solo aquí)
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas en `src/features/<feature>/__tests__/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configuración, íconos y carpetas. Sin dependencias nuevas.

- [X] T001 [P] Agregar a `tutorias_uts_back/src/config/env.ts` (interfaz `Env` y `validateEnv`) y al `.env.example` de `tutorias_uts_back` las variables `HOLIDAYS_API_BASE_URL` (por defecto `https://date.nager.at/api/v3`), `HOLIDAYS_COUNTRY` (por defecto `CO`, dos letras mayúsculas) y `HOLIDAYS_TIMEOUT_MS` (por defecto `10000`, entero positivo); la URL y el país no se escriben fijos en el código (Principio III)
- [X] T002 [P] Registrar en `tutorias_uts_mobile/src/icons/registry.ts` los íconos solar nuevos (módulo, horario, reloj, docente, cambiar salón, cambiar docente, sesión, festivo, importar festivos, casilla marcada y sin marcar, advertencia), con el nombre escrito como texto literal
- [X] T003 [P] Crear las carpetas `tutorias_uts_mobile/src/features/modules/` (con `screens/`, `hooks/`, `components/`, `__tests__/` y `schemas.ts`) y `tutorias_uts_mobile/src/features/holidays/` (con `screens/`, `hooks/`, `__tests__/` y `schemas.ts`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de datos y restricciones, errores, eventos, reglas puras, servicio de uso, utilidades de prueba, tipos y errores de la app. Bloquea todas las historias.

**⚠️ CRITICAL**: Ninguna historia empieza hasta terminar esta fase.

- [X] T004 Agregar a `tutorias_uts_db/prisma/schema.prisma` los enums `SessionStatus` (`SCHEDULED`, `RESCHEDULED`, `CANCELLED`), `SessionCancelReason` (`HOLIDAY`), `HolidaySource` (`MANUAL`, `IMPORTED`) y `OutboxEventType` (`MODULE_TEACHER_CHANGED`, `MODULE_ROOM_CHANGED`, `SESSIONS_CANCELLED_HOLIDAY`, `SESSIONS_RESTORED_HOLIDAY`), y los modelos con `id` UUID, `createdAt`, `updatedAt`, `@@map` y `@map` en `snake_case`: `Module` (`modules`: `periodId` obligatorio, `name` 1 a 120 caracteres, `description` nulo de hasta 1000 caracteres, `teacherId` obligatorio hacia `users`, `roomId` obligatorio hacia `rooms`, `deletedAt` nulo; índices en `period_id`, `teacher_id` y `room_id`), `ModuleSchedule` (`module_schedules`: `moduleId`, `periodId`, `teacherId` y `roomId` como copias, `dayOfWeek` smallint, `startMinute` smallint, `endMinute` smallint, `deletedAt` nulo), `ModuleSession` (`module_sessions`: `moduleId`, `scheduleId`, `teacherId`, `roomId`, `originalStartsAt`, `startsAt` y `endsAt` en `TIMESTAMPTZ`, `status` por defecto `SCHEDULED`, `cancelReason` nulo, `holidayId` nulo, `deletedAt` nulo; índices `(module_id, starts_at)` y `(starts_at)`), `Holiday` (`holidays`: `date` `DATE`, `name` 1 a 120 caracteres, `source` por defecto `MANUAL`, `deletedAt` nulo) y `OutboxEvent` (`outbox_events`: `type`, `moduleId`, `payload` JSON, `createdAt`, `processedAt` nulo; sin `updatedAt` ni `deletedAt`)
- [X] T005 Crear la migración `tutorias_uts_db/prisma/migrations/<timestamp>_add_modules_sessions/migration.sql` generada por Prisma y completarla con SQL a mano (con el mismo encabezado de aviso que la migración de la spec 006): `CHECK (day_of_week BETWEEN 1 AND 7)` y `CHECK (start_minute >= 0 AND start_minute < end_minute AND end_minute <= 1439)` en `module_schedules`; `CHECK (ends_at > starts_at)` y `CHECK (status <> 'CANCELLED' OR cancel_reason IS NOT NULL)` y `CHECK (holiday_id IS NULL OR cancel_reason = 'HOLIDAY')` en `module_sessions`; `EXCLUDE USING gist (teacher_id WITH =, period_id WITH =, day_of_week WITH =, int4range(start_minute, end_minute, '[)') WITH &&) WHERE (deleted_at IS NULL)` con nombre `module_schedules_teacher_no_overlap`, su equivalente por `room_id` con nombre `module_schedules_room_no_overlap` y la de `module_id` (sin `period_id`) con nombre `module_schedules_self_no_overlap`; índice único parcial `module_sessions` sobre `(schedule_id, original_starts_at) WHERE deleted_at IS NULL`; índice único parcial `holidays` sobre `(date) WHERE deleted_at IS NULL`
- [X] T006 Aplicar la migración en la base local, ejecutar `npm run prisma:generate` en `tutorias_uts_back` y verificar con `prisma migrate diff` que Prisma no propone eliminar las restricciones escritas a mano (riesgo de R-1); anotar el resultado (hecho en el mensaje del commit y aquí, no en la migración: editar una migración ya aplicada cambia su checksum y `migrate dev` pediría resetear la base; resultado 2026-11-17: `migrate diff` vacío tras aplicar y la restricción `module_schedules_teacher_no_overlap` rechazó un cruce de prueba)
- [X] T007 [P] Agregar al catálogo de `tutorias_uts_back/src/common/errors/app.exception.ts` los códigos `MODULE_SCHEDULE_INVALID`, `MODULE_SCHEDULE_SELF_OVERLAP`, `MODULE_TEACHER_CONFLICT`, `MODULE_ROOM_CONFLICT`, `MODULE_TEACHER_UNAVAILABLE`, `MODULE_ROOM_UNAVAILABLE`, `MODULE_ROOM_CAPACITY_BELOW_ENROLLED`, `MODULE_HAS_ENROLLMENTS`, `HOLIDAY_DATE_TAKEN`, `HOLIDAY_IN_PAST` y `HOLIDAYS_IMPORT_UNAVAILABLE`
- [X] T008 [P] Crear `tutorias_uts_back/src/outbox/outbox.module.ts` y `tutorias_uts_back/src/outbox/outbox.service.ts` con `record(tx, { type, moduleId, payload })` que escribe en `outbox_events` dentro de la transacción recibida (R-10); el `payload` lleva solo ids, nombres de docente o salón, fechas y cantidades, nunca datos de contacto de los inscritos; el módulo exporta el servicio
- [X] T009 [P] Crear `tutorias_uts_back/src/modules/sessions.rules.ts` con funciones puras: `parseTime('HH:mm') -> minutos` (rechaza fuera de `00:00` a `23:59`), `formatTime(minutos)`, `rangesOverlap(aInicio, aFin, bInicio, bFin)` con rango semiabierto `[)`, `bogotaToUtc(day, minute)` con la constante UTC-5 de `common/clock.ts`, y `occurrences({ startsOn, endsOn, schedules, holidays, now })` que devuelve por horario las fechas desde `startsOn` hasta `endsOn` inclusive con el mismo día de la semana (1 = lunes a 7 = domingo), sin festivos y con `startsAt > now`; y `tutorias_uts_back/src/modules/sessions.rules.spec.ts` con pruebas de: conteo de martes en un periodo conocido, periodo más corto que una semana, festivo omitido, periodo en curso sin sesiones pasadas, fin = inicio sin solapamiento, solapamiento parcial y total, y conversión de las 14:00 de Bogotá a las 19:00 UTC
- [X] T010 Reemplazar los cuerpos de `tutorias_uts_back/src/config-usage/config-usage.service.ts`: `countModulesInPeriod(periodId)` cuenta módulos no borrados, `getRoomUsage(roomId)` cuenta módulos no borrados del salón en el periodo `ACTIVE` y en los `UPCOMING` (mantiene `maxEnrolled` en cero), y agregar `countActiveEnrollments(moduleId)` que devuelve 0; inyectar `PrismaService` (R-7); actualizar `config-usage.module.ts` si hace falta
- [X] T011 [P] Agregar a `tutorias_uts_back/test/utils/factories.ts` fábricas de docente, módulo (con horarios y sesiones), horario y festivo, y en `tutorias_uts_back/test/utils/test-app.ts` un doble de `ConfigUsageService` con inscritos configurables por módulo y un doble del cliente de festivos que simule respuesta válida, error, demora y respuesta inválida; antes, crear `tutorias_uts_back/src/holidays/holidays-client.ts` con la interfaz `HolidaysClient` (`fetchYear(year)` devuelve `{ date, name }[]` o lanza) y el token `HOLIDAYS_CLIENT`, para que el doble no dependa de la historia US6
- [X] T012 [P] Agregar en `tutorias_uts_mobile/src/api/types.ts` los tipos `Module`, `ModuleDetail`, `ModuleInput`, `Schedule`, `Session`, `Teacher`, `Holiday`, `HolidayPreview`, `HolidayResult` y `HolidayRemoval` según `contracts/modules-api.yaml`
- [X] T013 [P] Agregar en `tutorias_uts_mobile/src/i18n/es.json` y `en.json` las claves `errors.<CODE>` para los 11 códigos de T007 (la regla explicada al usuario; los conflictos usan interpolación de módulo, día y horas, y la capacidad usa `{{capacity}}` y `{{enrolled}}`)

**Checkpoint**: Base lista — las historias pueden comenzar.

---

## Phase 3: User Story 1 - Crear un módulo con su horario semanal (Priority: P1) 🎯 MVP

**Goal**: El CAE crea un módulo con docente, salón y uno o más horarios; el sistema genera las sesiones semanales y muestra el cupo.

**Independent Test**: Con un periodo Próximo, un docente activo y un salón de capacidad 30, crear "Cálculo I" los martes de 14:00 a 16:00 y verificar cupo 30 y una sesión por cada martes del periodo; probar los rechazos por cruce.

### Tests for User Story 1 ⚠️ (escribir primero, deben fallar)

- [X] T014 [P] [US1] Prueba e2e de creación en `tutorias_uts_back/test/modules.e2e-spec.ts`: módulo con un horario y con dos (martes y jueves); nombre vacío, sin horarios, día fuera de 1 a 7, fin igual o anterior al inicio y horario que cruza la medianoche (`MODULE_SCHEDULE_INVALID` / `VALIDATION_FAILED`); dos horarios del mismo módulo solapados (`MODULE_SCHEDULE_SELF_OVERLAP`); cruce de docente y de salón con el módulo y horario en `details` (`MODULE_TEACHER_CONFLICT`, `MODULE_ROOM_CONFLICT`); 14:00 a 16:00 y 16:00 a 18:00 permitidos; mismo día y hora en otro periodo permitido; docente inactivo, eliminado o sin rol docente (`MODULE_TEACHER_UNAVAILABLE`); salón inactivo o eliminado (`MODULE_ROOM_UNAVAILABLE`); periodo `CLOSED` (`PERIOD_CLOSED_READ_ONLY`) y `UPCOMING` permitido; cupo igual a la capacidad del salón; cantidad exacta de sesiones por horario y su hora en UTC; periodo en curso solo con sesiones futuras (usando el reloj de prueba); periodo más corto que una semana con `sessionsGenerated` en cero; fecha de festivo existente sin sesión (escenario 9); módulo eliminado libera el cruce
- [X] T015 [P] [US1] Prueba e2e de concurrencia en `tutorias_uts_back/test/modules-concurrency.e2e-spec.ts`: dos creaciones simultáneas con el mismo salón (y otras con el mismo docente) a la misma hora, de las que una responde `201` y la otra `409` y solo queda un horario guardado (SC-002); creación simultánea con el cierre del periodo, que no deja módulos nuevos en un periodo `CLOSED`
- [X] T016 [P] [US1] Prueba e2e de `GET /teachers` en `tutorias_uts_back/test/teachers.e2e-spec.ts`: lista paginada por apellido y nombre, `search` sin distinguir mayúsculas, filtro `status`, excluye eliminados, no devuelve contraseñas ni datos de acceso, `403` para docente y estudiante
- [X] T017 [P] [US1] Pruebas de la app en `tutorias_uts_mobile/src/features/modules/__tests__/schemas.test.ts` (nombre, descripción de hasta 1000 caracteres, al menos un horario, fin posterior al inicio, horarios del mismo módulo que no se solapan) y `tutorias_uts_mobile/src/features/modules/__tests__/module-form.test.tsx` (campos obligatorios, error de cruce con el módulo, estado de envío con `BrandLoader`, y que ante un rechazo del servidor, por ejemplo `PERIOD_CLOSED_READ_ONLY`, el formulario conserva lo escrito)
- [X] T018 [P] [US1] Prueba e2e en `tutorias_uts_back/test/config-usage-rules.e2e-spec.ts` de las reglas de la spec 006 que ahora bloquean con módulos reales (FR-018): eliminar un periodo con módulos (`PERIOD_HAS_MODULES`); desactivar o eliminar un salón con módulos en el periodo activo (`ROOM_IN_ACTIVE_PERIOD`); desactivar un salón con módulos solo en periodos Próximos, permitido y con la cantidad de módulos afectados en el aviso previo (`GET /rooms/:id/impact`); bajar la capacidad de un salón por debajo de los inscritos simulados con el doble de `ConfigUsageService` (`ROOM_CAPACITY_BELOW_ENROLLED`); y que un módulo eliminado deja de contar

### Implementation for User Story 1

- [X] T019 [P] [US1] Crear `tutorias_uts_back/src/modules/dto/module.dto.ts` con `CreateModuleDto` (`periodId` UUID; `name` recortado de 1 a 120 caracteres; `description` opcional de hasta 1000 caracteres; `teacherId` y `roomId` UUID; `schedules` de al menos un elemento con `dayOfWeek` 1 a 7, `startTime` y `endTime` `HH:mm`) y los tipos de vista `ModuleView` y `ModuleDetailView` según el contrato, con decoradores de Swagger
- [X] T020 [US1] Crear `tutorias_uts_back/src/modules/schedules.service.ts`: convierte y valida los horarios con `sessions.rules.ts`, rechaza solapamientos internos, busca antes de escribir el módulo y horario con que se cruzan el docente y el salón (devueltos en `details`) y traduce las violaciones de `module_schedules_teacher_no_overlap`, `module_schedules_room_no_overlap` y `module_schedules_self_no_overlap` (con `violatedConstraint` de `common/db-errors.ts`) a sus códigos como respaldo de la carrera (R-1)
- [X] T021 [US1] Crear `tutorias_uts_back/src/modules/sessions.generator.ts`: lee los festivos del rango del periodo, calcula las ocurrencias con `occurrences(...)` y escribe las sesiones con `INSERT ... ON CONFLICT DO NOTHING` sobre el índice único de T005, con el docente y el salón del módulo, y devuelve la cantidad creada por horario (R-4)
- [X] T022 [US1] Crear `tutorias_uts_back/src/modules/modules.service.ts` con `create(dto)`: cierra los periodos vencidos, abre una transacción que bloquea la fila del periodo con `FOR SHARE` y rechaza `CLOSED` con `PERIOD_CLOSED_READ_ONLY` (R-2), valida docente (rol `TEACHER`, `ACTIVE`, sin `deletedAt`) y salón (`ACTIVE`, sin `deletedAt`), inserta módulo y horarios con las copias de `period_id`, `teacher_id` y `room_id`, llama al generador y devuelve el detalle con `capacity` igual a `rooms.capacity`, `enrolled` desde `ConfigUsageService` y `sessionsGenerated` por horario
- [X] T023 [US1] Agregar `GET /teachers` (solo lectura, `@Roles('SUPERADMIN')`, `search`, `status`, `page` y `limit`) en `tutorias_uts_back/src/teachers/teachers.controller.ts` y su consulta en `tutorias_uts_back/src/teachers/teachers.service.ts`, excluyendo eliminados y devolviendo solo `id`, nombres y estado
- [X] T024 [US1] Crear `tutorias_uts_back/src/modules/modules.controller.ts` con `POST /modules` (`@Roles('SUPERADMIN')`, 201) y `tutorias_uts_back/src/modules/modules.module.ts` (importa `OutboxModule` y `ConfigUsageModule`); registrar `ModulesModule` en `tutorias_uts_back/src/app.module.ts`
- [X] T025 [US1] Mover la pantalla de salones y ubicaciones: crear `tutorias_uts_mobile/app/(admin)/modules/rooms.tsx` que exporta `RoomsScreen`, dejar `tutorias_uts_mobile/app/(admin)/modules/index.tsx` exportando un `ModulesScreen` nuevo en `tutorias_uts_mobile/src/features/modules/screens/ModulesScreen.tsx` (por ahora con estado vacío y el botón "Nuevo módulo" con ícono a la izquierda), añadir en su barra superior un botón de ícono con `accessibilityLabel` hacia `modules/rooms`, y ajustar `tutorias_uts_mobile/app/(admin)/modules/_layout.tsx` y los enlaces existentes a salones y ubicaciones
- [X] T026 [P] [US1] Crear `tutorias_uts_mobile/src/features/modules/hooks/useTeachers.ts` (lista de docentes `ACTIVE` con búsqueda) y `tutorias_uts_mobile/src/features/modules/hooks/useModules.ts` con la mutación `useCreateModule` que invalida las consultas de módulos
- [X] T027 [P] [US1] Crear `tutorias_uts_mobile/src/features/modules/schemas.ts` con el esquema Zod del formulario (límites de T019 y horarios sin solapamiento entre sí) y los mensajes por clave de traducción
- [X] T028 [P] [US1] Crear los componentes `tutorias_uts_mobile/src/features/modules/components/ScheduleEditor.tsx` (lista de horarios con chips de día, dos campos de hora elegidos en una hoja inferior con `SelectField` en pasos de 15 minutos de `00:00` a `23:45`, botón "Agregar horario" con ícono y 16 px entre botones apilados, quitar horario con botón solo de ícono) y `tutorias_uts_mobile/src/features/modules/components/PickerSheet.tsx` para elegir docente o salón en una hoja inferior con búsqueda, estados de carga, vacío y error, y objetivos de 48 px
- [X] T029 [US1] Crear `tutorias_uts_mobile/src/features/modules/screens/ModuleFormScreen.tsx` y la ruta `tutorias_uts_mobile/app/(admin)/modules/module-form.tsx`: periodo (solo Próximo o Activo), nombre, descripción, docente, salón, horarios; al guardar muestra el cupo y las sesiones generadas, avisa cuando un horario no generó sesiones y, ante un cruce, muestra en un `Banner` el módulo y el horario con que choca (campos con relleno, borde tenue e ícono a la izquierda; botón Guardar con ícono); si el servidor rechaza el guardado, por ejemplo porque el periodo se cerró, el formulario conserva lo escrito y muestra la regla
- [X] T030 [US1] Agregar en `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos de `modules.form.*`, `modules.schedule.*` (días de la semana y errores de validación) y los de la barra superior y el estado vacío de `ModulesScreen`

**Checkpoint**: US1 completa — se puede crear un módulo y ver sus rechazos.

---

## Phase 4: User Story 2 - Consultar y filtrar módulos por periodo (Priority: P1)

**Goal**: El CAE ve los módulos por periodo, con filtros, y abre el detalle con las sesiones.

**Independent Test**: Con módulos en dos periodos, cambiar de periodo y comprobar el listado; abrir uno y ver sus sesiones en hora de Bogotá; abrir el de un periodo Cerrado y verlo en solo lectura.

### Tests for User Story 2 ⚠️

- [X] T031 [P] [US2] Pruebas e2e en `tutorias_uts_back/test/modules.e2e-spec.ts` (sección de consulta): listado por periodo, periodo por defecto (activo, o el próximo más cercano si no hay activo), `search`, `teacherId`, `roomId`, paginación, exclusión de eliminados; detalle con `capacity`, `enrolled`, `holidayDates`, `canChangeSchedules`, `canDelete`, `roomUnavailable`, `teacherUnavailable` (docente o salón desactivado o eliminado después de asignarse; el módulo y sus sesiones futuras se conservan) y `readOnlyReason: 'PERIOD_CLOSED'`; sesiones paginadas con `from` y `to` en fechas de Bogotá, estado y docente y salón de cada una; `404` para un id inexistente o eliminado
- [X] T032 [P] [US2] Pruebas de la app en `tutorias_uts_mobile/src/features/modules/__tests__/modules-screen.test.tsx` (cuatro estados, cambio de periodo, búsqueda y chips) y `tutorias_uts_mobile/src/features/modules/__tests__/module-detail.test.tsx` (sesiones en hora de Bogotá, festivos omitidos, aviso y ausencia de acciones en periodo Cerrado)

### Implementation for User Story 2

- [X] T033 [P] [US2] Agregar a `tutorias_uts_back/src/modules/dto/module.dto.ts` `ListModulesQuery` (`periodId`, `search`, `teacherId`, `roomId`, `page` y `limit` con máximo 100 y valor por defecto 20) y `ListSessionsQuery` (`from`, `to` como `YYYY-MM-DD` reales, `page`, `limit`)
- [X] T034 [US2] Agregar a `tutorias_uts_back/src/modules/modules.service.ts` `list(query)` (cierra periodos vencidos, resuelve el periodo por defecto, filtra `deletedAt: null`, calcula `capacity` y `enrolled`, marca `roomUnavailable` y `teacherUnavailable`), `get(id)` (con `holidayDates`, `canChangeSchedules` y `canDelete` desde los inscritos, y `readOnlyReason`) y `listSessions(id, query)` ordenadas por `startsAt` ascendente
- [X] T035 [US2] Agregar `GET /modules`, `GET /modules/:id` y `GET /modules/:id/sessions` (`@Roles('SUPERADMIN')`) en `tutorias_uts_back/src/modules/modules.controller.ts`
- [X] T036 [P] [US2] Agregar a `tutorias_uts_mobile/src/features/modules/hooks/useModules.ts` `useModuleList(filters)`, `useModule(id)` y `useModuleSessions(id, range)`; y crear `tutorias_uts_mobile/src/features/modules/components/ModuleCard.tsx` (nombre, docente, salón, horarios resumidos, cupo `inscritos / capacidad`, marca de salón inactivo y de docente no disponible)
- [X] T037 [US2] Completar `tutorias_uts_mobile/src/features/modules/screens/ModulesScreen.tsx`: selector de periodo, `SearchField`, chips de docente y salón, lista con los cuatro estados, estado vacío con la acción de crear (escenario 4) y botón "Nuevo módulo"
- [X] T038 [P] [US2] Crear `tutorias_uts_mobile/src/features/modules/components/SessionRow.tsx` (fecha y hora en `America/Bogota` desde UTC, estado con texto e ícono, "Cancelada por festivo" cuando corresponde)
- [X] T039 [US2] Crear `tutorias_uts_mobile/src/features/modules/screens/ModuleDetailScreen.tsx` y la ruta `tutorias_uts_mobile/app/(admin)/modules/[id].tsx`: datos, docente, salón, cupo, inscritos, horarios, fechas omitidas por festivo y lista de sesiones con paginación; si `readOnlyReason` es `PERIOD_CLOSED`, un `Banner` explica el motivo y no se muestran acciones de crear, editar ni eliminar (escenario 5)
- [X] T040 [US2] Agregar en `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos de `modules.list.*`, `modules.detail.*`, `modules.session.*` y `modules.readOnly.*`

**Checkpoint**: US1 y US2 funcionan — se crean, se ven y se consultan módulos.

---

## Phase 5: User Story 3 - Cambiar el salón de un módulo (Priority: P1)

**Goal**: El CAE reasigna el salón; se bloquea si la capacidad nueva es menor que los inscritos.

**Independent Test**: Con un módulo con 25 inscritos (doble) en un salón de 30, pasar a uno de 20 (bloqueado con las dos cifras) y a uno de 40 (permitido, cupo 40).

### Tests for User Story 3 ⚠️

- [X] T041 [P] [US3] Pruebas e2e en `tutorias_uts_back/test/modules.e2e-spec.ts` (sección de salón): capacidad menor que los inscritos (`MODULE_ROOM_CAPACITY_BELOW_ENROLLED` con `capacity` y `enrolled`), igual y mayor permitidas, cupo nuevo en el detalle, sesiones futuras con el salón nuevo y pasadas con el anterior (`module_sessions.room_id`), cruce con otro módulo (`MODULE_ROOM_CONFLICT`), salón inactivo o eliminado (`MODULE_ROOM_UNAVAILABLE`), módulo sin inscritos, periodo `CLOSED`, y registro de `MODULE_ROOM_CHANGED` en `outbox_events` en la misma transacción (sin evento si el cambio falla)
- [X] T042 [P] [US3] Pruebas de la app en `tutorias_uts_mobile/src/features/modules/__tests__/change-room.test.tsx`: la opción con capacidad insuficiente aparece deshabilitada con el mensaje `Not enough capacity: 32 enrolled, this room holds 30` traducido, y la confirmación indica cuántos inscritos serán avisados, solo cuando hay al menos uno

### Implementation for User Story 3

- [X] T043 [P] [US3] Agregar `ChangeRoomDto` (`roomId` UUID) en `tutorias_uts_back/src/modules/dto/module.dto.ts`
- [X] T044 [US3] Agregar `changeRoom(id, dto)` en `tutorias_uts_back/src/modules/modules.service.ts`: transacción con `FOR SHARE` del periodo y `FOR UPDATE` del módulo (R-7), salón `ACTIVE` y sin `deletedAt`, rechazo si `capacity` es menor que `countActiveEnrollments`, actualiza `modules`, `module_schedules` y las sesiones con `starts_at` futura y sin `deletedAt` (incluidas las canceladas por festivo), traduce la violación de `module_schedules_room_no_overlap` y registra `MODULE_ROOM_CHANGED` con `OutboxService`
- [X] T045 [US3] Agregar `PATCH /modules/:id/room` (`@Roles('SUPERADMIN')`) en `tutorias_uts_back/src/modules/modules.controller.ts`
- [X] T046 [P] [US3] Agregar `useChangeRoom` en `tutorias_uts_mobile/src/features/modules/hooks/useModules.ts` y crear `tutorias_uts_mobile/src/features/modules/components/RoomChangeSheet.tsx` basada en `PickerSheet`: las opciones con capacidad menor que los inscritos se muestran deshabilitadas con el mensaje de la regla en el color de error de `Design.md`, y un `ConfirmDialog` con la cantidad de inscritos que serán avisados (solo si hay al menos uno; es veraz porque la inscripción de la spec 011 no se publica sin las notificaciones de la spec 013, D-087)
- [X] T047 [US3] Conectar en `tutorias_uts_mobile/src/features/modules/screens/ModuleDetailScreen.tsx` la acción "Cambiar salón" con `RoomChangeSheet` (oculta en periodo Cerrado) y agregar los textos `modules.changeRoom.*` en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US1 a US3 funcionan — el bloque P1 está completo.

---

## Phase 6: User Story 4 - Cambiar el docente de un módulo (Priority: P2)

**Goal**: El CAE reasigna el docente; aplica a las sesiones futuras.

**Independent Test**: Reasignar a un docente libre y a uno ocupado; las sesiones futuras cambian y las pasadas conservan el anterior.

### Tests for User Story 4 ⚠️

- [X] T048 [P] [US4] Pruebas e2e en `tutorias_uts_back/test/modules.e2e-spec.ts` (sección de docente): docente libre (módulo y sesiones futuras cambian, pasadas no), docente ocupado (`MODULE_TEACHER_CONFLICT` con el módulo en `details`), docente desactivado, eliminado o sin rol docente (`MODULE_TEACHER_UNAVAILABLE`), periodo `CLOSED`, y registro de `MODULE_TEACHER_CHANGED` en `outbox_events`
- [X] T049 [P] [US4] Prueba de la app en `tutorias_uts_mobile/src/features/modules/__tests__/change-teacher.test.tsx`: la hoja solo ofrece docentes activos, muestra el conflicto devuelto y confirma con la cantidad de inscritos que serán avisados cuando hay al menos uno

### Implementation for User Story 4

- [X] T050 [P] [US4] Agregar `ChangeTeacherDto` (`teacherId` UUID) en `tutorias_uts_back/src/modules/dto/module.dto.ts`
- [X] T051 [US4] Agregar `changeTeacher(id, dto)` en `tutorias_uts_back/src/modules/modules.service.ts` con el mismo esquema de transacción y sesiones futuras que `changeRoom`, y la violación de `module_schedules_teacher_no_overlap` traducida; registra `MODULE_TEACHER_CHANGED`
- [X] T052 [US4] Agregar `PATCH /modules/:id/teacher` (`@Roles('SUPERADMIN')`) en `tutorias_uts_back/src/modules/modules.controller.ts`
- [X] T053 [P] [US4] Agregar `useChangeTeacher` en `tutorias_uts_mobile/src/features/modules/hooks/useModules.ts` y crear `tutorias_uts_mobile/src/features/modules/components/TeacherChangeSheet.tsx` basada en `PickerSheet` con el `ConfirmDialog` de inscritos
- [X] T054 [US4] Conectar la acción "Cambiar docente" en `tutorias_uts_mobile/src/features/modules/screens/ModuleDetailScreen.tsx` (oculta en periodo Cerrado) y agregar los textos `modules.changeTeacher.*` en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US4 funciona de forma independiente.

---

## Phase 7: User Story 5 - Editar y eliminar un módulo (Priority: P2)

**Goal**: El CAE edita nombre y descripción siempre, cambia horarios solo sin inscritos y elimina solo sin inscritos.

**Independent Test**: Editar el nombre; cambiar el horario de un módulo sin inscritos y ver las sesiones regeneradas; eliminar uno sin inscritos; ver los bloqueos con inscritos.

### Tests for User Story 5 ⚠️

- [X] T055 [P] [US5] Pruebas e2e en `tutorias_uts_back/test/modules.e2e-spec.ts` (sección de edición): nombre y descripción editables con y sin inscritos y rechazados en periodo `CLOSED`; reemplazo de horarios sin inscritos (sesiones futuras anteriores marcadas con `deletedAt`, nuevas generadas, pasadas intactas, cruces validados, festivos omitidos); reemplazo con inscritos (`MODULE_HAS_ENROLLMENTS` con `enrolled`); eliminación sin inscritos (lógica, libera docente y salón, desaparece del listado y su detalle responde `404`); eliminación con inscritos bloqueada; periodo `CLOSED` bloquea todo; reemplazar horarios dentro de una carrera con el cierre del periodo
- [X] T056 [P] [US5] Pruebas de la app en `tutorias_uts_mobile/src/features/modules/__tests__/edit-delete.test.tsx`: el formulario en modo edición bloquea el campo de horarios con la regla cuando hay inscritos, el diálogo de eliminación destructivo dice que el registro se oculta y no se borra, y en periodo Cerrado no hay acciones

### Implementation for User Story 5

- [X] T057 [P] [US5] Agregar `UpdateModuleDto` (`name` de 1 a 120 caracteres y `description` de hasta 1000, ambos opcionales) y `ReplaceSchedulesDto` (`schedules` de al menos un elemento, mismas reglas que en creación) en `tutorias_uts_back/src/modules/dto/module.dto.ts`
- [X] T058 [US5] Agregar a `tutorias_uts_back/src/modules/modules.service.ts` `update(id, dto)`, `replaceSchedules(id, dto)` (transacción con `FOR SHARE` del periodo y `FOR UPDATE` del módulo, rechazo con inscritos, marca como eliminados los horarios y las sesiones futuras anteriores, inserta los nuevos horarios con las copias, genera las sesiones y devuelve `sessionsGenerated` por horario, R-5) y `remove(id)` (rechazo con inscritos, `deletedAt` en módulo, horarios y sesiones futuras)
- [X] T059 [US5] Agregar `PATCH /modules/:id`, `PUT /modules/:id/schedules` y `DELETE /modules/:id` (204) con `@Roles('SUPERADMIN')` en `tutorias_uts_back/src/modules/modules.controller.ts`
- [X] T060 [P] [US5] Agregar `useUpdateModule`, `useReplaceSchedules` y `useDeleteModule` en `tutorias_uts_mobile/src/features/modules/hooks/useModules.ts`
- [X] T061 [US5] Agregar el modo edición a `tutorias_uts_mobile/src/features/modules/screens/ModuleFormScreen.tsx` (periodo, docente y salón de solo lectura en edición, horarios deshabilitados con la regla si `canChangeSchedules` es falso) y las acciones "Editar" y "Eliminar" (con `ConfirmDialog` destructivo, deshabilitada con la regla si `canDelete` es falso) en `tutorias_uts_mobile/src/features/modules/screens/ModuleDetailScreen.tsx`
- [X] T062 [US5] Agregar los textos `modules.edit.*` y `modules.delete.*` en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US5 funciona; la gestión de módulos queda completa.

---

## Phase 8: User Story 6 - Administrar el calendario de festivos (Priority: P2)

**Goal**: El CAE mantiene los festivos, con importación opcional desde Nager.Date; las sesiones futuras de cada festivo se cancelan y se restauran.

**Independent Test**: Importar los festivos del año siguiente, confirmar, agregar un día a mano y verificar que un módulo nuevo no genera sesiones en esas fechas.

### Tests for User Story 6 ⚠️

- [X] T063 [P] [US6] Pruebas e2e en `tutorias_uts_back/test/holidays.e2e-spec.ts` (calendario): alta (fecha repetida `HOLIDAY_DATE_TAKEN`, fecha pasada `HOLIDAY_IN_PAST`), edición de nombre y de fecha, baja lógica y fecha reutilizable después, listado por año con `isPast`; al registrar, las sesiones `SCHEDULED` futuras de esa fecha en Bogotá pasan a `CANCELLED` con `cancelReason: 'HOLIDAY'` y `holidayId`, las pasadas no cambian y se registra `SESSIONS_CANCELLED_HOLIDAY`; al eliminar, se restauran las que no tengan cruce de salón o docente con otra sesión no cancelada (`notRestored` con `ROOM_BUSY` o `TEACHER_BUSY`), se generan las que faltaban por haberse creado el módulo con el festivo existente y se registra `SESSIONS_RESTORED_HOLIDAY`; sin cambios en sesiones de módulos de periodos `CLOSED`, ni al registrar ni al eliminar un festivo (FR-015); un festivo con fecha anterior a hoy en Bogotá se rechaza con `HOLIDAY_IN_PAST` al registrarlo; el caso `notRestored` se arma insertando la sesión conflictiva directamente en la base, porque aún no hay reprogramación; `403` por rol
- [X] T064 [P] [US6] Pruebas e2e en `tutorias_uts_back/test/holidays.e2e-spec.ts` (importación, con el doble del cliente de T011): vista previa con `alreadyExists` e `isPast`; importación de las fechas confirmadas sin duplicar, omitiendo las pasadas y volviendo a consultar el servicio; fechas confirmadas que no están en la respuesta se omiten; servicio caído, demora superior al límite, respuesta que no es una lista, elementos con fecha inválida o de otro año y lista vacía responden `502 HOLIDAYS_IMPORT_UNAVAILABLE` sin guardar nada; solo se importan los de tipo `Public`; la solicitud saliente lleva únicamente el año y el país, sin cabeceras con datos del usuario
- [X] T065 [P] [US6] Pruebas de la app en `tutorias_uts_mobile/src/features/holidays/__tests__/holidays.test.tsx` y `tutorias_uts_mobile/src/features/holidays/__tests__/schemas.test.ts`: lista por año con los cuatro estados, formulario con `DateField` (nunca texto libre), vista previa de importación con casillas y marca de ya existentes, mensaje de importación no disponible con el registro manual disponible, festivo pasado sin acciones de editar ni eliminar, y fechas pasadas no seleccionables en la vista previa

### Implementation for User Story 6

- [X] T066 [P] [US6] Crear `tutorias_uts_back/src/holidays/dto/holiday.dto.ts` (`HolidayDto` con `date` como `YYYY-MM-DD` real y `name` recortado de 1 a 120 caracteres; `ListHolidaysQuery` con `year` entero de 2000 a 2100; `ImportHolidaysDto` con `year` y `dates` de al menos un elemento) y los tipos de vista del contrato
- [X] T067 [P] [US6] Crear `tutorias_uts_back/src/holidays/holidays-import.service.ts` con la implementación de `HolidaysClient` (interfaz y token de `holidays-client.ts`, T011) con `fetch` y `AbortSignal.timeout(HOLIDAYS_TIMEOUT_MS)` sobre `{HOLIDAYS_API_BASE_URL}/PublicHolidays/{año}/{HOLIDAYS_COUNTRY}` (R-9): valida lista, `date` real del año pedido y `localName` o `name`, descarta elementos inválidos, conserva solo `types` que incluya `Public`, y lanza `HOLIDAYS_IMPORT_UNAVAILABLE` (502) si falla, se agota el tiempo, no es una lista o queda vacía; no envía cabeceras con datos del usuario ni del proyecto
- [X] T068 [US6] Crear `tutorias_uts_back/src/holidays/holidays.service.ts`: `list(year)`, `create`, `update` y `remove` con la regla de fechas pasadas (no se registran, editan ni eliminan festivos con fecha anterior a hoy en Bogotá, `bogotaCalendarDay`); al crear o mover un festivo cancela en la misma transacción las sesiones `SCHEDULED` futuras de esa fecha, solo de módulos cuyo periodo no está `CLOSED`, y registra `SESSIONS_CANCELLED_HOLIDAY` por módulo afectado; al eliminar restaura las sesiones con ese `holiday_id` (solo de periodos no `CLOSED`) que no tengan cruce de salón o docente con otra sesión no cancelada, ejecuta el generador de `sessions.generator.ts` para las fechas faltantes (también solo en periodos no `CLOSED`) y registra `SESSIONS_RESTORED_HOLIDAY`; `preview(year)` (con `isPast` en cada fecha) e `import(dto)` usando `HolidaysClient`, saltando fechas existentes y pasadas
- [X] T069 [US6] Crear `tutorias_uts_back/src/holidays/holidays.controller.ts` (`@Roles('SUPERADMIN')`; declarar `GET /holidays/import-preview` y `POST /holidays/import` antes de las rutas con `:id`) y `tutorias_uts_back/src/holidays/holidays.module.ts` (importa `OutboxModule` y registra el cliente real); registrar `HolidaysModule` en `tutorias_uts_back/src/app.module.ts`
- [X] T070 [P] [US6] Crear `tutorias_uts_mobile/src/features/holidays/schemas.ts` y `tutorias_uts_mobile/src/features/holidays/hooks/useHolidays.ts` (`useHolidays(year)`, `useCreateHoliday`, `useUpdateHoliday`, `useDeleteHoliday`, `useImportPreview(year)`, `useImportHolidays`) que invalidan también las consultas de módulos y sesiones
- [X] T071 [US6] Crear `tutorias_uts_mobile/src/features/holidays/screens/HolidaysScreen.tsx` (selector de año, lista con fecha en `dd/mm/YYYY` y origen, menú por fila con Editar y Eliminar solo en festivos futuros, botones "Agregar" e "Importar" con ícono) y las rutas `tutorias_uts_mobile/app/(admin)/more/holidays.tsx`, `tutorias_uts_mobile/app/(admin)/more/holiday-form.tsx` y `tutorias_uts_mobile/app/(admin)/more/holidays-import.tsx`
- [X] T072 [P] [US6] Crear `tutorias_uts_mobile/src/features/holidays/screens/HolidayFormScreen.tsx` (nombre y fecha con `DateField`; al guardar muestra cuántas sesiones se cancelaron; al eliminar un festivo muestra cuántas se restauraron y las que no) y `tutorias_uts_mobile/src/features/holidays/screens/HolidaysImportScreen.tsx` (año, vista previa con casillas, las ya existentes y las pasadas marcadas y no seleccionables, confirmar o descartar, y ante el error de importación un `Banner` con "Reintentar" y el acceso al registro manual)
- [X] T073 [US6] Agregar la fila "Festivos" al grupo "Configuración" de `tutorias_uts_mobile/src/features/shell/screens/MoreScreen.tsx` (solo CAE, junto a Periodos) y los textos `holidays.*` en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: Las seis historias funcionan de forma independiente.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Roles, contrato, datos de ejemplo, documentación y cierre según la Definición de terminado.

- [ ] T074 Prueba e2e `tutorias_uts_back/test/modules-roles.e2e-spec.ts` que recorre todos los endpoints de `contracts/modules-api.yaml` (módulos, sesiones, festivos, importación y `GET /teachers`) con docente y estudiante esperando `403` y comprobando que la base no cambia, con el CAE esperando éxito, y sin token esperando `401` (SC-006)
- [ ] T075 [P] Registrar `specs/010-modules-sessions/contracts/modules-api.yaml` en la prueba de contrato `tutorias_uts_back/test/contract.e2e-spec.ts` (con `test/utils/contract.ts`) para que las respuestas reales cumplan el esquema, y revisar que cada controlador nuevo declare `@Roles` en `tutorias_uts_back/src/modules/modules.controller.ts`, `tutorias_uts_back/src/holidays/holidays.controller.ts` y `tutorias_uts_back/src/teachers/teachers.controller.ts`
- [ ] T076 [P] Agregar a `tutorias_uts_db/prisma/seed.ts` (idempotente) los festivos de ejemplo del año del periodo de ejemplo y un módulo de ejemplo con docente, salón del seed de la spec 006 y un horario semanal
- [ ] T077 [P] Verificar en `Claude/docs/` que `Architecture.md`, `Context.md` y `Decisions.md` (D-083 a D-087) coinciden con lo implementado (nombres de campos, códigos de error y reglas) y marcar las decisiones como "Aceptada e implementada (spec 010)"; registrar en `Decisions.md` cualquier cambio surgido durante la implementación
- [ ] T078 Confirmar con el usuario la decisión D-088 (un docente o salón que deja de estar disponible tras asignarse solo se marca como no disponible, sin bloquear su desactivación; FR-027) y registrarla como "Aceptada e implementada" en `Claude/docs/Decisions.md` y en `Claude/docs/Context.md`; comprobar que las pruebas de T031 la cubren
- [ ] T079 Ejecutar `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back`, y `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; corregir todo error
- [ ] T080 Verificar que ningún componente nuevo contiene textos fijos, colores hexadecimales, nombres de fuente ni íconos fuera del registro (pruebas existentes en `tutorias_uts_mobile/src/__tests__/`), que `es.json` y `en.json` tienen las mismas claves, y revisar manualmente objetivos de 48 px, ícono a la izquierda en cada botón y 16 px entre botones apilados
- [ ] T081 Recorrer `specs/010-modules-sessions/quickstart.md` de punta a punta en español e inglés, con modo oscuro, fuente grande y "reducir movimiento", incluida la medición de SC-001 y SC-010, y anotar los resultados con fecha en la sección "Resultados"
- [ ] T082 Ejecutar la skill `feature-done-check`, atender sus observaciones, marcar `Status` de la spec como implementada, comprobar que D-087 y la spec 011 dejan escrito que la inscripción no se publica sin las notificaciones (spec 013) o sin un consumidor del outbox, y abrir el Pull Request

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias. Orden interno: T004 → T005 → T006; T007 a T013 son independientes entre sí tras T006 (T009 no necesita base de datos; T010 necesita T006; T011 necesita T006 y T008).
- **US1 (Phase 3)**: depende de Foundational. Es el MVP.
- **US2 (Phase 4)**: depende de US1 (necesita módulos creados y la pantalla `ModulesScreen`).
- **US3 (Phase 5), US4 (Phase 6), US5 (Phase 7)**: dependen de US1 y de `get` de US2 (el detalle donde viven las acciones); entre sí son independientes y comparten `modules.service.ts`, `modules.controller.ts` y `ModuleDetailScreen.tsx`, así que se hacen en secuencia o con cuidado de fusión.
- **US6 (Phase 8)**: depende de Foundational; el backend y la pantalla de festivos son independientes de US2 a US5. Su efecto sobre sesiones se prueba con módulos creados por US1.
- **Polish (Phase 9)**: depende de las historias deseadas; T074 necesita todos los endpoints.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- DTOs → servicios → controlador → hooks → componentes → pantalla → textos.
- Una historia se cierra (checkpoint) antes de pasar a la siguiente prioridad.

### Parallel Opportunities

- Setup: T001, T002, T003 en paralelo.
- Foundational: T007, T008, T009, T011, T012 y T013 en paralelo tras T006.
- US1: T014 a T017 y T018 en paralelo (archivos distintos); T019, T026, T027 y T028 en paralelo.
- US6 puede avanzar en paralelo con US3 a US5 si hay más de una persona.
- Backend y app de una misma historia pueden avanzar en paralelo una vez fijado el contrato.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 en paralelo (deben fallar al inicio):
Task: "Prueba e2e de creación en tutorias_uts_back/test/modules.e2e-spec.ts"
Task: "Prueba e2e de concurrencia en tutorias_uts_back/test/modules-concurrency.e2e-spec.ts"
Task: "Prueba e2e de GET /teachers en tutorias_uts_back/test/teachers.e2e-spec.ts"
Task: "Pruebas de la app en tutorias_uts_mobile/src/features/modules/__tests__/"

# Piezas independientes de la app:
Task: "hooks en tutorias_uts_mobile/src/features/modules/hooks/"
Task: "schemas.ts en tutorias_uts_mobile/src/features/modules/schemas.ts"
Task: "ScheduleEditor y PickerSheet en tutorias_uts_mobile/src/features/modules/components/"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Completar Setup y Foundational.
2. Completar US1 (crear módulo) y **validar**: sesiones, cupo y rechazos por cruce, incluida la concurrencia.
3. Completar US2 (consulta) y US3 (cambio de salón): el bloque P1 es lo que las specs 011 y 012 necesitan para empezar (módulos visibles con cupo y sesiones).
4. Demostrar al CAE antes de seguir.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → crear módulos (MVP).
3. US2 y US3 → consulta y regla de capacidad.
4. US4 y US5 → reasignación de docente y ciclo de gestión.
5. US6 → festivos; conviene tenerla antes de generar sesiones reales de un periodo, porque un festivo registrado después cancela sesiones ya creadas.
6. Polish → roles, contrato, documentación y cierre.

### Notas

- Las tareas del backend que tocan `modules.service.ts` y `modules.controller.ts` (US1 a US5) comparten archivos: no marcarlas [P] entre historias.
- Verificar siempre que la prueba falle antes de implementar.
- Un commit por tarea o grupo lógico, en Conventional Commits y en inglés (`feat(modules): ...`), en el repositorio que corresponda.
- Si algo contradice `docs/Architecture.md` o `docs/Design.md`, detenerse y preguntar.
