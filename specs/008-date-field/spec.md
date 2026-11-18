# Feature Specification: Campo de fecha con selector

**Feature Branch**: `008-date-field`

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "Funcionalidad 008: input de tipo fecha moderno que tenga el formato específico (dd/mm/YYYY) y que permita al usuario seleccionar la fecha. Seguir D-079 y la sección Date fields de docs/Design.md."

## Clarifications

### Session 2026-11-17

- Q: ¿Debe el selector bloquear también los días que caen dentro de otro periodo académico, o solo la regla de inicio y fin? → A: Solo mínimo, máximo y relación inicio/fin; el solapamiento con otros periodos lo rechaza el servidor y la app muestra con qué periodo choca.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Elegir una fecha desde un selector en lugar de escribirla (Priority: P1)

Cuando un formulario pide un día de calendario (por ejemplo, el inicio y el fin de un periodo académico), la persona ve un campo con el mismo aspecto que los demás (relleno, borde tenue y un ícono de calendario a la izquierda). Al tocarlo se abre un selector de fecha del dispositivo; al elegir un día, el campo lo muestra con el formato **dd/mm/YYYY**. La persona nunca escribe la fecha a mano.

**Why this priority**: Escribir `AAAA-MM-DD` es incómodo y propenso a errores; es el motivo de la funcionalidad y lo que la persona usa en cada formulario con fechas.

**Independent Test**: Abrir el formulario de periodo, tocar "Fecha de inicio", elegir el 5 de febrero de 2027 y comprobar que el campo muestra `05/02/2027` sin haber tecleado nada.

**Acceptance Scenarios**:

1. **Given** un campo de fecha vacío, **When** la persona lo toca, **Then** se abre el selector de fecha del dispositivo y el teclado no aparece.
2. **Given** el selector abierto, **When** la persona elige un día y confirma, **Then** el selector se cierra y el campo muestra ese día como dd/mm/YYYY, con día y mes de dos dígitos.
3. **Given** el selector abierto, **When** la persona lo cancela o lo cierra sin confirmar, **Then** el campo conserva el valor que tenía antes.
4. **Given** un campo con una fecha ya elegida, **When** la persona lo vuelve a tocar, **Then** el selector se abre posicionado en esa fecha.
5. **Given** la app en español o en inglés, **When** se muestra cualquier fecha de calendario (en el campo y en los listados), **Then** siempre aparece como dd/mm/YYYY.
6. **Given** un campo de fecha, **When** se compara con un campo de texto del mismo formulario, **Then** tiene el mismo relleno, borde tenue, radio y altura, con el ícono de calendario a la izquierda.

---

### User Story 2 - Que el selector no deje elegir fechas que rompen una regla (Priority: P1)

Cuando una fecha depende de otra (la fecha de fin debe ser posterior a la de inicio), el selector bloquea los días que romperían la regla y, debajo del campo, se explica cuál es la regla.

**Why this priority**: Evita errores antes de enviar y cumple la regla del proyecto de que toda acción bloqueada muestra la regla que la bloquea.

**Independent Test**: Elegir inicio 01/02/2027, abrir "Fecha de fin" y comprobar que no se puede seleccionar el 01/02/2027 ni días anteriores, y que debajo del campo se lee la regla.

**Acceptance Scenarios**:

1. **Given** una fecha de inicio elegida, **When** la persona abre el selector de la fecha de fin, **Then** los días iguales o anteriores al inicio no se pueden seleccionar.
2. **Given** una fecha de fin elegida, **When** la persona cambia el inicio a un día igual o posterior al fin, **Then** el campo de fin queda marcado con error y la regla se explica debajo; el envío se bloquea hasta corregirlo.
3. **Given** un campo con límite (mínimo o máximo), **When** se muestra, **Then** la regla del límite está visible debajo del campo, no solo implícita en el selector.
4. **Given** una fecha enviada al servidor que rompe la regla (por ejemplo, desde otro cliente), **When** el servidor responde con el error, **Then** la app muestra el mensaje traducido de la regla junto al campo.

---

### User Story 3 - Accesibilidad, estados y consistencia (Priority: P2)

El campo de fecha se comporta como el resto de campos: tiene etiqueta, estados de enfoque, error y deshabilitado, y es utilizable con lector de pantalla.

**Why this priority**: Garantiza calidad y consistencia, pero la funcionalidad ya es útil sin ello.

**Independent Test**: Activar el lector de pantalla, recorrer el formulario y comprobar que el campo anuncia su etiqueta y su valor; deshabilitarlo y comprobar que no abre el selector.

**Acceptance Scenarios**:

1. **Given** un lector de pantalla activo, **When** se enfoca el campo, **Then** anuncia su etiqueta, su valor actual (o "sin seleccionar") y que abre un selector de fecha.
2. **Given** un campo deshabilitado (por ejemplo, un periodo cerrado en solo lectura), **When** la persona lo toca, **Then** no se abre el selector y el campo se ve con 60 % de opacidad.
3. **Given** un campo con error, **When** se muestra, **Then** el borde y el mensaje usan el estilo de error y el error no se comunica solo por color.
4. **Given** el campo en cualquier estado, **When** se mide su área táctil, **Then** mide al menos 48 px de alto.
5. **Given** el campo de fecha, **When** se muestra su etiqueta o su ayuda, **Then** todos los textos salen de los archivos de traducción en español e inglés.

---

### Edge Cases

- **Zona horaria**: elegir el 31/12/2026 debe guardarse y mostrarse siempre como ese mismo día, sin importar la zona horaria del dispositivo ni la hora a la que se elija (nunca se corre un día).
- **Fecha existente al editar**: un periodo guardado se abre mostrando sus fechas como dd/mm/YYYY y el selector parte de ellas.
- **Campo vacío y obligatorio**: si la persona intenta enviar sin elegir la fecha, el campo se marca con error y se explica que es obligatoria.
- **Años bisiestos y fines de mes**: el 29/02/2028 es elegible; el 29/02/2027 no existe y no puede aparecer, porque el selector solo ofrece días válidos.
- **Cambio de idioma del dispositivo**: el formato dd/mm/YYYY no cambia; solo cambian los textos y los nombres de mes y día que dibuja el selector del sistema.
- **Selector abierto y la app pasa a segundo plano o gira la pantalla**: al volver, el selector sigue abierto o se cierra sin alterar el valor previo.
- **Valor inicial inválido recibido del servidor**: si llegara un valor que no es una fecha válida, el campo se muestra vacío en lugar de mostrar "Invalid date".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La aplicación MUST ofrecer un campo de fecha reutilizable que sustituya a todo campo de texto que hoy pida un día de calendario.
- **FR-002**: El campo MUST abrir un selector de fecha del dispositivo al tocarlo y MUST NOT permitir escribir la fecha a mano.
- **FR-003**: El campo MUST mostrar la fecha elegida como dd/mm/YYYY (día y mes de dos dígitos) en español y en inglés; el formato es fijo e independiente del idioma del dispositivo.
- **FR-004**: Toda fecha de calendario mostrada fuera del campo (listados, tarjetas, detalle) MUST usar el mismo formato dd/mm/YYYY.
- **FR-005**: El valor interno y el enviado al servidor MUST ser el día de calendario en formato `YYYY-MM-DD`, sin conversión de zona horaria.
- **FR-006**: El campo MUST tener el aspecto de los demás campos de texto (relleno, borde tenue, radio, altura mínima de 48 px) con un ícono de calendario a la izquierda, y los estados enfoque, error y deshabilitado definidos en `docs/Design.md`.
- **FR-007**: El campo MUST admitir una fecha mínima y una máxima; los días fuera del rango MUST NOT ser seleccionables en el selector.
- **FR-008**: Cuando existe un límite, la regla MUST mostrarse en texto debajo del campo, y si el valor deja de cumplirla (por cambiar otro campo) el campo MUST pasar a estado de error con la regla explicada.
- **FR-009**: En el formulario de periodo académico, el campo de fin MUST bloquear los días iguales o anteriores al inicio.
- **FR-009a**: El selector MUST NOT bloquear ni marcar los días ocupados por otros periodos; si el servidor rechaza un solapamiento, la app MUST mostrar el mensaje traducido con el periodo con el que choca (spec 006, FR-009).
- **FR-010**: Cancelar o cerrar el selector sin confirmar MUST conservar el valor anterior.
- **FR-011**: El campo MUST abrir el selector posicionado en la fecha actual del campo; si está vacío, en el día de hoy (zona `America/Bogota`), o en el día permitido más cercano cuando hoy queda fuera del rango.
- **FR-012**: Un campo deshabilitado MUST NOT abrir el selector.
- **FR-013**: El campo MUST exponer etiqueta, valor y propósito a los lectores de pantalla, y su estado MUST NOT depender solo del color.
- **FR-014**: Todos los textos del campo (etiqueta, marcador de posición, ayudas, errores y descripción de accesibilidad) MUST estar en los archivos de traducción en español e inglés.
- **FR-015**: El servidor MUST seguir validando las reglas de fechas; la app solo las anticipa y traduce los errores recibidos.
- **FR-016**: El formulario de periodo académico (spec 006) MUST pasar a usar el campo de fecha, y sus listados MUST mostrar las fechas como dd/mm/YYYY.

### Key Entities

- **Día de calendario**: una fecha sin hora ni zona horaria (año, mes, día), por ejemplo el inicio o el fin de un periodo académico. Se muestra como dd/mm/YYYY y se transmite como `YYYY-MM-DD`.
- **Restricción de fecha**: regla opcional sobre un día de calendario (mínimo, máximo o relación con otro campo) con un texto explicativo traducido.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona completa las dos fechas de un periodo académico en menos de 20 segundos y sin teclear ningún carácter.
- **SC-002**: El 100 % de las fechas de calendario mostradas en la app aparecen como dd/mm/YYYY en ambos idiomas.
- **SC-003**: Es imposible enviar desde la app un periodo con fecha de fin igual o anterior al inicio sin que antes se muestre la regla que lo impide.
- **SC-004**: En pruebas con distintas zonas horarias del dispositivo y horas del día, la fecha elegida se guarda y se vuelve a mostrar siempre como el mismo día.
- **SC-005**: Cero fechas con formato inválido (`Invalid date`, `NaN`) visibles para el usuario en los flujos cubiertos.
- **SC-006**: El 100 % de los estados del campo (vacío, con valor, enfoque, error, deshabilitado) cumplen el área táctil de 48 px y son anunciados por el lector de pantalla.

## Assumptions

- El alcance cubre el componente reutilizable y su adopción en el formulario y los listados de periodos académicos; los formularios futuros con fechas lo usarán, pero no se crean aquí.
- Solo se eligen días de calendario; la elección de hora (por ejemplo, el horario de un módulo o un cambio de sesión) queda fuera y se trata en su propia funcionalidad.
- El formato dd/mm/YYYY es fijo en ambos idiomas, por decisión del equipo (D-079); no se ofrece otro formato.
- Se usa el selector de fecha nativo del dispositivo (diálogo en Android, hoja inferior en iOS) y debe funcionar en Expo Go; la librería concreta está registrada en `docs/Architecture.md` y se confirma en el plan.
- Esta funcionalidad sustituye el campo de texto de la tarea T023 y la nota R-8 de la spec 006.
- No cambia el contrato con el servidor: el API ya recibe y devuelve `YYYY-MM-DD`.
- Los colores, tipografías, íconos (Iconify, set `solar`) y espaciados provienen del sistema de diseño existente; no se agregan colores nuevos.
