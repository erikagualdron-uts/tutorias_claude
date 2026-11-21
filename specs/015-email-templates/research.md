# Research: Plantillas de correo institucionales

Sin `NEEDS CLARIFICATION` pendientes. Las decisiones de abajo salen de la revisión del código de `tutorias_uts_back` del 2026-11-21.

## R1. Cómo generar el HTML

- **Decision**: una función `layout()` en TypeScript que arma una tabla centrada de 600 px con estilos en línea, y un `escapeHtml()` de cinco reemplazos. Cada plantilla devuelve `{ subject, text, html }`.
- **Rationale**: los clientes de correo (Outlook incluido) soportan tablas y estilos en línea, no CSS moderno. Son ~10 plantillas con un mismo marco; una función basta y no suma dependencias ni paso de compilación.
- **Alternatives considered**: MJML (añade paquete y compilación para un marco que se escribe una vez); Handlebars o EJS (motor y plantillas en archivos aparte que complican el escapado y la paridad es/en, sin beneficio con 20 versiones); HTML escrito a mano en cada plantilla (duplica el marco diez veces).

## R2. Un solo armador del mensaje

- **Decision**: `buildMessage({ from, to, rendered })` devuelve las opciones de `sendMail` con `subject`, `text`, `html` y el adjunto del logo con `cid`. `MailProcessor`, `DeliveriesService` y `SmtpService.test` lo usan.
- **Rationale**: hoy los tres arman `{ from, to, subject, text }` por separado; un cambio (adjunto, cabecera) obligaría a tocar tres sitios (FR-011, SC-004).
- **Alternatives considered**: que `SmtpConfigService.transport()` devuelva un `send()` ya envuelto (mezcla configuración del servidor con el contenido y cambia una API que usa la 014); dejar los tres caminos (descartado por FR-011).

## R3. Logo incrustado

- **Decision**: adjuntar `logo-uts.png` con `cid`, leído una vez al arrancar. Copia sin modificar de `mobile/assets/brand/logo-uts.png` en `tutorias_uts_back/assets/brand/`. Respuesta a la clarificación del 2026-11-21.
- **Rationale**: la API aún no tiene despliegue ni dirección pública, y los clientes bloquean imágenes remotas. De los logos disponibles, `logo-uts.png` pesa 96 KB; los demás superan 380 KB y no convienen en un correo. Se usa sobre fondo blanco, donde el logo a color se ve bien.
- **Alternatives considered**: URL pública configurable (sin servidor público hoy, se vería roto); imagen en base64 dentro del HTML (infla el cuerpo y Gmail recorta por encima de ~100 KB); sin imagen (descartado por la clarificación).
- **Riesgo**: dos copias del logo (app y API). Si la UTS entrega el logo oficial nuevo (ver las decisiones de marca de `docs/Decisions.md`), hay que actualizar ambos; queda anotado en D-102.

## R4. Un correo por tipo de aviso sin migración

- **Decision**: el correo de aviso es `notice.{es,en}` con un marco por tipo (`OutboxEventType`): encabezado, color de acento, una frase de introducción y el título y cuerpo del aviso. El nombre del módulo y las fechas ya vienen dentro del cuerpo que escribe `notifications/templates` (única fuente, 014 FR-006).
- **Rationale**: `notifications` guarda `type`, `title` y `body`, no el contexto estructurado; el cuerpo ya contiene módulo, sesión y el dato nuevo (en los avisos de salón y de docente, solo el nuevo; el valor anterior no se guarda y queda fuera de alcance). Ese cuerpo ya termina con "Revisa el módulo en la app.", así que el marco no agrega frase de cierre. Re-leer el contexto al enviar o agregar una columna exigiría migración y duplicaría la lógica de fechas.
- **Alternatives considered**: columna `payload` en `notifications` para pintar una tabla "Antes / Ahora" (migración en `tutorias_uts_db` y segundo sitio que formatea fechas; se pospone hasta que se pida); volver a leer el contexto del evento al enviar (consultas extra y desfase si el módulo cambia entre aviso y envío).
- **Acentos por tipo (paleta de `Design.md`)**: cancelaciones → Error (`#B3261E`); reprogramada → Warning (`#FB8C00`, solo relleno, con texto `#132F20`); restauradas → Success (`#2BA640`, solo relleno); cambio de docente o salón → Primary (`#34531F`). El estado nunca va solo por color: cada encabezado lleva su texto.

## R5. Vigencia del código

- **Decision**: `IssuedCode` suma `expiresAt` (ya se calcula al guardar el código); `MailJob` lo lleva como cadena ISO; la plantilla lo muestra en hora de Bogotá ("vence a las 3:42 p. m." o con fecha si no es el mismo día).
- **Rationale**: la vigencia es configurable (`auth.verificationCodeTtlHours`, `auth.resetCodeTtlMinutes`); escribirla en el texto la haría mentir si el CAE la cambia.
- **Alternatives considered**: texto fijo "vence en 15 minutos" (miente si cambia la configuración); que la plantilla lea la configuración (acopla las plantillas a la base de datos y a `SettingsService`).
- **Privacidad**: el trabajo de correo ya se borra al completar o fallar (`removeOnComplete`, `removeOnFail`); no se agrega ningún registro con el código.

## R6. Marca en configuración

- **Decision**: tres variables de entorno con valor por defecto: `MAIL_BRAND_NAME` (por defecto "Institución Universitaria Tecnológica de Santander – UTS"), `MAIL_CONTACT_EMAIL` (opcional) y `MAIL_FOOTER_TEXT` (opcional). Se leen en `env.ts` como el resto de la configuración.
- **Rationale**: FR-006 y la constitución (III) piden que lo que varía entre ambientes no esté en el código. El nombre oficial tiene valor por defecto igual que `SMTP_FROM` ya lo tiene.
- **Alternatives considered**: tabla de ajustes del CAE (`SettingsService`): sobredimensionado, el CAE no necesita editarlos desde la app hoy; textos dentro de las plantillas (viola FR-006).

## R7. Pruebas diferidas de la 014

- **Decision**: las e2e de entrega por correo que la 014 dejó sin ejecutar (T052, T057, T062, T072) se corren y, si fallan por el cambio de formato, se ajustan; se agrega `mail-templates.e2e-spec.ts` que dispara los siete avisos y los dos códigos con un `MailTransport` falso. T078 (recorrido) se hace con Mailpit en `docker compose up`; T079 con `feature-done-check`.
- **Rationale**: la 014 se cerró con la entrega probada solo en unitarias; esta spec toca exactamente ese camino, así que es el momento de cerrarlas (FR-013 y FR-014).
- **Alternatives considered**: dejarlas para una spec aparte (el riesgo de un cambio de formato sin prueba de entrega es el que justifica esta spec).
- **Nota**: el push real en iPhone de T078 no depende de esta spec; se anota como pendiente de dispositivo, no de correo.

## R8. Compatibilidad entre clientes

- **Decision**: ancho 600 px, estilos en línea, fuentes `Arial, Helvetica, sans-serif`, degradado solo como mejora con color sólido de respaldo, sin CSS externo, texto alternativo en el logo, versión `text` completa. El detalle del diseño y de la accesibilidad está en R9. Se comprueba a mano en Mailpit (Gmail web y Outlook quedan como verificación manual cuando la UTS entregue su SMTP).
- **Rationale**: lo que renderiza igual en los clientes de uso común; la fuente corporativa Myriad Pro no se puede incrustar en correo.
- **Alternatives considered**: tipografía web (no la cargan los clientes principales); modo oscuro dedicado (bajo valor para esta entrega, y los clientes ya invierten colores).

## R9. Rediseño visual y accesibilidad (2026-11-21)

- **Decision**: tarjeta blanca de 16 px de radio con logo arriba, franja verde con insignia de texto, título en blanco y línea lima de 4 px; detalle del aviso en caja #F2F4EF con filo del color del tono; código en caja con borde tenue; pie con nombre oficial y contacto. Solo tema claro. Sigue `Design.md` y se registra en D-106.
- **Rationale**: el primer diseño era un marco plano. El verificador de Mailpit señaló `overflow`, estilos en `<body>`, el atajo `background` y `max-width`; se eliminaron los tres primeros y todo relleno lleva también `bgcolor`. El promedio sobre los 20 correos pasó de 88,8 % a 94,1 % de soporte y lo parcial de 10,0 % a 4,9 %. Lo que queda marcado es propio de cualquier correo (la etiqueta `<body>`, el pre-encabezado oculto, `max-width` en Outlook, el degradado con color de respaldo y `border-radius`).
- **Accesibilidad**: `lang`, un solo `h1`, tablas `presentation`, pre-encabezado, 12 px como mínimo y 16 px en el cuerpo, estado siempre con texto y contraste AA de todos los pares, comprobado por una prueba (`layout.spec.ts`). La insignia de éxito usa texto #132F20 sobre #2BA640 (4,6:1) porque el blanco da 3,2:1; la insignia de éxito de la app usa texto blanco y queda por revisar.
- **Alternatives considered**: el patrón de hojas, plumas y libros (el correo no tiene Iconify ni una imagen del patrón; no se agrega un archivo solo para eso); el logo con letras blancas sobre la franja (380 a 530 KB); un modo oscuro propio (los clientes ya invierten colores y se arriesga el contraste); botones o enlaces para abrir la app (la clarificación del 2026-11-21 los descartó).
