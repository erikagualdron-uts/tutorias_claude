# Feature Specification: Notificaciones de cambios en los módulos

**Feature Branch**: `014-notifications`

**Created**: 2026-11-18

**Status**: Implemented

**Input**: User description: "Notificaciones (spec 014). Alcance: consumidor del outbox (outbox_events de las specs 010 y 012), cola BullMQ, plantillas es/en, bandeja de notificaciones en la app, push (Expo) y correo (Nodemailer). Todo cambio o cancelación notifica a los estudiantes inscritos (push, correo y en la app), según docs/Context.md y D-087."

## Clarifications

### Session 2026-11-18

- Q: ¿De dónde debe leer el sistema los datos del servidor de correo? → A: Primero la configuración guardada (clave cifrada); si no hay, las variables de entorno `SMTP_*`; si tampoco, el correo queda pendiente. Además, el CAE la gestiona desde la app (nueva historia 6).
- Q: Cuando el CAE cambia el docente o el salón de un módulo, ¿el docente también recibe aviso? → A: No; solo los estudiantes inscritos. Un aviso futuro a docentes usará una plantilla aparte, distinta de la de estudiantes.
- Q: ¿Por cuánto tiempo se conservan los avisos de la bandeja? → A: Todos se conservan (sin ocultar ni borrar) hasta que otra funcionalidad fije la retención.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enterarme de un cambio en mi módulo (Priority: P1)

Como estudiante inscrito en un módulo, cuando el docente reprograma o cancela una sesión, o el CAE cambia el docente o el salón del módulo, o se registra un festivo que cancela una sesión, recibo un aviso claro de lo que cambió, en mi idioma, sin tener que abrir el módulo para descubrirlo.

**Why this priority**: es la regla de negocio "todo cambio o cancelación notifica a los estudiantes inscritos" y la condición de D-087: la inscripción no se publica en producción sin avisos. Hasta hoy los cambios ya quedan registrados, pero nadie los comunica.

**Independent Test**: inscribir a un estudiante en un módulo, hacer que el docente reprograme una sesión y comprobar que, en pocos segundos, el estudiante tiene un aviso en la app con el módulo, la fecha anterior y la nueva. Un estudiante no inscrito no recibe nada.

**Acceptance Scenarios**:

1. **Given** un estudiante con inscripción activa, **When** el docente reprograma una sesión, **Then** el estudiante recibe un aviso que dice qué módulo, desde qué día y hora y hacia cuál cambió.
2. **Given** un estudiante inscrito, **When** el docente cancela una sesión (solo esa o ella y las futuras), **Then** recibe un aviso con el módulo, las fechas afectadas y el alcance.
3. **Given** un estudiante inscrito, **When** el docente reactiva una sesión que había cancelado, **Then** recibe un aviso de que la sesión vuelve a darse.
4. **Given** un estudiante inscrito, **When** el CAE cambia el docente o el salón del módulo, **Then** recibe un aviso con el nuevo docente o el nuevo salón.
5. **Given** un estudiante inscrito, **When** se registra un festivo que cancela una sesión de su módulo, o se elimina y la sesión se restaura, **Then** recibe un aviso con el motivo "festivo".
6. **Given** un estudiante que no está inscrito en el módulo (o que ya canceló su inscripción), **When** ocurre un cambio en ese módulo, **Then** no recibe ningún aviso.
7. **Given** un estudiante con el idioma del dispositivo en inglés, **When** recibe un aviso, **Then** el texto, las fechas y las horas están en inglés y en hora de Bogotá.

---

### User Story 2 - Ver mis avisos en la app (Priority: P1)

Como estudiante, abro la bandeja de notificaciones y veo mis avisos del más reciente al más antiguo, con los no leídos resaltados y un contador en la barra. Puedo marcar uno o todos como leídos y, al tocar un aviso, llegar al módulo al que se refiere.

**Why this priority**: es el canal que siempre funciona (no depende del permiso de push ni del correo) y es donde se consulta el historial.

**Independent Test**: con dos avisos guardados, abrir la bandeja, ver el contador en 2, tocar uno y comprobar que se abre su módulo y el contador baja a 1; usar "Marcar todo como leído" y comprobar que el contador desaparece.

**Acceptance Scenarios**:

1. **Given** avisos sin leer, **When** abro la app, **Then** veo el contador de no leídos y, en la bandeja, los avisos nuevos resaltados y ordenados del más reciente al más antiguo.
2. **Given** un aviso sin leer, **When** lo toco, **Then** se marca como leído y se abre el módulo al que se refiere.
3. **Given** varios avisos sin leer, **When** elijo "Marcar todo como leído", **Then** todos quedan leídos y el contador desaparece.
4. **Given** que no tengo avisos, **When** abro la bandeja, **Then** veo un estado vacío que lo explica.
5. **Given** que la bandeja no carga, **When** falla la consulta, **Then** veo el error con la opción "Reintentar".
6. **Given** muchos avisos, **When** llego al final de la lista, **Then** se cargan los anteriores sin que la lista se rompa.
7. **Given** que soy otro usuario, **When** consulto la bandeja, **Then** solo veo los avisos que son míos.

---

### User Story 3 - Recibir el aviso como push en mi teléfono (Priority: P1)

Como estudiante, si acepto las notificaciones en mi teléfono, el aviso me llega como notificación push aunque la app esté cerrada, y al tocarla la app se abre en el módulo correspondiente.

**Why this priority**: es lo que hace que un cambio de última hora (a menos de 2 horas) llegue a tiempo.

**Independent Test**: iniciar sesión en un dispositivo con permiso de notificaciones, provocar un cambio en un módulo inscrito y comprobar que llega el push; cerrar sesión y comprobar que ese dispositivo deja de recibirlos.

**Acceptance Scenarios**:

1. **Given** un estudiante que inició sesión y aceptó las notificaciones, **When** ocurre un cambio en su módulo, **Then** recibe un push con el mismo contenido que el aviso en la app.
2. **Given** un push recibido, **When** lo toca, **Then** la app abre el módulo al que se refiere.
3. **Given** un estudiante que rechazó el permiso, **When** ocurre un cambio, **Then** el aviso llega igual por la app y el correo, y no hay errores visibles.
4. **Given** un estudiante con dos dispositivos, **When** ocurre un cambio, **Then** ambos reciben el push.
5. **Given** un estudiante que cierra sesión, **When** ocurre un cambio, **Then** ese dispositivo ya no recibe pushes de su cuenta.
6. **Given** un dispositivo que el servicio de push informa como inválido, **When** se intenta enviar, **Then** ese dispositivo se descarta y no se reintenta.

---

### User Story 4 - Recibir el aviso por correo (Priority: P2)

Como estudiante, recibo el aviso también en mi correo institucional, en mi idioma, para tenerlo aunque no abra la app.

**Why this priority**: respalda los otros canales y deja constancia; la regla del negocio lo exige, pero el aviso en la app y el push ya cubren la urgencia.

**Independent Test**: provocar un cambio en un módulo inscrito y comprobar que llega un correo con el asunto y el contenido en el idioma del estudiante.

**Acceptance Scenarios**:

1. **Given** un estudiante inscrito, **When** ocurre un cambio, **Then** recibe un correo con asunto y cuerpo en su idioma, con el módulo, lo que cambió y las fechas en hora de Bogotá.
2. **Given** que el servidor de correo falla de forma temporal, **When** se intenta el envío, **Then** se reintenta varias veces y el aviso en la app y el push no se retrasan ni se pierden.
3. **Given** que el correo falla de forma definitiva, **When** se agotan los reintentos, **Then** el fallo queda registrado sin datos personales y no afecta a los demás destinatarios.
4. **Given** que el correo aún no está configurado, **When** ocurre un cambio, **Then** el aviso llega por la app y el push, y el envío por correo queda pendiente sin perderse.

---

### User Story 5 - Ningún aviso se pierde ni se repite (Priority: P2)

Como CAE, necesito tener la certeza de que cada cambio avisa una sola vez a cada inscrito, incluso si el servicio se reinicia o falla a mitad del envío.

**Why this priority**: sin esta garantía, la condición de D-087 no se cumple (un inscrito sin aviso) o se molesta con duplicados.

**Independent Test**: provocar varios cambios, detener y reiniciar el servicio durante el procesamiento y comprobar que cada inscrito recibe exactamente un aviso por cambio.

**Acceptance Scenarios**:

1. **Given** cambios registrados mientras el servicio estaba apagado, **When** el servicio arranca, **Then** se procesan todos, en el orden en que ocurrieron.
2. **Given** un cambio que ya se procesó, **When** el servicio se reinicia, **Then** no se vuelve a avisar.
3. **Given** un cambio con 40 inscritos en el que falla el envío a uno, **When** se procesa, **Then** los otros 39 reciben su aviso y el fallo de uno se reintenta por separado.
4. **Given** un cambio que no tiene inscritos, **When** se procesa, **Then** se marca como procesado sin crear avisos.

---

### User Story 6 - Configurar el servidor de correo como CAE (Priority: P2)

Como CAE, configuro desde la app el servidor de correo de la institución (servidor, puerto, usuario, clave y remitente), envío un correo de prueba y veo si está configurado, sin pedir ayuda técnica ni tocar el servidor.

**Why this priority**: sin esta pantalla, el correo depende de variables de entorno que solo cambia quien despliega; con ella, el CAE corrige la configuración por su cuenta. No bloquea la bandeja ni el push.

**Independent Test**: como CAE, abrir la configuración del correo, guardar datos válidos, enviar la prueba y comprobar que llega; volver a abrir y ver que la clave no se muestra. Como docente o estudiante, comprobar que no hay acceso.

**Acceptance Scenarios**:

1. **Given** que no hay configuración guardada, **When** el CAE abre la pantalla, **Then** ve el estado "Sin configurar" y, si el servidor tiene variables de entorno, un aviso de que se están usando esas.
2. **Given** datos válidos, **When** el CAE guarda, **Then** quedan guardados con la clave cifrada y el estado pasa a "Configurado".
3. **Given** una configuración guardada, **When** el CAE vuelve a abrir la pantalla, **Then** ve servidor, puerto, usuario y remitente, y la clave aparece oculta y nunca se devuelve completa.
4. **Given** una configuración guardada, **When** el CAE edita un campo y deja la clave vacía, **Then** se conserva la clave anterior.
5. **Given** una configuración guardada, **When** el CAE elige "Enviar correo de prueba", **Then** se envía a su propio correo y la pantalla dice si funcionó o por qué falló (sin mostrar la clave).
6. **Given** datos con formato inválido (puerto fuera de rango, remitente que no es un correo, campo vacío), **When** el CAE intenta guardar, **Then** se bloquea y ve qué corregir.
7. **Given** un docente o un estudiante, **When** intenta consultar o cambiar la configuración, **Then** el servidor lo rechaza.

---

### Edge Cases

- El CAE cambia la configuración mientras hay correos pendientes: los pendientes usan la configuración vigente al momento de enviarse.
- La clave guardada no se puede descifrar (cambió la clave de cifrado del servidor): el estado es "Requiere configurar de nuevo" y el correo queda pendiente, sin errores para el usuario final.

- Un estudiante se inscribe después del cambio: no recibe avisos de cambios anteriores a su inscripción.
- Un estudiante cancela su inscripción pero sigue vigente hasta la fecha efectiva (D-070): se le avisa de los cambios que ocurren mientras siga vigente.
- Un estudiante marcó ausencia en una sesión que luego se cancela o se reprograma: no recibe aviso de esa sesión, sí de los demás cambios del módulo.
- Un cambio afecta muchas sesiones (cancelar "ella y las futuras"): se envía **un solo aviso por cambio** que resume las fechas, no uno por sesión.
- Un docente cambia dos veces la misma sesión en pocos minutos: cada cambio genera su propio aviso, en orden.
- El estudiante tiene varios dispositivos o ninguno con push: se envía a todos los registrados; sin ninguno, no es un error.
- El usuario tiene el correo de un dominio no válido o vacío: se omite el correo y se registra, sin frenar los demás canales.
- Un evento que se refiere a un módulo eliminado (borrado lógico) o a una sesión que ya no existe: se marca como procesado sin avisar y se registra el motivo.
- El texto del aviso se guarda en el idioma del estudiante al momento del envío; si luego cambia de idioma, los avisos anteriores no se retraducen.
- Un aviso puede referirse a un módulo que ya no está en la lista del estudiante: al tocarlo se muestra un mensaje claro en lugar de una pantalla vacía.

## Requirements *(mandatory)*

### Functional Requirements

**Consumo de los cambios**

- **FR-001**: El sistema MUST procesar todos los eventos pendientes del registro de cambios de los módulos (cambio de docente, de salón, festivo que cancela, festivo eliminado que restaura, sesión reprogramada, sesión cancelada por el docente y sesión reactivada) y marcar cada uno como procesado solo cuando sus avisos quedaron creados.
- **FR-002**: El sistema MUST procesar los eventos en el orden en que se registraron y reanudar los pendientes cuando arranca, sin duplicar avisos de eventos ya procesados.
- **FR-003**: El sistema MUST resolver los destinatarios de cada evento desde las inscripciones vigentes del módulo en el momento de procesar, excluyendo a quien no está inscrito, a quien ya no tiene la inscripción vigente y, para eventos de una sesión concreta, a quien marcó ausencia en ella.
- **FR-004**: Los eventos MUST seguir sin contener datos personales de estudiantes (D-087); los datos del destinatario se leen al procesar, nunca se copian al evento.

**Avisos y plantillas**

- **FR-005**: El sistema MUST crear, por cada destinatario y cada evento, un aviso propio con tipo, título, texto, referencia al módulo y fecha de creación, en el idioma del destinatario (español o inglés).
- **FR-006**: Cada tipo de evento MUST tener su plantilla de título y texto en español e inglés, con interpolación del módulo, las fechas y horas (hora de Bogotá), el nuevo docente o salón y el alcance. Ningún texto de aviso, correo o push puede estar escrito fuera de las plantillas.
- **FR-007**: Un cambio que afecta varias sesiones MUST generar un solo aviso por destinatario que resume las fechas afectadas.
- **FR-008**: El texto de un aviso MUST decir qué cambió y qué puede hacer el estudiante (por ejemplo, revisar el módulo), en lenguaje simple.

**Bandeja en la app**

- **FR-009**: El usuario MUST poder ver sus avisos, del más reciente al más antiguo, paginados, y solo los suyos.
- **FR-010**: La app MUST mostrar un contador de avisos no leídos que se actualiza al leer y al llegar avisos nuevos.
- **FR-011**: El usuario MUST poder marcar un aviso como leído, y todos como leídos, y la marca MUST guardar la fecha de lectura.
- **FR-012**: Al tocar un aviso (o su push), la app MUST abrir el módulo al que se refiere; si ya no existe o no está disponible, MUST mostrar un mensaje claro.
- **FR-013**: La bandeja MUST manejar los estados cargando, vacío, error con "Reintentar" y con datos, y mostrar el banner de sin conexión.

**Push**

- **FR-014**: La app MUST pedir el permiso de notificaciones de forma explicada y, si se concede, registrar el dispositivo del usuario; el registro MUST ser idempotente (un dispositivo no se duplica) y quedar ligado a un solo usuario.
- **FR-015**: El sistema MUST enviar el push a todos los dispositivos registrados del destinatario, con el mismo título y texto del aviso, y con la referencia necesaria para abrir el módulo.
- **FR-016**: El sistema MUST dejar de enviar a un dispositivo cuando el usuario cierra sesión en él o cuando el servicio de push lo reporta como inválido.
- **FR-017**: Rechazar el permiso de push no MUST impedir recibir el aviso por la app y el correo.

**Correo**

- **FR-018**: El sistema MUST enviar el aviso por correo al correo institucional del destinatario, con asunto y cuerpo en su idioma, usando el servidor de correo de la institución.
- **FR-019**: La clave del servidor de correo MUST guardarse cifrada y nunca aparecer en el repositorio, en los registros ni en ninguna respuesta del servidor.
- **FR-020**: El sistema MUST tomar la configuración del correo, en este orden, de la guardada por el CAE, de las variables de entorno `SMTP_*` o, si no hay ninguna, dejar el envío por correo pendiente hasta que haya configuración, sin dejar de crear el aviso en la app ni de enviar el push.

**Configuración del correo (CAE)**

- **FR-026**: El CAE MUST poder consultar el estado de la configuración (sin configurar, configurado, requiere configurar de nuevo), ver servidor, puerto, usuario y remitente, y saber si el servidor está usando las variables de entorno.
- **FR-027**: El CAE MUST poder guardar servidor, puerto (entero de 1 a 65535), usuario, clave y remitente (correo válido); todos son obligatorios al crear. Al editar, una clave vacía conserva la anterior.
- **FR-028**: El CAE MUST poder enviar un correo de prueba a su propio correo y ver el resultado, con la causa del fallo en lenguaje simple y sin datos sensibles.
- **FR-029**: Solo el CAE MUST poder consultar y cambiar la configuración; el servidor aplica el control de rol en cada operación.
- **FR-030**: El cambio de configuración MUST aplicarse a los envíos siguientes sin reiniciar el servicio.

**Entrega fiable**

- **FR-021**: El envío de push y de correo MUST ir en una cola, fuera de la petición que provocó el cambio, con reintentos con espera creciente, y el fallo de un canal o de un destinatario MUST NOT impedir los demás.
- **FR-022**: Cada fallo definitivo de entrega MUST quedar registrado (tipo de evento, canal, causa) sin incluir datos personales ni claves.
- **FR-023**: Cada canal MUST tener su estado de entrega por aviso (pendiente, enviado, fallido, omitido) para poder diagnosticar qué pasó.

**Permisos**

- **FR-024**: Solo el dueño de un aviso MUST poder leerlo o marcarlo; todos los endpoints exigen sesión y aplican el control de acceso en el servidor.
- **FR-025**: Los estudiantes, docentes y el CAE MUST tener acceso a su propia bandeja y a su registro de dispositivos; los avisos de esta funcionalidad se dirigen a estudiantes inscritos.

### Key Entities

- **Evento de cambio (existente)**: registro inmutable de que algo cambió en un módulo (tipo, módulo, datos mínimos, fecha, fecha de procesamiento). Esta funcionalidad lo consume.
- **Aviso**: mensaje dirigido a un usuario, con tipo, título, texto, módulo al que se refiere, fecha de creación y fecha de lectura (vacía si no se ha leído), y el idioma en que se redactó.
- **Dispositivo de notificaciones**: dispositivo de un usuario con permiso de push, con su identificador de envío y plataforma; un dispositivo pertenece a un solo usuario.
- **Entrega**: estado de un aviso en cada canal (push, correo) con intentos y causa del último fallo.
- **Plantilla**: texto de título y cuerpo por tipo de evento e idioma, para la app, el push y el correo.
- **Configuración del correo (existente)**: servidor, puerto, usuario, clave cifrada y remitente; una sola, que gestiona el CAE.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 95 % de los cambios aparecen como aviso en la app del estudiante en menos de 30 segundos desde que el docente o el CAE confirman el cambio.
- **SC-002**: El 100 % de los estudiantes con inscripción vigente reciben un aviso por cada cambio, y 0 estudiantes no inscritos lo reciben.
- **SC-003**: Ningún estudiante recibe más de un aviso por cambio, aunque el servicio se reinicie durante el procesamiento.
- **SC-004**: Con el servicio de push y el correo caídos durante 10 minutos, el 100 % de los avisos siguen apareciendo en la app y el 100 % de los envíos pendientes se completan al recuperarse el servicio.
- **SC-005**: El 90 % de los estudiantes entiende qué cambió y a qué módulo se refiere solo leyendo el aviso (sin abrir el módulo), probado con 5 personas.
- **SC-006**: Un cambio que afecta a 100 inscritos se procesa por completo en menos de 2 minutos.
- **SC-007**: Un estudiante llega al módulo afectado desde el aviso o el push en un solo toque.
- **SC-008**: Un CAE sin apoyo técnico configura el correo y comprueba que funciona con la prueba en menos de 3 minutos.
- **SC-009**: La clave del correo no aparece en ninguna respuesta, pantalla ni registro del sistema.

## Assumptions

- Los destinatarios de esta spec son **solo estudiantes inscritos**. El docente (el que hace el cambio, el anterior o el nuevo cuando el CAE lo cambia) y el CAE no reciben avisos en esta spec; si se agregan, usarán plantillas propias para docentes, separadas de las de estudiantes. Los avisos de anuncios, mensajes y PQRS pertenecen a otras funcionalidades, que reutilizarán la misma bandeja, el mismo registro de dispositivos y la misma cola.
- El **idioma** de cada aviso sale de la preferencia de idioma guardada en el usuario; las fechas y horas se muestran en hora de Bogotá.
- La **configuración del servidor de correo** vive en la tabla `SmtpConfig` (una sola fila, clave cifrada) y esta spec agrega la pantalla del CAE para gestionarla (historia 6). Sin fila se usan las variables de entorno `SMTP_*` y, si tampoco están, el correo queda pendiente (FR-020).
- La prueba de correo y la configuración del CAE aparecen en el área de configuración del CAE ya existente, siguiendo sus patrones de pantalla.
- Los **eventos nuevos** que otras funcionalidades agreguen al registro de cambios (por ejemplo, inscripción o anuncios) se incorporarán agregando su plantilla; esta spec cubre los siete tipos de evento existentes.
- No se define aquí una **retención** de avisos: todos se conservan y siguen visibles en la bandeja hasta que una funcionalidad posterior la fije. Los borrados siguen siendo lógicos.
- El push usa el servicio de push de Expo; en el desarrollo con Expo Go el envío real puede requerir una compilación de desarrollo, y esa verificación se anota en el recorrido manual.
- No se incluyen **preferencias por canal** (silenciar correo o push) ni notificaciones programadas (recordatorios antes de una sesión).
- Las colas ya usan el Redis de la infraestructura local; no se agrega infraestructura nueva.
- La inscripción de la spec 011 **no se publica** en producción hasta que esta funcionalidad esté en producción (D-087); con esta spec esa condición queda cumplida.
