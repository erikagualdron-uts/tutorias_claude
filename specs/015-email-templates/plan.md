# Implementation Plan: Plantillas de correo institucionales

**Branch**: `015-email-templates` | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/015-email-templates/spec.md`

## Summary

La API envía hoy cuatro familias de correo en texto plano (verificación, restablecimiento, aviso de módulo y prueba SMTP) por **tres caminos distintos** (`MailProcessor`, `DeliveriesService` y `SmtpService.test`), cada uno armando su `sendMail`. Esta spec deja un único lugar que genera el correo (asunto, HTML y texto) y un único armador del mensaje que usan los tres caminos.

Enfoque técnico (detalle en [research.md](research.md)):

- **Sin dependencias nuevas**: una función `layout()` de tablas con estilos en línea (lo que soportan los clientes de correo) y un `escapeHtml()` propio. Nada de MJML ni motores de plantillas.
- **Un armador de mensaje** (`buildMessage`) que recibe el correo renderizado y devuelve las opciones de Nodemailer con HTML, texto y el logo incrustado (`cid`). Los tres caminos de envío lo llaman.
- **Siete correos de aviso** (uno por tipo) con encabezado, color de acento e introducción propios, que enmarcan el título y el cuerpo que ya produce `notifications/templates` (única fuente del texto del aviso, 014 FR-006). **Sin migración**: el aviso no guarda datos estructurados y no hace falta.
- **Vigencia del código** en los correos de cuenta: `CodeService.issue` devuelve `expiresAt` y el trabajo de correo lo lleva; la plantilla lo muestra en hora de Bogotá.
- **Marca por configuración**: nombre mostrado, correo de contacto y pie legal salen de variables de entorno con valor por defecto; el logo es un archivo copiado sin modificar a `tutorias_uts_back/assets/brand/`.
- **Pruebas**: unitarias de todas las plantillas en ambos idiomas, y las e2e de entrega por correo diferidas de la 014 (T052, T057, T062, T072) más el recorrido (T078) con Mailpit y `feature-done-check` (T079).

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior), NestJS 12.

**Primary Dependencies**: Nodemailer 10, BullMQ 6 y `@nestjs/config` (presentes). **Ninguna dependencia nueva.** La app móvil no cambia.

**Storage**: Sin cambios en PostgreSQL ni en Prisma. Sin migraciones. Un archivo de logo estático en el repo del backend.

**Testing**: Vitest. Unitarias de plantillas (ambos idiomas, escapado, texto simple equivalente, código fuera del asunto) y e2e con `MailTransport` falso sobre PostgreSQL de prueba; verificación visual manual con Mailpit (ya en `tutorias_uts_db/docker-compose.yml`).

**Target Platform**: API HTTPS en Node.js; el correo lo leen clientes de escritorio, web y móviles (Gmail, Outlook, Apple Mail).

**Project Type**: web-service. Toca `tutorias_uts_back`; `Claude` (docs) y `.env.example`. `tutorias_uts_db` y `tutorias_uts_mobile` no cambian.

**Performance Goals**: sin metas nuevas; el armado del correo es síntesis de texto en memoria y no cambia los tiempos de entrega de la 014 (SC-001 y SC-006 de esa spec).

**Constraints**: solo la paleta de `Design.md` (lima nunca como texto sobre blanco; sin degradados porque muchos clientes no los muestran, se usa el Primary sólido); fuentes de respaldo seguras para correo (el nombre de fuente corporativa no se escribe en componentes de la app, pero en correo se usa una pila genérica sin `Myriad Pro`); HTML por debajo de ~100 KB para que Gmail no lo recorte; logo `logo-uts.png` (≈ 94 KB) sin modificar; el código nunca en asunto ni en registros; textos solo en las plantillas de correo (es/en); fechas en `America/Bogota`; entrega, reintentos y estados de la 014 intactos.

**Scale/Scope**: una institución; decenas de correos por día. 4 familias, 10 plantillas lógicas (verificación, restablecimiento, prueba y 7 avisos) × 2 idiomas = 20 versiones.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Design.md` (paleta, nombre oficial, logo sin modificar) y `Architecture.md` §9. Se actualizan `Architecture.md` (correo), `Design.md` (correo como superficie) y `Decisions.md` (D-101 a D-104) en el mismo cambio. |
| II. Reglas de negocio en backend | No cambia ninguna regla; el aviso a los inscritos y los destinatarios los sigue resolviendo el servidor. Reglas de dominio de correo intactas. |
| III. Integridad de datos | Fechas en UTC y texto en `America/Bogota` en las plantillas. Dominios y datos de marca en configuración, no en el código (FR-006 y FR-007). Sin borrado ni tablas nuevas. |
| IV. Seguridad y privacidad | El código no va en asunto ni en registros (sin `logger` que reciba el trabajo); contenido de usuario escapado (FR-010); la clave SMTP sigue cifrada; ningún secreto en el repo. |
| V. Pruebas primero en lo crítico | La regla "todo cambio notifica por correo" se prueba de punta a punta con las e2e diferidas de la 014; se agregan pruebas de plantillas antes de implementar. |
| VI. Internacionalización | Cada correo en es y en; paridad comprobada por prueba. El idioma sale del usuario, con español de respaldo. |
| VII. Diseño consistente | Solo colores de la paleta; el lima solo como relleno, nunca texto sobre blanco; nombre oficial en el pie. Sin colores nuevos. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/015-email-templates/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: la feature no agrega ni cambia endpoints. La única interfaz nueva es interna (el correo renderizado) y se describe en `data-model.md`.

### Source Code

```text
tutorias_uts_back/
├── assets/brand/logo-uts.png                 # copia sin modificar de mobile/assets/brand/ (D-101)
├── src/mail/
│   ├── message.ts                            # buildMessage(): from, to, subject, text, html, cid del logo
│   ├── mail.service.ts                       # MailJob + expiresAt
│   ├── mail.processor.ts                     # usa renderMail + buildMessage (sin armar sendMail aparte)
│   ├── brand.ts                              # lee nombre, contacto y pie de la configuración
│   └── templates/
│       ├── layout.ts                         # layout(): encabezado con logo, tarjeta, pie; escapeHtml()
│       ├── index.ts                          # renderMail por familia/tipo e idioma (RenderedMail con html)
│       ├── verification.{es,en}.ts           # código destacado + vigencia
│       ├── reset.{es,en}.ts
│       ├── notice.{es,en}.ts                 # un marco por tipo de aviso: encabezado, acento, introducción
│       ├── smtp-test.{es,en}.ts
│       └── templates.spec.ts                 # los 20 correos: sin marcadores, escapado, texto equivalente
├── src/auth/code.service.ts                  # IssuedCode + expiresAt
├── src/auth/{registration,password-reset}.service.ts   # pasan expiresAt al trabajo de correo
├── src/notifications/deliveries.service.ts   # usa buildMessage con el aviso (type, module)
├── src/settings/smtp/smtp.service.ts         # la prueba usa buildMessage
├── src/config/env.ts                         # MAIL_BRAND_NAME, MAIL_CONTACT_EMAIL, MAIL_FOOTER_TEXT
├── .env.example                              # nuevas variables con valores de ejemplo
└── test/
    ├── notifications-delivery-email.e2e-spec.ts   # diferidas de 014: envío único, reintento, dominio, sin SMTP
    └── mail-templates.e2e-spec.ts                 # los siete avisos y los códigos llegan con marca e idioma

Claude/docs/
├── Architecture.md                           # §9 correo: un armador, plantillas con HTML y logo incrustado
├── Design.md                                 # correo como superficie de marca
└── Decisions.md                              # D-101 a D-104
```

**Structure Decision**: todo vive en el módulo `mail` existente; las tres rutas de envío dejan de armar su propio `sendMail` y llaman a `buildMessage`. `notifications/templates` sigue siendo la única fuente del texto del aviso; el correo solo lo enmarca.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
