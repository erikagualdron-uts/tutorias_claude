# Feature Specification: Gestión de cuentas de docentes y estudiantes

**Feature Branch**: `016-account-management`

**Created**: 2026-11-21

**Status**: Draft

**Input**: User description: "Gestión de cuentas por el CAE (spec 016). Docentes: ver, buscar, actualizar datos, regenerar la clave temporal, desactivar o reactivar y borrado lógico. Estudiantes: ver los registrados, buscar, desactivar o reactivar y borrado lógico. Una cuenta desactivada o eliminada no puede entrar, conserva su historial y el CAE ve el efecto antes de confirmar."

## Estado de partida (revisión del 2026-11-21)

| Qué ya existe | Dónde |
|---|---|
| El CAE crea un docente con clave temporal (se muestra una vez) y lista docentes con filtro de estado | spec 001 y 006 |
| El inicio de sesión rechaza una cuenta desactivada (`ACCOUNT_DISABLED`) o eliminada (`ACCOUNT_UNAVAILABLE`) | spec 001 |
| Un módulo cuyo docente se desactiva o elimina se marca "docente no disponible" y no se bloquea la baja | D-088 |
| El estudiante se registra solo con `@uts.edu.co` y verifica su correo | spec 001 |

| Qué falta | |
|---|---|
| Ninguna pantalla ni acción del CAE para desactivar, reactivar, eliminar o editar una cuenta, ni para ver a los estudiantes registrados | |
| Regenerar la clave temporal de un docente que la perdió | |

## Clarifications

### Session 2026-11-21

- Q: ¿Qué pasa con las inscripciones vigentes de un estudiante cuando el CAE desactiva o elimina su cuenta? → A: Se cancelan sus inscripciones vigentes, se libera el cupo y no se restauran al reactivar la cuenta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver y buscar a los docentes y estudiantes (Priority: P1)

El CAE abre "Docentes" o "Estudiantes" y ve la lista de cuentas con nombre, correo, estado (Activa, Desactivada) y, de cada una, lo que importa para decidir: de un docente, cuántos módulos tiene en el periodo activo; de un estudiante, a cuántos módulos está inscrito. Puede buscar por nombre o correo y filtrar por estado.

**Why this priority**: Sin ver quién está registrado no se puede gestionar nada; además hoy el CAE no tiene ninguna forma de ver a los estudiantes.

**Independent Test**: Con docentes y estudiantes de ejemplo, abrir cada lista, buscar por parte del nombre y del correo, filtrar por estado y comprobar que los conteos coinciden con los módulos e inscripciones reales.

**Acceptance Scenarios**:

1. **Given** estudiantes registrados y verificados, **When** el CAE abre "Estudiantes", **Then** los ve ordenados por nombre con su correo, estado y número de módulos inscritos.
2. **Given** una lista larga, **When** el CAE escribe parte de un nombre o de un correo, **Then** la lista muestra solo las cuentas que coinciden.
3. **Given** cuentas activas y desactivadas, **When** el CAE filtra por "Desactivadas", **Then** solo ve las desactivadas.
4. **Given** un estudiante que aún no verificó su correo, **When** el CAE ve la lista, **Then** esa cuenta no aparece (no es un estudiante registrado todavía).
5. **Given** un docente o un estudiante, **When** abre su pantalla de sesión, **Then** no tiene acceso a estas listas (solo el CAE).

---

### User Story 2 - Desactivar y reactivar una cuenta (Priority: P1)

El CAE desactiva la cuenta de un docente o de un estudiante, por ejemplo cuando termina su vínculo, y la reactiva si hace falta. Antes de confirmar, la app le muestra qué efecto tendrá (de un docente: los módulos del periodo activo que quedan "docente no disponible"; de un estudiante: sus inscripciones vigentes). Una cuenta desactivada no puede entrar ni usar la app desde ese momento y conserva todo su historial.

**Why this priority**: Es el efecto principal de la gestión: cortar el acceso sin perder información, de forma reversible.

**Independent Test**: Desactivar una cuenta con una sesión abierta, comprobar que no puede seguir usando la app ni iniciar sesión, reactivarla y comprobar que vuelve a entrar con su historial intacto.

**Acceptance Scenarios**:

1. **Given** un docente con tres módulos en el periodo activo, **When** el CAE elige desactivarlo, **Then** la app muestra "3 módulos quedarán con docente no disponible" y pide confirmar.
2. **Given** una cuenta desactivada con una sesión abierta en el teléfono, **When** intenta cualquier acción, **Then** el sistema la rechaza y la app la lleva al inicio de sesión.
3. **Given** una cuenta desactivada, **When** intenta iniciar sesión, **Then** ve que su cuenta está desactivada y a quién acudir (el CAE).
4. **Given** una cuenta desactivada, **When** el CAE la reactiva, **Then** puede iniciar sesión de nuevo y conserva su historial, módulos e inscripciones.
5. **Given** una cuenta desactivada, **When** se envía un aviso de módulo, **Then** no se le entrega por ningún canal mientras esté desactivada.
6. **Given** el CAE sobre su propia cuenta, **When** busca la opción de desactivarse, **Then** no existe: el CAE no puede desactivarse ni eliminarse.
7. **Given** un estudiante con dos inscripciones vigentes, **When** el CAE lo desactiva y confirma, **Then** sus inscripciones se cancelan, el cupo de esos módulos queda libre para otros y, al reactivar la cuenta, las inscripciones no se restauran (el estudiante se inscribe de nuevo si hay cupo).

---

### User Story 3 - Eliminar una cuenta (borrado lógico) (Priority: P1)

El CAE elimina la cuenta de un docente o de un estudiante que ya no debe existir. La cuenta deja de aparecer en las listas y de poder entrar, pero el registro y su historial se conservan (borrado lógico). El CAE ve el efecto antes de confirmar, igual que al desactivar.

**Why this priority**: Es parte del alcance pedido para cada rol y la regla de negocio exige borrado lógico, nunca físico.

**Independent Test**: Eliminar una cuenta con historial, comprobar que no sale en las listas ni entra, que sus módulos e inscripciones pasadas siguen consultables y que su correo no puede reutilizarse para registrar otra cuenta.

**Acceptance Scenarios**:

1. **Given** una cuenta con historial, **When** el CAE la elimina y confirma, **Then** deja de aparecer en las listas y no puede iniciar sesión ni usar una sesión abierta.
2. **Given** un docente eliminado, **When** el CAE abre un módulo suyo, **Then** el módulo lo marca como "docente no disponible" y conserva el nombre del docente en las sesiones pasadas.
3. **Given** un estudiante eliminado, **When** alguien intenta registrarse con el mismo correo, **Then** el sistema lo rechaza: el correo sigue reservado.
4. **Given** una cuenta eliminada, **When** el CAE busca restaurarla desde la app, **Then** no existe esa opción (la restauración no forma parte de esta función).
5. **Given** un estudiante eliminado con inscripciones vigentes, **When** el CAE confirma, **Then** sus inscripciones se cancelan y el cupo queda libre, igual que al desactivarlo.

---

### User Story 4 - Actualizar los datos de un docente (Priority: P2)

El CAE corrige el nombre, el apellido o el teléfono de un docente. El correo no se cambia desde aquí porque es su identidad de acceso.

**Why this priority**: Es una corrección menor que hoy obliga a crear de nuevo la cuenta.

**Independent Test**: Editar cada campo de un docente y comprobar que el cambio se ve en su perfil, en sus módulos y en las listas.

**Acceptance Scenarios**:

1. **Given** un docente con un apellido mal escrito, **When** el CAE lo corrige y guarda, **Then** el nuevo apellido aparece en las listas, en los módulos del docente y en sus avisos futuros.
2. **Given** el formulario de edición, **When** el CAE deja el nombre vacío, **Then** la app le indica el campo y no guarda.
3. **Given** un docente, **When** el CAE abre su edición, **Then** el correo se muestra sin poder modificarse y con la razón.

---

### User Story 5 - Regenerar la clave temporal de un docente (Priority: P2)

Si un docente perdió su clave temporal o su cuenta quedó bloqueada, el CAE genera una nueva. La clave se muestra una sola vez, el docente debe cambiarla en su primer ingreso y las sesiones abiertas que tuviera se cierran.

**Why this priority**: Sin esto, un docente que olvida su clave temporal solo se resuelve borrando y creando de nuevo la cuenta.

**Independent Test**: Regenerar la clave de un docente con sesión abierta; comprobar que la clave anterior ya no sirve, que la nueva se ve una sola vez y que el docente debe cambiarla al entrar.

**Acceptance Scenarios**:

1. **Given** un docente activo, **When** el CAE regenera su clave, **Then** la app muestra la nueva clave una sola vez, con la advertencia de que no se podrá volver a ver.
2. **Given** la clave regenerada, **When** el docente inicia sesión con la anterior, **Then** la rechaza; con la nueva entra y la app lo obliga a cambiarla.
3. **Given** un docente con sesión abierta, **When** el CAE regenera su clave, **Then** esa sesión se cierra.
4. **Given** un estudiante, **When** el CAE busca la opción de regenerar clave, **Then** no existe: los estudiantes recuperan su clave por su cuenta con el código de correo.

---

### Edge Cases

- Un docente con módulos en el periodo activo se puede desactivar o eliminar; la app avisa cuántos módulos quedan con "docente no disponible" y el CAE los reasigna (D-088). No se bloquea.
- El CAE no se gestiona a sí mismo ni a otros administrativos desde estas listas: solo docentes y estudiantes.
- Dos acciones seguidas sobre la misma cuenta (desactivar y eliminar, o dos CAE a la vez) no dejan un estado incoherente: el resultado es el de la última, y eliminar siempre prevalece.
- Desactivar una cuenta ya desactivada, o reactivar una activa, no falla ni cambia nada: el resultado es el mismo y la app lo refleja.
- Una cuenta con una verificación de correo pendiente (estudiante que no terminó el registro) no aparece como registrada y no se gestiona.
- Una cuenta desactivada o eliminada no recibe avisos de módulo, ni push ni correo, desde el momento de la acción.
- La lista de estudiantes puede ser larga (cientos): se carga por páginas y la búsqueda sigue siendo rápida.
- Si no hay un periodo activo (entre semestres), desactivar o eliminar a un estudiante solo cambia su cuenta: no hay inscripciones vigentes que cancelar.
- El nombre de un docente o estudiante con tildes o caracteres especiales se busca sin distinguir mayúsculas ni tildes.
- Una cuenta eliminada no vuelve a aparecer en ninguna lista de selección (por ejemplo al elegir docente de un módulo).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El CAE MUST poder ver la lista de docentes y la lista de estudiantes registrados, cada una por páginas, con nombre, correo y estado de cada cuenta.
- **FR-002**: La lista de docentes MUST mostrar cuántos módulos tiene cada docente en el periodo activo; la de estudiantes, cuántos módulos tiene inscritos cada estudiante con inscripción vigente.
- **FR-003**: Las listas MUST poder buscarse por nombre o por correo, sin distinguir mayúsculas ni tildes, y filtrarse por estado (Activas, Desactivadas).
- **FR-004**: La lista de estudiantes MUST mostrar solo cuentas con el correo verificado y sin borrar; la de docentes, solo cuentas sin borrar.
- **FR-005**: El CAE MUST poder desactivar y reactivar la cuenta de un docente o de un estudiante.
- **FR-006**: Una cuenta desactivada o eliminada MUST perder el acceso de inmediato: sus sesiones abiertas se cierran, ninguna petición posterior se acepta y no puede iniciar sesión ni recuperar la clave. Su historial (módulos, inscripciones, sesiones y avisos) MUST conservarse.
- **FR-007**: El CAE MUST poder eliminar (borrado lógico) la cuenta de un docente o de un estudiante; la cuenta deja de aparecer en las listas y en los selectores, el registro se conserva y el correo sigue reservado.
- **FR-008**: Antes de confirmar una desactivación o una eliminación, la app MUST mostrar al CAE el efecto concreto con números (de un docente, los módulos del periodo activo que quedarán con "docente no disponible"; de un estudiante, las inscripciones vigentes que se cancelarán y los cupos que quedarán libres) y exigir confirmación.
- **FR-009**: Desactivar o eliminar a un docente MUST NOT bloquearse por tener módulos (D-088); el efecto sobre los módulos es la marca "docente no disponible".
- **FR-010**: Desactivar o eliminar a un estudiante MUST cancelar sus inscripciones vigentes en la misma operación, de modo que el cupo de esos módulos quede libre para otros estudiantes; reactivar la cuenta MUST NOT restaurar las inscripciones.
- **FR-011**: El CAE MUST poder actualizar el nombre, el apellido y el teléfono de un docente; el nombre y el apellido son obligatorios y el correo MUST NOT poder cambiarse.
- **FR-012**: El CAE MUST poder regenerar la clave temporal de un docente activo: la clave se muestra una sola vez, la anterior deja de servir, las sesiones abiertas del docente se cierran y debe cambiarla en su primer ingreso.
- **FR-013**: El sistema MUST NOT entregar avisos de módulo (bandeja, push ni correo) a una cuenta desactivada o eliminada desde el momento de la acción.
- **FR-014**: Solo el rol CAE MUST poder usar estas acciones y listas; cualquier otro rol MUST recibir la respuesta de acceso prohibido, y el CAE MUST NOT poder desactivar, eliminar ni cambiar la clave de su propia cuenta.
- **FR-015**: Toda acción bloqueada MUST mostrar al CAE la regla que la bloquea, en español o inglés según su idioma.
- **FR-016**: Las claves temporales y los datos de acceso MUST NOT aparecer en registros ni en respuestas después del momento en que se muestran.

### Key Entities *(include if feature involves data)*

- **Cuenta de usuario**: Persona con correo, rol (docente o estudiante en esta función), estado (Activa o Desactivada) y marca de borrado lógico; ya existe y no cambia de estructura.
- **Perfil de docente**: Nombre, apellido y teléfono; el CAE los actualiza.
- **Perfil de estudiante**: Nombre, apellido y programa; el CAE los ve, no los edita.
- **Efecto de una baja**: Resumen que se muestra antes de confirmar: módulos del periodo activo que quedarán sin docente disponible, o inscripciones vigentes de un estudiante.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El CAE encuentra una cuenta por nombre o correo en menos de 10 segundos en una lista de 500 cuentas.
- **SC-002**: Una cuenta desactivada o eliminada no puede realizar ninguna acción nueva desde el momento de la confirmación: el 100 % de las peticiones posteriores se rechazan en las pruebas.
- **SC-003**: Desactivar y reactivar una cuenta no pierde ningún dato: el historial de módulos, inscripciones y avisos es el mismo antes y después, en el 100 % de los casos probados.
- **SC-004**: Ninguna cuenta eliminada aparece en listas ni selectores, y su correo no puede reutilizarse en el 100 % de los casos probados.
- **SC-005**: El CAE ve el efecto con números antes de confirmar cada baja en el 100 % de las pantallas de desactivar y eliminar.
- **SC-006**: Un docente que perdió su clave recupera el acceso con una clave regenerada en menos de 2 minutos, sin crear de nuevo la cuenta.
- **SC-007**: Un usuario que no es CAE recibe acceso prohibido en el 100 % de las acciones y listas de esta función.
- **SC-008**: Tras desactivar o eliminar a un estudiante, el 100 % de sus inscripciones vigentes quedan canceladas y el cupo de cada módulo se libera en la misma operación; si la operación falla, no queda ninguna a medias.

## Assumptions

- En esta spec "baja" significa desactivar o eliminar una cuenta.
- Esta función gestiona solo docentes y estudiantes; las cuentas de administrativos (CAE) no se crean, editan ni borran desde la app.
- "Desactivar" ya significa lo definido en el glosario: la cuenta queda bloqueada, sigue visible y se puede reactivar. "Eliminar" es el borrado lógico y no se puede deshacer desde la app.
- El correo de un docente no se edita porque es su identidad de acceso y debe mantener el dominio institucional de docentes; cambiarlo implicaría verificarlo de nuevo, y queda fuera de alcance.
- Los estudiantes se registran solos y recuperan su clave por correo, por eso no existe "regenerar clave" para ellos.
- El correo de una cuenta eliminada sigue reservado, igual que hoy impide el registro la regla de la spec 001.
- No se avisa por correo ni push a la persona cuya cuenta se desactiva o elimina; el CAE lo comunica por sus medios.
- Un estudiante o docente conserva su nombre en el historial (sesiones pasadas, módulos) aunque la cuenta esté eliminada.
- Cancelar las inscripciones de un estudiante dado de baja no genera avisos a otros: libera cupo y nada más. Las sesiones ya dadas conservan su registro de asistencia.
- No hay registro de auditoría de quién hizo cada cambio en esta función; si se necesita, será una spec aparte.
- La búsqueda se hace sobre nombre, apellido y correo; la lista de estudiantes es de solo lectura salvo desactivar, reactivar y eliminar.
