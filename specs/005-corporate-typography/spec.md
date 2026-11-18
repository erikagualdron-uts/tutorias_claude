# Feature Specification: Tipografía corporativa

**Feature Branch**: `005-corporate-typography`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Actualización de tipografía corporativa: usar Myriad Pro (Regular, Semibold y Bold) y Source Code Pro para código, siempre mediante los tokens `fonts` del tema; usar Source Sans 3 como respaldo mientras no estén los archivos de Myriad Pro, cambiando solo los tokens; cargar las fuentes y mantener el splash hasta que carguen; eliminar cualquier fuente o peso escrito en componentes y usar los estilos del tema; aplicar los nuevos tamaños y pesos (el peso medio pasa a Semibold). Fuera de alcance: reglas de negocio o funcionalidades."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Texto con la tipografía institucional (Priority: P1)

Quien usa la app ve todos los textos con la tipografía corporativa de la UTS (o su respaldo equivalente mientras la universidad entrega los archivos), con los tamaños y pesos definidos en `docs/Design.md`, y los datos de código (clave temporal, números de radicado, valores SMTP) en la fuente de código.

**Why this priority**: la tipografía está en todas las pantallas y es parte de la identidad institucional.

**Independent Test**: recorrer login, registro, verificación, recuperar, restablecer, cambio de clave, alta de docente, pestañas de cada rol y el diálogo de clave temporal; comprobar fuente, tamaño y peso de cada estilo de texto.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla, **When** se muestra, **Then** los textos usan la fuente corporativa (o el respaldo) en los pesos Regular, Semibold o Bold, y ninguno cae a la fuente del sistema.
2. **Given** los estilos de texto, **When** se aplican, **Then** coinciden con los de `Design.md`: título de pantalla 26/32 Bold, título de sección 19/26 Semibold, título de tarjeta 17/22 Semibold, número de métrica 30/36 Bold, cuerpo 15/22 Regular, cuerpo pequeño y metadatos 13/18 Regular, etiqueta 12/16 Semibold con espaciado 0,02 em, texto de botón 15/20 Semibold y código 14/20 Regular.
3. **Given** un texto que antes usaba el peso medio, **When** se muestra, **Then** usa Semibold.
4. **Given** una clave temporal de docente, **When** se muestra, **Then** aparece en la fuente de código.
5. **Given** etiquetas y botones en español (textos más largos que en inglés), **When** se muestran, **Then** no se cortan los textos críticos (botones y estados); los títulos largos se ajustan o se acortan con puntos suspensivos.

---

### User Story 2 - Cambio de fuente en un solo lugar (Priority: P2)

Quien mantiene la app puede pasar del respaldo a Myriad Pro (cuando lleguen los archivos con licencia) cambiando únicamente los tokens de fuente del tema, sin tocar componentes ni pantallas.

**Why this priority**: la universidad aún no entrega los archivos de Myriad Pro; el cambio posterior debe ser barato y sin riesgo.

**Independent Test**: sustituir los tokens de fuente por otros nombres válidos y comprobar que toda la app cambia sin editar componentes; revisar que ningún componente escribe nombre de fuente ni peso.

**Acceptance Scenarios**:

1. **Given** el código de la app, **When** se busca un nombre de fuente o un peso de fuente fuera del tema, **Then** no aparece ninguno en componentes ni pantallas.
2. **Given** los tokens de fuente del tema, **When** apuntan al respaldo, **Then** la app usa el respaldo en los tres pesos; **When** apuntan a Myriad Pro, **Then** la app usa Myriad Pro sin otros cambios.
3. **Given** que faltan los archivos de Myriad Pro, **When** se compila la app, **Then** funciona con el respaldo, sin errores ni aviso de fuente ausente.

---

### User Story 3 - Arranque sin parpadeo de fuente (Priority: P3)

Quien abre la app ve el splash hasta que las fuentes están listas, y la primera pantalla aparece ya con la tipografía correcta, sin cambio visible de fuente.

**Why this priority**: evita un parpadeo feo en cada arranque, pero no cambia la funcionalidad.

**Independent Test**: arrancar la app en frío varias veces; el splash se mantiene hasta que carga la primera pantalla y no se ve texto con otra fuente.

**Acceptance Scenarios**:

1. **Given** un arranque en frío, **When** las fuentes aún no cargan, **Then** se sigue viendo el splash y no se muestra ninguna pantalla con otra fuente.
2. **Given** que las fuentes terminan de cargar, **When** se oculta el splash, **Then** la primera pantalla ya se ve con la tipografía correcta.
3. **Given** que una fuente falla al cargar, **When** pasa el tiempo máximo de espera, **Then** la app sigue adelante con la fuente del sistema en lugar de quedarse en el splash.

---

### Edge Cases

- Fuente del sistema muy grande: los textos crecen sin cortarse y los controles mantienen su alto mínimo de 48 px.
- Texto en otro idioma del dispositivo: se usa español; la tipografía no cambia.
- Fallo de carga de una fuente: la app no queda bloqueada en el splash.
- Pruebas automáticas sin fuentes reales: no fallan por la ausencia de los archivos.
- Un componente nuevo sin estilo de texto del tema: se detecta por la prueba que busca fuentes o pesos escritos en componentes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todos los textos de la app MUST usar la fuente corporativa (Myriad Pro) en Regular, Semibold o Bold; mientras no estén sus archivos MUST usar el respaldo Source Sans 3 en esos tres pesos.
- **FR-002**: Los datos de código (clave temporal, números de radicado, valores SMTP) MUST usar Source Code Pro Regular.
- **FR-003**: Los nombres de fuente MUST vivir solo en los tokens `fonts` del tema; pasar del respaldo a Myriad Pro MUST requerir cambiar solo esos tokens.
- **FR-004**: Ningún componente ni pantalla MUST escribir un nombre de fuente (`fontFamily`) ni un peso (`fontWeight`); MUST usar los estilos del tema (cuerpo, botón, etiqueta, título, código, etc.).
- **FR-005**: Los estilos de texto MUST tener los tamaños, interlineados y pesos de `Design.md` (título de pantalla 26/32 Bold, título de sección 19/26 Semibold, título de tarjeta 17/22 Semibold, número de métrica 30/36 Bold, cuerpo 15/22 Regular, cuerpo pequeño 13/18 Regular, metadatos 13/18 Regular en `#575756`, etiqueta 12/16 Semibold con espaciado 0,02 em, texto de botón 15/20 Semibold, código 14/20 Regular).
- **FR-006**: El peso medio anterior (500) MUST pasar a Semibold (600) en todos los estilos que lo usaban.
- **FR-007**: La app MUST cargar las fuentes al arrancar y MUST mantener visible el splash hasta que carguen; si la carga falla o tarda más del tiempo máximo, MUST continuar con la fuente del sistema.
- **FR-008**: Las pantallas MUST tolerar textos en español hasta un 30 % más largos que en inglés sin cortar etiquetas de botones ni estados; los títulos de tarjeta MUST limitarse a 2 líneas con puntos suspensivos.
- **FR-009**: Los archivos de Myriad Pro MUST NOT incluirse en el repositorio hasta confirmar la licencia y recibirlos de la universidad.
- **FR-010**: Estos ajustes MUST NOT cambiar reglas de negocio ni funcionalidades, y las pruebas existentes siguen pasando.

### Key Entities

No aplica: no introduce datos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los textos de la app se muestra con la fuente corporativa o su respaldo; 0 textos con la fuente del sistema en condiciones normales.
- **SC-002**: 0 nombres de fuente y 0 pesos escritos en componentes o pantallas.
- **SC-003**: Cambiar de respaldo a Myriad Pro requiere editar solo el archivo de tokens del tema (1 archivo de código, más agregar los archivos de fuente).
- **SC-004**: En el 100 % de los arranques en frío probados no se ve texto con otra fuente antes de la primera pantalla.
- **SC-005**: Ninguna etiqueta de botón ni estado se corta en español con la fuente del sistema al tamaño más grande probado.
- **SC-006**: Todos los flujos de las funcionalidades 001 a 004 se completan igual que antes (sin regresiones en las pruebas).

## Assumptions

- Los archivos de Myriad Pro aún no están disponibles y requieren licencia que cubra distribución en apps móviles (D-051); por eso esta entrega usa Source Sans 3 como respaldo.
- Source Sans 3 y Source Code Pro son fuentes libres y pueden incluirse en la app.
- La fuente anterior (Roboto, D-041) se reemplaza por completo; la decisión D-041 queda sustituida por D-051.
- El tiempo máximo de espera de carga de fuentes es de unos pocos segundos (por ejemplo, 5 s) antes de continuar con la fuente del sistema.
- Los tamaños nuevos ya están definidos en `docs/Design.md` (crecen 1 px respecto de los anteriores); no se redefinen aquí.
- Aplica a las pantallas existentes; las pantallas futuras usarán los mismos estilos del tema.
- El logo, el patrón de marca y los campos no cambian en esta funcionalidad.
