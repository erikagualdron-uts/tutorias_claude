# Feature Specification: Sistema de diseño renovado

**Feature Branch**: `026-design-system`

**Created**: 2026-11-23

**Status**: Implemented (pending manual review: T002, T015, T016, T022, T029)

**Input**: User description: "Mejorar el sistema de diseño y, por fases, el diseño de la aplicación. Esta primera spec define el nuevo Design.md y los tokens del tema de la app, sin rediseñar todavía cada pantalla. Objetivos: aspecto más elegante y moderno, consistencia entre roles, usabilidad y claridad de navegación, más cercanía a la identidad UTS y un modo oscuro consistente y sin errores visuales."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| `Design.md` (526 líneas) | Describe paleta, tipografía, elevación, espaciado, radios, íconos, movimiento, componentes y patrones de pantalla; el modo oscuro ocupa 8 líneas (lista de colores sueltos) |
| El tema ya tiene roles de color en claro y oscuro (32), pero `Design.md` solo los describe en 8 líneas para oscuro | Faltan en el documento y en el tema: variante oscura de la crema de avisos (hoy sigue clara), sombra propia del modo oscuro, separación entre tarjeta y superficie (hoy el mismo color), y texto legible de éxito y advertencia |
| El código ya usa el tema casi en todo | Medido el 2026-11-23: 0 colores escritos fuera de `src/theme` en pantallas y componentes; 113 de 196 archivos de interfaz leen la paleta, y los otros no pintan color propio; la prueba de contraste cubre 20 pares por modo, no todos los del documento |
| Ya existen guardas de calidad | La spec 023 exige contraste, tamaño táctil y accesibilidad; la 024 corrigió la navegación de pantallas ocultas (D-121) |
| Hay quejas concretas del uso | Franja blanca bajo la bandeja de avisos, botones que no hacen lo esperado, pantallas que se sienten distintas entre roles |

La definición de "elegante" y "moderno" no existe hoy como criterios comprobables; esta spec los convierte en reglas escritas y medibles, y deja la aplicación pantalla por pantalla para specs siguientes.

## Clarifications

### Session 2026-11-23

- Q: ¿Qué tono visual debe tener el nuevo diseño de la app? → A: Mixto: sobrio en las pantallas de trabajo (listas, horario, administración) y expresivo en las de entrada y portada (inicio de sesión, inicio, estados vacíos).
- Q: ¿Se renueva también la barra de pestañas inferior y la cabecera superior, o solo cambian sus colores? → A: Solo colores: la barra y la cabecera conservan forma, estructura y destinos, y toman los nuevos roles de color en claro y oscuro.
- Q: ¿Qué grupo de pantallas se rediseña primero cuando termine esta spec? → A: Entrada y portada: inicio de sesión, inicio de estudiante, docente y CAE, bandeja de avisos y estados vacíos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un modo oscuro sin errores visuales (Priority: P1)

Quien usa el teléfono en modo oscuro ve todas las pantallas legibles y coherentes: ningún fondo blanco residual, ningún texto que se pierda, ningún componente que se quede con los colores del modo claro.

**Why this priority**: Es el defecto más visible y el que más rompe la confianza; además exige definir los colores por rol (fondo, tarjeta, texto, estados), que es la base de todo lo demás.

**Independent Test**: Con el teléfono en modo oscuro, recorrer las pantallas de los tres roles según la lista de verificación de la spec y confirmar que ninguna tiene los errores catalogados; la prueba automática de pares de color pasa para ambos modos.

**Acceptance Scenarios**:

1. **Given** el teléfono en modo oscuro, **When** se abre cualquier pantalla de estudiante, docente o CAE, **Then** el fondo, las tarjetas, los textos, los campos y las barras usan colores del modo oscuro.
2. **Given** el modo oscuro, **When** se muestran estados (éxito, advertencia, error, presionado, deshabilitado, seleccionado), **Then** son distinguibles entre sí y legibles.
3. **Given** el modo oscuro, **When** se muestra cualquier par de texto y fondo del sistema, **Then** cumple el contraste mínimo exigido por la accesibilidad del proyecto (texto normal 4.5:1; texto grande, íconos, indicadores de foco y de estado activo 3:1).
4. **Given** el cambio de modo del teléfono con la app abierta, **When** ocurre, **Then** la app cambia sin reiniciar y sin destellos de color del modo anterior.

---

### User Story 2 - Un documento de diseño que sirve para decidir (Priority: P1)

Quien diseña o programa una pantalla nueva abre `Design.md` y encuentra reglas claras y comprobables: roles de color para ambos modos, escala tipográfica, espaciado, elevación, radios, componentes con sus estados, patrones de pantalla y de navegación, y una lista de lo que no se debe hacer.

**Why this priority**: Sin un documento fiel y útil, cada spec de pantalla vuelve a decidir lo mismo y reaparece la inconsistencia; es la fuente de verdad (constitución, principio I).

**Independent Test**: Una persona que no participó escribe con solo `Design.md` una pantalla de ejemplo y no necesita preguntar qué color, tamaño o patrón usar; una revisión cruzada no encuentra valores sin definir.

**Acceptance Scenarios**:

1. **Given** `Design.md`, **When** se busca el color de un elemento (tarjeta, enlace, borde, error), **Then** hay un rol semántico con su valor en claro y en oscuro.
2. **Given** `Design.md`, **When** se busca cómo debe verse un componente, **Then** están descritos sus estados (normal, presionado, enfocado, deshabilitado, cargando, error).
3. **Given** `Design.md`, **When** se compara con las reglas de diseño de `CLAUDE.md`, **Then** no hay contradicciones y las reglas inamovibles se conservan.
4. **Given** `Design.md`, **When** se lee la sección de decisiones de diseño, **Then** cada criterio de "elegante y moderno" tiene una regla que se puede comprobar.

---

### User Story 3 - La app usa los roles de color del sistema y no valores sueltos (Priority: P2)

Los componentes obtienen sus colores, tipografías, espaciados y radios desde el tema, de modo que cambiar un valor en el tema lo cambia en toda la app, en claro y en oscuro.

**Why this priority**: Es lo que hace sostenible el diseño; sin él, un cambio de paleta exigiría tocar cada pantalla. Va después de definir el sistema (P1) porque depende de él.

**Independent Test**: Una comprobación automática no encuentra colores escritos directamente en componentes, salvo las excepciones listadas (recursos de marca); cambiar un rol de color en el tema se refleja en una pantalla de muestra.

**Acceptance Scenarios**:

1. **Given** el tema, **When** se pide un rol de color en cada modo, **Then** existe un valor para todos los roles definidos en `Design.md`.
2. **Given** los componentes compartidos (botones, campos, tarjetas, chips, banners, avisos, cargas), **When** se inspeccionan, **Then** ninguno escribe un color, una fuente o un espaciado fuera del tema.
3. **Given** una pantalla de muestra con todos los componentes compartidos, **When** se cambia el modo, **Then** todos reaccionan.

---

### User Story 4 - Una ruta clara para rediseñar las pantallas por fases (Priority: P2)

El CAE y el equipo ven una lista priorizada de las pantallas por rol con sus defectos de diseño ya catalogados, y cada fase siguiente se puede especificar y probar de forma independiente.

**Why this priority**: Evita rediseñar todo a la vez; permite entregar valor por fases y no mezclar el sistema con la aplicación a pantallas.

**Independent Test**: La lista cubre todas las pantallas de los tres roles, cada una con su prioridad, defectos conocidos y la spec en que se tratará.

**Acceptance Scenarios**:

1. **Given** el inventario de pantallas, **When** se revisa, **Then** cada pantalla tiene rol, defectos visibles (claro y oscuro) y la fase que la corregirá.
2. **Given** una fase siguiente, **When** se escribe su spec, **Then** puede apoyarse en `Design.md` y en el tema sin redefinir reglas.

---

### Edge Cases

- Un color de marca que no cumple contraste (lima sobre blanco, naranja y verde de estado como texto): se mantienen las reglas actuales de uso solo como relleno o ícono, y en oscuro se definen sus variantes legibles.
- Modo del teléfono "automático" que cambia a la noche con la app abierta: la app sigue el cambio.
- Texto agrandado por el usuario (hasta 200 %): los tokens de espaciado y de tipografía no deben provocar recortes.
- Capturas, imágenes y logos con fondo blanco incrustado: se usan las variantes de marca para oscuro o se muestran sobre una superficie que las acepte.
- Gráficas y estados que dependían solo del color: siguen llevando etiqueta o texto.
- Fuente corporativa pendiente (alternativa en uso): el cambio sigue siendo un único ajuste del tema.
- Pantallas que hoy están a medio camino (por ejemplo, la bandeja con franja blanca): quedan en el inventario con su fase, aunque se corrijan antes si el defecto está en un rol de color.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `Design.md` MUST definir cada color por **rol semántico** (fondo, pantalla, tarjeta, superficie, borde, campo, texto principal y secundario, enlace, primario y su estado presionado, acento, éxito, advertencia, error, deshabilitado, sombra, gráficas) con su valor en **modo claro y en modo oscuro**, indicando cuáles son de marca y cuáles derivados.
- **FR-002**: Cada par de texto y fondo del sistema, en ambos modos, MUST cumplir el contraste mínimo del proyecto (4.5:1 para texto normal; 3:1 para texto grande, íconos, indicadores de foco y de estado activo). El borde de los campos queda fuera de la medida de 3:1 por la regla de `CLAUDE.md` de borde tenue: el campo se identifica por su relleno, su etiqueta y su borde de foco, que sí cumple 3:1, y la tabla de contrastes de `Design.md` MUST incluir los pares del modo oscuro.
- **FR-003**: `Design.md` MUST conservar las reglas inamovibles de `CLAUDE.md` (lima nunca como texto o ícono sobre blanco, objetivos táctiles de 48 px, íconos solo Iconify solar, botones con ícono a la izquierda y 16 px entre apilados, campos con relleno y borde, Myriad Pro solo por tokens, decoración solo con el patrón de marca) y MUST NOT contradecirlas.
- **FR-004**: `Design.md` MUST describir una escala de tipografía, de espaciado, de radios y de elevación con nombres y usos, para claro y oscuro (en oscuro, la elevación se expresa por superficie y borde, no solo por sombra).
- **FR-005**: `Design.md` MUST describir cada componente compartido con sus estados (normal, presionado, enfocado, deshabilitado, cargando, error, seleccionado) y sus reglas de uso, sin duplicar lo ya decidido en D-0xx.
- **FR-006**: `Design.md` MUST ampliar los patrones de navegación y de pantalla con lo aprendido (acceso a pantallas sin pestaña, regreso, estados vacíos y de error) y MUST fijar para cada tipo de pantalla qué se espera en claro y en oscuro.
- **FR-007**: Cada criterio de diseño ("elegante", "moderno", "consistente", "cercano a la UTS") MUST traducirse a reglas comprobables en `Design.md` (por ejemplo, máximo de acentos por pantalla, jerarquía de títulos, uso de tarjetas y de superficies).
- **FR-007a**: `Design.md` MUST definir dos registros visuales y decir a cuál pertenece cada tipo de pantalla: **sobrio** en las pantallas de trabajo (listas, horario, detalle, administración, chat, PQRS: fondos y tarjetas neutros, verde solo en acciones y estados activos, jerarquía por tipografía y espacio) y **expresivo** en las de entrada y portada (inicio de sesión, inicio de cada rol, estados vacíos: degradado de marca, cabecera de color y patrón de hojas, plumas y libros), con el máximo de elementos expresivos por pantalla.
- **FR-008**: El tema de la app MUST ofrecer todos los roles de FR-001 en ambos modos y MUST ser la única fuente de colores, fuentes, espaciados, radios y elevaciones de los componentes compartidos.
- **FR-009**: Los componentes compartidos MUST usar el tema y MUST reaccionar al cambio de modo sin reiniciar; los valores sueltos que hoy tengan MUST migrarse al tema, excepto los recursos de marca listados.
- **FR-010**: Una comprobación automática MUST rechazar un par de colores del tema que no cumpla FR-002 y MUST rechazar colores escritos directamente en componentes fuera de las excepciones.
- **FR-011**: La spec MUST producir un **inventario de pantallas** de los tres roles, con los defectos de diseño visibles en claro y en oscuro (incluidos los ya reportados) y la fase siguiente que los corrige. La primera fase siguiente es **entrada y portada** (inicio de sesión, inicio de estudiante, docente y CAE, bandeja de avisos y estados vacíos); las demás fases (módulos y horario, administración, resto) se ordenan en el inventario.
- **FR-012a**: La barra de pestañas y la cabecera superior (título y campana) MUST conservar su forma, estructura y destinos; solo cambian sus colores, que salen de los roles del tema en claro y oscuro (indicador de pestaña activa, fondo, bordes e íconos legibles en ambos modos).
- **FR-012**: Esta spec MUST NOT rediseñar pantallas completas, cambiar textos, flujos o navegación existentes, ni tocar el backend; solo corrige en pantallas lo que provenga de un rol de color o de un componente compartido.
- **FR-013**: `Context.md`, `Architecture.md` y `Decisions.md` MUST reflejar cualquier decisión nueva (por ejemplo, los roles de color y la regla de modo oscuro), y `CLAUDE.md` MUST seguir coherente con `Design.md`.

### Key Entities

- **Rol de color**: nombre semántico de un color (por ejemplo, "tarjeta" o "error") con un valor para modo claro y otro para oscuro, y su origen (marca o derivado).
- **Escala**: conjunto ordenado de valores con nombre y uso (tipografía, espaciado, radios, elevación).
- **Componente compartido**: pieza visual reutilizada por varias pantallas, con sus estados y reglas.
- **Inventario de pantallas**: lista de pantallas por rol con sus defectos y la fase que las corrige.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los pares de texto y fondo del sistema cumple el contraste mínimo en modo claro y en modo oscuro, verificado automáticamente.
- **SC-002**: 0 colores, fuentes o espaciados escritos directamente en los componentes compartidos fuera de las excepciones documentadas.
- **SC-003**: Al recorrer las pantallas de los tres roles en modo oscuro con la lista de verificación, 0 defectos de tipo fondo claro residual, texto ilegible o componente sin cambiar de modo en lo que provenga de un rol de color o de un componente compartido; el resto queda en el inventario con su fase.
- **SC-004**: El 100 % de las pantallas de los tres roles aparece en el inventario con defectos y fase asignada.
- **SC-005**: Una persona nueva construye una pantalla de ejemplo usando solo `Design.md` y el tema, sin ningún valor de diseño sin definir, en una revisión con al menos 2 revisores.
- **SC-006**: Ninguna prueba, lint ni tipo que pasaba antes deja de pasar, y las pruebas de accesibilidad de la spec 023 siguen en verde.

## Assumptions

- La paleta de marca (verde #34531F, verde profundo #132F20, lima #C3D730, gris frío) no cambia; lo que se amplía son los roles derivados, sobre todo en modo oscuro.
- La mejora de "elegante y moderno" se logra con jerarquía, espaciado, superficies y consistencia, sin añadir decoración nueva ni nuevos colores de marca (la decoración sigue siendo solo el patrón de hojas, plumas y libros).
- La app ya sigue el modo del teléfono; esta spec no agrega un interruptor de modo dentro de la app.
- El rediseño pantalla por pantalla se divide en specs posteriores por rol o por área (por ejemplo: inicio y navegación, módulos y horario, avisos y PQRS, chat, administración); esta spec las ordena pero no las ejecuta.
- No hay cambios de backend, de base de datos ni de textos; los textos visibles siguen en español e inglés sin cambios.
- Los recursos de marca (logo, patrón, imágenes con color propio) quedan como excepción documentada a la regla de "sin colores sueltos".
- Dependencias: ninguna spec abierta bloquea esta; la spec 024 (navegación de pantallas ocultas) aporta los patrones de navegación ya decididos.
- Fuera de alcance: nuevas funciones, cambio de la fuente corporativa, animaciones nuevas, rediseño de logo o identidad, y modo de alto contraste.
