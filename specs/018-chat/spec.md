# Feature Specification: Chat y anuncios

**Feature Branch**: `018-chat`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Chat y anuncios. Mensajería en tiempo real entre las personas de la app. Se puede escribir así: el CAE con los docentes (en ambos sentidos); el docente con los estudiantes de sus módulos; y el estudiante puede iniciar la conversación con el docente de un módulo en el que está inscrito. Hay chats individuales y un chat por módulo. El docente también publica anuncios a los estudiantes de un módulo, que se ven como tarjetas distintas de los mensajes. La pestaña "Mensajes" tiene las secciones "Avisos" y "Chats". Cada usuario ve solo sus conversaciones, con el último mensaje, la hora y el contador de mensajes sin leer, y abre una para leerla y escribir. Los mensajes se guardan antes de entregarse y llegan al instante a quien tiene la conversación abierta, con estados de envío (enviando, enviado, falló con reintento) y un aviso de reconexión. Si el destinatario no está conectado, recibe un push y el mensaje queda en la bandeja. Una cuenta desactivada o eliminada (spec 016) no puede escribir ni recibir. Quien se da de baja de un módulo deja de ver el chat grupal desde ese momento. La retención es de 6 meses para los mensajes y anuncios de módulo y 2 años para los chats individuales. Los permisos se validan con guards de roles y de pertenencia en el backend. Los borrados son lógicos. Todos los textos van en español e inglés."

## Estado de partida (revisión del 2026-11-22)

| Qué ya existe | Dónde |
|---|---|
| Pestaña "Mensajes" en la navegación de los tres roles, hoy vacía | D-042 |
| Bandeja de la app, push y correo con dispositivos, cola, reintentos y plantillas por idioma | spec 014 y 015 |
| Una cuenta desactivada o eliminada no puede entrar ni recibir avisos | spec 016 |
| Inscripciones de un estudiante a un módulo (quién está inscrito y desde cuándo) | spec 011 |
| Tarea programada en el servidor (por ejemplo, el cierre de periodos) | spec 006 |

| Qué falta | |
|---|---|
| Conversaciones, mensajes y anuncios, y las pantallas para leerlos y escribirlos | |
| Entrega al instante a quien tiene la conversación abierta (hoy no hay ninguna conexión en tiempo real) | |
| Borrar mensajes viejos según la retención | |

## Clarifications

### Session 2026-11-22

- Q: En el chat grupal de un módulo, ¿pueden escribir los estudiantes inscritos o solo el docente? → A: Escriben el docente y los inscritos; el anuncio es un mensaje especial que solo publica el docente.
- Q: En el chat grupal de un módulo, ¿qué mensajes mandan un push a los inscritos? → A: Solo los anuncios; los mensajes del grupo solo suman al contador de sin leer y a la lista.
- Q: Cuando un estudiante ya no está inscrito en ningún módulo de un docente, ¿qué pasa con su conversación individual? → A: Queda de solo lectura para los dos hasta que vuelvan a compartir un módulo; el historial se conserva hasta la retención.
- Q: Si alguien escribe sin conexión y cierra la app antes de que se envíe, ¿el mensaje se guarda en el dispositivo? → A: No: solo se reenvía mientras la app sigue abierta; si se cierra antes de enviar, el mensaje no sale.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conversar uno a uno (Priority: P1)

Una persona abre una conversación con alguien con quien puede hablar y se escriben. Pueden hablar: el CAE con cualquier docente y al revés; un docente con los estudiantes inscritos en sus módulos y al revés; y el estudiante puede iniciar la conversación con el docente de un módulo en el que está inscrito. Dos personas tienen una sola conversación entre ellas, aunque compartan varios módulos.

**Why this priority**: Es el canal de comunicación que pide la institución; sin esto no hay chat.

**Independent Test**: Con un estudiante inscrito, su docente y el CAE: el estudiante escribe al docente, el docente responde, el CAE escribe al docente; un estudiante no inscrito en ningún módulo de ese docente no puede escribirle.

**Acceptance Scenarios**:

1. **Given** un estudiante inscrito en un módulo de un docente, **When** elige a ese docente y escribe un mensaje, **Then** se crea la conversación entre los dos y el docente la ve con el mensaje.
2. **Given** una conversación existente entre dos personas, **When** cualquiera vuelve a elegir a la otra para escribirle, **Then** abre la misma conversación y no se crea otra.
3. **Given** un docente, **When** elige para escribir, **Then** solo puede elegir a los estudiantes inscritos en sus módulos y al CAE.
4. **Given** un estudiante, **When** elige para escribir, **Then** solo puede elegir a los docentes de los módulos en los que está inscrito.
5. **Given** un estudiante que no está inscrito en ningún módulo de un docente, **When** intenta escribirle, **Then** el backend lo rechaza y la app muestra la regla.
6. **Given** dos estudiantes, **When** uno intenta escribirle al otro, **Then** el backend lo rechaza.
7. **Given** un mensaje vacío o de solo espacios, **When** intenta enviarlo, **Then** no se envía.
8. **Given** un estudiante y un docente que ya no comparten ningún módulo, **When** cualquiera abre su conversación, **Then** puede leer el historial pero no escribir, y la app muestra la regla que lo bloquea.

---

### User Story 2 - Ver mis conversaciones y lo que no he leído (Priority: P1)

El usuario abre "Mensajes", sección "Chats", y ve solo sus conversaciones, ordenadas por el último mensaje, cada una con la otra persona (o el módulo), el último mensaje, la hora y el número de mensajes sin leer. Al abrir una, lee el historial y los mensajes quedan leídos.

**Why this priority**: Sin ver y distinguir lo nuevo, el chat no se puede usar; el contador de sin leer también alimenta los dashboards.

**Independent Test**: Con varias conversaciones y mensajes sin leer, abrir la lista, comprobar orden y contadores, abrir una y comprobar que su contador queda en cero y los demás no cambian.

**Acceptance Scenarios**:

1. **Given** varias conversaciones, **When** el usuario abre "Chats", **Then** las ve de la más reciente a la más antigua, con último mensaje, hora y contador de sin leer.
2. **Given** una conversación con mensajes sin leer, **When** el usuario la abre, **Then** su contador pasa a cero y el contador total de "Mensajes" baja en lo mismo.
3. **Given** un usuario sin conversaciones, **When** abre "Chats", **Then** ve un estado vacío con la forma de iniciar una.
4. **Given** el identificador de una conversación ajena, **When** un usuario intenta abrirla, **Then** el backend la trata como inexistente.
5. **Given** una conversación larga, **When** el usuario sube, **Then** se cargan los mensajes anteriores por tramos.

---

### User Story 3 - Recibir y enviar al instante (Priority: P1)

Mientras dos personas tienen la misma conversación abierta, cada mensaje llega a la otra en cuanto se envía, sin recargar. El que envía ve el estado de su mensaje: "enviando", "enviado" o "falló", y en el segundo caso puede reintentar con un toque. Si se pierde la conexión, la app avisa que está reconectando; lo escrito sin conexión queda "enviando" y sale al volver.

**Why this priority**: "Tiempo real" es la regla de negocio del chat; sin eso es un buzón.

**Independent Test**: Con dos sesiones abiertas en la misma conversación, enviar mensajes en ambos sentidos y comprobar que llegan sin recargar; cortar y devolver la conexión de una y comprobar el aviso, el mensaje pendiente y que no se duplica.

**Acceptance Scenarios**:

1. **Given** dos personas con la conversación abierta, **When** una envía, **Then** la otra lo ve en menos de 2 segundos sin hacer nada.
2. **Given** un envío en curso, **When** el servidor lo guarda, **Then** el mensaje pasa de "enviando" a "enviado".
3. **Given** un envío que falla, **When** el usuario toca "reintentar", **Then** se envía de nuevo y llega una sola vez.
4. **Given** una pérdida de conexión, **When** el usuario escribe, **Then** el mensaje queda "enviando", la app muestra "Reconectando…" y el mensaje sale al volver la conexión, una sola vez.
5. **Given** una persona con la lista de chats abierta, **When** le llega un mensaje, **Then** la conversación sube al primer lugar y su contador sube.

---

### User Story 4 - Enterarme cuando no estoy conectado (Priority: P2)

Si el destinatario no tiene la conversación abierta o no está conectado, el mensaje igual le llega: queda en su lista con el contador y recibe un push con el nombre de quien escribe y el mensaje, en el idioma del dispositivo. Al tocar el push abre esa conversación.

**Why this priority**: Evita que un mensaje pase desapercibido; reutiliza dispositivos y cola de la spec 014, por eso no bloquea el chat en sí.

**Independent Test**: Con el destinatario sin la app abierta y con un dispositivo registrado, enviarle un mensaje y comprobar el push, el contador al abrir la app y que el toque abre la conversación.

**Acceptance Scenarios**:

1. **Given** un destinatario con un dispositivo registrado y sin la conversación abierta, **When** le escriben, **Then** recibe un push y el mensaje queda sin leer en su lista.
2. **Given** un destinatario que rechazó el permiso de push, **When** le escriben, **Then** el mensaje igual está en su lista con el contador.
3. **Given** un push de chat, **When** el usuario lo toca, **Then** se abre esa conversación.
4. **Given** un destinatario con la conversación abierta en ese momento, **When** le escriben, **Then** no recibe push.
5. **Given** el chat grupal de un módulo, **When** un inscrito escribe un mensaje normal, **Then** los demás lo ven en su lista con el contador y no reciben push.

---

### User Story 5 - Chat del módulo y anuncios del docente (Priority: P2)

Cada módulo tiene un chat grupal con su docente y los estudiantes inscritos, y el docente puede publicar **anuncios** a esos estudiantes. Un anuncio no se ve como burbuja sino como tarjeta con la etiqueta "Anuncio" y el nombre del docente, y llega a todos los inscritos. Quien se da de baja del módulo deja de ver su chat desde ese momento; quien se inscribe después ve el chat desde su inscripción.

**Why this priority**: Es la comunicación del docente con todo su grupo, pero depende de que el chat individual ya funcione.

**Independent Test**: Con un módulo con tres inscritos, publicar un anuncio y un mensaje al grupo; los tres lo ven; un estudiante se da de baja y deja de ver el chat; otro estudiante no inscrito nunca lo ve.

**Acceptance Scenarios**:

1. **Given** un módulo con inscritos, **When** el docente publica un anuncio, **Then** todos los inscritos lo ven como tarjeta "Anuncio" con su nombre y reciben el aviso.
2. **Given** el chat grupal de un módulo, **When** un inscrito escribe, **Then** lo ven el docente y los demás inscritos.
3. **Given** un estudiante que se da de baja del módulo, **When** abre sus chats, **Then** ya no ve el chat del módulo ni mensajes nuevos de este.
4. **Given** un estudiante inscrito después de que hubo mensajes, **When** abre el chat del módulo, **Then** solo ve lo publicado desde su inscripción.
5. **Given** un estudiante o un docente ajeno al módulo, **When** intenta abrir su chat, **Then** el backend lo trata como inexistente.
6. **Given** un estudiante inscrito, **When** intenta publicar un anuncio, **Then** el backend lo rechaza: solo el docente del módulo anuncia.
7. **Given** un módulo cuyo periodo se cerró, **When** alguien abre su chat, **Then** lo ve de solo lectura.

---

### User Story 6 - Borrar mensajes viejos según la retención (Priority: P3)

El sistema borra, con una tarea programada, los mensajes y anuncios de módulo con más de 6 meses y los mensajes de chats individuales con más de 2 años. Las conversaciones individuales que quedan sin mensajes desaparecen de la lista.

**Why this priority**: Cumple la regla de retención sin afectar al uso diario; puede entrar después.

**Independent Test**: Con mensajes de distintas edades, correr la tarea y comprobar que se borran solo los que superan su plazo y que la lista de conversaciones refleja el cambio.

**Acceptance Scenarios**:

1. **Given** un mensaje de módulo de hace más de 6 meses, **When** corre la tarea, **Then** deja de aparecer.
2. **Given** un mensaje individual de hace más de 6 meses pero menos de 2 años, **When** corre la tarea, **Then** se conserva.
3. **Given** un mensaje individual de hace más de 2 años, **When** corre la tarea, **Then** deja de aparecer.
4. **Given** una conversación individual sin mensajes después de la tarea, **When** el usuario abre su lista, **Then** no aparece; el chat de un módulo sigue apareciendo aunque no tenga mensajes.

---

### Edge Cases

- Se desactiva o elimina la cuenta de una de las dos personas (spec 016): no puede escribir ni recibir, la otra persona no puede escribirle y el chat se conserva para quien sigue activo; se muestra la regla.
- Un estudiante pierde la inscripción en el único módulo que compartía con un docente: la conversación individual queda de solo lectura para los dos y la app muestra la regla; si vuelven a compartir un módulo, se puede escribir de nuevo.
- Un mensaje muy largo: tiene un máximo y la app muestra el contador.
- La app se cierra con un mensaje todavía "enviando": ese mensaje no sale ni se guarda; solo los mensajes que el servidor confirmó forman parte de la conversación.
- Un reintento tras un fallo o una reconexión nunca duplica el mensaje.
- El mismo usuario con la app abierta en dos dispositivos: ambos ven los mensajes y el contador coincide.
- Muchos mensajes seguidos de una persona: el destinatario recibe un solo push por ráfaga, no uno por mensaje.
- El servidor reinicia mientras alguien escribe: lo escrito no se pierde; sale al reconectar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir conversar solo a estas parejas: CAE con docente y docente con CAE; docente con estudiante inscrito en uno de sus módulos y estudiante con ese docente. Cualquier otra combinación (estudiante con estudiante, estudiante con CAE) MUST rechazarse en el servidor. La pertenencia se revisa en cada envío: si un estudiante y un docente dejan de compartir un módulo, su conversación MUST quedar de solo lectura para los dos (con la regla visible) hasta que vuelvan a compartir uno; el historial se conserva hasta la retención.
- **FR-002**: Dos personas MUST tener una sola conversación individual entre ellas, sin importar cuántos módulos compartan.
- **FR-003**: El estudiante MUST poder iniciar la conversación con el docente de un módulo en el que está inscrito.
- **FR-004**: Cada módulo MUST tener un chat grupal visible solo para su docente y para los estudiantes inscritos, cada estudiante desde la fecha de su inscripción y hasta su baja.
- **FR-005**: El docente MUST poder publicar anuncios a los inscritos de su módulo; solo el docente del módulo anuncia. Un anuncio MUST distinguirse de un mensaje en la pantalla y llevar la etiqueta "Anuncio" y el nombre del docente.
- **FR-006**: Cada usuario MUST ver únicamente sus conversaciones, con la otra persona o el módulo, el último mensaje, la hora y el número de mensajes sin leer, ordenadas por el último mensaje; una conversación ajena se trata como inexistente.
- **FR-007**: La pestaña "Mensajes" MUST tener las secciones "Avisos" (la bandeja de la spec 014) y "Chats".
- **FR-008**: Al abrir una conversación el usuario MUST leer su historial por tramos, de lo más nuevo a lo más viejo, y sus mensajes MUST quedar marcados como leídos.
- **FR-009**: Un mensaje MUST guardarse en el servidor antes de entregarse a nadie, y MUST llegar al instante (en menos de 2 segundos) a quien tiene esa conversación abierta.
- **FR-010**: El que envía MUST ver el estado de su mensaje (enviando, enviado, falló); un mensaje fallido MUST poder reintentarse con un toque y un reintento MUST NOT duplicarlo.
- **FR-011**: Sin conexión, la app MUST avisar "Reconectando…", conservar lo escrito como "enviando" y enviarlo al volver la conexión, una sola vez, mientras la app siga abierta. Un mensaje que no llegó a enviarse antes de cerrar la app no se guarda en el dispositivo ni se envía después.
- **FR-012**: Si el destinatario no tiene la conversación abierta, el mensaje MUST quedar sin leer en su lista. En un chat individual MUST además enviarse un push con el nombre de quien escribe y el texto, en el idioma del destinatario; en el chat de un módulo el push MUST enviarse solo para los anuncios (el texto del push se recorta a 140 caracteres), y los mensajes del grupo solo suman al contador y a la lista. Tocar el push MUST abrir esa conversación.
- **FR-013**: Una ráfaga de mensajes de la misma persona a la misma conversación individual MUST producir un solo push, no uno por mensaje; la ráfaga es el plazo (60 segundos por defecto, en configuración) que sigue al primer push.
- **FR-014**: El mensaje MUST ser texto no vacío, sin espacios sobrantes, con un largo máximo definido en configuración.
- **FR-015**: Una cuenta desactivada o eliminada MUST NOT enviar ni recibir mensajes ni push, y el chat existente MUST conservarse.
- **FR-016**: Quien se da de baja de un módulo MUST dejar de ver el chat grupal y sus anuncios desde ese momento; los chats grupales de un periodo cerrado MUST ser de solo lectura.
- **FR-017**: Una tarea programada MUST eliminar (de forma lógica) los mensajes y anuncios de módulo con más de 6 meses y los mensajes de chats individuales con más de 2 años; los plazos MUST vivir en configuración.
- **FR-018**: El backend MUST validar con guards de roles y de pertenencia cada lectura y cada envío; ocultar pantallas no cuenta como seguridad. Toda acción bloqueada MUST mostrar al usuario la regla que la bloquea.
- **FR-019**: Los borrados MUST ser lógicos y las fechas MUST guardarse en UTC y mostrarse en `America/Bogota`.
- **FR-020**: Todos los textos MUST estar en español e inglés y el idioma MUST seguir el del dispositivo.
- **FR-021**: El número total de mensajes sin leer MUST poder consultarse (para el contador de la pestaña y los dashboards).

### Key Entities

- **Conversación**: canal entre dos personas (individual) o de un módulo (grupal). Tiene sus participantes y el momento de su último mensaje.
- **Participación**: la pertenencia de una persona a una conversación, con el momento hasta el que ya leyó (de ahí salen los sin leer) y, en los chats de módulo, desde y hasta cuándo ve mensajes.
- **Mensaje**: texto enviado por una persona a una conversación, con fecha y estado de envío; puede ser un mensaje normal o un anuncio.
- **Aviso de chat**: el push que recibe quien no tiene abierta la conversación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un mensaje llega a quien tiene la conversación abierta en menos de 2 segundos en el 95 % de los envíos de las pruebas.
- **SC-002**: Un estudiante inscrito inicia una conversación con su docente y envía el primer mensaje en menos de 1 minuto desde que abre "Mensajes".
- **SC-003**: Ninguna prueba de permisos logra que un usuario lea, escriba o anuncie en una conversación que no es suya, ni que converse con una pareja no permitida.
- **SC-004**: Ningún mensaje que el servidor confirmó como enviado se pierde, y ninguno se duplica, en las pruebas de reintento, de pérdida de conexión con la app abierta y de reinicio del servidor.
- **SC-005**: El contador de sin leer coincide con los mensajes realmente no leídos en el 100 % de las pruebas, también con la app abierta en dos dispositivos.
- **SC-006**: Después de la tarea de retención no queda ningún mensaje por encima de su plazo y no se borra ninguno dentro de él.
- **SC-007**: El 100 % de los push de chat respeta el idioma del dispositivo y ninguno incluye datos de contacto (correo o teléfono).

## Assumptions

- El chat grupal del módulo es de ida y vuelta (docente e inscritos escriben) y los anuncios son un tipo de mensaje que solo publica el docente.
- No hay chat entre estudiantes ni entre un estudiante y el CAE: `Context.md` no los permite.
- Solo texto: sin imágenes, archivos, ni mensajes de voz.
- Un mensaje enviado no se edita ni se borra desde la app.
- Sin indicador de "escribiendo" ni de "leído por el otro" en esta spec; `Design.md` ya prevé "escribiendo" y queda para otra.
- Un mensaje de chat avisa por push y por la lista (contador), no por correo.
- Los anuncios llegan a la lista del chat del módulo y por push (los mensajes normales del grupo no mandan push); la sección "Avisos" sigue siendo la bandeja de cambios de la spec 014.
- El largo máximo de un mensaje y los plazos de retención se leen de la configuración, con 2000 caracteres, 6 meses y 2 años como valores por defecto.
- El CAE no participa en los chats de módulo.
- Se reutilizan dispositivos, cola y plantillas de push de las specs 014 y 015; los dashboards (pantalla) quedan fuera de alcance.
