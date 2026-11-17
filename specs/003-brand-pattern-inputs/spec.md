# Feature Specification: Ajustes visuales de marca e inputs

**Feature Branch**: `003-brand-pattern-inputs`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Ajustes visuales de marca e inputs: reemplazar la decoración geométrica por el patrón de marca (hojas, plumas y libros) en cabeceras de acceso, splash y tarjetas destacadas; todos los campos con relleno y borde tenue, ícono a la izquierda y estados de foco y error; reemplazar 'Unidades Tecnológicas de Santander' por 'Institución Universitaria Tecnológica de Santander – UTS' en la app, las traducciones y las plantillas de correo. Fuera de alcance: reglas de negocio o funcionalidades."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Campos que se leen como campos (Priority: P1)

Quien llena un formulario ve cada campo (texto, contraseña, selector, área de texto, búsqueda y campo de chat) con relleno y borde tenue, con un ícono a la izquierda y con estados claros de foco y de error, de modo que sepa dónde escribir sin ambigüedad.

**Why this priority**: afecta a todos los formularios existentes y futuros, y es lo que más se usa en acceso, registro y alta de docente.

**Independent Test**: abrir login, registro, verificación, recuperar, restablecer, cambio de clave y alta de docente; comprobar relleno, borde, ícono, foco y error en cada campo.

**Acceptance Scenarios**:

1. **Given** un campo sobre una tarjeta blanca, **When** se muestra en reposo, **Then** tiene relleno `#F2F4EF` y borde de 1 px `#C9D0C3`; sobre el fondo de pantalla `#F2F4EF`, el relleno es blanco con el mismo borde.
2. **Given** un campo en reposo, **When** se enfoca, **Then** el borde pasa a 2 px `#4E7A2F`, el relleno es blanco, aparece un halo suave y la etiqueta cambia a `#34531F`, con una transición de unos 150 ms.
3. **Given** un campo con error, **When** se muestra, **Then** el borde es de 1 px `#B3261E` y debajo aparece el mensaje con un ícono de error en `#B3261E`.
4. **Given** cualquier campo, **When** se muestra, **Then** lleva un ícono de 20 px a la izquierda; las contraseñas tienen además el botón de mostrar u ocultar.
5. **Given** un campo deshabilitado, **When** se muestra, **Then** se ve al 60 % de opacidad y sin halo.

---

### User Story 2 - Patrón de marca en lugar de círculos (Priority: P2)

Quien abre la app ve el patrón de marca (hojas, plumas y libros) en las cabeceras de acceso, el splash y las tarjetas destacadas; ya no hay círculos ni arcos decorativos.

**Why this priority**: refuerza la identidad institucional, pero no cambia la usabilidad.

**Independent Test**: recorrer las pantallas de acceso y el splash; comprobar que no queda decoración geométrica y que el patrón respeta la zona central del logo y el título.

**Acceptance Scenarios**:

1. **Given** las cabeceras de login, registro, recuperación y cambio de clave, **When** se muestran, **Then** llevan el patrón con unos 14 íconos de 30 a 64 px, rotados entre -30° y 30°, en blanco al 8 a 12 % (hasta 3 en lima `#C3D730` al 14 a 18 %).
2. **Given** la cabecera, **When** se muestra el logo y el título, **Then** la zona central está libre de íconos y el texto se lee con claridad.
3. **Given** el modo oscuro, **When** se muestra el patrón, **Then** usa blanco al 6 %.
4. **Given** una tarjeta destacada, **When** se muestra, **Then** lleva 3 íconos al 10 % en la esquina inferior derecha.
5. **Given** el patrón, **When** aparece por primera vez, **Then** entra con un único fundido de 350 ms, y sin animación con "reducir movimiento"; no responde a toques ni lo leen los lectores de pantalla.
6. **Given** pantallas de contenido, listas o el interior de tarjetas normales, **When** se muestran, **Then** no llevan el patrón.

---

### User Story 3 - Nombre oficial de la institución (Priority: P3)

Quien usa la app o recibe un correo ve "Institución Universitaria Tecnológica de Santander – UTS" donde antes decía "Unidades Tecnológicas de Santander".

**Why this priority**: es un cambio de texto de bajo riesgo, pero es obligatorio por el nombre oficial vigente.

**Independent Test**: buscar el nombre anterior en la app, las traducciones y las plantillas de correo; no debe aparecer en ningún sitio, y el nombre nuevo debe verse en el pie del login y en los correos.

**Acceptance Scenarios**:

1. **Given** el pie de las pantallas de acceso, **When** se muestra, **Then** dice "Institución Universitaria Tecnológica de Santander – UTS" en español y en inglés.
2. **Given** un correo de verificación o de restablecimiento, **When** se envía, **Then** menciona el nombre nuevo donde nombre a la institución.
3. **Given** cualquier texto corto de la app, **When** nombra a la institución, **Then** usa "UTS".

---

### Edge Cases

- Fuente del sistema muy grande: los campos crecen en alto sin cortar el texto y el ícono sigue alineado.
- Área de texto: crece hasta 6 líneas y muestra el contador dentro, abajo a la derecha.
- Teclado abierto: el patrón no se vuelve a dibujar ni salta de lugar.
- Pantallas pequeñas: el patrón puede quedar cortado por el borde de la cabecera.
- Campo con error y foco a la vez: se muestra el estado de error.
- Idioma del dispositivo distinto de español e inglés: se usa español.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todo campo de texto, selector, área de texto, búsqueda y campo de chat MUST tener relleno y borde tenue, con 52 px de alto, radio de 12 px y 16 px de relleno horizontal.
- **FR-002**: Sobre una tarjeta o lámina el relleno MUST ser `#F2F4EF` y sobre el fondo de pantalla MUST ser blanco; el borde MUST ser de 1 px `#C9D0C3` en ambos casos. En modo oscuro MUST usar el relleno `#0B1710` y borde `rgba(255,255,255,0.16)`.
- **FR-003**: Todo campo MUST llevar un ícono de 20 px a la izquierda; los de contraseña MUST tener además el botón de mostrar u ocultar.
- **FR-004**: Un campo enfocado MUST mostrar borde de 2 px `#4E7A2F` (en oscuro, `#C3D730`), relleno blanco, halo suave y etiqueta `#34531F`, con transición de unos 150 ms.
- **FR-005**: Un campo con error MUST mostrar borde de 1 px `#B3261E` y el mensaje debajo con ícono de error; el error MUST prevalecer sobre el foco.
- **FR-006**: Un campo deshabilitado MUST verse al 60 % de opacidad y sin halo.
- **FR-007**: Las áreas de texto MUST crecer hasta 6 líneas y mostrar el contador dentro de la esquina inferior derecha; los selectores MUST mostrar un chevron al final.
- **FR-008**: La app MUST NOT usar círculos, arcos ni otras formas geométricas como decoración.
- **FR-009**: Un componente único del patrón de marca (hoja, pluma y libro abierto) MUST sustituir esa decoración en las cabeceras de acceso, el splash y las tarjetas destacadas.
- **FR-010**: El patrón MUST ser determinista (misma posición, tamaño, rotación e ícono en cada render), dejar libre la zona central del logo y el título, y poder quedar cortado por el borde.
- **FR-011**: En las cabeceras el patrón MUST usar unos 14 íconos de 30 a 64 px, blanco al 8 a 12 % y hasta 3 en lima al 14 a 18 % (blanco al 6 % en modo oscuro); en tarjetas destacadas, 3 íconos al 10 % en la esquina inferior derecha.
- **FR-012**: El patrón MUST aparecer con un único fundido de 350 ms (sin animación con "reducir movimiento"), ignorar los toques y estar oculto a lectores de pantalla.
- **FR-013**: El patrón MUST NOT aparecer en pantallas de contenido, listas ni dentro de tarjetas comunes.
- **FR-014**: El nombre "Unidades Tecnológicas de Santander" MUST NOT aparecer en la app, las traducciones ni las plantillas de correo; donde se nombre a la institución completa MUST decir "Institución Universitaria Tecnológica de Santander – UTS" y en textos cortos "UTS".
- **FR-015**: Los textos visibles MUST seguir viviendo en los archivos de traducción en español e inglés.
- **FR-016**: Estos ajustes MUST NOT cambiar reglas de negocio ni funcionalidades, y las pruebas existentes siguen pasando.

### Key Entities

No aplica: no introduce datos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los campos de la app (existentes) muestra relleno, borde tenue, ícono a la izquierda y los estados de foco y error definidos.
- **SC-002**: 0 círculos o arcos decorativos en la app tras el cambio.
- **SC-003**: El patrón de marca aparece en el 100 % de las cabeceras de acceso y 0 veces en pantallas de contenido.
- **SC-004**: 0 apariciones de "Unidades Tecnológicas de Santander" en la app, las traducciones y las plantillas de correo.
- **SC-005**: Con "reducir movimiento" activo, el patrón y los cambios de estado de los campos se muestran sin movimiento.
- **SC-006**: Todos los flujos de las funcionalidades 001 y 002 se completan igual que antes (sin regresiones en las pruebas).

## Assumptions

- Aplica a las pantallas existentes (acceso, cambio de clave y alta de docente); los selectores, áreas de texto, búsqueda y chat se aplican cuando esas pantallas existan, usando el mismo componente de campo.
- Los íconos decorativos del patrón pueden venir del set `mdi` (D-049), porque `solar` no tiene hoja, pluma ni libro abierto equivalentes.
- El splash se compone como imagen estática que incluye el patrón, porque el splash nativo no puede dibujar componentes.
- Las plantillas de correo ya nombran a la institución en su cabecera o pie; donde aún no lo hagan, solo se corrige el nombre antiguo sin agregar texto nuevo.
- Una tarjeta destacada es la tarjeta con degradado de marca (por ahora, la del próximo módulo cuando exista); hoy no hay ninguna en la app, así que el componente queda listo.
- Si la institución exige un borde de contraste 3:1, se usa `#8C968A`; no se aplica por defecto.
- Los colores `#C9D0C3`, `#4E7A2F` y el halo son derivados ya definidos en `Design.md`.
