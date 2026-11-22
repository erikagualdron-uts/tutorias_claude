# Feature Specification: Loader de la marca, versión 2

**Feature Branch**: `009-brand-loader-v2`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Necesito lo del loader 009 Loader v.2" — el loader de la marca suma un anillo giratorio alrededor del ícono y un cambio de tamaño suave de cada ícono al entrar y al salir (sin sacudida, D-082). Seguir D-080 y la sección Loader de docs/Design.md.

> **Ajuste posterior (D-082):** el ícono pasa a 32 px (14 px compacto) y **no hay sacudida lateral**: cada ícono crece de 50 % a 100 % al entrar y se reduce al salir, y el conjunto solo se desvanece 150 ms. Donde las clarificaciones o el historial hablen de sacudida o de íconos de 48 y 20 px, manda D-082 y la sección Loader de `docs/Design.md`.

## Clarifications

### Session 2026-11-17

- Q: ¿El loader compacto de un botón aparece y desaparece de golpe o con un fundido corto? → A: Con un fundido de 150 ms al aparecer y al desaparecer, sin sacudida.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver un anillo que indica que la app está cargando (Priority: P1)

Mientras una pantalla o un área de contenido carga, la persona ve el ícono de la marca (libro, pluma o hoja) rodeado por un anillo fino que gira. El anillo dice, de un vistazo, que la app está trabajando, aunque el ícono se quede unos instantes en el mismo lugar.

**Why this priority**: Es la señal visual que pidió el equipo tras probar el loader v1: sin ella, el ícono cambiante no siempre se entiende como "cargando".

**Independent Test**: Abrir una pantalla con la red lenta y comprobar que, pasados los 300 ms de espera, aparece el ícono dentro de un anillo que gira de forma continua y que desaparece junto con el ícono al llegar los datos.

**Acceptance Scenarios**:

1. **Given** una carga que supera los 300 ms, **When** aparece el loader, **Then** el ícono de la marca está rodeado por un anillo formado por una pista tenue y un arco más intenso.
2. **Given** el loader visible, **When** pasa un segundo, **Then** el arco ha dado una vuelta completa a velocidad constante, sin saltos ni pausas.
3. **Given** el loader visible, **When** el ícono cambia (libro → pluma → hoja), **Then** el anillo sigue girando sin interrupción y el ícono permanece centrado y derecho dentro de él.
4. **Given** el aviso de demora visible (más de 1000 ms), **When** se ve el loader, **Then** el anillo no toca ni tapa el mensaje de abajo.
5. **Given** una superficie clara, **When** se ve el anillo, **Then** el arco y el ícono son verde profundo y la pista es el mismo verde muy tenue; sobre una superficie oscura son casi blancos, nunca lima.

---

### User Story 2 - Cada ícono crece al entrar y se reduce al salir (Priority: P1)

Cada ícono de la marca (libro, pluma, hoja) crece mientras entra y se reduce mientras se va, siempre centrado dentro del anillo, de modo que el cambio entre íconos se sienta fluido en lugar de un simple fundido. No hay sacudida lateral.

**Why this priority**: Es la segunda petición del equipo; da la sensación de fluidez que pide el estilo moderno de la app. (Primero se pidió una sacudida del conjunto y luego una por ícono; ambas se descartaron, D-082.)

**Independent Test**: Con la red lenta, observar el loader unos segundos: cada ícono crece al aparecer, descansa a tamaño completo y se reduce al irse, sin moverse de lado a lado y sin tocar el anillo.

**Acceptance Scenarios**:

1. **Given** el loader visible, **When** un ícono entra, **Then** durante 250 ms crece de la mitad de su tamaño al tamaño completo mientras su opacidad sube de 0 a 100 %, siempre centrado.
2. **Given** un ícono a tamaño completo, **When** pasan 400 ms, **Then** empieza a salir: durante 250 ms se reduce a la mitad mientras su opacidad baja a 0.
3. **Given** el cambio de un ícono al siguiente, **When** el primero se reduce, **Then** el siguiente empieza a crecer justo después y nunca se ven dos íconos a la vez.
4. **Given** cualquier momento de la animación, **When** se mira el ícono, **Then** no se mueve de lado a lado y no toca el anillo ni el aviso de demora.
5. **Given** el loader que aparece o se va, **When** pasa su entrada o su salida, **Then** el conjunto (ícono, anillo y aviso) se desvanece en 150 ms, sin esperar a que el contenido espere, y el contenido se muestra sin demora.
6. **Given** una carga que termina antes de los 300 ms, **When** llegan los datos, **Then** no se ve el loader ni ninguna animación.

---

### User Story 3 - Loader compacto con anillo dentro de los botones (Priority: P2)

Un botón con una acción en curso muestra el ícono con su anillo en tamaño compacto, de inmediato, sin mensaje, y sin cambiar de tamaño.

**Why this priority**: Mantiene la coherencia del indicador en los botones, pero el comportamiento ya existe en la versión 1; solo cambia su aspecto.

**Independent Test**: Pulsar "Guardar" con la red lenta y comprobar que el ícono del botón se reemplaza de inmediato por el ícono compacto con su anillo girando, que el botón no cambia de tamaño y que no hay sacudida.

**Acceptance Scenarios**:

1. **Given** un botón con ícono, **When** su acción empieza, **Then** el ícono compacto rodeado de su anillo empieza a aparecer de inmediato con un fundido de 150 ms, con el mismo color que el texto del botón, sin esperar 300 ms.
2. **Given** un botón en carga, **When** se compara con su estado normal, **Then** su ancho y su alto no cambian y el anillo cabe sin recortarse.
3. **Given** un botón en carga, **When** empieza o termina la acción, **Then** no hay aviso de demora.
4. **Given** un botón cuya acción termina, **When** responde el servidor, **Then** el loader se desvanece en 150 ms mientras el botón recupera su ícono, sin retrasar el siguiente estado de la pantalla.
5. **Given** un botón en carga, **When** la persona lo vuelve a pulsar, **Then** la acción no se repite.

---

### User Story 4 - "Reducir movimiento" y accesibilidad (Priority: P2)

Quien tiene activado "reducir movimiento" ve un loader sin giro ni cambio de tamaño, y quien usa lector de pantalla sigue oyendo una sola señal de carga, sin que el anillo la complique.

**Why this priority**: Es un requisito de diseño y de accesibilidad del proyecto; no bloquea el uso básico.

**Independent Test**: Con "reducir movimiento" activado, abrir una pantalla en carga y comprobar que no hay giro ni cambio de tamaño; con el lector de pantalla activo, comprobar que se anuncia un solo "Cargando…".

**Acceptance Scenarios**:

1. **Given** "reducir movimiento" activado, **When** aparece el loader, **Then** entra con un fundido de 150 ms.
2. **Given** "reducir movimiento" activado, **When** el loader se va, **Then** sale con un fundido de 150 ms.
3. **Given** "reducir movimiento" activado, **When** el loader está visible, **Then** el anillo no gira: queda fijo y su arco pulsa entre 40 % y 100 % de opacidad cada 1,2 segundos.
4. **Given** "reducir movimiento" activado, **When** pasa una iteración, **Then** el ícono cambia sin fundido, como en la versión 1.
5. **Given** un lector de pantalla activo, **When** enfoca el loader, **Then** anuncia una sola vez "Cargando…" (o "Loading…" en inglés); el anillo y el ícono se ocultan al lector y el aviso de demora se anuncia una sola vez al aparecer.

---

### Edge Cases

- Una carga que termina antes de 300 ms: no se ve nada, ni anillo ni animación (se conserva el comportamiento de la versión 1).
- Una carga que termina mientras un ícono todavía está creciendo: el conjunto se desvanece en 150 ms desde el estado actual, sin saltos.
- Un loader que se oculta y se vuelve a mostrar (por ejemplo, un reintento): vuelve a esperar 300 ms, entra con un fundido y empieza por el libro.
- Una carga que falla pasados los 1000 ms: el conjunto (ícono, anillo y aviso) se va con el fundido y se muestra el estado de error.
- Varios loaders a la vez (botones o áreas distintas): cada uno gira y entra por su cuenta sin sincronizarse con los demás.
- Modo oscuro: ícono y anillo en el color de texto casi blanco; sobre botones rellenos, en el color del texto del botón.
- Texto del sistema muy grande: el loader conserva su tamaño y no empuja ni recorta el contenido vecino.
- Un botón de altura mínima: el anillo compacto cabe sin alterar el tamaño del botón.

## Requirements *(mandatory)*

### Functional Requirements

**Anillo giratorio**

- **FR-001**: El loader MUST mostrar un anillo alrededor del ícono de la marca, formado por una pista tenue y un arco más intenso, y MUST mantener el ícono centrado y derecho dentro de él.
- **FR-002**: El arco del anillo MUST abarcar un cuarto de la circunferencia (90°), con extremos redondeados, y MUST dar una vuelta por segundo a velocidad constante.
- **FR-003**: En el tamaño regular, el anillo MUST medir 64 px de lado a lado con 3 px de grosor; en el compacto, 28 px con 2 px de grosor. El ícono MUST medir 32 px (regular) y 14 px (compacto), de modo que nunca toque el anillo.
- **FR-004**: El arco MUST tener el color del ícono y la pista ese mismo color al 20 % de opacidad.
- **FR-005**: El anillo MUST NOT tocar ni tapar el aviso de demora que se muestra debajo del loader.

**Entrada y salida de cada ícono**

- **FR-006**: Mientras un ícono entra (250 ms), el loader MUST hacerlo crecer de la mitad de su tamaño al tamaño completo, centrado, mientras su opacidad pasa de 0 a 100 %.
- **FR-007**: Mientras un ícono se va (250 ms), el loader MUST reducirlo del tamaño completo a la mitad, centrado, mientras su opacidad pasa de 100 % a 0.
- **FR-008**: La salida del loader MUST NOT retrasar la aparición del contenido ni de un estado de error.
- **FR-009**: El loader MUST NOT moverse de lado a lado en ningún momento (no hay sacudida) y MUST NOT mostrar ninguna animación cuando la carga termina antes de los 300 ms de espera.
- **FR-010**: El conjunto (ícono, anillo y aviso) MUST aparecer y desaparecer con un fundido de 150 ms, tanto en pantallas como en botones.
- **FR-011**: Si el aviso de demora está visible, MUST salir junto con el ícono y el anillo, como parte del mismo conjunto.

**Botones**

- **FR-012**: Un botón en carga MUST mostrar de inmediato el ícono compacto con su anillo, con el color del texto del botón, apareciendo y desapareciendo con un fundido de 150 ms, sin sacudida ni aviso de demora, sin cambiar de tamaño y sin recortar el anillo. El fundido MUST NOT retrasar la acción ni el siguiente estado de la pantalla.

**Colores**

- **FR-013**: El ícono y el anillo MUST ser verde profundo `#34531F` sobre superficies claras, el color de texto casi blanco del tema sobre superficies oscuras (nunca lima), y el color del texto del botón sobre botones rellenos.

**Reducir movimiento y accesibilidad**

- **FR-014**: Con "reducir movimiento" activado, el loader MUST NOT girar ni cambiar el tamaño de los íconos (el fundido de 150 ms de los botones se mantiene, porque no es movimiento): entra y sale con un fundido de 150 ms, el anillo queda fijo y su arco pulsa entre 40 % y 100 % de opacidad cada 1,2 segundos, y el ícono cambia cada 900 ms sin fundido.
- **FR-015**: El anillo y el ícono MUST ocultarse a los lectores de pantalla; el loader MUST seguir exponiéndose como un solo elemento de progreso con la etiqueta traducida "Cargando…" / "Loading…" y estado ocupado, y MUST anunciar el aviso de demora una sola vez cuando aparece.

**Comportamiento que se conserva de la versión 1**

- **FR-016**: Se MUST conservar sin cambios la secuencia de íconos (libro → pluma → hoja → libro, 900 ms cada uno), las fases de espera (nada hasta 300 ms, loader de 300 a 1000 ms, aviso de demora pasados 1000 ms), que el loader aparezca solo en la primera carga y la prohibición de usar el spinner del sistema.

### Key Entities

No aplica: es un cambio visual de un componente existente, sin datos propios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100 % de las cargas que superan los 300 ms, el loader muestra el anillo girando alrededor del ícono, tanto en pantallas como en botones.
- **SC-002**: En una grabación de una carga larga, el arco completa una vuelta por segundo (con una tolerancia de ±10 %) sin saltos ni pausas.
- **SC-003**: Cada ícono tarda unos 250 ms en crecer y unos 250 ms en reducirse (±50 ms), y el contenido aparece sin esperar a que termine la salida del loader.
- **SC-004**: En una carga que termina antes de 300 ms no se ve ningún anillo ni animación en el 100 % de los casos.
- **SC-005**: Un botón en carga conserva el 100 % de su ancho y alto, el anillo no se recorta y su loader aparece y desaparece en unos 150 ms (±50 ms).
- **SC-006**: Con "reducir movimiento" activado, ninguna carga muestra giro ni cambio de tamaño.
- **SC-007**: Con lector de pantalla, cada carga se anuncia como un solo mensaje de "Cargando…", sin que el anillo añada anuncios.
- **SC-008**: En una revisión con al menos 5 personas, al menos 4 identifican el loader como "algo que está cargando" y ninguna lo confunde con un error o una pantalla congelada.

## Assumptions

- Esta funcionalidad sustituye los requisitos de la spec 007 que prohibían las figuras circulares y limitaban el movimiento a fundidos (FR-004 y FR-005 de esa spec); el resto de la 007 se conserva (FR-016).
- El anillo es retroalimentación funcional y no decoración, por lo que es la única excepción a la regla de diseño contra las figuras geométricas (D-080).
- El cambio entre íconos combina fundido y cambio de tamaño; no hay sacudida lateral (D-082).
- El aviso de demora forma parte del conjunto: aparece y se va junto con el ícono y el anillo.
- Los valores de tamaño, tiempo, desplazamiento y color son los fijados en `docs/Design.md` (sección Loader) y en D-080, y no se configuran.
- El anillo del tamaño compacto cabe dentro del alto mínimo de los botones actuales sin cambiar su tamaño.
- Fuera de alcance: cambios en los esqueletos (skeletons), nuevas pantallas de carga donde hoy no existen, indicadores con porcentaje de avance y cualquier cambio en el orden de los íconos o en las fases de espera.
- Depende de lo ya implementado en la spec 007 (`BrandLoader`, fases de espera, prueba contra el spinner del sistema) y de la documentación de D-080.
