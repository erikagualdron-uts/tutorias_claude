# Contrato del WebSocket del chat (spec 018)

Socket.IO en el mismo servidor y puerto de la API, espacio de nombres **`/chat`**. El socket solo **entrega**; las órdenes (enviar, leer, listar) son los endpoints REST de [chat-api.yaml](chat-api.yaml).

## Conexión

- El cliente se conecta con el token de acceso en el saludo: `io(<url>/chat, { auth: { token } })`.
- El servidor verifica el token y la sesión viva (la misma regla del guard HTTP). Si no valen, rechaza la conexión con el error `TOKEN_INVALID` (o el código de la cuenta: `ACCOUNT_DISABLED`, `ACCOUNT_UNAVAILABLE`) y no la mantiene.
- Al aceptar, el socket entra en la sala `user:<id>`. Cuando el token vence, la app renueva la sesión y reconecta con el token nuevo.
- Al reconectar, la app pide por REST lo que le falta (`GET /chat/conversations` y el historial de la conversación abierta); el socket no reenvía lo que se perdió mientras estuvo caído.

## Del cliente al servidor

| Evento | Carga | Efecto |
|---|---|---|
| `conversation:open` | `{ conversationId }` | Revalida que la conversación es mía; si lo es, registra que este dispositivo la tiene abierta (no llegan push de ella) y responde con acuse `{ ok: true }`. Si no, acuse `{ ok: false, code: "CHAT_NOT_FOUND" }`. |
| `conversation:close` | `{ conversationId }` | Deja de contarla como abierta. Al desconectar, todas las del socket se cierran solas. |
| `typing` | `{ conversationId }` | **Spec 022.** Avisa que el usuario está escribiendo. El servidor revalida que la conversación es suya y que es **directa**; si no, no hace nada. Responde `{ ok: true }` siempre. Descarta, sin error, un `typing` del mismo socket y la misma conversación con menos de 2 s del anterior. |

## Del servidor al cliente

| Evento | Carga | Cuándo |
|---|---|---|
| `message:new` | un `Message` del contrato REST | Cuando se guarda un mensaje, a cada destinatario que hoy puede verlo (cuenta activa y visibilidad), incluidos sus otros dispositivos, y al remitente en sus otros dispositivos. |
| `unread:changed` | `{ unread }` | Cuando cambia el total de sin leer del usuario (llega un mensaje o marca una conversación como leída), para que dos dispositivos coincidan. |
| `typing` | `{ conversationId, userId }` | **Spec 022.** A la otra persona de un chat directo, a su sala `user:<id>`, solo si tiene esa conversación abierta. Nunca al emisor, a un tercero ni en un chat de módulo. Sin texto, sin guardar; el receptor lo apaga a los 5 s. Ver `specs/022-chat-polish/contracts/chat-typing.md`. |

## Reglas

- El servidor guarda el mensaje **antes** de emitirlo; un reintento por REST no vuelve a emitirlo.
- Nunca se emite a una sala de conversación: solo a las salas `user:<id>` de quienes el servidor calculó en ese momento.
- Ningún evento lleva correo ni teléfono, y el texto de los mensajes no se registra en los logs.
