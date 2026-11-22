# Feature Specification: Loader de la marca

**Feature Branch**: `007-brand-loader`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Funcionalidad 007: Loader de la marca. Un indicador de carga propio de la UTS que reemplaza todo spinner del sistema: un solo ícono de la marca por iteración, que va cambiando entre libro, pluma y hoja. Seguir D-078 y la sección Loader de docs/Design.md."

## Clarifications

### Session 2026-11-17

- Q: ¿Se muestra el loader también en las actualizaciones en segundo plano de una pantalla que ya tiene datos? → A: No; solo en la primera carga, cuando todavía no hay datos que mostrar. Las actualizaciones en segundo plano son silenciosas y el contenido sigue visible.
- Q: ¿El loader debe aparecer de inmediato o esperar un poco? → A: Por fases según el tiempo de espera: en los primeros 300 ms no aparece nada; de 300 a 1000 ms aparece el loader normal; pasados 1000 ms, el loader sigue y se agrega un aviso de que la carga está tardando más de lo normal. Los botones en carga muestran su loader compacto de inmediato y sin aviso.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver un loader propio de la UTS al cargar una pantalla (Priority: P1)

Cuando una pantalla o un área de contenido está cargando datos, la persona ve un indicador propio de la marca en lugar del spinner del sistema: un solo ícono centrado que en cada iteración cambia, en este orden, entre un libro abierto, una pluma y una hoja, y vuelve al libro.

**Why this priority**: Es lo que ve toda persona en cada carga; sin él, la app sigue viéndose ajena a la identidad institucional.

**Independent Test**: Abrir una pantalla con datos lentos (por ejemplo, el listado de periodos con la red limitada) y comprobar que aparece el loader con la secuencia libro → pluma → hoja → libro, y que desaparece al llegar los datos.

**Acceptance Scenarios**:

1. **Given** una pantalla que acaba de empezar a cargar, **When** pasan menos de 300 ms, **Then** no se muestra nada nuevo; si los datos llegan antes, el loader nunca aparece.
2. **Given** una carga que supera los 300 ms, **When** se muestra el loader, **Then** aparece un solo ícono de la marca centrado, empezando por el libro abierto, sin texto.
3. **Given** una carga que supera los 1000 ms, **When** el loader lleva visible hasta ese momento, **Then** debajo del ícono aparece el aviso "Cargando… Esto está tardando más de lo normal." y el loader sigue girando entre íconos.
4. **Given** el loader visible, **When** pasa una iteración, **Then** el ícono se desvanece y aparece el siguiente en el orden libro → pluma → hoja → libro, sin que dos íconos se vean a la vez.
5. **Given** el loader visible, con o sin aviso de demora, **When** llegan los datos, **Then** el loader desaparece y se muestra el contenido, el estado vacío o el error, según corresponda.
6. **Given** un área de contenido que se vuelve a cargar, **When** se muestra de nuevo el loader, **Then** la secuencia empieza otra vez por el libro.
7. **Given** una pantalla que ya muestra datos, **When** se actualizan en segundo plano, **Then** no aparece el loader y el contenido sigue visible.
8. **Given** el loader visible sobre fondo claro, **When** se ve en pantalla, **Then** el ícono es verde profundo; sobre un fondo oscuro es blanco.

---

### User Story 2 - Ver el loader dentro de un botón en carga (Priority: P1)

Cuando una acción se está enviando (guardar, activar, eliminar, iniciar sesión), el botón muestra una versión compacta del mismo loader en lugar de su ícono, y no cambia de ancho.

**Why this priority**: Los botones en carga se ven en cada formulario; deben sentirse parte del mismo sistema.

**Independent Test**: Pulsar "Guardar" en un formulario con la red lenta y comprobar que el ícono del botón se reemplaza por el loader compacto, que el botón mantiene su ancho y que no se puede pulsar de nuevo mientras carga.

**Acceptance Scenarios**:

1. **Given** un botón con ícono, **When** su acción empieza, **Then** el ícono se reemplaza de inmediato por el loader compacto con el mismo color que el texto del botón, sin esperar 300 ms.
2. **Given** un botón en carga, **When** se compara con su estado normal, **Then** su ancho y su alto no cambian.
3. **Given** un botón en carga, **When** la persona lo vuelve a pulsar, **Then** la acción no se repite.
4. **Given** un botón cuya acción termina, **When** responde el servidor, **Then** el loader desaparece y el botón recupera su ícono.

---

### User Story 3 - Accesibilidad y "reducir movimiento" (Priority: P2)

Las personas que usan lector de pantalla saben que algo está cargando, y quienes tienen activado "reducir movimiento" ven el cambio de ícono sin animación.

**Why this priority**: Es un requisito de diseño del proyecto y de accesibilidad, pero no bloquea el uso básico.

**Independent Test**: Con el lector de pantalla activado, abrir una pantalla en carga y comprobar que se anuncia un solo mensaje de carga; con "reducir movimiento" activado, comprobar que los íconos cambian de golpe, sin fundido.

**Acceptance Scenarios**:

1. **Given** el loader visible y un lector de pantalla activo, **When** el lector lo enfoca, **Then** anuncia una sola vez "Cargando…" en el idioma de la app, y el cambio de ícono no genera anuncios nuevos.
2. **Given** "reducir movimiento" activado, **When** se muestra el loader, **Then** el ícono cambia en cada iteración sin fundido ni movimiento.
3. **Given** un lector de pantalla activo y una carga que pasa de 1000 ms, **When** aparece el aviso de demora, **Then** el lector lo anuncia una sola vez.
4. **Given** el idioma de la app en inglés, **When** se muestra el loader, **Then** la etiqueta accesible es "Loading…".

---

### User Story 4 - Ningún spinner del sistema en la app (Priority: P2)

Todo estado de carga de la app existente usa el loader de la marca; no queda ningún spinner del sistema.

**Why this priority**: Garantiza la consistencia y evita que vuelva a aparecer un indicador distinto en futuras funcionalidades.

**Independent Test**: Recorrer las pantallas de inicio de sesión, registro, recuperación de contraseña, cambio de clave, creación de docente, periodos, salones, ubicaciones y listas desplegables con la red lenta, y comprobar que en ninguna aparece el spinner del sistema; además, una verificación automática falla si el código vuelve a usarlo.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla existente en carga, **When** se ve el indicador, **Then** es el loader de la marca.
2. **Given** el arranque de la app mientras se restaura la sesión, **When** se muestra la pantalla de espera, **Then** usa el loader de la marca.
3. **Given** código nuevo que use el spinner del sistema, **When** se ejecutan las verificaciones del proyecto, **Then** fallan y señalan el uso.

---

### Edge Cases

- Una pantalla con datos que se actualiza en segundo plano: el contenido se mantiene y no aparece el loader (la acción que la persona inicia, como guardar, sí usa el loader del botón).
- Una carga que termina antes de 300 ms: no se muestra ningún loader ni aviso.
- Una carga que termina justo después de mostrarse el loader: se retira sin esperar a completar la iteración en curso.
- Una carga que supera los 1000 ms y luego termina: el loader y el aviso desaparecen juntos al llegar los datos.
- Una carga que falla pasados los 1000 ms: el aviso de demora se retira y se muestra el estado de error con su opción de reintentar.
- Un loader que se oculta y se vuelve a mostrar (por ejemplo, un reintento): el conteo de tiempo y la secuencia vuelven a empezar (300 ms sin nada, luego el libro).
- Varios botones o áreas en carga a la vez: cada uno muestra su propio loader y no se sincronizan entre sí.
- Texto del sistema muy grande (accesibilidad de tamaño de letra): el loader conserva su tamaño y no recorta el contenido vecino.
- Falta de conexión mientras carga: el loader se retira y se muestra el estado de error con su opción de reintentar.
- Modo oscuro: el ícono se ve en blanco sobre superficies oscuras y mantiene el contraste.

## Requirements *(mandatory)*

### Functional Requirements

**Comportamiento del loader**

- **FR-001**: La app MUST mostrar, como único indicador de carga, un loader propio con **un solo ícono de la marca a la vez**, centrado y sin anillo, pista ni forma alrededor. El único texto que puede acompañarlo es el aviso de demora de FR-016.
- **FR-002**: El loader MUST cambiar de ícono en cada iteración en el orden fijo **libro abierto → pluma → hoja → libro abierto**, y MUST empezar siempre por el libro cuando se muestra.
- **FR-003**: Cada iteración MUST durar 900 ms: el ícono aparece en 250 ms, se sostiene 400 ms y se desvanece en 250 ms, y el siguiente empieza de inmediato.
- **FR-004**: El loader MUST usar solo fundidos: sin movimiento, giro ni escalado. *(Reemplazado por la spec 009: el loader v2 lleva anillo y sacudida.)*
- **FR-005**: El loader MUST NOT dibujar círculos, arcos ni otras figuras geométricas, de acuerdo con las reglas de diseño del proyecto. *(Reemplazado por la spec 009: el loader v2 lleva anillo y sacudida.)*

**Tamaños y colores**

- **FR-006**: El loader MUST existir en dos tamaños: regular (48 px) para pantallas y áreas de contenido, y compacto (20 px) para botones y filas en línea.
- **FR-007**: El ícono MUST ser verde profundo `#34531F` sobre fondos claros y blanco sobre botones rellenos y superficies oscuras.

**Dónde se usa**

- **FR-008**: Las pantallas y las áreas de contenido MUST mostrar el loader regular en su primera carga, mientras todavía no hay datos que mostrar; las actualizaciones en segundo plano de datos ya visibles MUST NOT mostrarlo ni ocultar el contenido.
- **FR-009**: Un botón con una acción en curso MUST reemplazar su ícono por el loader compacto, conservar su ancho y su alto, y no aceptar una nueva pulsación mientras carga.
- **FR-010**: La pantalla de espera del arranque (restauración de la sesión) MUST usar el loader regular.
- **FR-011**: Todo indicador de carga existente en la app (autenticación, creación de docentes, periodos, salones, ubicaciones y listas desplegables) MUST sustituirse por el loader de la marca.
- **FR-012**: Los esqueletos (skeletons) de listas y tarjetas MAY seguir usándose donde el diseño los prevea, y no forman parte de este cambio.

**Accesibilidad e idioma**

- **FR-013**: El loader MUST exponerse a los lectores de pantalla como un solo elemento de progreso, con la etiqueta traducida "Cargando…" / "Loading…" y estado ocupado; los íconos MUST ocultarse a los lectores y la etiqueta MUST NOT cambiar con el ícono. El aviso de demora MUST anunciarse una sola vez cuando aparece.
- **FR-014**: Con "reducir movimiento" activado, el loader MUST cambiar de ícono cada 900 ms sin fundido.
- **FR-015**: La etiqueta accesible MUST salir de los archivos de traducción en español e inglés; ningún texto va escrito en el componente.

**Fases de espera**

- **FR-016**: En pantallas y áreas de contenido, el loader regular MUST mostrarse por fases según el tiempo transcurrido desde que empieza la carga: de 0 a 300 ms no se muestra nada; de 300 a 1000 ms se muestra el loader normal sin texto; pasados 1000 ms se mantiene el loader y se agrega, debajo del ícono, el aviso de que la carga está tardando más de lo normal.
- **FR-017**: El aviso de demora MUST decir "Cargando… Esto está tardando más de lo normal." en español y "Loading… This is taking longer than usual." en inglés, salir de los archivos de traducción, y retirarse junto con el loader cuando la carga termina o falla.
- **FR-018**: Los botones en carga MUST mostrar su loader compacto de inmediato, sin la espera de 300 ms y sin aviso de demora, porque la persona acaba de pulsar y necesita respuesta inmediata.

**Protección contra regresiones**

- **FR-019**: El proyecto MUST incluir una verificación automática que falle si el código de la app vuelve a usar el spinner del sistema.

### Key Entities

No aplica: es un componente visual sin datos propios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los indicadores de carga de las pantallas y botones existentes muestran el loader de la marca, y en ninguna aparece el spinner del sistema.
- **SC-002**: En una grabación de una carga larga, la secuencia de íconos siempre sigue el orden libro → pluma → hoja → libro, con un solo ícono visible en cada momento.
- **SC-003**: Un botón en carga conserva el 100 % de su ancho y alto respecto de su estado normal.
- **SC-004**: Con "reducir movimiento" activado, ninguna carga muestra fundidos ni movimiento.
- **SC-005**: Con lector de pantalla, cada carga se anuncia como un solo mensaje de "Cargando…" en el idioma de la app, sin repeticiones al cambiar de ícono.
- **SC-006**: Si el código vuelve a usar el spinner del sistema, las verificaciones del proyecto fallan antes de unir el cambio.
- **SC-007**: En una revisión con al menos 5 personas, la mayoría reconoce el loader como "de la UTS" (libro, pluma y hoja de la marca) y ninguna lo confunde con un error o una pantalla congelada.
- **SC-008**: En una carga de unos 2 segundos, el loader no se ve durante los primeros 300 ms, se ve sin texto hasta el segundo 1 y desde el segundo 1 muestra el aviso de demora; en una carga de 200 ms no se ve nada.

## Assumptions

- La app ya tiene los íconos de libro, pluma y hoja registrados (los mismos del patrón decorativo de la marca); este cambio no agrega íconos nuevos.
- Los umbrales de 300 ms y 1000 ms son fijos y se cuentan desde que empieza la carga; no se configuran.
- Al retirarse (por llegar los datos o por un error) el loader no espera a completar la iteración en curso ni tiene una duración mínima.
- Un loader que se vuelve a mostrar siempre empieza por el libro; no recuerda en qué ícono iba.
- El orden de los íconos y las duraciones son fijos y no se configuran.
- Los esqueletos de listas y tarjetas quedan como están; reemplazarlos o rediseñarlos queda fuera de este cambio.
- La pantalla de bienvenida (splash) del sistema operativo no cambia; el cambio aplica a las pantallas dentro de la app.
- Fuera de alcance: nuevas pantallas de carga donde hoy no existen, indicadores de progreso con porcentaje, y cualquier cambio en los esqueletos.
- Depende de lo ya documentado en D-078, en la sección Loader de `docs/Design.md` y en D-049 (íconos decorativos de la marca).
