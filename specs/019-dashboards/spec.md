# Feature Specification: Dashboards de los tres roles

**Feature Branch**: `019-dashboards`

**Created**: 2026-11-22

**Status**: Implemented

**Input**: User description: "Dashboards para los tres roles. CAE: ocupación general de cupos, módulos llenos y con baja inscripción, tarjetas de módulos, estudiantes y docentes activos y PQRS radicadas, PQRS por estado con tiempo promedio de respuesta, últimas 5 cancelaciones y reprogramaciones, uso de salones. Docente: próxima sesión, sesiones de la semana, mensajes sin leer, cupo por módulo, sus 3 PQRS más recientes. Estudiante (Inicio): próxima sesión, sesiones inscritas de la semana, avisos y mensajes sin leer, cambios recientes que lo afectan, sus 3 PQRS más recientes. Solo lectura, sin datos nuevos. Fuera de alcance: selector de periodo."

## Estado de partida (revisión del 2026-11-22)

| Qué ya existe | Dónde |
|---|---|
| Pestaña "Dashboard" (CAE y docente) e "Inicio" (estudiante) en la navegación, sin contenido | D-042, spec 002 |
| Módulos, sesiones, cupos, inscripciones y salones | specs 010 a 013 |
| Avisos de cancelaciones y cambios de sesión | specs 012, 014 |
| PQRS con estados y fechas, y su consulta para los dashboards | spec 017, FR-015 |
| Total de mensajes sin leer | spec 018, FR-021 |
| Cuentas activas de docentes y estudiantes | spec 016 |

| Qué falta | |
|---|---|
| Una pantalla de entrada con las métricas de cada rol | |

## Clarifications

### Session 2026-11-22

- Q: ¿El selector de periodo (Semana, Mes, Semestre) entra? → A: No; queda fuera de esta spec.
- Q: ¿Qué es la "ocupación de un salón"? → A: El cupo ocupado de sus módulos activos (inscritos sobre capacidad), no las horas asignadas.
- Q: ¿Cuál es el umbral de "baja inscripción"? → A: Menos del 30 % del cupo, configurable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard del CAE (Priority: P1)

El CAE abre "Dashboard" y ve de un vistazo cómo va la operación: ocupación de cupos, módulos llenos y con baja inscripción, cuentas activas, PQRS por estado con su tiempo de respuesta, últimas cancelaciones y reprogramaciones, y uso de salones.

**Why this priority**: El CAE es quien decide y corrige; sin esta vista tiene que recorrer cada módulo y cada PQRS para saber dónde actuar.

**Independent Test**: Con módulos de distinta ocupación, PQRS en los tres estados y una cancelación reciente, abrir el dashboard y comprobar que cada cifra coincide con los datos.

**Acceptance Scenarios**:

1. **Given** módulos activos con cupos e inscritos, **When** el CAE abre el dashboard, **Then** ve el porcentaje de ocupación general y cuántos módulos están llenos y cuántos con baja inscripción.
2. **Given** docentes y estudiantes activos, desactivados y eliminados, **When** abre el dashboard, **Then** las tarjetas cuentan solo las cuentas activas y los módulos activos.
3. **Given** PQRS radicadas, en revisión y resueltas, **When** abre el dashboard, **Then** ve la cantidad de cada estado, cuántas están "Radicadas" y el tiempo promedio de respuesta.
4. **Given** más de 5 cancelaciones o reprogramaciones, **When** abre el dashboard, **Then** ve las 5 más recientes, cada una con módulo y tiempo relativo, y un enlace a "Ver todo".
5. **Given** salones con distinto uso, **When** abre el dashboard, **Then** ve cuáles son los más y los menos ocupados.
6. **Given** que no hay módulos, PQRS ni cambios, **When** abre el dashboard, **Then** cada bloque muestra su estado vacío y ninguna cifra queda en blanco o rota.

---

### User Story 2 - Inicio del docente (Priority: P1)

El docente abre "Dashboard" y ve su próxima sesión, las sesiones de la semana, los mensajes sin leer, el cupo de cada uno de sus módulos y sus PQRS más recientes.

**Why this priority**: Es lo primero que necesita antes de dar una tutoría: cuándo, dónde y a cuántos estudiantes.

**Independent Test**: Con un docente con dos módulos, sesiones esta semana, mensajes sin leer y dos PQRS, abrir el dashboard y comprobar cada bloque; luego cancelar la próxima sesión y comprobar que cambia a la siguiente.

**Acceptance Scenarios**:

1. **Given** un docente con sesiones futuras, **When** abre el dashboard, **Then** la tarjeta principal muestra la próxima sesión con módulo, día y hora, salón y cantidad de inscritos.
2. **Given** un docente sin sesiones futuras, **When** abre el dashboard, **Then** ve "Sin sesiones próximas".
3. **Given** sesiones esta semana, algunas canceladas, **When** abre el dashboard, **Then** el conteo de la semana excluye las canceladas.
4. **Given** mensajes sin leer en sus conversaciones, **When** abre el dashboard, **Then** ve el mismo total que el contador de la pestaña "Mensajes".
5. **Given** varios módulos, **When** abre el dashboard, **Then** ve para cada uno una barra de cupo con inscritos y capacidad.
6. **Given** PQRS radicadas por el docente, **When** abre el dashboard, **Then** ve hasta 3, las más recientes, con su estado, y ninguna ajena.

---

### User Story 3 - Inicio del estudiante (Priority: P1)

El estudiante abre "Inicio" y ve su próxima tutoría, cuántas tiene esta semana, sus avisos y mensajes sin leer, los cambios que lo afectan y sus PQRS más recientes.

**Why this priority**: Es la primera pantalla del rol más numeroso; le dice qué sigue y si algo cambió.

**Independent Test**: Con un estudiante inscrito en dos módulos, un cambio de sala reciente y una PQRS, abrir "Inicio" y comprobar cada bloque.

**Acceptance Scenarios**:

1. **Given** un estudiante inscrito con sesiones futuras, **When** abre "Inicio", **Then** la tarjeta principal muestra su próxima sesión con módulo, día y hora y salón.
2. **Given** un estudiante sin inscripciones, **When** abre "Inicio", **Then** ve "Sin sesiones próximas" y una invitación a explorar módulos.
3. **Given** sesiones inscritas esta semana, algunas canceladas, **When** abre "Inicio", **Then** el conteo excluye las canceladas.
4. **Given** avisos de la bandeja y mensajes sin leer, **When** abre "Inicio", **Then** ve el total de avisos sin leer y de mensajes sin leer.
5. **Given** cancelaciones o reprogramaciones de sus módulos, **When** abre "Inicio", **Then** ve esos cambios y ninguno de módulos en los que no está inscrito.
6. **Given** PQRS propias, **When** abre "Inicio", **Then** ve hasta 3, las más recientes, con su estado.

---

### User Story 4 - Cada cifra lleva a su detalle (Priority: P2)

Cada bloque del dashboard lleva a la pantalla donde se trabaja con ese dato: la próxima sesión a su módulo, las PQRS a su lista, los cambios a su detalle.

**Why this priority**: Un dashboard que solo informa obliga a buscar; con el acceso directo se actúa en un toque. No bloquea ver las cifras.

**Independent Test**: Tocar cada bloque de cada rol y comprobar que abre la pantalla correspondiente.

**Acceptance Scenarios**:

1. **Given** la tarjeta de próxima sesión, **When** el usuario toca "Ver detalle", **Then** abre el módulo de esa sesión.
2. **Given** el bloque "Mis PQRS" o "PQRS por estado", **When** lo toca, **Then** abre la lista de PQRS (del CAE con el filtro del estado tocado).
3. **Given** el contador de mensajes o avisos sin leer, **When** lo toca, **Then** abre "Mensajes" o la bandeja.

---

### Edge Cases

- Sin datos: cada bloque muestra su estado vacío con una frase; nunca una cifra rota ni `NaN`.
- Divisiones entre cero: con capacidad total 0 la ocupación muestra 0 %, no un error.
- Una sesión pasa mientras la pantalla está abierta: al volver a la pantalla o refrescar, la próxima sesión se recalcula.
- El módulo de la próxima sesión se cancela o cambia de hora: la tarjeta refleja el cambio al refrescar.
- Falla un bloque: los demás se muestran y ese ofrece "Reintentar"; no se cae toda la pantalla.
- Cuentas eliminadas o desactivadas no cuentan como activas, pero sus PQRS y datos históricos se conservan.
- Un docente o estudiante nunca ve cifras de otro usuario ni agregados del CAE.
- Fechas en UTC en la base y mostradas en `America/Bogota`; "esta semana" se calcula en `America/Bogota`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El dashboard del CAE MUST mostrar: ocupación general de cupos (inscritos sobre capacidad de los módulos activos), módulos llenos y módulos con baja inscripción, módulos activos, estudiantes activos, docentes activos y PQRS en estado "Radicada".
- **FR-002**: El dashboard del CAE MUST mostrar las PQRS por estado (Radicada, En revisión, Resuelta) y el tiempo promedio de respuesta.
- **FR-003**: El dashboard del CAE MUST listar las 5 cancelaciones y reprogramaciones más recientes, con módulo y tiempo relativo, y enlazar a la lista completa.
- **FR-004**: El dashboard del CAE MUST mostrar los salones más y menos ocupados. La ocupación de un salón es el porcentaje de cupo ocupado de sus módulos activos (inscritos sobre capacidad).
- **FR-005**: Un módulo MUST contarse con "baja inscripción" según un umbral definido en configuración, no en el código; el valor por defecto es menos del 30 % del cupo.
- **FR-006**: El dashboard del docente MUST mostrar su próxima sesión (módulo, día y hora, salón, cantidad de inscritos), las sesiones de la semana sin contar las canceladas, los mensajes sin leer, el cupo de cada uno de sus módulos y sus 3 PQRS más recientes con estado.
- **FR-007**: El "Inicio" del estudiante MUST mostrar su próxima sesión (módulo, día y hora, salón), las sesiones inscritas de la semana sin contar las canceladas, los avisos y mensajes sin leer, los cambios recientes que afectan sus módulos y sus 3 PQRS más recientes con estado.
- **FR-008**: Cuando no hay próxima sesión, la tarjeta principal MUST mostrar "Sin sesiones próximas" y, para el estudiante sin inscripciones, una invitación a explorar módulos.
- **FR-009**: Los datos MUST salir de lo ya registrado (módulos, sesiones, inscripciones, salones, PQRS, avisos y mensajes); el dashboard es de solo lectura y no crea datos nuevos ni modifica los existentes.
- **FR-010**: El backend MUST validar con guards de roles que el CAE consulte solo el dashboard de CAE, el docente solo el suyo y el estudiante solo el suyo, y que las cifras personales se limiten al usuario que consulta; ocultar pantallas no cuenta como seguridad.
- **FR-011**: Las cifras MUST reflejar los datos al abrir la pantalla y al refrescarla, sin que el usuario deba reiniciar la sesión.
- **FR-012**: Cada bloque MUST tener estado de carga, vacío, error con "Reintentar" y datos, y el fallo de un bloque no impide mostrar los demás.
- **FR-013**: Cada bloque MUST llevar a la pantalla donde se trabaja con ese dato (módulo, lista de PQRS, mensajes o bandeja).
- **FR-014**: Todos los textos MUST estar en español e inglés, el idioma del dispositivo manda, y las fechas se muestran en `America/Bogota`.
- **FR-015**: El diseño MUST seguir la sección "Dashboards" de `Design.md`: tarjetas de métrica, tarjeta principal con degradado de marca, barras de cupo, y estados con texto además de color.

### Key Entities

- **Resumen del CAE**: conjunto de cifras agregadas de toda la operación (ocupación, módulos, cuentas, PQRS, cambios recientes, salones). Calculado, no guardado.
- **Resumen del docente**: próxima sesión, conteos de la semana y de mensajes, cupo por módulo y PQRS propias. Calculado, no guardado.
- **Resumen del estudiante**: próxima sesión, conteos de la semana, avisos y mensajes, cambios recientes y PQRS propias. Calculado, no guardado.
- **Cambio reciente**: cancelación o reprogramación de una sesión, con módulo, fecha del cambio y tipo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Cada rol ve su dashboard completo en menos de 3 segundos desde que abre la pantalla, con 200 módulos y 200 PQRS cargados.
- **SC-002**: El 100 % de las cifras del dashboard coincide con los datos de las pantallas de origen en las pruebas de concordancia.
- **SC-003**: Ningún docente ni estudiante logra ver cifras de otro usuario ni del CAE, ni el CAE ver las personales de otro rol, en las pruebas de permisos.
- **SC-004**: El estudiante identifica su próxima tutoría en menos de 5 segundos desde que abre "Inicio".
- **SC-005**: El CAE encuentra los módulos llenos o con baja inscripción sin recorrer la lista de módulos.
- **SC-006**: Con cualquier bloque sin datos o con error, la pantalla sigue usable y muestra el estado correspondiente en el 100 % de los casos probados.

## Assumptions

- No hay selector de periodo: el dashboard muestra la situación actual y la semana en curso; el CAE ve el periodo académico vigente.
- "Esta semana" va de lunes a domingo en `America/Bogota`.
- El tiempo promedio de respuesta va desde que se radica la PQRS hasta que se marca "Resuelta", y cuenta solo las PQRS resueltas.
- "Módulo lleno" es el que alcanzó su cupo; los módulos y sesiones cancelados no cuentan para las cifras de ocupación.
- "Cambios recientes" del estudiante son los 5 más recientes de los módulos donde está inscrito; el docente no tiene ese bloque.
- Los avisos sin leer son los de la bandeja de la spec 014; los mensajes sin leer, los del chat de la spec 018.
- No se crean tablas ni datos nuevos; si algún cálculo resulta lento con el volumen esperado, se resuelve en el plan.
- Sin gráficos animados ni exportación de datos; el selector de periodo, los filtros por fecha y la personalización del dashboard quedan fuera de alcance.
- La navegación de las pestañas y las pantallas de destino (módulos, PQRS, mensajes, bandeja) ya existen y no se modifican aquí.
