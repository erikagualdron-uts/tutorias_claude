# Feature Specification: Loader de la marca, versión 2

**Feature Branch**: `009-brand-loader-v2`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Necesito lo del loader 009 Loader v.2" — el loader de la marca suma un anillo giratorio alrededor del ícono y una sacudida lateral suave al entrar y al salir. Seguir D-080 y la sección Loader de docs/Design.md.

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

### User Story 2 - Entrada y salida con una sacudida lateral suave (Priority: P1)

Cuando el loader aparece y cuando se va, todo el conjunto (ícono y anillo) se mueve de lado a lado con una sacudida suave y amortiguada mientras se desvanece, en lugar de aparecer y desaparecer de golpe.

**Why this priority**: Es la segunda petición del equipo; da la sensación de fluidez que pide el estilo moderno de la app.

**Independent Test**: Con la red lenta, ver cómo aparece el loader (sacudida de unos 350 ms) y, al llegar los datos, cómo se va (sacudida de unos 250 ms) sin retrasar la aparición del contenido.

**Acceptance Scenarios**:

1. **Given** una carga que supera los 300 ms, **When** aparece el loader, **Then** durante unos 350 ms se mueve de lado a lado unos 6 píxeles con amortiguación (cada vaivén más pequeño) y su opacidad sube de 0 a 100 %, hasta quedar quieto en el centro.
2. **Given** el loader visible, **When** llegan los datos, **Then** durante unos 250 ms se mueve de lado a lado con amortiguación mientras su opacidad baja a 0 y desaparece.
3. **Given** la salida del loader en curso, **When** el contenido ya está listo, **Then** el contenido se muestra sin esperar a que termine la sacudida.
4. **Given** una carga que termina antes de los 300 ms, **When** llegan los datos, **Then** no se ve ni la entrada ni la salida del loader.
5. **Given** la entrada de la sacudida aún en curso, **When** llegan los datos, **Then** la salida arranca desde la posición y la opacidad actuales, sin saltos.
6. **Given** el aviso de demora visible, **When** el loader se va, **Then** el mensaje se va junto con el ícono y el anillo, como parte del mismo conjunto.

---

### User Story 3 - Loader compacto con anillo dentro de los botones (Priority: P2)

Un botón con una acción en curso muestra el ícono con su anillo en tamaño compacto, de inmediato, sin sacudida ni mensaje, y sin cambiar de tamaño.

**Why this priority**: Mantiene la coherencia del indicador en los botones, pero el comportamiento ya existe en la versión 1; solo cambia su aspecto.

**Independent Test**: Pulsar "Guardar" con la red lenta y comprobar que el ícono del botón se reemplaza de inmediato por el ícono compacto con su anillo girando, que el botón no cambia de tamaño y que no hay sacudida.

**Acceptance Scenarios**:

1. **Given** un botón con ícono, **When** su acción empieza, **Then** el ícono compacto rodeado de su anillo empieza a aparecer de inmediato con un fundido de 150 ms, con el mismo color que el texto del botón, sin esperar 300 ms.
2. **Given** un botón en carga, **When** se compara con su estado normal, **Then** su ancho y su alto no cambian y el anillo cabe sin recortarse.
3. **Given** un botón en carga, **When** empieza o termina la acción, **Then** no hay sacudida ni aviso de demora.
4. **Given** un botón cuya acción termina, **When** responde el servidor, **Then** el loader se desvanece en 150 ms mientras el botón recupera su ícono, sin retrasar el siguiente estado de la pantalla.
5. **Given** un botón en carga, **When** la persona lo vuelve a pulsar, **Then** la acción no se repite.

---

### User Story 4 - "Reducir movimiento" y accesibilidad (Priority: P2)

Quien tiene activado "reducir movimiento" ve un loader sin sacudida ni giro, y quien usa lector de pantalla sigue oyendo una sola señal de carga, sin que el anillo la complique.

**Why this priority**: Es un requisito de diseño y de accesibilidad del proyecto; no bloquea el uso básico.

**Independent Test**: Con "reducir movimiento" activado, abrir una pantalla en carga y comprobar que no hay sacudida ni giro; con el lector de pantalla activo, comprobar que se anuncia un solo "Cargando…".

**Acceptance Scenarios**:

1. **Given** "reducir movimiento" activado, **When** aparece el loader, **Then** entra con un fundido de 150 ms, sin sacudida.
2. **Given** "reducir movimiento" activado, **When** el loader se va, **Then** sale con un fundido de 150 ms, sin sacudida.
3. **Given** "reducir movimiento" activado, **When** el loader está visible, **Then** el anillo no gira: queda fijo y su arco pulsa entre 40 % y 100 % de opacidad cada 1,2 segundos.
4. **Given** "reducir movimiento" activado, **When** pasa una iteración, **Then** el ícono cambia sin fundido, como en la versión 1.
5. **Given** un lector de pantalla activo, **When** enfoca el loader, **Then** anuncia una sola vez "Cargando…" (o "Loading…" en inglés); el anillo y el ícono se ocultan al lector y el aviso de demora se anuncia una sola vez al aparecer.

---

### Edge Cases

- Una carga que termina antes de 300 ms: no se ve nada, ni anillo ni sacudida (se conserva el comportamiento de la versión 1).
- Una carga que termina mientras la sacudida de entrada sigue en curso: la salida continúa desde el estado actual, sin saltos.
- Un loader que se oculta y se vuelve a mostrar (por ejemplo, un reintento): vuelve a esperar 300 ms, entra con sacudida y empieza por el libro.
- Una carga que falla pasados los 1000 ms: el conjunto (ícono, anillo y aviso) se va con la salida suave y se muestra el estado de error.
- Varios loaders a la vez (botones o áreas distintas): cada uno gira y entra por su cuenta sin sincronizarse con los demás.
- Modo oscuro: ícono y anillo en el color de texto casi blanco; sobre botones rellenos, en el color del texto del botón.
- Texto del sistema muy grande: el loader conserva su tamaño y la sacudida no empuja ni recorta el contenido vecino.
- Un botón de altura mínima: el anillo compacto cabe sin alterar el tamaño del botón.

## Requirements *(mandatory)*

### Functional Requirements

**Anillo giratorio**

- **FR-001**: El loader MUST mostrar un anillo alrededor del ícono de la marca, formado por una pista tenue y un arco más intenso, y MUST mantener el ícono centrado y derecho dentro de él.
- **FR-002**: El arco del anillo MUST abarcar un cuarto de la circunferencia (90°), con extremos redondeados, y MUST dar una vuelta por segundo a velocidad constante.
- **FR-003**: En el tamaño regular, el anillo MUST medir 64 px de lado a lado con 3 px de grosor; en el compacto, 28 px con 2 px de grosor. El anillo MUST añadir 8 px alrededor del ícono por cada lado (el ícono sigue midiendo 48 px y 20 px).
- **FR-004**: El arco MUST tener el color del ícono y la pista ese mismo color al 20 % de opacidad.
- **FR-005**: El anillo MUST NOT tocar ni tapar el aviso de demora que se muestra debajo del loader.

**Sacudida de entrada y salida**

- **FR-006**: Al aparecer, el loader completo (ícono y anillo) MUST moverse de lado a lado con una sacudida suave y amortiguada de 350 ms —desplazamientos de 0 a −6, +6, −3, +3 y 0 píxeles— mientras su opacidad pasa de 0 a 100 %.
- **FR-007**: Al irse, el loader completo MUST moverse de lado a lado con una sacudida suave y amortiguada de 250 ms —desplazamientos de 0 a +6, −6, +3 y 0 píxeles— mientras su opacidad pasa de 100 % a 0.
- **FR-008**: La salida del loader MUST NOT retrasar la aparición del contenido ni de un estado de error.
- **FR-009**: La sacudida MUST NOT ocurrir en los botones en carga ni cuando la carga termina antes de los 300 ms de espera.
- **FR-010**: Si la carga termina durante la entrada, la salida MUST arrancar desde la posición y la opacidad actuales, sin saltos.
- **FR-011**: Si el aviso de demora está visible, MUST salir junto con el ícono y el anillo, como parte del mismo conjunto.

**Botones**

- **FR-012**: Un botón en carga MUST mostrar de inmediato el ícono compacto con su anillo, con el color del texto del botón, apareciendo y desapareciendo con un fundido de 150 ms, sin sacudida ni aviso de demora, sin cambiar de tamaño y sin recortar el anillo. El fundido MUST NOT retrasar la acción ni el siguiente estado de la pantalla.

**Colores**

- **FR-013**: El ícono y el anillo MUST ser verde profundo `#34531F` sobre superficies claras, el color de texto casi blanco del tema sobre superficies oscuras (nunca lima), y el color del texto del botón sobre botones rellenos.

**Reducir movimiento y accesibilidad**

- **FR-014**: Con "reducir movimiento" activado, el loader MUST NOT sacudirse ni girar (el fundido de 150 ms de los botones se mantiene, porque no es movimiento): entra y sale con un fundido de 150 ms, el anillo queda fijo y su arco pulsa entre 40 % y 100 % de opacidad cada 1,2 segundos, y el ícono cambia cada 900 ms sin fundido.
- **FR-015**: El anillo y el ícono MUST ocultarse a los lectores de pantalla; el loader MUST seguir exponiéndose como un solo elemento de progreso con la etiqueta traducida "Cargando…" / "Loading…" y estado ocupado, y MUST anunciar el aviso de demora una sola vez cuando aparece.

**Comportamiento que se conserva de la versión 1**

- **FR-016**: Se MUST conservar sin cambios la secuencia de íconos (libro → pluma → hoja → libro, 900 ms cada uno), las fases de espera (nada hasta 300 ms, loader de 300 a 1000 ms, aviso de demora pasados 1000 ms), que el loader aparezca solo en la primera carga y la prohibición de usar el spinner del sistema.

### Key Entities

No aplica: es un cambio visual de un componente existente, sin datos propios.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100 % de las cargas que superan los 300 ms, el loader muestra el anillo girando alrededor del ícono, tanto en pantallas como en botones.
- **SC-002**: En una grabación de una carga larga, el arco completa una vuelta por segundo (con una tolerancia de ±10 %) sin saltos ni pausas.
- **SC-003**: La entrada dura unos 350 ms y la salida unos 250 ms (±50 ms), y el contenido aparece sin esperar a que termine la salida.
- **SC-004**: En una carga que termina antes de 300 ms no se ve ningún anillo ni sacudida en el 100 % de los casos.
- **SC-005**: Un botón en carga conserva el 100 % de su ancho y alto, el anillo no se recorta y su loader aparece y desaparece en unos 150 ms (±50 ms).
- **SC-006**: Con "reducir movimiento" activado, ninguna carga muestra sacudida ni giro.
- **SC-007**: Con lector de pantalla, cada carga se anuncia como un solo mensaje de "Cargando…", sin que el anillo añada anuncios.
- **SC-008**: En una revisión con al menos 5 personas, al menos 4 identifican el loader como "algo que está cargando" y ninguna lo confunde con un error o una pantalla congelada.

## Assumptions

- Esta funcionalidad sustituye los requisitos de la spec 007 que prohibían las figuras circulares y limitaban el movimiento a fundidos (FR-004 y FR-005 de esa spec); el resto de la 007 se conserva (FR-016).
- El anillo es retroalimentación funcional y no decoración, por lo que es la única excepción a la regla de diseño contra las figuras geométricas (D-080).
- La sacudida es lateral y solo en la entrada y la salida del loader; el cambio entre íconos sigue siendo un fundido.
- El aviso de demora forma parte del conjunto que se sacude al salir; no se sacude por separado.
- Los valores de tamaño, tiempo, desplazamiento y color son los fijados en `docs/Design.md` (sección Loader) y en D-080, y no se configuran.
- El anillo del tamaño compacto cabe dentro del alto mínimo de los botones actuales sin cambiar su tamaño.
- Fuera de alcance: cambios en los esqueletos (skeletons), nuevas pantallas de carga donde hoy no existen, indicadores con porcentaje de avance y cualquier cambio en el orden de los íconos o en las fases de espera.
- Depende de lo ya implementado en la spec 007 (`BrandLoader`, fases de espera, prueba contra el spinner del sistema) y de la documentación de D-080.
