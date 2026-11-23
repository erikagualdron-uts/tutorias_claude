# Feature Specification: Avisos por correo para docentes y CAE

**Feature Branch**: `025-staff-email-notices`

**Created**: 2026-11-23

**Status**: Implemented

**Input**: User description: "Hagamos la spec del correo para docentes y CAE: hoy los avisos por correo solo se envían a direcciones de estudiantes; un docente que recibe un aviso en la app (por ejemplo, la respuesta a su PQRS) nunca recibe el correo."

## Estado de partida (diagnóstico del 2026-11-23)

| Qué pasa hoy | Detalle |
|---|---|
| El aviso por correo se omite para cualquier cuenta que no sea de estudiante | Comprobado en la base de desarrollo: el aviso de una PQRS de un docente quedó con la entrega por correo omitida por "dominio no permitido", mientras que los de un estudiante se enviaron |
| El motivo es que el envío solo compara la dirección con el dominio de los estudiantes (`uts.edu.co`) | Ya existe configurado el dominio del personal (`correo.uts.edu.co`, docentes y administrativos) y se usa al crear docentes, pero no al enviar avisos |
| La documentación dice lo contrario | `Context.md`: cada cambio de estado y cada respuesta de una PQRS avisan al autor "por la bandeja, el push y el correo"; un docente también puede ser autor |
| Los avisos de módulos (cambio de hora, cancelación, docente, salón) solo van a estudiantes inscritos | Por eso el problema solo se nota hoy con las PQRS de docentes |
| El CAE no recibe hoy ningún aviso | Nadie lo nombra como destinatario; no hay nada que enviarle por correo |
| La bandeja y el correo de los estudiantes funcionan | Comprobado con el flujo real: el aviso se crea y el correo sale en segundos |

## Clarifications

### Session 2026-11-23

- Q: ¿El CAE recibe algún aviso nuevo (por ejemplo, al radicarse una PQRS) o la spec solo permite el correo para quien ya recibe avisos? → A: Solo la regla del correo; el CAE no recibe avisos nuevos y cualquier aviso nuevo para él sería otra spec.
- Q: ¿Qué pasa con una cuenta cuyo correo no es de ninguno de los dos dominios institucionales? → A: No se le envía correo; la entrega queda omitida con su motivo, y el CAE puede cambiar los dominios en la configuración si lo necesita.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Un docente recibe por correo los avisos que ya ve en la app (Priority: P1)

Un docente presenta una PQRS y el CAE la pasa a revisión, la responde o la resuelve. Además del aviso en la bandeja, el docente recibe un correo en su dirección institucional, en su idioma, igual que un estudiante.

**Why this priority**: Es el defecto: lo prometido en `Context.md` no se cumple para docentes, y el correo es el único canal que llega al docente con la app cerrada mientras el push no esté disponible.

**Independent Test**: Con un docente que presentó una PQRS, el CAE la responde; comprobar que se crea el aviso y que la entrega por correo queda enviada a la dirección del docente, con el mismo texto que ve en la app.

**Acceptance Scenarios**:

1. **Given** un docente con correo del dominio del personal y un SMTP configurado, **When** el CAE responde su PQRS, **Then** el docente recibe el aviso en la bandeja y un correo con el mismo asunto y sin copiar el texto de la respuesta.
2. **Given** el mismo docente, **When** el CAE pasa su PQRS a revisión y luego la resuelve, **Then** recibe un correo por cada cambio de estado.
3. **Given** un docente con la app en inglés, **When** recibe el correo, **Then** el correo está en inglés; en español, en español.
4. **Given** el SMTP sin configurar, **When** llega un aviso al docente, **Then** la entrega queda pendiente y se envía cuando el SMTP esté configurado, como ya ocurre con los estudiantes.
5. **Given** un docente desactivado o eliminado, **When** llega un aviso, **Then** no se le envía correo, como hoy.

---

### User Story 2 - La regla del correo vale para cualquier cuenta institucional (Priority: P1)

El envío por correo no depende del rol sino de que la dirección sea institucional: pertenece al dominio de estudiantes o al del personal, ambos tomados de la configuración. Una dirección de otro dominio sigue sin recibir correo y el motivo queda registrado.

**Why this priority**: Corrige la causa y no el síntoma: cualquier aviso futuro para el personal (incluido el CAE) funcionará sin otro cambio, y se mantiene la salvaguarda de no escribir a direcciones ajenas a la institución.

**Independent Test**: Probar el envío con una cuenta de estudiante, una de docente, una del CAE y una con un dominio ajeno: las tres institucionales envían, la ajena queda omitida con su motivo.

**Acceptance Scenarios**:

1. **Given** un aviso para una cuenta con correo del dominio de estudiantes, **When** se entrega, **Then** se envía el correo, como hoy.
2. **Given** un aviso para una cuenta con correo del dominio del personal (docente o CAE), **When** se entrega, **Then** se envía el correo.
3. **Given** un aviso para una cuenta con un dominio que no es ninguno de los dos, **When** se entrega, **Then** no se envía, la entrega queda omitida con el motivo de dominio no permitido y el aviso de la bandeja no se afecta.
4. **Given** que el CAE cambia un dominio en la configuración, **When** se entrega el siguiente aviso, **Then** la regla usa el valor nuevo sin reiniciar nada.
5. **Given** el CAE como destinatario de un aviso (hoy ninguno lo incluye), **When** exista, **Then** su correo se enviará por esta misma regla.

---

### User Story 3 - Nada de lo anterior se repite ni se reenvía (Priority: P2)

Los avisos ya omitidos antes de este cambio no se envían de golpe, y los envíos a estudiantes no cambian.

**Why this priority**: Evita una ráfaga de correos viejos a los docentes y confirma que la corrección no altera lo que ya funcionaba.

**Independent Test**: Revisar que las entregas antiguas omitidas siguen omitidas y que un aviso nuevo de estudiante se entrega igual que antes.

**Acceptance Scenarios**:

1. **Given** entregas por correo omitidas antes del cambio por dominio no permitido, **When** se despliega la corrección, **Then** siguen omitidas y no se envían.
2. **Given** un estudiante inscrito en un módulo con un cambio, **When** se entrega el aviso, **Then** el correo se envía con el mismo contenido y el mismo tiempo que antes.
3. **Given** cualquier envío, **When** se revisan los registros del servidor, **Then** no contienen direcciones, contraseñas ni textos de respuestas.

---

### Edge Cases

- Una cuenta (de docente, del CAE o de otro rol) cuyo correo no es de ninguno de los dos dominios, por ejemplo una dirección personal: no recibe correo, la entrega queda omitida con su motivo y el aviso de la bandeja llega igual; para recibirlo, el CAE ajusta los dominios en la configuración.
- Un correo con mayúsculas o espacios: se compara normalizado, como en el registro y la creación de docentes.
- Un dominio con subdominio parecido (`otra.correo.uts.edu.co`) o con texto añadido (`correo.uts.edu.co.example.com`): no coincide y no recibe correo.
- El mismo aviso para varios destinatarios con dominios distintos: cada entrega se decide por separado.
- Rebote o rechazo del servidor de correo: se reintenta y se marca fallida como hoy, sin afectar la bandeja.
- El CAE sin ningún aviso: no hay envío; esta spec no le crea avisos nuevos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El envío de avisos por correo MUST permitir las direcciones del dominio de estudiantes y las del dominio del personal, ambos leídos de la configuración, y comparados sin distinguir mayúsculas ni espacios.
- **FR-002**: Una dirección que no pertenezca a ninguno de los dos dominios MUST NOT recibir correo: la entrega queda omitida con el motivo de dominio no permitido y el aviso de la bandeja no se afecta.
- **FR-003**: Los dominios MUST seguir viniendo de la configuración y MUST NOT escribirse en el código; un cambio de configuración se aplica al siguiente aviso.
- **FR-004**: Un docente que es autor de una PQRS MUST recibir por correo el aviso de cada cambio de estado y de cada respuesta, en el idioma de su cuenta, sin copiar el texto de la respuesta.
- **FR-005**: Las entregas por correo ya omitidas antes de este cambio MUST NOT enviarse retroactivamente.
- **FR-006**: El comportamiento para estudiantes MUST NOT cambiar: mismo contenido, mismos reintentos, mismo estado pendiente mientras el SMTP no esté configurado, y sin envío a cuentas desactivadas o eliminadas.
- **FR-007**: Esta spec MUST NOT agregar tipos de aviso ni destinatarios nuevos (el CAE no recibe avisos hoy ni los recibirá con esta spec), cambiar plantillas, ni tocar la app móvil, el push o la bandeja.
- **FR-008**: Las pruebas MUST cubrir una cuenta de estudiante, una de docente, una del CAE y una de dominio ajeno, incluidos los casos de dominio con subdominio o texto añadido, y los registros MUST NOT contener direcciones ni textos.
- **FR-009**: `Context.md` y `Decisions.md` MUST registrar que el correo de avisos sigue la regla de dominios institucionales y no el rol.

### Key Entities

- **Entrega de un aviso por correo**: el intento de enviar un aviso a una dirección; tiene estado (pendiente, enviada, fallida, omitida) y, si se omite, el motivo.
- **Dominios institucionales**: el dominio de los estudiantes y el del personal (docentes y administrativos), ambos de configuración, que deciden a quién se puede escribir.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los avisos de PQRS dirigidos a un docente activo con correo institucional produce un correo enviado (hoy 0 %).
- **SC-002**: El 100 % de los envíos a estudiantes se comporta igual que antes de la corrección (mismo contenido y mismo estado final).
- **SC-003**: Ninguna dirección fuera de los dos dominios institucionales recibe correo, y cada omisión queda con su motivo.
- **SC-004**: El correo de un aviso nuevo sale en menos de 30 segundos desde que se crea el evento, igual que hoy.
- **SC-005**: Ninguna prueba, lint ni tipos que pasaban antes deja de pasar.

## Assumptions

- Solo cambia la decisión de a quién se envía; el contenido, las plantillas, el idioma, los reintentos y el estado pendiente sin SMTP ya existen y no se tocan.
- Los avisos de módulos siguen yendo solo a estudiantes inscritos; que docentes o el CAE reciban esos u otros avisos nuevos (por ejemplo, una PQRS nueva para el CAE) sería otra spec. Hoy el CAE no es destinatario de nada, así que esta corrección le abre el canal sin enviarle nada todavía.
- Los dominios actuales son `uts.edu.co` (estudiantes) y `correo.uts.edu.co` (personal), y el CAE puede cambiarlos desde la configuración como ya ocurre.
- Los correos antiguos no se reenvían aunque su aviso siga sin leer.
- Los cambios no tocan el esquema de la base de datos ni los repositorios de la app y de la base de datos; solo el backend y la documentación.
- Fuera de alcance: el push (no se registra en Expo Go y su aviso al usuario es otra spec), nuevos tipos de aviso, preferencias de notificación por persona y la verificación de que una dirección exista.
