# Feature Specification: Calidad: seguridad, accesibilidad y rendimiento

**Feature Branch**: `023-quality`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Calidad y accesibilidad. Una revisión transversal sin funcionalidad nueva, antes de entregar la app: que cada ruta del backend tenga su regla de acceso comprobada por una prueba, que la app se pueda usar con lector de pantalla, con letra grande y en modo oscuro, y que las pantallas y los endpoints principales respondan bien con el volumen de una institución real."

## Estado de partida (revisión del 2026-11-22)

| Qué ya existe | Dónde |
|---|---|
| Guard de roles en cada endpoint y pruebas de roles (`403`) por funcionalidad | specs 001 a 022 |
| Reglas de accesibilidad en el diseño: objetivos de 48 px, ícono decorativo oculto, estado nunca solo por color, contraste con pares verificados | `Design.md` |
| Paleta oscura y respeto de "reducir movimiento" en el cargador, el patrón, el conteo y el indicador de escritura | specs 004 a 022 |
| Textos en español e inglés y pruebas de paridad de traducciones | spec 005 en adelante |
| Cifras de rendimiento medidas a mano (dashboard de 3 s, calendario de 2 s, listas de 300 ms) | specs 017, 019 y 021 |
| Las reglas de seguridad de `Conventions.md` §7: argon2, tokens cortos, límite de tasa, entradas validadas, secretos en variables de entorno | spec 001 |

| Qué falta | |
|---|---|
| Una prueba que falle si aparece una ruta sin regla de acceso, y una revisión de qué datos salen en las respuestas | |
| Comprobar de forma repetible que cada control de la app se anuncia bien a un lector de pantalla y que el movimiento respeta "reducir movimiento" en toda la app | |
| Comprobar que con letra grande y en modo oscuro nada se corta ni pierde contraste | |
| Datos de prueba con el volumen de una institución y una medición repetible, en vez de una prueba a mano por spec | |

## Clarifications

### Session 2026-11-22

- Q: ¿Entra funcionalidad nueva o cambios de diseño visual? → A: No; esta spec solo comprueba y corrige lo que ya existe.
- Q: ¿Qué nivel de accesibilidad se persigue? → A: Contraste AA (4,5:1 para texto normal y 3:1 para texto grande y para íconos) y uso completo con lector de pantalla; no se busca una certificación formal.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cada ruta tiene su regla de acceso y no filtra datos de más (Priority: P1)

Una prueba recorre todas las rutas del backend y falla si una ruta nueva no declara quién puede usarla o no está en una lista corta y explicada de rutas públicas. Otra comprueba que las respuestas no incluyen datos que no deben salir (claves, hashes, tokens, correos de terceros).

**Why this priority**: Los permisos son la regla que más se repite en el proyecto (cada spec los prueba una vez); una prueba global evita que una ruta futura quede abierta por olvido, y una revisión de las respuestas cierra la otra mitad del riesgo.

**Independent Test**: Agregar una ruta de prueba sin regla de acceso y comprobar que la prueba global falla y nombra la ruta; quitarla y comprobar que pasa.

**Acceptance Scenarios**:

1. **Given** todas las rutas del backend, **When** corre la prueba de acceso, **Then** cada ruta exige sesión y declara los roles que pueden usarla, o está en la lista de excepciones.
2. **Given** una ruta nueva sin regla de acceso, **When** corre la prueba, **Then** falla y nombra el método y la ruta.
3. **Given** la lista de excepciones públicas (registro, inicio de sesión, verificación y recuperación de clave, y las demás que haya), **When** se revisa, **Then** cada una está justificada y tiene su propia prueba de límite de tasa donde aplique.
4. **Given** las respuestas de los endpoints de cada rol, **When** se revisan, **Then** ninguna incluye `passwordHash`, tokens, claves de SMTP, códigos de verificación ni el correo o teléfono de una persona a la que el rol no tiene derecho.
5. **Given** un usuario con un rol, **When** llama a una ruta de otro rol, **Then** recibe `403` (o `404` si el recurso ajeno no debe revelarse) con un código de error estable.
6. **Given** los registros del servidor durante las pruebas de cada rol, **When** se revisan, **Then** no contienen contraseñas, tokens ni textos de mensajes o PQRS.

---

### User Story 2 - Usar la app con lector de pantalla y con "reducir movimiento" (Priority: P1)

Cada pantalla se puede recorrer con un lector de pantalla: todo control tiene nombre y rol, el orden es lógico, los estados (cargando, error, vacío, deshabilitado) se anuncian y los íconos decorativos no se leen. Todo movimiento de la app respeta "reducir movimiento".

**Why this priority**: Es la barrera más difícil para quien la necesita y la más fácil de romper sin darse cuenta; sin una comprobación repetible, cada spec nueva puede dejar un control sin nombre.

**Independent Test**: Correr las pruebas de accesibilidad de cada pantalla principal y recorrer a mano el inicio de sesión, el dashboard, el cronograma y el chat con TalkBack o VoiceOver.

**Acceptance Scenarios**:

1. **Given** una pantalla principal de cada rol, **When** corre la prueba de accesibilidad, **Then** cada control táctil tiene etiqueta y rol, los de solo ícono llevan etiqueta, y ningún control mide menos de 48 px.
2. **Given** un ícono junto a un texto, **When** lo recorre un lector de pantalla, **Then** el ícono no se lee y el texto sí.
3. **Given** un estado de carga, de error, vacío o un botón deshabilitado, **When** aparece, **Then** se anuncia con su texto y, en el botón deshabilitado, con la regla que lo bloquea.
4. **Given** un formulario con errores, **When** falla la validación, **Then** cada campo con error lo anuncia con su mensaje.
5. **Given** "reducir movimiento" activo, **When** se usa cualquier pantalla, **Then** ninguna animación de desplazamiento, repetición o conteo se mueve; el contenido y los textos siguen visibles.
6. **Given** una pantalla nueva en el futuro, **When** corre la suite, **Then** una comprobación global avisa si un componente anima sin consultar "reducir movimiento" o si un control táctil no tiene etiqueta.

---

### User Story 3 - Letra grande y modo oscuro sin pérdidas (Priority: P2)

Con el tamaño de letra del sistema al máximo que admite la app y con el modo oscuro, ninguna pantalla principal corta texto ni pierde contraste: los textos se leen, los botones siguen siendo tocables y los pares de colores cumplen AA.

**Why this priority**: Mucha gente sube el tamaño de letra o usa modo oscuro; un texto cortado o un gris sobre gris invalida una pantalla. No bloquea el uso normal, por eso va después de seguridad y lector de pantalla.

**Independent Test**: Subir la letra del sistema al 200 % y abrir cada pantalla principal en modo claro y oscuro; comprobar que nada se corta ni se superpone y que los pares de colores cumplen el contraste.

**Acceptance Scenarios**:

1. **Given** el tamaño de letra al 200 % del sistema, **When** se abre cada pantalla principal, **Then** el texto no se corta ni se superpone y cada acción sigue siendo alcanzable (con desplazamiento si hace falta).
2. **Given** el modo oscuro, **When** se abre cada pantalla principal, **Then** todo el texto y los íconos cumplen contraste AA (4,5:1 el texto normal; 3:1 el texto grande y los íconos) contra su fondo.
3. **Given** la paleta clara y la oscura, **When** corre la prueba de contraste, **Then** cada par de texto y fondo documentado en `Design.md` cumple su mínimo y la prueba falla si se cambia un color y deja de cumplir.
4. **Given** el estado de un elemento (programada, cancelada, radicada, resuelta), **When** se ve en modo oscuro, **Then** sigue distinguiéndose por su texto y su ícono, no solo por el color.
5. **Given** el idioma inglés o español con letra grande, **When** se ve un botón con ícono y texto largo, **Then** el texto se parte o el botón crece, sin cortar el ícono ni la palabra.

---

### User Story 4 - Rendimiento con el volumen de una institución (Priority: P2)

Con datos del tamaño de una institución real (200 módulos, miles de sesiones, 200 PQRS, cientos de cuentas y decenas de conversaciones) las pantallas principales cargan rápido y los endpoints principales responden dentro de su meta; una medición repetible lo comprueba.

**Why this priority**: Las metas de rendimiento de las specs anteriores se midieron a mano con pocos datos; con volumen real una consulta sin índice puede tardar segundos. No cambia lo que ve el usuario si todo va bien, por eso es P2.

**Independent Test**: Cargar los datos de volumen, correr la medición y comprobar que cada endpoint principal cumple su meta; abrir los dashboards y el cronograma en la app con esos datos.

**Acceptance Scenarios**:

1. **Given** un conjunto de datos de volumen que se puede cargar con un solo comando, **When** se carga, **Then** hay 200 módulos, al menos 4.000 sesiones, 200 PQRS, 500 estudiantes, 40 docentes, y conversaciones con mensajes.
2. **Given** esos datos, **When** corre la medición, **Then** el servidor responde cada endpoint principal (lista de módulos del CAE y del estudiante, calendario del docente y del estudiante, dashboards de los tres roles, lista de PQRS con filtros, conversaciones y mensajes) en menos de 300 ms, o se registra y corrige el que no.
3. **Given** el dashboard del CAE con esos datos, **When** se abre en la app, **Then** muestra todas sus cifras en menos de 3 segundos.
4. **Given** una lista larga (módulos, PQRS, mensajes), **When** se recorre con el dedo, **Then** se desplaza sin saltos visibles y carga más páginas al llegar al final.
5. **Given** una consulta que supere su meta, **When** se analiza, **Then** se corrige con un índice o una consulta mejor y la medición lo confirma, sin cambiar lo que devuelve el endpoint.

---

### Edge Cases

- Una ruta pública legítima nueva: se agrega a la lista de excepciones con su justificación, no se desactiva la prueba.
- Una ruta con roles pero con datos de otro usuario (por identificador): la prueba de propiedad la responde como si no existiera, y la revisión de cada recurso con dueño lo comprueba.
- Un control táctil dentro de una lista que se repite: la prueba lo revisa una vez por pantalla, no una vez por fila.
- Un componente con movimiento que ya consulta "reducir movimiento" a través de un gancho propio: la comprobación global lo reconoce.
- Letra grande con una pantalla con barra de pestañas: la barra no pierde sus etiquetas ni se corta; se permite que crezca.
- Modo oscuro con una imagen o logo que no cambia: se verifica que sigue legible sobre el fondo oscuro.
- Datos de volumen con cuentas desactivadas, módulos eliminados y periodos cerrados: la medición los incluye, porque son los que más cuestan en las consultas.
- La medición en una máquina distinta o con carga: las metas se comparan con un margen y el resultado se anota con el entorno, no como prueba que falla sola.
- Los datos de volumen nunca se cargan en producción ni mezclados con los de desarrollo sin aviso.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El backend MUST tener una prueba que recorra todas sus rutas y falle, nombrando el método y la ruta, si alguna no exige sesión y declara los roles que pueden usarla, salvo las de una lista de excepciones públicas explícita y justificada.
- **FR-002**: Cada excepción pública MUST estar documentada con su motivo y, si recibe datos de personas sin sesión (registro, inicio de sesión, verificación, recuperación), MUST tener límite de tasa y una prueba que lo compruebe.
- **FR-003**: Las respuestas de los endpoints de cada rol MUST NOT incluir `passwordHash`, tokens, claves o configuración secreta de SMTP, códigos de verificación o de recuperación, ni datos de contacto (correo, teléfono) de personas a quienes ese rol no tiene derecho a verlos; una prueba MUST comprobarlo sobre las respuestas reales.
- **FR-004**: Los registros del servidor durante las pruebas de cada rol MUST NOT contener contraseñas, tokens ni textos de mensajes, PQRS o respuestas.
- **FR-005**: Cada pantalla principal de cada rol MUST pasar una prueba de accesibilidad: todo control táctil con etiqueta y rol, los de solo ícono con etiqueta, ninguno de menos de 48 px, los íconos junto a texto ocultos al lector de pantalla y los estados (cargando, error, vacío, deshabilitado con su regla) anunciados.
- **FR-006**: Los errores de un formulario MUST anunciarse junto a su campo con su mensaje.
- **FR-007**: Una comprobación global MUST fallar si un componente anima (desplazamiento, repetición, conteo, entrada o salida) sin consultar "reducir movimiento", y si un control táctil de una pantalla no tiene etiqueta; con "reducir movimiento" activo, nada se mueve y el contenido sigue visible.
- **FR-008**: Con la letra del sistema al 200 %, cada pantalla principal MUST mostrar sus textos sin cortarlos ni superponerlos, y cada acción MUST seguir siendo alcanzable.
- **FR-009**: Cada par de texto y fondo (y de ícono y fondo) de las paletas clara y oscura MUST cumplir contraste AA (4,5:1 texto normal; 3:1 texto grande e íconos) y una prueba MUST fallar si un cambio de color deja de cumplirlo.
- **FR-010**: Debe existir un conjunto de datos de volumen (200 módulos, al menos 4.000 sesiones, 200 PQRS, 500 estudiantes, 40 docentes y conversaciones con mensajes, con cuentas desactivadas, módulos eliminados y periodos cerrados mezclados) que se carga con un solo comando y nunca en producción.
- **FR-011**: Una medición repetible MUST registrar el tiempo de servidor de los endpoints principales con esos datos (lista de módulos del CAE y del estudiante, calendarios, dashboards, lista de PQRS con filtros, conversaciones y mensajes) y compararlo con la meta de 300 ms; lo que la supere MUST corregirse sin cambiar lo que el endpoint devuelve.
- **FR-012**: Con esos datos, el dashboard del CAE MUST abrir con todas sus cifras en menos de 3 segundos y el cambio de semana del cronograma MUST mostrarse en menos de 2 segundos.
- **FR-013**: Esta spec MUST NOT agregar funcionalidad, pantallas ni cambios de diseño visual; solo comprobaciones, correcciones y datos de prueba.
- **FR-014**: Todo texto nuevo (etiquetas de accesibilidad que falten) MUST estar en español e inglés; las correcciones MUST mantener los colores de `Design.md`, los íconos de Iconify y los objetivos de 48 px.

### Key Entities

- **Lista de excepciones públicas**: las rutas que se pueden llamar sin sesión, cada una con su motivo; vive junto a la prueba de acceso.
- **Conjunto de datos de volumen**: datos de prueba de una institución real, que se cargan aparte de los de desarrollo y no tocan producción.
- **Informe de medición**: el tiempo de servidor por endpoint con el entorno y la fecha, comparado con la meta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las rutas del backend está cubierto por la prueba de acceso: o declara roles o está en la lista de excepciones, y una ruta sin regla hace fallar la suite.
- **SC-002**: Ninguna respuesta revisada contiene un dato secreto o de contacto ajeno, y ningún registro de las pruebas contiene contraseñas, tokens ni textos de mensajes.
- **SC-003**: El 100 % de las pantallas principales pasa la prueba de accesibilidad (etiquetas, roles, 48 px, íconos decorativos ocultos) y ninguna animación ignora "reducir movimiento".
- **SC-004**: Con letra al 200 %, el 100 % de las pantallas principales muestra sus textos sin cortarlos y con sus acciones alcanzables.
- **SC-005**: El 100 % de los pares de color de las paletas clara y oscura cumple su mínimo de contraste AA.
- **SC-006**: Con el volumen de una institución, el 95 % de las respuestas de los endpoints principales tarda menos de 300 ms en el servidor y el dashboard del CAE abre en menos de 3 segundos.

## Assumptions

- Las "pantallas principales" son las que cada rol usa a diario: inicio de sesión y registro, dashboards o inicio, módulos, cronograma, mensajes (lista y chat), PQRS (lista, formulario y detalle), notificaciones, perfil y las de configuración y cuentas del CAE.
- "Letra al 200 %" es el máximo que se comprueba aunque el sistema permita más; con una letra aún mayor se admite que haya que desplazar, pero nunca perder una acción.
- La verificación con lector de pantalla combina pruebas automáticas (etiquetas, roles, tamaños) y un recorrido manual de las pantallas clave con TalkBack o VoiceOver; la parte manual no se puede automatizar del todo.
- Las metas de rendimiento reutilizan las ya fijadas en las specs 017, 019 y 021 (300 ms en servidor, 3 s el dashboard, 2 s el cambio de semana); esta spec las mide con volumen, no las cambia.
- Los datos de volumen son sintéticos, sin datos personales reales, y viven en el repositorio de la base de datos junto a la semilla de desarrollo, con un comando propio.
- Corregir un hallazgo no cambia el contrato de la API ni lo que ve la persona usuaria, salvo para quitar un dato que no debía salir (FR-003), que se trata como una corrección y no como funcionalidad.
- Queda fuera de alcance: una auditoría de seguridad externa, pruebas de penetración, una certificación de accesibilidad (WCAG formal), pruebas en dispositivos reales de todas las marcas y el despliegue.
