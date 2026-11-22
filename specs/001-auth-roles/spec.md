# Feature Specification: Acceso y roles

**Feature Branch**: `001-auth-roles`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Acceso y roles de la app UTS Tutorías: inicio de sesión con correo y contraseña, tres roles (SUPERADMIN/CAE, TEACHER, STUDENT) con navegación propia, registro de estudiantes con @uts.edu.co y verificación de correo, docentes creados por el CAE con clave temporal, recuperación de contraseña, cuentas desactivadas o con borrado lógico sin acceso, sesión persistente y cierre de sesión, idioma según el dispositivo."

## Clarifications

### Session 2026-11-16

- Q: ¿Cuánto tiempo puede pasar sin abrir la app antes de que se pida iniciar sesión de nuevo? → A: 30 días sin uso; la caducidad se renueva con cada uso.
- Q: ¿Qué debe pasar si un docente pierde su clave temporal antes de su primer ingreso? → A: Usa "Recuperar contraseña" por correo; al restablecerla ya no se le exige otro cambio.
- Q: ¿Qué pasa cuando alguien se registra con un correo `@uts.edu.co` que ya tiene una cuenta sin verificar? → A: Se reenvía el código de verificación sin cambiar la contraseña de la cuenta sin verificar; quien olvidó su contraseña usa la recuperación. *(Revisada tras el análisis: la respuesta original, reemplazar la contraseña, permitía que un tercero fijara la contraseña de una cuenta que la víctima luego verificaba.)*
- Q: ¿El estudiante verifica su correo (y recupera su contraseña) escribiendo un código en la app o tocando un enlace del correo? → A: Código numérico de 6 dígitos que se escribe en la app.
- Q: ¿Puede un mismo usuario tener la sesión abierta en varios dispositivos a la vez? → A: Sí; cerrar sesión cierra solo el dispositivo actual.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Estudiante se registra y verifica su correo (Priority: P1)

Un estudiante abre la app por primera vez, se registra con su correo institucional `@uts.edu.co` y una contraseña, y recibe un mensaje de verificación. Hasta que verifique el correo no puede ingresar. Una vez verificado, inicia sesión y llega a la navegación de estudiante.

**Why this priority**: Es la puerta de entrada de la mayoría de los usuarios; sin ella ningún estudiante puede usar la app.

**Independent Test**: Registrar un correo `@uts.edu.co`, intentar ingresar sin verificar (debe bloquearse), verificar el correo e ingresar con éxito.

**Acceptance Scenarios**:

1. **Given** un visitante sin cuenta, **When** se registra con un correo `@uts.edu.co` válido y una contraseña que cumple los requisitos, **Then** se crea la cuenta con rol estudiante y se le envía un mensaje de verificación.
2. **Given** una cuenta de estudiante sin verificar, **When** intenta iniciar sesión, **Then** se le niega el acceso y se le explica que debe verificar su correo, con opción de reenviar el mensaje.
3. **Given** una cuenta sin verificar, **When** escribe el código de verificación recibido, **Then** la cuenta queda verificada y puede iniciar sesión.
4. **Given** un visitante, **When** intenta registrarse con un correo que no es `@uts.edu.co` (incluido `@correo.uts.edu.co`), **Then** el registro se rechaza y se le explica qué dominio se requiere.
5. **Given** un correo con cuenta ya verificada, **When** alguien intenta registrarse de nuevo con él, **Then** se rechaza sin crear una segunda cuenta.
6. **Given** un correo con cuenta sin verificar, **When** alguien se registra de nuevo con él, **Then** se reenvía el código de verificación, la contraseña existente no cambia y no se crea una segunda cuenta; la respuesta es idéntica a la de un registro nuevo.

---

### User Story 2 - Inicio de sesión y navegación por rol (Priority: P1)

Cualquier usuario con cuenta activa inicia sesión con correo y contraseña y llega a la navegación propia de su rol (estudiante, docente o CAE). Si las credenciales son incorrectas, recibe un mensaje claro.

**Why this priority**: Es la base de todas las demás funcionalidades: sin sesión y rol no hay app.

**Independent Test**: Iniciar sesión con una cuenta de cada rol y comprobar que cada una ve solo su conjunto de pestañas.

**Acceptance Scenarios**:

1. **Given** una cuenta de estudiante activa y verificada, **When** inicia sesión con credenciales correctas, **Then** ve la navegación de estudiante.
2. **Given** una cuenta de docente activa, **When** inicia sesión, **Then** ve la navegación de docente.
3. **Given** una cuenta del CAE activa, **When** inicia sesión, **Then** ve la navegación del CAE.
4. **Given** credenciales incorrectas, **When** intenta iniciar sesión, **Then** recibe un mensaje de error que no revela si el correo existe.
5. **Given** un usuario con un rol, **When** intenta acceder a una sección de otro rol, **Then** el acceso se rechaza.
6. **Given** varios intentos fallidos seguidos, **When** se supera el límite permitido, **Then** se bloquean temporalmente nuevos intentos y se informa al usuario cuánto debe esperar.

---

### User Story 3 - El CAE crea un docente y este cambia su clave temporal (Priority: P1)

El CAE crea la cuenta de un docente con un correo `@correo.uts.edu.co`. El sistema genera una clave temporal que se muestra una sola vez al CAE. En su primer ingreso, el docente debe cambiarla por una propia antes de poder usar cualquier otra parte de la app.

**Why this priority**: Los docentes no pueden registrarse solos; sin esta vía no existe el rol docente.

**Independent Test**: Crear un docente como CAE, copiar la clave temporal, iniciar sesión como docente y comprobar que solo puede cambiar la clave hasta completarlo.

**Acceptance Scenarios**:

1. **Given** el CAE autenticado, **When** crea un docente con un correo `@correo.uts.edu.co`, **Then** se crea la cuenta con rol docente y se muestra la clave temporal una sola vez, con opción de copiarla.
2. **Given** el CAE autenticado, **When** intenta crear un docente con un correo de otro dominio, **Then** se rechaza con un mensaje que indica el dominio permitido.
3. **Given** la clave temporal ya mostrada, **When** el CAE cierra el diálogo, **Then** la clave no vuelve a poder consultarse.
4. **Given** un docente con clave temporal, **When** inicia sesión, **Then** se le obliga a cambiar la clave y no puede navegar a ninguna otra pantalla hasta hacerlo.
5. **Given** un docente que cambia su clave, **When** la nueva clave cumple los requisitos y es distinta de la temporal, **Then** accede a su navegación normal.
6. **Given** una persona que no es CAE, **When** intenta crear un docente, **Then** la acción se rechaza.

---

### User Story 4 - Recuperación de contraseña por correo (Priority: P2)

Un usuario que olvidó su contraseña solicita recuperarla con su correo, recibe un mensaje con una forma segura de restablecerla y define una nueva contraseña.

**Why this priority**: Evita que los usuarios queden bloqueados y reduce la carga de soporte al CAE.

**Independent Test**: Solicitar la recuperación, escribir el código recibido, definir una nueva contraseña e iniciar sesión con ella.

**Acceptance Scenarios**:

1. **Given** un usuario con cuenta activa, **When** solicita recuperar su contraseña, **Then** recibe un mensaje de correo con la forma de restablecerla.
2. **Given** un correo no registrado, **When** se solicita la recuperación, **Then** la respuesta visible es idéntica a la de un correo registrado, para no revelar qué correos existen.
3. **Given** un código válido, **When** el usuario define una nueva contraseña válida, **Then** la contraseña cambia y las sesiones anteriores quedan cerradas.
4. **Given** un código vencido, ya usado o incorrecto, **When** se intenta usar, **Then** se rechaza y se ofrece solicitar uno nuevo.
5. **Given** una cuenta desactivada o con borrado lógico, **When** se solicita recuperación, **Then** no se restablece el acceso.

---

### User Story 5 - Sesión persistente y cierre de sesión (Priority: P2)

Un usuario que ya inició sesión puede cerrar y volver a abrir la app sin ingresar de nuevo. También puede cerrar sesión desde el menú de su perfil.

**Why this priority**: Mejora la experiencia diaria, pero la app es utilizable sin ella.

**Independent Test**: Iniciar sesión, cerrar la app por completo, reabrirla y comprobar que sigue dentro; luego cerrar sesión y comprobar que se pide ingresar.

**Acceptance Scenarios**:

1. **Given** un usuario con sesión iniciada, **When** cierra y reabre la app, **Then** sigue autenticado y ve la navegación de su rol sin volver a ingresar credenciales.
2. **Given** un usuario con sesión iniciada, **When** elige cerrar sesión, **Then** se cierra la sesión y la app muestra la pantalla de inicio de sesión.
3. **Given** un usuario que cerró sesión, **When** reabre la app, **Then** debe iniciar sesión de nuevo.
4. **Given** un usuario con sesión iniciada cuya cuenta es desactivada o borrada lógicamente, **When** la app intenta renovar o usar la sesión, **Then** la sesión se invalida y se le informa que su cuenta no tiene acceso.

---

### User Story 6 - Cuentas desactivadas o eliminadas sin acceso (Priority: P2)

Una cuenta desactivada o con borrado lógico no puede iniciar sesión, pero conserva su historial. Si el CAE reactiva una cuenta desactivada, el usuario recupera el acceso.

**Why this priority**: Es una regla de seguridad del negocio; el flujo de administrar cuentas completo queda para otra funcionalidad.

**Independent Test**: Marcar una cuenta como desactivada y otra como borrada lógicamente; verificar que ninguna inicia sesión y que sus datos siguen existiendo.

**Acceptance Scenarios**:

1. **Given** una cuenta desactivada, **When** su dueño intenta iniciar sesión con credenciales correctas, **Then** el acceso se niega con un mensaje que indica que la cuenta está desactivada y a quién acudir.
2. **Given** una cuenta con borrado lógico, **When** intenta iniciar sesión, **Then** el acceso se niega.
3. **Given** una cuenta desactivada, **When** el CAE la reactiva, **Then** el usuario puede iniciar sesión de nuevo con su contraseña vigente.
4. **Given** una cuenta con borrado lógico, **When** alguien intenta registrar un nuevo estudiante con ese mismo correo, **Then** el registro se rechaza.

---

### User Story 7 - Idioma según el dispositivo (Priority: P3)

La app se muestra en el idioma del dispositivo: español o inglés. Si el dispositivo está en otro idioma, se usa español. Los mensajes de correo (verificación, recuperación, clave temporal) se envían en el idioma guardado del usuario.

**Why this priority**: Es una regla transversal, pero una versión solo en español ya permitiría probar el acceso.

**Independent Test**: Cambiar el idioma del dispositivo entre español, inglés y un tercer idioma, y comprobar los textos de todas las pantallas de acceso.

**Acceptance Scenarios**:

1. **Given** un dispositivo en inglés, **When** se abre la app, **Then** todas las pantallas y mensajes de acceso aparecen en inglés.
2. **Given** un dispositivo en español, **When** se abre la app, **Then** todo aparece en español.
3. **Given** un dispositivo en un idioma distinto, **When** se abre la app, **Then** todo aparece en español.
4. **Given** un mensaje de error de una regla de acceso (dominio, cuenta desactivada, verificación pendiente), **When** se muestra, **Then** aparece en el idioma de la app.

---

### Edge Cases

- Registro con un correo en mayúsculas o con espacios al inicio o final: se normaliza y se trata como el mismo correo.
- Registro con `@correo.uts.edu.co` o con un dominio parecido (por ejemplo `@uts.edu.co.example.com`): se rechaza.
- Estudiante que no verifica el correo: el código vence; puede solicitar uno nuevo.
- Docente que abandona el cambio de clave a la mitad y cierra la app: al volver, sigue obligado a cambiarla.
- Docente que intenta usar como nueva clave la misma clave temporal: se rechaza.
- Docente que pierde la clave temporal antes de su primer ingreso: usa la recuperación de contraseña; al restablecerla ya no se le exige otro cambio.
- Cuenta desactivada con sesión abierta en el dispositivo: la sesión se invalida en el siguiente uso.
- Sin conexión a internet al iniciar sesión o registrarse: se informa con un aviso de que no hay conexión y se permite reintentar.
- Una persona con un correo que ya existe como docente intenta registrarse como estudiante: se rechaza por dominio.
- Solicitudes repetidas de recuperación o de reenvío de verificación: se limitan para evitar abuso.
- Usuario que no abre la app durante 30 días: la sesión caduca y debe iniciar sesión de nuevo, con un mensaje que explica el motivo.
- Cambio de idioma del dispositivo con la app abierta: la app adopta el nuevo idioma.

## Requirements *(mandatory)*

### Functional Requirements

**Inicio de sesión y roles**

- **FR-001**: El sistema MUST permitir iniciar sesión con correo y contraseña.
- **FR-002**: El sistema MUST distinguir tres roles: SUPERADMIN (CAE), TEACHER y STUDENT, y MUST mostrar tras el ingreso solo la navegación del rol del usuario.
- **FR-003**: El sistema MUST rechazar, en el servidor, cualquier acción o consulta que exceda el rol del usuario, aunque la app no muestre esa opción.
- **FR-004**: Ante credenciales incorrectas, el sistema MUST mostrar un mensaje que no revele si el correo existe.
- **FR-005**: El sistema MUST limitar los intentos fallidos de inicio de sesión, registro y recuperación, e informar al usuario cuando esté temporalmente bloqueado.

**Registro y verificación de estudiantes**

- **FR-006**: El sistema MUST permitir que cualquier persona se registre como estudiante únicamente con un correo del dominio de estudiantes (`@uts.edu.co`).
- **FR-007**: El sistema MUST rechazar el registro con cualquier otro dominio y explicar el dominio requerido.
- **FR-008**: El sistema MUST impedir el inicio de sesión de un estudiante hasta que verifique su correo.
- **FR-009**: El sistema MUST enviar al registrarse un correo con un código numérico de 6 dígitos que el usuario escribe en la app, y permitir reenviarlo, con vencimiento, límite de reenvíos y límite de intentos de código incorrecto.
- **FR-010**: El sistema MUST normalizar los correos (sin distinguir mayúsculas ni espacios laterales) y garantizar que haya una sola cuenta por correo. Si el correo ya tiene una cuenta sin verificar, un nuevo registro MUST reenviar el código de verificación sin modificar la contraseña ni ningún otro dato de esa cuenta (quien olvidó su contraseña usa la recuperación); si la cuenta ya está verificada, el registro MUST rechazarse.
- **FR-011**: El sistema MUST exigir una contraseña que cumpla los requisitos mínimos de seguridad, mostrados al usuario antes de enviar el formulario.

**Docentes y clave temporal**

- **FR-012**: El sistema MUST impedir que los docentes se registren por sí mismos.
- **FR-013**: El sistema MUST permitir que solo el CAE cree docentes, con un correo del dominio de docentes (`@correo.uts.edu.co`), y MUST rechazar cualquier otro dominio con un mensaje claro.
- **FR-014**: Al crear un docente, el sistema MUST generar una clave temporal y mostrarla al CAE una sola vez, con opción de copiarla; no puede volver a consultarse.
- **FR-015**: El sistema MUST marcar la cuenta del docente como pendiente de cambio de clave y, en cada ingreso, bloquear toda la navegación hasta que defina una nueva.
- **FR-016**: La nueva clave MUST cumplir los requisitos de seguridad y ser distinta de la temporal.
- **FR-016a**: Si el docente pierde la clave temporal, MUST poder usar la recuperación de contraseña por correo; al restablecerla con éxito, el sistema MUST quitar la obligación de cambio de clave. El CAE no puede volver a ver ni regenerar la clave temporal en esta funcionalidad.
- **FR-017**: El sistema MUST registrar el idioma preferido de cada cuenta para enviar sus correos en ese idioma.

**Recuperación de contraseña**

- **FR-018**: El sistema MUST permitir solicitar la recuperación de contraseña por correo y MUST responder de forma idéntica exista o no el correo.
- **FR-019**: El código numérico de 6 dígitos de recuperación, enviado por correo y escrito en la app, MUST tener vencimiento, un solo uso y límite de intentos incorrectos.
- **FR-020**: Al restablecer la contraseña, el sistema MUST cerrar las demás sesiones abiertas de esa cuenta.
- **FR-021**: El sistema MUST NOT restablecer el acceso de cuentas desactivadas o con borrado lógico.

**Estado de la cuenta**

- **FR-022**: El sistema MUST impedir el inicio de sesión de cuentas desactivadas o con borrado lógico y MUST conservar su historial.
- **FR-023**: El mensaje para una cuenta desactivada MUST indicar la causa y a quién acudir; el de una cuenta borrada no debe revelar más de lo necesario.
- **FR-024**: El sistema MUST invalidar las sesiones abiertas de una cuenta cuando esta se desactiva o se borra lógicamente.
- **FR-025**: Un correo de una cuenta con borrado lógico MUST seguir ocupado: no puede registrarse de nuevo.

**Sesión**

- **FR-026**: La sesión MUST mantenerse al cerrar y abrir la app, hasta que el usuario cierre sesión, la cuenta pierda acceso o pasen 30 días sin usar la app; cada uso renueva el plazo y el plazo MUST ser configurable.
- **FR-027**: El usuario MUST poder cerrar sesión desde el menú de su perfil; al hacerlo, la sesión de ese dispositivo deja de ser válida en el servidor y las de sus otros dispositivos siguen activas.
- **FR-027a**: Un mismo usuario MUST poder tener sesiones abiertas en varios dispositivos a la vez. Restablecer la contraseña o que la cuenta pierda el acceso (desactivación o borrado lógico) MUST cerrar todas sus sesiones.
- **FR-028**: Los datos de sesión en el dispositivo MUST guardarse de forma segura.

**Idioma y diseño**

- **FR-029**: La app MUST seguir el idioma del dispositivo (español o inglés) y usar español si es otro; todos los textos MUST provenir de archivos de traducción.
- **FR-030**: Toda acción bloqueada (dominio no permitido, verificación pendiente, cuenta desactivada, límite de intentos, cambio de clave obligatorio) MUST mostrar la regla que la bloquea, en lenguaje claro.
- **FR-031**: Las pantallas de acceso MUST seguir `docs/Design.md`: paleta, componentes, objetivos táctiles de 48 px, estados de carga y error, y tolerancia a textos largos y fuentes ampliadas.
- **FR-032**: Los dominios de correo permitidos MUST ser configurables y no valores fijos en el código.

**Seguridad de datos**

- **FR-033**: El sistema MUST NOT almacenar ni registrar contraseñas en texto plano, ni en el repositorio ni en los registros del sistema.
- **FR-034**: Las fechas de verificación, recuperación y sesión MUST guardarse en UTC.

### Key Entities *(include if feature involves data)*

- **Usuario**: persona con acceso a la app. Atributos: correo (único, normalizado), rol, estado (activo/desactivado), borrado lógico, correo verificado, pendiente de cambio de clave, idioma preferido.
- **Rol**: SUPERADMIN (CAE), TEACHER o STUDENT; determina navegación y permisos.
- **Perfil de estudiante / docente**: datos básicos de la persona según su rol (nombres; programa para estudiantes).
- **Verificación de correo**: prueba temporal, de un solo uso, que vincula un correo con su dueño.
- **Solicitud de recuperación**: prueba temporal, de un solo uso, para definir una nueva contraseña.
- **Sesión**: acceso vigente de un usuario en un dispositivo; puede invalidarse al cerrar sesión, al restablecer la clave o al perder acceso la cuenta.
- **Clave temporal**: contraseña inicial de un docente, mostrada una sola vez al CAE y que debe cambiarse en el primer ingreso.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un estudiante nuevo completa registro y verificación, y llega a su pantalla principal en menos de 3 minutos, sin ayuda.
- **SC-002**: Un usuario con cuenta activa inicia sesión y ve su navegación en menos de 10 segundos en condiciones normales de red.
- **SC-003**: El 100 % de los intentos de ingreso con cuentas desactivadas, borradas lógicamente o sin verificar son rechazados.
- **SC-004**: El 100 % de los registros con dominios distintos de `@uts.edu.co` y de las creaciones de docentes con dominios distintos de `@correo.uts.edu.co` son rechazados.
- **SC-005**: Ningún usuario accede a pantallas ni datos de un rol distinto al suyo en las pruebas de permisos por rol.
- **SC-006**: Un usuario que cierra y reabre la app permanece autenticado en el 100 % de los casos, hasta que cierra sesión o su cuenta pierde acceso.
- **SC-007**: El 90 % de los usuarios que solicitan recuperar su contraseña logran definir una nueva y volver a ingresar en menos de 5 minutos.
- **SC-008**: Un docente con clave temporal no puede usar ninguna función hasta cambiarla (0 excepciones en pruebas).
- **SC-009**: La clave temporal de un docente no puede volver a consultarse tras su primera visualización (0 excepciones).
- **SC-010**: El 100 % de los textos de las pantallas de acceso aparecen correctamente en español e inglés según el dispositivo.
- **SC-011**: Cada mensaje de bloqueo explica la regla en un lenguaje que el 90 % de los usuarios de prueba entiende sin ayuda.

## Assumptions

- Esta funcionalidad no incluye gestión de módulos, inscripciones, chat, PQRS ni dashboards; las pantallas principales de cada rol solo necesitan existir como destino vacío tras el ingreso.
- La administración completa de cuentas (listar, editar, desactivar, reactivar, borrar docentes y estudiantes) corresponde a otra funcionalidad; aquí solo se exige que el estado de la cuenta se respete al iniciar sesión.
- Existe al menos una cuenta del CAE inicial creada por la institución fuera de la app (por ejemplo, durante la puesta en marcha); el CAE no se registra por sí mismo.
- Los usuarios administrativos usan el dominio `@correo.uts.edu.co`; el CAE se rige por las mismas reglas de inicio de sesión que los demás roles.
- La verificación de correo y la recuperación usan un código numérico de 6 dígitos con vencimiento corto (referencia: 24 horas para verificar y 1 hora para recuperar), configurable.
- La contraseña exige como mínimo 8 caracteres, con letras y números; los requisitos se muestran antes de enviar.
- El envío de correos depende de que el CAE o la institución configure el servicio de correo; la configuración de ese servicio queda fuera de esta funcionalidad, que solo lo consume.
- Cada cuenta tiene un solo correo y un solo rol, y puede tener sesiones en varios dispositivos.
- Los usuarios tienen conexión a internet para iniciar sesión, registrarse y recuperar contraseña.
- Los mensajes de correo se envían en el idioma guardado de la cuenta; en el registro, el idioma inicial es el del dispositivo.
- Todo cumple `docs/Context.md` (reglas de cuentas y registro) y `docs/Design.md` (pantallas de acceso, estados y accesibilidad).
