# Feature Specification: Cronograma semanal del estudiante

**Feature Branch**: `021-student-schedule`

**Created**: 2026-11-22

**Status**: Implemented

**Input**: User description: "El horario de los estudiantes. La pestaña Cronograma (Schedule) del estudiante no está desarrollada: muestra una pantalla vacía. Debe ser el calendario semanal de solo lectura con las tutorías en las que está inscrito, como ya lo tiene el docente."

## Estado de partida (revisión del 2026-11-22)

| Qué ya existe | Dónde |
|---|---|
| Cronograma del docente: calendario semanal (Día y Semana), tarjetas de próximas sesiones, hoja de detalle y acciones | specs 012 y 013 |
| Componente de calendario reutilizable por el estudiante y el CAE | spec 013, `src/components/calendar/` |
| Inscripciones del estudiante, sus sesiones omitidas y la vigencia de una inscripción cancelada | specs 011 y 016 |
| Estados de una sesión: programada, reprogramada, cancelada por festivo o por el docente | specs 010, 012 y 013 |
| Detalle de un módulo para el estudiante, con sus sesiones y la cancelación | spec 011 |
| Pestaña "Cronograma" en la navegación del estudiante, sin contenido | D-042 |

| Qué falta | |
|---|---|
| El calendario semanal del estudiante: ver en una semana todas sus tutorías, con su estado | |

El cronograma del docente ya está construido; esta spec solo agrega el del estudiante.

## Clarifications

### Session 2026-11-22

- Q: ¿El estudiante puede cambiar algo desde el calendario? → A: No; es de solo lectura (`Design.md`: "keep student schedules read-only"). Cancelar una sesión sigue en el detalle del módulo.
- Q: ¿Qué incluye el alcance? → A: El cronograma del estudiante. El del docente ya existe y el del CAE queda fuera.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver mi semana de tutorías (Priority: P1)

El estudiante abre "Cronograma" y ve un calendario semanal con las tutorías de los módulos en los que está inscrito: cada una con su hora, el módulo, el salón y el docente. Puede ver un día o la semana completa.

**Why this priority**: Es lo que `Context.md` §4.3 promete ("cronograma semanal de solo lectura") y hoy la pestaña está vacía; sin esto el estudiante tiene que abrir módulo por módulo para saber cuándo le toca.

**Independent Test**: Con un estudiante inscrito en dos módulos con sesiones esta semana, abrir "Cronograma" y comprobar que cada sesión aparece en su día y hora con módulo, salón y docente, y que una sesión de un módulo en el que no está inscrito no aparece.

**Acceptance Scenarios**:

1. **Given** un estudiante inscrito en módulos con sesiones esta semana, **When** abre "Cronograma", **Then** ve la semana actual con el día de hoy seleccionado y las sesiones de ese día ordenadas por hora.
2. **Given** el calendario abierto, **When** el estudiante ve una sesión, **Then** muestra el rango de horas, el módulo, el salón y el nombre del docente.
3. **Given** el calendario abierto, **When** mira el encabezado, **Then** ve el rango de la semana, las flechas de semana anterior y siguiente, el botón "Hoy" y una franja de siete días (lunes a domingo, hora de Bogotá) con una marca en los días que tienen sesiones.
4. **Given** un teléfono, **When** abre el cronograma, **Then** ve la vista **Día**; en una tableta ve la vista **Semana**; puede cambiar de vista y la elección se mantiene al navegar.
5. **Given** que hoy tiene sesiones y la hora actual cae dentro del horario mostrado, **When** mira el día de hoy, **Then** ve una línea con la hora actual.
6. **Given** un día sin sesiones, **When** lo selecciona, **Then** ve un mensaje que dice que no hay tutorías ese día.
7. **Given** un estudiante sin inscripciones, **When** abre "Cronograma", **Then** ve un estado vacío que lo invita a explorar módulos.

---

### User Story 2 - Entender el estado de cada sesión (Priority: P1)

Cada sesión del calendario muestra su estado: programada, reprogramada (con la hora nueva y la original), cancelada por festivo, cancelada por el docente o cancelada por el propio estudiante. Así sabe qué se dicta, qué cambió y qué no.

**Why this priority**: Un cronograma que muestra una hora equivocada o esconde un cambio es peor que ninguno; los cambios del docente y los festivos son frecuentes.

**Independent Test**: Con una sesión programada, una reprogramada, una cancelada por festivo, una cancelada por el docente y una que el estudiante omitió, abrir la semana y comprobar el estado de cada una.

**Acceptance Scenarios**:

1. **Given** una sesión reprogramada, **When** se ve en el calendario, **Then** aparece en su hora nueva con la etiqueta "Reprogramada" y la hora original.
2. **Given** una sesión cancelada por festivo o por el docente, **When** se ve, **Then** sigue visible, tachada, con su motivo (festivo o docente).
3. **Given** una sesión que el estudiante canceló solo para sí, **When** se ve, **Then** sigue visible, tachada, con la etiqueta "Cancelada por ti".
4. **Given** cualquier sesión, **When** se muestra, **Then** su estado va escrito con texto y un ícono, nunca solo con color, y un lector de pantalla lee módulo, horas, salón, docente y estado.
5. **Given** un módulo en el que canceló toda su inscripción con una fecha de vigencia, **When** mira las semanas, **Then** ve sus sesiones hasta esa fecha y ninguna después.
6. **Given** una sesión reprogramada o cancelada por el docente, **When** el estudiante abre el calendario, **Then** ve el cambio sin tener que cerrar sesión.

---

### User Story 3 - Moverme entre semanas del periodo (Priority: P2)

El estudiante navega a semanas anteriores y siguientes dentro del periodo académico, vuelve a la semana actual con "Hoy" y, si intenta salirse del periodo, se le explica el límite.

**Why this priority**: Planear la semana próxima o repasar lo que ya pasó es el segundo uso más común; la lectura de la semana actual no lo necesita.

**Independent Test**: Con un periodo activo, avanzar y retroceder semanas hasta los límites, comprobar el mensaje al intentar salirse y que "Hoy" vuelve a la semana actual.

**Acceptance Scenarios**:

1. **Given** el calendario en la semana actual, **When** toca la flecha siguiente o anterior, **Then** cambia de semana y ve las sesiones de esa semana.
2. **Given** la última semana del periodo, **When** toca la flecha siguiente, **Then** la flecha se ve deshabilitada y al tocarla dice "Fuera del periodo académico" sin avanzar.
3. **Given** una semana distinta de la actual, **When** toca "Hoy", **Then** vuelve a la semana actual con hoy seleccionado.
4. **Given** una semana pasada, **When** la abre, **Then** ve las sesiones que se dictaron y las canceladas, en solo lectura.
5. **Given** que no hay periodo activo, **When** abre el cronograma, **Then** ve el último periodo cerrado en solo lectura, o un estado vacío si nunca hubo uno.
6. **Given** que la primera semana todavía carga, **When** se muestran las flechas, **Then** esperan a que se conozca el periodo.

---

### User Story 4 - Abrir el módulo de una sesión (Priority: P2)

Al tocar una sesión, el estudiante abre el detalle de su módulo, donde ya puede ver todas sus sesiones y cancelar según las reglas de siempre. El calendario en sí no ofrece ninguna acción de cambio.

**Why this priority**: Conecta el cronograma con lo que el estudiante ya sabe hacer, sin duplicar reglas; el calendario sigue siendo útil sin esto.

**Independent Test**: Tocar una sesión y comprobar que abre el detalle de su módulo; comprobar que el calendario no muestra botones de cancelar ni de reprogramar.

**Acceptance Scenarios**:

1. **Given** una sesión en el calendario, **When** el estudiante la toca, **Then** abre el detalle del módulo de esa sesión.
2. **Given** el calendario, **When** el estudiante lo revisa, **Then** no ve acciones de cancelar, restaurar ni reprogramar.
3. **Given** el detalle del módulo abierto desde una sesión cancelada por el estudiante, **When** vuelve atrás, **Then** el calendario conserva la semana y el día que miraba.

---

### Edge Cases

- Sin inscripciones: estado vacío con invitación a explorar módulos, no un calendario en blanco.
- Semana sin sesiones: el calendario se ve, con el mensaje de día sin tutorías en cada día.
- Festivo que cancela sesiones de varios módulos a la vez: todas se ven tachadas con el motivo "festivo".
- Sesión reprogramada a otro día de la misma semana: aparece en el día nuevo, no en el original.
- Inscripción cancelada con vigencia: las sesiones anteriores a esa fecha siguen apareciendo; las posteriores, no.
- Cuenta del estudiante desactivada o eliminada: no ve el cronograma (la sesión ya se cerró).
- Una sesión fuera del horario permitido por la configuración: el rango visible se amplía para mostrarla completa.
- Falla la carga de una semana: se explica con un mensaje y un botón "Reintentar", sin perder la semana ni el día elegidos.
- Cambio de hora o de día de una sesión mientras el calendario está abierto: se ve al volver a la pestaña o al refrescar.
- Fechas en UTC en la base y mostradas en `America/Bogota`; la semana va de lunes a domingo en Bogotá.
- Idioma del dispositivo en español o inglés: todos los textos, los días y los estados en ese idioma.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pestaña "Cronograma" del estudiante MUST mostrar un calendario semanal con el encabezado del rango de la semana, las flechas de semana anterior y siguiente, el botón "Hoy" y una franja de siete días (lunes a domingo, hora de Bogotá) con una marca en los días que tienen sesiones.
- **FR-002**: Al abrir, el calendario MUST mostrar la semana actual con el día de hoy seleccionado, y el día seleccionado y el de hoy MUST distinguirse entre sí y de los demás sin depender solo del color.
- **FR-003**: El calendario MUST mostrar únicamente las sesiones de los módulos en los que el estudiante asiste, según las reglas de asistencia que ya existen: inscripción vigente o cancelada con sesiones anteriores a su fecha de vigencia; las sesiones que omitió solo para sí se muestran como canceladas por él (FR-006).
- **FR-004**: Cada sesión MUST mostrar el rango de horas, el módulo, el salón y el nombre del docente, ordenadas por hora dentro del día; en la vista Semana, solo hora, salón y estado.
- **FR-005**: El calendario MUST ofrecer las vistas Día y Semana con un control segmentado: Día por defecto en teléfonos y Semana en tableta (desde 600 dp de ancho), y la elección se mantiene al navegar.
- **FR-006**: Cada sesión MUST mostrar su estado como texto e ícono: programada, reprogramada (con la hora nueva y la original), cancelada por festivo, cancelada por el docente o cancelada por el propio estudiante; las canceladas se ven tachadas, con su motivo.
- **FR-007**: En el día de hoy, el calendario MUST mostrar una línea con la hora actual de Bogotá cuando esa hora cae dentro del horario mostrado.
- **FR-008**: Las horas visibles MUST ser las del horario permitido de la configuración (hoy 6:00 a. m. a 6:00 p. m.), sin escribirlas en el código; si una sesión cae fuera, el rango MUST ampliarse para mostrarla completa.
- **FR-009**: La navegación de semanas MUST limitarse a las fechas del periodo académico; fuera de ellas MUST mostrar "Fuera del periodo académico" y no avanzar. "Hoy" MUST volver a la semana actual con hoy seleccionado.
- **FR-010**: Las semanas pasadas y los periodos cerrados MUST verse en solo lectura, con las sesiones dictadas y las canceladas.
- **FR-011**: Tocar una sesión MUST abrir el detalle de su módulo; el calendario MUST NOT ofrecer acciones de cancelar, restaurar ni reprogramar, y MUST conservar la semana y el día al volver.
- **FR-012**: El estudiante MUST ver solo sus propias sesiones; el backend MUST rechazar a quien no sea estudiante y MUST NOT entregar sesiones de otro usuario.
- **FR-013**: Cada estado de la pantalla MUST estar cubierto: cargando, sin inscripciones (con invitación a explorar módulos), día sin sesiones, error con "Reintentar" y con datos; el fallo de una semana no pierde la semana ni el día elegidos.
- **FR-014**: Todos los textos MUST estar en español e inglés, las fechas y horas en `America/Bogota`, los íconos solo Iconify, los colores solo los de `Design.md` y los objetivos táctiles de 48 px como mínimo; las animaciones MUST respetar "reducir movimiento".
- **FR-015**: Los cambios de una sesión (reprogramación, cancelación, festivo) MUST verse en el calendario al volver a la pestaña o al refrescar, sin reiniciar la sesión.

### Key Entities

- **Sesión del estudiante en el calendario**: una sesión de un módulo en el que asiste, con módulo, docente, salón, hora, estado y, si cambió de hora, la hora original. Calculada a partir de datos que ya existen.
- **Semana del calendario**: un rango de lunes a domingo en Bogotá, dentro de las fechas del periodo académico.
- **Periodo académico**: el activo, o el último cerrado si no hay activo; ya existe.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El estudiante identifica su próxima tutoría de la semana en menos de 10 segundos desde que abre "Cronograma".
- **SC-002**: El 100 % de las sesiones del calendario coincide con las de sus módulos en las pruebas de concordancia, y ninguna sesión de un módulo ajeno aparece.
- **SC-003**: El 100 % de las sesiones reprogramadas o canceladas muestra su estado en texto e ícono, con la hora original en las reprogramadas.
- **SC-004**: Cambiar de semana muestra las sesiones en menos de 2 segundos.
- **SC-005**: Ningún usuario que no sea estudiante, ni un estudiante sobre sesiones ajenas, obtiene datos en las pruebas de permisos.
- **SC-006**: El calendario no ofrece ninguna acción de cambio sobre las sesiones en el 100 % de los casos probados.

## Assumptions

- Es de solo lectura: ninguna acción de cambio vive en el calendario; cancelar una sesión sigue en el detalle del módulo con las reglas de siempre (D-070, hasta 1 hora antes).
- La sesión que el estudiante canceló solo para sí se ve tachada con "Cancelada por ti", para que sepa qué decidió omitir; restaurarla sigue en el detalle del módulo.
- Se reutiliza el componente de calendario de la spec 013 y su comportamiento (Día y Semana, línea de ahora, rango de horas, navegación por periodo); no se hace uno nuevo.
- El periodo es el activo; si no hay activo, el último cerrado en solo lectura, como en el cronograma del docente.
- No hay lista de próximas sesiones ni resumen de módulos debajo del calendario: el estudiante ya tiene su Inicio (spec 019) y su pestaña de módulos.
- Al tocar una sesión se abre el detalle del módulo que ya existe; no se crea una hoja de detalle nueva.
- Los datos salen de lo que ya existe (inscripciones, sesiones, ausencias, salones, docentes y periodos); no hay datos nuevos.
- Queda fuera de alcance: acciones sobre sesiones, el cronograma del CAE, recordatorios o alarmas, exportar o compartir el calendario, sincronizar con calendarios del teléfono y cualquier cambio al cronograma del docente.
