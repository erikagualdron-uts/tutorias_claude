# Cambios del contrato del chat (spec 022)

No hay endpoints REST nuevos. Se agrega **un evento** al WebSocket de [specs/018-chat/contracts/chat-socket.md](../../018-chat/contracts/chat-socket.md) (espacio `/chat`, mismo puerto de la API). Al implementar, esa tabla se actualiza con esta fila y esta regla.

## Del cliente al servidor

| Evento | Carga | Efecto |
|---|---|---|
| `typing` | `{ conversationId }` | Avisa que el usuario está escribiendo en esa conversación. El servidor revalida que la conversación es suya (el mismo control de `conversation:open`) y que es **directa**; si no, no hace nada. Responde con acuse `{ ok: true }` en todos los casos (no revela si la otra persona la tiene abierta). Descarta, sin error, un `typing` del mismo socket y la misma conversación con menos de 2 s del anterior. |

## Del servidor al cliente

| Evento | Carga | Cuándo |
|---|---|---|
| `typing` | `{ conversationId, userId }` | A la otra persona de un chat directo, a su sala `user:<id>`, **solo si tiene esa conversación abierta** (presencia de la spec 018). Nunca al emisor, nunca a un tercero, nunca en un chat de módulo. |

## Reglas

- El evento no lleva texto ni ningún dato personal: solo identificadores.
- No hay evento de "dejó de escribir": el receptor apaga el indicador a los 5 s de la última señal, o cuando llega un mensaje de esa persona en esa conversación.
- El aviso es efímero: no se guarda, no se registra y no se repite a una conversación cerrada.
- La app emite `typing` a lo sumo cada 3 s y solo con texto no vacío en el campo de escritura.
- Una conversación de solo lectura (`canWrite: false`) no genera avisos: quien no puede escribir no tiene campo activo.
