# Feature Specification: PQRS: radicación y gestión

**Feature Branch**: `017-pqrs`

**Created**: 2026-11-22

**Status**: Done

**Input**: User description: "PQRS: radicación y gestión. Los docentes y estudiantes radican una PQRS con tipo, asunto y descripción. El tipo sale de la lista administrable PQRS_TYPE del CAE, en español e inglés. Cada usuario ve solo sus PQRS y el estado de cada una (radicada, en revisión, resuelta). El CAE ve todas, con filtros por estado, tipo y rol del autor. Puede pasarlas a "en revisión", responder dentro de la PQRS y marcarla "resuelta". Cada cambio de estado y cada respuesta del CAE notifican al autor por la bandeja, el push y el correo, en el idioma del dispositivo. Los permisos se validan con guards de roles en el backend: solo STUDENT y TEACHER radican, y solo SUPERADMIN gestiona. Un tipo de la lista que ya tiene PQRS asociadas solo se desactiva, no se borra (D-073). Los borrados son lógicos."

## Estado de partida (revisión del 2026-11-22)

| Qué ya existe | Dónde |
|---|---|
| Lista administrable `PQRS_TYPE` con etiquetas en español e inglés; el CAE crea, edita, ordena y desactiva sus elementos | spec 006, D-073 |
| Pestaña "PQRS" en la navegación de los tres roles (sin contenido) | D-042 |
| Bandeja de la app, push y correo con plantillas por idioma | spec 014 y 015 |
| La regla "un elemento en uso solo se desactiva" ya está cableada, pero hoy ninguna PQRS la usa | `config-usage` |

| Qué falta | |
|---|---|
| Radicar y consultar PQRS, y que el CAE las gestione | |
| Avisar al autor cuando cambia el estado o el CAE responde | |

## Clarifications

### Session 2026-11-22

- Q: ¿Cuándo puede el CAE responder una PQRS y marcarla "Resuelta"? → A: Solo desde "En revisión"; desde "Radicada" únicamente puede pasarla a "En revisión".
- Q: ¿Debe el CAE haber escrito al menos una respuesta antes de marcar una PQRS "Resuelta"? → A: Sí, se exige al menos una respuesta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Radicar una PQRS (Priority: P1)

Un docente o un estudiante abre "PQRS", elige un tipo de la lista, escribe un asunto y una descripción y la radica. La PQRS queda en estado "Radicada" y el autor la ve en su lista.

**Why this priority**: Es el canal formal que la institución pide; sin radicar no existe nada que gestionar.

**Independent Test**: Con un estudiante y un docente, radicar una PQRS cada uno y comprobar que aparece en su lista con estado "Radicada" y que el otro usuario no la ve.

**Acceptance Scenarios**:

1. **Given** un estudiante con sesión iniciada, **When** elige un tipo, escribe asunto y descripción y confirma, **Then** la PQRS queda "Radicada" con la fecha y aparece en su lista.
2. **Given** el formulario con el asunto o la descripción vacíos, **When** intenta radicar, **Then** la app indica qué campo falta y no la crea.
3. **Given** la lista `PQRS_TYPE` con elementos activos y desactivados, **When** abre el selector, **Then** solo ve los activos, en orden y en el idioma del dispositivo.
4. **Given** un usuario con rol CAE, **When** intenta radicar, **Then** el backend rechaza la acción: el CAE solo gestiona.

---

### User Story 2 - Consultar mis PQRS y su estado (Priority: P1)

El autor ve la lista de sus PQRS con tipo, asunto, estado y fecha, y abre cada una para leer su descripción y las respuestas del CAE.

**Why this priority**: Es la razón de radicar: saber en qué va el trámite. También alimenta el "estado de las PQRS" de los dashboards.

**Independent Test**: Radicar dos PQRS, hacer que el CAE cambie el estado de una, y comprobar que el autor ve ambos estados y que otro usuario no puede abrirlas.

**Acceptance Scenarios**:

1. **Given** un autor con PQRS en distintos estados, **When** abre "PQRS", **Then** las ve ordenadas de la más reciente a la más antigua, cada una con su estado.
2. **Given** un autor sin PQRS, **When** abre "PQRS", **Then** ve un estado vacío que le invita a radicar la primera.
3. **Given** el identificador de una PQRS ajena, **When** un docente o estudiante intenta abrirla, **Then** el backend la trata como inexistente.
4. **Given** una PQRS con respuestas del CAE, **When** el autor la abre, **Then** ve la descripción y las respuestas en orden cronológico.

---

### User Story 3 - Gestionar las PQRS como CAE (Priority: P1)

El CAE ve todas las PQRS, filtra por estado, tipo y rol del autor (docente o estudiante), abre una, la pasa a "En revisión", responde dentro de ella y la marca "Resuelta".

**Why this priority**: Sin gestión el canal es un buzón sin respuesta.

**Independent Test**: Con PQRS de un docente y de un estudiante, filtrar por cada criterio, pasar una a "En revisión", responder y marcarla "Resuelta", y comprobar que el estado y las respuestas se guardan.

**Acceptance Scenarios**:

1. **Given** PQRS de docentes y estudiantes, **When** el CAE filtra por rol del autor "Estudiante", **Then** solo ve las de estudiantes.
2. **Given** filtros de estado y de tipo combinados, **When** el CAE los aplica, **Then** la lista cumple ambos.
3. **Given** una PQRS "Radicada", **When** el CAE la pasa a "En revisión", **Then** el estado cambia y queda registrado.
4. **Given** una PQRS "En revisión", **When** el CAE escribe una respuesta, **Then** la respuesta queda en la PQRS con autor y fecha.
5. **Given** una PQRS "En revisión" con al menos una respuesta, **When** el CAE la marca "Resuelta", **Then** el estado cambia y ya no admite cambios de estado ni respuestas.
6. **Given** una PQRS "En revisión" sin respuestas, **When** el CAE intenta marcarla "Resuelta", **Then** el backend lo rechaza y la app indica que primero debe responderla.
7. **Given** una PQRS "Radicada", **When** el CAE intenta responderla o marcarla "Resuelta", **Then** el backend lo rechaza y la app indica que primero debe pasarla a "En revisión".
8. **Given** un docente o estudiante, **When** intenta cambiar el estado o responder como CAE, **Then** el backend lo rechaza.

---

### User Story 4 - Recibir aviso de cada cambio (Priority: P2)

Cuando el CAE cambia el estado de una PQRS o la responde, el autor recibe un aviso en la bandeja de la app, un push y un correo, en el idioma del dispositivo.

**Why this priority**: Evita que el autor tenga que entrar a ver si hubo novedades. Reutiliza la bandeja y las plantillas ya existentes, por eso no bloquea el flujo principal.

**Independent Test**: Cambiar el estado y responder una PQRS, y comprobar que el autor recibe tres avisos (bandeja, push y correo) por cada acción, en su idioma.

**Acceptance Scenarios**:

1. **Given** una PQRS radicada por un estudiante con el dispositivo en inglés, **When** el CAE la pasa a "En revisión", **Then** el estudiante recibe el aviso en inglés por bandeja, push y correo.
2. **Given** que el estudiante rechazó el permiso de push o el correo no está configurado, **When** hay un cambio, **Then** el aviso igual llega a la bandeja.
3. **Given** un aviso de PQRS en la bandeja, **When** el autor lo abre, **Then** llega a esa PQRS.

---

### User Story 5 - Proteger los tipos en uso (Priority: P3)

Cuando un tipo de `PQRS_TYPE` ya tiene PQRS asociadas, el CAE solo puede desactivarlo, no eliminarlo. Las PQRS existentes conservan su tipo, también si se desactiva.

**Why this priority**: Mantiene la integridad del historial; la regla ya existe y solo falta conectarla.

**Independent Test**: Radicar una PQRS con un tipo, intentar eliminarlo desde la configuración del CAE y comprobar que la app lo impide y explica la regla; desactivarlo y comprobar que la PQRS sigue mostrando su tipo.

**Acceptance Scenarios**:

1. **Given** un tipo con al menos una PQRS, **When** el CAE intenta eliminarlo, **Then** se bloquea con el mensaje de la regla.
2. **Given** un tipo sin PQRS, **When** el CAE lo elimina, **Then** se elimina (lógico).
3. **Given** un tipo desactivado con PQRS asociadas, **When** el autor o el CAE abren esa PQRS, **Then** siguen viendo el tipo en su etiqueta.

---

### Edge Cases

- El tipo elegido se desactiva mientras el usuario llena el formulario: el backend rechaza la radicación con un mensaje claro y la app pide elegir otro.
- Doble toque en "Radicar": no se crean dos PQRS idénticas.
- Se desactiva o elimina la cuenta del autor (spec 016): sus PQRS se conservan para el CAE; los avisos no se envían a una cuenta sin acceso.
- El CAE intenta pasar una PQRS "Resuelta" a otro estado o responderla, o responder o resolver una "Radicada", o resolver una "En revisión" sin respuestas: se bloquea y la app muestra la regla.
- Falla el correo o el push: el cambio de estado no se revierte; la bandeja conserva el aviso.
- Textos muy largos: asunto y descripción tienen un máximo y la app muestra el contador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Los usuarios con rol docente o estudiante MUST poder radicar una PQRS con tipo, asunto y descripción, todos obligatorios.
- **FR-002**: El tipo MUST salir de la lista administrable `PQRS_TYPE`; el selector muestra solo los elementos activos, en orden y con la etiqueta del idioma del dispositivo.
- **FR-003**: Toda PQRS nueva MUST quedar en estado "Radicada" con autor y fecha en UTC, mostrada en `America/Bogota`.
- **FR-004**: Los estados MUST ser "Radicada", "En revisión" y "Resuelta", con las transiciones Radicada → En revisión → Resuelta, sin retroceso ni saltos.
- **FR-005**: Cada usuario MUST ver únicamente sus propias PQRS, con tipo, asunto, estado y fecha; el acceso a una ajena se trata como inexistente.
- **FR-006**: El CAE MUST ver todas las PQRS y filtrarlas por estado, tipo y rol del autor, de forma combinable.
- **FR-007**: El CAE MUST poder pasar una PQRS "Radicada" a "En revisión"; solo estando "En revisión" puede responderla y marcarla "Resuelta", y para resolverla MUST existir al menos una respuesta. Una "Resuelta" no admite respuestas.
- **FR-008**: Cada respuesta MUST guardarse con autor, texto y fecha, y mostrarse en orden cronológico al autor y al CAE.
- **FR-009**: Cada cambio de estado y cada respuesta del CAE MUST notificar al autor por la bandeja, el push y el correo, en el idioma del dispositivo, reutilizando la infraestructura de las specs 014 y 015.
- **FR-010**: La bandeja MUST conservar el aviso aunque el push o el correo fallen o no estén disponibles, y el fallo de un canal no revierte el cambio.
- **FR-011**: El backend MUST validar con guards de roles que solo docentes y estudiantes radican y que solo el CAE gestiona; ocultar pantallas no cuenta como seguridad.
- **FR-012**: Un tipo de `PQRS_TYPE` con PQRS asociadas MUST poder solo desactivarse, no eliminarse (D-073); las PQRS existentes conservan su tipo.
- **FR-013**: Los borrados MUST ser lógicos y la radicación no debe duplicarse ante reintentos.
- **FR-014**: Toda acción bloqueada MUST mostrar al usuario la regla que la bloquea, y todos los textos MUST estar en español e inglés.
- **FR-015**: Los tres dashboards MUST poder consultar el estado de las PQRS (conteo por estado para el CAE y estado de las propias para docente y estudiante); la pantalla del dashboard queda fuera de esta spec.

### Key Entities

- **PQRS**: solicitud radicada por un docente o un estudiante. Tiene autor, tipo (elemento de `PQRS_TYPE`), asunto, descripción, estado y fechas de radicación y de último cambio.
- **Respuesta de PQRS**: mensaje del CAE dentro de una PQRS, con autor, texto y fecha.
- **Elemento de `PQRS_TYPE`**: tipo disponible para radicar, con etiqueta en español e inglés, orden y estado activo/desactivado; ya existe.
- **Aviso**: notificación del cambio de estado o de una respuesta, entregada por bandeja, push y correo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un docente o estudiante radica una PQRS en menos de 2 minutos desde que abre "PQRS".
- **SC-002**: El 100 % de los cambios de estado y respuestas genera un aviso en la bandeja del autor, y el 100 % de esos avisos respeta el idioma del dispositivo.
- **SC-003**: Ningún usuario docente o estudiante logra ver, abrir o modificar una PQRS que no es suya, ni gestionar una propia, en las pruebas de permisos.
- **SC-004**: El CAE encuentra una PQRS concreta aplicando filtros en menos de 30 segundos con 200 PQRS cargadas.
- **SC-005**: Ningún tipo con PQRS asociadas puede eliminarse; en todos los intentos la app muestra la regla.
- **SC-006**: Ninguna prueba logra una transición fuera de Radicada → En revisión → Resuelta, ni responder una PQRS que no esté "En revisión".

## Assumptions

- Las respuestas son del CAE hacia el autor (hilo de un solo sentido); el autor no responde dentro de la PQRS. Si necesita aportar más, radica otra. Se confirma en la aclaración.
- No hay adjuntos en esta spec: solo texto.
- Una PQRS "Resuelta" no se reabre.
- No hay tiempo máximo de respuesta ni alertas al CAE; el tiempo promedio de respuesta del dashboard se calcula con las fechas guardadas.
- Asunto y descripción tienen un máximo de caracteres definido en configuración, no en el código.
- El CAE no radica PQRS: gestiona las de docentes y estudiantes.
- El CAE ve el nombre y el correo del autor para poder continuar la conversación por correo cuando lo necesite (`Context.md`, sección 7).
- Se reutilizan la bandeja, los dispositivos, la cola y las plantillas de las specs 014 y 015; se agregan plantillas nuevas para estos avisos.
- Los dashboards (pantalla) y el chat quedan fuera de alcance.
