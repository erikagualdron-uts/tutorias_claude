# Feature Specification: Plantillas de correo institucionales

**Feature Branch**: `015-email-templates`

**Created**: 2026-11-21

**Status**: Implemented

**Input**: User description: "Plantillas de correo (spec 015). Plantillas institucionales con la marca UTS, en español e inglés según el idioma del usuario, un correo propio por tipo de aviso, aplicadas en todos los servicios que hoy envían correo tras una revisión de los mismos. Incluye las pruebas de entrega por correo que quedaron diferidas de la spec 014."

## Clarifications

### Revisión previa de los servicios que envían correo (2026-11-21)

Hoy la API envía correo en cuatro casos, todos como texto plano sin marca:

| Correo | Quién lo recibe | Origen |
|---|---|---|
| Código de verificación de la cuenta | Estudiante que se registra | Registro |
| Código para restablecer la contraseña | Cualquier usuario | Recuperación de clave |
| Aviso de cambio en un módulo (siete tipos) | Estudiantes inscritos | Notificaciones (spec 014) |
| Prueba del servidor de correo | CAE que la pide | Configuración SMTP (spec 014) |

La clave temporal de un docente no se envía por correo: el CAE la ve una sola vez en la app. Esta spec no cambia eso.

### Session 2026-11-21

- Q: ¿Cómo debe llegar el logo de la UTS dentro de los correos? → A: Incrustado en el correo (viaja adjunto en línea, sin servidor público).
- Q: ¿Los correos de aviso incluyen un botón que abra la app, o solo el texto? → A: Solo texto: el correo indica abrir la app UTS Tutorías, sin botón ni enlace.
- Análisis 2026-11-21: el aviso de salón y de docente informa solo el dato nuevo (no el anterior), y el idioma siempre es es o en.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recibir avisos de módulos con la imagen de la UTS (Priority: P1)

Un estudiante inscrito recibe, cuando cambia algo en un módulo, un correo claro y con la marca de la universidad. Cada tipo de aviso (cambio de docente, cambio de salón, festivo que cancela, festivo que restaura, sesión reprogramada, sesión cancelada, sesión reactivada) tiene su propio correo que muestra lo que cambió: módulo, sesión afectada y el dato nuevo (hora, salón o docente).

**Why this priority**: Es el correo que más se envía y el que el estudiante debe entender de un vistazo para no perder una tutoría.

**Independent Test**: Provocar cada uno de los siete tipos de aviso con un estudiante inscrito y comprobar que llega un correo distinto, con el dato que cambió y la marca UTS.

**Acceptance Scenarios**:

1. **Given** un estudiante inscrito con idioma español, **When** el docente reprograma una sesión, **Then** recibe un correo en español con el nombre del módulo, la hora anterior, la hora nueva (hora de Bogotá) y la marca UTS.
2. **Given** un estudiante con idioma inglés, **When** el CAE cambia el salón de un módulo, **Then** recibe el correo en inglés con el salón nuevo (el aviso informa el dato nuevo, no el anterior).
3. **Given** un festivo que cancela sesiones, **When** se envía el aviso, **Then** el correo lista la fecha del festivo y las sesiones afectadas, y el de restauración indica que vuelven a darse.
4. **Given** un cliente de correo que no muestra imágenes o formato, **When** el estudiante abre el correo, **Then** el contenido completo se lee igual en texto simple.

---

### User Story 2 - Correos de cuenta con la misma imagen (Priority: P1)

Quien se registra recibe el código de verificación, y quien olvida su clave recibe el código de restablecimiento, ambos con la marca UTS, el código bien visible, su vigencia y qué hacer si no fue quien lo pidió.

**Why this priority**: Son el primer contacto del usuario con la universidad y hoy se ven como mensajes genéricos que pueden confundirse con correo no deseado.

**Independent Test**: Registrar un estudiante y pedir un restablecimiento; revisar que ambos correos llegan con la marca, el código legible y la vigencia, en el idioma del usuario.

**Acceptance Scenarios**:

1. **Given** un registro nuevo, **When** se envía el código, **Then** el correo muestra el código destacado, su vigencia y la indicación de ignorarlo si no creó la cuenta.
2. **Given** una solicitud de restablecimiento, **When** se envía el código, **Then** el correo lo muestra destacado y advierte que nadie de la UTS pedirá la clave.
3. **Given** un código de cuenta, **When** se envía, **Then** el código no aparece en el asunto ni en registros del sistema.

---

### User Story 3 - Prueba de correo del CAE con la misma imagen (Priority: P2)

El CAE que prueba el servidor de correo desde la configuración recibe un mensaje corto con la misma marca, que confirma que el envío funciona y deja ver cómo se verán los correos reales.

**Why this priority**: Es poco frecuente, pero sirve como vista previa del resto de correos al configurar el servidor.

**Independent Test**: Enviar la prueba desde la pantalla de SMTP y revisar el correo en español e inglés.

**Acceptance Scenarios**:

1. **Given** un servidor configurado y un CAE en español, **When** pide la prueba, **Then** recibe el correo de prueba en español con la marca.
2. **Given** un servidor sin configurar, **When** pide la prueba, **Then** la app muestra la regla que lo bloquea y no se envía nada.

---

### User Story 4 - Entrega por correo comprobada de punta a punta (Priority: P2)

El equipo cuenta con pruebas automáticas que comprueban la entrega por correo de cada tipo de aviso y de los correos de cuenta: que se envía, que no se repite, que se reintenta si falla y que respeta los dominios permitidos. Con esto se cierran las verificaciones que la spec 014 dejó pendientes (pruebas de entrega, recorrido del quickstart y revisión de terminado).

**Why this priority**: Sin ellas, un cambio de plantilla puede dejar de enviar correos sin que nadie lo note.

**Independent Test**: Correr la suite de entrega por correo contra un servidor de correo simulado y verificar que todos los casos pasan.

**Acceptance Scenarios**:

1. **Given** un aviso pendiente y el servidor simulado, **When** corre el envío, **Then** el correo llega una sola vez, aunque el envío se reintente.
2. **Given** un servidor de correo caído, **When** falla el envío, **Then** el aviso queda pendiente con su causa y se reintenta sin perderse.
3. **Given** un estudiante cuyo correo no es del dominio de estudiantes, **When** se intenta enviar, **Then** el envío se omite y se registra el motivo.
4. **Given** cada tipo de correo, **When** se renderiza en español e inglés, **Then** no quedan marcadores sin reemplazar ni textos en el idioma equivocado.

---

### Edge Cases

- Nombre de módulo, salón o docente con caracteres especiales, tildes, o texto muy largo: el correo no se rompe ni se corta de forma ilegible.
- Texto con código o marcas escritas por un usuario (por ejemplo en el nombre de un módulo): se muestra como texto, nunca se interpreta.
- El idioma del usuario es siempre español o inglés (dato obligatorio de la cuenta); no existe un destinatario sin idioma.
- Datos de marca o de contacto ausentes en la configuración: el correo se envía igual, sin ese bloque.
- Un aviso de un tipo sin plantilla propia: se envía con la plantilla general en lugar de perderse.
- Sesión reprogramada que cruza el cambio de día: la fecha y hora se muestran en hora de Bogotá.
- Varios avisos seguidos al mismo estudiante: cada uno llega como correo propio, no se fusionan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST enviar con la plantilla institucional todos los correos que hoy salen de la API: código de verificación, código de restablecimiento, avisos de módulos y prueba del servidor de correo.
- **FR-002**: Cada uno de los siete tipos de aviso de módulos MUST tener su propio correo, con asunto y contenido propios que muestren los datos que cambiaron y que cierren indicando abrir la app para ver el detalle, sin botón ni enlace (la frase "Revisa el módulo en la app." que ya cierra el cuerpo del aviso cumple esto).
- **FR-003**: Todo correo MUST existir en español e inglés y MUST enviarse en el idioma del destinatario.
- **FR-004**: Todo correo MUST incluir una versión en texto simple con el mismo contenido, para clientes que no muestran formato.
- **FR-005**: Los correos MUST seguir la marca de `Design.md`: solo colores de la paleta (el lima nunca como texto sobre blanco), logo desde `mobile/assets/brand/` sin modificar e incrustado en el propio correo (se ve sin cargar imágenes remotas), tipografía de respaldo segura para correo y el nombre oficial de la institución en el pie.
- **FR-006**: Los datos de marca que cambian entre ambientes (nombre mostrado, correo de contacto y textos legales del pie) MUST vivir en configuración, nunca escritos en las plantillas.
- **FR-007**: Los dominios de correo permitidos MUST seguir leyéndose de configuración, sin valores escritos en el código.
- **FR-008**: Los correos de código MUST mostrar el código de forma destacada y su vigencia, y el código MUST NOT aparecer en el asunto ni en registros.
- **FR-009**: Toda fecha y hora mostrada MUST estar en `America/Bogota`.
- **FR-010**: El contenido escrito por usuarios (nombres de módulo, salón, docente) MUST mostrarse como texto, sin interpretarse como formato.
- **FR-011**: Ningún texto de plantilla MUST estar escrito dentro de la lógica de envío; las plantillas viven en un único lugar y todos los envíos las usan, de modo que cambiar un correo no obligue a tocar varios servicios.
- **FR-012**: La entrega, los reintentos, el estado por canal y las reglas de la spec 014 MUST mantenerse sin cambios; esta spec solo cambia lo que el correo dice y cómo se ve.
- **FR-013**: El sistema MUST contar con pruebas automáticas de la entrega por correo de cada tipo (envío único, reintento tras fallo, dominio no permitido, servidor sin configurar) y de que todas las plantillas se renderizan completas en ambos idiomas.
- **FR-015**: Los correos MUST ser accesibles: idioma declarado en la página, un solo título, estado siempre con texto además del color (insignia), pre-encabezado con el primer párrafo, texto de 12 px como mínimo y de 16 px en el cuerpo, y todos los pares texto/fondo con contraste mínimo de 4.5:1.
- **FR-016**: Los correos MUST evitar lo que los clientes de correo no soportan (`overflow`, estilos en `<body>`, el atajo `background`) y todo relleno MUST llevar también `bgcolor`.
- **FR-014**: Se MUST completar el recorrido del quickstart de la spec 014 con los correos nuevos y la revisión de terminado de ambas specs.

### Key Entities *(include if feature involves data)*

- **Plantilla de correo**: Un correo definido por tipo (verificación, restablecimiento, cada tipo de aviso y prueba) con una versión por idioma, que produce asunto, contenido con formato y texto simple a partir de los datos del envío.
- **Datos de marca del correo**: Nombre mostrado, logo, contacto y pie institucional que se leen de configuración y se aplican a todas las plantillas.
- **Aviso (spec 014)**: Registro existente con tipo, idioma y datos del cambio; es la fuente de los datos que cada plantilla de aviso muestra.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los correos que la API envía (cuatro familias, siete tipos de aviso) usan la plantilla institucional; no queda ningún correo en texto plano sin marca.
- **SC-002**: Un estudiante identifica qué cambió (módulo, sesión y dato nuevo) en menos de 10 segundos al abrir el correo del aviso.
- **SC-003**: El 100 % de las plantillas existe y se renderiza sin marcadores pendientes en español e inglés.
- **SC-004**: Cambiar el texto de un correo requiere editar un solo lugar, sin tocar los servicios que lo envían.
- **SC-005**: Las pruebas de entrega por correo cubren los cuatro escenarios de la historia 4 y pasan en cada ejecución.
- **SC-006**: Ningún código de verificación ni de restablecimiento aparece en asuntos ni en registros.
- **SC-007**: El verificador de compatibilidad de Mailpit da, en promedio sobre los 20 correos, al menos 90 % de soporte (primer diseño: 88,8 %; rediseño: 94,1 %), y todos los pares de color cumplen contraste AA.

## Assumptions

- La API es el único servicio que envía correo; no hay otros servicios con envíos propios (confirmado en la revisión previa).
- Los correos llevan formato (HTML) con alternativa en texto simple; esto es un cambio visible respecto del texto plano de hoy.
- El logo va incrustado en cada correo; no se necesita servidor público para imágenes. Si el cliente de correo no lo muestra, el nombre de la institución en texto basta para identificar el mensaje.
- Las pruebas de entrega usan un servidor de correo simulado; un envío real a una bandeja de la UTS queda como verificación manual cuando la institución entregue su servidor SMTP.
- Los avisos de cambio de salón y de docente informan solo el dato nuevo, igual que el texto de la bandeja y del push de la spec 014; mostrar el valor anterior exigiría guardarlo en el evento y queda fuera de esta spec.
- No se agregan correos nuevos (por ejemplo, anuncios del docente o PQRS); esos usarán estas plantillas en sus propias specs.
- Los correos de código mantienen la vigencia que ya define la spec 001.
- El diseño de los correos respeta la paleta y el nombre oficial de `Design.md`; no se agregan colores nuevos.
