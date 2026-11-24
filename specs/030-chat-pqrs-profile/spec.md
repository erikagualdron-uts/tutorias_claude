# Feature Specification: Chat, PQRS y perfil renovados

**Feature Branch**: `030-chat-pqrs-profile`

**Created**: 2026-11-23

**Status**: Implemented (pending manual review: T023)

**Input**: User description: "Spec 030, fase 4 del rediseño de la app: el resto de pantallas (chat, PQRS, perfil y las que queden del inventario con fase 4). Aplicar el sistema de diseño de las specs 026 a 029 con el registro que corresponda a cada pantalla (sobrio, o sobrio con cabecera en las listas como mensajes y PQRS). Más elegante, moderno y llamativo, consistente entre estudiante, docente y CAE, cercano a la identidad UTS y con modo oscuro sin errores visuales. Incluir los indicadores pendientes en StatusBadge y PqrsFiledScreen y ampliar a esta fase las guardas severityIndicators y headerBudget. Sin cambios de backend, de textos, de reglas de negocio ni funcionalidad nueva. Incorporar los defectos del recorrido manual en el teléfono, incluida la etiqueta All de los chips que en inglés se veía como Al."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| Base lista (specs 026 a 029) | `Design.md` por roles (40, claro y oscuro), tres registros (sobrio, sobrio con cabecera y expresivo), `ScreenHeader`, `controlBorder`, regla de indicador de estado (D-125), estado vacío con patrón de marca y guardas (paridad, contraste, valores sueltos, indicadores, presupuesto de cabecera) |
| Alcance de la fase 4 | 20 rutas del inventario `specs/026-design-system/screen-inventory.md`: mensajes (lista, conversación y nuevo chat) en los tres roles; PQRS (mis solicitudes, detalle, radicada y nueva) en estudiante y docente; PQRS del CAE (lista y detalle); y cambio de clave. Como varias rutas montan la misma pantalla, son unas 11 pantallas distintas |
| Piezas que ya existen | `ChatScreen`, `MessagesScreen`, `NewChatScreen`, `MessageBubble`, `AnnouncementCard`, `Composer`, `TypingIndicator`; `MyPqrsScreen`, `AdminPqrsScreen`, `PqrsDetailScreen`, `AdminPqrsDetailScreen`, `NewPqrsScreen`, `PqrsFiledScreen`, `PqrsCard`, `PqrsBody`, `StatusBadge`; `SegmentedControl`, `FilterChips`, `SearchField`, `TextAreaField`, `ConfirmDialog`; `ChangePasswordScreen` sobre `AuthLayout` |
| Pendientes de la spec 028 y 029 que caen aquí | `StatusBadge` (estado de la PQRS con `success` y `warning`) y `PqrsFiledScreen` (ícono de éxito de 48 px con `success`), ambos de PQRS |
| Defecto ya conocido | En inglés, el chip de filtro «All» se veía como «Al» (en docentes, estudiantes y periodos); la corrección se aplicó en la spec 029 y está pendiente de confirmar en el teléfono; esta fase vuelve a comprobarlo en las listas de PQRS y mensajes |
| Defectos del recorrido manual | Uno: los filtros de PQRS se ven feos y son molestos. En el CAE son tres filas de chips apiladas (estado, tipo y rol del autor) que ocupan media pantalla antes de la primera solicitud; en estudiante y docente, una fila de cuatro chips |

Esta spec no cambia datos, textos, rutas, permisos ni reglas de negocio (chat, retención de mensajes, radicación y respuesta de PQRS, estados); cambia cómo se ven y se sienten estas pantallas y las piezas compartidas que usan.

## Clarifications

### Session 2026-11-23

- Q: ¿Qué defectos concretos vio en el teléfono en estas pantallas de chat, PQRS y perfil (claro y oscuro)? → A: Uno solo, en PQRS: los filtros se ven feos y son molestos para los usuarios. Causa medida en el código: la lista de PQRS del CAE apila tres filas de chips (estado, tipo y rol del autor) de 48 px con salto de línea, y las listas de estudiante y docente una fila de cuatro chips. El resto se vio bien (la forma de corregir los filtros se define en la pregunta siguiente).
- Q: ¿Cómo prefiere que se vean los filtros de las PQRS para que dejen de molestar? → A: Sin respuesta de la persona dueña del producto; se toma la opción recomendada B por defecto (supuesto, cambiable antes de implementar): cada grupo de filtros es una sola fila de chips compactos con desplazamiento horizontal, el chip activo se destaca con relleno de marca y el objetivo táctil sigue en 48 px. Descartadas por defecto: A (solo compactar, sigue ocupando espacio) y C (hoja de filtros: añade un paso y un texto de botón nuevo).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - PQRS con estados legibles y listas con presencia (Priority: P1)

Quien radica o responde una PQRS ve su estado (radicada, en revisión, resuelta) con texto, ícono y color legibles en ambos modos, y las listas de PQRS se ven con la misma cabecera de marca que las de administración.

**Why this priority**: Los indicadores de PQRS son el defecto medido que quedó pendiente y las listas de PQRS son la pantalla más visible de la fase.

**Independent Test**: Abrir mis PQRS (estudiante y docente) y las PQRS del CAE con solicitudes de los tres estados, con vacío, carga y error, en claro y oscuro; `severityIndicators` y `headerBudget` pasan para las carpetas de la fase.

**Acceptance Scenarios**:

1. **Given** una PQRS en cualquier estado, **When** se muestra en la lista o el detalle, **Then** su insignia se lee por texto e ícono y su color cumple 3:1 sobre su fondo real en ambos modos (rol de texto de severidad).
2. **Given** la pantalla de solicitud radicada, **When** se muestra, **Then** el ícono de éxito de 48 px cumple 3:1 en claro y oscuro.
3. **Given** las listas de mis PQRS y de PQRS del CAE, **When** se abren, **Then** llevan una única cabecera compacta de marca (título y número de solicitudes), sin patrón, igual que las listas de administración.
4. **Given** los chips de filtro de PQRS en inglés, **When** se muestran, **Then** la etiqueta «All» se lee completa.
5. **Given** los filtros de las listas de PQRS (estado en estudiante y docente; estado, tipo y rol del autor en el CAE), **When** se muestran, **Then** cada grupo ocupa una sola fila compacta con desplazamiento horizontal, el chip activo se distingue por relleno de marca y texto, el objetivo táctil de cada chip sigue siendo de 48 px, y la primera solicitud se ve sin desplazar la pantalla en un teléfono de 640 px de alto.

---

### User Story 2 - Mensajes con una conversación clara y coherente (Priority: P1)

En la lista de mensajes, la conversación y el nuevo chat, las burbujas, los avisos, el campo de escritura y el indicador de escritura se ven bien en claro y oscuro y se parecen entre estudiante, docente y CAE.

**Why this priority**: El chat es de uso diario de los tres roles y es donde el modo oscuro tiene más piezas propias (burbujas propias y ajenas, avisos, adjuntos).

**Independent Test**: Abrir mensajes y una conversación con mensajes propios, ajenos, un aviso del CAE y el indicador de escritura, en claro y oscuro, en los tres roles.

**Acceptance Scenarios**:

1. **Given** una conversación, **When** se muestra en oscuro, **Then** burbujas propias y ajenas, avisos, hora y estado de lectura cumplen el contraste y no dejan restos del modo claro.
2. **Given** la lista de mensajes, **When** se abre, **Then** lleva la cabecera compacta de marca con su título (sin número, porque la pantalla reúne avisos y conversaciones en dos pestañas), y el selector de vista (`SegmentedControl`) conserva borde y contraste.
3. **Given** el campo de escritura, **When** tiene foco, error o está deshabilitado, **Then** cumple `Design.md` en ambos modos, con el teclado en el modo del teléfono.
4. **Given** el nuevo chat, **When** se busca una persona, **Then** el campo de búsqueda, las tarjetas y los estados vacío y de carga son los compartidos.

---

### User Story 3 - Formularios y perfil de PQRS y cambio de clave (Priority: P2)

Los formularios de nueva PQRS, de respuesta del CAE y de cambio de clave comparten estructura con los de administración: campos con relleno y borde tenue, error de campo legible, un solo botón principal con ícono, y confirmaciones coherentes.

**Why this priority**: Son pantallas donde se cometen errores de captura y ya heredan buena parte del sistema; falta confirmar la estructura.

**Independent Test**: Abrir cada formulario en estado inicial, con error de campo y con regla bloqueada, en claro y oscuro.

**Acceptance Scenarios**:

1. **Given** el formulario de nueva PQRS, el de respuesta del CAE y el de cambio de clave, **When** se muestran, **Then** tienen un único botón principal con ícono a la izquierda, objetivos de 48 px y error de campo con rol de texto e ícono.
2. **Given** un diálogo de confirmación o un selector de tipo, **When** se abre en oscuro, **Then** usa fondos, bordes y textos del modo oscuro.

---

### Edge Cases

- Conversación con mensajes muy largos, nombres largos o tamaño de letra grande: nada se corta ni se solapa y los objetivos táctiles se mantienen en 48 px.
- Lista de PQRS con muchos filtros activos, sin resultados o con un solo elemento: la cabecera muestra el número (0 o 1) y debajo va el estado vacío compartido, sin duplicar el mensaje.
- Mensaje enviado, entregado, leído o fallido: el estado se entiende por ícono o texto, no solo por color.
- Cambio de modo con la pantalla abierta: cambia sin reiniciar y sin destellos.
- "Reducir movimiento" activo: las animaciones (indicador de escritura, entrada de burbujas) se omiten o se reducen.
- Etiqueta corta («All») en chips con letra grande: se ve completa en español e inglés.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada una de las pantallas de la fase 4 MUST cumplir las 8 reglas de revisión de `Design.md` según su registro (sobrio, o sobrio con cabecera) y usar solo roles de color del tema, en claro y oscuro.
- **FR-002**: Todo indicador de estado de las pantallas de la fase (`StatusBadge`, `PqrsFiledScreen`, estado de mensajes) MUST usar `errorText`, `warningText`, `successText` o `primary` y cumplir 3:1 sobre su fondo real en ambos modos; los roles `error`, `warning` y `success` MUST quedar solo para rellenos (D-125).
- **FR-003**: Las guardas MUST ampliarse a la fase: `severityIndicators.test.ts` suma las carpetas de chat, PQRS y autenticación (cambio de clave), y `headerBudget.test.ts` suma las pantallas con cabecera y las sobrias de la fase.
- **FR-004**: Las listas de mensajes, de mis PQRS y de PQRS del CAE MUST llevar el `ScreenHeader` compacto como único bloque de color de la pantalla, con título existente (y número en las dos listas de PQRS; en mensajes, sin número porque reúne dos pestañas), sin textos nuevos y sin patrón; la conversación, el nuevo chat y los detalles y formularios de PQRS MUST seguir en registro sobrio.
- **FR-005**: Las burbujas, avisos, campo de escritura e indicador de escritura del chat MUST cumplir `Design.md` en claro y oscuro (contraste de texto 4.5:1, bordes e íconos 3:1, sin restos del modo claro), y los mensajes propios y ajenos MUST distinguirse por más que el color (posición y forma).
- **FR-006**: Los botones, chips, selectores, campos y diálogos de la fase MUST cumplir `Design.md` (borde de controles `controlBorder`, texto de botones rellenos con 4.5:1, etiquetas sin recorte, objetivos de 48 px); la etiqueta «All» de los chips MUST verse completa en español e inglés en las listas de la fase.
- **FR-007**: Los estados vacío, de carga y de error de las pantallas de la fase MUST usar las piezas compartidas (`EmptyState`, `BrandLoader`, `Banner` con reintento), sin textos nuevos.
- **FR-008**: Toda acción bloqueada por una regla (por ejemplo responder una PQRS ya resuelta o enviar un mensaje fuera de las reglas de chat) MUST seguir mostrando la regla que la bloquea con contraste suficiente.
- **FR-009**: La fase 4 MUST NOT cambiar textos, rutas, datos, permisos ni reglas de negocio (chat, retención de mensajes, estados de PQRS), ni la estructura y destinos de la barra de pestañas y cabecera.
- **FR-010**: Se MUST conservar la accesibilidad de la spec 023 y las guardas de las specs 026 a 029.
- **FR-011**: El resultado de la revisión de cada pantalla (cumple, o defecto con causa y corrección) MUST quedar registrado en `screen-inventory.md`; cualquier defecto descubierto durante la implementación o el recorrido final MUST corregirse en esta spec o asignarse a otra con motivo.
- **FR-012**: Si una pantalla necesita un rol, token o regla que `Design.md` no tiene, MUST añadirse primero al documento y al tema, y registrarse en `Decisions.md`.
- **FR-013**: Los filtros de las listas de PQRS MUST presentarse como una fila compacta por grupo, con desplazamiento horizontal sin barra visible, chip activo con relleno de marca y texto `onPrimary`, objetivo táctil de 48 px (alto visual menor con zona de toque ampliada), sin perder ningún filtro actual ni añadir textos, y sin cambiar la lógica de filtrado.

### Key Entities *(include if feature involves data)*

No hay datos nuevos. Se tocan solo presentación: burbujas y avisos de chat, tarjetas e insignias de PQRS, campos y diálogos de formulario, y el inventario de pantallas, que se completa con defectos y estado por pantalla.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las pantallas de la fase 4 cumplen el 100 % de las 8 reglas de `Design.md`, comprobado con una lista de revisión por pantalla en claro y en oscuro.
- **SC-002**: 0 defectos visuales abiertos en el recorrido manual final (claro y oscuro, español e inglés), incluidos los dictados por la persona dueña del producto y la etiqueta «All».
- **SC-003**: 100 % de los indicadores de estado y de los elementos no textuales de la fase pasan la matriz de contraste en ambos modos, y 0 usos de `palette.error`, `palette.warning` o `palette.success` como indicador en las carpetas de la fase.
- **SC-004**: Las 3 pantallas con cabecera (mensajes, mis PQRS y PQRS del CAE) muestran la misma cabecera que las de administración, con un solo bloque de color y ningún patrón, y una persona las reconoce como del mismo conjunto en menos de 5 segundos.
- **SC-005**: 0 textos, rutas, reglas de negocio o permisos modificados: las pruebas existentes (chat, PQRS, cambio de clave, navegación, accesibilidad) pasan sin ajustes de comportamiento.
- **SC-006**: Las guardas automáticas de las specs 026 a 029 pasan y no se añaden valores fuera del tema.
- **SC-007**: El cambio de modo del teléfono con cualquiera de las pantallas abiertas se refleja sin reiniciar y sin destellos.
- **SC-008**: En la lista de PQRS del CAE, los filtros ocupan como máximo tres filas compactas (una por grupo) y la primera solicitud es visible sin desplazar la pantalla en un teléfono de 640 px de alto; los 3 grupos siguen siendo alcanzables y operables con el pulgar.

## Assumptions

- Depende de las specs 026 a 029 (PR de código #16 a #18 y la rama 029; de docs #19 a #21 y la rama 029); la rama se apila sobre ellas hasta que se fusionen.
- El inventario de la 026 es la lista de alcance; con esta fase queda cubierto todo el inventario de pantallas.
- Los textos existentes bastan; si una pieza necesitara un texto nuevo, se reutiliza uno existente o se registra como excepción.
- La corrección de la etiqueta «All» de la spec 029 queda por confirmar en el teléfono; si persiste, esta fase la corrige en `FilterChips` para todas las listas.
- La forma de los filtros (opción B) es un supuesto por falta de respuesta; si la persona dueña del producto prefiere A o C, se ajusta FR-013 antes de implementar.
- Sin cambios de backend ni dependencias nuevas.
