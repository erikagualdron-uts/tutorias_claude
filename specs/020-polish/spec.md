# Feature Specification: Pulido de PQRS, dashboards y pruebas

**Feature Branch**: `020-polish`

**Created**: 2026-11-22

**Status**: Draft

**Input**: User description: "Pulido de PQRS, dashboards y pruebas. Cierra pendientes anotados en Design.md y en las specs 017 a 019, sin reglas de negocio nuevas: confirmación al radicar con el número de radicado, línea de tiempo del estado de una PQRS, insignia de PQRS radicadas en la pestaña del CAE, conteo animado de las tarjetas del dashboard y una prueba de la app estable."

## Estado de partida (revisión del 2026-11-22)

| Qué ya existe | Dónde |
|---|---|
| Radicar una PQRS: al enviar, la app vuelve a la lista | spec 017 |
| Estado de una PQRS y las fechas de cada paso (radicación, paso a "En revisión", resolución); la API las entrega al CAE, no todavía al autor | spec 017 |
| Total de PQRS en estado "Radicada" para el CAE | spec 019, `GET /dashboard/admin/overview` |
| Tarjetas de métrica de los tres dashboards, sin animación de cifras | spec 019 |
| Respeto de "reducir movimiento" en las animaciones de la app | specs 007 y 009 |

| Qué falta (anotado en `Design.md` como "Not built yet" o en las notas de las specs) | |
|---|---|
| Pantalla de confirmación con el número de radicado al radicar | |
| Línea de tiempo vertical del estado de la PQRS | |
| Insignia con las PQRS radicadas en la pestaña "PQRS" del CAE | |
| Conteo hacia arriba de las cifras de las tarjetas, una vez en la primera carga | |
| Una prueba de la app (`module-form`) que agota los 5 s cuando corre toda la suite | |

## Clarifications

### Session 2026-11-22

- Q: ¿Entran las acciones "Notificar usuario" y "Responder por correo" de la PQRS? → A: No; el CAE sigue la conversación por correo fuera de la app.
- Q: ¿Cómo es el número de radicado? → A: Un código corto derivado del identificador de la PQRS (opción B); sin consecutivo ni dato nuevo.
- Q: ¿Entran el indicador de escritura y los acuses de lectura del chat? → A: No; quedan fuera de esta spec.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirmación al radicar una PQRS (Priority: P1)

Al radicar una PQRS, el docente o el estudiante ve una pantalla que confirma que quedó radicada y le muestra su número de radicado, la fecha y el estado, y desde ahí puede abrirla o volver a la lista.

**Why this priority**: Hoy la app vuelve a la lista sin decir nada; quien radica no sabe si el trámite quedó registrado ni tiene un número para citarlo al CAE.

**Independent Test**: Radicar una PQRS y comprobar que aparece la confirmación con un número, que ese número es el mismo que se ve en la lista y en el detalle, y que "Ver mi PQRS" abre ese detalle.

**Acceptance Scenarios**:

1. **Given** el formulario completo, **When** el autor confirma la radicación, **Then** ve una pantalla de confirmación con el número de radicado, la fecha en `America/Bogota` y el estado "Radicada".
2. **Given** la pantalla de confirmación, **When** toca "Ver mi PQRS", **Then** abre el detalle de la PQRS recién radicada.
3. **Given** la pantalla de confirmación, **When** toca "Volver a mis PQRS", **Then** vuelve a la lista con la nueva PQRS arriba.
4. **Given** un reintento de radicación (doble toque o reenvío), **When** el servidor devuelve la misma PQRS, **Then** la confirmación muestra el mismo número y no se crea otra.
5. **Given** una PQRS ya radicada, **When** el autor o el CAE la ven en la lista o en el detalle, **Then** muestran el mismo número de radicado.

---

### User Story 2 - Línea de tiempo del estado (Priority: P1)

En el detalle de una PQRS, el autor y el CAE ven una línea de tiempo vertical con los tres pasos (Radicada, En revisión, Resuelta), marcando cuáles ya ocurrieron, con la fecha y la hora de cada uno, y cuál es el paso actual.

**Why this priority**: Es la respuesta visual a "¿en qué va mi trámite y desde cuándo?"; hoy solo se ve una insignia sin fechas.

**Independent Test**: Con tres PQRS, una en cada estado, abrir cada detalle y comprobar los pasos cumplidos, las fechas y el paso actual.

**Acceptance Scenarios**:

1. **Given** una PQRS "Radicada", **When** se abre su detalle, **Then** la línea de tiempo marca "Radicada" con su fecha como paso actual, y "En revisión" y "Resuelta" como pendientes sin fecha.
2. **Given** una PQRS "En revisión", **When** se abre, **Then** "Radicada" y "En revisión" tienen su fecha y "En revisión" es el paso actual; "Resuelta" queda pendiente.
3. **Given** una PQRS "Resuelta", **When** se abre, **Then** los tres pasos tienen fecha y "Resuelta" es el paso actual.
4. **Given** cualquier paso, **When** se muestra, **Then** lleva su nombre en texto y un ícono, nunca solo color, y la fecha y hora salen en `America/Bogota`.
5. **Given** el CAE en el detalle de una PQRS, **When** la abre, **Then** ve la misma línea de tiempo que el autor.

---

### User Story 3 - PQRS radicadas a la vista del CAE (Priority: P2)

La pestaña "PQRS" del CAE muestra una insignia con la cantidad de PQRS en estado "Radicada", para que sepa que hay trámites sin atender sin tener que abrirla.

**Why this priority**: Evita revisar la lista para descubrir novedades; reutiliza una cifra que el dashboard ya calcula, por eso no bloquea lo demás.

**Independent Test**: Radicar PQRS como estudiante, entrar como CAE y comprobar que la insignia muestra la cantidad; pasar una a "En revisión" y comprobar que baja.

**Acceptance Scenarios**:

1. **Given** PQRS en estado "Radicada", **When** el CAE tiene sesión, **Then** la pestaña "PQRS" muestra una insignia con esa cantidad.
2. **Given** que no hay PQRS "Radicadas", **When** el CAE mira la barra, **Then** la pestaña no muestra insignia.
3. **Given** una insignia visible, **When** el CAE pasa una PQRS a "En revisión" y vuelve a la barra, **Then** la cantidad baja en uno.
4. **Given** más de 99 PQRS "Radicadas", **When** se muestra la insignia, **Then** dice `99+`.
5. **Given** un docente o un estudiante, **When** ven su barra, **Then** su pestaña "PQRS" no muestra esta insignia.

---

### User Story 4 - Cifras que cuentan hacia arriba (Priority: P2)

En los tres dashboards, los números de las tarjetas de métrica suben desde 0 hasta su valor, una sola vez en la primera carga, y no vuelven a animarse al refrescar. Con "reducir movimiento" activo muestran el valor final directamente.

**Why this priority**: `Design.md` lo pide como parte del estilo moderno y fluido; es pulido visual, no cambia ningún dato.

**Independent Test**: Abrir un dashboard por primera vez y ver el conteo; refrescar y comprobar que no se repite; activar "reducir movimiento" y comprobar que no hay conteo.

**Acceptance Scenarios**:

1. **Given** un dashboard que carga por primera vez, **When** aparecen las tarjetas, **Then** cada número sube de 0 a su valor en menos de un segundo.
2. **Given** un dashboard ya mostrado, **When** el usuario refresca o vuelve a la pestaña, **Then** los números cambian al valor nuevo sin repetir el conteo desde 0.
3. **Given** "reducir movimiento" activo en el dispositivo, **When** carga el dashboard, **Then** los números aparecen directamente con su valor final.
4. **Given** una tarjeta cuyo valor no es un número (el guion de "sin PQRS resueltas" o el tiempo de respuesta con unidad), **When** se muestra, **Then** aparece tal cual, sin conteo.
5. **Given** un lector de pantalla, **When** lee la tarjeta, **Then** anuncia el valor final y no los números intermedios.

---

### User Story 5 - Una suite de pruebas estable (Priority: P3)

La suite completa de la app pasa de forma repetible: la prueba del formulario de módulos deja de agotar el tiempo cuando corre con todas las demás.

**Why this priority**: Un fallo intermitente hace que cada revisión dude de si algo se rompió; no cambia lo que ve la persona usuaria.

**Independent Test**: Correr la suite completa de la app tres veces seguidas y comprobar que no falla ninguna prueba.

**Acceptance Scenarios**:

1. **Given** la suite completa de la app, **When** se corre tres veces seguidas, **Then** no falla ninguna prueba por tiempo agotado.
2. **Given** la prueba del formulario de módulos, **When** se corre sola, **Then** sigue verificando lo mismo que antes: pide lo que falta antes de enviar.

---

### Edge Cases

- Una PQRS radicada antes de esta spec también muestra su número y su línea de tiempo con las fechas que ya tiene.
- Un paso con fecha ausente (una PQRS vieja sin fecha de revisión) se muestra como cumplido sin hora, no como pendiente ni con una fecha inventada.
- Falla la radicación: no hay pantalla de confirmación; el formulario conserva lo escrito y muestra el error de siempre.
- El CAE sin conexión o con la consulta de la insignia fallando: la pestaña se ve sin insignia, sin error visible ni bloqueo.
- El conteo animado de una cifra que cambia mientras cuenta: termina en el valor más reciente.
- Cifras de varios dígitos o de miles: el conteo termina exactamente en el valor, sin redondeos ni saltos.
- Las fechas de la línea de tiempo respetan UTC en la base y `America/Bogota` en pantalla.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Al radicar una PQRS, la app MUST mostrar una pantalla de confirmación con el número de radicado, la fecha de radicación y el estado, y dos acciones: abrir esa PQRS y volver a la lista.
- **FR-002**: El número de radicado MUST ser el mismo en la confirmación, la lista y el detalle, para el autor y para el CAE, y MUST ser el mismo ante un reintento de radicación. El número de radicado es un código corto de 8 caracteres (letras mayúsculas A a F y dígitos) derivado del identificador de la PQRS, por ejemplo `A1B2C3D4`; no es consecutivo y no exige ningún dato nuevo.
- **FR-003**: El detalle de una PQRS, para el autor y para el CAE, MUST mostrar una línea de tiempo vertical con los pasos Radicada, En revisión y Resuelta, el paso actual resaltado y, en cada paso cumplido, la fecha y hora en `America/Bogota`.
- **FR-004**: Cada paso de la línea de tiempo MUST llevar su nombre en texto y un ícono; el estado nunca se indica solo con color.
- **FR-005**: La línea de tiempo MUST usar las fechas que ya se guardan de cada paso; un paso cumplido sin fecha se muestra sin hora, nunca con una fecha inventada.
- **FR-006**: La pestaña "PQRS" del CAE MUST mostrar una insignia con la cantidad de PQRS en estado "Radicada", oculta cuando es cero y con `99+` desde 100.
- **FR-007**: La insignia MUST actualizarse al abrir la app, al volver a la barra de pestañas y al cambiar el estado de una PQRS; si su consulta falla, la pestaña se muestra sin insignia y sin error.
- **FR-008**: La insignia MUST ser solo del CAE; las pestañas "PQRS" de docente y estudiante no la muestran.
- **FR-009**: Las tarjetas de métrica numéricas de los tres dashboards MUST contar de 0 a su valor, una sola vez en la primera carga, en menos de un segundo, y los cambios posteriores MUST mostrarse sin repetir el conteo.
- **FR-010**: Con "reducir movimiento" activo, las tarjetas MUST mostrar el valor final sin conteo; los valores no numéricos MUST mostrarse tal cual; el lector de pantalla MUST anunciar el valor final.
- **FR-011**: La suite completa de pruebas de la app MUST pasar de forma repetible, sin fallos por tiempo agotado, y la prueba del formulario de módulos MUST seguir verificando lo mismo.
- **FR-012**: Todos los textos nuevos MUST estar en español e inglés; las fechas, en `America/Bogota`; los íconos, solo Iconify; los colores, solo los de `Design.md`; los objetivos táctiles, de 48 px como mínimo.
- **FR-013**: Esta spec MUST NOT cambiar reglas de negocio, permisos ni estados de una PQRS; las acciones "Notificar usuario" y "Responder por correo", el indicador de escritura, los acuses de lectura, editar o borrar mensajes y los adjuntos quedan fuera de alcance.

### Key Entities

- **PQRS**: ya existe (spec 017). Esta spec le muestra un número de radicado y las fechas de sus pasos; el número es un código corto derivado de su identificador (FR-002).
- **Paso de la línea de tiempo**: Radicada, En revisión o Resuelta, con su fecha si ya ocurrió y una marca de paso actual. Calculado a partir de la PQRS, no guardado.
- **Insignia de PQRS radicadas**: cantidad de PQRS en estado "Radicada" que ve el CAE. Calculada, no guardada.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las PQRS radicadas muestra una pantalla de confirmación con un número, y ese número es idéntico en la confirmación, la lista y el detalle.
- **SC-002**: Una persona identifica en qué paso va su PQRS y desde cuándo en menos de 5 segundos desde que abre el detalle.
- **SC-003**: La insignia del CAE coincide en el 100 % de los casos con la cantidad de PQRS "Radicadas" y se actualiza en menos de 5 segundos tras volver a la barra.
- **SC-004**: El conteo de las tarjetas termina en menos de un segundo, no se repite al refrescar y no aparece con "reducir movimiento" activo, en el 100 % de los casos probados.
- **SC-005**: Tres corridas seguidas de la suite completa de la app terminan con cero pruebas fallidas por tiempo agotado.

## Assumptions

- Sin reglas de negocio nuevas: ni estados, ni permisos, ni plazos de PQRS cambian.
- Las fechas de cada paso ya se guardan al radicar, pasar a "En revisión" y resolver. Hoy la API las entrega al CAE pero no al autor, así que el detalle del autor pasa a incluirlas (un campo más en una respuesta que ya existe, sin dato nuevo); si alguna falta en datos viejos, se muestra el paso sin hora.
- El conteo animado dura unos 600 ms, termina en el valor exacto y no se usa en valores que no son números enteros simples.
- La insignia se refresca con la misma cifra que el dashboard del CAE; no hay canal en vivo (los avisos y contadores se consultan, D-099).
- La pantalla de confirmación es un paso nuevo después de radicar; no reemplaza la lista ni el detalle.
- El número de radicado es una ayuda para citar la PQRS: no cambia su identificador interno ni se usa para buscarla; al ser corto, dos PQRS podrían compartirlo en teoría, y por eso el CAE no lo usa como llave.
- La estabilidad de la prueba se logra sin quitarle verificaciones; si hace falta, se ajustan sus tiempos de espera.
- Quedan fuera de alcance: "Notificar usuario", "Responder por correo", indicador de escritura y acuses de lectura del chat, editar o borrar mensajes, adjuntos, y el despliegue.
