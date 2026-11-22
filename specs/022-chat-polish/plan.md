# Implementation Plan: Pulido del chat

**Branch**: `022-chat-polish` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/022-chat-polish/spec.md`

## Summary

Tres pulidos del chat sin reglas nuevas: los mensajes sin enviar sobreviven al cierre de la app, los avatares de personas muestran iniciales y, en los chats directos, se ve cuándo la otra persona está escribiendo.

Enfoque técnico (detalle en [research.md](research.md)):

- **Mensajes pendientes persistentes**: el almacén que hoy vive solo en memoria (`usePendingStore`, de Zustand) pasa a guardarse en el dispositivo con el `persist` de Zustand sobre `@react-native-async-storage/async-storage`, la **única dependencia nueva**. Cada pendiente lleva el `userId` de quien lo escribió; solo se ven y se envían los del usuario con sesión, y se borran al pasar de con sesión a sin sesión. Un almacenamiento que falla no rompe el envío.
- **Descartar**: el mensaje "enviando" o "falló" gana la acción "Descartar" junto a "Toca para reintentar".
- **Iniciales**: un componente `Avatar` con una función pura `initialsOf(nombre, apellido)`, usado en la fila de la conversación y, nuevo, en el encabezado del chat directo; el chat de módulo conserva el ícono de grupo.
- **"Está escribiendo"**: un evento nuevo del cliente al servidor, `typing`, que el gateway valida (acceso a la conversación y que sea directa) y reenvía a la otra persona solo si tiene la conversación abierta; el receptor lo apaga solo a los 5 s o cuando llega el mensaje de esa persona. Efímero: sin tablas, sin guardar y sin registrar nada.
- **Sin tablas ni migración** y sin cambios en `tutorias_uts_db`.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12, `@nestjs/websockets` y Socket.IO (presentes). App: Expo Router, TanStack Query, Zustand, socket.io-client, Reanimated, i18next, `react-native-iconify` (presentes) y **`@react-native-async-storage/async-storage` (nueva, versión que fije `npx expo install` para el SDK 58)**.

**Storage**: PostgreSQL sin cambios. En el dispositivo, los pendientes en `AsyncStorage` con la clave `chat-pending` (ver [data-model.md](data-model.md)). El aviso de escritura no se guarda en ningún lado.

**Testing**: Backend: Vitest (e2e del evento `typing` con clientes Socket.IO: llega solo a la otra persona con la conversación abierta, nunca en un chat de módulo, nunca a un tercero, no llega al emisor, límite de frecuencia, token inválido; unitaria del límite de frecuencia) y actualización del contrato `chat-socket.md`. App: Jest + React Native Testing Library con `AsyncStorage` simulado (pendientes que sobreviven a reabrir, de otro usuario, descartar, almacenamiento que falla, sin duplicar), iniciales, indicador con temporizadores simulados y con "reducir movimiento", y paridad de i18n es/en.

**Target Platform**: Android e iOS (app); API HTTPS y WebSocket en el mismo puerto.

**Project Type**: mobile-app + web-service. Toca `tutorias_uts_mobile` y `tutorias_uts_back`; `tutorias_uts_db` no cambia.

**Performance Goals**: el indicador llega en menos de 2 s y se apaga en menos de 6 s (SC-004); el servidor ignora los `typing` de un mismo socket y conversación con menos de 2 s entre sí, y la app emite a lo sumo uno cada 3 s.

**Constraints**: el texto de un mensaje o de un aviso de escritura nunca va a los registros; el evento `typing` no lleva texto, solo el identificador de la conversación; guard de acceso a la conversación como en `conversation:open`; solo chats directos; textos solo en `es.json` y `en.json`; colores solo de `Design.md`; íconos solo Iconify; objetivos de 48 px; animaciones que respetan "reducir movimiento"; el estado nunca solo por color.

**Scale/Scope**: una institución; decenas de pendientes como mucho por dispositivo. Eventos nuevos: 1 (`typing` del cliente y `typing` hacia la otra persona). Componentes nuevos en la app: `Avatar`, `TypingIndicator`; un gancho nuevo para el receptor y otro para el emisor.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Design.md` (indicador de escritura, estados de mensaje, avatares) y `Context.md` (chat directo y de módulo). Se actualizan `Design.md` (quitar de "Not built yet" lo hecho), `Architecture.md` (evento `typing` y dependencia), `chat-socket.md` de la 018 y `Decisions.md` (D-119; la numeración sigue a D-118 de la 021) en el mismo cambio. |
| II. Reglas de negocio en backend | No cambia quién puede escribir a quién ni la retención. El aviso de escritura pasa por el mismo control de acceso que `conversation:open`, y solo en chats directos. |
| III. Integridad de datos | Sin datos nuevos en la base. Los pendientes son del dispositivo y del usuario que los escribió. |
| IV. Seguridad y privacidad | Solo se avisa a la otra persona de una conversación a la que el emisor tiene acceso y que ella tiene abierta; el evento no lleva texto ni datos personales; los pendientes se borran al cerrar sesión y se filtran por usuario; nada del texto en los registros. |
| V. Pruebas primero en lo crítico | No toca las reglas del Principio II. Se escriben primero las pruebas de acceso del evento `typing` y las de pendientes entre usuarios. |
| VI. Internacionalización | Todos los textos en es y en. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; el indicador usa el estilo de burbuja recibida y los puntos de #575756. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. La dependencia nueva se justifica en research.md (R-1). Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/022-chat-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── chat-typing.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_back/
├── src/chat/chat.gateway.ts                   # @SubscribeMessage('typing'): acceso, directo, presencia, límite de frecuencia
├── src/chat/chat.service.ts                   # typingRecipients(me, conversationId): la otra persona de un chat directo
├── src/chat/chat-broadcaster.ts               # typing(userId, conversationId, from)
├── src/chat/chat-typing.ts                    # límite de frecuencia por socket y conversación (función pura)
├── src/chat/chat-typing.spec.ts
└── test/chat-typing.e2e-spec.ts               # acceso, directo, presencia, límite, ningún registro

tutorias_uts_mobile/
├── package.json                               # + @react-native-async-storage/async-storage
├── jest.setup.tsx                             # simulación oficial de AsyncStorage
├── src/features/chat/
│   ├── initials.ts                            # initialsOf(firstName, lastName)
│   ├── components/Avatar.tsx                  # iniciales o ícono de grupo
│   ├── components/TypingIndicator.tsx         # tres puntos en una burbuja recibida y el texto
│   ├── components/ConversationRow.tsx         # usa Avatar
│   ├── components/Composer.tsx                # onTyping al escribir
│   ├── components/MessageBubble.tsx           # "Descartar" junto a "Toca para reintentar"
│   ├── hooks/usePendingMessages.ts            # persist, userId, discard, hidratación
│   ├── hooks/useChatSocket.ts                 # limpia al cerrar sesión; vacía los pendientes al hidratar
│   ├── hooks/useTyping.ts                     # emisor (cada 3 s) y receptor (5 s) del aviso
│   ├── screens/ChatScreen.tsx                 # avatar en el encabezado, indicador y descartar
│   └── types.ts                               # PendingMessage con userId
├── src/i18n/{es,en}.json
└── src/features/chat/__tests__/

Claude/docs/                                   # Design, Architecture, Decisions; specs/018-chat/contracts/chat-socket.md
```

**Structure Decision**: mismo patrón de las specs 010 a 021: el cambio del servidor vive dentro del módulo `chat/` (gateway, servicio y difusor existentes) y el de la app dentro de `features/chat/`, con un componente y un gancho nuevos por cada pulido.

## Complexity Tracking

| Cosa | Por qué hace falta | Alternativa más simple descartada |
|---|---|---|
| Una dependencia nueva (`@react-native-async-storage/async-storage`) | Los pendientes son una lista de textos que debe sobrevivir al cierre de la app; `expo-secure-store` no sirve para listas (límite de tamaño por valor) y no hay otro almacenamiento en la app | Dejarlos en memoria (es el defecto que se corrige); `expo-file-system` o `expo-sqlite` (más código propio para un caso que el `persist` de Zustand ya resuelve) |
