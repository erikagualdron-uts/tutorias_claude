# Feature Specification: Administración del CAE renovada

**Feature Branch**: `029-admin-screens`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Spec 029, fase 3 del rediseño de la app: administración del CAE. Aplicar el sistema de diseño de las specs 026, 027 y 028 (registro sobrio) a las 22 pantallas de la fase 3 del inventario (módulos, más/administración y cambios del CAE). Más elegante y moderno, consistente entre pantallas de administración (listas, formularios, tarjetas, estados de cuenta y de sesión), cercano a la identidad UTS y con modo oscuro sin errores visuales. Incluir los usos de error, warning y success como indicador que la spec 028 dejó pendientes según correspondan a esta fase. Sin cambios de backend, de textos, de reglas de negocio ni funcionalidad nueva. Incorporar los defectos del recorrido manual en el teléfono."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| Base lista (specs 026, 027 y 028) | `Design.md` por roles (40, claro y oscuro), registros sobrio y expresivo, 8 reglas comprobables, `controlBorder`, regla de indicador de estado (D-125), `EmptyState` con patrón de marca y guardas automáticas (paridad, contraste, valores sueltos, indicadores) |
| Alcance de la fase 3 | 22 pantallas del inventario `specs/026-design-system/screen-inventory.md`, todas en registro **sobrio**: cambios (1); módulos (detalle, lista, formulario) y sedes (lista y formulario) y salones (lista y formulario); administración «Más»: índice, docentes (lista, creación, edición), estudiantes, periodos (lista y formulario), feriados (lista, formulario, importación), listas desplegables (listas, elementos, formulario de elemento) y configuración SMTP |
| Registro | `Design.md` define hoy dos registros (sobrio y expresivo); las pantallas de administración son sobrias, sin degradado ni patrón. La clarificación añade un tercero, «sobrio con cabecera»: un solo bloque compacto de marca arriba, sin patrón, y el resto como en el sobrio |
| Piezas que ya existen | `Card`, `Button`, `SearchField`, `SelectField`, `TextField`, `TextAreaField`, `DateField`, `FilterChips`, `ConfirmDialog`, `TemporaryPasswordDialog`, `Banner`, `EmptyState`, `BrandLoader`; en cuentas, `AccountsListScreen` y `AccountCard` (docentes y estudiantes) |
| Pendientes de la spec 028 que caen en esta fase | Usos de `error`, `warning` o `success` como indicador en `AppBar` (borde del ítem de menú), `AccountCard` (ícono de cuenta activa), `StatusStackBar` (barra de PQRS del tablero del CAE) y `SmtpSettingsScreen` (estado de la configuración); `StatusBadge` y `PqrsFiledScreen` pertenecen a PQRS y se tratan en la fase 4 |
| Puntos a revisar por la propia estructura | Siete formularios y cuatro listas con la misma estructura repetida; estados de cuenta, de periodo y de configuración como color de severidad; formularios con `DateField`, `SelectField` y diálogos de confirmación |
| Defectos del recorrido manual | Ninguno visto (ver Clarifications); pero se pide un aspecto más moderno y llamativo que el actual |

Esta spec no cambia datos, textos, rutas, permisos ni reglas de negocio (creación y cierre de módulos, periodos, salones, feriados, SMTP, cuentas); cambia cómo se ven y se sienten estas pantallas y las piezas compartidas que usan.

## Clarifications

### Session 2026-11-23

- Q: ¿Qué defectos concretos vio en el teléfono en estas pantallas de administración (claro y oscuro)? → A: Ninguno. Sin embargo, la persona dueña del producto pide que se vean mejor: más modernas y más llamativas (el alcance de ese rediseño se define en la pregunta siguiente).
- Q: ¿Cuánta presencia visual extra deben tener las pantallas de administración para verse más modernas y llamativas? → A: Opción B, cabecera de color por pantalla: cada lista, el índice de «Más» y los cambios llevan arriba un bloque compacto de marca (degradado verde, título y el número de elementos), sin patrón; el resto queda sobrio. Se añade a `Design.md` un tercer registro, «sobrio con cabecera». Los formularios y el detalle de módulo se mantienen sobrios.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Indicadores y estados legibles en administración (Priority: P1)

El CAE ve el estado de cuentas, periodos, configuración y avisos con color, texto e ícono legibles en ambos modos: ningún indicador depende de un color que se pierda en oscuro.

**Why this priority**: Es el defecto medido que la fase 2 dejó pendiente en estas pantallas y la base de toda la consistencia de administración.

**Independent Test**: Revisar las pantallas con cuentas activas e inactivas, periodos de todos los estados, SMTP configurado, por reconfigurar y sin configurar, y el tablero con PQRS por estado, en claro y oscuro; la prueba de indicadores de severidad pasa para las carpetas de la fase.

**Acceptance Scenarios**:

1. **Given** una cuenta activa o inactiva, **When** se muestra en la lista de docentes o de estudiantes, **Then** su estado se lee por texto e ícono y el ícono cumple 3:1 sobre la tarjeta en ambos modos.
2. **Given** la configuración SMTP, **When** su estado es configurada, por reconfigurar o sin configurar, **Then** el estado se lee como texto con ícono y el color de severidad usado como texto o ícono es el rol de texto del modo.
3. **Given** el menú de la barra superior y la barra de PQRS del tablero del CAE, **When** se muestran en oscuro, **Then** sus bordes y rellenos de estado cumplen el contraste mínimo.
4. **Given** cualquier insignia o indicador de las 22 pantallas, **When** se pinta, **Then** usa `errorText`, `warningText`, `successText` o `primary` y no un rol de relleno.

---

### User Story 2 - Listas de administración consistentes (Priority: P1)

Las listas de módulos, sedes, salones, docentes, estudiantes, periodos, feriados y listas desplegables comparten estructura: búsqueda o filtros arriba, tarjetas con la misma jerarquía, acción principal visible y estados vacío, de carga y de error iguales.

**Why this priority**: El CAE las usa a diario y hoy cada una compone sus piezas con ligeras diferencias.

**Independent Test**: Abrir cada lista con datos, sin datos, cargando y con error, en claro y oscuro, y comparar estructura y colores con las 8 reglas.

**Acceptance Scenarios**:

1. **Given** cualquier lista de administración, **When** se abre, **Then** muestra sus filtros y búsqueda, sus tarjetas y su acción principal con la misma disposición y espaciado (16/12/24 px).
2. **Given** una lista vacía, cargando o con error, **When** se muestra, **Then** usa el estado vacío compartido con su acción, el indicador de marca o el aviso con reintento, sin textos nuevos.
3. **Given** los chips de filtro y los campos de búsqueda, **When** se usan en oscuro, **Then** sus bordes se distinguen y las etiquetas se leen completas.
4. **Given** una tarjeta de lista con acciones bloqueadas por una regla (por ejemplo un periodo con módulos), **When** se muestra, **Then** la regla se sigue explicando con contraste suficiente.
5. **Given** cualquier lista de administración, el índice de «Más» o los cambios, **When** se abre, **Then** muestra arriba una única cabecera compacta de marca (degradado verde, título de la pantalla y el número de elementos), sin patrón, con texto blanco que cumple 4.5:1 sobre ambos extremos del degradado, igual en claro y en oscuro.

---

### User Story 3 - Formularios de administración consistentes (Priority: P2)

Los formularios de módulo, sede, salón, docente, periodo, feriado, elemento de lista y SMTP comparten estructura: campos con relleno y borde tenue, etiquetas y errores por campo con rol de texto, botón principal único con ícono, acciones secundarias claras y diálogo de confirmación coherente.

**Why this priority**: Son las pantallas donde se cometen más errores de captura y donde más importa la claridad del error.

**Independent Test**: Abrir cada formulario en creación y edición, provocar errores de validación y de regla (por ejemplo salón con capacidad menor a la de inscritos), en claro y oscuro.

**Acceptance Scenarios**:

1. **Given** un formulario de administración, **When** se muestra, **Then** tiene un único botón principal con ícono a la izquierda y las demás acciones como secundarias, con objetivos de 48 px.
2. **Given** un error de campo o de regla, **When** se muestra, **Then** usa `errorText` con ícono y el borde de error del campo, legible en ambos modos.
3. **Given** un selector, un campo de fecha o un diálogo de confirmación, **When** se abren en oscuro, **Then** sus fondos, bordes y textos usan colores del modo oscuro.

---

### Edge Cases

- Nombres largos de módulo, sede, salón o docente, o tamaño de letra grande del sistema: nada se corta ni se solapa y los objetivos táctiles se mantienen en 48 px.
- Listas largas, con muchos filtros activos o con búsqueda sin resultados: las piezas siguen siendo las mismas.
- Cuenta inactiva, periodo cerrado o configuración incompleta: el estado se entiende sin depender del color.
- Cambio de modo con la pantalla abierta: cambia sin reiniciar y sin destellos.
- "Reducir movimiento" activo: las animaciones se omiten o se reducen.
- Lista sin elementos o con un solo elemento: la cabecera muestra el número (0 o 1) y la lista cae en su estado vacío debajo, sin duplicar el mensaje.
- Título largo de pantalla o número de tres cifras en la cabecera: no se corta ni cambia la altura de forma que tape contenido.
- Clave temporal del docente: sigue mostrándose una sola vez en su diálogo y con contraste suficiente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada una de las 22 pantallas de la fase 3 MUST cumplir las 8 reglas de revisión de `Design.md` (registro sobrio: sin degradado ni patrón, un solo foco, jerarquía por tipo) y usar solo roles de color del tema, en claro y oscuro.
- **FR-002**: Todo indicador de estado de las 22 pantallas y de las piezas que usan (`AppBar`, `AccountCard`, `StatusStackBar`, `SmtpSettingsScreen`) MUST usar `errorText`, `warningText`, `successText` o `primary` y cumplir 3:1 sobre su fondo real en ambos modos; los roles `error`, `warning` y `success` MUST quedar solo para rellenos (D-125).
- **FR-003**: La guarda de indicadores MUST ampliarse con las carpetas de la fase 3 (`accounts`, `periods`, `holidays`, `rooms`, `modules`, `dropdown-lists`, `smtp` y las piezas compartidas tocadas) y pasar. `shell` y `NotificationsBell` quedan fuera: sus insignias usan `error` como relleno del número blanco (D-125).
- **FR-004**: Las listas de administración MUST compartir estructura (filtros o búsqueda, tarjetas con la misma jerarquía, acción principal, estados vacío, de carga y de error con las piezas compartidas), sin textos nuevos.
- **FR-005**: Los formularios de administración MUST compartir estructura (campos con relleno y borde tenue, error de campo con `errorText` e ícono, un solo botón principal con ícono a la izquierda, acciones secundarias, confirmación con `ConfirmDialog`).
- **FR-006**: Los botones, chips, selectores, campos de fecha y diálogos de las 22 pantallas MUST cumplir `Design.md` (borde de controles `controlBorder`, texto de botones rellenos con 4.5:1, etiquetas sin recorte, objetivos de 48 px).
- **FR-007**: Toda acción bloqueada por una regla (periodo con módulos, salón con capacidad menor a la de inscritos, módulo con inscritos, eliminación con dependencias) MUST seguir mostrando la regla que la bloquea con contraste suficiente.
- **FR-008**: La fase 3 MUST NOT cambiar textos, rutas, datos, permisos ni reglas de negocio, ni la estructura y destinos de la barra de pestañas y cabecera; `StatusBadge` y `PqrsFiledScreen` (PQRS) quedan para la fase 4.
- **FR-009**: Se MUST conservar la accesibilidad de la spec 023 (etiquetas, roles, contraste, objetivos de 48 px, "reducir movimiento") y las guardas de las specs 026, 027 y 028.
- **FR-010**: El resultado de la revisión de cada pantalla (cumple, o defecto con causa y corrección) MUST quedar registrado en `screen-inventory.md`; cualquier defecto que se descubra durante la implementación o el recorrido final MUST corregirse en esta spec o asignarse a otra con motivo.
- **FR-011**: Si una pantalla necesita un rol, token o regla que `Design.md` no tiene, MUST añadirse primero al documento y al tema, y registrarse en `Decisions.md`.

- **FR-012**: `Design.md` MUST definir primero el tercer registro, «sobrio con cabecera» (un solo bloque compacto de degradado de marca arriba, título y contador, sin `BrandPattern`; el resto igual que el sobrio), con su regla comprobable, y registrarse en `Decisions.md`.
- **FR-013**: Cada lista de administración (módulos, sedes, salones, docentes, estudiantes, periodos, feriados, listas desplegables y elementos), el índice de «Más» y los cambios MUST llevar esa cabecera compacta como único bloque de color de la pantalla; los formularios y el detalle de módulo MUST seguir en registro sobrio sin cabecera.
- **FR-014**: La cabecera MUST reutilizar textos existentes (el título de la pantalla y, donde ya exista un texto que exprese la cantidad, ese texto; si no, solo el número) y MUST NOT introducir textos nuevos; el texto sobre el degradado MUST cumplir 4.5:1 y el cambio de modo MUST NOT producir destellos.

### Key Entities *(include if feature involves data)*

No hay datos nuevos. Se tocan solo presentación: tarjetas y filas de cuentas, periodos, feriados, sedes, salones, módulos y listas desplegables; campos y diálogos de formulario; el estado de configuración SMTP; el inventario de pantallas se completa con defectos y estado por pantalla.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las 22 pantallas cumplen el 100 % de las 8 reglas de `Design.md`, comprobado con una lista de revisión por pantalla en claro y en oscuro.
- **SC-002**: 0 defectos visuales abiertos en las 22 pantallas en el recorrido manual final (claro y oscuro), incluidos los dictados por la persona dueña del producto y los que aparezcan al aplicar los cambios.
- **SC-003**: 100 % de los indicadores de estado y de los elementos no textuales de las 22 pantallas pasan la matriz de contraste en ambos modos, y 0 usos de `palette.error`, `palette.warning` o `palette.success` como indicador en las carpetas de la fase.
- **SC-004**: Las 10 pantallas con cabecera (8 listas, cambios e índice de «Más») comparten estructura, y los formularios y el detalle de módulo comparten la suya: una persona que conoce una pantalla de cada grupo reconoce las demás en menos de 5 segundos.
- **SC-005**: 0 textos, rutas, reglas de negocio o permisos modificados: las pruebas existentes (administración, cuentas, periodos, feriados, SMTP, navegación, accesibilidad) pasan sin ajustes de comportamiento.
- **SC-006**: Las guardas automáticas de las specs 026, 027 y 028 pasan y no se añaden valores fuera del tema.
- **SC-007**: El cambio de modo del teléfono con cualquiera de las 22 pantallas abiertas se refleja sin reiniciar y sin destellos.
- **SC-008**: 100 % de las listas, el índice de «Más» y los cambios muestran la misma cabecera de marca, con un solo bloque de color y 0 patrones por pantalla, y una persona reconoce a primera vista que son del mismo conjunto en menos de 5 segundos.

## Assumptions

- Depende de las specs 026, 027 y 028 (PR de código #16, #17 y #18; de docs #19, #20 y #21); la rama se apila sobre ellas hasta que se fusionen.
- El inventario de la 026 es la lista de alcance; chat, PQRS y perfil quedan para la fase 4.
- Los textos existentes bastan; si una pieza necesitara un texto nuevo, se reutiliza uno existente o se registra como excepción.
- Los defectos del recorrido manual se incorporan al inventario antes de planear; los que correspondan a otras fases se asignan allí.
- La cabecera reutiliza la pieza de degradado que ya existe en los inicios (`HeroCard`) en formato compacto; no hay patrón ni colores nuevos.
- Sin cambios de backend ni dependencias nuevas.
