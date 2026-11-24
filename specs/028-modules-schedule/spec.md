# Feature Specification: Módulos y horario renovados

**Feature Branch**: `028-modules-schedule`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Spec 028, fase 2 del rediseño de la app: módulos y horario. Aplicar el sistema de diseño de las specs 026 y 027 (registro sobrio) a las 4 pantallas de la fase 2 del inventario: lista de módulos del estudiante, detalle de módulo del estudiante, horario del estudiante y horario del docente. Más elegante y moderno, consistente entre estudiante y docente (tarjetas de módulo, calendario semanal, chips de filtro, estados de sesión como texto más ícono), cercano a la identidad UTS y con modo oscuro sin errores visuales. Sin cambios de backend, de textos, de reglas de negocio ni funcionalidad nueva. Incorporar los defectos del recorrido manual en el teléfono."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| Base lista (specs 026 y 027) | `Design.md` por roles (40, claro y oscuro), registros sobrio y expresivo, 8 reglas comprobables, `controlBorder` para bordes de controles, `EmptyState` con patrón de marca y guardas automáticas |
| Alcance de la fase 2 | 4 pantallas del inventario `specs/026-design-system/screen-inventory.md`: lista de módulos del estudiante, detalle de módulo del estudiante, horario del estudiante y horario del docente. Todas en registro **sobrio** |
| Piezas que ya existen | `OfferCard` (tarjeta de módulo), `SessionRow`, `CancelSheet`, `FilterChips`, `SearchField`; el calendario compartido (`WeekCalendar`, `WeekGrid`, `DayStrip`, `DayTimeline`, `SessionBlock`, `CalendarHeader`, `NowLine`); `TeacherSessionCard` y `SessionActionsSheet` en el docente |
| Cosas que ya cumplen | Estados de sesión como texto más ícono (spec 021), objetivos táctiles de 48 px y contraste de texto en ambos modos (specs 023 y 026) |
| Puntos a revisar por la propia estructura | Bordes de insignias, de días del calendario y de pistas de ocupación pintados con `border` (casi invisible en oscuro) y colores de severidad (`error`, `warning`) usados en bordes y textos que pueden no leerse en oscuro |
| Defectos del recorrido manual | Ninguno visto en estas 4 pantallas (ver Clarifications); el trabajo parte de las 8 reglas de `Design.md` y de lo que la revisión del código ya señala |

Esta spec no cambia datos, textos, rutas, permisos ni reglas de negocio (inscripción, cupo, cancelación, cambio de horario); cambia cómo se ven y se sienten estas 4 pantallas y las piezas compartidas que usan.

## Clarifications

### Session 2026-11-23

- Q: ¿Qué defectos concretos vio en el teléfono en estas 4 pantallas (claro y oscuro)? → A: Ninguno. La persona dueña del producto no vio defectos en estas 4 pantallas; el alcance se define por las 8 reglas de `Design.md` y la revisión del código (bordes y colores de severidad en oscuro).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Explorar módulos con claridad (Priority: P1)

El estudiante abre la lista de módulos y ve tarjetas limpias y consistentes: nombre, docente, horario, cupo y estado, con filtros y búsqueda cómodos. Entra al detalle y entiende de un vistazo si puede inscribirse, y si no, la regla que se lo impide.

**Why this priority**: Es la pantalla con la que el estudiante decide inscribirse; su claridad pesa más que la estética del resto.

**Independent Test**: Recorrer lista y detalle con módulos disponibles, llenos, con cruce de horario e inscritos, en claro y oscuro, y verificar las 8 reglas de `Design.md`; las pruebas de inscripción existentes siguen verdes.

**Acceptance Scenarios**:

1. **Given** la lista de módulos, **When** se muestra, **Then** cada tarjeta presenta, en este orden, nombre con su estado, docente, horario, sala y cupo, con la misma jerarquía, el cupo como número y barra (nunca solo color) y el estado como texto más ícono.
2. **Given** los chips de filtro y el campo de búsqueda, **When** se usan, **Then** se distinguen sus bordes en ambos modos y las etiquetas se leen completas en español e inglés.
3. **Given** un módulo bloqueado (lleno o con cruce de horario), **When** se abre su detalle, **Then** el botón deshabilitado muestra la regla que lo bloquea con contraste suficiente.
4. **Given** el modo oscuro, **When** se abren lista y detalle, **Then** fondos, tarjetas, insignias, barras y textos usan colores del modo oscuro y cumplen el contraste mínimo.

---

### User Story 2 - Un horario legible y coherente entre roles (Priority: P1)

El estudiante y el docente ven el mismo calendario semanal: misma rejilla, mismos bloques, mismo indicador de hoy y de la hora actual. Los estados de sesión (programada, reprogramada, cancelada) se entienden por texto e ícono, no solo por color.

**Why this priority**: El horario es la pantalla de uso diario de dos de los tres roles y hoy comparte solo parte de su aspecto.

**Independent Test**: Abrir el horario de estudiante y de docente con sesiones de todos los estados, en claro y oscuro, y comparar estructura y colores con la lista de reglas.

**Acceptance Scenarios**:

1. **Given** el horario de estudiante y el de docente, **When** se comparan, **Then** usan el mismo calendario, el mismo bloque de sesión, el mismo marcador de hoy y de hora actual, y los mismos estados con texto más ícono.
2. **Given** un día, la rejilla o la tira de días, **When** se muestran en oscuro, **Then** las líneas, el día de hoy y el día seleccionado se distinguen (3:1) sin depender solo del color.
3. **Given** sesiones canceladas, reprogramadas o restauradas, **When** se pintan, **Then** su estado se lee como texto con ícono, tachado donde corresponda, con contraste de texto en ambos modos.
4. **Given** el horario del docente, **When** se usan los filtros y la hoja de acciones de sesión, **Then** los chips, botones y hoja cumplen los mismos criterios de borde y contraste.

---

### User Story 3 - Estados de lista y de carga consistentes (Priority: P2)

En las 4 pantallas, cuando no hay contenido, cuando carga o cuando falla, la app muestra las piezas compartidas (estado vacío con patrón de marca, indicador de marca, aviso de error con reintento) con la misma estructura.

**Why this priority**: Son los estados que más se ven en una primera sesión y ya existen como piezas; falta unificarlos.

**Independent Test**: Provocar vacío, carga y error en cada pantalla y comprobar que usan las mismas piezas, sin texto nuevo.

**Acceptance Scenarios**:

1. **Given** un estudiante sin inscripciones o un docente sin sesiones, **When** abre su horario, **Then** ve el estado vacío compartido con su acción.
2. **Given** una carga o un error, **When** ocurre, **Then** se muestra el indicador de marca o el aviso de error con reintento, igual en las 4 pantallas.

---

### Edge Cases

- Nombres de módulo o de docente muy largos, o tamaño de letra grande del sistema: nada se corta ni se solapa y los objetivos táctiles se mantienen en 48 px.
- Una semana sin sesiones, un día con muchas sesiones simultáneas o una sesión que cruza el límite de la rejilla: el calendario no se rompe.
- Módulo lleno, con cruce de horario o ya inscrito: el estado se entiende sin depender del color.
- Cambio de modo con la pantalla abierta: cambia sin reiniciar y sin destellos.
- "Reducir movimiento" activo: las animaciones se omiten o se reducen.
- Etiqueta corta («All») en chips con letra grande: se ve completa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada una de las 4 pantallas de la fase 2 MUST cumplir las 8 reglas de revisión de `Design.md` (registro sobrio: sin degradado ni patrón, un solo foco, jerarquía por tipo) y usar solo roles de color del tema, en claro y oscuro.
- **FR-002**: Las tarjetas de módulo de la lista del estudiante MUST mostrar, en este orden, nombre con su estado, docente, horario, sala y cupo (número y barra), con una jerarquía fija, y el estado MUST leerse como texto más ícono.
- **FR-003**: Los elementos no textuales de las 4 pantallas (insignias de estado, barras de cupo, líneas de rejilla, día de hoy y día seleccionado) MUST distinguirse con 3:1 sobre su fondo real en ambos modos, y el color de severidad usado como texto MUST ser el rol de texto del modo (`errorText`, `successText`, `warningText`).
- **FR-004**: El calendario del estudiante y el del docente MUST ser la misma pieza compartida, con los mismos bloques, marcadores y estados.
- **FR-005**: Los estados de sesión (programada, reprogramada, cancelada por feriado, cancelada por el docente, cancelada por el estudiante, restaurada) MUST expresarse por texto e ícono, con contraste de texto, en ambos modos.
- **FR-006**: Los estados vacío, de carga y de error de las 4 pantallas MUST usar las piezas compartidas (`EmptyState`, `BrandLoader`, `Banner` con reintento), sin textos nuevos.
- **FR-007**: Los botones, chips y hojas de las 4 pantallas MUST cumplir `Design.md` (borde de controles `controlBorder`, texto de los botones rellenos con 4.5:1, etiquetas sin recorte, íconos a la izquierda).
- **FR-008**: Toda acción bloqueada (inscripción de módulo lleno o con cruce, cancelación fuera de ventana, cambio fuera de ventana) MUST seguir mostrando la regla que la bloquea.
- **FR-009**: La fase 2 MUST NOT cambiar textos, rutas, datos, permisos ni reglas de negocio (cupo, cruces, ventanas de 1 y 2 horas), ni la estructura y destinos de la barra de pestañas y cabecera.
- **FR-010**: Se MUST conservar la accesibilidad de la spec 023 (etiquetas, roles, contraste, objetivos de 48 px, "reducir movimiento") y las guardas de las specs 026 y 027.
- **FR-011**: El resultado de la revisión de cada pantalla (cumple, o defecto con su causa y corrección) MUST quedar registrado en `screen-inventory.md`; cualquier defecto que se descubra durante la implementación o el recorrido final MUST corregirse en esta spec o asignarse a otra con motivo.
- **FR-012**: Si una pantalla necesita un rol, token o regla que `Design.md` no tiene, MUST añadirse primero al documento y al tema, y registrarse en `Decisions.md`.

### Key Entities *(include if feature involves data)*

No hay datos nuevos. Se tocan solo presentación: las tarjetas y filas de módulo y de sesión, el calendario compartido y las piezas de estado; el inventario de pantallas se completa con defectos y estado por pantalla.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las 4 pantallas cumplen el 100 % de las 8 reglas de `Design.md`, comprobado con una lista de revisión por pantalla en claro y en oscuro.
- **SC-002**: 0 defectos visuales abiertos en las 4 pantallas en el recorrido manual final (claro y oscuro), incluidos los que aparezcan al aplicar los cambios.
- **SC-003**: 100 % de los elementos no textuales y de los textos de estado de las 4 pantallas pasan la matriz de contraste en ambos modos.
- **SC-004**: El horario de estudiante y el de docente comparten la misma pieza de calendario y los mismos estados: una persona los reconoce como la misma pantalla con distinto contenido en menos de 5 segundos.
- **SC-005**: 0 textos, rutas, reglas de negocio o permisos modificados: las pruebas existentes (inscripción, cancelación, horario, navegación, accesibilidad) pasan sin ajustes de comportamiento.
- **SC-006**: Las guardas automáticas de las specs 026 y 027 pasan y no se añaden valores fuera del tema.
- **SC-007**: El cambio de modo del teléfono con cualquiera de las 4 pantallas abiertas se refleja sin reiniciar y sin destellos.

## Assumptions

- Depende de las specs 026 y 027 (PR de código #16 y #17, de docs #19 y #20); la rama se apila sobre ellas hasta que se fusionen.
- El inventario de la 026 es la lista de alcance; el resto de pantallas de módulos y horario del CAE quedan para la fase 3 (administración).
- Los textos existentes bastan; si una pieza necesitara un texto nuevo, se reutiliza uno existente o se registra como excepción.
- La revisión previa del teléfono no encontró defectos en estas 4 pantallas; la mejora es preventiva y de consistencia, y un recorrido manual final confirma que los cambios no introducen defectos.
- Sin cambios de backend ni dependencias nuevas.
