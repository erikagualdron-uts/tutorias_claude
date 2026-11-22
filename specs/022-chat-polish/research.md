# Research: Pulido del chat

Sin `NEEDS CLARIFICATION` abiertos. Cada punto resume qué se decidió y por qué.

## R-1. Dónde se guardan los pendientes

- **Decisión**: `@react-native-async-storage/async-storage` con el middleware `persist` de Zustand sobre `usePendingStore`. Clave `chat-pending`; se guarda solo la lista `items`. La dependencia se instala con `npx expo install` para que la versión sea la del SDK 58, y funciona en Expo Go y en las builds de EAS.
- **Razón**: `usePendingStore` ya es un almacén de Zustand en memoria; `persist` lo vuelve persistente casi sin código y se encarga de la hidratación. `expo-secure-store` (la única opción de almacenamiento que hay hoy) guarda valores pequeños y cifrados, pensados para claves, no para una lista de mensajes.
- **Alternativas**: `expo-file-system` (un archivo JSON a mano: más código y más casos de error); `expo-sqlite` (una base entera para una lista corta); seguir en memoria (es el defecto).

## R-2. Quién es el dueño de un pendiente

- **Decisión**: `PendingMessage` gana `userId`. Solo se ven y se envían los del usuario con sesión (`useSession().user.id`). Cuando la sesión pasa de iniciada a no iniciada (cerrar sesión, sesión vencida o revocada), el almacén se vacía. Al arrancar la app, mientras la sesión se restaura, no se borra nada: la transición se detecta comparando con el estado anterior de la sesión, no con "no hay sesión".
- **Razón**: la spec pide que otra cuenta en el mismo dispositivo no vea ni envíe los pendientes (FR-005). Filtrar por usuario protege aunque el borrado no llegue a ejecutarse (por ejemplo, si la app se cierra durante la salida); borrar al salir cumple "se borran del dispositivo".
- **Alternativas**: borrar siempre que no haya sesión (borraría los pendientes en cada arranque, antes de restaurar la sesión); guardarlos cifrados por usuario (más código para un texto que el usuario ya escribió en ese dispositivo).

## R-3. Cuándo salen y cómo se descartan

- **Decisión**: al terminar la hidratación y cada vez que el socket se conecta o la app vuelve a primer plano se llama a `flushPending`, como hoy, que envía lo que esté "enviando" y es del usuario actual. Lo "falló" no se reenvía solo (FR-003). Un mensaje "enviando" o "falló" muestra "Descartar" (junto a "Toca para reintentar" en el segundo); descartar lo quita del almacén y, por tanto, del dispositivo. El envío ya es seguro de repetir por `clientMessageId`: el servidor devuelve el mensaje que ya guardó.
- **Razón**: reutiliza `attemptSend` y la regla de reintento de la spec 018; la hidratación es asíncrona y sin esa llamada un pendiente esperaría a la próxima conexión.
- **Alternativas**: caducar los pendientes (se descartó en la spec; si el servidor ya no deja enviarlo, queda "falló" con su motivo).

## R-4. Almacenamiento que falla

- **Decisión**: el `storage` de `persist` se envuelve con `try/catch` en `getItem`, `setItem` y `removeItem`; si falla, devuelve `null` o ignora la escritura. El envío en memoria sigue igual.
- **Razón**: FR-006: sin espacio o con un error de almacenamiento el chat no debe romperse; solo se pierde la supervivencia al cierre.
- **Alternativas**: dejar que el error suba (rompería el envío por un problema del disco).

## R-5. Iniciales

- **Decisión**: `initialsOf(firstName, lastName)` toma la primera letra del primer nombre y la del apellido, en mayúsculas y conservando la tilde (`toLocaleUpperCase`), ignora espacios y devuelve una sola letra con un solo nombre o `''` con nombre vacío. El componente `Avatar` (48 px, fondo `surface`, letra en `primary`) muestra las letras en `typography.cardTitle`, o el ícono de grupo en un chat de módulo, o el de persona con un nombre vacío. Las letras llevan `accessible={false}`. Se usa en `ConversationRow` y, nuevo, en el encabezado del chat directo.
- **Razón**: FR-007 y FR-008. El nombre completo ya viene en la conversación (`partner.firstName` y `lastName`), así que no hay datos nuevos; el encabezado hoy no lleva avatar y la spec lo pide.
- **Alternativas**: color distinto por persona (colores nuevos fuera de `Design.md`); fotos de perfil (fuera de alcance).

## R-6. El evento `typing`

- **Decisión**: cliente → servidor `typing` con `{ conversationId }`. El gateway llama a `ChatService.typingRecipients(me, conversationId)`, que valida el acceso con el mismo `access()` de `conversation:open`, devuelve `[]` si la conversación no es directa y, si lo es, el identificador de la otra persona. Para cada destinatario con `presence.isOpen(destinatario, conversationId)` el difusor emite `typing` `{ conversationId, userId }` a su sala `user:<id>`. No hay evento de "dejó de escribir": el receptor lo apaga solo.
- **Razón**: reutiliza el acceso y la presencia de la spec 018 (FR-011: solo a quien tiene la conversación abierta). Sin evento de parada hay un solo evento que mantener y un fallo del emisor (socket caído) no deja el indicador pegado.
- **Alternativas**: un evento `typing:stop` (otro caso de error y no cubre la caída del socket); difundir a una sala de conversación (D-113 prohíbe emitir a salas de conversación: la visibilidad se calcula por mensaje).

## R-7. Frecuencia

- **Decisión**: la app emite `typing` al cambiar el texto, a lo sumo una vez cada 3 s por conversación y solo con texto no vacío; el servidor descarta un `typing` del mismo socket y conversación con menos de 2 s del anterior (función pura `ChatTypingLimiter` con un `Map` en memoria que se limpia al desconectar). El receptor apaga el indicador a los 5 s de la última señal.
- **Razón**: FR-011 y SC-004: la señal llega en menos de 2 s, se apaga en menos de 6 s y un cliente descuidado no puede inundar al servidor ni a la otra persona.
- **Alternativas**: sin límite en el servidor (confía en el cliente); un límite compartido por usuario (dos dispositivos del mismo usuario se estorbarían).

## R-8. Receptor

- **Decisión**: `usePartnerTyping(conversationId, partnerId)` escucha `typing` del socket; si coincide la conversación y el `userId` es el de la otra persona, muestra el indicador y reinicia un temporizador de 5 s; escucha también `message:new` y lo apaga cuando llega un mensaje de esa persona en esa conversación. En chats de módulo no se registra. `TypingIndicator` dibuja tres puntos de #575756 con una animación corta de Reanimated y, con "reducir movimiento", los deja quietos; siempre lleva el texto "está escribiendo…" y se coloca al pie de la lista, en el estilo de burbuja recibida.
- **Razón**: FR-009, FR-010 y FR-012; el estado nunca depende solo del movimiento.
- **Alternativas**: un banner bajo la barra superior (no es lo que dice `Design.md`).

## R-9. Registros y privacidad

- **Decisión**: el manejador de `typing` no escribe en los registros; el evento no lleva texto. La prueba de redacción de logs de la 018 se amplía con el indicador y con un pendiente.
- **Razón**: SC-006 y la regla de que ningún texto de chat va a los registros.
