# Implementation Plan: Chat y anuncios

**Branch**: `018-chat` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/018-chat/spec.md`

## Summary

Chats individuales (CAE con docente, docente con estudiante inscrito) y un chat por módulo con anuncios del docente, con entrega al instante a quien tiene la conversación abierta, contador de sin leer, push para quien no la tiene abierta y borrado de mensajes viejos según la retención.

Enfoque técnico (detalle en [research.md](research.md)):

- **Las órdenes van por REST y la entrega por WebSocket.** Enviar, leer, listar y paginar son endpoints REST con los guards de siempre (idempotentes por `clientMessageId`); el WebSocket (Socket.IO, ya previsto en `Architecture.md`) solo empuja `message:new` a quien debe verlo y avisa qué conversación tiene abierta cada dispositivo.
- **Permisos calculados en cada envío**, no copiados: la pareja docente-estudiante sale de las inscripciones vivas; el chat del módulo, del docente del módulo y de las inscripciones de cada estudiante, que además fijan desde y hasta cuándo ve mensajes (sin duplicar participantes).
- **Cuatro tablas nuevas** con los nombres de `Architecture.md`: `conversations`, `conversation_members`, `messages` (y los enums). El contador de sin leer sale de `lastReadAt` por miembro.
- **Push propio, sin tocar la bandeja de avisos**: una mensajería no es un aviso de cambio. Reutiliza `PushGateway` y el criterio de dispositivos vivos; un solo push por ráfaga (clave en Redis con vencimiento) y solo para los anuncios en el chat del módulo.
- **Retención con una tarea programada** diaria (mismo patrón que el cierre de periodos), de borrado lógico, con los plazos en configuración.
- **Entrega por fases**: primero el chat individual (US1 a US4), después el chat del módulo con anuncios (US5) y la retención (US6).
- **Dos dependencias nuevas**: `@nestjs/websockets` y `@nestjs/platform-socket.io` en el backend, `socket.io-client` en la app (y en pruebas del backend).

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7, class-validator, `@nestjs/schedule`, ioredis (presentes) + `@nestjs/websockets` y `@nestjs/platform-socket.io` (nuevas). App: Expo Router, TanStack Query, i18next, `react-native-iconify` (presentes) + `socket.io-client` (nueva).

**Storage**: PostgreSQL. Tablas nuevas `conversations`, `conversation_members` y `messages` (ver [data-model.md](data-model.md)); una migración en `tutorias_uts_db`. Redis para el límite de ráfaga de push.

**Testing**: Backend: Vitest (unitarias de permisos, de la visibilidad y de la ráfaga; e2e con Supertest y `socket.io-client` sobre PostgreSQL de prueba: parejas permitidas, solo lectura, anuncios, sin leer, entrega en vivo, push, retención) y contrato contra `contracts/chat-api.yaml`. App: Jest + React Native Testing Library, con un socket simulado, y paridad de i18n.

**Target Platform**: Android e iOS (app); API HTTPS y WebSocket en el mismo servidor y puerto.

**Project Type**: mobile-app + web-service + base de datos. Toca `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db`.

**Performance Goals**: un mensaje llega a quien lo tiene abierto en menos de 2 s (SC-001); la lista de conversaciones con contadores en menos de 300 ms con 200 conversaciones; índices por conversación y fecha.

**Constraints**: permisos por guard de roles y de pertenencia en cada endpoint y al abrir una conversación por socket; una conversación ajena responde `404`; borrado lógico (`deletedAt`); fechas en UTC; textos solo en `es.json` y `en.json`; colores solo de `Design.md`; objetivos de 48 px; íconos solo Iconify; todo botón con ícono a la izquierda y 16 px entre botones apilados; los cuatro estados de pantalla; el texto de un mensaje nunca va a los registros (logs); una instancia del servidor por ahora (la presencia vive en memoria; con varias instancias haría falta el adaptador de Redis de Socket.IO).

**Scale/Scope**: una institución; cientos de usuarios conectados a la vez como máximo. Endpoints nuevos: 8 REST y un espacio de nombres WebSocket `/chat` con 2 eventos del cliente y 2 del servidor. Pantallas nuevas: 4 (lista de chats dentro de "Mensajes", conversación, elegir con quién escribir, y el aviso de reconexión como banner) y 1 modificada (la pestaña "Mensajes" gana "Avisos" y "Chats").

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Context.md` (quién escribe a quién, retención 6 meses y 2 años), `Architecture.md` §8 (Socket.IO con JWT, mensajes guardados antes de emitirse, push si no está conectado, job de retención) y `Design.md` (Messages). Se actualizan `Context`, `Architecture`, `Design` y `Decisions` (D-113 y D-114; la numeración sigue a D-112 de la 017). |
| II. Reglas de negocio en backend | Quién puede hablar con quién, el solo lectura y los anuncios del docente los valida el servidor en cada envío; la app solo oculta botones. |
| III. Integridad de datos | `deletedAt` en conversaciones y mensajes y las consultas lo filtran; fechas en UTC y texto en `America/Bogota`; retención en configuración, no en el código. |
| IV. Seguridad y privacidad | Guards de roles y de pertenencia; el socket se autentica con el JWT y la sesión viva, y revalida la pertenencia al abrir una conversación; ningún texto de mensaje, correo ni teléfono en logs; el push lleva el nombre de quien escribe y el texto (lo pide la spec) y nunca datos de contacto. |
| V. Pruebas primero en lo crítico | Las reglas nuevas (parejas permitidas, solo lectura, anuncios, ventana de visibilidad, sin leer, retención) se prueban antes de implementar; las del Principio II no cambian. |
| VI. Internacionalización | Textos de la app y push del anuncio en es y en; errores nuevos con código estable traducido. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; toda acción bloqueada muestra su regla ("Ya no comparten un módulo"). |
| VIII. Desarrollo incremental | Una rama por funcionalidad; entrega en dos fases (individual y módulo); el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/018-chat/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── chat-api.yaml        # REST
│   └── chat-socket.md       # eventos del WebSocket
├── checklists/
│   └── requirements.md
└── tasks.md                 # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
└── prisma/
    ├── schema.prisma                          # + ConversationType, MessageKind, Conversation, ConversationMember, Message
    └── migrations/<ts>_add_chat/              # tablas, enums y restricciones

tutorias_uts_back/
├── src/chat/
│   ├── chat.module.ts
│   ├── chat.controller.ts                     # los 8 endpoints REST
│   ├── chat.service.ts                        # contactos, conversaciones, enviar, leer, historial, sin leer
│   ├── chat-access.ts                         # quién puede ver y quién puede escribir (parejas, módulo, solo lectura)
│   ├── chat.gateway.ts                        # espacio /chat: autenticación, abrir/cerrar conversación, message:new
│   ├── chat-presence.ts                       # qué conversación tiene abierta cada usuario (en memoria)
│   ├── chat-push.service.ts                   # push a quien no la tiene abierta, con límite por ráfaga
│   ├── chat-retention.task.ts                 # tarea diaria de borrado lógico
│   ├── dto/                                   # CreateDirectDto, SendMessageDto, ListMessagesQuery, ContactsQuery
│   └── *.spec.ts
├── src/notifications/devices.ts               # criterio único de dispositivos vivos (lo usan avisos y chat)
├── src/settings/settings.service.ts           # + chat.messageMaxLength, chat.directRetentionMonths, chat.moduleRetentionMonths, chat.pushBurstSeconds
├── src/common/errors/app.exception.ts         # + CHAT_*
└── test/chat-*.e2e-spec.ts

tutorias_uts_mobile/
├── app/(student)/messages/, (teacher)/messages/, (admin)/messages/   # index, new, [id] (reemplazan messages.tsx)
├── src/features/chat/
│   ├── api.ts, hooks/                         # lista, historial, enviar, leer, contactos, sin leer, socket
│   ├── socket.ts                              # conexión con el token, reconexión y eventos
│   ├── components/                            # ConversationRow, MessageBubble, AnnouncementCard, Composer, ReconnectBanner
│   └── screens/                               # MessagesScreen (Avisos y Chats), ChatScreen, NewChatScreen
├── src/features/notifications/openTarget.ts   # un push con conversationId abre la conversación
├── src/i18n/{es,en}.json                      # textos y errores nuevos
└── src/icons/registry.ts                      # íconos nuevos del set solar

Claude/docs/                                   # Context, Architecture, Design, Decisions
```

**Structure Decision**: tres repos con el mismo patrón de las specs anteriores: un módulo de negocio nuevo en el backend (`src/chat/`), una carpeta por funcionalidad en la app (`src/features/chat/`) y una migración en `tutorias_uts_db`. El WebSocket vive dentro del módulo de chat, no en uno aparte.

## Complexity Tracking

| Elemento | Por qué hace falta | Alternativa más simple descartada porque |
|---|---|---|
| Dos dependencias de WebSocket en el backend y una en la app | La entrega al instante (SC-001) no se logra bien consultando cada pocos segundos, y `Architecture.md` ya prescribe Socket.IO | Consultar la API cada 2 s: gasta batería y datos y multiplica las peticiones; no cumple "al instante" |
