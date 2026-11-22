---

description: "Task list for PQRS: radicación y gestión"
---

# Tasks: PQRS: radicación y gestión

**Input**: Design documents from `/specs/017-pqrs/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/pqrs-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principios II y V) y `docs/Conventions.md` §6 exigen pruebas de roles (`403`), de contrato y de las reglas críticas; aquí son las transiciones, la respuesta exigida y la propiedad de cada PQRS. Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1, US2 y US3 son P1 y van primero; US4 es P2 y US5 es P3. Cambia `tutorias_uts_db` (una migración con tablas), `tutorias_uts_back` y `tutorias_uts_mobile`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 radicar, US2 consultar mis PQRS, US3 gestionar como CAE, US4 avisos, US5 tipos en uso
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma, migraciones y seed
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas junto al código en `__tests__/`
- `Claude/` = `docs/` y `specs/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes; el estado de una PQRS nunca se indica solo por color (lleva texto)
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`
- Roles por endpoint con `@Roles(...)`: `'STUDENT', 'TEACHER'` para radicar y consultar lo propio, `'SUPERADMIN'` para gestionar
- Nunca se registran el asunto, la descripción ni el texto de una respuesta en los registros (logs) ni en los avisos de salida
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí ni con la API de desarrollo en marcha (base de datos y cola de Redis compartidas)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ramas, migración y piezas de prueba que todas las historias usan

- [X] T001 Crear la rama `017-pqrs` en `Claude`, `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db` a partir de la rama más reciente (`016-account-management`); ya hecho
- [X] T002 Modificar `tutorias_uts_db/prisma/schema.prisma` y crear `tutorias_uts_db/prisma/migrations/<ts>_add_pqrs/migration.sql` según `specs/017-pqrs/data-model.md`: enum `PqrsStatus` (`FILED`, `IN_REVIEW`, `RESOLVED`); tabla `pqrs` con `author_id` → `users`, `type_id` → `dropdown_items`, `subject` `VarChar(200)`, `description` `VarChar(4000)`, `status` por defecto `FILED`, `client_request_id` uuid, `reviewed_at` y `resolved_at` timestamptz nulos, `created_at`, `updated_at`, `deleted_at`, con índices único `(author_id, client_request_id)`, `(status, created_at DESC)`, `(author_id, created_at DESC)` y `(type_id)`; tabla `pqrs_messages` con `pqrs_id`, `author_id`, `body` `VarChar(4000)`, `created_at`, `deleted_at` e índice `(pqrs_id, created_at)`; valores `PQRS_IN_REVIEW`, `PQRS_RESPONDED` y `PQRS_RESOLVED` en `OutboxEventType`; en `outbox_events` y `notifications`, `module_id` pasa a opcional, se suma `pqrs_id` opcional → `pqrs` y `CHECK (num_nonnulls(module_id, pqrs_id) = 1)`. Aplicar con `npx prisma migrate dev` en la base de desarrollo y `npx prisma migrate deploy` en la de pruebas (`TEST_DATABASE_URL`), y regenerar el cliente en `tutorias_uts_back`
- [X] T003 [P] Elementos de ejemplo de `PQRS_TYPE`: no hace falta tocar `tutorias_uts_db/prisma/seed.ts`; la migración de la spec 006 ya inserta Petición, Queja, Reclamo y Sugerencia con ids fijos
- [X] T004 [P] Añadir a `tutorias_uts_back/test/utils/factories.ts` un `createPqrs(prisma, { author, typeId?, status?, subject? })` que cree una PQRS válida y un `createPqrsType(prisma, { active? })` que cree un elemento de `PQRS_TYPE`; `createAdminSession` ya existe desde la spec 016
- [X] T005 [P] Añadir a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` las claves `errors.PQRS_NOT_FOUND`, `errors.PQRS_TYPE_UNAVAILABLE`, `errors.PQRS_INVALID_TRANSITION`, `errors.PQRS_NOT_IN_REVIEW` y `errors.PQRS_RESPONSE_REQUIRED`, en orden alfabético y con paridad (skill `i18n-strings`); cada mensaje dice la regla (por ejemplo, "Primero pásala a En revisión")

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configuración, máquina de estados y la generalización de avisos para que un evento pueda no tener módulo

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [X] T006 [P] Añadir a `tutorias_uts_back/src/settings/settings.service.ts` las claves `pqrs.subjectMaxLength` (120), `pqrs.descriptionMaxLength` (2000) y `pqrs.responseMaxLength` (2000) en `SettingValues` y `SETTING_DEFAULTS`, con una prueba de los valores por defecto en `tutorias_uts_back/src/settings/settings.service.spec.ts` (créalo si no existe)
- [X] T007 [P] Escribir `tutorias_uts_back/src/pqrs/pqrs-transitions.spec.ts`: solo `FILED → IN_REVIEW` y `IN_REVIEW → RESOLVED` son válidas; cualquier salto (`FILED → RESOLVED`), retroceso o salida de `RESOLVED` es inválida; responder solo se permite en `IN_REVIEW`; resolver exige al menos una respuesta
- [X] T008 Implementar `tutorias_uts_back/src/pqrs/pqrs-transitions.ts` como funciones puras (`canTransition(from, to)`, `canRespond(status)`, `canResolve(status, messageCount)`) hasta que T007 pase
- [X] T009 [P] Modificar `tutorias_uts_back/src/outbox/outbox.service.ts`: `OutboxEventInput` acepta `moduleId` o `pqrsId` (exactamente uno) y `record` escribe el que venga; el payload sigue siendo solo ids
- [X] T010 Modificar `tutorias_uts_back/src/notifications/event-context.ts` y `outbox.consumer.ts` para que `EventRow.moduleId` sea `string | null` y exista `pqrsId`: `resolveEvent` solo busca el módulo cuando hay `moduleId`; si el evento trae `pqrsId` devuelve `{ skip: 'PQRS_NOTICES_PENDING' }` (US4 lo reemplaza por los avisos reales); el consumidor guarda `pqrsId` y `moduleId` (nulo en PQRS) en el aviso. Las pruebas existentes de notificaciones (`test/notifications-*.e2e-spec.ts`) siguen en verde
- [X] T011 Modificar `tutorias_uts_back/src/notifications/notifications.service.ts`, `dto/notifications.dto.ts` y `deliveries.service.ts` para que el aviso exponga `moduleId` (nulo en PQRS) y `pqrsId` (nulo en módulos) y que el `data` del push incluya `pqrsId`; actualizar el contrato de la spec 014 en `specs/014-notifications/contracts/` y `test/notifications-contract.e2e-spec.ts`
- [X] T012 [P] Modificar `tutorias_uts_mobile/src/api/types.ts` para que el aviso tenga `moduleId: string | null` y `pqrsId: string | null`, y `tutorias_uts_mobile/src/features/notifications/screens/NotificationsScreen.tsx` y `hooks/usePushRegistration.ts` para no navegar cuando `moduleId` es nulo (la navegación a la PQRS llega en US4); ajustar `__tests__/inbox.test.tsx` y `push.test.tsx`

**Checkpoint**: La base de datos acepta PQRS, la máquina de estados está probada y los avisos de módulos siguen funcionando.

---

## Phase 3: User Story 1 - Radicar una PQRS (Priority: P1) 🎯 MVP

**Goal**: Un docente o estudiante radica una PQRS con tipo, asunto y descripción y queda "Radicada".

**Independent Test**: Con un estudiante y un docente, radicar una PQRS cada uno; queda `FILED`; un doble toque no crea dos; el CAE recibe `403`.

### Tests for User Story 1 ⚠️

> Escribir primero y comprobar que fallan

- [X] T013 [P] [US1] Escribir `tutorias_uts_back/test/pqrs-create.e2e-spec.ts`: estudiante y docente radican (`201`, `status` `FILED`, `createdAt` en UTC); asunto o descripción vacíos o solo espacios responden `400 VALIDATION_FAILED` con `details.fields`; asunto o descripción por encima de `pqrs.subjectMaxLength` y `pqrs.descriptionMaxLength` responden `400`; tipo inexistente, de otra lista, `INACTIVE` o con `deletedAt` responde `422 PQRS_TYPE_UNAVAILABLE`; el mismo `clientRequestId` del mismo autor devuelve `200` con la misma PQRS y no crea otra; el mismo `clientRequestId` de otro autor crea una distinta; `GET /pqrs/limits` devuelve los tres límites vigentes
- [X] T014 [P] [US1] Crear `tutorias_uts_back/test/pqrs-roles.e2e-spec.ts` con los casos de US1: el `SUPERADMIN` recibe `403` en `POST /pqrs`; `GET /pqrs/limits` responde a cualquier rol con sesión (el CAE la necesita para el límite de su respuesta); sin sesión `401` (las siguientes historias añaden sus casos a este archivo)
- [X] T015 [P] [US1] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/NewPqrsScreen.test.tsx`: el selector muestra solo los tipos activos en el idioma del dispositivo; asunto o descripción vacíos muestran el campo faltante y no envían; el contador respeta los límites que da la API; un doble toque en "Radicar" hace una sola petición con la misma `clientRequestId`; `PQRS_TYPE_UNAVAILABLE` muestra la regla y vuelve a cargar los tipos

### Implementation for User Story 1

- [X] T016 [P] [US1] Crear `tutorias_uts_back/src/pqrs/dto/create-pqrs.dto.ts` con `CreatePqrsDto` (`clientRequestId` uuid, `typeId` uuid, `subject` y `description` con espacios recortados y obligatorios) y una validación en el servicio contra `pqrs.subjectMaxLength` y `pqrs.descriptionMaxLength` que responde `VALIDATION_FAILED` con `details.fields`, igual que las demás validaciones del backend
- [X] T017 [US1] Crear `tutorias_uts_back/src/pqrs/pqrs.service.ts` con `create` y `limits`: valida que el tipo pertenezca a la lista `PQRS_TYPE`, esté `ACTIVE` y sin `deletedAt` (`422 PQRS_TYPE_UNAVAILABLE`); crea en `FILED`; ante el índice único `(author_id, client_request_id)` devuelve la PQRS existente y avisa al controlador para responder `200`
- [X] T018 [US1] Crear `tutorias_uts_back/src/pqrs/pqrs.controller.ts` con `POST /pqrs` (`201`, o `200` si fue reintento, con `@Res({ passthrough: true })`) con `@Roles('STUDENT', 'TEACHER')` y `GET /pqrs/limits` sin `@Roles` (cualquier rol con sesión); crear `pqrs.module.ts` y registrarlo en `tutorias_uts_back/src/app.module.ts`
- [X] T019 [P] [US1] Crear `tutorias_uts_mobile/src/features/pqrs/types.ts`, `hooks/usePqrsLimits.ts` y `hooks/useCreatePqrs.ts` (genera la `clientRequestId` una vez por formulario abierto, la conserva en los reintentos e invalida la clave `['pqrs']`); los tipos salen de `useDropdownItems('PQRS_TYPE')` de `src/features/dropdown-lists/hooks/useDropdownLists.ts`
- [X] T020 [P] [US1] Crear `tutorias_uts_mobile/src/features/pqrs/schemas.ts` con la validación del formulario construida a partir de los límites de `usePqrsLimits`, sin números escritos en el código
- [X] T021 [P] [US1] Añadir a `es.json` y `en.json` los textos del formulario (`pqrs.new.*`: título, etiquetas, ayudas, contador, mensajes de validación, éxito) y declarar los íconos nuevos en `tutorias_uts_mobile/src/icons/registry.ts`
- [X] T022 [US1] Crear `tutorias_uts_mobile/src/features/pqrs/screens/NewPqrsScreen.tsx` (campos con relleno y borde tenue, botón "Radicar" con ícono a la izquierda y objetivo de 48 px, cuatro estados de pantalla) y `MyPqrsScreen.tsx` mínima (encabezado, botón "Nueva PQRS" con ícono y estado vacío; US2 la completa con la lista); crear las rutas `app/(student)/pqrs/{_layout,index,new}.tsx` y `app/(teacher)/pqrs/{_layout,index,new}.tsx` con el patrón de `app/(student)/modules/` y borrar `app/(student)/pqrs.tsx` y `app/(teacher)/pqrs.tsx`

**Checkpoint**: US1 funciona y se puede probar sola: se radica y la PQRS queda guardada.

---

## Phase 4: User Story 2 - Consultar mis PQRS y su estado (Priority: P1)

**Goal**: El autor ve sus PQRS con estado y abre cada una para leer su descripción y las respuestas del CAE.

**Independent Test**: Radicar dos PQRS, cambiar el estado de una (con la fábrica de pruebas) y comprobar que el autor ve ambos estados y que otro usuario no puede abrirlas.

### Tests for User Story 2 ⚠️

- [X] T023 [P] [US2] Escribir `tutorias_uts_back/test/pqrs-mine.e2e-spec.ts`: `GET /pqrs/mine` devuelve solo las del autor, de la más reciente a la más antigua, con `meta.total`, paginación y filtro `status`; `GET /pqrs/mine/:id` devuelve descripción y respuestas en orden cronológico; el id de una PQRS ajena responde `404 PQRS_NOT_FOUND`; el tipo se devuelve con `labelEs` y `labelEn` aunque esté desactivado; una lista vacía devuelve `data: []`
- [X] T024 [P] [US2] Añadir a `test/pqrs-roles.e2e-spec.ts` los casos de US2: el `SUPERADMIN` recibe `403` en `GET /pqrs/mine` y `GET /pqrs/mine/:id`; sin sesión `401`
- [X] T025 [P] [US2] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/MyPqrsScreen.test.tsx` y `PqrsDetailScreen.test.tsx`: los cuatro estados (cargando, vacío con invitación a radicar la primera, error con reintento, con datos); el estado se lee como texto y no solo por color; el filtro por estado; la lista de respuestas en orden

### Implementation for User Story 2

- [X] T026 [P] [US2] Crear `tutorias_uts_back/src/pqrs/dto/list-mine-pqrs.query.ts` (`PageQuery` + `status` opcional del enum `PqrsStatus`)
- [X] T027 [US2] Añadir a `pqrs.service.ts` `listMine` y `getMine` (siempre filtrando por `authorId` del token y `deletedAt` nulo; una PQRS ajena es `404 PQRS_NOT_FOUND`, nunca `403`) y a `pqrs.controller.ts` `GET /pqrs/mine` y `GET /pqrs/mine/:id` con `@Roles('STUDENT', 'TEACHER')`, declarados antes de cualquier ruta `:id`
- [X] T028 [P] [US2] Crear `tutorias_uts_mobile/src/features/pqrs/hooks/useMyPqrs.ts` y `usePqrsDetail.ts` con TanStack Query
- [X] T029 [P] [US2] Crear `tutorias_uts_mobile/src/features/pqrs/components/StatusBadge.tsx` (texto más ícono, colores solo de `Design.md`), `PqrsCard.tsx` y `ResponseList.tsx`
- [X] T030 [US2] Completar `MyPqrsScreen.tsx` con la lista, los chips de filtro por estado y el botón "Nueva PQRS"; crear `screens/PqrsDetailScreen.tsx` y las rutas `app/(student)/pqrs/[id].tsx` y `app/(teacher)/pqrs/[id].tsx`
- [X] T031 [P] [US2] Añadir a `es.json` y `en.json` los textos de la lista y el detalle (`pqrs.list.*`, `pqrs.detail.*`, `pqrs.status.*`) y los íconos de estado en `registry.ts`

**Checkpoint**: US1 y US2 funcionan: el autor radica y consulta lo propio.

---

## Phase 5: User Story 3 - Gestionar las PQRS como CAE (Priority: P1)

**Goal**: El CAE ve todas las PQRS con filtros, las pasa a "En revisión", responde y resuelve, con las reglas de transición validadas en el servidor.

**Independent Test**: Con PQRS de un docente y de un estudiante, filtrar, pasar una a "En revisión", responder y resolver; las acciones inválidas se rechazan con su código.

### Tests for User Story 3 ⚠️

- [X] T032 [P] [US3] Escribir `tutorias_uts_back/test/pqrs-admin.e2e-spec.ts`: `GET /pqrs` filtra por `status`, `typeId` y `authorRole` solos y combinados, de la más reciente a la más antigua, con paginación, y devuelve el autor (nombre, correo y rol); `GET /pqrs/:id` devuelve cualquier PQRS con sus respuestas, `reviewedAt` y `resolvedAt`; un id inexistente responde `404 PQRS_NOT_FOUND`
- [X] T033 [P] [US3] Escribir `tutorias_uts_back/test/pqrs-transitions.e2e-spec.ts`: `review` desde `FILED` pone `IN_REVIEW` y `reviewedAt`; `review` desde `IN_REVIEW` o `RESOLVED` responde `409 PQRS_INVALID_TRANSITION`; responder una `FILED` o una `RESOLVED` responde `409 PQRS_NOT_IN_REVIEW`; responder una `IN_REVIEW` crea la respuesta (`201`) con autor y fecha; el cuerpo vacío o por encima de `pqrs.responseMaxLength` responde `400`; resolver una `FILED` responde `409 PQRS_INVALID_TRANSITION`; resolver una `IN_REVIEW` sin respuestas responde `409 PQRS_RESPONSE_REQUIRED`; resolver con al menos una respuesta pone `RESOLVED` y `resolvedAt`; una `RESOLVED` no admite ningún cambio; dos resoluciones simultáneas dan un `200` y un `409`; responder y resolver a la vez nunca deja una respuesta en una PQRS ya `RESOLVED`
- [X] T034 [P] [US3] Añadir a `test/pqrs-roles.e2e-spec.ts` los casos de US3: `STUDENT` y `TEACHER` reciben `403` en `GET /pqrs`, `GET /pqrs/:id`, `POST /pqrs/:id/review`, `POST /pqrs/:id/responses` y `POST /pqrs/:id/resolve`; sin sesión `401`
- [X] T035 [P] [US3] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/AdminPqrsScreen.test.tsx` y `AdminPqrsDetailScreen.test.tsx`: los filtros de estado, tipo y rol del autor se combinan; los botones visibles dependen del estado y una acción no disponible muestra la regla que la bloquea ("primero pásala a En revisión", "primero responde"); el contador de la respuesta respeta el límite

### Implementation for User Story 3

- [X] T036 [P] [US3] Crear `tutorias_uts_back/src/pqrs/dto/list-pqrs.query.ts` (`PageQuery` + `status`, `typeId` uuid y `authorRole` en `TEACHER` | `STUDENT`, todos opcionales) y `dto/respond.dto.ts` (`body` obligatorio con espacios recortados; el máximo se valida contra `pqrs.responseMaxLength`)
- [X] T037 [US3] Añadir a `pqrs.service.ts` `listAll`, `getOne`, `review`, `respond` y `resolve`: cada acción en una transacción que bloquea la fila (`SELECT ... FOR UPDATE`), valida con `pqrs-transitions.ts` (`PQRS_INVALID_TRANSITION`, `PQRS_NOT_IN_REVIEW`, `PQRS_RESPONSE_REQUIRED`), escribe el cambio y registra con `OutboxService` el evento `PQRS_IN_REVIEW`, `PQRS_RESPONDED` o `PQRS_RESOLVED` con `{ pqrsId }` como único contenido; el filtro `authorRole` une `pqrs` con `users`
- [X] T038 [US3] Añadir a `pqrs.controller.ts` `GET /pqrs`, `GET /pqrs/:id`, `POST /pqrs/:id/review`, `POST /pqrs/:id/responses` y `POST /pqrs/:id/resolve`, todos `@Roles('SUPERADMIN')`, con `GET /pqrs/mine` y `GET /pqrs/limits` declarados antes que `GET /pqrs/:id` para que no los capture
- [X] T039 [P] [US3] Crear `tutorias_uts_mobile/src/features/pqrs/hooks/usePqrsAdmin.ts`, `usePqrsAdminDetail.ts`, `useReviewPqrs.ts`, `useRespondPqrs.ts` y `useResolvePqrs.ts` con la invalidación de `['pqrs']`
- [X] T040 [P] [US3] Crear `tutorias_uts_mobile/src/features/pqrs/components/PqrsFilters.tsx` (chips de estado, de tipo —con los elementos de `PQRS_TYPE`, también los desactivados— y de rol del autor, con `FilterChips`) y `ResponseComposer.tsx` (campo con contador por límite y botón "Responder" con ícono)
- [X] T041 [US3] Crear `screens/AdminPqrsScreen.tsx` y `screens/AdminPqrsDetailScreen.tsx` (autor con nombre y correo, botones "Pasar a revisión", "Responder" y "Resolver" con ícono a la izquierda y 16 px entre ellos, la regla visible cuando la acción no está disponible) y las rutas `app/(admin)/pqrs/{_layout,index,[id]}.tsx`; borrar `app/(admin)/pqrs.tsx`
- [X] T042 [P] [US3] Añadir a `es.json` y `en.json` los textos de la gestión (`pqrs.admin.*`) y los íconos en `registry.ts`

**Checkpoint**: Las tres historias P1 funcionan: radicar, consultar y gestionar.

---

## Phase 6: User Story 4 - Recibir aviso de cada cambio (Priority: P2)

**Goal**: Cada cambio de estado y cada respuesta avisa al autor por bandeja, push y correo, en el idioma del dispositivo.

**Independent Test**: Cambiar el estado y responder una PQRS y comprobar que el autor recibe tres avisos por acción, en su idioma, y que el tap lo lleva a la PQRS.

### Tests for User Story 4 ⚠️

- [X] T043 [P] [US4] Escribir `tutorias_uts_back/test/pqrs-notifications.e2e-spec.ts`: cada acción de US3 crea un aviso para el autor con `pqrsId` y `moduleId` nulo, con sus entregas `PUSH` y `EMAIL`; el idioma del aviso es el del autor (`es` o `en`); el texto de la respuesta no aparece en el título, el cuerpo ni el correo; un autor con la cuenta desactivada o eliminada no recibe aviso y el evento queda procesado con la razón registrada; el aviso queda en la bandeja aunque no haya dispositivos de push; un fallo del correo no revierte el cambio de estado
- [X] T044 [P] [US4] Añadir a `tutorias_uts_back/src/notifications/templates/templates.spec.ts` y `src/mail/templates/notice.spec.ts` los casos de las tres plantillas nuevas en español e inglés: incluyen el asunto y el estado, no incluyen el texto de la respuesta
- [X] T045 [P] [US4] Añadir a `tutorias_uts_mobile/src/features/notifications/__tests__/openTarget.test.ts`, `inbox.test.tsx` y `push.test.tsx` los casos de PQRS: un aviso o push con `pqrsId` abre el detalle de la PQRS del rol (`(student)`, `(teacher)`); uno con `moduleId` sigue yendo al módulo

### Implementation for User Story 4

- [X] T046 [US4] Añadir `pqrsSubject: string | null` a `NotificationContext` en `tutorias_uts_back/src/notifications/templates/types.ts` (con `null` en el `base()` de `event-context.ts`) y las tres plantillas de `PQRS_IN_REVIEW`, `PQRS_RESPONDED` y `PQRS_RESOLVED` en `templates/es.ts` y `templates/en.ts` (`TemplateSet` es un `Record<OutboxEventType, ...>`, así que el compilador exige las tres)
- [X] T047 [US4] Reemplazar en `tutorias_uts_back/src/notifications/event-context.ts` el `skip: 'PQRS_NOTICES_PENDING'` de T010 por `resolvePqrsEvent`: lee la PQRS viva; si el autor está activo y sin `deletedAt` devuelve un aviso con el asunto, si no devuelve `skip: 'AUTHOR_UNAVAILABLE'`; si la PQRS no existe, `skip: 'PQRS_NOT_FOUND'`
- [X] T048 [P] [US4] Añadir a `tutorias_uts_back/src/mail/templates/notice.es.ts` y `notice.en.ts` el marco del correo de los tres tipos (`info`, `info` y `success`) con su insignia y su introducción
- [X] T049 [US4] Añadir `noticeTarget(role, notice)` a `tutorias_uts_mobile/src/features/notifications/openTarget.ts` (con `pqrsId` va al detalle de la PQRS del rol; con `moduleId`, como `targetFor`) y usarlo en `screens/NotificationsScreen.tsx` y `hooks/usePushRegistration.ts`; el aviso de PQRS se muestra con su título y cuerpo, sin nombre de módulo

**Checkpoint**: El autor se entera de cada novedad y llega a la PQRS con un toque.

---

## Phase 7: User Story 5 - Proteger los tipos en uso (Priority: P3)

**Goal**: Un tipo de `PQRS_TYPE` con PQRS asociadas solo se desactiva; las PQRS conservan su tipo.

**Independent Test**: Radicar una PQRS con un tipo, intentar eliminarlo y comprobar que se bloquea con la regla; desactivarlo y comprobar que la PQRS sigue mostrando su tipo.

### Tests for User Story 5 ⚠️

- [X] T050 [P] [US5] Añadir a `tutorias_uts_back/test/config-usage-rules.e2e-spec.ts` y `dropdown-lists.e2e-spec.ts` los casos de PQRS: eliminar el elemento de una PQRS (incluso una de borrado lógico) se bloquea con el mismo error de elemento en uso que ya existe; desactivarlo funciona y `GET /pqrs/mine/:id` y `GET /pqrs/:id` siguen devolviendo sus etiquetas; un elemento sin PQRS se elimina (lógico); la vista del elemento muestra `inUse: true`
- [X] T051 [P] [US5] Comprobar en `tutorias_uts_mobile/src/features/dropdown-lists/__tests__/dropdowns.test.tsx` que la pantalla de elementos muestra la regla cuando el elemento está en uso y no ofrece eliminarlo; añadir el caso si falta

### Implementation for User Story 5

- [X] T052 [US5] Modificar `tutorias_uts_back/src/config-usage/config-usage.service.ts`: `isDropdownItemInUse(itemId)` cuenta las filas de `pqrs` con ese `type_id`, incluidas las de borrado lógico, y devuelve `true` si hay alguna; actualizar el comentario de cabecera que dice que PQRS aún no existe
- [X] T053 [P] [US5] Revisar `tutorias_uts_mobile/src/features/dropdown-lists/screens/` y ajustar solo si la prueba de T051 falla (el mensaje de la regla ya está en `es.json` y `en.json`; no duplicar textos)

**Checkpoint**: Las cinco historias funcionan.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Contrato, privacidad, documentación, decisiones y cierre

- [X] T054 [P] Escribir `tutorias_uts_back/test/pqrs-contract.e2e-spec.ts` que valide las respuestas reales contra `specs/017-pqrs/contracts/pqrs-api.yaml` (mismo patrón de `accounts-contract.e2e-spec.ts` y `test/utils/contract.ts`), incluidos los códigos de error nuevos
- [X] T055 [P] Añadir a `tutorias_uts_back/test/log-redaction.e2e-spec.ts` que radicar, responder y resolver no escriben el asunto, la descripción ni el texto de la respuesta en los registros
- [X] T056 [P] Actualizar `Claude/docs/Context.md`: estados y transiciones de una PQRS, responder solo "En revisión", resolver exige al menos una respuesta, hilo de un solo sentido, avisos y tipo en uso
- [X] T057 [P] Actualizar `Claude/docs/Architecture.md`: tablas `Pqrs` y `PqrsMessage` con sus campos, `module_id` opcional y `pqrs_id` en eventos y avisos, los 9 endpoints y los diez tipos de evento de aviso
- [X] T058 [P] Actualizar `Claude/docs/Design.md` con las pantallas de PQRS (formulario, lista y detalle del autor, lista y detalle del CAE) y la insignia de estado con texto
- [X] T059 Registrar en `Claude/docs/Decisions.md` D-111 (flujo de PQRS: estados, responder y resolver solo desde "En revisión", resolver exige respuesta, hilo de un solo sentido, sin adjuntos ni reapertura) y D-112 (avisos de PQRS sin módulo: `pqrs_id` y `CHECK`, el aviso no copia el texto de la respuesta, `clientRequestId` para no duplicar), con su motivo
- [X] T060 [P] Comprobar en `tutorias_uts_back` y `tutorias_uts_mobile` que ningún `console.log` ni registro escribe texto de una PQRS, que `grep` de `Unidades Tecnológicas` no encuentra nada, que `python .claude/skills/i18n-strings/scripts/check_i18n.py <es.json> <en.json>` da paridad es/en y que no hay hexadecimales, `fontFamily`, `fontWeight` ni librerías de íconos distintas de Iconify en los componentes nuevos
- [ ] T061 Recorrer los 16 escenarios de `specs/017-pqrs/quickstart.md` en español e inglés con la app y la API en marcha y anotar el resultado en ese archivo, incluido el tiempo de radicar (SC-001, menos de 2 minutos) y el de encontrar una PQRS con filtros entre 200 (SC-004, menos de 30 s)
- [X] T062 Ejecutar la habilidad `feature-done-check` (spec, pruebas de reglas de negocio, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte
- [ ] T063 Cambiar `Status` de `specs/017-pqrs/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de `tutorias_uts_db`, `tutorias_uts_back`, `tutorias_uts_mobile` (contra `main`) y `Claude` (contra `master`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 ya está hecha; T002 antes de cualquier prueba e2e; T003, T004 y T005 en paralelo después de T002 (T005 puede ir antes).
- **Foundational (Phase 2)**: depende de T002 y bloquea las historias. T007 antes de T008; T006, T009 y T012 en paralelo; T010 y T011 después de T009.
- **User Stories (Phase 3 en adelante)**: dependen de Foundational. US1 va primero porque crea el servicio, el controlador, el módulo y las rutas de la app que las demás completan. US2 depende de US1; US3 depende de US2 (comparte `StatusBadge`, `ResponseList` y el detalle); US4 depende de US3 (los eventos los registran las transiciones); US5 solo necesita T002 y T052 se puede hacer en paralelo con cualquier historia después de US1.
- **Polish (Phase 8)**: depende de que las historias estén terminadas; T054 necesita los 9 endpoints.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; no depende de otras historias.
- **US2 (P1)**: tras US1 (extiende `pqrs.service.ts`, `pqrs.controller.ts` y `MyPqrsScreen`).
- **US3 (P1)**: tras US2.
- **US4 (P2)**: tras US3 en backend; en la app solo necesita T012.
- **US5 (P3)**: independiente de US2 a US4; necesita que existan PQRS (T018).

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- DTO → servicio → controlador → app; hooks, componentes y textos antes de las pantallas que los usan.

### Parallel Opportunities

- Setup: T003, T004 y T005.
- Foundational: T006, T007, T009 y T012.
- US1: T013, T014 y T015 juntas; T016, T019, T020 y T021 juntas.
- US2: T023, T024 y T025 juntas; T026, T028, T029 y T031 juntas.
- US3: T032, T033, T034 y T035 juntas; T036, T039, T040 y T042 juntas.
- US4: T043, T044 y T045 juntas; T048 en paralelo con T046 y T047.
- US5: T050 y T051 juntas.
- Polish: T054, T055, T056, T057, T058 y T060.

## Parallel Example: User Story 3

```text
# Pruebas de US3 juntas:
T032 pqrs-admin.e2e-spec.ts (lista, filtros y detalle del CAE)
T033 pqrs-transitions.e2e-spec.ts (transiciones, respuesta exigida y carreras)
T034 pqrs-roles.e2e-spec.ts (403 a docentes y estudiantes)
T035 AdminPqrsScreen.test.tsx y AdminPqrsDetailScreen.test.tsx
```

## Implementation Strategy

### MVP First (User Stories 1 y 2)

1. Phase 1 y Phase 2 (T001 a T012): migración, configuración, máquina de estados y avisos sin módulo.
2. Phase 3 (US1): radicar.
3. Phase 4 (US2): consultar lo propio.
4. **Parar y validar**: docentes y estudiantes radican y consultan; el canal formal ya existe aunque aún no se gestione.

### Incremental Delivery

1. Setup y Foundational → base de datos y reglas probadas.
2. US1 y US2 → radicar y consultar (MVP).
3. US3 → el CAE gestiona; con esto el canal se cierra.
4. US4 → avisos por bandeja, push y correo.
5. US5 → protección de los tipos en uso.
6. Polish → contrato, docs, decisiones y Pull Requests.

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes.
- Verificar que las pruebas fallan antes de implementar.
- Un commit por historia (Conventional Commits, en inglés).
- Las pruebas e2e no se corren a la vez que otras suites ni con la API de desarrollo en marcha.
- T010 deja un `skip` provisional para los eventos de PQRS; T047 lo reemplaza. Mientras tanto un evento de PQRS se marca procesado sin avisos.
- Una PQRS ajena siempre responde `404 PQRS_NOT_FOUND`, nunca `403`, para no revelar que existe.
- Los límites de largo viven en configuración (`pqrs.*MaxLength`); ningún número va escrito en el código ni en los componentes.

## Notas de implementación (2026-11-22)

- T010 y T046 a T048: el compilador exigió las plantillas de aviso y los marcos de correo en cuanto `OutboxEventType` ganó los tres valores, así que las plantillas (T046, T048) y el aviso real de PQRS (T047) se escribieron junto con la fase 2. El `skip` provisional de T010 no llegó a existir en el código final.
- T003: la migración de la spec 006 ya inserta los cuatro tipos con ids fijos; no se tocó `seed.ts`.
- T019 y T028 y T039: los hooks se agruparon en `hooks/useAuthorPqrs.ts` y `hooks/useAdminPqrs.ts` en lugar de un archivo por hook; T040 se hizo dentro de las pantallas (cadenas de filtros y campo de respuesta) y `components/PqrsBody.tsx` comparte el cuerpo de la PQRS entre el autor y el CAE.
- T029: no hizo falta ningún ícono nuevo; se usan `pqrs`, `clock` y `success` del registro.
- T051 y T053: la pantalla de elementos ya mostraba la regla de "en uso" (`dropdowns.test.tsx`); no hubo cambios.
- Un error que cazaron las pruebas de la app: los códigos `PQRS_*` también hay que declararlos en `tutorias_uts_mobile/src/api/errors.ts` (`ERROR_CODES`), si no la app los muestra como un error inesperado.
- Las pruebas se escribieron antes del código, pero no se ejecutó una corrida roja previa de cada una; se corrieron todas en verde al terminar cada historia.
- T061 (recorrido manual de los 16 escenarios con la app y la API) sigue pendiente: lo hace el equipo. T062 se ejecutó el 2026-11-22: ver el informe en la descripción de los Pull Requests.
- La prueba `zz-worker-smoke.e2e-spec.ts` (smoke temporal con la cola real) falla igual sin los cambios de esta spec: el correo queda `PENDING` y no sale; no es de la 017. Dos pruebas de concurrencia (`enrollments-concurrency`, `modules-concurrency`) fallaron una vez por carga y pasan al correrlas solas.
