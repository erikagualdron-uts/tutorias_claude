# Feature Specification: Módulos y sesiones (CAE)

**Feature Branch**: `010-modules-sessions`

**Created**: 2026-11-17

**Status**: Implemented

**Input**: User description: "Spec 010: Módulos y sesiones (CAE). Es la siguiente funcionalidad natural y la base de todo lo demás. Incluye: CRUD de módulos con docente, salón y horario; generación de sesiones semanales; validación de que salón y docente no se crucen; cupo igual a la capacidad del salón; cambio de salón con la regla de capacidad; respeto al periodo cerrado."

## Clarifications

### Session 2026-11-17

- Q: ¿Se excluyen festivos o semanas sin tutoría al generar las sesiones? → A: Sí. El CAE administra un calendario de festivos y el sistema omite esas fechas al generar sesiones. Además, el CAE puede importar los festivos de un año desde un servicio público externo (Nager.Date, `https://date.nager.at/api/v3/PublicHolidays/{año}/CO`) para no digitarlos; la importación es una ayuda opcional y el calendario manual siempre funciona.
- Q: Al cambiar el docente o el salón de un módulo con sesiones pasadas, ¿qué pasa con las ya dictadas? → A: Conservan el docente y el salón con que se dictaron; solo cambian las sesiones futuras.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear un módulo con su horario semanal (Priority: P1)

El CAE crea un módulo (tutoría) dentro de un periodo académico: le da nombre y descripción, elige docente y salón, y define uno o más horarios semanales (día, hora de inicio y hora de fin). Al guardar, el sistema genera una sesión por cada semana del periodo y muestra el cupo, que es la capacidad del salón.

**Why this priority**: Sin módulos no hay nada que ver, inscribir, cambiar ni cancelar. Es la base de todas las funcionalidades siguientes.

**Independent Test**: Con un periodo Próximo, un docente activo y un salón de capacidad 30, crear un módulo "Cálculo I" los martes de 2:00 p. m. a 4:00 p. m. y verificar que aparece en el listado con cupo 30 y con una sesión por cada martes del periodo.

**Acceptance Scenarios**:

1. **Given** un periodo Próximo o Activo, un docente activo y un salón Activo, **When** el CAE crea un módulo con un horario semanal válido, **Then** el módulo queda guardado, muestra cupo igual a la capacidad del salón y tiene una sesión por cada semana del periodo en el día y la hora definidos.
2. **Given** un módulo con dos horarios semanales (por ejemplo martes y jueves), **When** el CAE lo guarda, **Then** se generan sesiones para ambos días en todas las semanas del periodo.
3. **Given** un horario cuya hora de fin es igual o anterior a la de inicio, **When** el CAE guarda, **Then** el sistema lo rechaza indicando la regla.
4. **Given** un docente que ya tiene un módulo del mismo periodo cuyo horario se solapa, **When** el CAE intenta asignarlo, **Then** el sistema lo rechaza y muestra con qué módulo y horario se cruza.
5. **Given** un salón que ya tiene un módulo del mismo periodo cuyo horario se solapa, **When** el CAE intenta asignarlo, **Then** el sistema lo rechaza y muestra con qué módulo y horario se cruza.
6. **Given** dos módulos que terminan y empiezan a la misma hora exacta (uno de 2:00 a 4:00 p. m. y otro de 4:00 a 6:00 p. m.), **When** el CAE guarda el segundo, **Then** se permite, porque no hay solapamiento.
7. **Given** un periodo Activo que ya comenzó, **When** el CAE crea un módulo, **Then** solo se generan las sesiones que aún no han ocurrido.
9. **Given** una fecha registrada como festivo dentro del periodo, **When** el CAE crea un módulo cuyo horario cae ese día, **Then** no se genera la sesión de esa fecha y el detalle lo indica.
8. **Given** campos obligatorios vacíos (nombre, docente, salón o al menos un horario), **When** el CAE guarda, **Then** el sistema indica qué falta.

---

### User Story 2 - Consultar y filtrar módulos por periodo (Priority: P1)

El CAE ve el listado de módulos organizado por periodo académico, con docente, salón, horario, cupo y estado, y puede abrir el detalle de un módulo para ver sus sesiones.

**Why this priority**: Es la forma de comprobar lo creado y el punto de entrada para editar o eliminar.

**Independent Test**: Con módulos en dos periodos, cambiar el filtro de periodo y verificar que solo aparecen los del periodo elegido; abrir uno y ver su lista de sesiones con fecha y hora en horario de Bogotá.

**Acceptance Scenarios**:

1. **Given** módulos en varios periodos, **When** el CAE abre la pestaña de módulos, **Then** ve por defecto los del periodo activo (o el próximo si no hay activo) y puede cambiar de periodo.
2. **Given** el listado, **When** el CAE busca por nombre, o filtra por docente o salón, **Then** solo ve los módulos que coinciden.
3. **Given** un módulo, **When** el CAE abre su detalle, **Then** ve nombre, descripción, periodo, docente, salón, cupo, inscritos, horarios semanales y la lista de sesiones con su fecha, hora y estado.
4. **Given** un periodo sin módulos, **When** el CAE lo selecciona, **Then** ve un estado vacío con la acción de crear un módulo.
5. **Given** un periodo Cerrado, **When** el CAE lo selecciona, **Then** ve sus módulos en solo lectura, sin acciones de crear, editar ni eliminar, y se le explica el motivo.
6. **Given** un módulo cuyo docente o salón se desactivó o eliminó después de asignarse, **When** el CAE ve el listado o el detalle, **Then** el módulo aparece marcado como "docente no disponible" o "salón no disponible" y puede reasignarlo.

---

### User Story 3 - Cambiar el salón de un módulo (Priority: P1)

El CAE reasigna el salón de un módulo. El sistema solo lo permite si el nuevo salón está disponible a esa hora y su capacidad es mayor o igual a la cantidad de inscritos; el cupo del módulo pasa a ser la capacidad del nuevo salón.

**Why this priority**: Es una regla de negocio obligatoria del CAE y protege contra el sobrecupo.

**Independent Test**: Con un módulo con 25 inscritos en un salón de 30, intentar pasarlo a uno de 20 (se bloquea con la regla) y luego a uno de 40 (se permite y el cupo pasa a 40).

**Acceptance Scenarios**:

1. **Given** un módulo con N inscritos, **When** el CAE elige un salón con capacidad menor que N, **Then** el cambio se bloquea y el mensaje indica la capacidad del salón elegido y el número de inscritos.
2. **Given** un módulo con N inscritos, **When** el CAE elige un salón con capacidad mayor o igual a N, **Then** el cambio se aplica, el cupo pasa a la nueva capacidad y las sesiones futuras usan el nuevo salón.
3. **Given** un salón con otro módulo cuyo horario se solapa, **When** el CAE lo elige, **Then** se rechaza indicando con qué módulo se cruza.
4. **Given** un salón Inactivo o eliminado, **When** el CAE abre la lista de salones, **Then** no puede elegirlo.
5. **Given** un módulo sin inscritos, **When** el CAE cambia el salón a cualquiera disponible, **Then** el cambio se aplica.

---

### User Story 4 - Cambiar el docente de un módulo (Priority: P2)

El CAE reasigna el docente de un módulo. El nuevo docente debe estar activo y libre en los horarios del módulo; el cambio aplica a todas las sesiones futuras.

**Why this priority**: Es un caso frecuente (reemplazos, bajas) pero el producto ya funciona sin él.

**Independent Test**: Cambiar el docente de un módulo por otro libre y verificar que el detalle y las sesiones futuras muestran al nuevo; intentar con uno ocupado y verificar el rechazo.

**Acceptance Scenarios**:

1. **Given** un docente activo y libre en los horarios del módulo, **When** el CAE lo asigna, **Then** el módulo y todas sus sesiones futuras pasan a ese docente.
2. **Given** un docente con otro módulo solapado, **When** el CAE lo asigna, **Then** se rechaza indicando con qué módulo se cruza.
3. **Given** un docente desactivado o eliminado, **When** el CAE abre la lista, **Then** no puede elegirlo.

---

### User Story 5 - Editar y eliminar un módulo (Priority: P2)

El CAE edita el nombre y la descripción de un módulo, o sus horarios semanales mientras nadie esté inscrito, y elimina (de forma lógica) módulos que no tengan inscritos.

**Why this priority**: Completa el ciclo de gestión; corrige errores de captura.

**Independent Test**: Editar el nombre, cambiar el horario de un módulo sin inscritos y verificar que las sesiones futuras se regeneran; eliminar un módulo sin inscritos y verificar que desaparece del listado; intentar lo mismo con uno con inscritos y ver el bloqueo.

**Acceptance Scenarios**:

1. **Given** un módulo, **When** el CAE edita nombre o descripción, **Then** el cambio se guarda en cualquier caso (con o sin inscritos), salvo en periodo Cerrado.
2. **Given** un módulo sin inscritos, **When** el CAE cambia sus horarios semanales con valores válidos, **Then** las sesiones futuras se regeneran con el nuevo horario y las pasadas se conservan.
3. **Given** un módulo con inscritos, **When** el CAE intenta cambiar sus horarios o eliminarlo, **Then** la acción se bloquea y se explica la regla.
4. **Given** un módulo sin inscritos, **When** el CAE lo elimina y confirma, **Then** deja de aparecer en el listado (borrado lógico) y libera docente y salón en sus horarios.
5. **Given** un módulo de un periodo Cerrado, **When** el CAE intenta editarlo o eliminarlo, **Then** la acción se rechaza explicando que el periodo está cerrado.

---

### User Story 6 - Administrar el calendario de festivos (Priority: P2)

El CAE mantiene los festivos en los que no se dictan tutorías. Puede importar los festivos de un año desde un servicio público de festivos (Colombia), revisarlos antes de confirmar, y agregar, editar o quitar festivos a mano.

**Why this priority**: Evita generar sesiones en días sin clase. Es P2 porque los módulos pueden crearse sin él, pero conviene tenerlo antes de generar sesiones reales.

**Independent Test**: Importar los festivos del año siguiente, confirmar la lista, agregar un día sin tutoría a mano y verificar que un módulo nuevo no genera sesiones en esas fechas.

**Acceptance Scenarios**:

1. **Given** el CAE en el calendario de festivos, **When** elige un año e importa, **Then** ve la lista de festivos obtenida (fecha y nombre), marcando cuáles ya existen, y puede confirmar o descartar la importación.
2. **Given** una importación confirmada, **When** se repite para el mismo año, **Then** no se duplican fechas ya registradas.
3. **Given** el servicio externo caído, lento o con respuesta inválida, **When** el CAE importa, **Then** se le informa que no se pudo obtener la lista y puede registrar los festivos a mano; nada se guarda a medias.
4. **Given** el CAE, **When** agrega un festivo a mano con fecha y nombre, **Then** queda en el calendario; una fecha repetida se rechaza.
5. **Given** un festivo que cae en el rango de sesiones ya generadas y futuras, **When** el CAE lo registra, **Then** esas sesiones futuras quedan canceladas con el motivo "festivo", se registra el evento para avisar a los inscritos, y ni las sesiones pasadas ni las de módulos de un periodo Cerrado cambian.
6. **Given** un festivo con sesiones canceladas por él, **When** el CAE lo elimina (borrado lógico), **Then** esas sesiones futuras vuelven a programadas, siempre que sigan sin cruce de salón o docente.
7. **Given** un festivo en una fecha pasada, **When** el CAE intenta editarlo o eliminarlo, **Then** se bloquea explicando que ya pasó.
8. **Given** una fecha anterior a hoy, **When** el CAE intenta registrar un festivo en ella, **Then** se rechaza explicando que ya pasó; y **When** importa los festivos de un año en curso, **Then** las fechas pasadas aparecen marcadas y no se pueden seleccionar.

---

### Edge Cases

- ¿Qué pasa si el periodo se cierra (manual o automáticamente) mientras el CAE edita? El guardado se rechaza con la regla del periodo cerrado y el formulario no pierde lo escrito.
- ¿Qué pasa si dos administradores asignan el mismo salón o docente a la misma hora a la vez? Solo uno se guarda; el otro recibe el rechazo por cruce (la validación no puede depender de la pantalla).
- ¿Qué pasa si el salón de un módulo se desactiva o elimina después? La configuración ya lo bloquea cuando hay módulos en el periodo activo (spec 006); en periodos Próximos el módulo conserva el salón y debe reasignarse antes de usarse, y el listado lo marca.
- ¿Qué pasa con el cambio de hora de verano o zonas horarias? Bogotá no usa horario de verano; la hora local del horario semanal se convierte siempre a UTC de forma constante.
- ¿Qué pasa si el periodo es más corto que una semana o el día elegido no aparece en él? El módulo se guarda sin sesiones para ese día y el sistema avisa de que no hay sesiones generadas.
- ¿Qué pasa si el docente de un módulo se desactiva o elimina después de asignarse? Desactivarlo no se bloquea; el módulo se marca como "docente no disponible" en el listado y el detalle (igual que un salón inactivo) para que el CAE lo reasigne, y sus sesiones futuras se conservan.
- ¿Qué pasa si el horario cruza la medianoche? No se permite: inicio y fin deben estar en el mismo día.
- ¿Qué pasa si una persona sin rol CAE intenta cualquiera de estas acciones? El servidor responde con acceso denegado, aunque la pantalla esté oculta.
- ¿Qué pasa con el cupo si se cambia la capacidad de un salón (spec 006)? Se bloquea mientras haya módulos en el periodo activo con más inscritos que la nueva capacidad; el cupo del módulo siempre se lee de la capacidad actual del salón.
- ¿Qué pasa si un festivo se elimina y el salón o el docente ya fueron ocupados por otro módulo en esa fecha? La sesión no se restaura y el CAE ve cuáles quedaron sin restaurar y por qué.
- ¿Qué pasa con las sesiones futuras de un periodo cerrado antes de su fecha de fin cuando se registra o elimina un festivo? No cambian: los módulos de un periodo Cerrado son de solo lectura (FR-015), también frente a los festivos.
- ¿Qué pasa si el servicio externo devuelve festivos de otro año o fechas fuera de un periodo? Se muestran en la vista previa del año elegido; los que no caen en ningún periodo se guardan igual y se aplican cuando exista un periodo que los cubra.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Solo el rol CAE (SUPERADMIN) MUST poder crear, editar, eliminar y reasignar módulos; el servidor MUST rechazar a cualquier otro rol en cada operación.
- **FR-002**: Un módulo MUST pertenecer a un periodo Próximo o Activo, y tener nombre, descripción opcional, docente, salón y al menos un horario semanal.
- **FR-003**: Un horario semanal MUST definir día de la semana, hora de inicio y hora de fin en hora de Bogotá, con la fin posterior al inicio y en el mismo día. El horario MUST quedar dentro de la franja configurada, por defecto de 06:00 a 18:00 (inicio no anterior a 06:00 y fin no posterior a 18:00); fuera de ella se rechaza indicando la franja (D-089). Un módulo MAY tener varios horarios semanales y estos no pueden solaparse entre sí.
- **FR-004**: Al crear un módulo, el sistema MUST generar una sesión por cada ocurrencia semanal de cada horario, de la fecha de inicio a la de fin del periodo, guardadas en UTC.
- **FR-005**: Si el periodo ya está en curso, el sistema MUST generar solo las sesiones que aún no han comenzado.
- **FR-005a**: Al generar o regenerar sesiones, el sistema MUST omitir las fechas registradas como festivo.
- **FR-022**: El CAE MUST poder agregar, editar y eliminar (borrado lógico) festivos con fecha y nombre; la fecha es única entre festivos no eliminados y no se pueden registrar, editar ni eliminar festivos con fecha anterior a hoy (en `America/Bogota`).
- **FR-023**: El CAE MUST poder importar los festivos de un año desde un servicio público externo, ver una vista previa y confirmar antes de guardar; la importación no duplica fechas existentes y muestra las fechas pasadas marcadas y no seleccionables. Los festivos importados se guardan en el sistema y la generación de sesiones nunca consulta el servicio externo.
- **FR-024**: Si el servicio externo falla, tarda más de 10 segundos o responde algo inválido, el sistema MUST informarlo sin guardar nada parcial, y el registro manual debe seguir disponible.
- **FR-025**: Al registrar un festivo, las sesiones futuras de esa fecha MUST quedar canceladas con el motivo "festivo" y dejar registrado el evento para notificar a los inscritos (FR-021); al eliminarlo, se restauran las que sigan sin cruces. Ambas operaciones ignoran los módulos de periodos Cerrados (FR-015).
- **FR-026**: Solo el CAE MUST poder administrar festivos; el servidor rechaza a los demás roles.
- **FR-027**: El listado y el detalle MUST marcar los módulos cuyo docente o salón dejó de estar disponible (inactivo o eliminado) después de asignarse, sin bloquear la desactivación del docente ni del salón fuera de las reglas de la spec 006, y sin perder las sesiones futuras.
- **FR-006**: El sistema MUST rechazar un módulo, una edición de horario, un cambio de docente o un cambio de salón que haga que el docente o el salón tengan dos módulos con horarios solapados en el mismo periodo, indicando con qué módulo y horario se cruza. Dos horarios que se tocan en el límite exacto no se solapan.
- **FR-007**: El sistema MUST validar los cruces de FR-006 de forma que dos operaciones simultáneas no puedan guardar ambas un cruce.
- **FR-008**: El cupo de un módulo MUST ser siempre la capacidad actual de su salón y no se edita a mano.
- **FR-009**: Solo MAY asignarse docentes activos (no desactivados ni eliminados) y salones con estado Activo y no eliminados.
- **FR-010**: El cambio de salón MUST bloquearse si la capacidad del nuevo salón es menor que la cantidad de inscritos activos del módulo, mostrando ambos números; si es mayor o igual, el cupo pasa a la nueva capacidad y las sesiones futuras usan el nuevo salón, mientras las pasadas conservan el salón en que se dictaron.
- **FR-011**: El cambio de docente MUST aplicarse al módulo y a todas sus sesiones futuras, conservando las pasadas con el docente que las dictó.
- **FR-012**: Un módulo MUST editarse en nombre y descripción en cualquier momento, salvo en periodo Cerrado.
- **FR-013**: Cambiar los horarios semanales MUST permitirse solo si el módulo no tiene inscritos activos; las sesiones futuras se regeneran y las pasadas se conservan. Con inscritos, la acción se bloquea mostrando la regla.
- **FR-014**: Eliminar un módulo MUST permitirse solo sin inscritos activos, de forma lógica (`deletedAt`), y libera docente y salón en esos horarios.
- **FR-015**: Los módulos de un periodo Cerrado MUST ser de solo lectura: el servidor rechaza crear, editar, reasignar o eliminar, y la app explica el motivo. Esto incluye los efectos de los festivos: registrar o eliminar un festivo no cancela, restaura ni genera sesiones de módulos de un periodo Cerrado.
- **FR-016**: El listado MUST mostrar los módulos por periodo (por defecto el activo), con búsqueda por nombre y filtros por docente y salón, excluyendo los eliminados.
- **FR-017**: El detalle MUST mostrar los datos del módulo, sus horarios semanales, cupo, inscritos y la lista de sesiones con fecha y hora en `America/Bogota` y su estado.
- **FR-018**: El sistema MUST completar las comprobaciones de uso que la configuración (spec 006) dejó pendientes: un salón con módulos en el periodo activo no se desactiva ni elimina ni baja su capacidad por debajo de los inscritos, y un periodo con módulos no se elimina.
- **FR-019**: Toda acción bloqueada MUST mostrar al usuario la regla que la bloquea.
- **FR-020**: Todos los textos visibles y los mensajes de error MUST estar en español e inglés.
- **FR-021**: Los cambios de docente, salón o cancelación de un módulo MUST dejar registrado el evento para que la funcionalidad de notificaciones avise a los inscritos; el envío en sí no pertenece a esta funcionalidad.

### Key Entities *(include if feature involves data)*

- **Módulo**: tutoría de un periodo académico. Tiene nombre, descripción, docente, salón, horarios semanales y cupo derivado de la capacidad del salón. Se elimina de forma lógica.
- **Horario semanal**: día de la semana y franja horaria local (inicio y fin) en la que se repite el módulo. Un módulo puede tener varios.
- **Sesión**: cada ocurrencia semanal de un módulo, con fecha y hora concretas en UTC, docente y salón vigentes y estado (programada, reprogramada o cancelada). Conserva su fecha original para trazabilidad.
- **Festivo**: fecha de calendario con nombre y origen (importado o manual) en la que no se dictan tutorías. Es global, no pertenece a un periodo. Se elimina de forma lógica.
- **Periodo académico** (existente, spec 006): define el rango de fechas de las sesiones y si el módulo se puede modificar.
- **Salón** (existente, spec 006): su capacidad define el cupo.
- **Docente** (existente, spec 001): debe estar activo para ser asignado.
- **Inscripción** (futura, spec 011): aquí solo se cuenta; mientras no exista, los inscritos de todo módulo son cero.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El CAE crea un módulo completo (datos, docente, salón y un horario semanal) en menos de 2 minutos.
- **SC-002**: El 100 % de los intentos de asignar un docente o salón con horario solapado se rechazan, incluso con dos peticiones simultáneas.
- **SC-003**: Todo módulo creado tiene exactamente una sesión por cada ocurrencia semanal de su horario dentro del periodo (y sin las ya pasadas en periodos en curso), verificable contando fechas.
- **SC-004**: El 100 % de los cambios de salón a uno con capacidad inferior a los inscritos se bloquean, y el mensaje muestra las dos cifras.
- **SC-005**: El 100 % de los intentos de crear, editar o eliminar módulos de un periodo Cerrado se rechazan.
- **SC-006**: El 100 % de las acciones de módulos hechas por docentes o estudiantes reciben acceso denegado.
- **SC-007**: Al menos 9 de cada 10 personas del CAE que prueben el flujo entienden por qué una acción se bloquea sin ayuda adicional.
- **SC-008**: Cada hora de sesión mostrada coincide con la hora de Bogotá configurada en el horario, sin desfases.
- **SC-009**: Ningún módulo tiene sesiones programadas en una fecha registrada como festivo.
- **SC-010**: El CAE importa y confirma los festivos de un año en menos de 1 minuto, y si el servicio externo no responde puede registrarlos a mano sin perder lo hecho.

## Assumptions

- Esta funcionalidad es solo del CAE. La vista de módulos para estudiantes y docentes, la inscripción, las cancelaciones y las reprogramaciones por sesión llegan en las specs 011 y 012.
- El módulo pertenece a un solo periodo y no se mueve entre periodos; para pasarlo a otro se crea uno nuevo.
- El cruce de horarios se valida dentro del mismo periodo, porque los periodos no se solapan entre sí (D-072).
- Un módulo puede tener varios horarios semanales, como ya prevé `docs/Architecture.md`.
- El CAE solo cambia horarios semanales de módulos sin inscritos; para cambiar la hora de una sola sesión o de las futuras con inscritos se usa la reprogramación del docente (spec 012), que valida disponibilidad. Es una decisión de alcance que debe registrarse en `docs/Decisions.md`.
- El estado de una sesión nace "programada"; "cancelada" se usa aquí solo por festivo, y "reprogramada" y las demás cancelaciones llegan con las specs siguientes.
- Los festivos son del país (Colombia) y valen para todos los periodos y módulos; no hay festivos por sede ni por módulo. La pantalla de festivos vive en la configuración del CAE, junto a periodos y salones.
- El servicio externo de festivos es solo una fuente de datos: se envía únicamente el año y el país, nunca datos de personas, y su disponibilidad no es requisito para operar.
- Las notificaciones a inscritos por cambio de docente o salón no se envían aquí porque aún no existe el canal (spec 013); solo se deja registrado el evento (FR-021). Como hasta la spec 011 no hay inscritos, nadie queda sin aviso; la inscripción no se publica sin las notificaciones (spec 013) o sin un consumidor de esos eventos, para cumplir el Principio II de la constitución (D-087).
- No hay límite de módulos por periodo ni de longitud de nombre más allá de lo razonable para la pantalla.
- Reutiliza la configuración existente: periodos, ubicaciones y salones (spec 006), docentes (spec 001) y el sistema de diseño, componentes e íconos del proyecto.
