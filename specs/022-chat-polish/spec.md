# Feature Specification: Pulido del chat

**Feature Branch**: `022-chat-polish`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Pulido del chat. Cierra los pendientes que Design.md marca como 'Not built yet' del chat y que no piden reglas de negocio nuevas: los mensajes sin enviar sobreviven al cierre de la app, los avatares muestran iniciales y el indicador 'está escribiendo'. Quedan fuera editar o borrar mensajes, acuses de lectura y adjuntos."

## Estado de partida (revisión del 2026-11-22)

| Qué ya existe | Dónde |
|---|---|
| Chats directos y de módulo, anuncios, bandeja y contador de sin leer | spec 018 |
| Mensajes con estados "enviando", "enviado" y "falló, toca para reintentar", y reintento seguro por identificador del mensaje | spec 018, D-113 |
| Los mensajes escritos sin conexión quedan "enviando" y salen al volver la conexión, **mientras la app sigue abierta** | spec 018, `Design.md` |
| Avatar de 48 px con un ícono de persona (o de grupo en el chat de módulo) | spec 018, D-115 |
| WebSocket que solo entrega mensajes nuevos y el total de sin leer, con presencia de la conversación abierta | spec 018, D-114 |

| Qué falta (anotado en `Design.md` como "Not built yet (chat)") | |
|---|---|
| Que un mensaje sin enviar no se pierda si la app se cierra | |
| Iniciales en los avatares de las personas | |
| El indicador "está escribiendo" | |

## Clarifications

### Session 2026-11-22

- Q: ¿Entran editar o borrar un mensaje, los acuses de lectura y los adjuntos? → A: No; piden decisiones de negocio (retención, privacidad) y quedan fuera.
- Q: ¿Entra el botón flotante de "Nuevo mensaje"? → A: No; D-115 ya dejó el botón sobre la lista y no se cambia.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - No perder lo que escribí (Priority: P1)

Un mensaje que no alcanzó a enviarse (sin conexión, o porque la app se cerró antes) queda guardado en el dispositivo y se envía solo cuando la app vuelve a abrirse y hay conexión. Mientras tanto se ve en su conversación con el estado "enviando", como hoy.

**Why this priority**: Hoy un mensaje sin enviar se pierde si la app se cierra o el sistema la descarta; el estudiante o el docente cree que lo mandó y la otra persona nunca lo recibe.

**Independent Test**: Sin conexión, escribir un mensaje, cerrar la app por completo, abrirla con conexión y comprobar que el mensaje salió una sola vez y la otra persona lo recibió.

**Acceptance Scenarios**:

1. **Given** un mensaje escrito sin conexión, **When** el usuario cierra la app y la vuelve a abrir con conexión, **Then** el mensaje se envía una sola vez y pasa de "enviando" a "enviado".
2. **Given** un mensaje pendiente, **When** el usuario abre su conversación después de reabrir la app, **Then** lo ve en su lugar con el estado "enviando", antes de que salga.
3. **Given** un mensaje que el servidor rechazó (por ejemplo porque ya no puede escribir en esa conversación), **When** la app se reabre, **Then** sigue como "falló" con su motivo y "Toca para reintentar", sin reenviarse solo.
4. **Given** un mensaje "enviando" o "falló", **When** el usuario elige "Descartar", **Then** el mensaje desaparece de la conversación y del dispositivo y nunca se envía.
5. **Given** que el usuario cierra sesión, **When** vuelve a entrar otra persona en el mismo dispositivo, **Then** no ve ni envía los mensajes pendientes del usuario anterior.
6. **Given** que la app reintenta un mensaje que el servidor ya había guardado, **When** llega la respuesta, **Then** el mensaje aparece una sola vez en la conversación.

---

### User Story 2 - Avatares con iniciales (Priority: P2)

Los avatares de las personas muestran sus iniciales (hasta dos letras) en la lista de conversaciones y en el encabezado del chat, en lugar del ícono genérico. Los chats de módulo conservan el ícono de grupo.

**Why this priority**: Con muchas conversaciones, el ícono igual en todas obliga a leer cada nombre; las iniciales ayudan a reconocer a la persona de un vistazo. No bloquea escribir ni leer.

**Independent Test**: Con conversaciones con "Ana Soto", "Luis" y un módulo, abrir la lista y comprobar "AS", "L" y el ícono de grupo.

**Acceptance Scenarios**:

1. **Given** una conversación con una persona de nombre y apellido, **When** se ve la lista, **Then** el avatar muestra la inicial del nombre y la del apellido, en mayúsculas.
2. **Given** una persona con un solo nombre, **When** se ve su avatar, **Then** muestra una sola inicial.
3. **Given** el chat de un módulo, **When** se ve su avatar, **Then** muestra el ícono de grupo y no iniciales.
4. **Given** el encabezado de un chat directo, **When** se abre, **Then** el avatar coincide con el de la lista.
5. **Given** un lector de pantalla, **When** pasa por el avatar, **Then** no lee las letras: el nombre ya está escrito al lado.

---

### User Story 3 - Saber que me están escribiendo (Priority: P2)

En un chat directo, cuando la otra persona está escribiendo, se ve un indicador de tres puntos animados en una burbuja de mensaje recibido y el texto "está escribiendo…". Desaparece cuando deja de escribir o llega su mensaje.

**Why this priority**: Evita escribir encima de la otra persona y da sensación de conversación en vivo; es un aviso sobre algo que ya funciona, por eso no bloquea el chat.

**Independent Test**: Con dos usuarios en el mismo chat directo, uno escribe y el otro ve el indicador; el primero deja de escribir y el indicador desaparece.

**Acceptance Scenarios**:

1. **Given** un chat directo abierto por los dos, **When** uno empieza a escribir, **Then** el otro ve el indicador "está escribiendo" en su pantalla.
2. **Given** el indicador visible, **When** la otra persona deja de escribir durante unos segundos, **Then** el indicador desaparece solo.
3. **Given** el indicador visible, **When** llega el mensaje de esa persona, **Then** el indicador desaparece y aparece el mensaje.
4. **Given** el chat de un módulo, **When** alguien escribe, **Then** no se muestra ningún indicador.
5. **Given** un usuario sin la conversación abierta, **When** la otra persona escribe, **Then** no recibe nada.
6. **Given** el modo "reducir movimiento", **When** se muestra el indicador, **Then** los puntos no se animan y el texto "está escribiendo…" sigue visible.

---

### Edge Cases

- Varios mensajes pendientes de distintas conversaciones: salen en el orden en que se escribieron, cada uno en su conversación.
- La app se reabre sin conexión: los mensajes siguen "enviando" y salen cuando la haya.
- El mismo mensaje pendiente no sale dos veces aunque la app se abra y se cierre varias veces (el reintento es seguro por identificador).
- La persona dejó de poder recibir mensajes (cuenta desactivada, módulo sin acceso): el servidor lo rechaza y queda como "falló" con el motivo, sin perderse en silencio.
- El dispositivo se queda sin espacio o el almacenamiento falla: el mensaje se sigue enviando como hasta ahora, solo que no sobrevive al cierre, sin fallar la pantalla.
- Un nombre con una sola palabra, con tildes o con minúsculas: la inicial sale en mayúscula y con su tilde; un nombre vacío muestra el ícono de persona.
- Escribir y borrar todo el texto, o enviar el mensaje: el indicador de la otra persona se apaga.
- El socket se cae mientras alguien escribía: el indicador desaparece por el tiempo de espera, no queda pegado.
- Textos y estados en español e inglés según el dispositivo; fechas en `America/Bogota`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Un mensaje que no se envió (sin conexión, o la app se cerró antes de enviarlo) MUST guardarse en el dispositivo y enviarse al volver a abrir la app con conexión, una sola vez, sin que el usuario haga nada.
- **FR-002**: Un mensaje pendiente MUST verse en su conversación, en su lugar y con su estado ("enviando" o "falló"), también después de reabrir la app.
- **FR-003**: Un mensaje que el servidor rechazó MUST seguir como "falló" con su motivo y "Toca para reintentar", y MUST NOT reenviarse sin que el usuario lo pida.
- **FR-004**: El usuario MUST poder descartar un mensaje "enviando" o "falló"; al hacerlo desaparece de la conversación y del dispositivo y nunca se envía.
- **FR-005**: Los mensajes pendientes MUST ser del usuario que los escribió: al cerrar sesión MUST borrarse del dispositivo y otra cuenta que entre no los ve ni los envía.
- **FR-006**: El almacenamiento de los pendientes MUST guardar solo lo necesario para enviarlos (conversación, texto, tipo, identificador del mensaje y fecha) y MUST NOT registrar su texto en los registros; si el almacenamiento falla, el envío sigue funcionando sin él.
- **FR-007**: Los avatares de personas MUST mostrar sus iniciales (nombre y apellido, o una sola letra con un solo nombre), en mayúsculas, en la lista de conversaciones y en el encabezado del chat; con un nombre vacío MUST mostrar el ícono de persona.
- **FR-008**: Los chats de módulo MUST seguir mostrando el ícono de grupo, y las iniciales MUST NOT leerse con lector de pantalla.
- **FR-009**: En un chat directo, cuando una de las dos personas escribe, la otra, si tiene esa conversación abierta, MUST ver el indicador "está escribiendo…" con tres puntos en una burbuja de mensaje recibido.
- **FR-010**: El indicador MUST desaparecer cuando la persona deja de escribir unos segundos, borra su texto, envía el mensaje o se pierde la conexión; en el chat de módulo MUST NOT mostrarse.
- **FR-011**: El aviso de escritura MUST ser efímero: el servidor MUST NOT guardarlo ni registrar su contenido, solo lo entrega a la otra persona de esa conversación cuando está abierta, y MUST NOT enviarse con más frecuencia que la necesaria mientras alguien escribe.
- **FR-012**: Con "reducir movimiento" activo, los puntos MUST mostrarse quietos y el texto "está escribiendo…" MUST seguir visible.
- **FR-013**: Esta spec MUST NOT cambiar las reglas del chat: quién puede escribir a quién, la retención, los anuncios, el contador de sin leer ni las notificaciones; editar o borrar un mensaje, los acuses de lectura y los adjuntos quedan fuera de alcance.
- **FR-014**: Todos los textos MUST estar en español e inglés, los íconos solo Iconify, los colores solo los de `Design.md` y los objetivos táctiles de 48 px como mínimo; el estado nunca se indica solo con color.

### Key Entities

- **Mensaje pendiente**: un mensaje escrito por el usuario y aún no entregado, con su conversación, texto, tipo, identificador de mensaje, fecha y estado ("enviando" o "falló"). Se guarda en el dispositivo y es del usuario que lo escribió.
- **Iniciales de un avatar**: una a dos letras calculadas a partir del nombre de la persona; no se guardan.
- **Aviso de escritura**: señal efímera "esta persona está escribiendo en esta conversación"; no se guarda.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los mensajes escritos sin conexión sale una sola vez después de cerrar y reabrir la app con conexión, en las pruebas de cierre.
- **SC-002**: Ningún mensaje pendiente de un usuario es visible ni enviable por otra cuenta en el mismo dispositivo tras cerrar sesión.
- **SC-003**: El 100 % de los avatares de personas muestra las iniciales correctas, y el de módulo el ícono de grupo.
- **SC-004**: El indicador "está escribiendo" aparece en la otra pantalla en menos de 2 segundos desde que se empieza a escribir y desaparece en menos de 6 segundos desde que se deja de escribir.
- **SC-005**: El indicador nunca aparece en un chat de módulo ni en una conversación que la otra persona no tiene abierta.
- **SC-006**: Ninguna prueba de registros encuentra el texto de un mensaje pendiente ni de un aviso de escritura.

## Assumptions

- El indicador de escritura es solo para chats directos: en los chats de módulo, con decenas de personas, sería ruido constante. Si se quiere después, es otra spec.
- Los pendientes no caducan: salen cuando hay conexión o el usuario los descarta. Si el servidor ya no deja enviar uno, queda como "falló" con su motivo.
- Los pendientes guardan solo texto; sin adjuntos no hay otro contenido que persistir.
- Solo se persiste lo que el usuario escribió en ese dispositivo; los pendientes no se comparten entre dispositivos.
- El aviso de escritura se emite mientras hay actividad en el campo de texto y se renueva a lo sumo cada pocos segundos; el receptor lo apaga solo pasados unos segundos sin renovación.
- Las iniciales salen del nombre que la app ya recibe de cada conversación; no hay fotos de perfil ni nuevos datos en la base de datos.
- Las iniciales usan los colores de `Design.md` (superficie suave con letra en verde de marca, como hoy el fondo del avatar).
- Queda fuera de alcance: editar o borrar mensajes, acuses de lectura, adjuntos, fotos de perfil, el botón flotante y cualquier cambio de reglas del chat.
