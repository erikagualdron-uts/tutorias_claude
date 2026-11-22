---

description: "Task list for Pulido del chat"
---

# Tasks: Pulido del chat

**Input**: Design documents from `/specs/022-chat-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/chat-typing.md, quickstart.md

**Tests**: Incluidas. La constitución (Principios IV y V) y `docs/Conventions.md` §6 exigen pruebas de acceso; aquí son las del evento `typing` (quién lo recibe), las de pendientes entre usuarios y las de privacidad de registros. Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1 es P1; US2 y US3 son P2. **No cambia `tutorias_uts_db`** (sin migración); cambian `tutorias_uts_mobile`, `tutorias_uts_back` (un evento del gateway) y `Claude/docs`. Una dependencia nueva en la app: `@react-native-async-storage/async-storage`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 pendientes que sobreviven y descartar, US2 avatares con iniciales, US3 "está escribiendo"
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/` (ayudas del chat en `test/utils/chat.ts` y `chat-world.ts`)
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas en `__tests__/` y ayudas de prueba en `testing/` (una ayuda dentro de `__tests__/` falla: Jest la toma por una prueba sin casos)
- `Claude/` = `docs/` y `specs/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes; el estado nunca se indica solo por color; objetivos táctiles de 48 px como mínimo
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- El texto de un mensaje, de un pendiente o de un aviso de escritura nunca va a los registros; el evento `typing` solo lleva identificadores
- Esta versión de Testing Library es asíncrona: `await render(...)`, `await fireEvent.press(...)`; el `screen` es el del último `render`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí ni con la API de desarrollo en marcha; una prueba de arranque puede dar "Hook timed out" por carga: repetirla sola antes de investigar
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF; `Architecture.md` está en LF

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: La dependencia de almacenamiento y su simulación en las pruebas

- [X] T001 Instalar la dependencia con `npx expo install @react-native-async-storage/async-storage` en `tutorias_uts_mobile/` (queda en `package.json` y `package-lock.json` con la versión del SDK 58) y registrar en `tutorias_uts_mobile/jest.setup.tsx` la simulación oficial `@react-native-async-storage/async-storage/jest/async-storage-mock`; `npm test` sigue en verde

**Checkpoint**: La app puede guardar en el dispositivo y las pruebas lo simulan.

---

## Phase 2: User Story 1 - No perder lo que escribí (Priority: P1) 🎯 MVP

**Goal**: Un mensaje sin enviar sobrevive al cierre de la app, sale una sola vez al reabrir con conexión, es del usuario que lo escribió y se puede descartar.

**Independent Test**: Sin conexión, escribir un mensaje, cerrar la app, reabrirla con conexión y comprobar que salió una sola vez y la otra persona lo recibió.

### Tests for User Story 1 ⚠️

- [X] T002 [P] [US1] Escribir `tutorias_uts_mobile/src/features/chat/__tests__/pendingPersistence.test.tsx` (debe fallar; `AsyncStorage` simulado): un pendiente agregado se guarda con la clave `chat-pending` y, tras rehidratar el almacén (simulando el cierre y la reapertura), sigue en la lista con su estado; al terminar la hidratación y con el socket conectado se envía una sola vez (una sola petición `POST /chat/conversations/:id/messages` con su `clientMessageId`) y sale de la lista y del almacenamiento; un pendiente `failed` sigue `failed` con su `errorCode` y no se reenvía solo; los pendientes de otro `userId` no aparecen en `usePendingMessages` ni se envían; si `AsyncStorage` lanza error al leer o al escribir, el mensaje se sigue enviando en memoria y no se lanza ninguna excepción; varios pendientes de distintas conversaciones salen en el orden en que se escribieron
- [X] T003 [P] [US1] Añadir a `tutorias_uts_mobile/src/features/chat/__tests__/pendingPersistence.test.tsx` (debe fallar): descartar un pendiente `sending` o `failed` (`discard(clientMessageId)`) lo quita de la lista y del almacenamiento y nunca llega a enviarse; pasar la sesión de iniciada a no iniciada vacía el almacén y el almacenamiento, y arrancar la app con la sesión aún sin restaurar (estado inicial) no borra nada
- [X] T004 [P] [US1] Añadir a `tutorias_uts_mobile/src/features/chat/__tests__/ChatScreens.test.tsx` (debe fallar): un mensaje pendiente se ve en su conversación con el estado "enviando"; uno `failed` muestra su motivo, "Toca para reintentar" y "Descartar"; "Descartar" lo quita de la pantalla y "Toca para reintentar" lo envía de nuevo; los textos salen en español e inglés
- [X] T005 [P] [US1] Añadir a `tutorias_uts_back/test/log-redaction.e2e-spec.ts` (debe pasar sin cambios de servicio): reenviar por REST un mensaje con el mismo `clientMessageId` (el reintento de un pendiente) no escribe su texto en los registros y devuelve el mensaje ya guardado una sola vez

### Implementation for User Story 1

- [X] T006 [US1] Añadir `userId: string` a `PendingMessage` en `tutorias_uts_mobile/src/features/chat/types.ts` (y actualizar el comentario que dice que vive solo en memoria)
- [X] T007 [US1] Modificar `tutorias_uts_mobile/src/features/chat/hooks/usePendingMessages.ts`: `usePendingStore` pasa a `persist` de Zustand con `createJSONStorage` sobre un `AsyncStorage` envuelto en `try/catch` (lectura y escritura que fallan devuelven `null` o se ignoran), clave `chat-pending`, `partialize` de solo `items`; añadir `discard(clientMessageId)` al almacén; el selector y `flushPending` solo consideran los pendientes con `userId` igual al de `useSession().user.id`; `send` guarda el `userId` del usuario con sesión
- [X] T008 [US1] Modificar `tutorias_uts_mobile/src/features/chat/hooks/useChatSocket.ts`: llamar a `flushPending` también cuando termina la hidratación (`usePendingStore.persist.onFinishHydration`) y vaciar el almacén (`items` y su almacenamiento) cuando `useSession` pasa de `signedIn` a otro estado, comparando con el estado anterior en una referencia para no borrar durante la restauración de la sesión al arrancar
- [X] T009 [P] [US1] Añadir los textos a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`chat.discard`) con las claves ordenadas, y ejecutar `check_i18n.py`
- [X] T010 [US1] Modificar `tutorias_uts_mobile/src/features/chat/components/MessageBubble.tsx` y `screens/ChatScreen.tsx`: un mensaje propio `sending` o `failed` muestra "Descartar" (enlace con ícono a la izquierda y 48 px de alto, junto a "Toca para reintentar" en el segundo), que llama a `discard`; sin cambiar el estado visual de "enviando" y "enviado"

**Checkpoint**: US1 funciona y se prueba sola; es el MVP.

---

## Phase 3: User Story 2 - Avatares con iniciales (Priority: P2)

**Goal**: Los avatares de personas muestran iniciales en la lista y en el encabezado del chat directo; el chat de módulo conserva el ícono de grupo.

**Independent Test**: Con conversaciones con "Ana Soto", "Luis" y un módulo, comprobar "AS", "L" y el ícono de grupo, y el mismo avatar en el encabezado.

### Tests for User Story 2 ⚠️

- [X] T011 [P] [US2] Escribir `tutorias_uts_mobile/src/features/chat/__tests__/initials.test.ts` (debe fallar) para `initialsOf(firstName, lastName)`: `('Ana', 'Soto')` da `'AS'`; un solo nombre (`('Luis', '')`) da `'L'`; minúsculas y espacios sobrantes (`(' ana ', ' soto ')`) dan `'AS'`; con tilde (`('Ángela', 'Ñúñez')`) da `'ÁÑ'`; nombre vacío (`('', '')`) da `''`; un nombre compuesto toma solo la primera letra del primer nombre y la del primer apellido
- [X] T012 [P] [US2] Añadir a `tutorias_uts_mobile/src/features/chat/__tests__/ChatScreens.test.tsx` (debe fallar): la fila de una conversación directa muestra las iniciales de la persona y la de un módulo el ícono de grupo (`solar:users-group-rounded`); un nombre vacío muestra el ícono de persona; el encabezado del chat directo muestra el mismo avatar con iniciales y el del chat de módulo el de grupo; las letras del avatar no son accesibles (el nombre ya está escrito al lado)

### Implementation for User Story 2

- [X] T013 [P] [US2] Crear `tutorias_uts_mobile/src/features/chat/initials.ts` con `initialsOf(firstName, lastName)` según T011 (`toLocaleUpperCase`, conservando la tilde)
- [X] T014 [US2] Crear `tutorias_uts_mobile/src/features/chat/components/Avatar.tsx` (48 px, círculo de fondo `palette.surface`; letras en `typography.cardTitle` y `palette.primary`; ícono de grupo para un módulo y de persona sin nombre; `accessible={false}` y `importantForAccessibility="no-hide-descendants"`) y usarlo en `components/ConversationRow.tsx` en lugar del círculo con ícono
- [X] T015 [US2] Modificar `tutorias_uts_mobile/src/features/chat/screens/ChatScreen.tsx` para mostrar el `Avatar` (de 40 a 48 px, sin tocar el título) a la izquierda del título del encabezado, con el mismo criterio que la lista

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 4: User Story 3 - Saber que me están escribiendo (Priority: P2)

**Goal**: En un chat directo, la otra persona ve "está escribiendo…" mientras escribes, y desaparece solo; nunca en un chat de módulo.

**Independent Test**: Con dos usuarios en el mismo chat directo, uno escribe y el otro ve el indicador; deja de escribir y desaparece.

### Tests for User Story 3 ⚠️

- [X] T016 [P] [US3] Escribir `tutorias_uts_back/src/chat/chat-typing.spec.ts` (debe fallar) para `ChatTypingLimiter`: acepta el primer aviso de un socket y una conversación; descarta otro del mismo socket y conversación con menos de 2 s (con un reloj inyectado); lo acepta a los 2 s; un socket o una conversación distintos no se afectan; `drop(socketId)` olvida al socket
- [X] T017 [P] [US3] Escribir `tutorias_uts_back/test/chat-typing.e2e-spec.ts` (debe fallar; clientes de `test/utils/chat.ts` y mundo de `chat-world.ts`): `typing` en un chat directo llega a la otra persona con `{ conversationId, userId }` solo si tiene esa conversación abierta (`conversation:open`), y no llega si no la tiene abierta; nunca llega al emisor ni a un tercero (ni a otro estudiante del mismo módulo); en un chat de módulo no llega a nadie; un usuario sin acceso a la conversación recibe el acuse `{ ok: true }` sin efecto; un `typing` repetido a menos de 2 s se ignora y a los 2 s pasa; un socket con token inválido no se conecta; una conversación de solo lectura no genera aviso; no se escribe ningún texto ni identificador de conversación en los registros
- [X] T018 [P] [US3] Escribir `tutorias_uts_mobile/src/features/chat/__tests__/typing.test.tsx` (debe fallar; temporizadores simulados y un socket de prueba): `usePartnerTyping` muestra el indicador al llegar `typing` de la otra persona de esa conversación y lo apaga a los 5 s sin nuevas señales; una nueva señal reinicia los 5 s; llegar `message:new` de esa persona en esa conversación lo apaga de inmediato; un `typing` de otra conversación o de otra persona se ignora; en un chat de módulo no se registra; `useTypingEmitter` emite `typing` al escribir con texto, a lo sumo una vez cada 3 s, nunca con texto vacío y solo en chats directos
- [X] T019 [P] [US3] Añadir a `tutorias_uts_mobile/src/features/chat/__tests__/ChatScreens.test.tsx` (debe fallar): el chat directo muestra al pie de la lista la burbuja con tres puntos y el texto "está escribiendo…" mientras la otra persona escribe, en español e inglés; con "reducir movimiento" los puntos no se animan y el texto sigue; el chat de módulo nunca lo muestra

### Implementation for User Story 3

- [X] T020 [US3] Crear `tutorias_uts_back/src/chat/chat-typing.ts` con `ChatTypingLimiter` (un `Map` por socket y conversación con el instante del último aviso aceptado, ventana de 2 s, `Clock` inyectado, `drop(socketId)`) y registrarlo como proveedor en `tutorias_uts_back/src/chat/chat.module.ts`
- [X] T021 [US3] Añadir `typingRecipients(me, conversationId)` a `tutorias_uts_back/src/chat/chat.service.ts`: usa `access()` (el mismo control de `conversation:open`), devuelve `[]` si la conversación no es directa o no se puede escribir en ella y, si no, los identificadores de las otras personas de la conversación; y `typing(userId, conversationId, from)` en `tutorias_uts_back/src/chat/chat-broadcaster.ts` que emite `typing` `{ conversationId, userId: from }` a la sala `user:<userId>`
- [X] T022 [US3] Añadir a `tutorias_uts_back/src/chat/chat.gateway.ts` `@SubscribeMessage('typing')`: valida `conversationId`, aplica el límite (T020), pide `typingRecipients`, filtra con `presence.isOpen(destinatario, conversationId)` y emite con el difusor; responde `{ ok: true }` siempre y no escribe nada en los registros; el `handleDisconnect` llama a `limiter.drop`
- [X] T023 [P] [US3] Añadir los textos a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`chat.typing`) con las claves ordenadas, y ejecutar `check_i18n.py`
- [X] T024 [US3] Crear `tutorias_uts_mobile/src/features/chat/hooks/useTyping.ts` con `usePartnerTyping(conversationId, partnerId)` (escucha `typing` y `message:new` del socket, temporizador de 5 s, solo se registra en chats directos) y `useTypingEmitter(conversationId, enabled)` (emite `typing` con `{ conversationId }`, a lo sumo cada 3 s, devuelve el manejador para el campo de texto)
- [X] T025 [P] [US3] Crear `tutorias_uts_mobile/src/features/chat/components/TypingIndicator.tsx`: burbuja de estilo recibido (fondo blanco, sombra de nivel 1, radio 16 con esquina de 4) con tres puntos de `palette.textSecondary` que suben y bajan con Reanimated (`useMotion().movement` en falso los deja quietos) y el texto `chat.typing` en `typography.metadata`; `accessibilityLiveRegion="polite"` y etiqueta con el texto
- [X] T026 [US3] Modificar `tutorias_uts_mobile/src/features/chat/components/Composer.tsx` para llamar a un `onTyping` opcional en cada cambio de texto no vacío, y `screens/ChatScreen.tsx` para pasarle `useTypingEmitter(id, detail.type === 'DIRECT' && detail.canWrite)` y para mostrar `TypingIndicator` al pie de la lista cuando `usePartnerTyping` lo indique

**Checkpoint**: Las tres historias funcionan.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Contrato, privacidad, documentación, decisión, revisión y cierre

- [X] T027 [P] Actualizar `Claude/specs/018-chat/contracts/chat-socket.md` con el evento `typing` (cliente a servidor y servidor a cliente) y su regla de acuse y de frecuencia, tal como está en `specs/022-chat-polish/contracts/chat-typing.md`
- [X] T028 [P] Añadir a `tutorias_uts_back/test/log-redaction.e2e-spec.ts` que enviar `typing` en un chat directo no escribe el texto de un mensaje ni el aviso en los registros, y que el reintento de un pendiente no escribe su texto
- [X] T029 [P] Actualizar `Claude/docs/Design.md`: quitar de "Not built yet (chat)" el indicador de escritura, las iniciales y los pendientes persistentes (dejar acuses de lectura, botón flotante, fotos, editar o borrar y adjuntos) y describir el avatar con iniciales (también en el encabezado), el indicador de tres puntos con "está escribiendo…" y la acción "Descartar"
- [X] T030 [P] Actualizar `Claude/docs/Architecture.md`: el evento `typing` del WebSocket (solo chats directos, solo a quien tiene la conversación abierta, límite de 2 s por socket y conversación, sin guardar), la dependencia `@react-native-async-storage/async-storage` y que los pendientes del chat se guardan en el dispositivo por usuario y se borran al cerrar sesión
- [X] T031 [P] Actualizar `Claude/docs/Context.md` en la sección de chat: los mensajes sin enviar se conservan en el dispositivo hasta que salen o se descartan, y el chat directo muestra cuándo la otra persona está escribiendo
- [X] T032 Registrar en `Claude/docs/Decisions.md` D-119 (pulido del chat: pendientes persistentes con `persist` de Zustand y AsyncStorage filtrados por usuario y borrados al cerrar sesión, "Descartar", iniciales sin fotos, `typing` efímero solo en chats directos sin evento de parada ni almacenamiento, límites de 3 s y 2 s, y la dependencia nueva), con su motivo y lo descartado
- [X] T033 [P] Comprobar en `tutorias_uts_back` y `tutorias_uts_mobile` que `npm run test`, `npm run lint`, `npm run typecheck` y `check_i18n.py` dan resultado limpio, que no hay hexadecimales, `fontFamily`, `fontWeight` ni librerías de íconos distintas de Iconify en los componentes nuevos, que ningún `console.log` escribe texto de mensajes y que `grep` de `Unidades Tecnológicas` no encuentra nada
- [X] T034 Correr las e2e del backend de `chat-typing`, `chat-gateway`, `chat-direct`, `chat-module`, `chat-roles` y `log-redaction` por lotes pequeños con la base de datos de prueba y anotar el resultado; correr `npm test` en la app tres veces seguidas y anotar que no hay fallos
- [ ] T035 Recorrer los 16 escenarios de `specs/022-chat-polish/quickstart.md` en español e inglés con dos dispositivos, la app y la API en marcha, y anotar el resultado en ese archivo, incluidos SC-001 (todo sale una sola vez tras cerrar y reabrir) y SC-004 (el indicador llega en menos de 2 s y se apaga en menos de 6 s)
- [X] T036 Ejecutar la habilidad `feature-done-check` (spec, pruebas, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte
- [ ] T037 Cambiar `Status` de `specs/022-chat-polish/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de la rama `022-chat-polish` a la rama principal: `tutorias_uts_back` y `tutorias_uts_mobile` contra `main` y `Claude` contra `master`; cerrar con un comentario los PRs de la 021 que quedan incluidos (`tutorias_uts_back` #13, `tutorias_uts_front` #12 y `tutorias_claude` #14); `tutorias_uts_db` no lleva PR nuevo porque esta spec no lo cambia

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: sin dependencias; bloquea US1 (necesita el almacenamiento y su simulación). US2 y US3 no la necesitan.
- **US1** (MVP) depende de la fase 1. **US2** y **US3** no dependen de las demás ni entre sí, salvo que tocan `ChatScreen.tsx` (T010, T015, T026): hacerlas en ese orden o resolver el cruce al unir.
- **Polish**: depende de las historias que se quieran entregar; T035 a T037 van al final y en ese orden.

### Dentro de cada historia

- Las pruebas primero y deben fallar; luego la pieza pura, el hook, el componente y la pantalla.
- En US3, el servidor (T020 a T022) y la app (T023 a T026) pueden avanzar a la vez con `contracts/chat-typing.md` como acuerdo.

### Parallel Opportunities

- US1: T002 a T005 en paralelo; T009 en paralelo con T006 a T008.
- US2: T011 y T012 en paralelo; T013 en paralelo con las pruebas.
- US3: T016 a T019 en paralelo; T023 y T025 en paralelo.
- Dos personas pueden llevar el backend (T005, T016, T017, T020 a T022, T028) y la app (el resto); US2 y US3 se pueden repartir por completo.

### Parallel Example: User Story 1

```text
T002 pendientes que sobreviven   T003 descartar y cerrar sesión   T004 pantalla del chat   T005 registros del reintento
T009 texto "Descartar" es/en
```

## Implementation Strategy

- **MVP**: Fase 1 y US1 (los pendientes sobreviven y se pueden descartar). Se puede probar y mostrar sola.
- **Entrega incremental**: US2 (iniciales), luego US3 (escritura); cada una se prueba sin las siguientes.
- Un commit por tarea o grupo pequeño, en formato Conventional Commits (`feat(chat): ...`, `chore(app): add async-storage`), y la rama `022-chat-polish` en cada repositorio que cambie.
- La dependencia (T001) se commitea aparte con su `package-lock.json` y con la versión que fije `npx expo install`.

## Notas de implementación (2026-11-22)

- Hecho: las tres historias, el contrato, la documentación, D-119 y la revisión de calidad. Pendientes: **T035** (recorrido manual de los 16 escenarios con dos dispositivos) y **T037** (spec en "Implemented" y PRs).
- **App**: lint, tipos y paridad es/en (762 claves) en verde; 757 pruebas en 94 suites, tres corridas seguidas sin fallos. Dependencia nueva: `@react-native-async-storage/async-storage` 2.2.0, con su simulación oficial en `jest.setup.tsx`.
- **Backend** (`d8dabd8`): 290 pruebas unitarias, lint y tipos en verde. e2e: `chat-typing` 7 de 7; `log-redaction` y `chat-typing` juntos 14 de 14; `chat-gateway`, `chat-module` y `chat-roles` en verde. Una prueba de `chat-direct` ("follows the length limit stored in settings") falló una vez dentro de un lote y pasó sola (22 de 22); no se tocó nada de ese archivo.
- T005: el reintento de un mensaje con el mismo `clientMessageId` ya lo cubría la prueba de registros de la 018 (envía el mismo cuerpo dos veces); no se agregó otra.
- La regla `noGeometricDecoration` rechazó el nombre de estilo `circle` en `Avatar`; el estilo se llama `frame` (el círculo del avatar ya existía en `ConversationRow`).
- Los avatares ocultos a lectores de pantalla (`no-hide-descendants`) quedan fuera de las consultas de Testing Library: las pruebas usan `includeHiddenElements: true` y la prueba de módulos se ajustó igual.
- El estilo "chats" no cambia: el botón "Nuevo mensaje" sigue sobre la lista (D-115).
- Las pantallas no se han visto corriendo en dos dispositivos.

