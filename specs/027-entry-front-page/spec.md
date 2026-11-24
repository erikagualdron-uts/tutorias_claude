# Feature Specification: Entrada y portada renovadas

**Feature Branch**: `027-entry-front-page`

**Created**: 2026-11-23

**Status**: Implemented (pending manual review: T009, T030)

**Input**: User description: "Spec 027, fase 1 del rediseño de la app: entrada y portada. Aplicar el sistema de diseño de la spec 026 (registro expresivo) a las 12 pantallas de la fase 1 del inventario: inicio de sesión y demás pantallas de autenticación, inicio de cada rol, bandeja de notificaciones y estados vacíos. Más elegante y moderno, consistente entre roles, cercano a la identidad UTS y con modo oscuro sin errores visuales. Sin cambios de backend, de textos ni funcionalidad nueva. Incorporar los defectos del recorrido manual en el teléfono."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| Base lista (spec 026) | `Design.md` por roles, 39 roles en claro y oscuro, dos registros visuales (sobrio y expresivo), 8 reglas comprobables y guardas automáticas (paridad, contraste, valores sueltos, componentes en oscuro) |
| Alcance de la fase 1 | 12 pantallas del inventario `specs/026-design-system/screen-inventory.md`: 5 de autenticación (inicio de sesión, registro, verificación de correo, olvido y restablecimiento de clave), 3 inicios (estudiante, docente, CAE), 3 bandejas de avisos (una por rol) y la pantalla de arranque |
| Piezas que ya existen | `AuthLayout` (cabecera con degradado, logo y patrón), `HeroCard`, `HeroSessionCard`, `MetricCard`, `Card`, `Banner`, `EmptyState`, `BrandLoader`, `LoadingScreen` |
| Defectos del recorrido manual | Dos: contraste insuficiente de botones y otros elementos en modo oscuro; chips de filtro «All» que muestran «Al». El resto de pantallas se vio bien |
| Registro asignado | Expresivo: autenticación, inicio de cada rol y estados vacíos. La bandeja de avisos figura como sobria en el inventario pero entra en esta fase por su relación con la campana (D-121) |

Esta spec no cambia datos, textos, rutas ni reglas de negocio; cambia cómo se ven y se sienten estas 12 pantallas.

## Clarifications

### Session 2026-11-23

- Q: ¿Qué defectos concretos vio en el teléfono (claro y oscuro)? → A: (1) En modo oscuro, el contraste de los botones y de otros elementos es insuficiente. (2) Los botones de filtro «All» muestran solo «Al» (texto cortado). Todo lo demás se vio bien.
- Los defectos vienen de piezas compartidas (botón, chip de filtro y similares), así que se corrigen en la pieza y benefician a las 58 pantallas, no solo a las 12 de la fase 1.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Una entrada que se siente de la UTS (Priority: P1)

Quien abre la app ve una pantalla de arranque y de inicio de sesión con identidad clara: cabecera de marca, logo oficial, patrón de hojas, plumas y libros, y un formulario limpio. Las cinco pantallas de autenticación se ven como una misma familia, en claro y en oscuro.

**Why this priority**: Es la primera impresión de todos los roles y la pantalla que ve cualquier usuario antes de entrar; define el tono expresivo para el resto.

**Independent Test**: Recorrer arranque, inicio de sesión, registro, verificación, olvido y restablecimiento en ambos modos y comprobar con la lista de reglas de `Design.md` (presupuesto expresivo, un solo foco, roles de color).

**Acceptance Scenarios**:

1. **Given** el teléfono en modo claro u oscuro, **When** se abre cualquiera de las cinco pantallas de autenticación, **Then** muestra una sola cabecera de marca con un solo patrón, el logo correcto para el modo y un único botón principal.
2. **Given** una pantalla de autenticación, **When** aparece el teclado, **Then** el formulario sigue visible y los campos conservan relleno, borde tenue y objetivo táctil de 48 px.
3. **Given** un error o aviso en el formulario, **When** se muestra, **Then** usa los roles de estado del modo activo y cumple el contraste mínimo.
4. **Given** la pantalla de arranque, **When** carga la sesión, **Then** no hay destello de fondo del otro modo ni salto visible al pasar a la primera pantalla.

---

### User Story 2 - Un inicio con presencia y consistente entre roles (Priority: P1)

El inicio de estudiante, docente y CAE comparten estructura: un bloque destacado arriba (próxima sesión o resumen), métricas y bloques de contenido debajo. Se ve elegante y con identidad UTS, y el usuario encuentra lo importante en el mismo lugar sin importar el rol.

**Why this priority**: Es la portada diaria de los tres roles y donde más se nota la falta de consistencia entre ellos.

**Independent Test**: Abrir el inicio de cada rol en claro y oscuro y verificar estructura común, presupuesto expresivo (un bloque de color, un patrón) y las 8 reglas de `Design.md`; las pruebas existentes de cada inicio siguen verdes.

**Acceptance Scenarios**:

1. **Given** el inicio de cualquier rol, **When** se abre, **Then** hay un único bloque destacado de marca arriba y el resto de bloques son tarjetas sobre el fondo de pantalla.
2. **Given** los inicios de los tres roles, **When** se comparan, **Then** usan los mismos componentes y el mismo espaciado (16 px de margen, 12 px entre tarjetas, 24 px entre secciones) para elementos equivalentes.
3. **Given** un inicio sin datos (sin próxima sesión, sin cambios, sin solicitudes), **When** se muestra, **Then** aparece el estado vacío expresivo con su acción, no un hueco ni un texto suelto.
4. **Given** el modo oscuro, **When** se abre cualquier inicio, **Then** no queda fondo claro residual y las métricas, tarjetas y bloque destacado son legibles.

---

### User Story 3 - Una bandeja de avisos clara y sin errores visuales (Priority: P2)

La bandeja de avisos de cada rol se ve igual en los tres roles: avisos no leídos distinguibles de los leídos, estado vacío cuidado, carga y error coherentes, sin franjas blancas ni textos perdidos en oscuro.

**Why this priority**: Es el destino de la campana y de los avisos; ya tuvo defectos visibles (franja blanca) y es la pantalla de trabajo más ligada a la portada.

**Independent Test**: Abrir la bandeja de cada rol con avisos, sin avisos, cargando y con error, en claro y oscuro, sin defectos visuales; las pruebas de la spec 024 (navegación) siguen verdes.

**Acceptance Scenarios**:

1. **Given** avisos leídos y no leídos, **When** se abre la bandeja, **Then** los no leídos se distinguen por más que el color (peso o marca) y todos cumplen el contraste.
2. **Given** una bandeja vacía, **When** se muestra, **Then** aparece el estado vacío expresivo con ícono, mensaje y acción.
3. **Given** el modo oscuro, **When** se abre la bandeja, **Then** no hay franja ni fondo de otro modo en ninguna zona, incluida la que queda bajo la última tarjeta.

---

### User Story 4 - Estados vacíos y de carga con identidad (Priority: P2)

Cuando no hay contenido, la app lo dice con una pieza de marca reconocible (ilustración con el patrón de la UTS, mensaje y acción), igual en todos los roles y en ambos modos; la carga usa el indicador de marca.

**Why this priority**: Los estados vacíos aparecen en la primera sesión de cada usuario nuevo, justo en la portada.

**Independent Test**: Provocar el estado vacío en los tres inicios y en las tres bandejas y confirmar que usan la misma pieza, con la misma estructura, en claro y oscuro.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla de la fase 1 sin contenido, **When** se muestra, **Then** usa el mismo estado vacío compartido con la misma jerarquía (ícono o patrón, mensaje, acción) y sin texto nuevo.
2. **Given** una pantalla de la fase 1 cargando, **When** se muestra, **Then** usa el indicador de marca y respeta "reducir movimiento".

---

### Edge Cases

- Textos largos (nombre de módulo, mensajes de error) o tamaño de letra grande del sistema: nada se corta ni se solapa y los objetivos táctiles se mantienen en 48 px.
- Teléfonos de pantalla pequeña con teclado abierto en autenticación: el formulario sigue siendo alcanzable.
- Cambio de modo con la app abierta en cualquiera de las 12 pantallas: cambia sin reiniciar y sin destellos.
- "Reducir movimiento" activo: las animaciones de entrada se omiten o se reducen.
- Etiqueta corta («All») en un chip con fuente corporativa o tamaño de letra del sistema grande: la etiqueta se ve completa; el chip crece, no recorta.
- Botón o chip sobre fondo distinto del de referencia (tarjeta, pantalla, bloque con degradado): el contraste se cumple en cada caso, no solo en uno.
- Sesión que expira o red caída en el arranque: la pantalla de error mantiene el registro visual.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Cada una de las 12 pantallas de la fase 1 MUST cumplir las 8 reglas de revisión de `Design.md` y usar solo roles de color del tema, en claro y oscuro.
- **FR-002**: Las cinco pantallas de autenticación MUST compartir cabecera de marca (degradado, logo del modo, un patrón), estructura de formulario y un único botón principal.
- **FR-003**: Los inicios de estudiante, docente y CAE MUST compartir estructura (bloque destacado, métricas, bloques) y espaciado, con un solo bloque de color y un patrón.
- **FR-004**: Las bandejas de avisos de los tres roles MUST verse y comportarse igual, distinguir leído de no leído sin depender solo del color y no dejar franjas de fondo de otro modo.
- **FR-005**: Los estados vacíos de la fase 1 MUST usar una única pieza compartida con ícono o patrón, mensaje y acción.
- **FR-006**: La pantalla de arranque MUST mostrar el fondo del modo activo desde el primer cuadro y pasar a la siguiente sin destello.
- **FR-007**: Los cambios MUST respetar `CLAUDE.md` (lima nunca como texto sobre blanco, 48 px, íconos solar, botones con ícono a la izquierda, Myriad Pro vía tokens, campos con relleno y borde tenue, decoración solo con `BrandPattern`).
- **FR-008**: La fase 1 MUST NOT cambiar textos, rutas, datos, permisos ni la estructura y destinos de la barra de pestañas y cabecera.
- **FR-009**: La accesibilidad de la spec 023 (etiquetas, roles, contraste, objetivos de 48 px, "reducir movimiento") MUST seguir cumpliéndose en las 12 pantallas.
- **FR-010**: Cada defecto del recorrido manual MUST quedar registrado en `screen-inventory.md` con su pantalla y modo, y corregido en esta spec o asignado a otra con motivo.
- **FR-013**: En modo oscuro, el texto y el borde o relleno de todo botón (cada variante y estado: normal, presionado, deshabilitado, foco) y de los elementos interactivos compartidos (chips, pestañas) MUST cumplir el contraste mínimo (texto 4.5:1; borde, ícono e indicador 3:1), medido sobre el fondo real en que se muestran (pantalla, tarjeta o bloque de marca) y no solo sobre un fondo de referencia. El 3:1 de borde aplica a los botones `outlined` y `tonal` y a los chips sin seleccionar; los botones rellenos (primario, éxito, advertencia, destructivo) se identifican por su texto (4.5:1); el campo de texto conserva su borde tenue (D-123) y se identifica por relleno, etiqueta y borde de foco (3:1).
- **FR-014**: Los chips de filtro y los botones con texto corto (p. ej. «All», «Todos») MUST mostrar su etiqueta completa, sin recortes, con cualquier tamaño de letra del sistema y en ambos idiomas; ninguna pieza compartida MUST recortar el texto por la medida del contenedor.
- **FR-011**: Las guardas de la spec 026 (paridad, contraste, valores sueltos, modo oscuro de componentes, `Design.md` sincronizado) MUST seguir en verde.
- **FR-012**: Si una pantalla necesita un rol, token o regla que `Design.md` no tiene, MUST añadirse primero al documento y al tema, y registrarse en `Decisions.md`.

### Key Entities *(include if feature involves data)*

No hay datos nuevos. Se tocan solo presentación: el inventario de pantallas (se completa con defectos y estado por pantalla) y las piezas compartidas de interfaz.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Las 12 pantallas cumplen el 100 % de las 8 reglas de `Design.md`, comprobado con una lista de revisión por pantalla en claro y en oscuro.
- **SC-002**: 0 defectos visuales abiertos en las 12 pantallas en el recorrido manual (claro y oscuro), incluidos los dictados por la persona dueña del producto.
- **SC-003**: Los tres inicios comparten estructura: una persona identifica el bloque destacado, las métricas y los bloques en el mismo orden en los tres roles en menos de 5 segundos.
- **SC-004**: 0 textos, rutas o permisos modificados: las pruebas existentes (navegación 024, accesibilidad 023, inicios y bandejas) siguen pasando sin ajustes.
- **SC-005**: Las guardas automáticas de la spec 026 pasan y no se añaden valores fuera del tema.
- **SC-006**: El cambio de modo del teléfono con cualquiera de las 12 pantallas abiertas se refleja sin reiniciar y sin destellos.
- **SC-007**: 100 % de las variantes y estados de botón y de chip, en modo oscuro, pasan la matriz de contraste sobre cada fondo donde se usan (texto 4.5:1 en todos; borde 3:1 en `outlined`, `tonal` y chips sin seleccionar); 0 etiquetas recortadas en chips y botones en español e inglés con el tamaño de letra del sistema al máximo.

## Assumptions

- Esta spec depende de la 026 (PR de documentos #19 y de código #16); la rama se apila sobre ellas hasta que se fusionen.
- El inventario de la 026 es la lista de alcance; las 46 pantallas restantes quedan para las fases 2 (módulos y horario), 3 (administración) y 4 (resto).
- Los textos existentes bastan; si una pieza nueva (p. ej. el estado vacío) necesitara un texto, se reutiliza uno existente o se registra como excepción.
- Los defectos del recorrido manual se incorporan al inventario antes de planear; los que correspondan a otras fases se asignan allí.
- Los dos defectos dictados nacen en piezas compartidas; se corrigen una vez en la pieza y se verifican en todas las pantallas que la usan (los chips «All» están en pantallas de las fases 2 a 4, pero la corrección entra aquí).
- Sin cambios de backend ni dependencias nuevas; el patrón de marca y las ilustraciones salen de `BrandPattern` y de los recursos oficiales en `assets/brand/`.
