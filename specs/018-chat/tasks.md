---

description: "Task list for Chat y anuncios"
---

# Tasks: Chat y anuncios

**Input**: Design documents from `/specs/018-chat/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-api.yaml, contracts/chat-socket.md, quickstart.md

**Tests**: Incluidas. La constitución (Principios II y V) y `docs/Conventions.md` §6 exigen pruebas de roles y de las reglas críticas; aquí son quién puede hablar con quién, el solo lectura, los anuncios, la ventana de visibilidad, los sin leer y la retención. Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1, US2 y US3 son P1 y van primero; US4 y US5 son P2; US6 es P3. Cambia `tutorias_uts_db` (una migración con tablas), `tutorias_uts_back` y `tutorias_uts_mobile`. La entrega puede hacerse en dos tandas: US1 a US4 (chat individual con push) y US5 y US6 (chat del módulo, anuncios y retención).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 conversar uno a uno, US2 ver mis conversaciones y sin leer, US3 enviar y recibir al instante, US4 push para quien no está conectado, US5 chat del módulo y anuncios, US6 retención
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma, migraciones y seed
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas junto al código en `__tests__/`
- `Claude/` = `docs/` y `specs/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados (`spacing.lg`)
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`. Un código nuevo se declara en **los dos** lados: `tutorias_uts_back/src/common/errors/app.exception.ts` y `tutorias_uts_mobile/src/api/errors.ts` (`ERROR_CODES`); si falta en la app, se muestra como error inesperado
- Cada endpoint exige sesión (`JwtAuthGuard` global); los permisos de pertenencia los decide `chat-access.ts`; una conversación ajena responde `404 CHAT_NOT_FOUND`, nunca `403`
- El texto de un mensaje, un correo o un teléfono nunca van a los registros (logs) ni a los eventos del socket más allá del propio mensaje
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí ni con la API de desarrollo en marcha (base de datos y Redis compartidos); correr los e2e en tandas de 32 archivos como máximo y la app con `--maxWorkers=2` (la memoria de esta máquina se agota con las baterías completas)
- Las pruebas del socket necesitan que la aplicación escuche: `await ctx.app.listen(0)` y conectar con `socket.io-client` a `http://127.0.0.1:<puerto>/chat`
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF
- En la base de desarrollo usar `npx prisma migrate deploy`, no `migrate dev` (pide resetear: una migración antigua cambió)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ramas, dependencias, migración, configuración, códigos de error y piezas de prueba que todas las historias usan

- [X] T001 Crear la rama `018-chat` en `Claude`, `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db` a partir de `017-pqrs`; ya hecho
- [X] T002 Instalar las dependencias del tiempo real: en `tutorias_uts_back`, `npm install @nestjs/websockets @nestjs/platform-socket.io` y `npm install -D socket.io-client`; en `tutorias_uts_mobile`, `npx expo install socket.io-client`; comprobar que `npm run typecheck` y las pruebas siguen en verde
- [X] T003 Modificar `tutorias_uts_db/prisma/schema.prisma` y crear `tutorias_uts_db/prisma/migrations/<ts>_add_chat/migration.sql` según `specs/018-chat/data-model.md`: enums `ConversationType` (`DIRECT`, `MODULE`) y `MessageKind` (`TEXT`, `ANNOUNCEMENT`); tabla `conversations` con `type`, `module_id` → `modules` nulo, `direct_key` `VarChar(73)` nulo, `last_message_at` timestamptz nulo, `created_at`, `updated_at`, `deleted_at`, `CHECK ((type = 'DIRECT' AND direct_key IS NOT NULL AND module_id IS NULL) OR (type = 'MODULE' AND module_id IS NOT NULL AND direct_key IS NULL))` e índices único `(module_id)`, único `(direct_key)` y `(last_message_at DESC)`; tabla `conversation_members` con clave `(conversation_id, user_id)`, `last_read_at` timestamptz nulo, `created_at` e índice `(user_id)`; tabla `messages` con `conversation_id`, `sender_id`, `kind` por defecto `TEXT`, `body` `VarChar(4000)`, `client_message_id` uuid, `created_at`, `deleted_at` e índices único `(conversation_id, sender_id, client_message_id)` y `(conversation_id, created_at DESC, id DESC)`; claves foráneas con `ON DELETE RESTRICT`. Aplicar con `npx prisma migrate deploy` en la base de desarrollo y en la de pruebas (`TEST_DATABASE_URL` del `.env` del backend) y regenerar el cliente con `npm run prisma:generate` en `tutorias_uts_back`
- [X] T004 [P] Añadir a `tutorias_uts_back/src/settings/settings.service.ts` las claves `chat.messageMaxLength` (2000), `chat.directRetentionMonths` (24), `chat.moduleRetentionMonths` (6) y `chat.pushBurstSeconds` (60) en `SettingValues` y `SETTING_DEFAULTS`, con sus valores por defecto probados en `src/settings/settings.service.spec.ts`
- [X] T005 [P] Añadir a `tutorias_uts_back/src/common/errors/app.exception.ts` los códigos `CHAT_NOT_FOUND`, `CHAT_PARTNER_NOT_ALLOWED`, `CHAT_READ_ONLY` y `CHAT_ANNOUNCEMENT_FORBIDDEN` y actualizar su comentario de contratos con la spec 018
- [X] T006 [P] Añadir a `tutorias_uts_mobile/src/api/errors.ts` (`ERROR_CODES`) los mismos cuatro códigos y a `src/i18n/es.json` y `en.json` sus textos de error (`errors.CHAT_NOT_FOUND`, `errors.CHAT_PARTNER_NOT_ALLOWED`, `errors.CHAT_READ_ONLY`, `errors.CHAT_ANNOUNCEMENT_FORBIDDEN`) y los de cada motivo de solo lectura (`chat.readOnly.NO_SHARED_MODULE`, `chat.readOnly.PERIOD_CLOSED`, `chat.readOnly.PARTNER_UNAVAILABLE`), cada uno diciendo la regla ("Ya no comparten un módulo", "El periodo está cerrado"…); paridad es/en (skill `i18n-strings`)
- [X] T007 [P] Añadir a `tutorias_uts_back/test/utils/factories.ts` `createDirectConversation(prisma, { a, b })`, `createModuleConversation(prisma, { moduleId })` y `createMessage(prisma, { conversationId, senderId, body?, kind?, createdAt? })`; crear `tutorias_uts_back/test/utils/chat.ts` con `connectChat(ctx, token)` (cliente `socket.io-client` conectado al espacio `/chat` con un `waitFor(event)` que falla a los 3 s, que pone `await ctx.app.listen(0)` la primera vez) y reutilizar `signIn`, `studentCaller`, `teacherCaller` y `adminCaller` de `test/utils/pqrs.ts`; comprobar que `reset()` de `test/utils/test-app.ts` vacía las tablas nuevas (se vacían por cascada desde `users` y `modules`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Las reglas puras de acceso, la presencia y el criterio único de dispositivos, que varias historias comparten

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [X] T008 [P] Escribir `tutorias_uts_back/src/chat/chat-access.spec.ts` con la función pura `writeDecision(facts)`: individual CAE y docente permite siempre con las dos cuentas activas; individual docente y estudiante permite solo con inscripción `ACTIVE` en un módulo vivo del docente con periodo no cerrado y si no devuelve solo lectura `NO_SHARED_MODULE`; módulo permite al docente del módulo y a estudiantes con inscripción `ACTIVE` y periodo no cerrado, si el periodo está cerrado da solo lectura `PERIOD_CLOSED`, y a un estudiante sin inscripción `ACTIVE` no le da ningún acceso (la conversación no existe para él); la otra cuenta desactivada o eliminada da `PARTNER_UNAVAILABLE`; solo el docente del módulo puede anunciar; una pareja estudiante con estudiante o estudiante con CAE no está permitida
- [X] T009 Implementar `tutorias_uts_back/src/chat/chat-access.ts` con `writeDecision(facts)` y el tipo `AccessFacts`, hasta que T008 pase
- [X] T010 [P] Extraer de `tutorias_uts_back/src/notifications/deliveries.service.ts` el criterio de dispositivos vivos (token sin `deletedAt` y sesión sin revocar ni vencida) a `tutorias_uts_back/src/notifications/devices.ts` (`liveDevices(prisma, userId, now)`) y usarlo desde `DeliveriesService`; las pruebas existentes `test/notifications-delivery-push.e2e-spec.ts` siguen en verde
- [X] T011 [P] Escribir `tutorias_uts_back/src/chat/chat-presence.spec.ts`: abrir una conversación en un socket la marca abierta para ese usuario; cerrarla o desconectar el socket la deja cerrada; dos sockets del mismo usuario cuentan (queda abierta mientras alguno la tenga); un usuario sin sockets no la tiene abierta
- [X] T012 Implementar `tutorias_uts_back/src/chat/chat-presence.ts` (`ChatPresence`: mapa en memoria de socket a conversaciones y usuario, con `open`, `close`, `drop(socketId)` e `isOpen(userId, conversationId)`) hasta que T011 pase

**Checkpoint**: Las reglas de acceso y la presencia están probadas y los dispositivos vivos tienen un solo criterio.

---

## Phase 3: User Story 1 - Conversar uno a uno (Priority: P1) 🎯 MVP

**Goal**: Quien puede hablar con alguien abre su conversación y se escriben; una pareja no permitida se rechaza en el servidor.

**Independent Test**: Con un estudiante inscrito, su docente y el CAE: el estudiante escribe al docente, el docente responde, el CAE escribe al docente; un estudiante no inscrito en ningún módulo de ese docente no puede escribirle.

### Tests for User Story 1 ⚠️

> Escribir primero y comprobar que fallan

- [X] T013 [P] [US1] Escribir `tutorias_uts_back/test/chat-direct.e2e-spec.ts`: `GET /chat/contacts` devuelve al CAE los docentes activos, al docente los estudiantes con inscripción `ACTIVE` en sus módulos vivos (periodo no cerrado) y al CAE, y al estudiante los docentes de sus módulos, con búsqueda sin tildes; `POST /chat/conversations` crea la individual (`201`) y la repetida devuelve la misma (`200`) en cualquier orden de la pareja; una pareja no permitida responde `403 CHAT_PARTNER_NOT_ALLOWED`; `POST /chat/conversations/:id/messages` guarda el mensaje (`201`, `kind` `TEXT`, `createdAt` en UTC, el remitente con nombre), recorta espacios, rechaza vacío o solo espacios y un cuerpo por encima de `chat.messageMaxLength` con `400 VALIDATION_FAILED` y `details.fields`, y el mismo `clientMessageId` del mismo remitente devuelve el mismo mensaje con `200` sin duplicarlo (también con dos envíos a la vez); tras perder la inscripción el envío responde `409 CHAT_READ_ONLY` con `details.reason` `NO_SHARED_MODULE` pero `GET /chat/conversations/:id` sigue funcionando con `canWrite` falso; con la cuenta de la otra persona desactivada o eliminada responde `409` con `PARTNER_UNAVAILABLE`; `GET /chat/conversations/:id` de una ajena responde `404 CHAT_NOT_FOUND`
- [X] T014 [P] [US1] Crear `tutorias_uts_back/test/chat-roles.e2e-spec.ts` con los casos de US1: sin sesión `401` en `GET /chat/contacts`, `POST /chat/conversations`, `GET /chat/conversations/:id` y `POST /chat/conversations/:id/messages`; los tres roles reciben `200` o `201` en lo que les corresponde; un estudiante recibe `403` al intentar escribirle a otro estudiante o al CAE (las siguientes historias añaden sus rutas a este archivo)
- [X] T015 [P] [US1] Escribir `tutorias_uts_mobile/src/features/chat/__tests__/NewChatScreen.test.tsx` y `ChatScreen.test.tsx`: la pantalla de contactos muestra a quien puede escribir y abre la conversación; el compositor deshabilita "Enviar" con el campo vacío y muestra el contador del límite que da la API; enviar llama a la API con un `clientMessageId` y el texto recortado; una conversación de solo lectura oculta el compositor y muestra la regla del motivo en español e inglés; los cuatro estados (cargando, error con reintento, vacío, con datos)

### Implementation for User Story 1

- [X] T016 [P] [US1] Crear en `tutorias_uts_back/src/chat/dto/` `create-direct.dto.ts` (`userId` uuid), `send-message.dto.ts` (`clientMessageId` uuid, `body` recortado y obligatorio, `kind` opcional del enum `MessageKind`; el máximo se valida en el servicio contra `chat.messageMaxLength` y responde `VALIDATION_FAILED` con `details.fields`) y `contacts.query.ts` (`search` opcional de 100 caracteres como máximo)
- [X] T017 [US1] Crear `tutorias_uts_back/src/chat/chat.service.ts` con `contacts`, `createDirect`, `getConversation` y `sendMessage`: el contacto y el acceso se calculan con `chat-access.ts` a partir de filas vivas; `createDirect` arma `directKey` con los dos ids ordenados y unidos por `:` y es idempotente (índice único, devuelve la existente con `created: false`) y crea las dos filas de `conversation_members`; `sendMessage` valida el acceso (`CHAT_NOT_FOUND`, `CHAT_READ_ONLY` con `details.reason`), inserta el mensaje y actualiza `last_message_at` en una transacción, y ante el índice único `(conversation_id, sender_id, client_message_id)` devuelve el existente con `created: false`; `getConversation` devuelve `canWrite`, `readOnlyReason`, `canAnnounce` y `limits.messageMaxLength`
- [X] T018 [US1] Crear `tutorias_uts_back/src/chat/chat.controller.ts` con `GET /chat/contacts`, `POST /chat/conversations` (`201` o `200` con `@Res({ passthrough: true })`), `GET /chat/conversations/:id` y `POST /chat/conversations/:id/messages` (`201` o `200`), sin `@Roles` (cualquier rol con sesión, la pertenencia la decide el servicio); crear `chat.module.ts` (importa solo los módulos que use) y registrarlo en `tutorias_uts_back/src/app.module.ts`
- [X] T019 [P] [US1] Crear `tutorias_uts_mobile/src/features/chat/types.ts` con los tipos del contrato (`Contact`, `ConversationSummary`, `ConversationDetail`, `ChatMessage`, `ReadOnlyReason`) y `hooks/useChatActions.ts` (`useContacts`, `useCreateDirect`, `useConversation`, `useSendMessage`) con TanStack Query; añadir los tipos que hagan falta a `src/api/types.ts`; reutilizar `newRequestId()` de `src/features/pqrs/requestId.ts` para el `clientMessageId`
- [X] T020 [P] [US1] Crear `tutorias_uts_mobile/src/features/chat/components/Composer.tsx` (campo con relleno y borde tenue que crece hasta 5 líneas, botón de enviar de 48 px con ícono, deshabilitado con el campo vacío, contador), `MessageBubble.tsx` (recibido y enviado según `Design.md`, hora en `America/Bogota`) y `ReadOnlyNotice.tsx` (banner con la regla del motivo)
- [X] T021 [US1] Crear `tutorias_uts_mobile/src/features/chat/screens/NewChatScreen.tsx` (lista de contactos con `SearchField`, cuatro estados) y `ChatScreen.tsx` mínima (encabezado con el nombre, mensajes de la conversación, compositor o aviso de solo lectura); crear las rutas `app/(student)/messages/{_layout,index,new,[id]}.tsx`, `app/(teacher)/messages/...` y `app/(admin)/messages/...` con el patrón de `app/(student)/modules/`, con `index` mostrando `MessagesScreen` mínima (botón "Nuevo mensaje" con ícono y estado vacío) y borrar los `messages.tsx` de los tres grupos
- [X] T022 [P] [US1] Añadir a `es.json` y `en.json` los textos de US1 (`chat.title`, `chat.new.*`, `chat.composer.*`, `chat.empty.*`, `chat.send`) y declarar en `src/icons/registry.ts` los íconos nuevos que falten (nuevo mensaje, enviar, grupo)

**Checkpoint**: US1 funciona y se puede probar sola: se abre una conversación y se escriben.

---

## Phase 4: User Story 2 - Ver mis conversaciones y lo que no he leído (Priority: P1)

**Goal**: El usuario ve solo sus conversaciones ordenadas, con el último mensaje y los sin leer, abre una, lee el historial por tramos y queda leída.

**Independent Test**: Con varias conversaciones y mensajes sin leer, abrir la lista, comprobar orden y contadores, abrir una y comprobar que su contador queda en cero y los demás no cambian.

### Tests for User Story 2 ⚠️

- [X] T023 [P] [US2] Escribir `tutorias_uts_back/test/chat-conversations.e2e-spec.ts`: `GET /chat/conversations` lista solo las mías, de la que tiene el último mensaje más reciente a la más antigua, con `partner`, `lastMessage`, `lastMessageAt` y `unread`; una individual sin mensajes vivos no aparece; los mensajes propios no cuentan como sin leer; `GET /chat/conversations/:id/messages` devuelve de lo más nuevo a lo más viejo con `limit` y el cursor `next`, sin saltos ni repeticiones con mensajes del mismo instante, y `next` nulo al final; `POST /chat/conversations/:id/read` pone `lastReadAt` y devuelve el total restante sin tocar las demás; `GET /chat/unread-count` coincide con la suma; una conversación ajena responde `404 CHAT_NOT_FOUND` en historial y lectura; un mensaje con `deletedAt` no aparece ni cuenta; `limit` fuera de 1 a 100 o un cursor inválido responde `400`
- [X] T024 [P] [US2] Añadir a `test/chat-roles.e2e-spec.ts` las rutas de US2: `401` sin sesión en `GET /chat/conversations`, `GET /chat/conversations/:id/messages`, `POST /chat/conversations/:id/read` y `GET /chat/unread-count`
- [X] T025 [P] [US2] Escribir `tutorias_uts_mobile/src/features/chat/__tests__/MessagesScreen.test.tsx` y ampliar `ChatScreen.test.tsx`: la pestaña "Mensajes" tiene "Avisos" y "Chats" (los avisos muestran la bandeja de la spec 014); la lista de chats muestra la persona o el módulo, el último mensaje, la hora y el contador de sin leer como texto; estados cargando, vacío con la forma de iniciar una, error con reintento; abrir una conversación marca leída (llama a la API) y el historial carga tramos anteriores al subir; separadores de fecha ("Hoy", "Ayer", fecha)

### Implementation for User Story 2

- [X] T026 [US2] Añadir a `tutorias_uts_back/src/chat/chat.service.ts` `listConversations` (individuales con al menos un mensaje vivo y sin leer por conversación en una sola consulta agrupada), `listMessages` (por `(created_at, id)` descendente con cursor opaco `before`/`next`), `markRead` (`last_read_at` = ahora, crea la fila si falta) y `unreadCount`; mensajes siempre con `deleted_at IS NULL`
- [X] T027 [US2] Añadir a `chat.controller.ts` `GET /chat/conversations`, `GET /chat/conversations/:id/messages`, `POST /chat/conversations/:id/read` (`200`) y `GET /chat/unread-count`, y `dto/list-messages.query.ts` (`before` opcional, `limit` de 1 a 100 con 30 por defecto)
- [X] T028 [P] [US2] Crear `tutorias_uts_mobile/src/features/chat/hooks/useChatLists.ts` (`useConversations`, `useMessages` con scroll infinito hacia arriba, `useMarkRead`, `useChatUnread`)
- [X] T029 [P] [US2] Crear `tutorias_uts_mobile/src/features/chat/components/ConversationRow.tsx` (avatar de 48 px, nombre, último mensaje de una línea, hora, píldora de sin leer con texto) y `DateSeparator.tsx`
- [X] T030 [US2] Extraer de `tutorias_uts_mobile/src/features/notifications/screens/NotificationsScreen.tsx` el contenido de la lista a `NotificationsPanel.tsx` (la pantalla lo sigue usando sin cambiar su comportamiento) y completar `screens/MessagesScreen.tsx` con el `SegmentedControl` "Avisos" y "Chats" (íconos y texto), la lista de conversaciones y el botón "Nuevo mensaje"
- [X] T031 [US2] Completar `ChatScreen.tsx` con el historial por tramos, los separadores de fecha, el marcado de leída al abrir y la actualización del total; ajustar las pruebas existentes de notificaciones si el panel extraído lo requiere
- [X] T032 [P] [US2] Añadir a `es.json` y `en.json` los textos de US2 (`chat.tabs.*`, `chat.list.*`, `chat.unread`, `chat.today`, `chat.yesterday`)

**Checkpoint**: US1 y US2 funcionan: se conversa y se ve qué hay sin leer.

---

## Phase 5: User Story 3 - Recibir y enviar al instante (Priority: P1)

**Goal**: Cada mensaje llega en menos de 2 segundos a quien tiene la app conectada, con estados de envío, reintento y aviso de reconexión.

**Independent Test**: Con dos sesiones abiertas en la misma conversación, enviar en ambos sentidos y comprobar que llega sin recargar; cortar y devolver la conexión de una y comprobar el aviso, el mensaje pendiente y que no se duplica.

### Tests for User Story 3 ⚠️

- [X] T033 [P] [US3] Escribir `tutorias_uts_back/test/chat-gateway.e2e-spec.ts` con `connectChat`: un token inválido o de una sesión revocada rechaza la conexión con `TOKEN_INVALID` y una cuenta desactivada con `ACCOUNT_DISABLED`; `message:new` llega al destinatario y a los otros dispositivos del remitente, nunca a un tercero ni a quien perdió el acceso, y llega después de que el mensaje está guardado (la lectura por REST ya lo trae); `conversation:open` responde `{ ok: true }` para una propia y `{ ok: false, code: 'CHAT_NOT_FOUND' }` para una ajena; un reintento con el mismo `clientMessageId` no emite otra vez; `unread:changed` llega al llegar un mensaje y al marcar leída, también a un segundo dispositivo del mismo usuario, y el total coincide con `GET /chat/unread-count`; una cuenta desactivada con el socket ya abierto deja de recibir mensajes; el mensaje llega en menos de 2 segundos
- [X] T034 [P] [US3] Escribir `tutorias_uts_mobile/src/features/chat/__tests__/chatSocket.test.tsx` con `socket.io-client` simulado: `message:new` agrega el mensaje a la conversación abierta y sube la conversación al primer lugar de la lista con su contador; al abrir una conversación se emite `conversation:open` y al salir `conversation:close`; con el socket caído aparece "Reconectando…" y un mensaje escrito queda "enviando" y sale una sola vez al reconectar y al volver la app a primer plano; una respuesta `4xx` lo deja en "falló" y el reintento manual lo envía una sola vez con el mismo `clientMessageId`; un mensaje enviado pasa de "enviando" a "enviado"; al reconectar la app vuelve a pedir la lista y el historial de la conversación abierta; un envío cuya respuesta no llega porque el servidor se reinició se reintenta al reconectar y llega una sola vez; cerrar la app descarta la cola (no se guarda)

### Implementation for User Story 3

- [X] T035 [US3] Crear `tutorias_uts_back/src/chat/chat.gateway.ts` (`@WebSocketGateway({ namespace: '/chat' })`): en la conexión verifica el token con `JwtService` y la sesión con `SessionService.validate` (la misma regla del guard HTTP), rechaza con el código estable y mete el socket en la sala `user:<id>`; `conversation:open` revalida la pertenencia con el servicio y registra en `ChatPresence`; `conversation:close` y la desconexión limpian; expone `emitMessage(recipientIds, message)` y `emitUnread(userId, unread)` que emiten solo a las salas `user:<id>`; añadirlo a `chat.module.ts`
- [X] T036 [US3] Integrar en `chat.service.ts`: tras confirmar la transacción de `sendMessage` emitir `message:new` a cada destinatario que hoy puede verlo (cuenta activa y acceso, calculado en la base) y al remitente en sus otros dispositivos, y `unread:changed` con el total nuevo de cada destinatario; `markRead` emite `unread:changed` al propio usuario; un reintento con `created: false` no emite; el texto del mensaje no se registra
- [X] T037 [P] [US3] Crear `tutorias_uts_mobile/src/features/chat/socket.ts` (conexión a `<EXPO_PUBLIC_API_URL>/chat` con el token en `auth`, reconexión con el token renovado, `open(conversationId)` y `close(conversationId)`) y `hooks/useChatSocket.ts` (suscribe `message:new` y `unread:changed`, actualiza las consultas de TanStack Query y expone el estado de conexión)
- [X] T038 [US3] Crear `tutorias_uts_mobile/src/features/chat/hooks/usePendingMessages.ts` (cola en memoria con `clientMessageId`, estados "enviando", "enviado" y "falló", reintento al reconectar y al volver a primer plano, reintento manual) y `components/ReconnectBanner.tsx` (banner "Reconectando…" bajo la barra); conectarlos a `ChatScreen.tsx` y `MessagesScreen.tsx` y montar `useChatSocket` una sola vez con la sesión iniciada
- [X] T039 [P] [US3] Añadir a `es.json` y `en.json` los textos de US3 (`chat.status.sending`, `chat.status.sent`, `chat.status.failed`, `chat.retry`, `chat.reconnecting`) y los íconos de estado en `registry.ts`

**Checkpoint**: Las tres historias P1 funcionan: chat individual en vivo con estados y reconexión.

---

## Phase 6: User Story 4 - Enterarme cuando no estoy conectado (Priority: P2)

**Goal**: Quien no tiene la conversación abierta recibe un push con el nombre y el texto, uno por ráfaga, y al tocarlo abre esa conversación.

**Independent Test**: Con el destinatario sin la app abierta y con un dispositivo registrado, enviarle un mensaje y comprobar el push, el contador al abrir la app y que el toque abre la conversación.

### Tests for User Story 4 ⚠️

- [X] T040 [P] [US4] Escribir `tutorias_uts_back/test/chat-push.e2e-spec.ts` con el `FakePushGateway`: un mensaje individual a un destinatario sin la conversación abierta y con un dispositivo vivo manda un push con el nombre de quien escribe como título, el texto recortado a 140 caracteres como cuerpo y `data` `{ conversationId }`; con la conversación abierta en un socket no manda; tres mensajes seguidos mandan un solo push y pasado el plazo (la clave `chat:push:<conversación>:<destinatario>` borrada o vencida) manda otro; sin dispositivos o con el permiso rechazado el mensaje igual queda sin leer y el envío no falla; un dispositivo que el servicio informa como inexistente se descarta; un fallo del gateway no hace fallar el envío ni se registra con texto; a una cuenta desactivada o eliminada no se le manda; el push sale en el idioma del destinatario y nunca lleva correo ni teléfono
- [X] T041 [P] [US4] Añadir a `tutorias_uts_mobile/src/features/notifications/__tests__/openTarget.test.ts` y `push.test.tsx` los casos del chat: un push con `conversationId` abre `(student)/messages/[id]`, `(teacher)/messages/[id]` o `(admin)/messages/[id]` según el rol; uno con `moduleId` o `pqrsId` sigue como hoy

### Implementation for User Story 4

- [X] T042 [US4] Crear `tutorias_uts_back/src/chat/chat-push.service.ts`: tras confirmar el mensaje, para cada destinatario sin la conversación abierta (`ChatPresence`) y con cuenta activa, si es un chat individual toma la clave de ráfaga en Redis con `SET NX EX chat.pushBurstSeconds` y, si la obtuvo, busca los dispositivos con `liveDevices` y envía por `PushGateway` el título y el cuerpo en el idioma del destinatario; descarta los dispositivos `DEVICE_NOT_REGISTERED` del ticket; es de mejor esfuerzo (captura el error, registra solo la causa estable) y no se espera; añadirlo a `chat.module.ts`
- [X] T043 [US4] Llamar a `ChatPushService` desde `chat.service.ts` después de emitir por el socket (solo si `created` es verdadero)
- [X] T044 [US4] Añadir `chatTarget(role, conversationId)` a `tutorias_uts_mobile/src/features/notifications/openTarget.ts`, aceptar `conversationId` en `noticeTarget` y en el `PushData` de `hooks/usePushRegistration.ts`, de modo que tocar el push abra la conversación y la marque como leída al entrar

**Checkpoint**: El destinatario ausente se entera y llega a la conversación con un toque.

---

## Phase 7: User Story 5 - Chat del módulo y anuncios del docente (Priority: P2)

**Goal**: Cada módulo tiene un chat grupal de ida y vuelta y el docente publica anuncios, con cada estudiante viendo solo desde su inscripción y hasta su baja.

**Independent Test**: Con un módulo con tres inscritos, publicar un anuncio y un mensaje al grupo; los tres lo ven; un estudiante se da de baja y deja de ver el chat; otro no inscrito nunca lo ve.

### Tests for User Story 5 ⚠️

- [X] T045 [P] [US5] Escribir `tutorias_uts_back/test/chat-module.e2e-spec.ts`: `GET /chat/conversations` asegura y lista el chat de cada módulo del docente y de cada inscrito, también sin mensajes, sin crear duplicados al repetir la llamada; un estudiante o docente ajeno al módulo recibe `404 CHAT_NOT_FOUND` y el CAE también; el docente publica un anuncio (`201`, `kind` `ANNOUNCEMENT`) y un inscrito recibe `403 CHAT_ANNOUNCEMENT_FORBIDDEN` al intentarlo; un inscrito escribe un mensaje normal y lo ven el docente y los demás; quien se da de baja deja de ver el chat (no aparece en su lista y abrirlo responde `404 CHAT_NOT_FOUND`) y al volver a inscribirse lo ve de nuevo sin los mensajes publicados mientras no estuvo inscrito; un mensaje anterior a la primera inscripción no se ve; el contador de sin leer del módulo no cuenta lo invisible; con el periodo cerrado el envío responde `409 CHAT_READ_ONLY` con `PERIOD_CLOSED` y la lectura sigue; `canAnnounce` es verdadero solo para el docente del módulo; los destinatarios de `message:new` son los que hoy ven el mensaje; un anuncio manda push a los inscritos que no la tienen abierta y un mensaje normal no manda push
- [X] T046 [P] [US5] Añadir a `test/chat-roles.e2e-spec.ts` los casos del módulo: el CAE no puede abrir ni enviar a un chat de módulo (`404`) y un estudiante no puede publicar anuncios en un chat individual (`CHAT_ANNOUNCEMENT_FORBIDDEN`)
- [X] T047 [P] [US5] Escribir `tutorias_uts_mobile/src/features/chat/__tests__/ModuleChat.test.tsx`: la fila del módulo lleva el ícono de grupo y el nombre del módulo, y "Sin mensajes" cuando no hay; el anuncio se muestra como tarjeta "Anuncio" con el nombre del docente y no como burbuja; solo el docente ve el control para publicar un anuncio; un periodo cerrado muestra la regla de solo lectura

### Implementation for User Story 5

- [X] T048 [US5] Crear `tutorias_uts_back/src/chat/chat-visibility.ts` con el fragmento SQL de la ventana de visibilidad (existe una inscripción del estudiante al módulo con `created_at` menor o igual a la fecha del mensaje y (`status` `ACTIVE` o la fecha del mensaje menor que `effective_until`); el docente ve todo) y la función que devuelve los destinatarios actuales de un mensaje de módulo
- [X] T049 [US5] Ampliar `chat.service.ts` para los chats de módulo: asegurar la fila con `INSERT ... ON CONFLICT (module_id) DO NOTHING` al listar, calcular el acceso del docente del módulo y de los estudiantes con inscripción `ACTIVE` (sin ella la conversación no se lista ni se abre), aplicar `chat-visibility.ts` en el historial y en los sin leer, crear la fila de `conversation_members` al leer o enviar, validar `kind` `ANNOUNCEMENT` (`CHAT_ANNOUNCEMENT_FORBIDDEN` si no es el docente del módulo o no es un chat de módulo), el solo lectura `PERIOD_CLOSED`, y `canAnnounce` en el detalle
- [X] T050 [US5] Ampliar `chat.gateway.ts` y `chat-push.service.ts` para los chats de módulo: destinatarios por `chat-visibility.ts`; el push solo para los anuncios (título "Anuncio · <módulo>" en el idioma del destinatario, sin límite de ráfaga) a los inscritos sin la conversación abierta; los mensajes normales del grupo solo suman al contador y a la lista
- [X] T051 [P] [US5] Crear `tutorias_uts_mobile/src/features/chat/components/AnnouncementCard.tsx` (tarjeta de ancho completo con la etiqueta "Anuncio" y el nombre del docente, colores solo de `Design.md`) y ajustar `ConversationRow.tsx` (ícono de grupo y nombre del módulo), `MessageBubble.tsx` (nombre del remitente en el chat de módulo) y `Composer.tsx` (control "Publicar como anuncio" con ícono, solo si `canAnnounce`)
- [X] T052 [P] [US5] Añadir a `es.json` y `en.json` los textos de US5 (`chat.announcement.*`, `chat.module.*`, `chat.noMessages`)

**Checkpoint**: Las cinco historias de mensajería funcionan, con chat del módulo y anuncios.

---

## Phase 8: User Story 6 - Borrar mensajes viejos según la retención (Priority: P3)

**Goal**: Una tarea programada borra de forma lógica los mensajes y anuncios de módulo de más de 6 meses y los individuales de más de 2 años.

**Independent Test**: Con mensajes de distintas edades, correr la tarea y comprobar que se borran solo los que superan su plazo y que la lista de conversaciones refleja el cambio.

### Tests for User Story 6 ⚠️

- [X] T053 [P] [US6] Escribir `tutorias_uts_back/test/chat-retention.e2e-spec.ts` con el `TestClock`: un mensaje o anuncio de módulo de 7 meses se borra y uno de 5 se conserva; un mensaje individual de 8 meses se conserva y uno de 25 meses se borra; los plazos siguen `chat.moduleRetentionMonths` y `chat.directRetentionMonths` guardados en settings; correr la tarea dos veces no cambia nada la segunda; una individual que se queda sin mensajes vivos deja de aparecer en `GET /chat/conversations` y la de un módulo sigue apareciendo; el registro solo lleva el número de filas, nunca el texto

### Implementation for User Story 6

- [X] T054 [US6] Crear `tutorias_uts_back/src/chat/chat-retention.task.ts` con `@Cron` diario a las 03:00 (patrón de `src/periods/periods-expiry.task.ts`, zona `America/Bogota`) que pone `deleted_at` en los mensajes vivos de conversaciones `MODULE` con más de `chat.moduleRetentionMonths` y de `DIRECT` con más de `chat.directRetentionMonths`, contando los meses con `Clock`, expone `run()` para las pruebas y registra solo el número de filas; añadirlo a `chat.module.ts` y a los proveedores que `createTestApp` neutraliza (como `NotificationsScheduler`) para que no corra solo

**Checkpoint**: Las seis historias funcionan.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Contrato, privacidad en logs, documentación, decisiones y cierre

- [X] T055 [P] Escribir `tutorias_uts_back/test/chat-contract.e2e-spec.ts` que valide las respuestas reales contra `specs/018-chat/contracts/chat-api.yaml` (mismo patrón de `pqrs-contract.e2e-spec.ts`), incluidos los códigos de error nuevos y los `409` con `details.reason`
- [X] T056 [P] Añadir a `tutorias_uts_back/test/log-redaction.e2e-spec.ts` que enviar, leer, reintentar, publicar un anuncio, mandar el push (también si falla) y correr la retención no escriben el texto de un mensaje, el cuerpo de un push ni un correo en los registros
- [X] T057 [P] Actualizar `Claude/docs/Context.md`: quién conversa con quién, el solo lectura al dejar de compartir un módulo, chat del módulo de ida y vuelta, anuncios del docente, push (individual por ráfaga, módulo solo anuncios), mensajes sin conexión y retención
- [X] T058 [P] Actualizar `Claude/docs/Architecture.md`: tablas `Conversation`, `ConversationMember` y `Message` con sus campos (sustituyen las filas actuales), los 8 endpoints, el espacio `/chat` del WebSocket, la sección 8 (órdenes por REST, entrega por socket, presencia en memoria y su límite de una instancia, push, retención) y las claves `chat.*`
- [X] T059 [P] Actualizar `Claude/docs/Design.md` en la sección "Messages" con lo que se construyó y lo que queda fuera ("escribiendo", confirmación de lectura), manteniendo coherentes los estados de mensaje y el banner de reconexión
- [X] T060 Registrar en `Claude/docs/Decisions.md` D-113 (modelo del chat: órdenes por REST y entrega por WebSocket, permisos calculados desde las inscripciones, ventana de visibilidad del módulo, solo lectura al dejar de compartir módulo, anuncios, solo texto y sin edición) y D-114 (push del chat: individual con un push por ráfaga y módulo solo anuncios, presencia en memoria con una instancia, cola de pendientes solo mientras la app está abierta y retención diaria de borrado lógico), con su motivo y lo descartado
- [X] T061 [P] Comprobar en `tutorias_uts_back` y `tutorias_uts_mobile` que ningún `console.log` ni registro escribe texto de mensajes, que `grep` de `Unidades Tecnológicas` no encuentra nada, que `python .claude/skills/i18n-strings/scripts/check_i18n.py <es.json> <en.json>` da paridad es/en y que no hay hexadecimales, `fontFamily`, `fontWeight` ni librerías de íconos distintas de Iconify en los componentes nuevos; que todo botón lleva ícono y que hay 16 px entre botones apilados
- [ ] T062 Recorrer los 18 escenarios de `specs/018-chat/quickstart.md` en español e inglés con dos dispositivos, la API y Redis en marcha, y anotar el resultado en ese archivo, incluidos el tiempo de llegada de un mensaje (SC-001, menos de 2 s) y el de iniciar una conversación y enviar (SC-002, menos de 1 minuto)
- [ ] T063 Ejecutar la habilidad `feature-done-check` (spec, pruebas de reglas de negocio, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte
- [ ] T064 Cambiar `Status` de `specs/018-chat/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de `tutorias_uts_db`, `tutorias_uts_back`, `tutorias_uts_mobile` y `Claude` (contra la rama `017-pqrs` mientras esa spec no se una; después, contra `main` o `master`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 ya está hecha; T002 y T003 primero (T003 antes de cualquier prueba e2e); T004, T005, T006 y T007 en paralelo después de T003.
- **Foundational (Phase 2)**: depende de T003 y bloquea las historias. T008 antes de T009; T011 antes de T012; T010 en paralelo con ambas.
- **User Stories (Phase 3 en adelante)**: dependen de Foundational. US1 va primero porque crea el servicio, el controlador, el módulo y las rutas de la app que las demás completan. US2 depende de US1; US3 depende de US2 (necesita la lista y la conversación abierta); US4 depende de US3 (usa la presencia y se llama tras emitir); US5 depende de US3; US6 solo necesita US1 y puede hacerse en paralelo con cualquiera después de US2.
- **Polish (Phase 9)**: depende de que las historias estén terminadas; T055 necesita los 8 endpoints.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; no depende de otras historias.
- **US2 (P1)**: tras US1 (extiende `chat.service.ts`, `chat.controller.ts` y `MessagesScreen`).
- **US3 (P1)**: tras US2.
- **US4 (P2)**: tras US3 en backend; en la app solo necesita T044 sobre `openTarget.ts`.
- **US5 (P2)**: tras US3 (reutiliza el socket y los estados de envío); el push de anuncios usa T042.
- **US6 (P3)**: independiente de US3 a US5 en backend; necesita que existan mensajes (T017) y, para la parte de módulo, US5.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- DTO → servicio → controlador → app; hooks, componentes y textos antes de las pantallas que los usan.

### Parallel Opportunities

- Setup: T004, T005, T006 y T007.
- Foundational: T008, T010 y T011.
- US1: T013, T014 y T015 juntas; T016, T019, T020 y T022 juntas.
- US2: T023, T024 y T025 juntas; T028, T029 y T032 juntas.
- US3: T033 y T034 juntas; T037 y T039 en paralelo con T035 y T036.
- US4: T040 y T041 juntas.
- US5: T045, T046 y T047 juntas; T051 y T052 juntas.
- Polish: T055, T056, T057, T058, T059 y T061.

## Parallel Example: User Story 3

```text
# Pruebas de US3 juntas:
T033 chat-gateway.e2e-spec.ts (conexión, entrega, salas, sin leer y presencia)
T034 chatSocket.test.tsx (socket simulado, estados de envío y reconexión)
```

## Implementation Strategy

### MVP First (User Stories 1 a 3)

1. Phase 1 y Phase 2 (T001 a T012): dependencias, migración, configuración, errores, reglas de acceso y presencia.
2. Phase 3 a Phase 5 (US1 a US3): conversar, ver lo no leído y recibir al instante.
3. **Parar y validar**: CAE, docentes y estudiantes conversan en vivo en chats individuales; falta el push y el chat del módulo.

### Incremental Delivery

1. Setup y Foundational → reglas y presencia probadas.
2. US1 a US3 → chat individual en vivo (MVP).
3. US4 → push para quien está ausente (primera entrega posible: US1 a US4).
4. US5 → chat del módulo y anuncios.
5. US6 → retención.
6. Polish → contrato, docs, decisiones y Pull Requests.

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes.
- Verificar que las pruebas fallan antes de implementar.
- Un commit por historia (Conventional Commits, en inglés).
- La presencia vive en memoria: sirve para una sola instancia del servidor (límite documentado en `Architecture.md`, T058).
- Una conversación ajena siempre responde `404 CHAT_NOT_FOUND`, nunca `403`, para no revelar que existe.
- Los límites (`chat.messageMaxLength`, plazos de retención y ráfaga de push) viven en configuración; ningún número va escrito en el código ni en los componentes.

## Notas de implementación (2026-11-22)

- **Análisis previo (I1, I2, C1, A1):** antes de implementar se alinearon la spec, el modelo y las tareas: quien se da de baja deja de ver el chat del módulo (`404`), así que el motivo `NOT_ENROLLED` ya no existe; las conversaciones individuales sin mensajes son las que desaparecen de la lista; el plazo de la ráfaga se escribió en FR-013; y T034 incluye el reintento tras un servidor que no responde.
- **T007:** las fábricas del chat y el cliente de socket de pruebas quedaron en `test/utils/chat.ts` y los escenarios (`chatWorld`, `enrollAnother`, `directWith`, `moduleChatOf`) en `test/utils/chat-world.ts`, no en `factories.ts`; `reset()` ahora también borra las claves `chat:*` de Redis.
- **T008:** las reglas puras son `canPair`, `directDecision` y `moduleDecision` (en lugar de una sola `writeDecision`).
- **T035:** el guard JWT global rechazaba los eventos del socket (no tienen cabeceras HTTP); `JwtAuthGuard` ahora deja pasar lo que no es HTTP, porque el socket se autentica al conectar. Lo cazó `chat-gateway.e2e-spec.ts`.
- **T036:** si un anuncio se envía con el periodo cerrado, la respuesta es `409 CHAT_READ_ONLY` (no `403`): se revisa primero si se puede escribir.
- **T019, T028, T037 y T038:** los hooks de la app se agruparon en `useChatData.ts`, `useChatSocket.ts` y `usePendingMessages.ts` (más `socket.ts` con el estado de conexión). Los componentes `ReadOnlyNotice` y `ReconnectBanner` y las pantallas siguieron el plan. Las pruebas comparten `testing/chatTestUtils.tsx` (fuera de `__tests__` para que Jest no lo tome por una prueba).
- **T038:** tras confirmarse un envío, la app vuelve a pedir el historial además de insertar el mensaje, para que una consulta que ya estaba en vuelo no lo oculte.
- **T006 y T022:** el rótulo del campo del compositor es "Escribe un mensaje" para no chocar con la opción "Mensaje" del control de tipo.
- **T055:** se añadieron al contrato los esquemas `ContactList` y `ConversationList` y las referencias nulas se escribieron con `anyOf` más `enum: [null]`, porque OpenAPI 3.0 no extiende `nullable` a un `$ref`.
- Las pruebas se escribieron junto con el código (no una corrida roja previa de cada una); todas pasan.
- Tres suites e2e tuvieron fallos de 10 s por carga al correr muchas juntas (`log-redaction`, `notifications-*`, `pqrs-*`, `modules-roles`) y pasan al correrlas solas.
- T062 (recorrido manual con dos dispositivos), T063 y T064 siguen pendientes.
