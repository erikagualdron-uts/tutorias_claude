# Feature Specification: Cronograma del docente: reprogramar y cancelar sesiones

**Feature Branch**: `012-teacher-sessions`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "de la 012 con el docente: ver sus módulos y sesiones, reprogramar una sesión (o ella y las futuras) y cancelarla hasta 2 horas antes, consultando disponibilidad de salón y sin cruces, dejando los eventos para las notificaciones (spec 014)"

## Clarifications

### Session 2026-11-17

- Q: Cuando el docente reprograma o cancela, ¿a qué sesiones aplica el cambio? → A: El docente elige al confirmar entre "solo esta sesión" y "esta y las futuras de su mismo horario semanal". Esto ajusta D-069, que fijaba siempre "ella y las futuras".
- Q: Al reprogramar, ¿se valida que la nueva hora no cruce con otras tutorías de los estudiantes inscritos? → A: Sí, se rechaza si algún inscrito tendría otra tutoría a esa hora; el rechazo dice cuántos estudiantes chocan, sin revelar quiénes.
- Q: Al reprogramar una sesión, ¿a qué fechas puede moverla el docente? → A: Solo dentro de la misma semana (lunes a domingo, hora de Bogotá) de la sesión: puede cambiar el día y la hora, pero no pasarla a otra semana.
- Q: Si el docente cancela una sesión por error, ¿puede deshacer la cancelación? → A: Sí, mientras falten 2 horas o más para su inicio; la sesión vuelve a estar programada, se vuelve a validar su disponibilidad y se registra otro evento para avisar a los inscritos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver mis módulos y sesiones (Priority: P1)

El docente abre la pestaña de su cronograma y ve los módulos que dicta en el periodo Activo con su salón, horario semanal y cantidad de estudiantes inscritos, y sus próximas sesiones (fecha y hora de Bogotá, salón, estado y número de asistentes). Desde ahí abre una sesión para reprogramarla o cancelarla.

**Why this priority**: Es la entrada a todo lo demás: sin ver sus sesiones el docente no puede cambiarlas, y es lo que `Context.md` §4.2 le promete en su cronograma.

**Independent Test**: Con un docente que dicta dos módulos, uno con estudiantes inscritos, iniciar sesión como docente y comprobar que ve solo sus módulos y sesiones, el conteo de inscritos de cada uno y que no ve los de otro docente.

**Acceptance Scenarios**:

1. **Given** un docente con módulos en el periodo Activo, **When** abre su cronograma, **Then** ve sus módulos con nombre, salón, horario semanal e inscritos, y la lista de sus próximas sesiones ordenadas por fecha.
2. **Given** un docente, **When** consulta los módulos o sesiones de otro docente, **Then** el sistema los trata como inexistentes (nunca los muestra ni los deja modificar).
3. **Given** una sesión cancelada por festivo o por el propio docente, **When** el docente la ve, **Then** aparece cancelada con su motivo y sin acciones.
4. **Given** una sesión cuyo salón o docente cambió por una reasignación del CAE, **When** el docente la ve, **Then** muestra el docente y el salón con que se dicta esa sesión.
5. **Given** un docente sin módulos en el periodo Activo, **When** abre su cronograma, **Then** ve un estado vacío que lo explica.
6. **Given** un periodo Cerrado, **When** el docente consulta sus módulos, **Then** los ve en solo lectura, sin acciones de cambio.

---

### User Story 2 - Reprogramar una sesión (Priority: P1)

El docente elige una sesión que empieza en 2 horas o más y propone una nueva hora. Antes de confirmar, el sistema consulta la disponibilidad del salón y de él mismo, y le muestra el motivo si la hora no es posible. Al confirmar, la sesión queda reprogramada y se conserva su hora original.

**Why this priority**: Es la razón de ser de la funcionalidad: el docente necesita ajustar una tutoría cuando surge un imprevisto, y los estudiantes deben seguir viendo la agenda correcta.

**Independent Test**: Con un módulo con estudiantes inscritos, reprogramar una sesión a una hora libre (se acepta y conserva la hora original), a una hora en que el salón está ocupado (se rechaza indicando el módulo con el que choca) y una sesión que empieza en menos de 2 horas (se bloquea mostrando la regla).

**Acceptance Scenarios**:

1. **Given** una sesión que empieza en 2 horas o más, **When** el docente propone una nueva hora libre, **Then** la sesión queda reprogramada con su nueva hora, conserva la hora original y los estudiantes inscritos la ven con la nueva hora.
2. **Given** una sesión que empieza en menos de 2 horas, **When** el docente intenta reprogramarla, **Then** la acción está bloqueada y se muestra la regla (se cambia hasta 2 horas antes).
3. **Given** una nueva hora en que el salón ya está ocupado por otro módulo, **When** el docente confirma, **Then** se rechaza indicando el módulo, el día y las horas con los que se cruza.
4. **Given** una nueva hora en que el propio docente ya dicta otro módulo, **When** confirma, **Then** se rechaza indicando el módulo con el que se cruza.
5. **Given** una nueva hora fuera del horario permitido de los módulos (de 6:00 a. m. a 6:00 p. m.), **When** confirma, **Then** se rechaza mostrando la ventana permitida.
6. **Given** una nueva fecha que es festivo, **When** confirma, **Then** se rechaza indicando que ese día no hay tutorías.
7. **Given** una nueva fecha en otra semana distinta a la de la sesión, en el pasado o fuera del periodo del módulo, **When** confirma, **Then** se rechaza indicando que solo puede moverla dentro de su semana.
8. **Given** una hora a punto de aceptarse, **When** otro cambio (del CAE o del mismo docente) ocupa el salón al mismo tiempo, **Then** solo uno prospera y el otro recibe el aviso de cruce; nunca quedan dos módulos en el mismo salón y hora.
9. **Given** una reprogramación aceptada, **When** se guarda, **Then** queda registrado un evento con lo que las notificaciones necesitan (módulo, sesiones afectadas, hora anterior y nueva) en la misma operación que el cambio.
10. **Given** una nueva hora en que algún estudiante inscrito ya tiene otra tutoría, **When** el docente confirma, **Then** se rechaza indicando cuántos estudiantes se cruzan, sin revelar quiénes son.
11. **Given** el docente al confirmar, **When** elige "solo esta sesión", **Then** solo esa sesión cambia; **When** elige "esta y las futuras", **Then** esa sesión y todas las futuras de su mismo horario semanal se mueven lo mismo, se validan todas antes de aceptar (si alguna falla se rechaza toda la serie indicando la primera) y se registra un solo evento.
12. **Given** una sesión reprogramada, **When** el docente la vuelve a reprogramar, **Then** se aplican las mismas reglas desde su hora actual y la hora original se mantiene.

---

### User Story 3 - Cancelar o reactivar una sesión (Priority: P1)

El docente cancela una sesión que empieza en 2 horas o más. La sesión queda cancelada con el motivo "docente" para él, el CAE y los estudiantes inscritos. Si se equivocó, puede reactivarla mientras falten 2 horas o más. Pasado el límite, las acciones se bloquean mostrando la regla.

**Why this priority**: Es la otra mitad de lo que el docente necesita cambiar y la que más afecta a los estudiantes: una tutoría que no se dicta debe verse cancelada, no solo desaparecer.

**Independent Test**: Con un módulo con inscritos, cancelar una sesión a más de 2 horas (queda cancelada con motivo "docente" y los estudiantes la ven así), intentar cancelar una a menos de 2 horas (se bloquea) y comprobar que el evento queda registrado.

**Acceptance Scenarios**:

1. **Given** una sesión que empieza en 2 horas o más, **When** el docente la cancela y confirma, **Then** queda cancelada con el motivo "docente", sin borrarse, y los estudiantes inscritos la ven cancelada.
2. **Given** el docente al confirmar la cancelación, **When** elige "solo esta sesión", **Then** solo esa se cancela; **When** elige "esta y las futuras", **Then** se cancelan esa y todas las futuras de su mismo horario semanal (las ya canceladas por festivo se mantienen) y se registra un solo evento.
3. **Given** una sesión que empieza en menos de 2 horas, **When** el docente intenta cancelarla, **Then** la acción está bloqueada y se muestra la regla.
4. **Given** una sesión cancelada por el docente, **When** el estudiante inscrito la mira, **Then** aparece como "cancelada por el docente" y no ofrece ninguna acción.
5. **Given** una cancelación aceptada, **When** se guarda, **Then** queda registrado un evento para las notificaciones en la misma operación que el cambio.
6. **Given** una sesión ya cancelada o ya pasada, **When** el docente intenta cancelarla, **Then** el sistema lo rechaza sin cambiar nada.
7. **Given** un periodo Cerrado, **When** el docente intenta cancelar una sesión, **Then** el sistema lo rechaza por ser de solo lectura.
8. **Given** una sesión que el docente canceló y que empieza en 2 horas o más, **When** la reactiva, **Then** vuelve a estar programada con su hora, los estudiantes la ven de nuevo y se registra un evento de reactivación.
9. **Given** una sesión cancelada por el docente cuyo salón o docente ya está ocupado a esa hora, o a la que algún inscrito ya tiene otra tutoría, **When** intenta reactivarla, **Then** se rechaza indicando el cruce.
10. **Given** una sesión cancelada por un festivo, **When** el docente intenta reactivarla, **Then** no ofrece la acción: solo se reactivan las cancelaciones hechas por el docente.

---

### User Story 4 - Eventos y límites configurables para las notificaciones (Priority: P2)

Cada reprogramación y cancelación deja, en la misma operación que el cambio, un evento con los datos mínimos que las notificaciones de la spec 014 necesitan para avisar a los inscritos. El límite de 2 horas se lee de la configuración.

**Why this priority**: La regla "todo cambio notifica a los inscritos" no se puede cumplir hasta que exista el canal (spec 014), pero ningún cambio hecho antes debe quedar sin registro.

**Independent Test**: Reprogramar y cancelar sesiones y comprobar que cada acción deja exactamente un evento con los datos esperados; cambiar el límite de 2 horas en la configuración y comprobar que las acciones lo respetan sin tocar el código.

**Acceptance Scenarios**:

1. **Given** una reprogramación o cancelación aceptada, **When** termina, **Then** existe un evento por acción con el módulo, las sesiones afectadas y los datos del cambio, sin información personal de los estudiantes.
2. **Given** una acción rechazada (fuera de plazo, cruce o periodo cerrado), **When** termina, **Then** no queda ningún evento ni cambio parcial.
3. **Given** un límite de cambio distinto de 2 horas en la configuración, **When** el docente actúa, **Then** el sistema aplica ese límite.

---

### Edge Cases

- ¿Qué pasa si la sesión empieza exactamente en 2 horas? Se permite; se bloquea solo cuando faltan menos de 120 minutos.
- ¿Qué pasa si el docente reprograma una sesión a la que algunos estudiantes ya cancelaron su asistencia? Sus ausencias se conservan; la sesión sigue siendo la misma con otra hora.
- ¿Qué pasa si el docente deja de estar disponible (cuenta desactivada o eliminada) mientras tiene sesiones? No puede iniciar sesión ni actuar; el CAE reasigna el módulo (D-088).
- ¿Qué pasa si el CAE reasigna el docente o el salón mientras el docente reprograma? Un solo cambio prospera; el otro se rechaza o se evalúa con los datos ya cambiados.
- ¿Qué pasa si el docente pierde la conexión al confirmar? Ve el error con la opción de reintentar; reintentar no duplica el evento ni el cambio.
- ¿Qué pasa si un festivo se registra después de reprogramar una sesión a esa fecha? Se aplica la regla de festivos de la spec 010 y la sesión se cancela con ese motivo.
- ¿Qué pasa si la sesión elegida ya la cancelaron los estudiantes por completo? Se puede reprogramar o cancelar igual; la acción es del docente, no depende de la asistencia.
- ¿Qué pasa si el docente elige "esta y las futuras" y alguna de ellas no se puede mover (salón ocupado, festivo, cruce de un estudiante)? Se rechaza todo el cambio indicando la primera sesión con problema; nunca queda a medias.
- ¿Qué pasa si el docente elige "esta y las futuras" y una sesión de la serie ya había sido movida antes y el mismo desplazamiento la saca de su semana? Se valida cada sesión con sus propias reglas y se rechaza toda la serie indicando la primera sesión con problema.
- ¿Qué pasa si el docente elige "esta y las futuras" y alguna sesión futura ya está cancelada (festivo)? Esa sesión no se mueve ni se reactiva; el cambio aplica a las demás.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo el docente dueño de un módulo MUST poder ver sus sesiones y reprogramarlas o cancelarlas; el CAE y los estudiantes no operan estas acciones, y un docente MUST NOT poder ver ni modificar los módulos o sesiones de otro. Los permisos se aplican en el servidor.
- **FR-002**: El docente MUST ver sus módulos del periodo Activo con salón, horario semanal e inscritos, y sus próximas sesiones con fecha y hora de Bogotá, salón, estado (programada, reprogramada o cancelada con su motivo) y número de asistentes.
- **FR-003**: El docente MUST poder reprogramar una sesión que empieza en 2 horas o más, eligiendo si el cambio aplica solo a esa sesión o a ella y a las futuras de su mismo horario semanal (las ya dictadas no cambian). Cada sesión movida conserva su hora original y pasa a estado reprogramada; si se mueven varias, se valida todo antes de aceptar y el cambio es atómico.
- **FR-004**: Antes de aceptar una nueva hora, el sistema MUST validar la disponibilidad del salón y del docente, indicando el módulo, el día y las horas con los que hay cruce, y MUST respetar el horario permitido de los módulos, los festivos, el periodo del módulo y que la nueva fecha y hora sean futuras y caigan dentro de la misma semana (lunes a domingo, hora de Bogotá) de la sesión.
- **FR-005**: La reprogramación MUST rechazarse si algún estudiante inscrito (inscripción activa, sin ausencia en esa sesión) ya tiene otra tutoría a la nueva hora, indicando cuántos estudiantes se cruzan y sin revelar quiénes son.
- **FR-006**: El docente MUST poder cancelar una sesión que empieza en 2 horas o más, eligiendo si aplica solo a esa sesión o a ella y a las futuras de su mismo horario semanal. Cada sesión cancelada queda cancelada con el motivo "docente", sin borrarse, y no ofrece acciones a nadie.
- **FR-006b**: El docente MUST poder reactivar una sesión que él canceló mientras falten 2 horas o más para su inicio, con la misma elección de alcance. Reactivar MUST volver a validar el salón, el docente y los estudiantes inscritos (como reprogramar), deja la sesión programada y registra su propio evento. Las cancelaciones por festivo no se reactivan desde aquí.
- **FR-007**: Pasado el límite de 2 horas antes del inicio de la primera sesión afectada, reprogramar y cancelar MUST bloquearse mostrando la regla. El límite MUST ser configuración, no un valor fijo en el código.
- **FR-008**: Una sesión pasada o de un periodo Cerrado MUST NOT poder reprogramarse, cancelarse ni reactivarse, y una ya cancelada MUST NOT poder cancelarse ni reprogramarse otra vez (solo reactivarse si la canceló el docente).
- **FR-009**: Cada reprogramación, cancelación y reactivación aceptada MUST dejar un evento para las notificaciones en la misma operación que el cambio, con el módulo, las sesiones afectadas y los datos del cambio, sin información personal de los estudiantes. Una acción rechazada no deja ni cambio ni evento.
- **FR-010**: Las reglas MUST cumplirse aun con peticiones simultáneas (otro cambio del docente, del CAE o una inscripción): nunca hay dos módulos en el mismo salón y hora, ni el cambio deja una sesión con más asistentes que la capacidad del salón.
- **FR-011**: Los estudiantes inscritos MUST ver la sesión con su nueva hora o como cancelada por el docente en su detalle de módulo y en "mis tutorías", sin acciones sobre una sesión cancelada.
- **FR-012**: Cuando una acción esté bloqueada (fuera de plazo, cruce, festivo, periodo Cerrado), la aplicación MUST mostrar la regla que la bloquea en el idioma del dispositivo.
- **FR-013**: Los borrados MUST ser lógicos y las horas originales MUST conservarse para trazabilidad; ninguna sesión se elimina físicamente.
- **FR-014**: Todos los textos MUST estar en español e inglés, y las pantallas MUST resolver los cuatro estados (cargando, vacío, error con reintento, contenido).
- **FR-015**: Esta funcionalidad MUST NO enviar notificaciones; solo deja los eventos. No se publica en producción sin las notificaciones de la spec 014 o sin un consumidor del registro de eventos (D-087).

### Key Entities *(include if feature involves data)*

- **Sesión** (spec 010): una ocurrencia de un módulo con su hora, docente, salón y estado. Gana la capacidad de estar reprogramada (con hora original y nueva) o cancelada por el docente.
- **Evento de módulo** (spec 010): registro que las notificaciones leerán. Se agregan los tipos de reprogramación, de cancelación del docente y de reactivación, con datos mínimos del cambio.
- **Módulo / Periodo / Salón / Festivo** (specs 006 y 010): definen la disponibilidad, el horario permitido y la fecha en que no hay tutorías.
- **Docente** (spec 001): cuenta con rol docente, dueño de sus módulos.
- **Inscripción y ausencia de sesión** (spec 011): se conservan al reprogramar; sirven para mostrar asistentes y para el aviso a los inscritos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un docente encuentra una sesión y la reprograma o cancela en menos de 1 minuto desde que abre su cronograma.
- **SC-002**: El 100 % de las acciones (reprogramar, cancelar y reactivar) con menos de 2 horas de anticipación se bloquean mostrando la regla, y el 100 % de las hechas con 2 horas o más y sin otro impedimento se aceptan.
- **SC-003**: El 100 % de los intentos de reprogramar a una hora en que el salón o el docente ya están ocupados se rechazan indicando el módulo con el que chocan, incluso con peticiones simultáneas.
- **SC-004**: El 100 % de las acciones aceptadas dejan exactamente un evento para las notificaciones, y el 100 % de las rechazadas no dejan ninguno.
- **SC-005**: Al probar con CAE, estudiante y otro docente, el 100 % de los intentos de ver o cambiar sesiones ajenas son rechazados.
- **SC-006**: Los estudiantes inscritos ven la nueva hora o la cancelación en su detalle de módulo en la siguiente consulta, sin que el docente haga nada más.
- **SC-007**: Todos los textos y errores aparecen traducidos en español e inglés, y en modo oscuro y con fuente grande no hay cortes ni textos fuera de pantalla.
- **SC-008**: En una revisión con docentes, al menos 9 de 10 entienden por qué una acción está bloqueada sin ayuda.

## Assumptions

- Esta spec depende de las specs 001 (cuentas y roles), 006 (periodos y salones), 010 (módulos, sesiones, festivos y registro de eventos) y 011 (inscripciones y ausencias).
- Las notificaciones a los inscritos y los mensajes docente-estudiante pertenecen a la spec 014; esta spec solo deja los eventos. El calendario semanal de todos los roles (Design.md) es otra funcionalidad; aquí el docente ve una lista de sus módulos y próximas sesiones.
- El docente solo actúa en módulos del periodo Activo; los del Cerrado se ven en solo lectura.
- El horario permitido (6:00 a. m. a 6:00 p. m., D-089), los festivos (D-083) y el cruce de salón y de docente (D-085) son los de la spec 010 y se aplican a la nueva hora.
- Las horas se muestran en `America/Bogota` y se guardan en UTC, igual que en la spec 010.
- El límite de 2 horas vive en configuración, como el de 1 hora del estudiante (spec 011).
- Reprogramar mueve la sesión a otro día y hora de su misma semana; la sesión conserva su salón y su docente. Con "esta y las futuras", cada sesión futura se desplaza el mismo cambio de día y de hora que la elegida (dentro de su propia semana) y todas se validan igual. Para ausentarse más de una semana, el docente cancela.
- El alcance elegido por el docente reemplaza a D-069 (que fijaba siempre "ella y las futuras"); se ajusta en `Decisions.md` al cerrar la funcionalidad.
- "Las futuras" son las sesiones futuras del **mismo horario semanal** de la sesión elegida (un módulo con martes y jueves, al mover un martes, no mueve los jueves). Para cancelar todo el módulo, el docente repite la acción en cada horario.
- Resolver la pregunta abierta de `Context.md` §10 sobre cruces con los estudiantes forma parte de esta funcionalidad.
