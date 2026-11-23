# Data Model: Pulido del chat

**Sin tablas, columnas, enums ni migraciones en la base de datos.** Esta spec no toca `tutorias_uts_db`.

## En el dispositivo: mensaje pendiente

Se guarda en `AsyncStorage` bajo la clave `chat-pending` (solo la lista `items`). Es el `PendingMessage` de la spec 018, con un campo más:

| Campo | Tipo | Notas |
|---|---|---|
| `clientMessageId` | UUID (cadena) | Identificador del mensaje, ya existente; hace seguro el reintento |
| `conversationId` | UUID | Conversación a la que va |
| `body` | cadena | El texto escrito; nunca se registra |
| `kind` | `TEXT` \| `ANNOUNCEMENT` | Tipo del mensaje |
| `createdAt` | fecha-hora ISO | Cuándo lo escribió |
| `status` | `sending` \| `failed` | "enviando" sale solo; "falló" espera al usuario |
| `errorCode` | cadena, opcional | Motivo cuando falló (código estable de la API) |
| `userId` | UUID | **Nuevo.** Quien lo escribió; solo ese usuario lo ve y lo envía |

Reglas:

- Solo se ven y se envían los pendientes cuyo `userId` es el del usuario con sesión; los de otro quedan guardados sin mostrarse hasta que se vacía el almacén.
- Al pasar de con sesión a sin sesión (cerrar sesión, sesión vencida o revocada) el almacén se vacía. Al arrancar la app, mientras se restaura la sesión, no se vacía.
- No caducan: salen cuando hay conexión o el usuario los descarta.
- Si el almacenamiento falla, la lista sigue en memoria y no hay error visible.
- No se guarda nada más del chat en el dispositivo (los mensajes ya recibidos viven en la caché de consultas y se piden otra vez).

## Calculado, sin guardar

- **Iniciales de un avatar**: `initialsOf(firstName, lastName)`, hasta dos letras en mayúsculas; `''` si el nombre está vacío.
- **Estado de escritura de la otra persona**: un booleano en memoria de la pantalla del chat, con un temporizador de 5 s.

## En el servidor: solo en memoria

- **Límite de frecuencia de `typing`**: un `Map` por socket y conversación con el instante del último aviso aceptado; se limpia al desconectar. No se guarda en la base de datos y no sobrevive a un reinicio.

## Evento (no se guarda)

`typing` del cliente al servidor: `{ conversationId }`. `typing` del servidor a la otra persona: `{ conversationId, userId }`. Ver [contracts/chat-typing.md](contracts/chat-typing.md).
