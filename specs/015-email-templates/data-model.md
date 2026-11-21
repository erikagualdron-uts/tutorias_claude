# Data Model: Plantillas de correo institucionales

**Sin cambios en la base de datos**: no hay tablas, columnas ni migraciones nuevas. Lo que cambia son tipos y configuración dentro de `tutorias_uts_back`.

## Tipos internos

### RenderedMail (modificado)

El correo ya renderizado que producen todas las plantillas.

| Campo | Tipo | Notas |
|---|---|---|
| `subject` | texto | Sin el código ni datos personales; termina en el nombre corto de la app. |
| `text` | texto | Versión en texto simple, con el mismo contenido que el HTML (FR-004). |
| `html` | texto | Nuevo. Marco con logo, tarjeta y pie; todo valor de usuario escapado (FR-010). |

### MailJob (modificado)

El trabajo de la cola `mail` (códigos de cuenta).

| Campo | Tipo | Notas |
|---|---|---|
| `to` | texto | Sin cambios. |
| `template` | `verification` \| `reset` | Sin cambios. |
| `locale` | `es` \| `en` | Sin cambios. |
| `code` | texto de 6 dígitos | Sin cambios; el trabajo se borra al terminar. |
| `expiresAt` | texto ISO (UTC) | Nuevo. Vence el código; se muestra en Bogotá. |

### IssuedCode (modificado)

Lo que devuelve `CodeService.issue`: `code`, `resendAvailableAt` y **`expiresAt`** (nuevo, ya calculado al guardar el código).

### MailBrand (nuevo)

Datos de marca leídos de la configuración en cada envío; ninguno está escrito en las plantillas.

| Campo | Origen | Por defecto |
|---|---|---|
| `name` | `MAIL_BRAND_NAME` | Institución Universitaria Tecnológica de Santander – UTS |
| `contactEmail` | `MAIL_CONTACT_EMAIL` | vacío: el bloque de contacto no se muestra |
| `footerText` | `MAIL_FOOTER_TEXT` | vacío: el pie no agrega texto legal |

### Marco del aviso por tipo

Para cada `OutboxEventType`, una definición por idioma con `heading`, `intro` y `tone` (`info`, `warning`, `error`, `success`). El `tone` fija el acento con la paleta de `Design.md`.

| Tipo de evento | Tono | Acento |
|---|---|---|
| `MODULE_TEACHER_CHANGED` | info | Primary |
| `MODULE_ROOM_CHANGED` | info | Primary |
| `SESSIONS_CANCELLED_HOLIDAY` | error | Error |
| `SESSIONS_RESTORED_HOLIDAY` | success | Success |
| `SESSION_RESCHEDULED` | warning | Warning |
| `SESSION_CANCELLED_TEACHER` | error | Error |
| `SESSION_RESTORED_TEACHER` | success | Success |

Un tipo sin marco propio usa el marco `info` general: el aviso nunca se pierde (borde del spec).

## Configuración nueva

| Variable | Obligatoria | Ejemplo |
|---|---|---|
| `MAIL_BRAND_NAME` | No | `Institución Universitaria Tecnológica de Santander – UTS` |
| `MAIL_CONTACT_EMAIL` | No | `cae@uts.edu.co` |
| `MAIL_FOOTER_TEXT` | No | `Este mensaje es automático; no lo respondas.` |

Se declaran en `.env.example` y se leen en `src/config/env.ts`. Los dominios de correo permitidos siguen en `SettingsService` (`auth.studentEmailDomain`), sin tocar.

## Archivo estático

`tutorias_uts_back/assets/brand/logo-uts.png`: copia sin modificar de `tutorias_uts_mobile/assets/brand/logo-uts.png`. Se lee una vez al arrancar y se adjunta con `cid` a cada correo.
