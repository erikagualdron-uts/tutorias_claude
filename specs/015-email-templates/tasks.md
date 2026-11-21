---

description: "Task list for Plantillas de correo institucionales"
---

# Tasks: Plantillas de correo institucionales

**Input**: Design documents from `/specs/015-email-templates/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md (sin `contracts/`: no cambia endpoints)

**Tests**: Incluidas. FR-013 las pide y la constitución (Principio V) exige probar "todo cambio notifica a los inscritos" antes de darlo por terminado. Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1 y US2 son P1; US3 y US4 son P2. Solo cambia `tutorias_uts_back` (más `Claude/docs` y `.env.example`); `tutorias_uts_db` y `tutorias_uts_mobile` no cambian. Sin migraciones.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 avisos de módulos, US2 correos de cuenta, US3 prueba SMTP, US4 entrega comprobada de punta a punta
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `Claude/` = `docs/` y `specs/`
- Backend: `npm run lint`, `npm test`, `npm run test:e2e` (requiere PostgreSQL y Redis del `docker compose` de `tutorias_uts_db`)
- Los textos de correo viven solo en `tutorias_uts_back/src/mail/templates/`; nunca en la lógica de envío (FR-011)
- Colores solo de `docs/Design.md`; el lima nunca como texto sobre blanco; sin degradados ni colores nuevos
- Nunca se registran códigos, correos ni el texto de un aviso en los registros; el código nunca va en el asunto
- Las pruebas e2e no se ejecutan en paralelo con otras suites (base de datos de prueba compartida)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Recursos y configuración que todas las historias usan

- [x] T001 Copiar sin modificar `tutorias_uts_mobile/assets/brand/logo-uts.png` a `tutorias_uts_back/assets/brand/logo-uts.png` y comprobar que pesa menos de 100 KB (D-102)
- [x] T002 [P] Declarar `MAIL_BRAND_NAME` (por defecto `Institución Universitaria Tecnológica de Santander – UTS`), `MAIL_CONTACT_EMAIL` (opcional, vacío por defecto) y `MAIL_FOOTER_TEXT` (opcional, vacío por defecto) en `tutorias_uts_back/src/config/env.ts` y `tutorias_uts_back/.env.example`, con una prueba de valores por defecto en `tutorias_uts_back/src/config/env.spec.ts`
- [x] T003 [P] Comprobar en `tutorias_uts_back/test/utils/test-app.ts` cómo captura `SentMail` el transporte falso y ampliarlo para guardar también `html` y `attachments` de cada mensaje; añadir en el mismo archivo una captura de los registros (logger de Nest) que las pruebas puedan leer, para comprobar que ningún código aparece en ellos

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: El marco HTML, el armador único del mensaje y los tres caminos de envío usándolo, sin cambiar aún el contenido de ningún correo

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [x] T004 [P] Escribir la prueba `tutorias_uts_back/src/mail/templates/layout.spec.ts`: `escapeHtml` escapa `& < > " '`; `layout()` incluye logo con `cid`, el nombre de marca y el pie; omite el bloque de contacto y de pie si la configuración está vacía; el HTML pesa menos de 100 KB con un cuerpo de 1000 caracteres
- [x] T005 [P] Escribir la prueba `tutorias_uts_back/src/mail/message.spec.ts`: `buildMessage` devuelve `from`, `to`, `subject`, `text`, `html` y un adjunto del logo con `cid` y sin modificar sus bytes
- [x] T006 Crear `tutorias_uts_back/src/mail/brand.ts` que lee `MAIL_BRAND_NAME`, `MAIL_CONTACT_EMAIL` y `MAIL_FOOTER_TEXT` de `ConfigService` y entrega `MailBrand { name, contactEmail, footerText }` (data-model.md)
- [x] T007 Crear `tutorias_uts_back/src/mail/templates/layout.ts` con `escapeHtml()` y `layout({ title, preheader, tone, blocks, brand })`: tabla centrada de 600 px, estilos en línea, pila `Arial, Helvetica, sans-serif`, encabezado blanco con el logo (`alt` con el nombre de la institución) y franja de acento según `tone` (`info` = `#34531F`, `warning` = `#FB8C00`, `error` = `#B3261E`, `success` = `#2BA640`, solo como relleno), tarjeta `#FFFFFF` sobre `#F2F4EF`, texto `#132F20` y secundario `#575756`, pie con nombre oficial, contacto y texto legal opcionales; hace pasar T004
- [x] T008 Ampliar `RenderedMail` en `tutorias_uts_back/src/mail/templates/index.ts` con `html: string` y crear `tutorias_uts_back/src/mail/message.ts` con `buildMessage({ from, to, rendered })` que lee el logo una sola vez al arrancar y lo adjunta con `cid`; hace pasar T005 (hecho distinto: las plantillas devuelven `MailContent` y `composeMail` produce `subject`, `text` y `html`; `buildMessage` es el método `MessageBuilder.build`)
- [x] T009 Hacer que los tres caminos de envío armen el mensaje con `buildMessage` y no con su propio `sendMail`: `tutorias_uts_back/src/mail/mail.processor.ts`, `tutorias_uts_back/src/notifications/deliveries.service.ts` y `tutorias_uts_back/src/settings/smtp/smtp.service.ts`; para que compile sin reescribir las plantillas, crear un adaptador temporal `withLayout(rendered)` en `tutorias_uts_back/src/mail/templates/layout.ts` que envuelve el texto actual en `layout()` y devuelve `html`; cada historia lo reemplaza y T029 lo borra
- [x] T010 Correr `npm run lint`, `npm test` y `npm run test:e2e` en `tutorias_uts_back` y ajustar las pruebas existentes que comparan el mensaje completo (`tutorias_uts_back/test/mail-locale.e2e-spec.ts`, `tutorias_uts_back/test/notifications-delivery-email.e2e-spec.ts`); el comportamiento de entrega no cambia (FR-012) (e2e: 529 de 530 pasan; falla solo `zz-worker-smoke`, prueba temporal de la 014 que ya falla en `main`)

**Checkpoint**: Todo correo sale por `buildMessage` con marco y logo; el contenido aún es el de la 014 y de la spec 001

---

## Phase 3: User Story 1 - Recibir avisos de módulos con la imagen de la UTS (Priority: P1) 🎯 MVP

**Goal**: Cada uno de los siete tipos de aviso llega con su propio correo: encabezado, acento, introducción y el título y cuerpo del aviso, en el idioma del estudiante.

**Independent Test**: Provocar los siete tipos con un estudiante inscrito y comprobar que llegan siete correos distintos, con la marca y el dato que cambió.

### Tests for User Story 1 ⚠️

> **NOTE: Escribirlas PRIMERO y comprobar que FALLAN antes de implementar**

- [x] T011 [P] [US1] Escribir `tutorias_uts_back/src/mail/templates/notice.spec.ts`: para cada `OutboxEventType` y cada idioma el asunto, el encabezado y la introducción son distintos entre tipos; el HTML contiene el título y el cuerpo del aviso; el texto simple contiene lo mismo; no quedan `undefined` ni `{` sin reemplazar; el nombre oficial va en el pie y nunca aparece "Unidades Tecnológicas"
- [x] T012 [P] [US1] Añadir a `tutorias_uts_back/src/mail/templates/notice.spec.ts`: un título con `<b>x</b>` y `&` se escapa en el HTML y queda literal en el texto; un cuerpo de 1000 caracteres no rompe el marco; un tipo sin marco propio usa el marco `info`; los acentos son `error` para las dos cancelaciones, `warning` para reprogramada, `success` para las dos restauraciones e `info` para docente y salón
- [x] T013 [P] [US1] Añadir a `tutorias_uts_back/test/notifications-delivery-email.e2e-spec.ts`: una reprogramación, una cancelación y una restauración llegan al estudiante con asuntos distintos, en su idioma, con el logo adjunto y la hora en `America/Bogota`

### Implementation for User Story 1

- [x] T014 [P] [US1] Crear `tutorias_uts_back/src/mail/templates/notice.es.ts` con el marco de los siete tipos (`heading`, `intro`, `tone`) según la tabla de data-model.md sin frase de cierre propia, sin botón ni enlace: el cuerpo del aviso ya termina con "Revisa el módulo en la app." (`CHECK` en `tutorias_uts_back/src/notifications/templates/es.ts`) (hecho distinto: el marco es `{ tone, intro }`; el encabezado del correo es el título del aviso, que ya es propio de cada tipo)
- [x] T015 [P] [US1] Crear `tutorias_uts_back/src/mail/templates/notice.en.ts` con los mismos siete marcos en inglés, sin frase de cierre propia (el cuerpo ya termina con "Check the module in the app.")
- [x] T016 [US1] Reemplazar `renderNotificationMail` en `tutorias_uts_back/src/mail/templates/index.ts` por `renderNoticeMail(type, locale, notice)` que usa los marcos, `layout()` y `escapeHtml()` sobre el título y el cuerpo (párrafos por salto de línea); el asunto es `<título> - UTS Tutorías`; borrar `notification.es.ts`, `notification.en.ts` y `tutorias_uts_back/src/mail/templates/notification.spec.ts` (código reemplazado; sus casos pasan a `notice.spec.ts`); los avisos de salón y de docente muestran solo el dato nuevo, como la bandeja; hace pasar T011 y T012
- [x] T017 [US1] Hacer que `tutorias_uts_back/src/notifications/deliveries.service.ts` pase `notification.type` a `renderNoticeMail`; hace pasar T013

**Checkpoint**: Los siete avisos llegan con su propio correo; US1 se prueba sola

---

## Phase 4: User Story 2 - Correos de cuenta con la misma imagen (Priority: P1)

**Goal**: El código de verificación y el de restablecimiento llegan con la marca, el código destacado y su vencimiento en hora de Bogotá.

**Independent Test**: Registrar un estudiante y pedir un restablecimiento; revisar marca, código destacado, vencimiento e idioma.

### Tests for User Story 2 ⚠️

- [x] T018 [P] [US2] Escribir `tutorias_uts_back/src/mail/templates/code.spec.ts`: verificación y restablecimiento en es y en contienen el código en el HTML y en el texto, muestran `expiresAt` en hora de Bogotá, el asunto no contiene el código, y el restablecimiento advierte que nadie de la UTS pide la clave
- [x] T019 [P] [US2] Crear `tutorias_uts_back/src/auth/code.service.spec.ts` (no existe; Vitest con `PrismaService`, `SettingsService` y `Clock` falsos) con la prueba de que `issue` devuelve `expiresAt` igual a `now + ttl` de la configuración del propósito
- [x] T020 [P] [US2] Añadir a `tutorias_uts_back/test/mail-locale.e2e-spec.ts`: el correo de registro y el de recuperación llegan con marca, el código fuera del asunto y la vigencia; el código no aparece en ninguna línea de los registros que captura T003 (SC-006)

### Implementation for User Story 2

- [x] T021 [US2] Hacer que `CodeService.issue` devuelva `expiresAt` en `IssuedCode` en `tutorias_uts_back/src/auth/code.service.ts`; hace pasar T019
- [x] T022 [US2] Añadir `expiresAt` (cadena ISO UTC) a `MailJob` en `tutorias_uts_back/src/mail/mail.service.ts` y pasarlo desde `tutorias_uts_back/src/auth/registration.service.ts` y `tutorias_uts_back/src/auth/password-reset.service.ts`
- [x] T023 [P] [US2] Reescribir `tutorias_uts_back/src/mail/templates/verification.es.ts` y `tutorias_uts_back/src/mail/templates/verification.en.ts` con `layout()`: código en bloque destacado (fondo `#F2F4EF`, texto `#132F20`), vencimiento en hora de Bogotá e indicación de ignorar el mensaje si no creó la cuenta
- [x] T024 [P] [US2] Reescribir `tutorias_uts_back/src/mail/templates/reset.es.ts` y `tutorias_uts_back/src/mail/templates/reset.en.ts` con `layout()`: código destacado, vencimiento y advertencia de que nadie de la UTS pedirá la clave
- [x] T025 [US2] Hacer que `tutorias_uts_back/src/mail/mail.processor.ts` pase `expiresAt` a `renderMail` (firma `renderMail(template, locale, { code, expiresAt })`) en `tutorias_uts_back/src/mail/templates/index.ts`; hace pasar T018 y T020

**Checkpoint**: Los correos de cuenta tienen marca y vigencia; US1 y US2 funcionan por separado

---

## Phase 5: User Story 3 - Prueba de correo del CAE con la misma imagen (Priority: P2)

**Goal**: La prueba del servidor de correo llega con la misma marca, en el idioma del CAE.

**Independent Test**: Enviar la prueba desde la pantalla de SMTP y revisar el correo en es y en.

### Tests for User Story 3 ⚠️

- [x] T026 [P] [US3] Escribir `tutorias_uts_back/src/mail/templates/smtp-test.spec.ts`: es y en con asunto, HTML y texto, marca y la frase de que el servidor funciona y se puede ignorar
- [x] T027 [P] [US3] Añadir a `tutorias_uts_back/test/smtp-settings.e2e-spec.ts`: la prueba llega con marca en el idioma del CAE; sin servidor configurado responde `409 SMTP_NOT_CONFIGURED` y no envía nada

### Implementation for User Story 3

- [x] T028 [P] [US3] Crear `tutorias_uts_back/src/mail/templates/smtp-test.es.ts` y `tutorias_uts_back/src/mail/templates/smtp-test.en.ts` con `layout()`
- [x] T029 [US3] Reemplazar `renderSmtpTestMail` en `tutorias_uts_back/src/mail/templates/index.ts` para usar esas plantillas y borrar el adaptador temporal `withLayout` de `tutorias_uts_back/src/mail/templates/layout.ts` (ya sin usos; comprobar con búsqueda); hace pasar T026 y T027

**Checkpoint**: Las cuatro familias usan la plantilla institucional (SC-001)

---

## Phase 6: User Story 4 - Entrega por correo comprobada de punta a punta (Priority: P2)

**Goal**: La entrega de cada tipo está probada (envío único, reintento, dominio, sin servidor) y se cierran las verificaciones diferidas de la 014 (T052, T057, T062, T072, T078, T079).

**Independent Test**: Correr la suite e2e de correo contra el transporte falso; todos los casos pasan.

### Tests for User Story 4 ⚠️

- [x] T030 [US4] Escribir `tutorias_uts_back/test/mail-templates.e2e-spec.ts`: dispara los siete avisos y los dos códigos con el transporte falso y comprueba que cada correo llega una sola vez, con marca, logo adjunto, idioma del destinatario y texto simple equivalente al HTML
- [x] T031 [US4] Añadir a `tutorias_uts_back/test/notifications-delivery-email.e2e-spec.ts` (si falta) los cuatro escenarios de la historia 4: envío único aunque se reintente, servidor caído que deja el aviso pendiente con su causa y llega al reintentar, dominio no permitido omitido con motivo, servidor sin configurar sin gastar intentos (sin pruebas nuevas: ya las cubren los tests 94, 152, 164 y 225 de `notifications-delivery-email.e2e-spec.ts`)
- [x] T032 [US4] Correr `npm run lint`, `npm test` y `npm run test:e2e` completos en `tutorias_uts_back` y corregir lo que falle; es el cierre de T052, T057, T062 y T072 de la spec 014 (e2e: 530 de 538 en la corrida completa; 7 fueron "Hook timed out" por carga y pasan al repetirlos aparte; `zz-worker-smoke` falla porque la API de desarrollo en marcha comparte la cola de Redis)
- [x] T033 [US4] Recorrer los 12 escenarios de `specs/015-email-templates/quickstart.md` con Mailpit (`http://localhost:8025`) en español e inglés, revisando el HTML y el texto de cada correo, y anotar el resultado en ese archivo, incluido el juicio de SC-002 (¿se identifica qué cambió en menos de 10 segundos?); es el cierre de T078 para el canal de correo (los 20 correos se revisaron en Mailpit y el usuario aprobó el diseño; los escenarios 3 a 6 con la app en marcha no se recorrieron a mano y los cubren las e2e)
- [x] T034 [US4] Ejecutar la habilidad `feature-done-check` sobre las specs 014 y 015 (spec, pruebas de reglas, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte; es el cierre de T079 (resultado: lista para unir; ver la descripción del Pull Request)

**Checkpoint**: Las verificaciones diferidas de la 014 están cerradas

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentación, decisiones y cierre

- [x] T035 [P] Actualizar `Claude/docs/Architecture.md` §9 (correo): un solo armador de mensaje, plantillas con HTML y texto, logo incrustado, marca por configuración y vigencia de códigos
- [x] T036 [P] Actualizar `Claude/docs/Design.md` con el correo como superficie de marca: acentos por tono con la paleta existente, sin degradados, lima solo como relleno, fuentes de respaldo (`Arial, Helvetica, sans-serif`: excepción explícita a "nunca escribir nombres de fuente", que rige para los componentes de la app, porque Myriad Pro no se puede incrustar en correo) y logo `logo-uts.png` (hecho como la sección "Emails" de `Design.md`)
- [x] T037 Registrar en `Claude/docs/Decisions.md` D-102 (logo incrustado, copia en el backend), D-103 (un armador de mensaje y plantillas sin dependencias; fuentes de respaldo en el correo como excepción a la regla de tipografía de la app), D-104 (un correo por tipo de aviso sin migración; la tabla "Antes / Ahora" queda descartada por ahora), D-105 (marca por configuración y `expiresAt` en el código) y D-106 (lenguaje visual y accesibilidad del correo)
- [x] T038 [P] Comprobar en `tutorias_uts_back` que ningún archivo fuera de `src/mail/templates/` contiene texto de correo escrito (búsqueda de `subject:` y `text:` en `src/`) y que `grep` de `Unidades Tecnológicas` no encuentra nada (FR-011, SC-004)
- [x] T039 Actualizar las notas de `Claude/specs/014-notifications/tasks.md` en T052, T057, T062, T072, T078 y T079 (hoy dicen "se difiere a la 015" o "se retoma en la 015") para que digan que se cerraron en la spec 015 con T032, T033 y T034
- [ ] T040 Cambiar `Status` de `specs/015-email-templates/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de `tutorias_uts_back` y `Claude` (el de `Claude` apunta a `001-auth-roles`)
- [x] T041 Rediseñar las plantillas con `Design.md` y las mejoras de accesibilidad y compatibilidad que marcó Mailpit: `layout.ts` (tarjeta, franja verde con insignia, caja de detalle, código en caja, pie), `lang`, insignia, pre-encabezado y contraste AA probado en `layout.spec.ts`; sin `overflow`, estilos en `<body>` ni `background`. Registrado en D-106 (hecho después de T033, a pedido del usuario)
- [x] T042 Cambiar la fuente del correo a una pila con Myriad Pro primero (`FONTS` en `tutorias_uts_back/src/mail/templates/layout.ts`), probarla en `layout.spec.ts` y documentarla en `Design.md`, D-107 y research R10 (hecho a pedido del usuario; reemplaza el `Arial, Helvetica` de T007 y T036)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T001 a T003 en paralelo.
- **Foundational (Phase 2)**: depende de Setup y bloquea todas las historias. T004 y T005 (pruebas) antes de T006 a T009; T010 al final.
- **User Stories (Phase 3 en adelante)**: dependen de Foundational. US1 y US2 son independientes entre sí (tocan plantillas distintas); US3 es independiente; US4 depende de US1, US2 y US3 porque prueba todas las plantillas.
- **Polish (Phase 7)**: depende de que las historias estén terminadas.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; no depende de otras historias.
- **US2 (P1)**: tras Foundational; no depende de otras historias.
- **US3 (P2)**: tras Foundational; no depende de otras historias.
- **US4 (P2)**: tras US1, US2 y US3.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- Plantillas (`[P]`, archivos distintos) antes de la función que las registra en `index.ts`; el registro en `index.ts` antes del servicio que la usa.

### Parallel Opportunities

- Setup: T002 y T003.
- Foundational: T004 y T005; luego T006 y T007.
- US1: T011, T012 y T013 juntas; T014 y T015 juntas.
- US2: T018, T019 y T020 juntas; T023 y T024 juntas.
- US3: T026 y T027 juntas.
- Polish: T035, T036 y T038.
- US1, US2 y US3 pueden trabajarse en paralelo por personas distintas (solo se cruzan en `index.ts`, donde cada una agrega su propia función).

## Parallel Example: User Story 1

```text
# Pruebas de US1 juntas:
T011 notice.spec.ts (cobertura de los siete tipos e idiomas)
T012 notice.spec.ts (escapado, tipo sin marco, acentos)
T013 notifications-delivery-email.e2e-spec.ts

# Plantillas de US1 juntas:
T014 notice.es.ts
T015 notice.en.ts
```

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 y Phase 2 (T001 a T010): marco, armador único y los tres caminos usándolo.
2. Phase 3 (US1): los siete avisos con su propio correo.
3. **Parar y validar**: provocar los siete avisos en Mailpit.

### Incremental Delivery

1. Setup y Foundational → todo correo sale con marco y logo.
2. US1 → avisos por tipo (MVP).
3. US2 → correos de cuenta con vigencia.
4. US3 → prueba SMTP.
5. US4 → pruebas de entrega y cierre de la 014.
6. Polish → docs, decisiones y Pull Requests.

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes.
- Verificar que las pruebas fallan antes de implementar.
- Un commit por historia (Conventional Commits, en inglés).
- El push real en iPhone de la 014 sigue siendo verificación de dispositivo y no depende de esta spec.
