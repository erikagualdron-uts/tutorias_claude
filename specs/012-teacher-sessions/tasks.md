---

description: "Task list for Cronograma del docente: reprogramar y cancelar sesiones"
---

# Tasks: Cronograma del docente: reprogramar y cancelar sesiones

**Input**: Design documents from `/specs/012-teacher-sessions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/teacher-sessions-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principio V) y `docs/Conventions.md` §6 exigen pruebas de las ventanas de tiempo, los cruces, la concurrencia y los roles (`403`). Escribirlas primero y comprobar que fallan antes de implementar (skill `business-rule-tests`).

**Organization**: Tareas agrupadas por historia de usuario. US1, US2 y US3 son P1 y van primero; US4 (P2) cierra los eventos y el límite configurable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 ver módulos y sesiones, US2 reprogramar, US3 cancelar y reactivar, US4 eventos y límite configurable
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma y migraciones (el esquema se edita solo aquí)
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas en `src/features/<feature>/__tests__/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí (la base de datos de prueba es compartida)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configuración, códigos de error e íconos. Sin dependencias nuevas.

- [X] T001 [P] Agregar a `tutorias_uts_back/src/config/env.ts` (interfaz `Env` y `validateEnv`) y a `.env.example` la variable `TEACHER_CHANGE_LEAD_MINUTES` (por defecto `120`, entero positivo; si no lo es, `validateEnv` lanza `TEACHER_CHANGE_LEAD_MINUTES must be a positive integer`). Ampliar `tutorias_uts_back/src/config/env.spec.ts` con el valor por defecto, un valor válido (`90`) y los rechazos (`0`, `-5`, `abc`, `1.5`)
- [X] T002 [P] Agregar al catálogo de `tutorias_uts_back/src/common/errors/app.exception.ts` los códigos `SESSION_CHANGE_WINDOW_PASSED`, `SESSION_NOT_CHANGEABLE`, `SESSION_RESCHEDULE_INVALID_DATE` y `SESSION_STUDENT_CONFLICT` (junto a los de las specs 001, 006, 010 y 011) y actualizar el comentario del encabezado con la spec 012
- [X] T003 [P] Agregar esos cuatro códigos a `ERROR_CODES` de `tutorias_uts_mobile/src/api/errors.ts` y sus textos `errors.<CODE>` a `src/i18n/es.json` y `en.json`: `SESSION_CHANGE_WINDOW_PASSED` usa `{{minutes}}` (la regla de las 2 horas) y `SESSION_STUDENT_CONFLICT` usa `{{students}}` (cantidad, sin nombres). `SESSION_NOT_CHANGEABLE` tiene un texto por motivo en claves `errors.SESSION_NOT_CHANGEABLE_<PAST|CANCELLED|NOT_CANCELLED|CANCELLED_BY_OTHER>` ("La sesión ya pasó.", "La sesión ya está cancelada.", "La sesión no está cancelada.", "Solo puedes reactivar sesiones que cancelaste tú, no las de festivo." y sus equivalentes en inglés) y `errorMessage` elige la clave con `error.details.reason`. `SESSION_RESCHEDULE_INVALID_DATE` tiene un texto por motivo en claves `errors.SESSION_RESCHEDULE_INVALID_DATE_<NO_CHANGE|PAST|OUT_OF_WEEK|OUT_OF_PERIOD|HOLIDAY>` (el `HOLIDAY` usa `{{date}}`) y `errorMessage` elige la clave con `error.details.reason`. En `errorMessage` agregar los parámetros `students` (de `details.students`, 0 si falta) y `date` (de `details.date`). Reutiliza los textos existentes de `MODULE_ROOM_CONFLICT`, `MODULE_TEACHER_CONFLICT` y `MODULE_SCHEDULE_OUT_OF_HOURS`. Ampliar `src/api/__tests__/errors.test.ts`
- [X] T004 [P] Agregar a `tutorias_uts_mobile/src/icons/registry.ts` un ícono del set `solar` (variantes `linear` y `bold`) llamado `reschedule` (candidatos: `solar:calendar-add`, `solar:restart-circle`; verificar con `curl https://api.iconify.design/solar.json?icons=<nombre>-linear,<nombre>-bold` que existe antes de agregarlo). Reutilizar `session`, `schedule`, `clock`, `unenroll`, `restart`, `location`, `teacher` y `building` que ya existen

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Esquema, reglas puras, consultas de disponibilidad, bloqueos, esqueleto del módulo y utilidades de prueba que todas las historias necesitan.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase.

- [X] T005 En `tutorias_uts_db/prisma/schema.prisma` agregar `TEACHER` al enum `SessionCancelReason` (queda `HOLIDAY`, `TEACHER`) y `SESSION_RESCHEDULED`, `SESSION_CANCELLED_TEACHER` y `SESSION_RESTORED_TEACHER` al enum `OutboxEventType`; en `ModuleSession` agregar los índices `@@index([roomId, startsAt])` y `@@index([teacherId, startsAt])`. Sin columnas ni tablas nuevas. Luego `npm run prisma:generate` en `tutorias_uts_back` (el script sincroniza el esquema y genera el cliente)
- [X] T006 Crear la migración `tutorias_uts_db/prisma/migrations/<timestamp>_add_teacher_session_changes/migration.sql` con `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` (si `migrate dev` pide reiniciar la base por la migración 006 editada, **no reiniciar**: usar `migrate diff` y `migrate deploy`). `ALTER TYPE … ADD VALUE` no se usa en la misma transacción que lo añade, y ninguna fila nueva usa `TEACHER` dentro de la migración. Aplicar con `migrate deploy` en la base de desarrollo y en la de prueba (`DATABASE_URL` de `TEST_DATABASE_URL`) y comprobar con `migrate diff` que no propone eliminar índices ni restricciones parciales (depende de T005)
- [X] T007 [P] Crear `tutorias_uts_back/src/teacher-sessions/teacher-sessions.rules.ts` con funciones puras: `canChangeSession(startsAt, now, leadMinutes)` (verdadero si `startsAt − now >= leadMinutes`; 120 minutos exactos se permiten, 119 no), `bogotaWeek(instant)` (inicio incluido y fin excluido de la semana de lunes a domingo en `America/Bogota`, en UTC; reutiliza `bogotaCalendarDay`, `bogotaToUtc` e `isoWeekday` de `src/common/clock.ts` y `src/modules/sessions.rules.ts`), `validateReschedule({ currentStart, newStart, now, periodStartsOn, periodEndsOn, holidayDays, earliestMinute, latestMinute, durationMs })` que devuelve `null` o el primer motivo `{ reason: 'NO_CHANGE' | 'PAST' | 'OUT_OF_WEEK' | 'OUT_OF_PERIOD' | 'HOLIDAY', date? }` en ese orden y `null`/`MODULE_SCHEDULE_OUT_OF_HOURS` por separado (empieza desde `earliestMinute` y termina hasta `latestMinute`, hora de Bogotá, terminar a las 18:00 en punto se permite), `shiftSession(startsAt, endsAt, deltaMs)` y `sessionChangeActions({ mine, readOnly, status, cancelReason, startsAt, now, leadMinutes })` que devuelve `{ canReschedule, canCancel, canRestore, blockReason }` con `blockReason` `PERIOD_CLOSED`, `PAST`, `WINDOW_PASSED` o `CANCELLED_BY_OTHER` (una sesión cancelada por festivo; la cancelada por el docente solo ofrece reactivar). Pruebas en `teacher-sessions.rules.spec.ts`: 119, 120 y 121 minutos; semana de lunes a domingo con un domingo y un lunes de borde; festivo; fuera de periodo; fin a las 18:00 y a las 18:15; desplazamiento exacto y duración conservada
- [X] T008 [P] Crear `tutorias_uts_back/src/teacher-sessions/teacher-sessions.events.ts` con los constructores puros de la carga útil de cada evento (`rescheduledPayload`, `cancelledPayload`, `restoredPayload`), con `scope` y `sessions` de `data-model.md` (`from` y `to` en ISO UTC) y que solo acepten ids, fechas y alcance (nunca datos de estudiantes). Pruebas en `teacher-sessions.events.spec.ts`
- [X] T009 Crear `tutorias_uts_back/src/teacher-sessions/session-availability.ts` con (a) `findResourceConflict(db, { roomId, teacherId, startsAt, endsAt, ignoreSessionIds })`: otra sesión `SCHEDULED` o `RESCHEDULED`, no borrada, con `starts_at < endsAt` y `ends_at > startsAt` del mismo `room_id` o del mismo `teacher_id` (excluyendo las movidas), con el nombre del módulo, el día y las horas locales; devuelve `{ kind: 'room' | 'teacher', conflict: { moduleName, dayOfWeek, startTime, endTime } } | null` y mira primero el docente y luego el salón (como `assertFree` de la spec 010), y (b) `countStudentConflicts(db, { sessionId, moduleId, startsAt, endsAt, now })`: cantidad (`COUNT(DISTINCT student_id)`) de asistentes de esa sesión (mismo predicado de `src/enrollments/seats.ts`: inscripción vigente, cuenta `ACTIVE` y sin borrar, sin ausencia viva) que asisten a otra sesión `SCHEDULED` o `RESCHEDULED` de otro módulo cuyo intervalo se solape con el nuevo. Extraer el predicado de asistentes de `seats.ts` a una función o fragmento compartido sin cambiar su comportamiento (las pruebas de la spec 011 deben seguir en verde) (depende de T005 y T006)
- [X] T010 Agregar a `tutorias_uts_back/src/modules/locks.ts` `lockRoomsAndTeachers(tx, roomIds, teacherIds)`: bloquea con `SELECT id FROM rooms WHERE id = ANY(...) ORDER BY id FOR UPDATE` y luego los docentes con `SELECT id FROM users WHERE id = ANY(...) ORDER BY id FOR UPDATE` (orden fijo del plan: periodo → módulo → salones → docentes). Sin cambiar `lockModule` ni `lockWritablePeriod`
- [X] T011 [P] Hacer que los festivos respeten las sesiones reprogramadas en `tutorias_uts_back/src/holidays/holidays.service.ts`: `cancelSessions` incluye las sesiones `SCHEDULED` y `RESCHEDULED` del día del festivo (hoy solo `SCHEDULED`, y una reprogramada quedaría dictándose en un festivo), y `restore` devuelve cada sesión como `SCHEDULED` o `RESCHEDULED` según `startsAt` contra `originalStartsAt` (hoy siempre `SCHEDULED`, y perdería su estado). Las canceladas por el docente (`cancelReason` `TEACHER`) no se tocan en ninguno de los dos sentidos. Pruebas en `tutorias_uts_back/test/holidays.e2e-spec.ts`: un festivo registrado sobre una sesión reprogramada la cancela con motivo festivo; al quitarlo vuelve `RESCHEDULED` con su hora; una sesión cancelada por el docente no cambia con ninguno de los dos; las pruebas de la spec 010 siguen en verde (depende de T005)
- [X] T012 [P] Agregar a `tutorias_uts_back/test/utils/factories.ts` o a un archivo nuevo `tutorias_uts_back/test/utils/teacher.ts` `loginTeacher(ctx)` (docente con token), `teacherApi(ctx, teacher)` con `modules(query)`, `sessions(query)`, `reschedule(id, body)`, `cancel(id, body)` y `restore(id, body)`, y `teacherModule(ctx, periodId, { teacher, hoursAhead, slot, capacity })` que arma un módulo con sesiones del docente, siguiendo el estilo de `test/utils/enrollment.ts` (`moduleWithSessions` ya acepta `teacherId`) (depende de T005)
- [X] T013 Crear el esqueleto `tutorias_uts_back/src/teacher-sessions/teacher-sessions.module.ts` (importa `PeriodsModule` y `OutboxModule`; provee `TeacherSessionsService` y `TeacherScheduleService`; controlador `TeacherSessionsController` con `@Roles('TEACHER')` a nivel de clase y prefijo `teacher`), con clases vacías `@Injectable()` y registrarlo en `src/app.module.ts`. Sin rutas todavía; la aplicación debe arrancar (depende de T010)
- [X] T014 [P] Agregar a `tutorias_uts_mobile/src/api/types.ts` los tipos del contrato `teacher-sessions-api.yaml`: `TeacherSession`, `TeacherModule`, `TeacherSessionPage`, `TeacherModulePage`, `SessionScope` (`'SESSION' | 'SERIES'`) y `SessionChange`, con `cancelReason` `'HOLIDAY' | 'TEACHER' | null`; ampliar también `cancelReason` de `StudentSession` a `'HOLIDAY' | 'TEACHER' | null`
- [X] T015 [P] Convertir la pestaña del docente en carpeta: mover `tutorias_uts_mobile/app/(teacher)/schedule.tsx` a `app/(teacher)/schedule/index.tsx` (sigue mostrando `EmptyTabScreen` hasta la historia 1) y crear `app/(teacher)/schedule/_layout.tsx` (Stack sin encabezado, como `app/(student)/modules/_layout.tsx`); comprobar que `app/(teacher)/_layout.tsx` sigue resolviendo la pestaña `schedule` y que las pruebas de navegación existentes pasan (ajustar `src/features/auth/__tests__/config-access.test.tsx` solo si fija que `schedule` no existe como carpeta)

**Checkpoint**: esquema migrado, reglas puras probadas, consultas de disponibilidad y esqueletos listos.

---

## Phase 3: User Story 1 - Ver mis módulos y sesiones (Priority: P1) 🎯 MVP

**Goal**: el docente ve sus módulos del periodo Activo con inscritos y sus próximas sesiones con estado, salón y asistentes, y sabe qué puede hacer con cada una.

**Independent Test**: con un docente que dicta dos módulos, uno con estudiantes inscritos, comprobar que ve solo sus módulos y sesiones, el conteo de inscritos, las sesiones canceladas con su motivo y que no ve los de otro docente.

### Tests for User Story 1 ⚠️

> Escribirlas primero y comprobar que fallan antes de implementar.

- [X] T016 [P] [US1] Prueba e2e de `GET /teacher/modules` y `GET /teacher/sessions` en `tutorias_uts_back/test/teacher-sessions.e2e-spec.ts` (con `ctx.clock.freezeAt` cuando importe la hora): solo los módulos y sesiones del docente del token (los de otro docente no aparecen y su id en `moduleId` responde página vacía), solo el periodo Activo en módulos (`meta.periodId` nulo sin periodo activo), `enrolled` real (spec 011), `capacity`, `schedules`, `nextSession`, `readOnly` en un periodo Cerrado, sesiones ordenadas por inicio y futuras por defecto, filtros `moduleId`, `from` y `to` (días de Bogotá inclusivos) y paginación, un `from` anterior a hoy devuelve solo sesiones futuras (nunca pasadas con 0 asistentes), `attendees` (solo cantidad) que baja con ausencias de estudiantes y no incluye a cuentas desactivadas, sesiones canceladas por festivo y por el docente con su `cancelReason`, la sesión de un docente reasignado por el CAE (D-086) muestra el docente y salón con que se dicta, `canReschedule`, `canCancel`, `canRestore` y `blockReason` (`WINDOW_PASSED` a 119 minutos, `PERIOD_CLOSED`, `CANCELLED_BY_OTHER` para festivo), `meta.changeLeadMinutes`, `400` para fechas mal formadas, y que la respuesta nunca contiene ids ni correos de estudiantes
- [X] T017 [P] [US1] Pruebas de la app en `tutorias_uts_mobile/src/features/teacher-sessions/__tests__/schedule.test.tsx` (mock de `@/api/client` y `expo-router`, como en `src/features/enrollments/__tests__/`; un solo `render` por prueba): lista los módulos con salón, horario e inscritos y las sesiones agrupadas por día (fecha y hora de Bogotá), distingue las canceladas con su motivo ("festivo" o "docente"), filtra por módulo con `FilterChips`, estado vacío ("sin sesiones"), error con reintento y carga, un periodo Cerrado se ve sin acciones, tocar una sesión abre la hoja de acciones, sin textos fijos (paridad es/en)

### Implementation for User Story 1

- [X] T018 [P] [US1] Crear `tutorias_uts_back/src/teacher-sessions/dto/teacher-sessions.dto.ts` con `TeacherModulesQueryDto` (`page`, `limit` como en `src/common/page-query.ts`) y `TeacherSessionsQueryDto` (`moduleId` UUID opcional, `from` y `to` `YYYY-MM-DD` opcionales con `Matches`, `page`, `limit`), con `whitelist` y `forbidNonWhitelisted` (los campos desconocidos responden `400 VALIDATION_FAILED`)
- [X] T019 [US1] Crear `tutorias_uts_back/src/teacher-sessions/teacher-schedule.service.ts` con `modules(teacherId, query)` y `sessions(teacherId, query)`: `modules` busca el periodo `ACTIVE` (vacío con `meta.periodId` nulo si no hay) y devuelve los módulos vivos cuyo `teacher_id` es el docente con sala y sede, horarios vivos, `enrolled` de `ConfigUsageService.countActiveEnrollments` y `nextSession`; `sessions` devuelve las sesiones no borradas con `teacher_id` igual al docente y módulo vivo, solo futuras: desde ahora, o desde `from` si es posterior a ahora (un `from` anterior se ajusta a ahora), hasta `to`, ordenadas por `starts_at`, con módulo, salón y sede de la sesión, `attendees` con `sessionSeats` de la spec 011 (0 para las canceladas) y las acciones con `sessionChangeActions` de T007; todo en bloque, sin una consulta por sesión; solo cantidades, nunca datos de estudiantes (depende de T007 y T013)
- [X] T020 [US1] Agregar a `tutorias_uts_back/src/teacher-sessions/teacher-sessions.controller.ts` `GET /teacher/modules` y `GET /teacher/sessions`, con el `userId` del token como docente (nunca de un parámetro) y los códigos del contrato. Documentar con `@nestjs/swagger` como en `modules.controller.ts`
- [X] T021 [P] [US1] Crear `tutorias_uts_mobile/src/features/teacher-sessions/hooks/useTeacherSessions.ts` con `useTeacherModules()` (clave `['teacher','modules']`) y `useTeacherSessions(moduleId)` (clave `['teacher','sessions', moduleId]`, `limit=100`), siguiendo `src/features/enrollments/hooks/useStudentModules.ts`, y `useInvalidateTeacher()` que invalida ambas claves
- [X] T022 [P] [US1] Crear `tutorias_uts_mobile/src/features/teacher-sessions/components/TeacherSessionCard.tsx`: tarjeta con módulo, fecha y hora de Bogotá con `format.ts` de `src/features/modules/`, salón y sede, `attendees`, insignia de estado como texto más ícono (Programada, Reprogramada con la hora original, Cancelada por festivo, Cancelada por ti), objetivo táctil de 48 px y `accessibilityLabel` con módulo, fecha y estado
- [X] T023 [US1] Crear `tutorias_uts_mobile/src/features/teacher-sessions/screens/TeacherScheduleScreen.tsx` (contenido de `app/(teacher)/schedule/index.tsx`): título, tarjetas de módulo con inscritos y horario, `FilterChips` por módulo, sesiones agrupadas por día con `TeacherSessionCard`, los cuatro estados de pantalla (`BrandLoader`, `EmptyState`, error con reintento y contenido) y la apertura de la hoja de acciones (la agregan US2 y US3). Sin textos fijos (depende de T021 y T022)
- [X] T024 [US1] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos del cronograma (`teacher.schedule.*`: título, módulos, inscritos, sesiones, estados, "cancelada por ti", vacío, error y reintento), con las mismas claves y sin plurales solos (la prueba de paridad existente debe pasar)

**Checkpoint**: el docente ve sus módulos y sesiones de punta a punta; la historia 1 se prueba sola.

---

## Phase 4: User Story 2 - Reprogramar una sesión (Priority: P1)

**Goal**: reprogramar una sesión, o ella y las futuras de su horario semanal, hasta 2 horas antes, con disponibilidad de salón y docente, festivos, semana, horario permitido y cruces con los estudiantes.

**Independent Test**: reprogramar una sesión a una hora libre (se acepta y conserva la hora original), a una hora con el salón ocupado (se rechaza con el módulo), con una sesión a menos de 2 horas (se bloquea con la regla) y con un estudiante inscrito que ya tiene otra tutoría (se rechaza con la cantidad).

### Tests for User Story 2 ⚠️

- [X] T025 [P] [US2] Prueba e2e de `POST /teacher/sessions/{id}/reschedule` en `tutorias_uts_back/test/teacher-sessions-change.e2e-spec.ts` con `TestClock.freezeAt`: ventana de 121, 120 (se acepta) y 119 minutos (`409 SESSION_CHANGE_WINDOW_PASSED` con `details.minutes` 120) y sin cambios en la base; alcance `SESSION` cambia solo esa sesión y alcance `SERIES` mueve el mismo desplazamiento a las futuras del mismo horario semanal sin tocar las de otro horario del módulo ni las pasadas ni las canceladas; la sesión conserva `originalStartsAt`, queda `RESCHEDULED` y vuelve a `SCHEDULED` si se mueve a su hora original; conserva duración, salón y docente; `422 SESSION_RESCHEDULE_INVALID_DATE` con `details.reason` `NO_CHANGE`, `PAST`, `OUT_OF_WEEK` (domingo a lunes siguiente), `OUT_OF_PERIOD` y `HOLIDAY` (con `details.date`); `422 MODULE_SCHEDULE_OUT_OF_HOURS` (17:15 de una sesión de 2 horas) con `earliest` y `latest`, y terminar a las 18:00 se permite; `409 MODULE_ROOM_CONFLICT` y `409 MODULE_TEACHER_CONFLICT` con `details.conflict` (módulo, día y horas) y su borde (terminar cuando otra empieza se permite); `409 SESSION_STUDENT_CONFLICT` con `details.students` y la cantidad correcta cuando 2 de 3 inscritos tienen otra tutoría, sin que la respuesta contenga ids ni correos, sin contar a quien canceló esa sesión, a cuentas desactivadas ni inscripciones canceladas fuera de ventana; con `SERIES` un fallo de la tercera sesión revierte todo y `details.sessionId` la nombra; `dryRun: true` responde `200` con las nuevas horas sin escribir ni registrar eventos y con los mismos errores que al confirmar; `409 SESSION_NOT_CHANGEABLE` (`PAST`, `CANCELLED`); `409 PERIOD_CLOSED_READ_ONLY`; `404` para una sesión inexistente, borrada o de otro docente; `400 VALIDATION_FAILED` con `startsAt` mal formado, `scope` desconocido o campos desconocidos; los estudiantes inscritos ven la nueva hora en `GET /student/modules/{id}`
- [X] T026 [P] [US2] Prueba e2e de concurrencia en `tutorias_uts_back/test/teacher-sessions-concurrency.e2e-spec.ts`: dos docentes reprograman a la vez dos sesiones de módulos distintos al mismo salón y hora (solo una prospera y la otra recibe `MODULE_ROOM_CONFLICT`); un mismo docente reprograma a la vez dos de sus sesiones a la misma hora (solo una prospera); reprogramar y cancelar la misma sesión a la vez dejan un estado coherente (una sola prospera o ambas en orden, nunca `RESCHEDULED` con motivo `TEACHER`); una reprogramación y una inscripción al mismo módulo a la vez no dejan más asistentes que la capacidad
- [X] T027 [P] [US2] Pruebas de la app en `tutorias_uts_mobile/src/features/teacher-sessions/__tests__/reschedule.test.tsx`: la hoja de acciones ofrece "Solo esta sesión" y "Esta y las futuras" con la regla de las 2 horas visible; elegir fecha y hora llama a `POST .../reschedule` con `dryRun: true` y muestra el motivo traducido del rechazo (cruce de salón con el módulo, de docente, festivo con la fecha, otra semana, fuera de horario, estudiantes con la cantidad) sin enviar la confirmación; la confirmación llama sin `dryRun` con `scope` y `startsAt` en UTC y actualiza la lista; una sesión con `canReschedule` falso muestra el botón deshabilitado y `blockReason` traducido (`WINDOW_PASSED` con los minutos de `changeLeadMinutes`, `PERIOD_CLOSED`, `PAST`); los errores del servidor se muestran con su `code`; sin textos fijos (paridad es/en)

### Implementation for User Story 2

- [X] T028 [P] [US2] Agregar a `tutorias_uts_back/src/teacher-sessions/dto/teacher-sessions.dto.ts` `ScopeDto` (`scope` `IsIn(['SESSION','SERIES'])`) y `RescheduleDto` (`scope`, `startsAt` con `IsISO8601({ strict: true })` y `dryRun` opcional `IsBoolean`), con `whitelist` y `forbidNonWhitelisted`; y los DTO de parámetros de ruta (UUID)
- [X] T029 [US2] Crear `tutorias_uts_back/src/teacher-sessions/teacher-sessions.service.ts` con `reschedule(teacherId, sessionId, dto)`: buscar la sesión del docente (`teacher_id` = token, módulo vivo; si no, `404`); transacción con el orden de R-4 (`lockWritablePeriod` → `lockModule` → `lockRoomsAndTeachers`; con `dryRun` sin bloqueos de escritura ni eventos); `409 PERIOD_CLOSED_READ_ONLY` si el periodo está `CLOSED`; `SESSION_NOT_CHANGEABLE` (`PAST`, `CANCELLED`) y `SESSION_CHANGE_WINDOW_PASSED` (con `details.minutes` de `TEACHER_CHANGE_LEAD_MINUTES`, reloj de `Clock`, medido contra la primera sesión afectada); calcular las sesiones afectadas (`SESSION` la elegida; `SERIES` las futuras del mismo `schedule_id` con `starts_at` mayor o igual, no borradas y `SCHEDULED` o `RESCHEDULED`); por cada una `validateReschedule` (`422 SESSION_RESCHEDULE_INVALID_DATE` con `reason` y `date`), horario permitido con `MODULE_EARLIEST_MINUTE` y `MODULE_LATEST_MINUTE` de `Env` (`422 MODULE_SCHEDULE_OUT_OF_HOURS` con `earliest` y `latest`), `findResourceConflict` (`409 MODULE_TEACHER_CONFLICT` o `MODULE_ROOM_CONFLICT`) y `countStudentConflicts` (`409 SESSION_STUDENT_CONFLICT` con `details.students`); los errores de una serie llevan `details.sessionId`; escribir `startsAt`, `endsAt` y `status` (`RESCHEDULED`, o `SCHEDULED` si coincide con `originalStartsAt`) sin tocar `originalStartsAt`, y registrar **un** `SESSION_RESCHEDULED` con `OutboxService.record(tx, …)` y `rescheduledPayload` de T008 en la misma transacción; devolver el `SessionChange` (`sessions` con el estado resultante). Los errores de una serie revierten todo (depende de T007, T008, T009, T010, T013, T019 y T028)
- [X] T030 [US2] Agregar a `tutorias_uts_back/src/teacher-sessions/teacher-sessions.controller.ts` `POST /teacher/sessions/:id/reschedule` (`200`), con DTO de parámetros que validan UUID y el docente tomado del token. Documentar con `@nestjs/swagger`
- [X] T031 [P] [US2] Agregar a `tutorias_uts_mobile/src/features/teacher-sessions/hooks/useTeacherSessions.ts` `useRescheduleCheck()` (mutación `POST /teacher/sessions/{id}/reschedule` con `dryRun: true`, sin invalidar) y `useReschedule()` (la misma sin `dryRun`, invalida `['teacher']` y `['student','modules']`)
- [X] T032 [US2] Crear `tutorias_uts_mobile/src/features/teacher-sessions/components/SessionActionsSheet.tsx`: hoja inferior de una sesión con sus datos, la regla de las 2 horas (`{{minutes}}` de `changeLeadMinutes`) y las acciones; para Reprogramar: elección de alcance con `FilterChips` ("Solo esta sesión" y "Esta y las futuras"), fecha con `DateField` (`minDate` y `maxDate` con el lunes y el domingo de la semana de la sesión, en hora de Bogotá) y hora con `PickerSheet` en pasos de 15 minutos dentro de 06:00 y 18:00 (la lista de horas de `ScheduleEditor.tsx` se extrae a `src/features/modules/` para reutilizarla sin duplicarla); al elegir fecha y hora llama a `useRescheduleCheck` y muestra el motivo del rechazo traducido con `errorMessage` y `Banner`; el botón Confirmar queda deshabilitado mientras haya un rechazo, y con la acción bloqueada muestra la regla (`blockReason`); botones apilados con 16 px, ícono a la izquierda y objetivos de 48 px. Usar la hoja desde `TeacherScheduleScreen.tsx` (depende de T031 y T023)
- [X] T033 [US2] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos de la reprogramación (`teacher.reschedule.*`: alcance, fecha, hora, regla de las 2 horas, consulta de disponibilidad, confirmar, motivos de bloqueo `WINDOW_PASSED`, `PERIOD_CLOSED`, `PAST`), con paridad es/en

**Checkpoint**: US1 y US2 funcionan juntas; reprogramar se prueba de punta a punta.

---

## Phase 5: User Story 3 - Cancelar o reactivar una sesión (Priority: P1)

**Goal**: cancelar una sesión (o ella y las futuras de su horario) con el motivo "docente", reactivar lo que el docente canceló, y que estudiantes y CAE lo vean.

**Independent Test**: cancelar una sesión a más de 2 horas (queda cancelada con motivo "docente" y los estudiantes la ven así), reactivarla, intentar cancelar una a menos de 2 horas (se bloquea) y comprobar que una cancelada por festivo no se puede reactivar.

### Tests for User Story 3 ⚠️

- [X] T034 [P] [US3] Prueba e2e de `POST /teacher/sessions/{id}/cancel` y `.../restore` en `tutorias_uts_back/test/teacher-sessions-change.e2e-spec.ts` (bloque aparte, con `TestClock.freezeAt`): cancelar a 121, 120 y 119 minutos (`409 SESSION_CHANGE_WINDOW_PASSED`); `SESSION` cancela solo la elegida y `SERIES` cancela esa y las futuras del mismo horario sin tocar las ya canceladas por festivo ni las de otro horario; queda `CANCELLED` con `cancelReason` `TEACHER`, sin borrar filas, y la sesión deja de contar para el cupo y los cruces (`GET /student/modules/{id}` la muestra cancelada, sin acciones para el estudiante); `409 SESSION_NOT_CHANGEABLE` si ya estaba cancelada o ya pasó; `409 PERIOD_CLOSED_READ_ONLY`; reactivar a más de 2 horas vuelve a `SCHEDULED` (o `RESCHEDULED` si su hora cambió), y `409 SESSION_CHANGE_WINDOW_PASSED` a menos de 2 horas; reactivar con el salón o docente ocupado a esa hora (`MODULE_ROOM_CONFLICT`, `MODULE_TEACHER_CONFLICT`) y con un inscrito cruzado (`SESSION_STUDENT_CONFLICT`); reactivar una cancelada por festivo o una no cancelada (`409 SESSION_NOT_CHANGEABLE` con `details.reason` `CANCELLED_BY_OTHER` y `NOT_CANCELLED`); las ausencias e inscripciones no cambian; `404` para sesiones ajenas; el CAE ve `cancelReason` `TEACHER` en `GET /modules/{id}/sessions`; quitar un festivo no reactiva una cancelada por el docente y registrar un festivo no pisa su motivo
- [X] T035 [P] [US3] Pruebas de la app en `tutorias_uts_mobile/src/features/teacher-sessions/__tests__/cancel.test.tsx`: la hoja ofrece Cancelar con la elección de alcance y la regla de las 2 horas visible; cancelar pide confirmación con `ConfirmDialog` y llama a `POST .../cancel` con `scope`; una sesión cancelada por el docente ofrece "Reactivar" y llama a `POST .../restore`; una cancelada por festivo no ofrece acciones; los bloqueos muestran su regla traducida; los errores del servidor se muestran con su `code`; sin textos fijos (paridad es/en)
- [X] T036 [P] [US3] Pruebas de la app de las pantallas de los demás roles: en `tutorias_uts_mobile/src/features/enrollments/__tests__/cancel.test.tsx` agregar que una sesión con `cancelReason: 'TEACHER'` se ve como "Cancelada por el docente" sin acciones, y en `src/features/modules/__tests__/module-detail.test.tsx` (o el archivo que cubra la lista de sesiones del CAE) que la sesión cancelada por el docente muestra ese motivo

### Implementation for User Story 3

- [X] T037 [US3] Agregar a `tutorias_uts_back/src/teacher-sessions/teacher-sessions.service.ts` `cancel(teacherId, sessionId, dto)` y `restore(teacherId, sessionId, dto)`: misma búsqueda, transacción, bloqueos, ventana y alcance que `reschedule` (extraer lo común en funciones privadas sin duplicar la regla); `cancel` exige `SCHEDULED` o `RESCHEDULED` (`SESSION_NOT_CHANGEABLE` si no), pone `CANCELLED` con `cancel_reason` `TEACHER` y registra un `SESSION_CANCELLED_TEACHER`; `restore` exige `CANCELLED` con motivo `TEACHER` (`SESSION_NOT_CHANGEABLE` con `details.reason` `CANCELLED_BY_OTHER` o `NOT_CANCELLED`), vuelve a validar salón, docente (`findResourceConflict`) y estudiantes (`countStudentConflicts`) en su hora actual, la deja `SCHEDULED` o `RESCHEDULED` según `startsAt` contra `originalStartsAt`, y registra un `SESSION_RESTORED_TEACHER`; devuelven el `SessionChange` (depende de T029)
- [X] T038 [US3] Agregar a `tutorias_uts_back/src/teacher-sessions/teacher-sessions.controller.ts` `POST /teacher/sessions/:id/cancel` y `POST /teacher/sessions/:id/restore` (`200`), con `ScopeDto` y los parámetros validados
- [X] T039 [P] [US3] Agregar a `tutorias_uts_mobile/src/features/teacher-sessions/hooks/useTeacherSessions.ts` `useCancelSession()` y `useRestoreSession()`, que invalidan `['teacher']` y `['student','modules']`
- [X] T040 [US3] Agregar a `tutorias_uts_mobile/src/features/teacher-sessions/components/SessionActionsSheet.tsx` las acciones Cancelar y Reactivar: Cancelar con la elección de alcance y confirmación con `ConfirmDialog` antes de enviar; Reactivar solo si `canRestore`; una sesión cancelada por festivo muestra su motivo y ninguna acción; los bloqueos muestran `blockReason` traducido (depende de T039 y T032)
- [X] T041 [US3] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos de cancelar y reactivar (`teacher.cancel.*`: alcance, confirmación, "Reactivar", `CANCELLED_BY_OTHER`), con paridad es/en
- [X] T042 [US3] Mostrar "Cancelada por el docente" en las pantallas de los otros roles: en `tutorias_uts_mobile/src/features/enrollments/components/SessionRow.tsx` el motivo `TEACHER` (clave `student.cancel.session.TEACHER`) sin acciones; en `src/features/modules/components/SessionRow.tsx` (CAE) la clave `modules.session.teacher`; textos en `es.json` y `en.json` con paridad; actualizar los contratos `specs/011-student-enrollment/contracts/enrollments-api.yaml` y `specs/010-modules-sessions/contracts/modules-api.yaml` (`cancelReason` de `StudentSession` y de `Session` pasa a `[HOLIDAY, TEACHER, null]`) y comprobar que las pruebas de contrato `enrollments-contract` y `modules-contract` siguen en verde (depende de T014)

**Checkpoint**: US1, US2 y US3 funcionan juntas; docente, estudiante y CAE ven el mismo estado.

---

## Phase 6: User Story 4 - Eventos y límite configurable (Priority: P2)

**Goal**: cada acción aceptada deja exactamente un evento sin datos personales y ninguna rechazada deja nada; el límite de 2 horas sale de la configuración.

**Independent Test**: reprogramar, cancelar y reactivar sesiones y comprobar un evento por acción con la carga esperada; provocar rechazos y comprobar que no queda ningún evento ni cambio parcial; cambiar el límite y comprobar que se respeta.

### Tests for User Story 4 ⚠️

- [X] T043 [P] [US4] Prueba e2e en `tutorias_uts_back/test/teacher-sessions-events.e2e-spec.ts`: cada reprogramación, cancelación y reactivación aceptada deja exactamente un `outbox_events` (`SESSION_RESCHEDULED`, `SESSION_CANCELLED_TEACHER`, `SESSION_RESTORED_TEACHER`) con `moduleId` y la carga de `data-model.md` (`scope`, y `sessions` con `sessionId`, `from` y `to` ISO UTC; una serie de 4 sesiones deja un solo evento con 4 sesiones), sin ids ni correos de estudiantes; una acción rechazada (fuera de plazo, cruce, festivo, periodo Cerrado, error a mitad de una serie) no deja evento ni cambio; `dryRun` no deja evento; un reintento tras un rechazo no duplica el evento; con `TEACHER_CHANGE_LEAD_MINUTES` distinto de 120 (`ctx` con `ConfigService` ajustado o una prueba unitaria de `canChangeSession` con ese valor) el límite se respeta sin tocar código

### Implementation for User Story 4

- [X] T044 [US4] Comprobar en `tutorias_uts_back/src/teacher-sessions/teacher-sessions.service.ts` que cada acción registra el evento con `OutboxService.record(tx, …)` dentro de la misma transacción que el cambio y después de pasar todas las validaciones, y que el límite se lee solo de `ConfigService` (`TEACHER_CHANGE_LEAD_MINUTES`) y nunca de un valor fijo; si algún lugar escribe el evento fuera de la transacción o calcula el límite aparte, unificarlo. Dejar la prueba de T043 como evidencia

**Checkpoint**: las cuatro historias funcionan; los eventos quedan listos para la spec 013.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Roles, contrato, documentación y cierre.

- [X] T045 [P] Prueba e2e de roles en `tutorias_uts_back/test/teacher-sessions-roles.e2e-spec.ts` (mismo patrón de `test/enrollments-roles.e2e-spec.ts`): la lista de endpoints sale de `contracts/teacher-sessions-api.yaml` con `loadContract` y `specPath('012-teacher-sessions/contracts/teacher-sessions-api.yaml')`, para que uno nuevo no escape; `403 FORBIDDEN_ROLE` para estudiante y para CAE sin cambiar nada en las tablas (`module_sessions`, `outbox_events`), `401` sin token, y el docente pasa (la respuesta es de negocio, nunca `401` ni `403`); un docente que pide una sesión de otro recibe `404` y no la modifica
- [X] T046 [P] Prueba de contrato en `tutorias_uts_back/test/teacher-sessions-contract.e2e-spec.ts` (mismo patrón de `test/enrollments-contract.e2e-spec.ts`): las respuestas reales de los cinco endpoints cumplen `teacher-sessions-api.yaml` (`TeacherModulePage`, `TeacherSessionPage`, `SessionChange`, `Error`) y cada código HTTP está documentado en el contrato
- [X] T047 [P] Actualizar `docs/Architecture.md` §5 (nota de `ModuleSession`: `cancelReason` `TEACHER` y los tipos nuevos de `OutboxEvent`) y §6 (las filas "Cambio o cancelación del docente" con `TEACHER_CHANGE_LEAD_MINUTES`, alcance elegido y cruces con estudiantes, y "Sin cruces de salón ni docente" también por sesión); `docs/Context.md` §4.2 (el docente cambia o cancela una sesión o ella y las futuras de su horario, y reactiva lo que canceló) y §10 (cerrar la pregunta de cruces con los estudiantes); `docs/Design.md` (pantalla del cronograma del docente y la hoja de acciones por sesión, con las reglas visibles). Los archivos con terminaciones CRLF conservan CRLF
- [X] T048 [P] Registrar en `docs/Decisions.md` (CRLF): ajustar D-069 (el docente elige el alcance; "futuras" son las de su horario semanal) y dejar la nota de que reemplaza "siempre ella y las futuras"; D-093 Cruces con estudiantes inscritos (se rechaza, solo cantidad); D-094 Reprogramación solo dentro de la misma semana; D-095 El docente puede reactivar lo que canceló (mientras falten 2 horas o más); D-096 Disponibilidad por sesión y orden de bloqueo (periodo → módulo → salones → docentes), con el límite conocido de que los cruces del CAE y de la inscripción miran el horario semanal; en D-087 anotar que la 012 deja los tres tipos de evento nuevos y que sigue vigente la condición de no publicar sin la spec 013
- [X] T049 Verificar que ningún componente nuevo contiene textos fijos, colores hexadecimales, nombres de fuente ni íconos fuera del registro (pruebas existentes en `tutorias_uts_mobile/src/__tests__/`), que `es.json` y `en.json` tienen las mismas claves, y revisar objetivos de 48 px, ícono a la izquierda en cada botón, 16 px entre botones apilados, los cuatro estados de pantalla en cada pantalla nueva, modo oscuro (bordes visibles), fuente grande y "reducir movimiento" (depende de las historias de la app)
- [X] T050 Ejecutar todas las verificaciones de `quickstart.md`: `npm run test`, `npm run test:e2e` y `npm run lint` en `tutorias_uts_back`; `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; `npx prisma migrate diff` sin cambios en `tutorias_uts_db`. Correr cada comando solo (sin otros procesos en paralelo)
- [ ] T051 Recorrer `specs/012-teacher-sessions/quickstart.md` de punta a punta en español e inglés, con modo oscuro, fuente grande y "reducir movimiento", incluida la medición de SC-001 y la comprensión de los bloqueos (SC-008), y anotar los resultados con fecha en la sección "Resultados". Si hay íconos nuevos, reiniciar Metro con `npx expo start -c`
- [ ] T052 Ejecutar la skill `feature-done-check`, atender sus observaciones, marcar `Status` de la spec como implementada y abrir los Pull Requests de los cuatro repositorios solo con la autorización del equipo. En la descripción de cada PR dejar escrita la condición de D-087: la funcionalidad no se publica en producción sin la spec 013 o sin un consumidor del outbox

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T001 a T004 en paralelo.
- **Foundational (Phase 2)**: depende de Setup; T005 → T006 → T009; T007, T008, T011, T012, T014 y T015 en paralelo con ellos; T010 antes de T013. Bloquea todas las historias.
- **US1 (Phase 3)**: depende de Foundational. Las pruebas T016 y T017 van primero y se escriben antes de T018 a T024.
- **US2 (Phase 4)**: depende de US1 (necesita la lista y la hoja de acciones); comparte `teacher-sessions.service.ts`, `teacher-sessions.controller.ts` y `SessionActionsSheet.tsx`.
- **US3 (Phase 5)**: depende de US2 (reutiliza la transacción, el alcance y la hoja); T042 solo depende de Foundational y puede hacerse en paralelo con US2.
- **US4 (Phase 6)**: depende de US2 y US3 (los eventos se registran en sus servicios).
- **Polish (Phase 7)**: depende de todas las historias; T045 a T048 en paralelo.

### Within Each User Story

- Pruebas primero y deben fallar antes de implementar.
- Orden en el backend: DTO → servicio → controlador. Orden en la app: tipos y hooks → componentes → pantalla → textos.
- Los archivos compartidos (`teacher-sessions.service.ts`, `teacher-sessions.controller.ts`, `SessionActionsSheet.tsx`, `es.json` y `en.json`) se editan en secuencia, no en paralelo.

### Parallel Opportunities

- Setup: T001, T002, T003 y T004.
- Foundational: T007, T008, T011, T012, T014 y T015 mientras corre T005 → T006 → T009.
- US1: T016 y T017 (pruebas), y T021 con T022 (hooks y tarjeta) mientras se escribe el backend.
- US2: T025, T026 y T027 (pruebas), y T028 con T031.
- US3: T034, T035 y T036 (pruebas), y T039.
- Polish: T045, T046, T047 y T048.

## Parallel Example: User Story 2

```text
Task: "T025 reprogramar en tutorias_uts_back/test/teacher-sessions-change.e2e-spec.ts"
Task: "T026 concurrencia en tutorias_uts_back/test/teacher-sessions-concurrency.e2e-spec.ts"
Task: "T027 pruebas de la app en tutorias_uts_mobile/src/features/teacher-sessions/__tests__/reschedule.test.tsx"
Task: "T028 DTO de reprogramación en tutorias_uts_back/src/teacher-sessions/dto/teacher-sessions.dto.ts"
```

## Implementation Strategy

### MVP First

1. Completar Setup y Foundational.
2. US1: el docente ve sus módulos y sesiones. Validar sola.
3. US2: reprogramar, la acción que más pide el docente.
4. Detenerse y validar el ciclo ver y reprogramar antes de seguir.

### Incremental Delivery

1. US1 → US2 → US3 (cancelar y reactivar, con lo que ven estudiantes y CAE) → US4 (verificación de eventos y límite).
2. Cada historia se valida con sus pruebas antes de pasar a la siguiente; el quickstart se recorre al final.

## Notes

- [P] = archivos distintos y sin dependencias pendientes.
- La etiqueta [Story] relaciona cada tarea con su historia para dar trazabilidad.
- Esta funcionalidad no envía notificaciones; solo deja los eventos (D-087).
- Hacer commit por grupo lógico, con Conventional Commits en inglés.
