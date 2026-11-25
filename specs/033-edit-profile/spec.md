# Feature Specification: Editar mi nombre

**Feature Branch**: `033-edit-profile`

**Created**: 2026-11-24

**Status**: Draft

**Input**: User description: "Edición del perfil: el usuario puede cambiar su propio nombre desde la pantalla «Mi cuenta» (spec 032). Requiere endpoint nuevo en el backend con guard de roles y validación en servidor; el correo no es editable (dominios institucionales, D-129 y reglas de registro)."

## Estado de partida

| Qué hay hoy | Detalle |
|---|---|
| «Mi cuenta» | Pantalla de solo consulta (spec 032): muestra nombre y apellido, correo y rol, y permite cambiar la contraseña y cerrar sesión. La spec 032 dejó la edición del nombre para una spec posterior |
| Dónde vive el nombre | Solo en el perfil de estudiante y en el de docente (nombre y apellido). El CAE no tiene perfil, por lo que no tiene nombre guardado y se identifica por su correo |
| Quién cambia el nombre hoy | El estudiante lo escribe al registrarse (hasta 100 caracteres cada campo) y no puede cambiarlo; el docente lo recibe del CAE, que lo edita |
| Endpoint de cuenta | Existe `GET /auth/me`; no existe ningún endpoint para que una persona cambie su propio nombre |
| Correo | No se edita: los dominios institucionales definen el rol y la verificación (reglas de registro) |

## Clarifications

### Session 2026-11-24

- Q: El CAE no tiene nombre guardado: ¿puede tenerlo y editarlo? → A: No. La edición aplica solo a quienes ya tienen perfil; el CAE sigue identificado por su correo. Sin perfil nuevo para el CAE.
- Q: Los docentes los gestiona el CAE y su nombre se ve en módulos y chats: ¿el docente puede cambiar su propio nombre? → A: No. El docente ve su nombre sin editarlo y la pantalla explica que lo gestiona el CAE. Solo el estudiante edita su nombre.
- Q: ¿Se debe guardar un registro de los cambios de nombre de un estudiante? → A: Opción B: se guarda un registro interno (persona, fecha, valor anterior y nuevo), sin pantalla para consultarlo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Corregir mi nombre como estudiante (Priority: P1)

Un estudiante abre «Mi cuenta», elige editar su nombre, cambia su nombre y apellido, guarda y ve el cambio reflejado de inmediato en «Mi cuenta» y en el resto de la app (por ejemplo, en el saludo y en el chat).

**Why this priority**: Es el único cambio de datos que esta spec habilita y resuelve el caso real de un nombre mal escrito al registrarse, que hoy no tiene arreglo.

**Independent Test**: Con una cuenta de estudiante, editar nombre y apellido con datos válidos, con campos vacíos y con más de 100 caracteres; cerrar y abrir la app y comprobar que el nombre persiste.

**Acceptance Scenarios**:

1. **Given** «Mi cuenta» de un estudiante, **When** se elige editar el nombre, **Then** se abre un formulario con nombre y apellido rellenados con los valores actuales, campos con relleno y borde tenue, y un solo botón principal con ícono.
2. **Given** datos válidos, **When** se guardan, **Then** el nombre se actualiza, se muestra una confirmación y se vuelve a «Mi cuenta» con el nombre nuevo.
3. **Given** un nombre o apellido vacío o solo con espacios, o de más de 100 caracteres, **When** se intenta guardar, **Then** se muestra el error en el campo con su regla y no se pierde lo escrito.
4. **Given** el nombre cambiado, **When** otra pantalla lo muestra (saludo, chat, listados propios), **Then** muestra el valor nuevo sin cerrar sesión.
5. **Given** que el nombre no cambió, **When** se guarda, **Then** no se envía ningún cambio y se vuelve a «Mi cuenta» sin error.

---

### User Story 2 - Entender por qué no puedo editar mi nombre (Priority: P2)

Un docente o el CAE abre «Mi cuenta» y no ve una acción de editar el nombre; en su lugar entiende la regla: el docente, que su nombre lo gestiona el CAE; el CAE, que se identifica por su correo.

**Why this priority**: Cumple la regla de diseño de que toda acción bloqueada muestra la regla que la bloquea y evita que parezca un fallo.

**Independent Test**: Abrir «Mi cuenta» con cuenta de docente y de CAE, en claro y oscuro, en español e inglés.

**Acceptance Scenarios**:

1. **Given** «Mi cuenta» de un docente, **When** se abre, **Then** no hay acción de editar el nombre y se explica con texto que el CAE lo gestiona.
2. **Given** «Mi cuenta» del CAE, **When** se abre, **Then** no hay acción de editar el nombre y se muestra el correo como identificador, sin campos rotos.
3. **Given** cualquier rol sin permiso, **When** se intenta cambiar el nombre directamente contra el servidor, **Then** el servidor lo rechaza con un error de permisos (ocultar la acción no es la seguridad).

---

### Edge Cases

- Nombre con espacios al inicio o al final, o con espacios repetidos: se recortan antes de guardar.
- Nombre con acentos, ñ, apóstrofes o guiones (por ejemplo «María José», «O'Brien»): se aceptan tal cual.
- Sin red al guardar: se muestra el error con reintento y se conserva lo escrito.
- Sesión expirada al guardar: se explica el motivo y se vuelve al inicio de sesión.
- Cuenta de estudiante desactivada o eliminada mientras edita: el servidor rechaza el cambio y la app lo explica.
- Dos dispositivos con la misma cuenta: el último guardado prevalece; el otro ve el nombre nuevo al refrescar la sesión.
- Letra grande del sistema, modo oscuro y «Reducir movimiento»: nada se corta ni se solapa y los objetivos táctiles se mantienen en 48 px.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Un estudiante MUST poder cambiar su propio nombre y apellido desde «Mi cuenta», con un formulario de dos campos rellenados con los valores actuales.
- **FR-002**: El servidor MUST validar nombre y apellido: obligatorios tras recortar espacios y de máximo 100 caracteres cada uno, con la misma regla que el registro.
- **FR-003**: El servidor MUST permitir este cambio solo al rol estudiante y solo sobre su propia cuenta; una persona MUST NOT poder cambiar el nombre de otra cuenta, y los roles docente y CAE MUST recibir un error de permisos.
- **FR-004**: «Mi cuenta» MUST mostrar la acción de editar el nombre solo al estudiante; al docente MUST mostrarle la regla (su nombre lo gestiona el CAE) y al CAE su correo como identificador, sin acción de edición.
- **FR-005**: El correo, el rol, el estado de la cuenta y la contraseña MUST NOT cambiar con esta funcionalidad; el cambio de contraseña sigue siendo el de la spec 032.
- **FR-006**: Tras guardar, el nombre nuevo MUST verse en «Mi cuenta» y en las demás pantallas que lo muestran, sin cerrar la sesión.
- **FR-007**: El docente MUST seguir editándose solo por el CAE, sin cambios en esa gestión ni en quién crea o desactiva cuentas.
- **FR-008**: Los errores MUST usar los códigos estables del backend traducidos al español y al inglés, con el estado de carga y de error de las piezas compartidas; ningún texto visible va fuera de las traducciones.
- **FR-009**: La pantalla MUST seguir el sistema de diseño (`Design.md`): solo roles de color del tema en claro y oscuro, campos con relleno y borde, botones con ícono a la izquierda, 16 px entre botones apilados, objetivos de 48 px y accesibilidad de la spec 023.
- **FR-010**: Cada cambio de nombre de un estudiante MUST guardar un registro interno con la persona, la fecha (UTC), el nombre y apellido anteriores y los nuevos, en la misma operación que el cambio; el registro no se borra y MUST NOT tener pantalla ni endpoint de consulta en esta spec.
- **FR-011**: Esta funcionalidad MUST NOT introducir reglas de negocio nuevas de cuentas ni un perfil para el CAE.

### Key Entities *(include if feature involves data)*

- **Perfil de estudiante**: nombre y apellido de un estudiante (ya existen); esta spec permite que el propio estudiante los cambie.
- **Perfil de docente**: nombre y apellido de un docente (ya existen); no cambian en esta spec y siguen a cargo del CAE.
- **Registro de cambio de nombre**: constancia interna de cada cambio de nombre de un estudiante: persona, fecha, nombre y apellido anteriores y nuevos. Solo se escribe; no se consulta desde la app.
- **Cuenta de la sesión**: la persona con sesión iniciada; expone nombre y apellido cuando existen (ya existe).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un estudiante corrige su nombre desde el avatar: llega al formulario en 3 toques (avatar, «Mi cuenta», «Editar nombre») y termina en menos de 1 minuto.
- **SC-002**: El nombre nuevo se ve en «Mi cuenta» en el momento de guardar y se conserva al cerrar y abrir la app.
- **SC-003**: El 100 % de los intentos de docentes, del CAE o de otra cuenta por cambiar un nombre ajeno o sin permiso se rechazan en el servidor.
- **SC-004**: El 100 % de los nombres vacíos o de más de 100 caracteres se rechazan con un error de campo comprensible y sin perder lo escrito.
- **SC-005**: Docente y CAE entienden por qué no editan su nombre sin ayuda: la regla está visible en pantalla en el 100 % de los casos.
- **SC-006**: La pantalla cumple el 100 % de las reglas de revisión de `Design.md` en claro y oscuro, en español e inglés, y todas las guardas automáticas pasan.
- **SC-007**: El 100 % de los cambios de nombre guardados dejan su registro con el valor anterior y el nuevo, y un cambio que falla no deja registro ni cambia el nombre.
- **SC-008**: 0 cambios en el comportamiento del cambio de contraseña, del registro y de la gestión de docentes por el CAE: sus pruebas existentes pasan sin ajustes.

## Assumptions

- Depende de la spec 032 («Mi cuenta» y su ruta) y se apila sobre su rama mientras su PR siga abierto.
- Los correos de aviso a otras personas no mencionan el nombre del estudiante de forma que un cambio lo deje desactualizado; los avisos ya enviados no se reescriben.
- Los datos históricos (por ejemplo, mensajes de chat ya enviados) muestran el nombre actual porque se leen del perfil, no se copian.
- El registro de cambios es de uso interno del equipo técnico y del CAE ante un reclamo; consultarlo desde la app queda para otra spec.
- La edición del programa del estudiante, del teléfono del docente y del correo queda fuera de esta spec.
- Los límites de largo del nombre salen de configuración o de las reglas ya usadas en el registro, no de valores nuevos escritos en el código.
- La entrada es un botón en «Mi cuenta» que abre una pantalla propia, con el mismo patrón de la pantalla de cambio de contraseña.
