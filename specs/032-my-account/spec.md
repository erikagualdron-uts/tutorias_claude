# Feature Specification: Mi cuenta

**Feature Branch**: `032-my-account`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "Spec 032: pantalla de administración de la propia cuenta para los tres roles (estudiante, docente y CAE). Hoy el avatar de la barra superior abre un menú que solo permite cerrar sesión; no existe una pantalla donde la persona vea y gestione su cuenta. La nueva pantalla «Mi cuenta» debe mostrar los datos de la cuenta de quien ha iniciado sesión (nombre, correo institucional, rol), permitir las acciones de cuenta que ya existen (cambiar la contraseña y cerrar sesión) y, solo si ya existen, preferencias propias de la app. Debe seguir el sistema de diseño, las reglas de `CLAUDE.md` y la accesibilidad de la spec 023, y ser coherente entre los tres roles. Sin reglas de negocio nuevas y sin cambiar quién crea o desactiva cuentas (sigue siendo del CAE)."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| Menú del avatar | El avatar de la barra superior abre un menú con una sola acción: «Cerrar sesión» (`AppBar`). No hay pantalla de perfil, aunque `Design.md` dice que el avatar «abre el perfil» |
| Datos de la sesión | La sesión ya guarda correo, rol, idioma y, cuando existen, nombre y apellido (`UserSummary`); el backend ya expone `GET /auth/me` |
| Cambio de contraseña | Existe la pantalla de cambio de clave y el backend permite cambiarla en cualquier momento (`POST /auth/change-password` con permiso de cambio de clave), pero la pantalla solo se usa como paso obligatorio: la ruta del cambio forzado bloquea toda la navegación mientras la clave sea temporal |
| Notificaciones push | El estado del permiso ya se conoce (`usePushPermission`) y ya hay un aviso y un botón para activarlas en la bandeja de avisos |
| Idioma | La app sigue el idioma del dispositivo; no hay preferencia propia |
| Edición de datos | No existe ningún endpoint para que una persona cambie su nombre o correo; hoy solo el CAE gestiona cuentas. Fuera de alcance de esta spec (decisión de la persona dueña del producto) |
| Quién gestiona las cuentas | El CAE crea docentes, y activa o desactiva docentes y estudiantes; esto no cambia |

## Clarifications

### Session 2026-11-24

- Q: ¿Quiere que la persona pueda editar su nombre y apellido desde «Mi cuenta», o que la pantalla sea solo de consulta más cambiar la contraseña y cerrar sesión? → A: Opción A, por ahora solo consulta: la pantalla muestra nombre, correo y rol, y sus acciones son cambiar la contraseña y cerrar sesión. Sin cambios de backend; editar el nombre puede ser una spec posterior.
- Q: ¿Quiere que «Mi cuenta» muestre también el estado de las notificaciones push (activadas, desactivadas o sin decidir) con un botón para activarlas? → A: Opción A, sí: una fila «Notificaciones» con su estado en texto e ícono y, cuando falta, el botón de activar que ya existe; si el sistema las bloqueó, se explica la regla (se activan desde los ajustes del teléfono).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver mi cuenta (Priority: P1)

Cualquier persona con sesión iniciada abre «Mi cuenta» desde el avatar y ve quién es para la app: su nombre, su correo institucional y su rol (estudiante, docente o CAE), con la misma estructura en los tres roles.

**Why this priority**: Hoy no hay forma de comprobar con qué cuenta se está dentro; es la base de todo lo demás.

**Independent Test**: Iniciar sesión con cada rol, abrir «Mi cuenta» desde el menú del avatar y comprobar los datos y el rol; en claro y oscuro, en español e inglés.

**Acceptance Scenarios**:

1. **Given** una persona con sesión iniciada, **When** toca su avatar, **Then** el menú ofrece «Mi cuenta» y «Cerrar sesión», y «Mi cuenta» abre la pantalla.
2. **Given** la pantalla «Mi cuenta», **When** se abre, **Then** muestra el nombre y apellido, el correo y el rol de la persona, con el rol en texto e ícono.
3. **Given** una cuenta sin nombre o apellido guardado, **When** se abre la pantalla, **Then** muestra el correo como identificador y no deja campos vacíos ni rotos.
4. **Given** los tres roles, **When** se abre la pantalla, **Then** la estructura, el espaciado y los estados son los mismos, cambiando solo los datos.

---

### User Story 2 - Cambiar mi contraseña cuando yo quiera (Priority: P1)

Desde «Mi cuenta», la persona abre el cambio de contraseña, escribe la actual y la nueva, y la cambia sin que se le obligue a hacerlo; al terminar vuelve a «Mi cuenta» con la confirmación.

**Why this priority**: Es la acción de cuenta más útil que el backend ya permite en cualquier momento y que hoy solo se alcanza si la clave es temporal.

**Independent Test**: Con cada rol, abrir el cambio de contraseña desde «Mi cuenta», cambiarla con datos válidos, con clave actual incorrecta y con clave nueva inválida; iniciar sesión de nuevo con la clave nueva.

**Acceptance Scenarios**:

1. **Given** «Mi cuenta», **When** se elige cambiar la contraseña, **Then** se abre el formulario de cambio con los dos campos y un solo botón principal con ícono.
2. **Given** datos válidos, **When** se envía, **Then** la contraseña se cambia, se muestra una confirmación y se vuelve a «Mi cuenta» sin cerrar la sesión.
3. **Given** una clave actual incorrecta o una nueva que no cumple las reglas, **When** se envía, **Then** se muestra el error de campo o de regla con su explicación y la pantalla no pierde lo escrito.
4. **Given** el cambio de contraseña obligatorio por clave temporal, **When** ocurre, **Then** sigue siendo un paso que bloquea la navegación hasta cambiarla, sin cambiar su comportamiento actual.

---

### User Story 3 - Cerrar sesión desde mi cuenta (Priority: P2)

Desde «Mi cuenta», la persona puede cerrar su sesión con una acción visible, además del menú del avatar.

**Why this priority**: Agrupa en una sola pantalla lo que la persona puede hacer con su cuenta; el menú del avatar ya cubre la necesidad básica.

**Independent Test**: Cerrar sesión desde «Mi cuenta» con cada rol y comprobar que se vuelve al inicio de sesión.

**Acceptance Scenarios**:

1. **Given** «Mi cuenta», **When** se elige cerrar sesión, **Then** la sesión termina y se vuelve a la pantalla de inicio de sesión, igual que desde el menú del avatar.
2. **Given** la acción de cerrar sesión, **When** se muestra, **Then** se distingue como acción de salida (ícono y texto con el color de error legible en ambos modos).

---

### User Story 4 - Saber si recibiré avisos (Priority: P2)

Desde «Mi cuenta», la persona ve si las notificaciones push están activadas, sin decidir o bloqueadas, y puede activarlas cuando falten, sin tener que ir a la bandeja de avisos.

**Why this priority**: Evita perder avisos de cambios de sesión sin darse cuenta y reutiliza lo que la app ya sabe hacer.

**Independent Test**: Abrir «Mi cuenta» con el permiso concedido, sin decidir y bloqueado, en claro y oscuro, en español e inglés.

**Acceptance Scenarios**:

1. **Given** el permiso concedido, **When** se abre «Mi cuenta», **Then** la fila «Notificaciones» indica que están activadas, con texto e ícono.
2. **Given** el permiso sin decidir, **When** se abre, **Then** la fila indica que no están activadas y ofrece el botón de activar existente, con ícono a la izquierda.
3. **Given** el permiso bloqueado por el sistema, **When** se abre, **Then** la fila explica que se activan desde los ajustes del teléfono, sin ofrecer un botón que no puede funcionar.
4. **Given** que la persona activa las notificaciones desde «Mi cuenta», **When** concede el permiso, **Then** la fila pasa a «activadas» y el dispositivo queda registrado como lo hace la bandeja.

---

### Edge Cases

- Cuenta con nombre muy largo, o letra grande del sistema: nada se corta ni se solapa y los objetivos táctiles se mantienen en 48 px.
- Sin red al abrir la pantalla: los datos de la sesión ya guardados se muestran; las acciones que requieren red muestran su error con reintento.
- Cambio de modo con la pantalla abierta: cambia sin reiniciar y sin destellos.
- «Reducir movimiento» activo: las animaciones se omiten o se reducen.
- Sesión expirada mientras se cambia la contraseña: se explica el motivo y se vuelve al inicio de sesión.
- Cuenta del CAE: la pantalla no muestra acciones de administración de otras cuentas; esas siguen en el índice de «Más».

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El menú del avatar de la barra superior MUST ofrecer «Mi cuenta» y «Cerrar sesión» en los tres roles; «Mi cuenta» MUST abrir una pantalla propia.
- **FR-002**: «Mi cuenta» MUST mostrar el nombre y apellido (o el correo cuando no existan), el correo institucional y el rol de la persona con sesión, con el rol en texto e ícono.
- **FR-003**: «Mi cuenta» MUST permitir abrir el cambio de contraseña en cualquier momento, reutilizando el formulario y las reglas de contraseña existentes, y MUST volver a «Mi cuenta» con una confirmación al terminar.
- **FR-004**: El cambio de contraseña obligatorio por clave temporal MUST conservar su comportamiento actual (bloquea la navegación hasta cambiarla); el cambio voluntario MUST NOT bloquear la navegación ni cerrar la sesión.
- **FR-005**: «Mi cuenta» MUST permitir cerrar la sesión con una acción visible y distinguible, con el mismo efecto que el menú del avatar.
- **FR-006**: La pantalla MUST ser idéntica en estructura para los tres roles y MUST NOT mostrar acciones de administración de otras cuentas (crear, activar o desactivar), que siguen siendo del CAE.
- **FR-007**: Ninguna acción nueva MUST cambiar quién puede crear o desactivar cuentas ni introducir reglas de negocio nuevas; las reglas de contraseña y de sesión MUST seguir validándose en el backend.
- **FR-008**: La pantalla MUST seguir el sistema de diseño (`Design.md`), usar solo roles de color del tema en claro y oscuro, no introducir colores, textos fuera de las traducciones ni valores sueltos, y respetar la accesibilidad de la spec 023 (etiquetas, roles, contraste, objetivos de 48 px, «reducir movimiento»).
- **FR-009**: Todos los textos MUST estar en español e inglés; los estados de error, carga y vacío MUST usar las piezas compartidas.
- **FR-010**: «Mi cuenta» MUST ser de solo consulta en cuanto a los datos (nombre, correo y rol no se editan) y MUST NOT requerir ningún endpoint ni regla de negocio nuevos en el backend.
- **FR-011**: «Mi cuenta» MUST mostrar el estado de las notificaciones push (activadas, sin decidir o bloqueadas) como texto más ícono, ofrecer el botón de activar existente cuando el permiso aún se puede pedir, y explicar la regla cuando el sistema las bloqueó (solo se activan desde los ajustes del teléfono); MUST reutilizar el estado y la activación que la bandeja de avisos ya usa, sin cambiar el backend.

### Key Entities *(include if feature involves data)*

- **Cuenta de la sesión**: la persona con sesión iniciada: nombre y apellido (pueden faltar), correo institucional, rol (estudiante, docente o CAE) e idioma. Ya existe en la sesión y en el backend; esta spec solo la muestra.
- **Contraseña**: se cambia con la clave actual y una nueva que cumple las reglas existentes; ya existe en el backend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Con cada uno de los tres roles, una persona llega a «Mi cuenta» desde el avatar en 2 toques y ve su nombre (o correo), su correo y su rol.
- **SC-002**: Una persona cambia su contraseña desde «Mi cuenta» en menos de 1 minuto y sin que se cierre la sesión.
- **SC-003**: 0 cambios en el comportamiento del cambio de contraseña obligatorio por clave temporal: sus pruebas existentes pasan sin ajustes.
- **SC-004**: La pantalla cumple el 100 % de las 8 reglas de revisión de `Design.md` en claro y oscuro, en español e inglés, y todas sus guardas automáticas (contraste, valores sueltos, indicadores, presupuesto de cabecera) pasan.
- **SC-005**: Los tres roles ven la misma estructura de pantalla: una persona que conoce la de un rol reconoce las demás en menos de 5 segundos.
- **SC-006**: 0 acciones de administración de otras cuentas aparecen en «Mi cuenta» y 0 reglas de negocio de cuentas cambian.
- **SC-007**: El estado de las notificaciones se lee en menos de 5 segundos desde que se abre «Mi cuenta» y coincide con el que muestra la bandeja de avisos en los tres estados del permiso.

## Assumptions

- Depende de las specs 026 a 031 (sistema de diseño y cabecera de marca); la rama se apila sobre la 031 mientras sus PRs sigan abiertos.
- La entrada es el menú del avatar (decisión por defecto); no se añade una pestaña ni un ítem nuevo en la barra inferior.
- Los textos de la pantalla son nuevos (por ejemplo «Mi cuenta») y se agregan a las traducciones en español e inglés; esta spec es la excepción a «sin textos nuevos» de las fases de diseño.
- La pantalla reutiliza el formulario de cambio de contraseña existente; para el cambio voluntario hace falta que la ruta sea alcanzable sin que la regla de clave temporal la bloquee, sin modificar esa regla.
- Editar datos queda fuera de esta spec (se decidió solo consulta); las notificaciones push (FR-011) sí se incluyen, con el estado y la activación que ya existen.
