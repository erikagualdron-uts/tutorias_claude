# Feature Specification: Corregir la navegación a las pantallas sin pestaña

**Feature Branch**: `024-fix-hidden-tab-navigation`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Corregir la navegación a las pantallas ocultas de las pestañas: el botón de notificaciones (campana) de la barra superior no abre la bandeja y redirige al inicio en los tres roles; lo mismo ocurre con el enlace a la lista de cambios del dashboard del CAE. Alcance: que ambas abran su pantalla, que toda pantalla sin pestaña sea alcanzable, y una prueba con la navegación real que impida que vuelva a pasar."

## Estado de partida (diagnóstico del 2026-11-23)

| Qué pasa hoy | Detalle |
|---|---|
| La campana de la barra superior no abre la bandeja y deja a la persona en el inicio | Ocurre en los tres roles (estudiante, docente y CAE); reportado por el equipo al probar la app |
| Reproducido con la navegación real de la app | Las pantallas que no tienen pestaña en la barra inferior (la bandeja de avisos de los tres roles y la lista de cambios del CAE) no se pueden abrir: la navegación se queda en el inicio |
| La pantalla de cambios del CAE, enlazada desde un bloque del dashboard, tiene la misma falla | Es la otra única pantalla sin pestaña que existe hoy |
| Las pruebas actuales no lo detectaron | Las pruebas de la campana y de la bandeja simulan la navegación, así que comprueban la llamada y no que la pantalla se abra |
| Con otra forma de ocultar la pestaña, la pantalla sí se abre y la pestaña sigue sin verse | Comprobado con la navegación real; la barra inferior no cambia |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - La campana abre la bandeja de avisos (Priority: P1)

Una persona toca la campana de la barra superior, desde cualquier pantalla de su rol, y ve su bandeja de avisos; al volver atrás regresa a donde estaba.

**Why this priority**: Es la falla reportada. Sin ella la bandeja solo se alcanza desde la pestaña de mensajes, y el contador de la campana invita a un toque que no lleva a ningún lado.

**Independent Test**: Iniciar sesión con cada rol, tocar la campana desde el inicio y desde otra pestaña, y comprobar que se muestra la bandeja; volver atrás y comprobar que se regresa a la pantalla de origen.

**Acceptance Scenarios**:

1. **Given** un estudiante, un docente o el CAE con sesión, **When** toca la campana desde su pantalla de inicio, **Then** se abre la bandeja de avisos de su rol y no el inicio.
2. **Given** la campana tocada desde otra pestaña (módulos, cronograma, mensajes o PQRS), **When** la bandeja se abre y la persona vuelve atrás, **Then** regresa a esa pestaña y no al inicio.
3. **Given** la campana con avisos sin leer, **When** se abre la bandeja, **Then** se ven los avisos con sus no leídos resaltados y el contador sigue funcionando como hasta ahora.
4. **Given** la barra inferior, **When** se abre la bandeja desde la campana, **Then** la barra no gana una pestaña nueva ni cambia lo que mostraba.
5. **Given** una bandeja abierta, **When** se toca un aviso, **Then** abre el módulo, la PQRS o el chat al que se refiere, como ya estaba definido.

---

### User Story 2 - El enlace "Cambios" del dashboard del CAE abre su lista (Priority: P1)

El CAE toca el bloque de cambios recientes de su dashboard y ve la lista completa de cambios, y puede volver al dashboard.

**Why this priority**: Es la misma falla en la otra pantalla sin pestaña; arreglar solo la campana la dejaría rota.

**Independent Test**: Iniciar sesión como CAE, tocar el enlace a la lista de cambios desde el dashboard y comprobar que se abre; volver atrás y comprobar que regresa al dashboard.

**Acceptance Scenarios**:

1. **Given** el dashboard del CAE con cambios recientes, **When** toca el enlace para ver todos, **Then** se abre la lista de cambios.
2. **Given** la lista de cambios abierta, **When** la persona vuelve atrás, **Then** regresa al dashboard.
3. **Given** la barra inferior del CAE, **When** se abre la lista de cambios, **Then** no aparece una pestaña nueva.

---

### User Story 3 - Una pantalla sin pestaña nunca vuelve a quedar inalcanzable (Priority: P1)

Una comprobación automática con la navegación real de la app falla si una pantalla que se declara sin pestaña no se puede abrir, o si aparece en la barra inferior.

**Why this priority**: La falla pasó inadvertida porque las pruebas simulaban la navegación; sin una prueba con navegación real, la siguiente pantalla sin pestaña repetiría el error.

**Independent Test**: Declarar una pantalla sin pestaña de forma que no se pueda abrir y comprobar que la prueba falla y nombra la pantalla; corregirla y comprobar que pasa.

**Acceptance Scenarios**:

1. **Given** cada pantalla sin pestaña de cada rol (hoy la bandeja de avisos y, en el CAE, la lista de cambios), **When** corre la prueba, **Then** cada una se abre al navegar a ella y muestra su contenido.
2. **Given** la barra inferior de cada rol, **When** corre la prueba, **Then** muestra solo las pestañas declaradas y ninguna de las pantallas sin pestaña.
3. **Given** una pantalla nueva declarada sin pestaña en el futuro, **When** corre la suite, **Then** la prueba la incluye sin tocar la prueba y falla si no se puede abrir.
4. **Given** una pantalla sin pestaña, **When** la recorre un lector de pantalla, **Then** la barra inferior no anuncia una pestaña vacía ni oculta.

---

### Edge Cases

- Un aviso (push o de la bandeja) que se toca lleva a su módulo, PQRS o chat: no cambia; esos destinos viven dentro de una pestaña visible y los cubren las pruebas de la bandeja que ya existen.
- La campana tocada estando ya en la bandeja: no apila otra bandeja ni cambia nada.
- La campana tocada con una sesión que se acaba de cerrar: la persona va al inicio de sesión, como cualquier pantalla protegida.
- Una persona que cierra sesión y entra con otra cuenta: la campana abre la bandeja del rol nuevo.
- Cambio de contraseña obligatorio pendiente: la persona no puede llegar a la bandeja ni a otra pantalla de su rol; sigue en ese paso.
- Letra grande y modo oscuro: sin cambios, porque no se toca el aspecto de la barra ni de la bandeja.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Al tocar la campana de la barra superior, la app MUST abrir la bandeja de avisos del rol de la persona (estudiante, docente o CAE), desde cualquier pantalla con barra superior, y no el inicio.
- **FR-002**: Al volver atrás desde la bandeja abierta con la campana, la app MUST regresar a la pantalla de origen.
- **FR-003**: Al tocar el enlace de cambios recientes del dashboard del CAE, la app MUST abrir la lista de cambios, y al volver atrás regresar al dashboard.
- **FR-004**: Toda pantalla de un rol que no tenga pestaña MUST poder abrirse al navegar a ella desde un enlace, la campana o un aviso.
- **FR-005**: La barra inferior de cada rol MUST mostrar solo sus pestañas declaradas; las pantallas sin pestaña MUST NOT aparecer ni ser anunciadas por un lector de pantalla como pestaña.
- **FR-006**: Una prueba con la navegación real de la app (no simulada) MUST abrir cada pantalla sin pestaña de cada rol y fallar, nombrándola, si no se abre; y MUST comprobar que ninguna aparece en la barra inferior.
- **FR-007**: La prueba MUST tomar las pantallas sin pestaña de la misma declaración que usa la app, de modo que una pantalla nueva quede cubierta sin editar la prueba.
- **FR-008**: Esta spec MUST NOT agregar funcionalidad, cambiar el diseño visual de la barra ni de la bandeja, ni tocar el backend, la base de datos o las reglas de negocio.
- **FR-009**: La corrección MUST mantener la guarda de rutas: sin sesión se va al inicio de sesión y con cambio de contraseña pendiente se va a ese paso.

### Key Entities

- **Pantalla sin pestaña**: una pantalla de un rol que no aparece en la barra inferior y se alcanza desde un enlace, la campana o un aviso; hoy la bandeja de avisos de los tres roles y la lista de cambios del CAE.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los toques en la campana, en los tres roles y desde cada pestaña, abre la bandeja (hoy 0 %).
- **SC-002**: El enlace de cambios del dashboard del CAE abre la lista en el 100 % de los toques (hoy 0 %).
- **SC-003**: El 100 % de las pantallas sin pestaña declaradas en la app se abren en la prueba con navegación real, y una nueva que no se abra hace fallar la suite.
- **SC-004**: La barra inferior de cada rol muestra el mismo número de pestañas que antes de la corrección.
- **SC-005**: Ninguna prueba de pantalla, lint ni tipos que pasaban antes deja de pasar.

## Assumptions

- "Pantallas sin pestaña" son hoy solo dos: la bandeja de avisos (los tres roles) y la lista de cambios del CAE; el resto de pantallas de detalle viven dentro de una pestaña con su propia navegación y no se ven afectadas.
- La causa es la forma en que la barra de pestañas oculta esas pantallas: con la versión actual del router, una pantalla oculta de ese modo no se puede abrir. Se corrige con otra forma de ocultarla que sí permite navegar y no cambia lo que se ve.
- La bandeja embebida en la pestaña de mensajes (sección de avisos) no cambia.
- No hay cambios de textos visibles: se reutilizan las etiquetas existentes; si algún texto de accesibilidad faltara, iría en español e inglés.
- Fuera de alcance: rediseñar la campana o la bandeja, agregar tipos de aviso, filtros o acciones en la bandeja, y cualquier cambio de backend.
