<!--
Sync Impact Report (temporal; eliminar antes del commit)
- Version change: (plantilla sin completar) → 1.0.0
- Principios modificados: ninguno (primera adopción)
- Principios agregados: I–IX (Fuente de verdad, Reglas en backend, Datos, Seguridad y
  privacidad, Pruebas primero, i18n, Diseño, Desarrollo incremental, Idioma)
- Secciones agregadas: Restricciones técnicas, Flujo de desarrollo, Gobernanza
- Secciones eliminadas: ninguna
- TODOs diferidos: ninguno. RATIFICATION_DATE = fecha de esta primera adopción.
- Pendientes ya registrados en docs/ (no son de la constitución): tutorías recurrentes o
  únicas, despliegue del backend, proveedor SMTP.
-->
# UTS Tutorías Constitution

## Core Principles

### I. Fuente de verdad en docs/
Los archivos `docs/Context.md`, `docs/Architecture.md` y `docs/Design.md` definen las reglas de
negocio, la arquitectura y el diseño. Toda spec, plan y tarea MUST respetarlos. Si algo falta o
se contradice en `docs/`, MUST preguntarse antes de decidir; no se inventan reglas de negocio.
Si una decisión técnica o regla cambia, el archivo de `docs/` correspondiente MUST actualizarse
en el mismo cambio.

### II. Reglas de negocio validadas en el backend (NON-NEGOTIABLE)
Las siguientes reglas MUST validarse en el backend; la app móvil nunca es la única barrera:
- El cupo de un módulo es la capacidad de su salón; la inscripción usa transacción para evitar
  sobrecupo y al llenarse se bloquean nuevas inscripciones.
- No hay cruces de horario del estudiante, del docente ni del salón.
- El estudiante cancela hasta 1 hora antes; el docente cambia la hora o cancela hasta 2 horas
  antes.
- El cambio de salón solo es válido si la nueva capacidad es mayor o igual a los inscritos.
- Todo cambio o cancelación notifica a los estudiantes inscritos (push, correo y en la app).
- Solo el CAE crea módulos y define docente, salón y horario.

### III. Integridad de datos
- El borrado es siempre lógico (`deletedAt`); nunca físico, y las consultas MUST filtrarlo.
- Las fechas se guardan en UTC y se muestran en `America/Bogota`.
- Retención de chats: 6 meses los de módulo y 2 años los individuales.
- Los límites de horas y los dominios de correo MUST vivir en configuración, no como valores
  fijos en el código.

### IV. Seguridad y privacidad
- Los permisos MUST aplicarse con guards de roles en cada endpoint; ocultar pantallas no es
  seguridad.
- Los estudiantes se registran solo con `@uts.edu.co`; docentes y administrativos usan
  `@correo.uts.edu.co`.
- Contraseñas, claves y secretos NEVER van en el repositorio ni en los logs.
- La clave SMTP se guarda cifrada.
- La clave temporal de un docente se muestra una sola vez.

### V. Pruebas primero en lo crítico (NON-NEGOTIABLE)
Las reglas del Principio II (cupo, cruces de horario, ventanas de cancelación, cambio de salón,
notificación a inscritos) MUST tener pruebas automatizadas antes de darse por terminadas. Una
funcionalidad que toque estas reglas no se considera completa sin esas pruebas pasando.

### VI. Internacionalización
Ningún texto visible MUST escribirse en los componentes: todo va en archivos de traducción en
español e inglés. El idioma sigue el del dispositivo; si no es español ni inglés, se usa español.

### VII. Diseño consistente
- Solo se usan la paleta y los componentes de `docs/Design.md`; un color nuevo MUST marcarse como
  derivado.
- Los objetivos táctiles miden mínimo 48 px.
- Toda acción bloqueada MUST mostrar al usuario la regla que la bloquea.
- El lima `#C3D730` NEVER va como texto o ícono sobre fondo claro.

### VIII. Desarrollo incremental
Se trabaja una funcionalidad por rama y por ciclo specify → plan → tasks → implement, con
cambios pequeños y revisables. Antes de crear algo grande se resume el plan y se espera
confirmación.

### IX. Idioma
La documentación y la comunicación van en español. El código, los nombres de variables y los
commits van en inglés.

## Restricciones técnicas

- **App:** React Native + Expo (TypeScript), Expo Router, TanStack Query, Zustand, i18next,
  socket.io-client.
- **Backend:** NestJS (TypeScript), PostgreSQL, Prisma, Socket.IO, BullMQ + Redis, Nodemailer.
- **Estructura:** `mobile/` (app), `backend/` (API), `docs/` (documentación).
- Cambiar el stack es una decisión técnica y sigue el Principio I.

## Flujo de desarrollo

- Cada funcionalidad nace de una spec y avanza por plan, tareas e implementación.
- Cada plan MUST incluir una verificación de cumplimiento de esta constitución; toda violación
  se justifica por escrito o se corrige.
- Una revisión de cambios MUST verificar los principios II, V, VI y VII cuando apliquen.

## Governance

Esta constitución prevalece sobre otras prácticas del proyecto y solo se modifica con una
decisión explícita registrada en `docs/`. Toda enmienda MUST documentar el motivo, actualizar
la versión y las fechas, y revisar que los archivos de `docs/` sigan siendo coherentes.

**Versionado (semántico):** MAJOR para eliminar o redefinir principios de forma incompatible;
MINOR para agregar un principio o ampliar materialmente una guía; PATCH para aclaraciones y
correcciones de redacción.

**Cumplimiento:** cada revisión de plan o cambio verifica el cumplimiento; la guía operativa
diaria vive en `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2026-11-16 | **Last Amended**: 2026-11-16
