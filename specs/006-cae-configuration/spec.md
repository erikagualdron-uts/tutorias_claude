# Feature Specification: Configuración del CAE (periodos, salones y listas desplegables)

**Feature Branch**: `006-cae-configuration`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Funcionalidad 006: Configuración del CAE (periodos académicos, salones y listas desplegables). Prerrequisito de los módulos: el CAE define el periodo, los salones y ubicaciones, y los catálogos que usa la app."

## Clarifications

### Session 2026-11-16

- Q: ¿Cómo decide el sistema que un periodo está Próximo, Activo o Cerrado? → A: Mixto: el CAE activa a mano (todo periodo nuevo es Próximo) y el sistema cierra solo el periodo activo al pasar su fecha de fin.
- Q: ¿Puede el CAE crear listas desplegables nuevas o solo administrar elementos de las existentes? → A: Solo administra elementos de las listas predefinidas por el sistema; no crea, renombra ni elimina listas.
- Q: ¿Qué pasa al desactivar un salón con módulos solo en periodos Próximos? → A: Se permite; los módulos Próximos conservan el salón y el sistema avisa cuántos quedan afectados para que el CAE los reasigne.
- Q: ¿Qué pasa con los salones inactivos de una ubicación que se elimina? → A: Se eliminan (lógico) junto con la ubicación en la misma acción, tras confirmar.
- Q: ¿Se puede eliminar (lógico) un periodo Cerrado sin módulos? → A: No; solo se eliminan periodos Próximos sin módulos. Activos y Cerrados no se eliminan.
- Q: ¿Qué puede editar el CAE en un periodo Activo? → A: Solo el nombre y las fechas, con las mismas validaciones.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar periodos académicos (Priority: P1)

El CAE crea el periodo (semestre) en el que se dictarán los módulos, define sus fechas, lo activa para que los estudiantes lo vean y lo cierra cuando termina.

**Why this priority**: Sin un periodo activo no se pueden crear ni mostrar módulos; es el bloqueo principal para el resto del producto.

**Independent Test**: Crear el periodo "2026-2" con fechas válidas, activarlo y verificar que aparece como Activo y como único periodo activo.

**Acceptance Scenarios**:

1. **Given** el CAE sin periodos, **When** crea "2026-2" con inicio y fin válidos, **Then** el periodo aparece en el listado con estado Próximo.
2. **Given** un periodo existente, **When** el CAE intenta crear otro con fechas que se solapan, **Then** el sistema lo rechaza y muestra con qué periodo se solapa.
3. **Given** una fecha de fin igual o anterior a la de inicio, **When** el CAE guarda, **Then** el sistema lo rechaza indicando la regla.
4. **Given** un periodo con nombre ya usado, **When** el CAE guarda, **Then** el sistema lo rechaza por nombre duplicado.
5. **Given** un periodo Activo y otro Próximo, **When** el CAE activa el Próximo, **Then** el sistema avisa que el activo actual se cerrará y pide confirmación; al confirmar, el nuevo queda Activo y el anterior Cerrado.
6. **Given** un periodo Cerrado, **When** el CAE intenta editarlo, **Then** la pantalla lo muestra en solo lectura y explica el motivo.
7. **Given** un periodo con módulos, **When** el CAE intenta eliminarlo, **Then** la acción se bloquea y se explica la regla; sin módulos y Próximo, se elimina de forma lógica tras confirmar; los periodos Activos y Cerrados no se eliminan.
8. **Given** el listado, **When** el CAE filtra por Activo, Cerrado o Próximo, **Then** solo ve los periodos de ese estado.

---

### User Story 2 - Gestionar ubicaciones y salones (Priority: P1)

El CAE registra ubicaciones (edificio o sede) y los salones de cada una con su capacidad, que más adelante definirá el cupo de los módulos.

**Why this priority**: Todo módulo necesita un salón; la capacidad determina el cupo.

**Independent Test**: Crear una ubicación, crear un salón con capacidad 30 dentro de ella, desactivarlo, reactivarlo y buscarlo por nombre.

**Acceptance Scenarios**:

1. **Given** el CAE en la pestaña Módulos, **When** crea la ubicación "Sede Central" y un salón "A-101" con capacidad 30, **Then** el salón queda Activo y asociado a la ubicación.
2. **Given** un salón "A-101" en una ubicación, **When** el CAE crea otro "A-101" en la misma ubicación, **Then** se rechaza; en otra ubicación se permite.
3. **Given** una capacidad vacía, cero, negativa o decimal, **When** el CAE guarda, **Then** se rechaza indicando que debe ser un entero positivo.
4. **Given** un salón Activo, **When** el CAE lo desactiva y luego lo reactiva, **Then** el estado cambia en cada paso y se conserva su información.
5. **Given** una ubicación con salones activos, **When** el CAE intenta eliminarla, **Then** se bloquea y se explica que debe desactivar o eliminar antes sus salones.
6. **Given** un salón con módulos en el periodo activo o con inscritos por encima de la nueva capacidad, **When** el CAE intenta desactivarlo, eliminarlo o bajar su capacidad, **Then** la acción se bloquea y se explica la regla (aplica en cuanto existan módulos).
7. **Given** el listado de salones, **When** el CAE busca por nombre o filtra por ubicación y estado, **Then** ve solo los salones que coinciden.

---

### User Story 3 - Administrar listas desplegables (Priority: P2)

El CAE mantiene las listas que alimentan los selectores de la app (por ejemplo, "Tipos de PQRS"), con etiquetas en español e inglés, orden y estado.

**Why this priority**: Los selectores de otras funcionalidades (PQRS) dependen de estas listas, pero no bloquean la creación de módulos.

**Independent Test**: Agregar el elemento "Felicitación / Compliment" a "Tipos de PQRS", reordenarlo y verificar que un selector lo muestra en el idioma del dispositivo y en ese orden.

**Acceptance Scenarios**:

1. **Given** una instalación nueva, **When** el CAE abre las listas, **Then** existe "Tipos de PQRS" con Petición, Queja, Reclamo y Sugerencia (con su etiqueta en inglés).
2. **Given** una lista, **When** el CAE agrega un elemento con etiqueta en español e inglés, **Then** queda Activo al final del orden; si falta alguna etiqueta, se rechaza.
3. **Given** varios elementos, **When** el CAE los reordena, **Then** el nuevo orden se conserva y se refleja en los selectores.
4. **Given** un elemento Inactivo, **When** un usuario abre un selector, **Then** no lo ve; los activos se muestran en el idioma del dispositivo.
5. **Given** un elemento ya en uso, **When** el CAE intenta eliminarlo, **Then** solo se permite desactivarlo y la pantalla explica por qué; sin uso, se elimina de forma lógica tras confirmar.

---

### User Story 4 - Acceso exclusivo del CAE (Priority: P1)

Solo el CAE puede ver o modificar la configuración; docentes y estudiantes no.

**Why this priority**: Regla de seguridad transversal; debe validarse siempre en el servidor.

**Independent Test**: Con un usuario docente y uno estudiante, intentar cada operación de configuración y verificar el acceso denegado.

**Acceptance Scenarios**:

1. **Given** un docente o estudiante, **When** intenta acceder o modificar periodos, salones, ubicaciones o administración de listas, **Then** recibe acceso denegado y no se altera ningún dato.
2. **Given** un docente o estudiante, **When** abre un selector de la app, **Then** puede ver los elementos activos de la lista (solo lectura), sin acceso a la administración.

---

### Edge Cases

- Activar un periodo cuando no hay ninguno activo: no requiere confirmación de cierre.
- Dos peticiones simultáneas de activación: nunca debe quedar más de un periodo activo.
- Periodo cuyas fechas rozan otro (fin de uno = inicio de otro): se considera solapamiento.
- Reutilizar el nombre de un periodo, salón, ubicación o elemento eliminado lógicamente: el nombre queda libre.
- Eliminar el último elemento activo de una lista que usa un selector obligatorio: el selector queda vacío y debe mostrar un estado vacío comprensible.
- Un periodo Próximo cuya fecha de fin ya pasó: no se cierra automáticamente; el CAE no puede activarlo y el sistema explica que su fecha de fin ya venció.
- Cierre automático al vencer el periodo activo: queda Cerrado sin periodo activo hasta que el CAE active otro.
- Cerrar el periodo activo sin activar otro: los estudiantes no ven módulos hasta que se active uno.
- Una etiqueta de lista solo con espacios se trata como vacía.
- Falla de red o error del servidor: la pantalla muestra estado de error con opción de reintentar y no pierde lo escrito.

## Requirements *(mandatory)*

### Functional Requirements

**Acceso y reglas generales**

- **FR-001**: El sistema MUST permitir crear, editar, consultar y administrar periodos, ubicaciones, salones y elementos de lista únicamente al rol SUPERADMIN (CAE), validado en el servidor en cada operación.
- **FR-002**: El sistema MUST responder con acceso denegado a cualquier otro rol que intente estas operaciones, sin modificar datos.
- **FR-003**: Todo borrado MUST ser lógico; ningún dato se elimina físicamente.
- **FR-004**: Toda acción bloqueada MUST mostrar al usuario la regla que la bloquea.
- **FR-005**: Las acciones destructivas (eliminar, cerrar un periodo, desactivar) MUST pedir confirmación.
- **FR-006**: Todos los textos visibles MUST estar en español e inglés, y las fechas se muestran en la zona horaria de Bogotá.

**Periodos académicos**

- **FR-007**: El sistema MUST permitir crear y editar periodos con nombre único, fecha de inicio y fecha de fin. En un periodo Próximo o Activo el CAE puede modificar únicamente el nombre y las fechas, con las mismas validaciones de FR-008 y FR-009; en un periodo Activo, la nueva fecha de fin MUST NOT ser anterior a hoy.
- **FR-008**: El sistema MUST rechazar un periodo cuya fecha de fin no sea posterior a la de inicio.
- **FR-009**: El sistema MUST rechazar periodos con fechas que se solapen con otro periodo no eliminado, incluyendo extremos coincidentes.
- **FR-010**: El sistema MUST garantizar que exista como máximo un periodo Activo en todo momento, incluso ante solicitudes simultáneas.
- **FR-011**: El sistema MUST permitir activar un periodo; si ya hay uno activo, MUST avisar y pedir confirmación, y al confirmar cerrar el anterior y activar el nuevo como una sola operación.
- **FR-012**: El sistema MUST permitir al CAE cerrar el periodo activo manualmente, y MUST cerrarlo automáticamente cuando termine su fecha de fin (al finalizar ese día en la zona horaria de Bogotá). Todo periodo nuevo nace Próximo y solo pasa a Activo por acción del CAE.
- **FR-013**: Un periodo Cerrado MUST quedar en solo lectura (no editable ni reactivable) y sus módulos no se modifican.
- **FR-014**: El sistema MUST permitir eliminar (lógico) únicamente periodos Próximos sin módulos; MUST bloquear la eliminación de periodos con módulos, Activos o Cerrados, explicando la regla.
- **FR-015**: El listado de periodos MUST mostrar nombre, fechas y estado (Activo, Cerrado, Próximo) y permitir filtrar por estado.
- **FR-016**: Los estudiantes MUST ver como periodo vigente únicamente el periodo Activo.

**Ubicaciones y salones**

- **FR-017**: El sistema MUST permitir crear, editar y eliminar (lógico) ubicaciones con nombre único.
- **FR-018**: El sistema MUST permitir crear y editar salones con nombre o código único dentro de su ubicación, ubicación, capacidad entera positiva y estado Activo o Inactivo.
- **FR-019**: El sistema MUST permitir desactivar, reactivar y eliminar (lógico) salones.
- **FR-020**: El sistema MUST bloquear la eliminación de una ubicación que tenga salones activos. Si todos sus salones están inactivos, MUST eliminar (lógico) la ubicación y esos salones en una sola acción, tras confirmar y mostrando cuántos salones se eliminarán.
- **FR-021**: Cuando existan módulos, el sistema MUST bloquear desactivar o eliminar un salón con módulos en el periodo activo, y bajar su capacidad por debajo de los inscritos en cualquier módulo que lo use, explicando la regla. Si el salón solo tiene módulos en periodos Próximos, desactivarlo MUST permitirse, y el sistema MUST avisar antes de confirmar cuántos módulos Próximos quedan con un salón inactivo para que el CAE los reasigne.
- **FR-022**: La capacidad de un salón MUST ser la fuente del cupo máximo de los módulos que lo usen.
- **FR-023**: Un salón Inactivo o eliminado MUST NOT poder asignarse a módulos nuevos.
- **FR-024**: El listado de salones MUST permitir buscar por nombre y filtrar por ubicación y estado.

**Listas desplegables**

- **FR-025**: El sistema MUST permitir al CAE ver las listas predefinidas por el sistema y administrar sus elementos: crear, editar, reordenar, desactivar y eliminar (lógico). El CAE MUST NOT poder crear, renombrar ni eliminar listas.
- **FR-026**: Cada elemento MUST tener etiqueta en español y en inglés (ambas obligatorias), orden y estado Activo o Inactivo.
- **FR-027**: El sistema MUST permitir solo desactivar (no eliminar) un elemento que esté en uso, explicando el motivo.
- **FR-028**: Los selectores de la app MUST mostrar únicamente elementos Activos, en el idioma del dispositivo y en el orden definido.
- **FR-029**: El sistema MUST incluir precargada la lista "Tipos de PQRS" con Petición, Queja, Reclamo y Sugerencia, con etiquetas en ambos idiomas.

**Pantallas y experiencia**

- **FR-030**: Salones y ubicaciones MUST estar en la pestaña Módulos del CAE; periodos y listas en Más > Configuración, como filas agrupadas con flecha.
- **FR-031**: Todas las pantallas MUST mostrar estados de carga, vacío y error, y seguir el sistema de diseño del proyecto (tarjetas, campos con relleno y borde tenue, botones con ícono separados 16 px, objetivos táctiles de 48 px mínimo).

### Key Entities

- **Periodo académico**: semestre con nombre único, fecha de inicio, fecha de fin y estado (Próximo, Activo, Cerrado). Agrupa los módulos. Solo uno Activo a la vez.
- **Ubicación**: edificio o sede con nombre único; agrupa salones.
- **Salón**: espacio con nombre o código único dentro de su ubicación, capacidad entera positiva y estado Activo o Inactivo; su capacidad define el cupo de los módulos.
- **Lista desplegable**: catálogo con nombre (ej. "Tipos de PQRS") usado por selectores de la app.
- **Elemento de lista**: opción de una lista con etiqueta en español, etiqueta en inglés, orden y estado Activo o Inactivo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un CAE sin ayuda crea un periodo, un salón con su ubicación y una lista con elementos bilingües en menos de 5 minutos en total.
- **SC-002**: En el 100 % de los intentos, incluidos los simultáneos, nunca existen dos periodos activos ni dos periodos con fechas solapadas.
- **SC-003**: Ningún registro se elimina físicamente: el 100 % de los borrados son recuperables a nivel de datos.
- **SC-004**: El 100 % de los intentos de docentes y estudiantes de ver o modificar la configuración reciben acceso denegado sin cambios en los datos.
- **SC-005**: El 100 % de las acciones bloqueadas muestran el motivo en el idioma del usuario.
- **SC-006**: Los selectores muestran un cambio de lista (nuevo, reordenado o desactivado) en la siguiente apertura del selector, sin reinstalar la app.
- **SC-007**: El 90 % de los CAE completan la activación de un nuevo periodo (con confirmación del cierre del anterior) al primer intento.

## Assumptions

- Ya existen inicio de sesión y roles (spec 001); el CAE es el rol SUPERADMIN.
- El estado "Próximo" es el de un periodo no activo y no cerrado (aún no activado). La activación es siempre manual; el único cambio automático es el cierre al pasar la fecha de fin del periodo activo.
- Un periodo Cerrado no se reabre.
- Se puede activar un periodo antes de su fecha de inicio o durante su vigencia, pero no uno cuya fecha de fin ya pasó.
- Las listas existen predefinidas por el sistema porque cada una se conecta a un selector concreto; las listas nuevas se incorporan con la funcionalidad que use el selector.
- Un elemento "en uso" es el referenciado por algún registro existente (por ejemplo, una PQRS); mientras no existan consumidores, todo elemento puede eliminarse.
- Las reglas de salón que dependen de módulos (FR-021) se verifican cuando exista la funcionalidad de módulos; hasta entonces no hay módulos que las activen. La funcionalidad de módulos debe cumplir además las reglas que dependen de ella y que esta funcionalidad no puede aplicar: el cupo de un módulo es la capacidad de su salón (FR-022), un salón Inactivo o eliminado no se asigna a módulos nuevos (FR-023) y los módulos de un periodo Cerrado no se modifican (FR-013).
- La capacidad de un salón es un entero positivo sin tope máximo.
- Los nombres son únicos entre registros no eliminados, sin distinguir mayúsculas ni espacios sobrantes.
- Fuera de alcance: módulos, horarios e inscripciones; SMTP, dominios de correo y ventanas de cancelación configurables; carga masiva desde archivos.
