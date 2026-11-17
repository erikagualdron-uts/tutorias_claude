---

description: "Task list for Inscripción de estudiantes a módulos"
---

# Tasks: Inscripción de estudiantes a módulos

**Input**: Design documents from `/specs/011-student-enrollment/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/enrollments-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principio V) y `docs/Conventions.md` §6 exigen pruebas de cupo (incluida la concurrencia), cruces de horario, ventana de cancelación y roles (`403`). Escribirlas primero y comprobar que fallan antes de implementar (skill `business-rule-tests`).

**Organization**: Tareas agrupadas por historia de usuario. Las historias P1 (US1, US2) van primero; US3 y US4 (P2) después.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 inscribirse, US2 cancelar y reinscribirse, US3 mis tutorías, US4 inscritos reales en la gestión del CAE
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma, migraciones y `seed.ts` (el esquema se edita solo aquí)
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas en `src/features/<feature>/__tests__/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí (la base de datos de prueba es compartida)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Configuración, códigos de error e íconos. Sin dependencias nuevas.

- [ ] T001 [P] Agregar a `tutorias_uts_back/src/config/env.ts` (interfaz `Env` y `validateEnv`) y a `.env.example` la variable `STUDENT_CANCEL_LEAD_MINUTES` (por defecto `60`, entero positivo; si no lo es, `validateEnv` lanza `STUDENT_CANCEL_LEAD_MINUTES must be a positive integer`). Prueba unitaria del valor por defecto y de los rechazos (`0`, `-5`, `abc`, `1.5`) en el spec existente de `env`, o uno nuevo `tutorias_uts_back/src/config/env.spec.ts` si no lo hay
- [ ] T002 [P] Agregar al catálogo de `tutorias_uts_back/src/common/errors/app.exception.ts` los códigos `ENROLLMENT_MODULE_FULL`, `ENROLLMENT_SCHEDULE_CONFLICT`, `ENROLLMENT_ALREADY_ACTIVE`, `ENROLLMENT_MODULE_UNAVAILABLE`, `ENROLLMENT_PERIOD_NOT_OPEN`, `ENROLLMENT_NOT_ACTIVE`, `ENROLLMENT_CANCEL_WINDOW_PASSED` y `ENROLLMENT_SESSION_NOT_CANCELLABLE` (junto a los de las specs 001, 006 y 010) y actualizar el comentario del encabezado con la spec 011
- [ ] T003 [P] Agregar esos ocho códigos a `ERROR_CODES` de `tutorias_uts_mobile/src/api/errors.ts` y sus textos `errors.<CODE>` a `src/i18n/es.json` y `en.json`, cada uno con la regla que bloquea (`ENROLLMENT_MODULE_FULL`: el módulo no tiene lugar en alguna sesión; `ENROLLMENT_SCHEDULE_CONFLICT`: usa `{{module}}`, `{{day}}`, `{{start}}` y `{{end}}` como los de la spec 010; `ENROLLMENT_CANCEL_WINDOW_PASSED`: usa `{{minutes}}`). En `errorMessage` agregar el parámetro `minutes` tomado de `error.details?.minutes` (número, 0 si falta). Ampliar `src/api/__tests__/errors.test.ts`
- [ ] T004 [P] Agregar a `tutorias_uts_mobile/src/icons/registry.ts` los íconos del set `solar` (variantes `linear` y `bold`) para: inscribirse (`enroll`), cancelar inscripción (`unenroll`), sesión cancelada por el estudiante (`absent`), módulo lleno (`full`) y reactivar (`restore`). Verificar con `curl https://api.iconify.design/solar.json?icons=<nombre>` que cada nombre existe antes de agregarlo (candidatos: `solar:user-check-rounded`, `solar:user-cross-rounded`, `solar:calendar-minimalistic`, `solar:lock`, `solar:restart`); reutilizar `teacher`, `clock`, `location`, `session` y `schedule` que ya existen

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Esquema, reglas puras, servicios compartidos y utilidades de prueba que todas las historias necesitan.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase.

- [ ] T005 En `tutorias_uts_db/prisma/schema.prisma` agregar el enum `EnrollmentStatus` (`ACTIVE`, `CANCELLED`) y los modelos `Enrollment` (`enrollments`) y `SessionAbsence` (`session_absences`) de `data-model.md`, con `@@map`, `@map` en `snake_case`, `id` UUID, `createdAt`, `updatedAt` y `deletedAt`: `Enrollment`: `studentId` (FK `users`), `moduleId` (FK `modules`), `status` (por defecto `ACTIVE`), `cancelledAt` nulo, `effectiveUntil` nulo, índices `(module_id, status)` y `(student_id, status)`; `SessionAbsence`: `enrollmentId` (FK `enrollments`), `sessionId` (FK `module_sessions`), índice `(session_id)`. Agregar las relaciones inversas en `User` (`enrollments`), `Module` (`enrollments`) y `ModuleSession` (`absences`). Luego `npx prisma generate` en `tutorias_uts_db` y en `tutorias_uts_back`
- [ ] T006 Crear la migración `tutorias_uts_db/prisma/migrations/<timestamp>_add_enrollments/migration.sql` con `npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script` (si `migrate dev` pide reiniciar la base por la migración 006 editada, **no reiniciar**: usar `migrate diff` y `migrate deploy`) y agregar a mano: `CREATE UNIQUE INDEX enrollments_one_active ON enrollments (student_id, module_id) WHERE status = 'ACTIVE' AND deleted_at IS NULL`; `ALTER TABLE enrollments ADD CONSTRAINT enrollments_status_dates CHECK ((status = 'ACTIVE' AND cancelled_at IS NULL AND effective_until IS NULL) OR (status = 'CANCELLED' AND cancelled_at IS NOT NULL AND effective_until IS NOT NULL AND effective_until >= cancelled_at))`; `CREATE UNIQUE INDEX session_absences_one_live ON session_absences (enrollment_id, session_id) WHERE deleted_at IS NULL`. Aplicar con `migrate deploy` en la base de desarrollo y la de prueba, y comprobar con `migrate diff` que no propone eliminar los índices parciales (depende de T005)
- [ ] T007 [P] Crear `tutorias_uts_back/src/enrollments/enrollments.rules.ts` con funciones puras: `canCancelSession(startsAt, now, leadMinutes)` (verdadero si `startsAt − now >= leadMinutes`; 60 minutos exactos se permiten, 59 no), `effectiveUntil(now, leadMinutes)` y `findStudentConflict(target, mine)` (devuelve el primer horario propio del mismo día que se solape con uno del módulo destino, semiabierto `[)`: terminar cuando otro empieza no se solapa; reutiliza `rangesOverlap` y `Slot` de `src/modules/sessions.rules.ts`). Pruebas en `enrollments.rules.spec.ts`: 59, 60 y 61 minutos; borde `[)`; sin cruce en días distintos; `effectiveUntil` suma exactamente los minutos configurados
- [ ] T008 Crear `tutorias_uts_back/src/enrollments/seats.ts` con el cálculo compartido de R-1: dado un `Prisma.TransactionClient` o `PrismaService`, una lista de módulos y la hora actual, devuelve por sesión futura (`starts_at > now`, `deleted_at IS NULL`, estado `SCHEDULED` o `RESCHEDULED`) la capacidad del salón de la sesión (`module_sessions.room_id`), los asistentes y los lugares libres. Asistentes = `COUNT(DISTINCT student_id)` de inscripciones del módulo no borradas, de estudiantes con `users.status = 'ACTIVE'` y `deleted_at IS NULL`, con `status = 'ACTIVE'` o (`status = 'CANCELLED'` y `session.starts_at < effective_until`), sin una `session_absences` con `deleted_at IS NULL` para esa sesión. Exporta además `moduleSeats(...)`: mínimo de lugares libres por módulo, nunca negativo, y `null` si no hay sesiones futuras. Una sola consulta agrupada, sin una consulta por módulo (depende de T005 y T006)
- [ ] T009 Reemplazar en `tutorias_uts_back/src/config-usage/config-usage.service.ts` el cero de `countActiveEnrollments(moduleId)` por el conteo de inscripciones `ACTIVE`, no borradas, de estudiantes `ACTIVE` y sin borrar (`prisma.enrollment.count`), y `maxEnrolled` de la regla de salones de la spec 006 por el máximo de ese conteo entre los módulos vivos del salón en periodos no cerrados, y en `RoomsService.update` (spec 006), dentro de la transacción, bloquear con `FOR UPDATE` los módulos vivos del salón, ordenados por `id`, antes de leer `maxEnrolled` (así la lectura y una inscripción se serializan por el mismo bloqueo); quitar el comentario "Zero until the enrollment feature exists". Ajustar `FakeConfigUsage` en `tutorias_uts_back/test/utils/test-app.ts` para que `countActiveEnrollments` delegue en el servicio real salvo que la prueba fije un valor, y confirmar que las pruebas de las specs 006 y 010 siguen pasando (depende de T005 y T006)
- [ ] T010 [P] Agregar a `tutorias_uts_back/test/utils/factories.ts` `createStudent` (usuario `STUDENT` con `StudentProfile` de nombres y apellidos), `createEnrollment(prisma, { studentId, moduleId, status, cancelledAt, effectiveUntil })` y `createAbsence(prisma, { enrollmentId, sessionId, deletedAt })`, siguiendo el estilo de `createModule` y `createSession` (depende de T005)
- [ ] T011 Crear el esqueleto `tutorias_uts_back/src/enrollments/enrollments.module.ts` (importa `PeriodsModule`; provee `EnrollmentsService` y `OfferService`; controlador `EnrollmentsController` con `@Roles('STUDENT')` a nivel de clase y prefijo `student`), registrarlo en `src/app.module.ts` y exportar de `ModulesModule` lo que se reutilice (crear `tutorias_uts_back/src/modules/locks.ts` con `lockWritablePeriod(tx, periodId)` y `lockModule(tx, id, periodId)`, que `ModulesService` y `EnrollmentsService` usan, sin cambiar su comportamiento ni duplicar el bloqueo; las pruebas de la spec 010 deben seguir en verde). Sin rutas todavía; la aplicación debe arrancar (depende de T008)
- [ ] T012 [P] Agregar a `tutorias_uts_mobile/src/api/types.ts` los tipos del contrato `enrollments-api.yaml`: `StudentModule`, `StudentModuleDetail`, `StudentSession`, `Enrollment`, `EnrollmentItem`, `Conflict`, `EnrollmentRef` y las páginas, con `state` y `blockReason` como uniones de cadenas
- [ ] T013 [P] Convertir la pestaña del estudiante en carpeta: mover `tutorias_uts_mobile/app/(student)/modules.tsx` a `app/(student)/modules/index.tsx` (sigue mostrando `EmptyTabScreen` hasta la historia 1), crear `app/(student)/modules/_layout.tsx` (Stack con el `AppBar`, igual que `app/(admin)/modules/_layout.tsx`) y `app/(student)/modules/[id].tsx` con un marcador; comprobar que `app/(student)/_layout.tsx` sigue resolviendo la pestaña `modules` y que las pruebas de navegación existentes pasan

**Checkpoint**: esquema migrado, reglas puras probadas, conteo real de inscritos y esqueletos listos.

---

## Phase 3: User Story 1 - Elegir un módulo e inscribirse (Priority: P1) 🎯 MVP

**Goal**: el estudiante ve la oferta del periodo Activo en tarjetas y se inscribe, con cupo por sesión, cruces de horario y reglas visibles.

**Independent Test**: con un módulo de salón de capacidad 2 en el periodo activo y tres estudiantes, inscribir a dos y comprobar que el tercero ve "Lleno" y no puede inscribirse; inscribirse a un módulo que se cruza con otro propio y comprobar que se rechaza mostrando con cuál.

### Tests for User Story 1 ⚠️

> Escribirlas primero y comprobar que fallan antes de implementar.

- [ ] T014 [P] [US1] Prueba e2e de la oferta y el detalle en `tutorias_uts_back/test/enrollments.e2e-spec.ts` (`GET /student/modules` y `GET /student/modules/{id}`): solo módulos del periodo Activo (no los de Próximo ni Cerrado), búsqueda por nombre sin distinguir mayúsculas, paginación, `meta.periodId` nulo sin periodo activo, `capacity` y `availableSeats`, `state` `AVAILABLE`, `LAST_SPOTS` (80 % o más ocupado), `FULL`, `ENROLLED` y `BLOCKED` con `blockReason` `SCHEDULE_CONFLICT` (con `conflict`) o `UNAVAILABLE` (docente o salón desactivado), sin filtrar datos de otros estudiantes (solo cantidades) y `404` solo si el módulo está eliminado o no se ofrece (periodo no Activo) y el estudiante no tiene ni tuvo una inscripción en él; el detalle de una inscripción de un periodo Cerrado o cancelada responde `200`
- [ ] T015 [P] [US1] Prueba e2e de `POST /student/enrollments` en el mismo `enrollments.e2e-spec.ts`: crea la inscripción `ACTIVE` y `201` con `enrolledAt`; los cupos bajan en uno; al inscribirse con el periodo ya empezado solo cuenta las sesiones futuras; módulo lleno (`409 ENROLLMENT_MODULE_FULL` con `availableSeats` 0 y `capacity`); cruce de horario (`409 ENROLLMENT_SCHEDULE_CONFLICT` con `details.conflict` del módulo, día y horas) y su borde (terminar a las 16:00 y empezar a las 16:00 se permite); `409 ENROLLMENT_ALREADY_ACTIVE`; `409 ENROLLMENT_MODULE_UNAVAILABLE` (docente o salón desactivado, y módulo sin sesiones futuras); `409 ENROLLMENT_PERIOD_NOT_OPEN` (periodo Próximo); `409 PERIOD_CLOSED_READ_ONLY` (periodo Cerrado); `404` para un módulo inexistente o eliminado; `400 VALIDATION_FAILED` con `moduleId` que no es UUID o con campos desconocidos; el cupo es por sesión: con una sesión llena, el módulo se muestra lleno aunque las demás tengan lugar
- [ ] T016 [P] [US1] Prueba e2e de concurrencia en `tutorias_uts_back/test/enrollments-concurrency.e2e-spec.ts`: 20 estudiantes se inscriben a la vez a un módulo de cupo 5 y quedan exactamente 5 inscripciones `ACTIVE` y 15 respuestas `409 ENROLLMENT_MODULE_FULL` (SC-002); un mismo estudiante envía 5 peticiones simultáneas al mismo módulo y queda una sola inscripción; un mismo estudiante se inscribe a la vez a dos módulos que se cruzan y solo una prospera (el bloqueo del estudiante, R-3); una inscripción y un cambio de salón de la spec 010 a la vez nunca dejan más inscritos que capacidad; reducir la capacidad de un salón mientras se inscriben estudiantes a un módulo de ese salón nunca deja más inscritos que la nueva capacidad
- [ ] T017 [P] [US1] Pruebas de la app en `tutorias_uts_mobile/src/features/enrollments/__tests__/offer.test.tsx` (mock de `@/api/client` y de `expo-router`, como en `src/features/modules/__tests__/`): la tarjeta en sus cuatro estados (Cupos disponibles, Últimos cupos, Lleno, Inscrito) con texto `ocupados/capacidad` y barra de capacidad; búsqueda por nombre; estado vacío ("sin tutorías disponibles"), de error con reintento y de carga; inscribirse desde el detalle llama a `POST /student/enrollments` con `{ moduleId }` y actualiza la tarjeta; un `409` de cruce muestra el módulo y el horario con los que choca, y uno de lleno muestra la regla; el botón de un módulo lleno o bloqueado está deshabilitado con el motivo visible (no solo gris); sin textos fijos (paridad es/en)

### Implementation for User Story 1

- [ ] T018 [P] [US1] Crear `tutorias_uts_back/src/enrollments/dto/enrollment.dto.ts` con `CreateEnrollmentDto` (`moduleId` UUID) y `OfferQueryDto` (`search` recortado opcional, `page` y `limit` como en `src/modules/dto/module.dto.ts`), con `whitelist` y `forbidNonWhitelisted` (los campos desconocidos responden `400 VALIDATION_FAILED`)
- [ ] T019 [US1] Crear `tutorias_uts_back/src/enrollments/offer.service.ts` con `list(studentId, query)` y `detail(studentId, moduleId)`: busca el periodo `ACTIVE` (vacío con `meta.periodId` nulo si no hay); `detail` responde si el módulo se ofrece (periodo Activo) o si el estudiante tiene o tuvo una inscripción en él (activa o cancelada), y si el periodo es Cerrado devuelve `readOnly: true` y `sessions: []`; carga en bloque los módulos vivos con docente (perfil), salón y ubicación, horarios vivos y los lugares libres con `seats.ts`, y los horarios de las inscripciones `ACTIVE` del estudiante en ese periodo para calcular `conflict` con `findStudentConflict`; `state` según el contrato (`ENROLLED` > `BLOCKED` > `FULL` > `LAST_SPOTS` > `AVAILABLE`); `blockReason` `UNAVAILABLE` si el docente está inactivo o borrado, el salón inactivo o borrado, o no hay sesiones futuras (D-088); `availableSeats` es el mínimo de `seats.ts` y la app muestra `ocupados = capacity − availableSeats`; solo cantidades, nunca datos de otros estudiantes (depende de T007 y T008)
- [ ] T020 [US1] Crear `tutorias_uts_back/src/enrollments/enrollments.service.ts` con `enroll(studentId, moduleId)` en una transacción con el orden de R-2: bloquear el periodo con `FOR SHARE` (rechazar `CLOSED` con `PERIOD_CLOSED_READ_ONLY` y `UPCOMING` con `ENROLLMENT_PERIOD_NOT_OPEN`), la fila del estudiante con `SELECT ... FROM users WHERE id = $1 FOR UPDATE` y el módulo con `FOR UPDATE`; validar que el módulo esté vivo y disponible (`ENROLLMENT_MODULE_UNAVAILABLE`), que no haya inscripción `ACTIVE` (`ENROLLMENT_ALREADY_ACTIVE`), que no se cruce con las inscripciones activas del periodo (`ENROLLMENT_SCHEDULE_CONFLICT` con `conflict`), y que `moduleSeats` sea ≥ 1 (`ENROLLMENT_MODULE_FULL` con `availableSeats` y `capacity`); insertar la inscripción; devolver `Enrollment`. Traducir la violación del índice `enrollments_one_active` a `ENROLLMENT_ALREADY_ACTIVE` con `violatedConstraint` (como `schedules.translate` en la spec 010). `NOT_FOUND` si el módulo no existe o está eliminado (depende de T008, T009, T011 y T019)
- [ ] T021 [US1] Agregar a `tutorias_uts_back/src/enrollments/enrollments.controller.ts` `GET /student/modules`, `GET /student/modules/:id` y `POST /student/enrollments` (`201`), con el `userId` del token como estudiante (nunca de un parámetro) y los códigos del contrato. Documentar con `@nestjs/swagger` como en `modules.controller.ts`
- [ ] T022 [P] [US1] Crear `tutorias_uts_mobile/src/features/enrollments/hooks/useStudentModules.ts` con `useStudentModules(search)` (clave `['student','modules', search]`), `useStudentModule(id)` (`['student','modules',id]`) y `useEnroll()` (mutación `POST /student/enrollments`, invalida `['student','modules']` y `['student','enrollments']`), siguiendo `src/features/modules/hooks/useModules.ts`
- [ ] T023 [P] [US1] Crear `tutorias_uts_mobile/src/features/enrollments/components/OfferCard.tsx` según "Module card (students)" de `docs/Design.md`: tarjeta `Card` de 16 px de radio, nombre (2 líneas) con insignia de estado, fila de docente con avatar de 24 px, fila de horario semanal con ícono, fila de salón con ícono, texto `ocupados/capacidad` (`ocupados = capacidad − availableSeats`, el pico entre las sesiones futuras) y barra de 4 px (colores `#34531F` bajo 80 %, `#FB8C00` de 80 a 99 %, `#575756` al 100 %; usar los tokens del tema, sin hexadecimales), y botón de ancho completo con ícono a la izquierda (Inscribirme, Lleno deshabilitado con "Sin cupos", Inscrito); estado presionado a 0.98 respetando "reducir movimiento"; objetivo táctil de 48 px; `accessibilityLabel` con el nombre del módulo
- [ ] T024 [US1] Crear `tutorias_uts_mobile/src/features/enrollments/screens/StudentModulesScreen.tsx` (contenido de `app/(student)/modules/index.tsx`): barra de búsqueda (`SearchField`), lista de `OfferCard` con los cuatro estados de pantalla (cargando con `LoadingScreen`, vacío con `EmptyState`, error con reintento y contenido), al tocar una tarjeta abre `[id]`. El segmento "Mis tutorías" lo agrega la historia 3 (por ahora solo "Disponibles"). Sin textos fijos
- [ ] T025 [US1] Crear `tutorias_uts_mobile/src/features/enrollments/screens/StudentModuleDetailScreen.tsx` (contenido de `app/(student)/modules/[id].tsx`): datos del módulo, sus horarios, `OfferCard`-like de cupos, lista de sesiones futuras de solo lectura (fecha y hora de Bogotá con `format.ts` de `src/features/modules/`), el botón Inscribirme (deshabilitado con la regla visible cuando `state` es `FULL` o `BLOCKED`) y, al fallar, el mensaje del `code` con `errorMessage`; tras inscribirse muestra el estado Inscrito sin salir de la pantalla. Cuatro estados de pantalla (depende de T022 y T023)
- [ ] T026 [US1] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos de la oferta y el detalle (`student.modules.*`: título, búsqueda, estados de tarjeta, "Inscribirme", "Inscrito", "Lleno", "Sin cupos", "Últimos cupos", `{{occupied}}/{{capacity}} cupos`, vacío, error y reintento, encabezados del detalle), con las mismas claves y sin plurales solos (la prueba de paridad existente debe pasar)

**Checkpoint**: la oferta, el detalle y la inscripción funcionan de punta a punta; la historia 1 se prueba sola.

---

## Phase 4: User Story 2 - Cancelar una sesión o el módulo y volver a inscribirse (Priority: P1)

**Goal**: cancelar hasta 1 hora antes, solo una sesión o el módulo completo; reactivar una sesión; reinscribirse con cupo.

**Independent Test**: con un estudiante inscrito, cancelar una sesión futura (sigue inscrito en las demás), reactivarla, cancelar el módulo (se libera el cupo), reinscribirse; intentar cancelar una sesión a menos de 1 hora y comprobar el bloqueo con la regla.

### Tests for User Story 2 ⚠️

- [ ] T027 [P] [US2] Prueba e2e de cancelar y reactivar una sesión en `tutorias_uts_back/test/enrollments-cancel.e2e-spec.ts` con `TestClock`: `POST /student/enrollments/{id}/sessions/{sessionId}/cancel` a 61, 60 (se permite) y 59 minutos (`409 ENROLLMENT_CANCEL_WINDOW_PASSED` con `details.minutes`), la inscripción sigue `ACTIVE` y las demás sesiones no cambian; el lugar de esa sesión queda libre (`freeSeats` +1) pero el módulo sigue lleno si otra sesión lo está (R-1); idempotente (cancelar dos veces responde `200` y queda una sola ausencia viva); `POST .../restore` con lugar (`200`, la ausencia queda con `deleted_at`), sin lugar (`409 ENROLLMENT_MODULE_FULL`), fuera de plazo (`409 ENROLLMENT_CANCEL_WINDOW_PASSED`) e idempotente; una sesión cancelada por festivo o ya pasada (`409 ENROLLMENT_SESSION_NOT_CANCELLABLE`); una inscripción cancelada (`409 ENROLLMENT_NOT_ACTIVE`); periodo Cerrado (`409 PERIOD_CLOSED_READ_ONLY`); inscripción o sesión de otro módulo, de otro estudiante o inexistente (`404 NOT_FOUND`); `cancelled_by_student` y `canCancel`, `canRestore` y `blockReason` correctos en `GET /student/modules/{id}`
- [ ] T028 [P] [US2] Prueba e2e de cancelar el módulo y reinscribirse en `tutorias_uts_back/test/enrollments-cancel.e2e-spec.ts` (mismo archivo, bloque aparte): `DELETE /student/enrollments/{id}` con todas las sesiones a más de 1 hora pasa a `CANCELLED` con `cancelledAt` y `effectiveUntil = ahora + 60 min`, libera el lugar en todas las sesiones y el módulo vuelve a tener cupo; con una sesión que empieza en menos de 1 hora, esa sesión conserva al estudiante como asistente y las demás se liberan (R-4); responde `200`; `409 ENROLLMENT_NOT_ACTIVE` si ya estaba cancelada; `409 PERIOD_CLOSED_READ_ONLY`; reinscribirse crea otra fila `ACTIVE` (la cancelada queda en el historial) y no cuenta dos veces al estudiante dentro de la ventana (`COUNT(DISTINCT student_id)`); reinscribirse con el módulo lleno falla con `ENROLLMENT_MODULE_FULL`; ninguna fila se borra físicamente
- [ ] T029 [P] [US2] Pruebas de la app en `tutorias_uts_mobile/src/features/enrollments/__tests__/cancel.test.tsx`: la hoja de cancelación ofrece "Solo esta sesión" y "Todo el módulo" con la regla de la hora visible; elegir una llama a `POST .../cancel` y la otra a `DELETE /student/enrollments/{id}`, con confirmación antes de cancelar el módulo (`ConfirmDialog`); una sesión con `canCancel` falso muestra el botón deshabilitado y `blockReason` traducido (`WINDOW_PASSED` con los minutos de `cancelLeadMinutes`, `PERIOD_CLOSED`, `SESSION_CANCELLED`); una sesión cancelada por el estudiante ofrece "Reactivar" y, sin lugar (`NO_SEAT`), lo bloquea con el motivo; los errores del servidor se muestran con su `code` traducido; tras cancelar el módulo vuelve a la oferta y el módulo se puede reinscribir; sin textos fijos

### Implementation for User Story 2

- [ ] T030 [US2] Agregar a `tutorias_uts_back/src/enrollments/enrollments.service.ts` `cancelModule(studentId, enrollmentId)`: transacción con el orden de R-2 (periodo `FOR SHARE`, rechazar `CLOSED`; módulo `FOR UPDATE`); `404` si la inscripción no es del estudiante del token; `409 ENROLLMENT_NOT_ACTIVE` si no está `ACTIVE`; pasa a `CANCELLED` con `cancelledAt = ahora` y `effectiveUntil = effectiveUntil(ahora, STUDENT_CANCEL_LEAD_MINUTES)` (de `enrollments.rules.ts`, hora de `Clock`); sin borrar filas. Devuelve `Enrollment`
- [ ] T031 [US2] Agregar a `tutorias_uts_back/src/enrollments/enrollments.service.ts` `cancelSession(studentId, enrollmentId, sessionId)` y `restoreSession(...)`: misma transacción y bloqueos; validar que la inscripción esté `ACTIVE`, que la sesión sea del módulo, futura y `SCHEDULED` o `RESCHEDULED` (`ENROLLMENT_SESSION_NOT_CANCELLABLE` si fue cancelada por festivo o ya pasó) y que `canCancelSession` se cumpla (`ENROLLMENT_CANCEL_WINDOW_PASSED` con `details.minutes`); cancelar inserta una `session_absences` si no hay una viva (idempotente); reactivar marca `deleted_at` de la ausencia viva (idempotente) tras comprobar con `seats.ts` que hay lugar libre en esa sesión (`ENROLLMENT_MODULE_FULL` si no). Traducir la violación de `session_absences_one_live`. Devuelven el `StudentSession` actualizado
- [ ] T032 [US2] Extender `tutorias_uts_back/src/enrollments/offer.service.ts` para que `detail` devuelva, por sesión futura, `cancelledByStudent`, `freeSeats`, `canCancel`, `canRestore` y `blockReason` (`WINDOW_PASSED`, `PERIOD_CLOSED`, `SESSION_CANCELLED`, `NO_SEAT`), junto con `readOnly` y `cancelLeadMinutes` del módulo; los mismos cálculos que usan `cancelSession` y `restoreSession` (una sola función compartida, sin duplicar la regla)
- [ ] T033 [US2] Agregar a `tutorias_uts_back/src/enrollments/enrollments.controller.ts` `DELETE /student/enrollments/:id`, `POST /student/enrollments/:id/sessions/:sessionId/cancel` y `POST .../restore` (`200`), con DTO de parámetros que validan UUID y el estudiante tomado del token
- [ ] T034 [P] [US2] Agregar a `tutorias_uts_mobile/src/features/enrollments/hooks/useStudentModules.ts` (o un archivo `useEnrollments.ts` si se vuelve largo) `useCancelModule()`, `useCancelSession()` y `useRestoreSession()`, que invalidan `['student','modules']`, `['student','enrollments']` y el detalle
- [ ] T035 [P] [US2] Crear `tutorias_uts_mobile/src/features/enrollments/components/CancelSheet.tsx`: hoja inferior con la elección de alcance ("Solo esta sesión" o "Todo el módulo"), la regla de la hora visible (`{{minutes}}` de `cancelLeadMinutes`), botones apilados con 16 px entre sí, ícono a la izquierda y objetivos de 48 px; el botón de cancelar el módulo pide confirmación con `ConfirmDialog` (D-070)
- [ ] T036 [US2] Crear `tutorias_uts_mobile/src/features/enrollments/components/SessionRow.tsx` (fecha y hora de Bogotá con `format.ts`, insignia de estado: Programada, Reprogramada, Cancelada por festivo o Cancelada por ti, y las acciones Cancelar o Reactivar según `canCancel` y `canRestore`, con `blockReason` visible cuando está bloqueada) y usarlo en `StudentModuleDetailScreen.tsx` junto con `CancelSheet` y un botón "Cancelar inscripción" cuando `state` es `ENROLLED`; el módulo de un periodo Cerrado (`readOnly`) se ve sin acciones y con la explicación (depende de T034 y T035)
- [ ] T037 [US2] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos de la cancelación (`student.cancel.*`: opciones de alcance, la regla de la hora, confirmaciones, estados de sesión, motivos de bloqueo, "Reactivar", "Cancelar inscripción", "Periodo cerrado, solo lectura"), con paridad es/en

**Checkpoint**: US1 y US2 funcionan juntas; el ciclo completo de inscripción se prueba solo.

---

## Phase 5: User Story 3 - Ver mis tutorías (Priority: P2)

**Goal**: el estudiante ve sus módulos inscritos con docente, salón, horario y próximas sesiones, y desde ahí accede a la cancelación.

**Independent Test**: con un estudiante inscrito en dos módulos, abrir "Mis tutorías" y ver ambos con sus próximas sesiones, las canceladas distinguidas y, sin inscripciones, un estado vacío con acceso a la oferta.

### Tests for User Story 3 ⚠️

- [ ] T038 [P] [US3] Prueba e2e de `GET /student/enrollments` en `tutorias_uts_back/test/enrollments.e2e-spec.ts` (bloque aparte): por defecto solo `ACTIVE`, `status=CANCELLED` y `status=ALL` (con el historial), paginación, cada ítem trae `module`, `nextSession` (la próxima sesión futura con su estado) y `upcomingSessions`, las sesiones canceladas por festivo y por el estudiante se distinguen, `readOnly` verdadero en un periodo Cerrado (las inscripciones de un periodo Cerrado se conservan como historial) y su detalle (`GET /student/modules/{id}`) responde `200` con `readOnly: true` y `sessions: []`, igual que el de una inscripción cancelada, orden por la próxima sesión, solo las del estudiante del token, `400` para un `status` desconocido
- [ ] T039 [P] [US3] Pruebas de la app en `tutorias_uts_mobile/src/features/enrollments/__tests__/my-enrollments.test.tsx`: el segmento "Mis tutorías" lista los módulos inscritos con docente, salón, horario y próxima sesión (fecha y hora de Bogotá), distingue las sesiones canceladas con su motivo, muestra el estado vacío con la acción "Ver tutorías disponibles", el error con reintento y la carga, el módulo de un periodo Cerrado se ve en solo lectura, tocar un módulo abre su detalle

### Implementation for User Story 3

- [ ] T040 [US3] Agregar a `tutorias_uts_back/src/enrollments/offer.service.ts` `myEnrollments(studentId, query)` y a `enrollments.controller.ts` `GET /student/enrollments` (`status` `ACTIVE` por defecto, `CANCELLED` o `ALL`, validado con `class-validator`; `page`, `limit`): cada ítem con `Enrollment`, `module` (igual que en la oferta), `readOnly`, `nextSession` y `upcomingSessions`, calculados en bloque (sin una consulta por inscripción); orden por la próxima sesión y luego por fecha de inscripción
- [ ] T041 [P] [US3] Agregar `useMyEnrollments(status)` (clave `['student','enrollments', status]`) a `tutorias_uts_mobile/src/features/enrollments/hooks/useStudentModules.ts`
- [ ] T042 [US3] Crear `tutorias_uts_mobile/src/features/enrollments/screens/MyEnrollmentsScreen.tsx` y agregar a `StudentModulesScreen.tsx` el segmento "Disponibles" / "Mis tutorías" con `FilterChips`: lista de tarjetas con docente, salón, horario, próxima sesión y estado (Activa, Cancelada, Periodo cerrado), con los cuatro estados de pantalla y acceso a la oferta desde el estado vacío; al tocar abre `[id]`
- [ ] T043 [US3] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` los textos de "Mis tutorías" (`student.mine.*`), con paridad es/en

**Checkpoint**: US1, US2 y US3 funcionan de forma independiente.

---

## Phase 6: User Story 4 - Inscritos reales en la gestión del CAE (Priority: P2)

**Goal**: las reglas de la spec 010 (cambio de salón, edición de horarios, eliminación) se aplican con inscritos reales; el CAE ve los inscritos verdaderos.

**Independent Test**: con un módulo de 5 inscritos en un salón de 30, cambiar a un salón de capacidad 4 (se bloquea), editar horarios y eliminarlo (se bloquean mostrando cuántos hay), y cambiar a capacidad 5 (se permite).

### Tests for User Story 4 ⚠️

- [ ] T044 [P] [US4] Prueba e2e en `tutorias_uts_back/test/enrollments-cae.e2e-spec.ts` (sin `FakeConfigUsage` fijo: inscripciones reales con `createEnrollment`): `GET /modules` y `GET /modules/{id}` muestran `enrolled` real; `PATCH /modules/{id}/room` a un salón con capacidad menor que los inscritos activos responde `409 MODULE_ROOM_CAPACITY_BELOW_ENROLLED` con `enrolled` y `capacity`, a uno de capacidad igual o mayor se aplica; `PUT /modules/{id}/schedules` y `DELETE /modules/{id}` responden `409 MODULE_HAS_ENROLLMENTS` con `enrolled`; con todos los inscritos cancelados se permiten; una cuenta de estudiante desactivada o eliminada conserva su inscripción pero no cuenta (FR-015), y al reactivarla vuelve a contar; con cupo por sesión un inscrito activo cuenta una sola vez aunque haya cancelado sesiones; `maxEnrolled` de la regla de salones de la spec 006 (`ROOM_CAPACITY_BELOW_ENROLLED` al bajar la capacidad de un salón) usa el máximo de inscritos reales
- [ ] T045 [P] [US4] Revisar en `tutorias_uts_mobile/src/features/modules/` que el listado, el detalle y las hojas de cambio de salón muestran los inscritos que llegan de la API y la regla `MODULE_ROOM_CAPACITY_BELOW_ENROLLED` con `enrolled` y `capacity`; agregar a `tutorias_uts_mobile/src/features/modules/__tests__/change-room.test.tsx` (o el archivo que ya cubra el bloqueo) el caso de la opción deshabilitada con la regla visible cuando la capacidad es menor que `enrolled`, solo si aún no está cubierto

### Implementation for User Story 4

- [ ] T046 [US4] Comprobar que `tutorias_uts_back/src/modules/modules.service.ts` obtiene los inscritos solo de `ConfigUsageService.countActiveEnrollments` (listado, detalle, `changeRoom`, `replaceSchedules`, `remove`), sin cambios de lógica; si algún lugar calcula inscritos por otro camino, unificarlo. Confirmar que el bloqueo `FOR UPDATE` del módulo en `lockModule` precede a la lectura del conteo (así una inscripción simultánea no cambia el número durante la transacción) y dejar la prueba de T016 como evidencia

**Checkpoint**: las cuatro historias funcionan; el cierre de la spec 010 con inscritos reales queda verificado.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Roles, contrato, seed, documentación y cierre.

- [ ] T047 [P] Prueba e2e de roles en `tutorias_uts_back/test/enrollments-roles.e2e-spec.ts` (mismo patrón de `test/modules-roles.e2e-spec.ts`): la lista de endpoints sale de `contracts/enrollments-api.yaml` con `loadContract` y `specPath('011-student-enrollment/contracts/enrollments-api.yaml')`, para que uno nuevo no escape; `403 FORBIDDEN_ROLE` para docente y para CAE sin cambiar nada en las tablas, `401` sin token, y el estudiante pasa (la respuesta es de negocio, nunca `401` ni `403`); un estudiante que pide la inscripción de otro recibe `404` y no la modifica
- [ ] T048 [P] Prueba de contrato en `tutorias_uts_back/test/enrollments-contract.e2e-spec.ts` (mismo patrón de `test/modules-contract.e2e-spec.ts`): las respuestas reales de los siete endpoints cumplen `enrollments-api.yaml` (`StudentModulePage`, `StudentModuleDetail`, `Enrollment`, `EnrollmentPage`, `StudentSession`, `Error`) y cada código HTTP está documentado en el contrato
- [ ] T049 [P] Agregar a `tutorias_uts_db/prisma/seed.ts` (idempotente) un estudiante de ejemplo `estudiante.ejemplo@uts.edu.co` con `StudentProfile` y una inscripción activa al módulo "Cálculo I (ejemplo)"; volver a ejecutar el seed y comprobar que no duplica filas. La clave temporal se imprime una sola vez, como la del docente de ejemplo (nunca en el repositorio)
- [ ] T050 [P] Actualizar `docs/Architecture.md` §5 (entidades `Enrollment` con `effectiveUntil` y `SessionAbsence`, y la nota "la `Enrollment` es al módulo" con el cupo por sesión) y §6 (las filas "Cupo máximo", "Cancelación del estudiante" y "Reinscripción": cupo por sesión y `STUDENT_CANCEL_LEAD_MINUTES`; la fila "Cambio de salón" no cambia); `docs/Context.md` §6 (cupo por sesión, cancelar el módulo aplica desde la primera sesión a más de 1 hora, reactivar una sesión, inscripción solo al periodo Activo; la regla del cambio de salón queda como está); `docs/Design.md` (estados del detalle del estudiante y la hoja de cancelación con alcance). Los archivos con terminaciones CRLF conservan CRLF
- [ ] T051 [P] Registrar en `docs/Decisions.md` (CRLF): D-090 Cupo por sesión (una cancelación suelta libera el lugar de esa sesión; el módulo está lleno si alguna sesión futura lo está), D-091 La cancelación del módulo aplica desde la primera sesión a más de 1 hora (`effective_until`) y D-092 Orden de bloqueo y respaldo de la inscripción (periodo, estudiante, módulo; índices únicos parciales); en D-070 cerrar el **Pendiente** con "resuelto en D-090"; en D-087 anotar que la 011 ya está implementada y que sigue vigente la condición de no publicar sin la spec 013 o un consumidor del outbox
- [ ] T052 Verificar que ningún componente nuevo contiene textos fijos, colores hexadecimales, nombres de fuente ni íconos fuera del registro (pruebas existentes en `tutorias_uts_mobile/src/__tests__/`), que `es.json` y `en.json` tienen las mismas claves, y revisar objetivos de 48 px, ícono a la izquierda en cada botón, 16 px entre botones apilados, los cuatro estados de pantalla en cada pantalla nueva, modo oscuro (avatar y bordes visibles), fuente grande y "reducir movimiento" (depende de las historias de la app)
- [ ] T053 Ejecutar todas las verificaciones de `quickstart.md`: `npm run test`, `npm run test:e2e` y `npm run lint` en `tutorias_uts_back`; `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; `npx prisma migrate diff` sin cambios en `tutorias_uts_db`. Correr cada comando solo (sin otros procesos en paralelo)
- [ ] T054 Recorrer `specs/011-student-enrollment/quickstart.md` de punta a punta en español e inglés, con modo oscuro, fuente grande y "reducir movimiento", incluida la medición de SC-001 y SC-004 y la comprensión de los bloqueos (SC-009), y anotar los resultados con fecha en la sección "Resultados". Si hay íconos nuevos, reiniciar Metro con `npx expo start -c`
- [ ] T055 Ejecutar la skill `feature-done-check`, atender sus observaciones, marcar `Status` de la spec como implementada y abrir los Pull Requests de los cuatro repositorios solo con la autorización del equipo. En la descripción de cada PR dejar escrita la condición de D-087: la inscripción no se publica en producción sin la spec 013 o sin un consumidor del outbox

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T001 a T004 en paralelo.
- **Foundational (Phase 2)**: depende de Setup; T005 → T006 → (T008, T009); T007, T010, T012 y T013 en paralelo con ellos; T011 al final. Bloquea todas las historias.
- **US1 (Phase 3)**: depende de Foundational. Las pruebas T014 a T017 van primero y se escriben antes de T018 a T026.
- **US2 (Phase 4)**: depende de US1 (necesita inscripciones y el detalle del módulo); comparte `enrollments.service.ts`, `offer.service.ts` y `enrollments.controller.ts`.
- **US3 (Phase 5)**: depende de US1; la acción de cancelar la aporta US2, pero la lista se prueba sola.
- **US4 (Phase 6)**: depende solo de Foundational (T009); se puede hacer en paralelo con US1.
- **Polish (Phase 7)**: depende de todas las historias.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; no depende de otras historias.
- **US2 (P1)**: tras US1.
- **US3 (P2)**: tras US1; independiente de US2.
- **US4 (P2)**: tras Foundational; independiente de las demás.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- Esquema y reglas puras antes de servicios; servicios antes de controladores; hooks antes de pantallas.
- Las tareas que tocan `enrollments.service.ts`, `offer.service.ts` o `enrollments.controller.ts` (US1 a US3) comparten archivos: no marcarlas [P] entre historias.

### Parallel Opportunities

- Setup: T001, T002, T003 y T004.
- Foundational: T007, T010, T012 y T013 mientras se hace T005 y T006.
- US1: T014 a T017 (pruebas), y T022 con T023 (hook y tarjeta) mientras se escribe el backend.
- US2: T027 a T029 (pruebas) y T034 con T035.
- US3: T038 y T039, y T041.
- US4: T044 y T045, en paralelo con US1.
- Polish: T047 a T051.

---

## Parallel Example: User Story 1

```text
# Pruebas de US1 (archivos distintos):
Task: "T014 oferta y detalle en tutorias_uts_back/test/enrollments.e2e-spec.ts"
Task: "T016 concurrencia en tutorias_uts_back/test/enrollments-concurrency.e2e-spec.ts"
Task: "T017 pruebas de la app en tutorias_uts_mobile/src/features/enrollments/__tests__/offer.test.tsx"

# Mientras el backend se implementa:
Task: "T022 hooks en tutorias_uts_mobile/src/features/enrollments/hooks/useStudentModules.ts"
Task: "T023 OfferCard en tutorias_uts_mobile/src/features/enrollments/components/OfferCard.tsx"
```

---

## Implementation Strategy

### MVP First (US1 y US2)

1. Setup y Foundational (T001 a T013).
2. US1: oferta, detalle e inscripción, con cupo por sesión y cruces.
3. US2: cancelar, reactivar y reinscribirse. Sin la cancelación, un estudiante no puede corregir su decisión; US1 y US2 son el MVP (ambas son P1).
4. **Detenerse y validar** con el recorrido 1 a 7 de `quickstart.md`.

### Incremental Delivery

1. Setup + Foundational.
2. US1 → probar sola.
3. US2 → probar el ciclo completo.
4. US3 → "Mis tutorías".
5. US4 → inscritos reales en la gestión del CAE (se puede adelantar en paralelo).
6. Polish: roles, contrato, seed, documentación, recorrido y cierre.

### Parallel Team Strategy

- Una persona en el backend (US1 a US3) y otra en la app, usando el contrato y los tipos de T012 como acuerdo.
- US4 se puede tomar aparte tras T009.

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes.
- [Story] relaciona la tarea con la historia de la spec.
- Verificar que las pruebas fallan antes de implementar.
- Un commit por tarea o grupo lógico, en Conventional Commits y en inglés (`feat(enrollments): ...`), en el repositorio que corresponda.
- Si algo contradice `docs/Architecture.md` o `docs/Design.md`, detenerse y preguntar. La regla del cambio de salón ("mayor o igual a los inscritos") **no se cambia** en esta spec.
- La inscripción no se publica en producción sin la spec 013 o sin un consumidor del outbox (D-087).
