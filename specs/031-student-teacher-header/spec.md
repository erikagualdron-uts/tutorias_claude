# Feature Specification: Cabecera de marca en estudiante y docente

**Feature Branch**: `031-student-teacher-header`

**Created**: 2026-11-24

**Status**: Implemented (pending manual review: T015)

**Input**: User description: "Spec 031: llevar a las pantallas de estudiante y docente el aspecto más moderno y llamativo que la spec 029 dio a administración, y que la fase 2 (spec 028) dejó sobrio: lista de módulos y detalle de módulo del estudiante, horario del estudiante, horario del docente y las demás pantallas propias de estudiante y docente que sigan en registro sobrio sin cabecera. Cabecera de marca compacta (`ScreenHeader`) y presencia visual coherente con administración y con los inicios, sin patrón y sin romper la regla de un solo bloque de color por pantalla; consistencia entre estudiante y docente, cercanía a la identidad UTS y modo oscuro sin errores visuales. Sin cambios de backend, de textos, de reglas de negocio ni funcionalidad nueva."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| Base lista (specs 026 a 030) | Tres registros en `Design.md` (sobrio, sobrio con cabecera y expresivo), `ScreenHeader`, `controlBorder`, regla de indicador de estado (D-125), `FilterChips` con fila compacta y guardas (`severityIndicators`, `headerBudget`) |
| Qué ya tiene cabecera | Administración (8 listas, cambios, índice de «Más»), mensajes y las listas de PQRS en los tres roles |
| Pantallas de estudiante y docente sin cabecera | Lista de módulos del estudiante (`StudentModulesScreen`, título de texto), horario del estudiante (`StudentScheduleScreen`, solo el calendario dentro de una tarjeta), horario del docente (`TeacherScheduleScreen`, título de texto y calendario), y mis inscripciones (`MyEnrollmentsScreen`) si tiene ruta propia; el detalle de módulo del estudiante (`StudentModuleDetailScreen`) y los inicios no entran (detalle sobrio, inicios expresivos) |
| Piezas compartidas que usan | El calendario semanal (`WeekCalendar`, `WeekGrid`, `DayStrip`, `DayTimeline`, `SessionBlock`, `CalendarHeader` con el rango de la semana), `OfferCard`, `TeacherSessionCard`, `FilterChips`, `SearchField` |
| Resultado esperado | Que estudiante y docente vean la misma presencia de marca que administración en sus pantallas principales, sin recargar el calendario ni duplicar bloques de color |
| Defectos del recorrido manual | Ninguno visto (ver Clarifications); el pedido es de aspecto: pantallas más modernas y refrescantes |

Esta spec no cambia datos, textos, rutas, permisos ni reglas de negocio (inscripción, cupo, cancelación, cambio de horario); cambia cómo se ven estas pantallas.

## Clarifications

### Session 2026-11-24

- Q: ¿Qué defectos concretos vio en el teléfono en las pantallas de estudiante y docente (módulos, calendario, tutorías), en claro y oscuro? → A: Ninguno. La persona dueña del producto no vio defectos; solo quiere que las pantallas se vean más modernas y refrescantes, y eso se resuelve con la cabecera de marca compacta ya definida (mismo componente que administración), sin rediseñar el calendario ni las tarjetas.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cabecera de marca en los módulos del estudiante (Priority: P1)

El estudiante abre la lista de módulos y ve arriba la misma cabecera compacta de marca que administración (título y número de módulos mostrados), con los filtros y la búsqueda debajo, más moderna y reconocible.

**Why this priority**: Es la pantalla con la que el estudiante decide inscribirse y la más visible de su rol después del inicio.

**Independent Test**: Abrir la lista con módulos disponibles, llenos, con cruce e inscritos, vacía, cargando y con error, en claro y oscuro, en español e inglés; `headerBudget` pasa.

**Acceptance Scenarios**:

1. **Given** la lista de módulos del estudiante, **When** se abre, **Then** muestra una única cabecera compacta de marca con el título existente y el número de módulos, sin patrón, y debajo la búsqueda, los filtros y las tarjetas.
2. **Given** una lista vacía o con un solo módulo, **When** se muestra, **Then** la cabecera muestra 0 o 1 y el estado vacío compartido va debajo sin repetir el mensaje.
3. **Given** el modo oscuro, **When** se abre, **Then** la cabecera, los chips y las tarjetas usan colores del modo oscuro y cumplen el contraste mínimo.

---

### User Story 2 - Cabecera en los horarios sin recargar el calendario (Priority: P1)

El estudiante y el docente ven su horario con la misma cabecera de marca arriba y el calendario semanal debajo, sin que la cabecera compita con el rango de la semana ni con la navegación del calendario, de modo que el horario sigue siendo legible.

**Why this priority**: El horario es de uso diario de dos roles y es donde más importa no recargar la pantalla; también es lo que la persona dueña del producto pidió explícitamente («el calendario, las tutorías»).

**Independent Test**: Abrir el horario de cada rol con sesiones programadas, reprogramadas y canceladas y sin sesiones, en claro y oscuro, en vista de día y de semana; el calendario, la navegación de semana y las tarjetas de sesión siguen igual.

**Acceptance Scenarios**:

1. **Given** el horario del estudiante o del docente, **When** se abre, **Then** muestra una única cabecera compacta de marca con el título existente de la pantalla, sin patrón, encima del calendario, y el calendario no cambia de estructura ni de datos.
2. **Given** la cabecera y el calendario juntos, **When** se miran en un teléfono pequeño, **Then** el calendario conserva su altura útil (al menos la de hoy) y no se necesita desplazar la pantalla para ver el primer bloque de horas.
3. **Given** el horario del docente con la lista de tutorías (tarjetas de sesión), **When** se abre, **Then** la cabecera es el único bloque de color y las tarjetas de sesión conservan sus indicadores de estado con texto, ícono y contraste.
4. **Given** el horario del estudiante sin inscripciones o el del docente sin sesiones, **When** se abre, **Then** aparecen la cabecera y el estado vacío compartido con su acción.

---

### User Story 3 - Consistencia entre estudiante y docente (Priority: P2)

Las pantallas principales de estudiante y docente comparten estructura y presencia: cabecera de marca, contenido sobrio debajo, y los mismos estados vacío, de carga y de error.

**Why this priority**: Cierra la consistencia entre roles que pedía el rediseño y evita que quede un tercio de la app con un aspecto distinto.

**Independent Test**: Comparar las pantallas con cabecera de estudiante, docente y administración en claro y oscuro y comprobar la misma cabecera, el mismo espaciado (16/12/24 px) y los mismos estados.

**Acceptance Scenarios**:

1. **Given** las pantallas con cabecera de estudiante, docente y administración, **When** se comparan, **Then** usan el mismo componente, los mismos márgenes y la misma tipografía de título, y ninguna tiene más de un bloque de color.
2. **Given** el detalle de módulo del estudiante y los inicios, **When** se revisan, **Then** siguen en su registro actual (sobrio y expresivo) sin cabecera añadida.

---

### Edge Cases

- Título largo o número de tres cifras en la cabecera: no se corta ni cambia la altura de forma que tape contenido.
- Teléfono pequeño con teclado abierto en la búsqueda de módulos: la cabecera no impide ver el campo ni los resultados.
- Semana sin sesiones, un día con muchas sesiones o una sesión que cruza el límite de la rejilla: el calendario no se rompe con la cabecera encima.
- Vista de día y de semana del calendario: la cabecera se mantiene; no cambia entre vistas.
- Cambio de modo con la pantalla abierta: cambia sin reiniciar y sin destellos.
- "Reducir movimiento" activo: las animaciones se omiten o se reducen.
- Letra grande del sistema: nada se corta y los objetivos táctiles se mantienen en 48 px.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La lista de módulos del estudiante, el horario del estudiante y el horario del docente MUST llevar el `ScreenHeader` compacto como único bloque de color de la pantalla, con título existente y sin patrón; la lista de módulos MUST llevar además el número de módulos mostrados, solo en el segmento de módulos disponibles (el segmento «mis módulos» no lleva número).
- **FR-002**: `Design.md` MUST sumar esas pantallas al registro «sobrio con cabecera» antes del código, y `headerBudget.test.ts` MUST incluirlas (una cabecera, ningún patrón) y excluir de la cabecera el detalle de módulo y los inicios.
- **FR-003**: En los horarios, la cabecera MUST ir encima del calendario sin cambiar la estructura, los datos, la navegación de semana ni las vistas del calendario, y el calendario MUST conservar su altura útil en un teléfono pequeño.
- **FR-004**: Los estados vacío, de carga y de error de estas pantallas MUST seguir usando las piezas compartidas, debajo de la cabecera y sin repetir su mensaje.
- **FR-005**: La cabecera MUST cumplir el contraste de texto de 4.5:1 sobre el degradado en ambos modos y MUST NOT introducir textos nuevos: el título es el texto existente de la pantalla y el número es un dato que ya carga.
- **FR-006**: Las pantallas de la spec MUST cumplir las 8 reglas de revisión de `Design.md` y mantener la accesibilidad de la spec 023 (cabecera con `accessibilityRole="header"`, objetivos de 48 px, «reducir movimiento»).
- **FR-007**: La spec MUST NOT cambiar textos, rutas, datos, permisos ni reglas de negocio (inscripción, cupo, cruces, cancelación, cambio de horario), ni la estructura y destinos de la barra de pestañas y cabecera superior.
- **FR-008**: Las guardas de las specs 026 a 030 (paridad, contraste, valores sueltos, indicadores, presupuesto de cabecera) MUST seguir en verde.
- **FR-009**: El resultado de la revisión de cada pantalla (cumple, o defecto con causa y corrección) MUST quedar registrado en `screen-inventory.md`; cualquier defecto que se descubra durante la implementación o el recorrido final MUST corregirse en esta spec o asignarse a otra con motivo.
- **FR-010**: Si una pantalla necesita un rol, token o regla que `Design.md` no tiene, MUST añadirse primero al documento y al tema, y registrarse en `Decisions.md`.

### Key Entities *(include if feature involves data)*

No hay datos nuevos. Se tocan solo presentación: la cabecera de marca en tres pantallas de estudiante y docente, y el inventario de pantallas, que se completa con el estado de cada una.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las 3 pantallas (módulos del estudiante, horario del estudiante, horario del docente) muestran la misma cabecera que las demás listas con cabecera, con un solo bloque de color y ningún patrón, y una persona las reconoce como del mismo conjunto en menos de 5 segundos.
- **SC-002**: 0 defectos visuales abiertos en el recorrido manual final (claro y oscuro, español e inglés), incluidos los que aparezcan al aplicar la cabecera.
- **SC-003**: En un teléfono de 640 px de alto, el horario muestra la cabecera y al menos las primeras horas de la vista del día sin desplazar la pantalla.
- **SC-004**: 100 % de los textos de las cabeceras son textos que ya existían y 0 textos, rutas, reglas de negocio o permisos cambian: las pruebas existentes (inscripción, cancelación, horario, navegación, accesibilidad) pasan sin ajustes de comportamiento.
- **SC-005**: Las guardas automáticas de las specs 026 a 030 pasan y no se añaden valores fuera del tema.
- **SC-006**: El cambio de modo del teléfono con cualquiera de las pantallas abiertas se refleja sin reiniciar y sin destellos.

## Assumptions

- Depende de las specs 026 a 030 (código en los PR #16 a #20 y docs en #19 a #23, aún sin fusionar); la rama se apila sobre la 030.
- El detalle de módulo del estudiante sigue sobrio sin cabecera (como el detalle de módulo del CAE) y los inicios siguen expresivos.
- La cabecera usa el título existente de cada pantalla: `student.modules.title` en la lista de módulos, el texto de la pestaña de horario (`tabs.schedule`) en el del estudiante y el texto actual del título del horario del docente; si alguno no existiera, se reutiliza el de la pestaña.
- `MyEnrollmentsScreen` entra solo si tiene ruta propia visible; si no se monta en ninguna ruta, queda fuera.
- La revisión previa del teléfono no encontró defectos; el cambio es de aspecto (más moderno y refrescante) y un recorrido manual final confirma que la cabecera no introduce defectos ni quita espacio útil al calendario.
- Sin cambios de backend ni dependencias nuevas.
