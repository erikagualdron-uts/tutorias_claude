---

description: "Task list for Notificaciones de cambios en los módulos"
---

# Tasks: Notificaciones de cambios en los módulos

**Input**: Design documents from `/specs/014-notifications/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/notifications-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principios II y V) exige pruebas de la notificación a inscritos, y `docs/Conventions.md` §6 exige pruebas de roles (`403`), contrato y reglas. Escribirlas primero y comprobar que fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1, US2 y US3 son P1 y van primero; US4, US5 y US6 son P2. Cambia `tutorias_uts_db` (una migración), `tutorias_uts_back` y `tutorias_uts_mobile`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 avisos creados desde los cambios, US2 bandeja en la app, US3 push, US4 correo, US5 ningún aviso se pierde ni se repite, US6 configurar el correo (CAE)
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma, migraciones y seed
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas junto al código en `__tests__/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes. Los textos de avisos, push y correo solo en las plantillas del backend (FR-006)
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`
- Nunca se registran correos, tokens de dispositivo, claves SMTP ni el texto de un aviso en los registros
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí (la base de datos de prueba es compartida)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Esquema, dependencia, variables de entorno y llaves compartidas.

- [X] T001 Agregar a `tutorias_uts_db/prisma/schema.prisma` los enums `NotificationChannel` (`PUSH`, `EMAIL`), `DeliveryStatus` (`PENDING`, `SENT`, `FAILED`, `SKIPPED`) y `DevicePlatform` (`ANDROID`, `IOS`) con `@@map` a `notification_channel`, `delivery_status` y `device_platform`
- [X] T002 Agregar a `tutorias_uts_db/prisma/schema.prisma` el modelo `Notification` (`notifications`): `id` UUID; `userId` → `users`; `eventId` → `outbox_events`; `type` `OutboxEventType`; `moduleId` → `modules`; `locale` `Locale`; `title` `VarChar(160)`; `body` `VarChar(1000)`; `readAt` `timestamptz?`; `createdAt` y `updatedAt`; **único** `(eventId, userId)`; índice `(userId, createdAt DESC, id DESC)`; sin `deletedAt`. Agregar las relaciones inversas en `User`, `OutboxEvent` y `Module`
- [X] T003 Agregar a `tutorias_uts_db/prisma/schema.prisma` el modelo `NotificationDelivery` (`notification_deliveries`): `id` UUID (también es el `jobId`); `notificationId` → `notifications`; `channel`; `status` con valor por defecto `PENDING`; `attempts` `Int` por defecto 0; `lastError` `VarChar(60)?` (solo códigos de causa); `sentAt` `timestamptz?`; `createdAt` y `updatedAt`; **único** `(notificationId, channel)`; índice `(status, updatedAt)`
- [X] T004 Agregar a `tutorias_uts_db/prisma/schema.prisma` el modelo `PushToken` (`push_tokens`): `id` UUID; `userId` → `users`; `sessionId` → `sessions`; `token` `VarChar(200)` **único** en toda la tabla; `platform` `DevicePlatform`; `createdAt`, `updatedAt` y `deletedAt` `timestamptz?`. Relaciones inversas en `User` y `Session`
- [X] T005 Crear la migración `tutorias_uts_db/prisma/migrations/<timestamp>_add_notifications/` con `npx prisma migrate dev --name add_notifications` y agregar al SQL el índice parcial `CREATE INDEX notifications_unread_idx ON notifications (user_id) WHERE read_at IS NULL` y el índice parcial `push_tokens_user_live_idx ON push_tokens (user_id) WHERE deleted_at IS NULL`; regenerar el cliente y verificar que `tutorias_uts_back` compila
- [X] T006 [P] Agregar `expo-notifications` (versión compatible con Expo SDK 58) a `tutorias_uts_mobile/package.json` con `npx expo install expo-notifications` y registrar su plugin (icono monocromo de Android desde `assets/brand/`, sin modificar el recurso) en `tutorias_uts_mobile/app.json`
- [X] T007 [P] Agregar a `tutorias_uts_back/src/config/env.ts` las variables `OUTBOX_POLL_SECONDS` (5), `NOTIFICATION_DELIVERY_ATTEMPTS` (8), `NOTIFICATION_BACKOFF_SECONDS` (15) y `NOTIFICATION_SWEEP_SECONDS` (60), validadas como enteros positivos, y documentarlas en `tutorias_uts_back/.env.example` y en `tutorias_uts_back/src/config/env.spec.ts` (valor por defecto y rechazo de valores no positivos)
- [X] T008 [P] Declarar en `tutorias_uts_mobile/src/icons/registry.ts` los íconos nuevos del set `solar` que falten: campana con punto (`solar:bell-linear` ya existe), `bell-off-linear`, `check-read-linear`, `letter-linear`, `server-linear`, `key-linear`, `user-linear` y `plain-linear`
- [X] T009 [P] Agregar a `tutorias_uts_mobile/src/api/types.ts` los tipos `Notification` (`id`, `type`, `moduleId`, `title`, `body`, `readAt`, `createdAt`), `NotificationPage`, `SmtpSettings` (`status`, `usingEnvironment`, `host`, `port`, `user`, `from`, `hasPassword`) y `SmtpTestResult` (`ok`, `cause`) según `contracts/notifications-api.yaml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Servicio de correo compartido, puertos de push y correo, plantillas, cola y utilidades de prueba que todas las historias usan.

**CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase.

- [X] T010 Crear `tutorias_uts_back/src/mail/smtp-config.service.ts` (`SmtpConfigService`): `resolve()` devuelve la configuración vigente en este orden (fila más reciente de `smtp_configs`, variables `SMTP_*`, ninguna) con `status` (`NOT_CONFIGURED`, `CONFIGURED`, `NEEDS_RECONFIGURATION` cuando `decryptAesGcm` falla) y `usingEnvironment`; `transport()` crea el transporte de Nodemailer en cada llamada (el cambio rige sin reiniciar, FR-030); `describe()` devuelve el estado sin clave. Registrar el proveedor y exportarlo en `tutorias_uts_back/src/mail/mail.module.ts`
- [X] T011 Refactorizar `tutorias_uts_back/src/mail/mail.processor.ts` para usar `SmtpConfigService` y borrar su método `smtp()` duplicado; mantener el comportamiento de los códigos de verificación y recuperación de la spec 001 (las pruebas existentes `mail-locale.e2e-spec.ts` y `auth-*.e2e-spec.ts` siguen pasando)
- [X] T012 [P] Crear `tutorias_uts_back/src/mail/smtp-config.service.spec.ts`: orden fila → entorno → ninguna, `NEEDS_RECONFIGURATION` con una clave de cifrado distinta, `usingEnvironment` y que `describe()` nunca incluye la clave
- [X] T013 [P] Crear `tutorias_uts_back/src/notifications/push/push-gateway.ts`: interfaz `PushGateway` (`send(messages)` devuelve un ticket por mensaje con `ok`/`error` y `getReceipts(ids)`), token de inyección `PUSH_GATEWAY` y `ExpoPushGateway` con `fetch` a `https://exp.host/--/api/v2/push/send` y `/getReceipts`, lotes de 100 mensajes, tiempo máximo de 10 s y mapeo del error `DeviceNotRegistered` a un código estable; sin dependencias nuevas
- [X] T014 [P] Crear `tutorias_uts_back/src/notifications/push/push-gateway.spec.ts`: lotes de 100, mapeo de tickets con error y de `DeviceNotRegistered`, tiempo agotado y que ningún registro incluye tokens (con `fetch` simulado)
- [X] T015 Crear `tutorias_uts_back/src/notifications/notifications.module.ts` con `BullModule.registerQueue({ name: 'notifications' })`, el proveedor `PUSH_GATEWAY` (`ExpoPushGateway`) y los proveedores vacíos de las historias; importarlo en `tutorias_uts_back/src/app.module.ts`
- [X] T016 [P] Agregar a `tutorias_uts_back/test/utils/test-app.ts` y `factories.ts` un `FakePushGateway` (registra los mensajes enviados y permite forzar tickets con error o fallos) sustituible por `PUSH_GATEWAY`, un transporte de correo falso que capture los mensajes y pueda fallar, un helper para crear inscripciones, ausencias y eventos del outbox, y un helper `runOutbox()` que ejecute el consumidor una vez; documentarlos junto a `FakeMailbox`
- [X] T017 [P] Crear `tutorias_uts_back/src/notifications/dto/notifications.dto.ts` con `NotificationQueryDto` (`page` ≥ 1, `limit` 1 a 100, por defecto 1 y 20, como `PageQueryDto`), `NotificationDto`, `NotificationPageDto`, `RegisterDeviceDto` (`token` `maxLength 200` con patrón `^Expo(nent)?PushToken\[.+\]$`; `platform` ∈ `ANDROID`, `IOS`) y `UnreadCountDto`, con `@ApiProperty` según el contrato

**Checkpoint**: Fundación lista; las historias pueden empezar.

---

## Phase 3: User Story 1 - Enterarme de un cambio en mi módulo (Priority: P1) MVP

**Goal**: Cada evento del outbox crea un aviso por estudiante inscrito, en su idioma y en hora de Bogotá, una sola vez por cambio y por persona.

**Independent Test**: Inscribir a un estudiante, reprogramar una sesión y comprobar que en pocos segundos existe su aviso con módulo, fecha anterior y nueva; un estudiante no inscrito no recibe nada.

### Tests for User Story 1

> Escribirlas primero y comprobar que fallan.

- [X] T018 [P] [US1] Crear `tutorias_uts_back/src/notifications/templates/templates.spec.ts`: las 7 plantillas en `es` y `en`, fechas y horas en `America/Bogota` aunque el reloj esté en UTC, resumen de 1, 2 a 3 y más de 3 sesiones (primera, última y cantidad), nuevo docente o salón en el texto, `title` ≤ 160 y `body` ≤ 1000 caracteres, y que ningún texto contiene identificadores ni datos personales
- [X] T019 [P] [US1] Crear `tutorias_uts_back/test/notifications-recipients.e2e-spec.ts` (usa la base de datos): inscripción ACTIVE recibe; CANCELLED con la sesión antes de `effective_until` recibe y CANCELLED vencida no; usuario inactivo o borrado no; con varias sesiones recibe si asiste a al menos una y el aviso lista solo las que le tocan; con ausencia viva en la única sesión no recibe; con ausencia borrada (`deletedAt`) sí recibe
- [X] T020 [P] [US1] Crear `tutorias_uts_back/test/notifications-outbox.e2e-spec.ts` para los 7 tipos de evento: reprogramar, cancelar solo una y "ella y las futuras" (un solo aviso), reactivar, cambio de docente, cambio de salón, festivo que cancela y festivo eliminado; estudiante no inscrito o que canceló no recibe; el idioma de cada aviso sale de `User.locale`; el docente y el CAE no reciben; el aviso queda con `moduleId`, `eventId` y el evento con `processedAt`; evento de módulo eliminado o sin inscritos queda procesado sin avisos

### Implementation for User Story 1

- [X] T021 [P] [US1] Crear `tutorias_uts_back/src/notifications/templates/es.ts`, `en.ts` e `index.ts`: una función pura por tipo de evento que recibe el contexto resuelto y devuelve `{ title, body }`, con el formato de fechas de `Intl.DateTimeFormat` en `America/Bogota`, el resumen de varias sesiones y el texto de qué cambió y qué hacer (FR-008); `renderNotification(type, locale, context)` como única entrada
- [X] T022 [P] [US1] Crear `tutorias_uts_back/src/notifications/event-context.ts`: lee al procesar el módulo, el docente nuevo y el salón nuevo (nombres) y las sesiones del evento (por `sessionId` o, en festivos, las del módulo del día de Bogotá de `payload.date`); devuelve `null` con el motivo cuando el módulo o las sesiones ya no existen (borrado lógico)
- [X] T023 [US1] Crear `tutorias_uts_back/src/notifications/recipients.ts`: devuelve los estudiantes que reciben un evento con `ATTENDS_SESSION` de `tutorias_uts_back/src/enrollments/seats.ts` (cambio de docente o salón: alguna sesión futura; con sesiones: al menos una afectada) con su `locale` y las sesiones que le tocan a cada uno, solo usuarios `ACTIVE` y `deletedAt` nulo; no copia datos del estudiante al evento
- [X] T024 [US1] Crear `tutorias_uts_back/src/notifications/outbox.consumer.ts`: toma hasta 50 eventos con `processed_at IS NULL` ordenados por `(created_at, id)` y procesa **uno por transacción** con `FOR UPDATE SKIP LOCKED`: resuelve contexto y destinatarios, crea los `notifications` con `createManyAndReturn` y `skipDuplicates` sobre `(event_id, user_id)`, crea una `notification_deliveries` por aviso y canal (`PUSH`, `EMAIL`) en `PENDING` y marca `processed_at`; un evento sin destino válido se marca procesado y se registra el motivo (sin datos personales); un error inesperado se registra (id y tipo) y deja el evento pendiente sin detener los demás
- [X] T025 [US1] Programar el consumidor en `tutorias_uts_back/src/notifications/notifications.module.ts` como trabajo repetible de BullMQ cada `OUTBOX_POLL_SECONDS` (un `Processor` para la cola `outbox-poll`), de modo que dos instancias no lo ejecuten a la vez, y reanudar los pendientes al arrancar (primer sondeo inmediato)
- [X] T026 [US1] Hacer pasar `T018`, `T019` y `T020`; ejecutar `npm run lint` y `npm run test` en `tutorias_uts_back`

**Checkpoint**: Los avisos existen en la base de datos para cada cambio; US1 es verificable sin app.

---

## Phase 4: User Story 2 - Ver mis avisos en la app (Priority: P1)

**Goal**: El usuario ve su bandeja paginada con contador de no leídos, marca uno o todos como leídos y abre el módulo desde el aviso.

**Independent Test**: Con dos avisos, abrir la bandeja, ver el contador en 2, tocar uno (se abre su módulo y el contador baja a 1) y usar "Marcar todo como leído" (el contador desaparece).

### Tests for User Story 2

- [X] T027 [P] [US2] Crear `tutorias_uts_back/test/notifications-inbox.e2e-spec.ts`: orden del más reciente al más antiguo con desempate por `id`, paginación (`meta.total`), solo los propios (los de otro usuario no aparecen y marcar uno ajeno responde `404`), contador, marcar leído conserva la primera `readAt`, "leer todo" devuelve cuántos cambió y la bandeja vacía devuelve `data: []`
- [X] T028 [P] [US2] Crear `tutorias_uts_back/test/notifications-roles.e2e-spec.ts`: cada endpoint de bandeja y de dispositivos responde `401` sin token y funciona para `STUDENT`, `TEACHER` y `SUPERADMIN` sobre su propia bandeja (FR-025)
- [X] T029 [P] [US2] Crear `tutorias_uts_back/test/notifications-contract.e2e-spec.ts` (bandeja y dispositivos) validando las respuestas contra `specs/014-notifications/contracts/notifications-api.yaml` con el helper `tutorias_uts_back/test/utils/contract.ts`
- [X] T030 [P] [US2] Crear `tutorias_uts_mobile/src/features/notifications/__tests__/inbox.test.tsx`: contador y avisos resaltados, orden, tocar un aviso lo marca leído y abre la ruta del módulo, "Marcar todo como leído", estado vacío, error con "Reintentar", carga de avisos anteriores al llegar al final y banner de sin conexión
- [X] T031 [P] [US2] Crear `tutorias_uts_mobile/src/features/notifications/__tests__/openTarget.test.ts`: la ruta del módulo por rol (`STUDENT` → módulo, `TEACHER` → cronograma, `SUPERADMIN` → módulos) y el caso de módulo que ya no existe (mensaje claro, sin pantalla vacía)

### Implementation for User Story 2

- [X] T032 [US2] Crear `tutorias_uts_back/src/notifications/notifications.service.ts`: `list(userId, page, limit)` con `ORDER BY created_at DESC, id DESC`, `unreadCount(userId)`, `markRead(userId, id)` (`404 NOTIFICATION_NOT_FOUND` si no es del dueño; `UPDATE … SET read_at = COALESCE(read_at, now())`) y `markAllRead(userId)`
- [X] T033 [US2] Crear `tutorias_uts_back/src/notifications/notifications.controller.ts` (`/notifications`): `GET /`, `GET /unread-count`, `POST /:id/read` y `POST /read-all`, con el guard de sesión (cualquier rol; `@Roles('STUDENT', 'TEACHER', 'SUPERADMIN')`), el usuario siempre del token y `@ApiTags('notifications')`; registrarlo en `notifications.module.ts`
- [X] T034 [P] [US2] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` las claves `notifications.*` (título, vacío, error, reintentar, marcar todo, sin leer, módulo no disponible, cada `type` si se muestra una etiqueta) y `errors.NOTIFICATION_NOT_FOUND`; la prueba de paridad existente debe seguir pasando
- [X] T035 [US2] Crear `tutorias_uts_mobile/src/features/notifications/hooks/useNotifications.ts` (`useInfiniteQuery` con la clave `['notifications']`), `useUnreadCount.ts` (clave `['notifications','unread']`, actualiza cada 60 s con la app abierta y al volver a primer plano) y `useMarkRead.ts` (marcar uno y todos con invalidación de ambas claves)
- [X] T036 [P] [US2] Crear `tutorias_uts_mobile/src/features/notifications/openTarget.ts`: convierte `{ moduleId }` y el rol en la ruta del módulo; sin otros efectos
- [X] T037 [US2] Crear `tutorias_uts_mobile/src/features/notifications/components/NotificationCard.tsx` (no leído resaltado con texto e ícono, no solo color; título, texto y fecha relativa; objetivo táctil de 48 px) y `NotificationsBell.tsx` (`solar:bell-linear`, contador con el rojo de error de `Design.md`, `accessibilityLabel` con el número)
- [X] T038 [US2] Crear `tutorias_uts_mobile/src/features/notifications/screens/NotificationsScreen.tsx` con los cuatro estados (cargando con `BrandLoader`, vacío con `EmptyState`, error con "Reintentar" y datos), banner de sin conexión, carga de más avisos al llegar al final y botón "Marcar todo como leído" con ícono a la izquierda; al tocar un aviso lo marca leído y navega con `openTarget` (mensaje claro si el módulo ya no existe)
- [X] T039 [US2] Crear las tres rutas delgadas `tutorias_uts_mobile/app/(student)/notifications.tsx`, `app/(teacher)/notifications.tsx` y `app/(admin)/notifications.tsx` que montan `NotificationsScreen`, ocultas de la barra de pestañas en `RoleTabs.tsx` o los `_layout.tsx` de cada grupo
- [X] T040 [US2] Agregar la campana con el contador en `tutorias_uts_mobile/src/components/AppBar.tsx`, junto al avatar y sin romper el menú de perfil, que navega a la ruta `notifications` del rol
- [X] T041 [US2] Hacer pasar `T027` a `T031`; `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; `npm run test:e2e` en `tutorias_uts_back`

**Checkpoint**: US1 y US2 funcionan: el estudiante ve sus avisos en la app.

---

## Phase 5: User Story 3 - Recibir el aviso como push en mi teléfono (Priority: P1)

**Goal**: Con permiso concedido, el aviso llega como push a todos los dispositivos del estudiante, abre el módulo al tocarlo y deja de llegar tras cerrar sesión o si el dispositivo es inválido.

**Independent Test**: Iniciar sesión en un dispositivo con permiso, provocar un cambio y recibir el push; cerrar sesión y comprobar que ya no llega.

### Tests for User Story 3

- [X] T042 [P] [US3] Crear `tutorias_uts_back/test/notifications-devices.e2e-spec.ts`: `PUT` idempotente (no duplica), un token existente de otro usuario pasa al nuevo, un token descartado se reactiva, token con formato inválido responde `400`, `DELETE` descarta solo el dispositivo propio y no falla si no existe, y `POST /auth/logout` descarta los dispositivos de esa sesión (no los de otras sesiones del mismo usuario)
- [X] T043 [P] [US3] Crear `tutorias_uts_back/test/notifications-delivery-push.e2e-spec.ts`: el push se envía con el mismo título y texto del aviso a todos los dispositivos vivos (dos dispositivos reciben), con `data` con `notificationId` y `moduleId`; sin dispositivos la entrega queda `SKIPPED` sin error; `DeviceNotRegistered` descarta el dispositivo y no reintenta; otros errores reintentan; el trabajo de recibos descarta tokens inválidos; rechazar el permiso (sin token) no impide el aviso en la app
- [X] T044 [P] [US3] Crear `tutorias_uts_mobile/src/features/notifications/__tests__/push.test.tsx`: la hoja explicativa antes del permiso del sistema, registro del token solo si se concede (con `expo-notifications` simulado), no volver a molestar tras un rechazo, tocar un push abre el módulo y marca el aviso leído, recibir un push con la app abierta actualiza el contador, (cerrar sesión descarta el dispositivo en el servidor, probado en `notifications-devices.e2e-spec.ts`)

### Implementation for User Story 3

- [X] T045 [US3] Crear `tutorias_uts_back/src/notifications/devices.service.ts` y `devices.controller.ts`: `PUT /notifications/devices` con `upsert` por `token` (reasigna usuario y `sessionId`, `deletedAt = null`) y `DELETE /notifications/devices/:token` (soft delete solo si es del usuario del token, `204` siempre); registrar en `notifications.module.ts`
- [X] T046 [US3] Modificar `tutorias_uts_back/src/auth/auth.service.ts` (`logout`) para marcar `deletedAt` en los `push_tokens` de la sesión que se cierra, sin dependencia circular (usar Prisma directo o un método de `DevicesService` exportado)
- [X] T047 [US3] Crear `tutorias_uts_back/src/notifications/delivery.processor.ts` (`@Processor('notifications')`) con el trabajo `push`: carga el aviso y la entrega, toma los dispositivos vivos del usuario cuya sesión no esté revocada, envía por `PUSH_GATEWAY` con `data: { notificationId, moduleId }`, marca `SENT`/`SKIPPED`, descarta con `deletedAt` los `DeviceNotRegistered`, relanza los demás errores para que BullMQ reintente y cuenta `attempts`; encola un trabajo diferido de recibos (15 min) con `ticketId` y token
- [X] T048 [US3] Crear `tutorias_uts_back/src/notifications/deliveries.service.ts`: `enqueue(deliveryIds)` agrega un trabajo por entrega en la cola `notifications` con `jobId = deliveryId`, `attempts = NOTIFICATION_DELIVERY_ATTEMPTS` y espera exponencial desde `NOTIFICATION_BACKOFF_SECONDS`; llamarlo desde `outbox.consumer.ts` después de confirmar la transacción
- [X] T049 [US3] Agregar en `delivery.processor.ts` el trabajo `receipts`: consulta `getReceipts`, descarta los tokens con `DeviceNotRegistered` y registra solo conteos, sin tokens
- [X] T050 [US3] Crear `tutorias_uts_mobile/src/features/notifications/push.ts` y `hooks/usePushRegistration.ts`: hoja propia que explica el permiso (textos en `notifications.push.*` de `es.json` y `en.json`), solicitud del permiso del sistema solo tras aceptar, `getExpoPushTokenAsync` con el `projectId` de `expo-constants`, `PUT /notifications/devices`, canal de Android, escuchas de recepción (invalidan el contador) y de toque (`openTarget` y marcar leído), y lectura de la respuesta inicial al arrancar con la app cerrada; no pide permiso en `expo-device` no físico
- [X] T051 [US3] Montar `usePushRegistration` una vez tras iniciar sesión en `tutorias_uts_mobile/src/features/shell/RoleTabs.tsx` (el cierre de sesión no pide descartar el dispositivo desde la app: `POST /auth/logout` ya lo descarta en el servidor, D-100); ofrecer "Activar notificaciones" desde `NotificationsScreen.tsx` si se rechazó
- [x] T052 [US3] Hacer pasar `T042` a `T044` y los de US1 y US2; `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; `npm run lint` y `npm run test:e2e` en `tutorias_uts_back` (lint, tipos y pruebas unitarias pasan; las e2e se cerraron en la spec 015, T032)

**Checkpoint**: US1, US2 y US3 funcionan: aviso en la app y push.

---

## Phase 6: User Story 4 - Recibir el aviso por correo (Priority: P2)

**Goal**: El estudiante recibe el aviso en su correo institucional, en su idioma y con las fechas en Bogotá; si el correo no está configurado queda pendiente sin perderse.

**Independent Test**: Provocar un cambio y comprobar que llega un correo con asunto y cuerpo en el idioma del estudiante.

### Tests for User Story 4

- [X] T053 [P] [US4] Crear `tutorias_uts_back/test/notifications-delivery-email.e2e-spec.ts`: asunto y cuerpo en el idioma del estudiante con módulo, cambio y fechas en Bogotá; fallo temporal se reintenta con espera exponencial y el aviso y el push no se retrasan; tras agotar `NOTIFICATION_DELIVERY_ATTEMPTS` la entrega pasa a `FAILED` con `lastError` y un registro sin correos ni claves y sin afectar a los demás destinatarios; correo vacío o de dominio no válido queda `SKIPPED` sin frenar los demás canales; sin configuración (ni fila ni `SMTP_*`) la entrega queda `PENDING` con `SMTP_NOT_CONFIGURED`, sin consumir intentos
- [X] T054 [P] [US4] Crear `tutorias_uts_back/src/mail/templates/notification.spec.ts`: el correo del aviso en `es` y `en`, texto plano, sin datos de otros estudiantes y con el pie institucional "Institución Universitaria Tecnológica de Santander – UTS"

### Implementation for User Story 4

- [X] T055 [P] [US4] Crear `tutorias_uts_back/src/mail/templates/notification.es.ts` y `notification.en.ts` y exponer `renderNotificationMail(locale, { title, body })` en `tutorias_uts_back/src/mail/templates/index.ts` (asunto = título, cuerpo = saludo, texto del aviso y pie)
- [X] T056 [US4] Agregar en `tutorias_uts_back/src/notifications/delivery.processor.ts` el trabajo `email`: valida el dominio del destinatario con `tutorias_uts_back/src/common/email.util.ts` y la configuración de dominios, usa `SmtpConfigService.transport()` y envía; sin configuración deja `PENDING` con `lastError = SMTP_NOT_CONFIGURED` sin consumir intento; en fallo definitivo (`@OnWorkerEvent('failed')` con los intentos agotados) marca `FAILED` y registra tipo de evento, canal y causa estable (sin correo ni clave)
- [x] T057 [US4] Hacer pasar `T053` y `T054`; `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back` (lint, tipos y pruebas unitarias pasan; las e2e se cerraron en la spec 015, T032)

**Checkpoint**: Los tres canales entregan.

---

## Phase 7: User Story 5 - Ningún aviso se pierde ni se repite (Priority: P2)

**Goal**: Cada cambio avisa una sola vez a cada inscrito aunque el servicio se reinicie o falle a mitad; las entregas pendientes se completan al recuperarse Redis, el push o el correo.

**Independent Test**: Provocar varios cambios, reiniciar el servicio durante el procesamiento y comprobar un solo aviso por cambio y destinatario.

### Tests for User Story 5

- [X] T058 [P] [US5] Crear `tutorias_uts_back/test/notifications-reliability.e2e-spec.ts`: eventos registrados con el servicio apagado se procesan todos y en orden de `created_at`; un segundo `runOutbox()` no duplica avisos ni entregas (índice único); una falla simulada a mitad de la transacción deja el evento pendiente y sin avisos parciales; un cambio con 40 inscritos donde falla el envío a uno entrega a los otros 39 y reintenta solo al fallido; evento sin inscritos queda procesado sin avisos; dos consumidores simultáneos no procesan el mismo evento
- [X] T059 [P] [US5] Crear `tutorias_uts_back/test/notifications-sweep.e2e-spec.ts`: con la cola caída tras confirmar la transacción las entregas `PENDING` se reencolan en el barrido; repetir `enqueue` con el mismo `jobId` no duplica el envío; el correo `PENDING` por falta de configuración se reencola solo cuando ya hay configuración; con push y SMTP caídos durante el tiempo de prueba, los avisos de la app existen y los envíos pendientes se completan al recuperarse (SC-004)

### Implementation for User Story 5

- [X] T060 [US5] Agregar a `tutorias_uts_back/src/notifications/deliveries.service.ts` el barrido `sweep()`: reencola las entregas `PENDING` con más de un minuto sin trabajo vivo (el `jobId = deliveryId` evita duplicados) y, para `SMTP_NOT_CONFIGURED`, solo si `SmtpConfigService.resolve()` ya devuelve configuración; programarlo como trabajo repetible de BullMQ cada `NOTIFICATION_SWEEP_SECONDS` en `notifications.module.ts`
- [X] T061 [US5] Revisar `tutorias_uts_back/src/notifications/outbox.consumer.ts` para que el orden de procesamiento sea determinista (`created_at`, `id`), que un evento con error se reintente en el siguiente sondeo y que el registro del error no repita el mismo evento más de una vez por minuto
- [x] T062 [US5] Hacer pasar `T058` y `T059`; `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back` (lint, tipos y pruebas unitarias pasan; las e2e se cerraron en la spec 015, T032)

**Checkpoint**: La entrega es fiable ante reinicios y caídas.

---

## Phase 8: User Story 6 - Configurar el servidor de correo como CAE (Priority: P2)

**Goal**: El CAE configura el servidor de correo desde la app, envía una prueba y ve el estado, sin que la clave se muestre ni se registre.

**Independent Test**: Como CAE, guardar datos válidos, enviar la prueba y verla llegar; volver a abrir y ver la clave oculta; como docente o estudiante, recibir `403`.

### Tests for User Story 6

- [X] T063 [P] [US6] Crear `tutorias_uts_back/test/smtp-settings.e2e-spec.ts`: estado `NOT_CONFIGURED` sin fila (con `usingEnvironment` si hay `SMTP_*`), guardar crea la fila con `passwordEncrypted` cifrada (nunca en texto plano ni en la respuesta ni en los registros), `GET` devuelve `hasPassword` sin clave, editar con `password` vacía o ausente conserva la anterior, crear sin clave responde `422 SMTP_PASSWORD_REQUIRED`, validación (`port` de 1 a 65535, `from` correo válido, campos vacíos, `host`/`user` ≤ 255) responde `400`, una sola fila tras guardar dos veces, `NEEDS_RECONFIGURATION` con otra clave de cifrado, el cambio rige en el siguiente envío sin reiniciar, y la prueba (con transporte falso) devuelve `ok` o la causa estable (`AUTH_FAILED`, `CONNECTION_FAILED`, `TIMEOUT`, `SENDER_REJECTED`, `UNKNOWN`) y se envía al correo del CAE del token
- [X] T064 [P] [US6] Agregar a `tutorias_uts_back/test/notifications-roles.e2e-spec.ts` los casos de `/settings/smtp` y `/settings/smtp/test`: `401` sin token y `403` para `TEACHER` y `STUDENT`
- [X] T065 [P] [US6] Agregar a `tutorias_uts_back/test/notifications-contract.e2e-spec.ts` la validación de `/settings/smtp` (`GET`, `PUT`) y `/settings/smtp/test` contra `contracts/notifications-api.yaml`
- [X] T066 [P] [US6] Crear `tutorias_uts_mobile/src/features/smtp/__tests__/smtp.test.tsx`: estado "Sin configurar" y aviso de variables de entorno, formulario con validación (puerto fuera de rango, remitente inválido, campos vacíos), clave oculta al reabrir y vacía conserva, prueba con resultado y causa en lenguaje simple, "Requiere configurar de nuevo", y los estados cargando, error y con datos

### Implementation for User Story 6

- [X] T067 [US6] Crear `tutorias_uts_back/src/settings/smtp/dto/smtp.dto.ts` con `SaveSmtpDto` (`host` y `user` no vacíos hasta 255; `port` entero de 1 a 65535; `password` opcional hasta 255; `from` correo válido hasta 255; con `@Trim()` de `common/trim.decorator.ts`), `SmtpSettingsDto` y `SmtpTestResultDto`
- [X] T068 [US6] Crear `tutorias_uts_back/src/settings/smtp/smtp.service.ts` y `smtp.controller.ts` (`@Roles('SUPERADMIN')`): `GET /settings/smtp` (estado de `SmtpConfigService.describe()`), `PUT /settings/smtp` (una sola fila: `upsert` de la más reciente; cifra con `encryptAesGcm` y `SMTP_ENCRYPTION_KEY`; clave vacía conserva la anterior; `422 SMTP_PASSWORD_REQUIRED` al crear sin clave) y `POST /settings/smtp/test` (envía al correo del CAE del token con un correo corto y devuelve `ok` o una causa mapeada desde el error de Nodemailer; `409 SMTP_NOT_CONFIGURED` sin configuración); registrarlos en `tutorias_uts_back/src/settings/settings.module.ts`; ningún registro incluye la clave ni el texto del servidor
- [X] T069 [P] [US6] Agregar a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` las claves `smtp.*` (título, estados, campos, ayuda del puerto, "dejar vacía para conservar", prueba, causas `AUTH_FAILED`, `CONNECTION_FAILED`, `TIMEOUT`, `SENDER_REJECTED`, `UNKNOWN`, aviso de variables de entorno) y `errors.SMTP_PASSWORD_REQUIRED` y `errors.SMTP_NOT_CONFIGURED`
- [X] T070 [US6] Crear `tutorias_uts_mobile/src/features/smtp/` con `hooks/useSmtpSettings.ts`, `schemas.ts` (Zod con las mismas reglas que el DTO) y `screens/SmtpSettingsScreen.tsx`: tarjeta de estado con badge (texto e ícono), campos con relleno, borde tenue e ícono a la izquierda, clave como campo protegido, botones "Guardar" y "Enviar correo de prueba" con ícono a la izquierda y 16 px entre ellos, resultado de la prueba con la causa traducida, y los cuatro estados de pantalla
- [X] T071 [US6] Crear `tutorias_uts_mobile/app/(admin)/more/smtp.tsx` (ruta delgada) y agregar la entrada "Correo" al menú de `tutorias_uts_mobile/src/features/shell/screens/MoreScreen.tsx` (solo CAE) con su ícono
- [x] T072 [US6] Hacer pasar `T063` a `T066`; `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`; `npm run lint` y `npm run test:e2e` en `tutorias_uts_back` (lint, tipos y pruebas unitarias pasan; las e2e se cerraron en la spec 015, T032)

**Checkpoint**: Las seis historias funcionan de forma independiente.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Documentación, decisiones, seguridad y verificación final.

- [X] T073 [P] Actualizar `docs/Architecture.md`: §5 (campos de `Notification`, nueva `NotificationDelivery`, `PushToken` con `sessionId` y `deletedAt`, nota de `SmtpConfig` con su pantalla), §9 (consumidor, entrega con barrido, estados y reintentos) y la nota de que `OutboxEvent` ya tiene consumidor
- [X] T074 [P] Actualizar `docs/Context.md` §4 (bandeja para los tres roles, push y correo, configuración del SMTP por el CAE) y `docs/Design.md` (campana con contador en la barra superior, pantalla de la bandeja y pantalla de configuración del correo)
- [X] T075 Actualizar `docs/Decisions.md`: D-087 pasa a "condición cumplida con la spec 014" y se agregan D-098 (entrega atómica con barrido de pendientes), D-099 (contador por consulta periódica y al recibir un push, sin WebSocket) y D-100 (cliente propio de Expo Push y recibos en un trabajo diferido)
- [X] T076 [P] Agregar a `tutorias_uts_back/test/log-redaction.e2e-spec.ts` casos que comprueben que los registros del consumidor, la entrega y la configuración del correo no contienen correos, tokens de dispositivo, la clave SMTP ni el texto de un aviso
- [X] T077 [P] Agregar una prueba de retención en `tutorias_uts_back/test/notifications-inbox.e2e-spec.ts`: ningún aviso se oculta ni se borra por antigüedad (decisión del 2026-11-18)
- [x] T078 Ejecutar el recorrido de `specs/014-notifications/quickstart.md` (los 12 pasos) y anotar el resultado del push real en iPhone con Expo Go o compilación de desarrollo (el canal de correo se recorrió en la spec 015, T033; el push real en iPhone sigue pendiente como verificación de dispositivo)
- [x] T079 Ejecutar la habilidad `feature-done-check` (spec, pruebas de reglas de negocio, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte antes de unir la rama (hecha en la spec 015, T034)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; `T001` a `T004` antes de `T005`.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias.
- **US1 (Phase 3)**: depende de la fundación. **MVP.**
- **US2 (Phase 4)**: depende de la fundación; la bandeja se prueba con avisos creados a mano o con los de US1.
- **US3 (Phase 5)**: depende de US1 (los avisos y las entregas) y de `T048` para encolar; comparte `delivery.processor.ts` con US4.
- **US4 (Phase 6)**: depende de US3 para `delivery.processor.ts`, `deliveries.service.ts` y la cola.
- **US5 (Phase 7)**: depende de US3 y US4 (barrido y reintentos de ambos canales).
- **US6 (Phase 8)**: depende de la fundación (`SmtpConfigService`); independiente de US2 a US5, salvo `T071` que toca `MoreScreen.tsx`.
- **Polish (Phase 9)**: depende de las historias deseadas.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- Plantillas y destinatarios antes del consumidor; servicio antes del controlador; hooks antes de las pantallas; pantallas antes de las rutas.
- Las tareas que tocan el mismo archivo (`delivery.processor.ts`, `notifications.module.ts`, `es.json`, `en.json`, `test-app.ts`) no son `[P]` entre sí.

### Parallel Opportunities

- Setup: `T006` a `T009` en paralelo; `T001` a `T004` son del mismo archivo.
- Fundación: `T012`, `T013`, `T014`, `T016` y `T017` en paralelo.
- US1: `T018` a `T022` en paralelo (archivos distintos).
- US2: `T027` a `T031` en paralelo; `T034` y `T036` en paralelo.
- US3: `T042` a `T044` en paralelo.
- US6 puede avanzar en paralelo con US2 a US5 por otra persona (backend `T063` a `T068`, app `T066` a `T071`).

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 juntas:
Task: "Pruebas de plantillas en tutorias_uts_back/src/notifications/templates/templates.spec.ts"
Task: "Pruebas de destinatarios en tutorias_uts_back/src/notifications/recipients.spec.ts"
Task: "e2e de eventos a avisos en tutorias_uts_back/test/notifications-outbox.e2e-spec.ts"

# Piezas independientes de US1:
Task: "Plantillas es/en en tutorias_uts_back/src/notifications/templates/"
Task: "Contexto del evento en tutorias_uts_back/src/notifications/event-context.ts"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup y Fundación.
2. US1: avisos creados desde los eventos (verificable en la base de datos y con pruebas).
3. **Detenerse y validar** con `T020`.
4. Seguir con US2 para que el estudiante los vea (primer valor visible).

### Incremental Delivery

1. Setup + Fundación → base lista.
2. US1 → avisos en la base de datos.
3. US2 → bandeja y contador (**el canal que siempre funciona**).
4. US3 → push.
5. US4 → correo.
6. US5 → garantías ante reinicios y caídas.
7. US6 → configuración del correo del CAE (puede ir en paralelo desde la fundación).
8. Polish y `feature-done-check`.

### Notas

- La inscripción de la spec 011 **no se publica** en producción hasta que esta funcionalidad lo esté (D-087); al terminar `T075` la condición queda cumplida.
- Commits en formato Conventional Commits, uno por tarea o grupo lógico (`feat(notifications): …`).
- Avisos a docentes, anuncios, mensajes y PQRS quedan fuera: reutilizarán la bandeja, los dispositivos y la cola con plantillas propias.
