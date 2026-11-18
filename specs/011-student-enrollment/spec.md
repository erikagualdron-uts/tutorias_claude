# Feature Specification: Inscripción de estudiantes a módulos

**Feature Branch**: `011-student-enrollment`

**Created**: 2026-11-17

**Status**: Implemented

**Input**: User description: "de la 011 con inscripción de estudiantes"

## Clarifications

### Session 2026-11-17

- Q: Si un estudiante canceló solo una sesión, ¿puede reactivarla después? → A: Sí, mientras falte más de 1 hora y haya cupo.
- Q: Si cancela el módulo completo y la próxima sesión empieza en menos de 1 hora, ¿qué pasa? → A: Se permite y aplica desde la siguiente sesión; la que empieza en menos de 1 hora se mantiene.
- Q: Cuando un estudiante cancela solo una sesión, ¿ese lugar queda libre para otro o el cupo se mide por inscripciones activas? → A: El cupo se mide por sesión (opción B): cada sesión tiene como cupo la capacidad del salón y su lugar queda libre al cancelarla; un estudiante nuevo solo puede inscribirse al módulo si hay lugar en todas sus sesiones futuras.
- Q: Para cambiar el salón, ¿la capacidad nueva debe cubrir los asistentes de la sesión futura más llena o todos los inscritos activos? → A: Se mantiene la regla vigente (Principio II de la constitución): la capacidad nueva debe ser mayor o igual a los inscritos activos del módulo. Se descartó cambiarla porque exigía enmendar la constitución.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir un módulo e inscribirse (Priority: P1)

El estudiante abre la pestaña de tutorías y ve, en tarjetas, los módulos del periodo activo: nombre, docente, salón, horario semanal y cupos disponibles. Abre uno, revisa su detalle y se inscribe. La inscripción es al módulo: queda inscrito en todas sus sesiones que aún no han ocurrido. Cuando el sistema no lo permite (módulo lleno, cruce de horario con otro módulo suyo, periodo cerrado), el estudiante ve la regla que lo bloquea.

**Why this priority**: Es el objetivo de la aplicación para el estudiante y lo que da sentido a los módulos creados por el CAE. Sin inscripción no hay inscritos que notificar, cancelar ni reprogramar.

**Independent Test**: Con un módulo de salón con capacidad 2 en el periodo activo y tres estudiantes, inscribir a los dos primeros y comprobar que el tercero ve el módulo como lleno y no puede inscribirse; inscribir a un estudiante en otro módulo que se cruza con el suyo y comprobar que se rechaza mostrando con qué módulo choca.

**Acceptance Scenarios**:

1. **Given** un estudiante y módulos en el periodo activo, **When** abre la pestaña de tutorías, **Then** ve tarjetas con nombre, docente, salón, horario semanal y cupos disponibles, y puede buscar por nombre.
2. **Given** un módulo con cupo, **When** el estudiante se inscribe, **Then** queda inscrito en todas las sesiones futuras del módulo, el módulo aparece como "inscrito" en su tarjeta y los cupos disponibles bajan en uno.
3. **Given** un módulo cuyo cupo (capacidad del salón) está completo, **When** el estudiante lo abre, **Then** la tarjeta lo marca como lleno (alguna sesión futura sin lugar), la inscripción está bloqueada y se le explica el motivo.
4. **Given** un estudiante inscrito en un módulo del martes de 2:00 a 4:00 p. m., **When** intenta inscribirse a otro que ese día se solapa con ese horario, **Then** el sistema lo rechaza y muestra el módulo y el horario con los que se cruza.
5. **Given** dos módulos que terminan y empiezan a la misma hora exacta, **When** el estudiante se inscribe a ambos, **Then** se permite, porque no hay solapamiento.
6. **Given** un estudiante inscrito, **When** intenta inscribirse de nuevo al mismo módulo, **Then** el sistema lo impide sin crear un segundo registro.
7. **Given** un módulo de un periodo Cerrado o Próximo, **When** el estudiante lo consulta, **Then** no se ofrece para inscripción.
8. **Given** dos estudiantes que se inscriben al mismo tiempo al último cupo, **When** ambas peticiones llegan a la vez, **Then** solo una se acepta y la otra recibe el aviso de módulo lleno; nunca hay sobrecupo.
9. **Given** un módulo de un periodo activo que ya comenzó, **When** el estudiante se inscribe, **Then** queda inscrito solo en las sesiones que aún no han ocurrido.
10. **Given** un módulo cuyo docente o salón dejó de estar disponible, **When** el estudiante ve la oferta, **Then** el módulo aparece bloqueado con el motivo y sin acción de inscripción hasta que el CAE lo reasigne.

---

### User Story 2 - Cancelar una sesión o el módulo y volver a inscribirse (Priority: P1)

El estudiante cancela hasta 1 hora antes de la sesión y elige el alcance: solo esa sesión o su inscripción al módulo completo. Cancelar una sesión no le impide asistir a las siguientes. Cancelar el módulo libera su cupo y le permite volver a inscribirse mientras haya cupo. Pasado el límite de 1 hora, la cancelación se bloquea y se le explica la regla.

**Why this priority**: La cancelación y la reinscripción son parte del mismo ciclo de vida de la inscripción; sin ellas un estudiante no puede corregir una decisión ni liberar cupo para otros.

**Independent Test**: Con un estudiante inscrito, cancelar una sesión futura y comprobar que el resto sigue vigente; cancelar luego el módulo y comprobar que se libera el cupo y que puede volver a inscribirse; intentar cancelar una sesión que empieza en menos de 1 hora y comprobar que se bloquea con la regla.

**Acceptance Scenarios**:

1. **Given** una sesión que empieza en más de 1 hora, **When** el estudiante elige "solo esta sesión", **Then** la sesión queda cancelada para él, sigue inscrito en las demás y el cupo de esa sesión se libera.
2. **Given** una sesión que empieza en más de 1 hora, **When** el estudiante elige "el módulo completo", **Then** su inscripción pasa a cancelada, se libera su cupo y el módulo desaparece de "mis tutorías".
3. **Given** una sesión que empieza en 1 hora o menos, **When** el estudiante intenta cancelarla, **Then** la acción está bloqueada y se muestra la regla (se cancela hasta 1 hora antes).
4. **Given** un estudiante que canceló el módulo completo, **When** el módulo tiene cupo, **Then** puede volver a inscribirse.
5. **Given** un estudiante que canceló el módulo completo y un módulo que se llenó mientras tanto, **When** intenta reinscribirse, **Then** se bloquea con el aviso de módulo lleno.
6. **Given** una sesión que el estudiante canceló solo para él, **When** quiere volver a asistir y la sesión aún no empieza en menos de 1 hora, **Then** puede reactivarla si hay cupo, y si se llenó mientras tanto se bloquea con el aviso de lleno.
7. **Given** una sesión cancelada por festivo o por el docente, **When** el estudiante la consulta, **Then** la ve como cancelada con su motivo y no puede cancelarla de nuevo.
8. **Given** un módulo de un periodo Cerrado, **When** el estudiante intenta cancelar, **Then** la acción no está disponible y se le explica que el periodo es de solo lectura.

---

### User Story 3 - Ver mis tutorías (Priority: P2)

El estudiante ve la lista de módulos en los que está inscrito, con docente, salón, horario y sus próximas sesiones (fecha y hora de Bogotá, estado). Desde ahí abre una sesión para cancelarla o cancela el módulo. Es el punto de entrada de la cancelación.

**Why this priority**: Aporta visibilidad y el acceso a la cancelación, pero la inscripción y la cancelación pueden probarse con la oferta y el detalle del módulo.

**Independent Test**: Con un estudiante inscrito en dos módulos, abrir "mis tutorías" y verificar que aparecen ambos con sus próximas sesiones, que las canceladas se distinguen y que un estudiante sin inscripciones ve un estado vacío con acceso a la oferta.

**Acceptance Scenarios**:

1. **Given** un estudiante inscrito en varios módulos, **When** abre "mis tutorías", **Then** ve cada módulo con su docente, salón, horario semanal y sus próximas sesiones con fecha y hora de Bogotá.
2. **Given** sesiones canceladas por el estudiante, por festivo o por el docente, **When** abre el detalle, **Then** se distinguen con su motivo.
3. **Given** un estudiante sin inscripciones, **When** abre "mis tutorías", **Then** ve un estado vacío con la acción de ver la oferta de módulos.
4. **Given** una falla de red o del servidor, **When** carga la lista, **Then** ve el error con la opción de reintentar, no una pantalla en blanco.

---

### User Story 4 - Inscritos reales en la gestión del CAE (Priority: P2)

Con inscripciones reales, las reglas que la spec 010 dejó listas se aplican de verdad: el CAE ve la cantidad de inscritos de cada módulo, no puede cambiar el salón a uno con capacidad menor que los inscritos, no puede cambiar los horarios ni eliminar un módulo con inscritos, y el cupo disponible refleja los inscritos reales.

**Why this priority**: Cierra el circuito entre la inscripción y la gestión del CAE, pero depende de que ya existan inscritos (historia 1).

**Independent Test**: Con un módulo con 5 inscritos en un salón de 30, intentar cambiar a un salón de capacidad 4 (se bloquea con la regla), editar sus horarios y eliminarlo (se bloquean mostrando cuántos hay), y cambiar a un salón de capacidad 5 (se permite y el cupo cambia a 5).

**Acceptance Scenarios**:

1. **Given** un módulo con inscritos, **When** el CAE abre el listado o el detalle, **Then** ve la cantidad real de inscritos activos y los cupos disponibles.
2. **Given** un módulo con 5 inscritos activos, **When** el CAE elige un salón con capacidad menor que 5, **Then** el cambio se bloquea mostrando la regla y los inscritos.
3. **Given** un módulo con 5 inscritos activos, **When** el CAE elige un salón con capacidad 5 o mayor, **Then** el cambio se aplica y el cupo es la nueva capacidad.
4. **Given** un módulo con inscritos, **When** el CAE intenta cambiar sus horarios o eliminarlo, **Then** se bloquea indicando cuántos estudiantes lo impiden.
5. **Given** un módulo cuyos inscritos cancelaron todos, **When** el CAE intenta cambiar sus horarios o eliminarlo, **Then** se permite, porque ya no hay inscritos activos.
6. **Given** una cuenta de estudiante que el CAE desactiva o elimina, **When** se calculan los cupos, **Then** su inscripción se conserva en el historial pero deja de ocupar cupo.

---

### Edge Cases

- ¿Qué pasa si el estudiante intenta cancelar justo en el límite de 1 hora (la sesión empieza exactamente en 60 minutos)? Se permite; se bloquea solo cuando faltan menos de 60 minutos.
- ¿Qué pasa si el estudiante cancela el módulo completo y la sesión más próxima empieza en menos de 1 hora? La cancelación del módulo se acepta y aplica desde la siguiente sesión: la que empieza en menos de 1 hora se mantiene y las demás se liberan.
- ¿Qué pasa si el módulo está lleno pero otros estudiantes cancelaron una sesión suelta? El módulo sigue lleno para inscripciones nuevas mientras alguna sesión futura no tenga lugar; ese lugar solo lo puede retomar quien canceló esa sesión (al reactivarla) o un estudiante nuevo cuando todas las sesiones futuras tengan lugar, por ejemplo cuando solo queda una.
- ¿Qué pasa si dos peticiones de inscripción del mismo estudiante llegan a la vez? Solo se crea una inscripción.
- ¿Qué pasa si el CAE cambia el salón a uno de menor capacidad mientras un estudiante se inscribe? El cambio y la inscripción nunca dejan más inscritos que cupo.
- ¿Qué pasa si el CAE reasigna el docente de un módulo del que el estudiante es inscrito? La inscripción no cambia; el aviso al estudiante lo da la funcionalidad de notificaciones (spec 014).
- ¿Qué pasa si el CAE cierra o activa un periodo con módulos en los que hay inscritos? Las inscripciones del periodo cerrado quedan en solo lectura y se conservan como historial.
- ¿Qué pasa si un festivo cancela una sesión de un módulo en el que el estudiante está inscrito? La sesión aparece cancelada con el motivo y no consume ninguna acción del estudiante.
- ¿Qué pasa si el estudiante pierde la conexión al inscribirse? Ve el error con la opción de reintentar y no queda un estado a medias; reintentar no duplica la inscripción.
- ¿Qué pasa si el módulo se elimina o su docente o salón dejan de estar disponibles mientras el estudiante lo mira? Al intentar inscribirse recibe un aviso claro y la oferta se actualiza.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo un estudiante MUST poder inscribirse, cancelar y ver sus propias inscripciones; el docente y el CAE no operan estas acciones, y un estudiante MUST NOT poder ver ni modificar las inscripciones de otro. Los permisos se aplican en el servidor.
- **FR-002**: El estudiante MUST ver la oferta de módulos del periodo Activo, en tarjetas con nombre, docente, salón, horario semanal, cupos disponibles y si ya está inscrito, con búsqueda por nombre. Los módulos de periodos Próximos o Cerrados no se ofrecen para inscripción.
- **FR-003**: Un estudiante MUST poder inscribirse a un módulo del periodo Activo con cupo disponible. La inscripción es al módulo e incluye todas sus sesiones que aún no han ocurrido.
- **FR-004**: El cupo MUST medirse por sesión: cada sesión tiene como cupo la capacidad del salón del módulo, y ocupan lugar los estudiantes con inscripción activa que no la cancelaron (sus asistentes). Un estudiante MUST poder inscribirse solo si todas las sesiones futuras del módulo tienen lugar; si alguna está llena, el módulo se muestra lleno, la inscripción se bloquea y se explica el motivo. Una sesión nunca puede tener más asistentes que cupo, ni siquiera con inscripciones simultáneas. Los cupos disponibles que se muestran son los de la sesión futura con menos lugar.
- **FR-005**: Un estudiante MUST NOT poder inscribirse a dos módulos del mismo periodo cuyos horarios semanales se solapen; terminar a la hora en que otro empieza no es un cruce. El rechazo MUST indicar el módulo y el horario con los que se cruza. No hay límite de módulos por estudiante.
- **FR-006**: Un estudiante MUST NOT tener más de una inscripción activa al mismo módulo.
- **FR-007**: El estudiante MUST poder cancelar hasta 1 hora antes del inicio de una sesión, eligiendo entre cancelar solo esa sesión o su inscripción al módulo completo (D-070). Pasado ese límite la cancelación se bloquea mostrando la regla. El límite de 1 hora MUST ser configuración, no un valor fijo en el código.
- **FR-008**: Cancelar una sesión MUST dejar al estudiante inscrito en las demás sesiones del módulo y liberar su cupo solo para esa sesión; el estudiante MUST poder reactivarla mientras falte más de 1 hora y haya cupo. Cancelar el módulo MUST liberar su cupo y siempre se acepta: aplica desde la primera sesión que empiece en más de 1 hora.
- **FR-009**: Un estudiante MUST poder volver a inscribirse a un módulo que canceló mientras haya cupo disponible.
- **FR-010**: Cuando una acción esté bloqueada (módulo lleno, cruce de horario, cancelación fuera de plazo, periodo Cerrado, módulo no disponible), la aplicación MUST mostrar la regla que la bloquea en el idioma del dispositivo.
- **FR-011**: El estudiante MUST ver sus módulos inscritos con docente, salón, horario y sus próximas sesiones (fecha y hora de Bogotá, estado y, si fue cancelada, el motivo: del estudiante, del docente o festivo).
- **FR-012**: Las inscripciones y cancelaciones de un periodo Cerrado MUST ser de solo lectura: no se crean ni se cancelan, y se conservan como historial.
- **FR-013**: Los módulos cuyo docente o salón no están disponibles (D-088) MUST aparecer bloqueados con el motivo y sin acción de inscripción hasta que el CAE los reasigne; los inscritos conservan su inscripción.
- **FR-014**: La cantidad de inscritos de un módulo MUST ser la real en el listado y el detalle del CAE, y las reglas de la spec 010 MUST aplicarse con ella: el CAE no cambia el salón a uno con capacidad menor que los inscritos activos, ni edita los horarios ni elimina un módulo con inscritos activos.
- **FR-015**: Una inscripción de una cuenta de estudiante desactivada o eliminada MUST conservarse en el historial y dejar de ocupar cupo.
- **FR-016**: Cada inscripción y cancelación MUST registrar quién, qué módulo o sesión y cuándo, para trazabilidad, sin exponer datos personales de otros estudiantes.
- **FR-017**: Los borrados MUST ser lógicos; ninguna inscripción ni cancelación se elimina físicamente.
- **FR-018**: Todos los textos MUST estar en español e inglés, y las pantallas MUST resolver los cuatro estados (cargando, vacío, error con reintento, contenido).
- **FR-019**: La inscripción MUST NO publicarse en producción sin las notificaciones de la spec 014 o sin un consumidor del registro de eventos (D-087).

### Key Entities *(include if feature involves data)*

- **Inscripción**: la relación entre un estudiante y un módulo. Tiene estado (activa o cancelada), fecha de inscripción y, si se canceló, la fecha de cancelación. Un estudiante tiene como máximo una inscripción activa por módulo, y puede tener varias canceladas en su historial.
- **Cancelación de sesión**: la decisión de un estudiante de no asistir a una sesión concreta de un módulo en el que sigue inscrito. Guarda estudiante, sesión y fecha. Libera el lugar solo de esa sesión.
- **Módulo / Sesión / Periodo / Salón** (spec 010 y 006): el cupo es la capacidad del salón; el periodo Activo define la oferta; el Cerrado es de solo lectura.
- **Estudiante** (spec 001): cuenta con rol estudiante, que puede estar activa, desactivada o eliminada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un estudiante encuentra un módulo y se inscribe en menos de 1 minuto desde que abre la pestaña de tutorías.
- **SC-002**: El 100 % de los intentos de inscribirse a un módulo lleno se rechazan, incluso cuando varias peticiones llegan a la vez; en una prueba con 20 estudiantes simultáneos sobre un módulo de cupo 5, quedan exactamente 5 inscritos.
- **SC-003**: El 100 % de los intentos de inscribirse a un módulo que se cruza con otro del estudiante se rechazan mostrando el módulo y el horario con los que choca.
- **SC-004**: Un estudiante cancela una sesión o el módulo en menos de 30 segundos desde "mis tutorías".
- **SC-005**: El 100 % de las cancelaciones con menos de 1 hora de anticipación se bloquean mostrando la regla, y el 100 % de las hechas con 1 hora o más se aceptan.
- **SC-006**: Ninguna sesión tiene más asistentes que la capacidad de su salón, ni antes ni después de cambiar de salón.
- **SC-007**: Al probar con docente, CAE y otro estudiante, el 100 % de los intentos de ver o modificar inscripciones ajenas son rechazados.
- **SC-008**: Todos los textos y errores aparecen traducidos en español e inglés, y en modo oscuro y con fuente grande no hay cortes ni textos fuera de pantalla.
- **SC-009**: En una revisión con estudiantes, al menos 9 de 10 entienden por qué una acción está bloqueada sin ayuda.

## Assumptions

- Esta spec depende de las specs 001 (cuentas y roles), 006 (periodos y salones) y 010 (módulos, sesiones y festivos); el conteo de inscritos de la spec 010 hoy devuelve cero y esta spec lo reemplaza con datos reales.
- Las notificaciones a los inscritos (cambio de hora, salón, docente, festivo o cancelación del docente) pertenecen a la spec 014, y el cambio de hora y la cancelación por parte del docente, a la spec 012. Esta spec no envía notificaciones ni agrega eventos al outbox: las notificaciones de las specs 012 y 013 leen las inscripciones y las ausencias de la base de datos.
- Las inscripciones se hacen solo a módulos del periodo Activo; las de periodos Próximos no se abren hasta que el CAE los active.
- El cruce de horarios entre módulos del estudiante se evalúa con los horarios semanales del módulo, no sesión por sesión.
- Una inscripción tardía (con el periodo ya comenzado) cubre solo las sesiones que aún no han ocurrido.
- El estudiante opera desde la app móvil; el docente ve el conteo de sus inscritos en su cronograma, que corresponde a otra spec.
- El cronograma semanal de solo lectura del estudiante es otra funcionalidad; aquí solo se listan sus módulos y próximas sesiones.
- La regla de cambio de salón no cambia (capacidad nueva mayor o igual a los inscritos activos). Con el cupo por sesión puede haber más inscritos activos que capacidad en casos raros (cancelaciones de sesiones distintas); la regla sigue contando inscritos y es la más estricta. Editar horarios y eliminar el módulo siguen bloqueados mientras haya inscritos activos.
- Las horas se muestran en `America/Bogota` y se guardan en UTC, igual que en la spec 010.
- El límite de 1 hora para cancelar vive en configuración, como el de 2 horas del docente (spec 012).
