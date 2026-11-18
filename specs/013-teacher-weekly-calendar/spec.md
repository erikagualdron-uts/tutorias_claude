# Feature Specification: Calendario semanal del docente

**Feature Branch**: `013-teacher-weekly-calendar`

**Created**: 2026-11-18

**Status**: Draft

**Input**: User description: "para el calendario con el número 013" — el cronograma del docente debe tener un calendario semanal por defecto, donde se vean sus módulos en los días de la semana, y debajo las tarjetas de las próximas tutorías.

## Clarifications

### Session 2026-11-18

- Q: ¿Qué debe ver el docente en el calendario al abrirlo: la franja de 7 días con la línea de tiempo del día elegido, o la semana completa en 7 columnas? → A: Ambas, con un selector Día/Semana; abre en Día en el teléfono y en Semana en tableta (como indica `Design.md`).
- Q: ¿Las tarjetas de debajo del calendario muestran siempre las próximas sesiones desde ahora o cambian según la semana o el día visto? → A: Siempre las próximas sesiones desde ahora, sin importar la semana que se esté viendo.
- Q: ¿Qué horas muestra la línea de tiempo del día: solo el horario permitido o las 24 horas? → A: Solo el horario permitido de la configuración (hoy 6:00 a. m. a 6:00 p. m.); si una sesión cae fuera, se amplía el rango para mostrarla.
- Q: ¿En qué orden va la pantalla del docente? → A: Calendario, luego las tarjetas de próximas sesiones y al final el resumen de módulos con su filtro.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver mi semana de un vistazo (Priority: P1)

El docente abre su cronograma y ve, arriba, el calendario de la semana actual: el rango de la semana, una franja con los siete días (con una marca en los que tienen sesiones) y, del día elegido, las sesiones ordenadas por hora con módulo, horas, salón y número de inscritos. Hoy aparece seleccionado al abrir. Debajo del calendario siguen las tarjetas de sus próximas sesiones.

**Why this priority**: Es lo que `Context.md` §4.2 promete ("calendario semanal con sus tutorías: hora, salón y cantidad de estudiantes") y lo que hoy falta: el cronograma actual es solo una lista.

**Independent Test**: Con un docente que dicta dos módulos en días distintos, iniciar sesión como docente y comprobar que la semana actual muestra la marca en esos dos días, que al tocar cada día se ven sus sesiones con la hora y el salón correctos, y que debajo están las tarjetas de las próximas sesiones.

**Acceptance Scenarios**:

1. **Given** un docente con módulos en el periodo Activo, **When** abre su cronograma, **Then** ve la semana actual con el día de hoy seleccionado, una marca en cada día que tiene sesiones y las sesiones de hoy ordenadas por hora.
2. **Given** el calendario abierto, **When** el docente toca otro día de la franja, **Then** ve las sesiones de ese día y el día queda resaltado.
3. **Given** un día sin sesiones, **When** el docente lo selecciona, **Then** ve un estado vacío que dice que no hay sesiones ese día.
4. **Given** el calendario, **When** el docente ve las tarjetas de debajo, **Then** son sus próximas sesiones ordenadas por fecha y las puede abrir igual que antes.
5. **Given** el día de hoy seleccionado, **When** la hora actual cae dentro del horario mostrado, **Then** una línea marca la hora actual en Bogotá; en otros días no aparece.
6. **Given** un docente sin módulos en el periodo Activo, **When** abre su cronograma, **Then** ve el calendario sin marcas y un estado vacío que lo explica.

---

### User Story 2 - Moverme entre semanas (Priority: P1)

El docente avanza o retrocede de semana con flechas y vuelve a la actual con el botón "Hoy". La navegación se limita a las fechas del periodo académico Activo; fuera de él ve "Fuera del periodo académico".

**Why this priority**: Un calendario que solo muestra la semana actual no sirve para planear ni para revisar lo ya dictado.

**Independent Test**: Avanzar y retroceder semanas hasta los extremos del periodo, comprobar que más allá no se puede avanzar y que "Hoy" regresa a la semana actual con hoy seleccionado.

**Acceptance Scenarios**:

1. **Given** el calendario en la semana actual, **When** el docente toca la flecha siguiente, **Then** ve la semana siguiente con su rango y sus sesiones, y ningún día seleccionado queda fuera de esa semana.
2. **Given** una semana distinta de la actual, **When** toca "Hoy", **Then** vuelve a la semana actual con hoy seleccionado.
3. **Given** la primera o la última semana del periodo, **When** intenta ir más allá, **Then** la flecha no avanza y se le dice que está fuera del periodo académico.
4. **Given** una semana pasada, **When** la consulta, **Then** ve las sesiones que se dictaron o se cancelaron, en solo lectura.

---

### User Story 3 - Ver el estado de cada sesión en el calendario (Priority: P1)

Cada sesión en el calendario muestra su estado: programada, reprogramada (con la nueva hora y la original) o cancelada (visible, tachada, con su motivo: festivo o docente). El estado se entiende por texto e ícono, no solo por color.

**Why this priority**: El docente reprograma y cancela (spec 012); el calendario debe reflejar de inmediato lo que cambió.

**Independent Test**: Reprogramar una sesión, cancelar otra y comprobar que el calendario las muestra con su estado, en la hora nueva la reprogramada, sin recargar manualmente.

**Acceptance Scenarios**:

1. **Given** una sesión reprogramada, **When** la ve en el calendario, **Then** aparece en su nueva hora con la insignia "Reprogramada" y la hora original.
2. **Given** una sesión cancelada por festivo o por el docente, **When** la ve, **Then** sigue visible, tachada, con la insignia y el motivo.
3. **Given** que el docente reprograma una sesión a otro día de la misma semana, **When** vuelve al calendario, **Then** la sesión ya no está en el día original y aparece en el nuevo.
4. **Given** un periodo Cerrado, **When** el docente consulta sus semanas, **Then** las ve en solo lectura.

---

### User Story 4 - Abrir una sesión desde el calendario (Priority: P2)

El docente toca una sesión del calendario y se abre la misma hoja de detalle y acciones de la spec 012 (reprogramar, cancelar, restaurar, con sus bloqueos explicados). No hay una segunda forma de cambiar sesiones.

**Why this priority**: Une el calendario con lo ya construido sin duplicar reglas; es valioso, pero el calendario ya sirve para ver sin esto.

**Independent Test**: Tocar una sesión programada a más de 2 horas y ver las acciones; tocar una que empieza en menos de 2 horas y ver el bloqueo con su regla.

**Acceptance Scenarios**:

1. **Given** una sesión del calendario, **When** el docente la toca, **Then** se abre la hoja con sus datos y las acciones que las reglas permiten.
2. **Given** una sesión que ya no se puede cambiar, **When** la abre, **Then** no se ofrecen acciones y un aviso indica la regla que lo bloquea.
3. **Given** un cambio confirmado en la hoja, **When** se cierra, **Then** el calendario y las tarjetas de debajo muestran el resultado.

---

### User Story 5 - Cambiar entre la vista Día y la vista Semana (Priority: P2)

El docente cambia con un selector entre **Día** (franja de días y línea de tiempo del día elegido) y **Semana** (siete columnas con los bloques de todos los días). Abre en Día en el teléfono y en Semana en tableta.

**Why this priority**: Es la mejor forma de ver toda la semana a la vez en pantallas anchas, pero el calendario ya es útil con la vista Día.

**Independent Test**: En un teléfono y en una ventana ancha, comprobar la vista inicial, cambiar de vista y navegar semanas con la elegida.

**Acceptance Scenarios**:

1. **Given** un teléfono, **When** el docente abre el cronograma, **Then** la vista inicial es Día; **Given** una tableta o ventana ancha, **Then** es Semana.
2. **Given** la vista Semana, **When** el docente la ve, **Then** hay siete columnas, una por día, con bloques compactos (hora y salón), y puede desplazarse horizontalmente.
3. **Given** una vista elegida, **When** navega a otra semana o toca "Hoy", **Then** se conserva la vista.
4. **Given** la vista Semana, **When** toca un bloque, **Then** se abre la misma hoja de acciones.

---

### Edge Cases

- ¿Qué pasa con dos sesiones del docente a la misma hora? No ocurre: el sistema rechaza el cruce de docente (spec 010); si hubiera datos antiguos, se muestran apiladas sin taparse.
- ¿Qué pasa con una sesión que cruza el límite de un día en UTC? Se ubica por su fecha y hora de Bogotá, nunca por la de UTC.
- ¿Qué pasa si hoy cae fuera del periodo Activo (antes de empezar o después de terminar)? El calendario abre en la semana del periodo más cercana a hoy y no muestra la línea de hora actual.
- ¿Qué pasa si hay un festivo en la semana? Las sesiones de ese día aparecen canceladas con el motivo festivo; el día conserva su marca.
- ¿Qué pasa si se pierde la conexión al cambiar de semana? Ve el error con la opción de reintentar; la semana anterior no se muestra como si fuera la nueva.
- ¿Qué pasa si cambia el día mientras el docente tiene la app abierta (pasa la medianoche)? "Hoy" se recalcula al volver a la pantalla.
- ¿Qué pasa con nombres de módulo largos o fuente grande? El texto se acorta con puntos suspensivos en el bloque y se ve completo en la hoja de detalle; nada queda fuera de pantalla.
- ¿Qué pasa con un docente con muchas sesiones el mismo día? El día se desplaza verticalmente sin perder la cabecera del calendario.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El cronograma del docente MUST abrir con un calendario semanal: encabezado con el rango de la semana, flechas de semana anterior y siguiente, botón "Hoy" y una franja de siete días (lunes a domingo, hora de Bogotá) con una marca en los días que tienen sesiones.
- **FR-002**: Al abrir, el calendario MUST mostrar la semana actual con el día de hoy seleccionado; el día seleccionado y el día de hoy MUST distinguirse entre sí y de los demás sin depender solo del color.
- **FR-003**: Al seleccionar un día, el calendario MUST mostrar las sesiones de ese día ordenadas por hora, cada una con rango de horas, módulo, salón y número de inscritos; un día sin sesiones MUST mostrar un estado vacío que lo dice.
- **FR-017**: Las vistas Día y Semana MUST mostrar las horas del horario permitido de la configuración (hoy 6:00 a. m. a 6:00 p. m., D-089), sin escribir esas horas en el código; si una sesión cae fuera de ese rango, el rango MUST ampliarse para mostrarla completa.
- **FR-004**: En el día de hoy, el calendario MUST mostrar una línea con la hora actual de Bogotá cuando esa hora cae dentro del horario mostrado.
- **FR-005**: Cada sesión MUST mostrar su estado como texto e ícono: programada, reprogramada (con la nueva hora y la original) o cancelada (visible, tachada, con su motivo: festivo o docente).
- **FR-006**: La navegación de semanas MUST limitarse a las fechas del periodo académico Activo; fuera de ellas MUST mostrar "Fuera del periodo académico" y no avanzar. "Hoy" MUST volver a la semana actual con hoy seleccionado.
- **FR-007**: Las semanas pasadas MUST mostrar las sesiones dictadas y las canceladas en solo lectura; los periodos Cerrados MUST verse siempre en solo lectura.
- **FR-018**: La pantalla del cronograma MUST ordenarse así, de arriba abajo: calendario, tarjetas de próximas sesiones y, al final, el resumen de módulos con su filtro de la spec 012.
- **FR-008**: Debajo del calendario MUST seguir la lista de tarjetas de las próximas sesiones del docente desde el momento actual, con el mismo contenido y comportamiento de la spec 012. Las tarjetas MUST NOT cambiar al navegar semanas o seleccionar días en el calendario.
- **FR-009**: Tocar una sesión del calendario o una tarjeta MUST abrir la hoja de detalle y acciones de la spec 012, con las mismas reglas, bloqueos y mensajes; el calendario MUST NOT ofrecer otra vía de cambiar sesiones.
- **FR-010**: Tras reprogramar, cancelar o restaurar, el calendario y las tarjetas MUST reflejar el resultado sin que el docente recargue a mano.
- **FR-011**: El docente MUST ver solo sus propias sesiones; las de otro docente nunca se muestran. Los permisos se aplican en el servidor.
- **FR-012**: Las horas, los días y el rango de la semana MUST mostrarse en `America/Bogota` y con el formato del idioma del dispositivo; la semana empieza el lunes.
- **FR-013**: Los cuatro estados de pantalla (cargando, error con reintento, vacío, con datos) MUST estar cubiertos, incluido el cambio de semana.
- **FR-014**: Todos los textos MUST estar en español e inglés; los controles táctiles MUST medir al menos 48 px; las animaciones MUST respetar "reducir movimiento"; la pantalla MUST ser legible en modo oscuro y con fuente grande.
- **FR-016**: El calendario MUST ofrecer un selector **Día / Semana**. **Día** muestra la franja de siete días y las sesiones del día elegido; **Semana** muestra siete columnas, una por día, con bloques compactos (hora y salón) y desplazamiento horizontal. Abre en **Día** en teléfonos y en **Semana** en tabletas; el docente puede cambiar de vista y la vista elegida se conserva mientras navega semanas. Las flechas, "Hoy", los estados, el límite del periodo y la apertura de la hoja de acciones funcionan igual en ambas vistas.
- **FR-015**: El calendario MUST construirse como un componente reutilizable, pensado para que el estudiante y el CAE lo adopten después, aunque en esta funcionalidad solo lo usa el docente.

### Key Entities

- **Semana visible**: lunes a domingo (Bogotá) que el docente está viendo; siempre dentro del periodo Activo.
- **Sesión en calendario**: una sesión del docente (spec 010) con su fecha, hora de inicio y fin, módulo, salón, inscritos y estado.
- **Marca de día**: indicador de que un día tiene al menos una sesión (programada, reprogramada o cancelada).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El docente responde "¿qué día y a qué hora tengo mi próxima tutoría?" en menos de 10 segundos desde que abre el cronograma.
- **SC-002**: Al cambiar de semana, las sesiones de la nueva semana se ven en menos de 2 segundos en condiciones normales de red.
- **SC-003**: El 100 % de las sesiones reprogramadas o canceladas aparecen en el día y hora correctos, con su estado, en la siguiente vista del calendario.
- **SC-004**: En una revisión con docentes, al menos 9 de 10 distinguen sin ayuda el día de hoy, el día seleccionado y el estado de cada sesión.
- **SC-005**: El 100 % de los intentos de ver sesiones de otro docente son rechazados.
- **SC-006**: Todos los textos aparecen traducidos en español e inglés, y en modo oscuro y con fuente grande no hay cortes ni textos fuera de pantalla.

## Assumptions

- Depende de las specs 001 (roles), 006 (periodos), 010 (módulos, sesiones y festivos), 011 (inscripciones) y 012 (cronograma del docente, hoja de acciones y estados de sesión).
- Las dos vistas (Día y Semana) son las de `Design.md`, "Weekly schedule (all roles)". El tamaño que separa teléfono de tableta lo define `/speckit-plan`.
- Deben poder consultarse las sesiones de cualquier semana del periodo Activo (pasadas y futuras); hoy el cronograma solo trae las próximas, por lo que esta funcionalidad puede requerir consultar por rango de fechas. Es un detalle de diseño para `/speckit-plan`.
- Se mantienen las reglas de la spec 012: límite de 2 horas en configuración, solo lectura en periodos Cerrados, alcance de "solo esta sesión" o "esta y las futuras".
- Los colores, bloques, insignias y tamaños salen de `Design.md`; no se agregan colores nuevos.
- Esta spec toma el número 013. La spec de notificaciones, que la spec 012 y D-087 llaman "013", pasa a ser la **014**; esas referencias se actualizan en `docs/` al cerrar esta funcionalidad.
- El calendario para el estudiante y para el CAE queda como funcionalidades aparte.
