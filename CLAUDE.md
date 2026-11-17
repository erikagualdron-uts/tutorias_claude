# CLAUDE.md

Aplicación móvil (Android e iOS) de **tutorías académicas** de la Institución Universitaria Tecnológica de Santander (UTS). Las tutorías se llaman **módulos**. Tres roles: `SUPERADMIN` (CAE), `TEACHER` (docente) y `STUDENT` (estudiante).

## Documentación del proyecto

Lee estos archivos antes de proponer o escribir código:

- @docs/Context.md: qué hace la app, roles, reglas de negocio y dashboards.
- @docs/Architecture.md: stack, estructura, modelo de datos y flujos técnicos.
- @docs/Design.md: paleta UTS, componentes y patrones de pantalla.
- @docs/Conventions.md: estilo de código, Git, API, base de datos, app y pruebas.
- @docs/Decisions.md: registro de decisiones tomadas y su motivo. No propongas lo que ya se descartó ahí.

Si algo no está en estos archivos, **pregunta antes de decidir**. No inventes reglas de negocio.

## Stack

- **App:** React Native + Expo (TypeScript), Expo Router, TanStack Query, Zustand, i18next, socket.io-client.
- **Backend:** NestJS (TypeScript), PostgreSQL, Prisma, Socket.IO, BullMQ + Redis, Nodemailer.
- **Repositorios:** `tutorias_uts_mobile` (app), `tutorias_uts_back` (API), `tutorias_uts_db` (esquema Prisma, migraciones, seed y `docker-compose.yml`) y `Claude` (`docs/`, `specs/` y esta guía). En la documentación, `mobile/` y `backend/` significan la raíz de `tutorias_uts_mobile` y `tutorias_uts_back` (D-077).

## Comandos

> Verificar y ajustar estos comandos cuando el proyecto esté creado.

```bash
# Infraestructura local (PostgreSQL y Redis)
cd tutorias_uts_db && docker compose up -d

# Backend
cd tutorias_uts_back
npm run start:dev            # API en modo desarrollo
npm run test                 # pruebas
# Las migraciones se crean y aplican en tutorias_uts_db: npx prisma migrate dev

# App móvil
cd tutorias_uts_mobile
npx expo start               # servidor de desarrollo
npm run lint                 # lint
npm run typecheck            # verificación de tipos
```

## Reglas que nunca se rompen

**Negocio (siempre validadas en el backend, no solo en la app):**
- Solo el CAE crea módulos y define docente, salón y horario.
- Los módulos pertenecen a un **periodo académico** (semestre) y se repiten **semanalmente**. Se generan sesiones semanales; la inscripción es al módulo y los cambios o cancelaciones afectan una sesión.
- El cupo de un módulo es la capacidad de su salón. Al llenarse se bloquean las inscripciones. La inscripción usa transacción para evitar sobrecupo.
- Un estudiante no puede inscribirse a módulos que se crucen en horario. No hay límite de módulos.
- El estudiante cancela hasta **1 hora** antes. El docente cambia hora o cancela hasta **2 horas** antes.
- El CAE solo cambia el salón si la nueva capacidad es mayor o igual a los inscritos.
- Todo cambio o cancelación notifica a los estudiantes inscritos (push, correo y en la app).
- Estudiantes se registran con `@uts.edu.co`; docentes y administrativos usan `@correo.uts.edu.co`. Los docentes los crea el CAE con clave temporal.
- Los borrados son **lógicos** (`deletedAt`), nunca físicos.

**Técnicas:**
- Fechas en **UTC** en la base de datos; se muestran en `America/Bogota`.
- Los permisos se aplican con guards de roles en cada endpoint. Ocultar pantallas no es seguridad.
- Ningún texto visible va escrito en los componentes: todo en los archivos de traducción (español e inglés). El idioma sigue el del dispositivo.
- Los límites de horas y los dominios de correo viven en configuración, no en el código.
- Contraseñas y claves SMTP: nunca en el repositorio ni en los logs. La clave SMTP se guarda cifrada.
- La clave temporal de un docente se muestra una sola vez.

**Diseño:**
- Usa solo los colores de `Design.md`. No agregues colores nuevos sin marcarlos como derivados.
- El lima `#C3D730` nunca va como texto o ícono sobre blanco.
- Toda acción bloqueada muestra al usuario la regla que la bloquea.
- Objetivos táctiles de mínimo 48 px.
- **Íconos: solo Iconify** (`react-native-iconify`, set `solar`), declarados en el registro único `src/icons/`. Nunca otra librería de íconos.
- **Todo botón lleva ícono a la izquierda** (salvo enlaces de texto y botones solo de ícono). Entre botones apilados hay **16 px**.
- Estilo moderno y fluido: tarjetas con sombra suave, radios de 16 a 24 px, degradados de marca y animaciones cortas con Reanimated, respetando "reducir movimiento".
- Logo y recursos de la UTS desde `mobile/assets/brand/`, sin modificarlos.
- Tipografía corporativa **Myriad Pro** (Regular, Semibold, Bold) y Source Code Pro para código, solo mediante los tokens `fonts` del tema. Nunca escribir nombres de fuente ni `fontWeight` en componentes.
- Campos de texto siempre con relleno y borde tenue (nunca sin borde).
- Decoración solo con el patrón de hojas, plumas y libros (`BrandPattern`); nada de círculos o arcos geométricos. Única excepción: el anillo giratorio del `BrandLoader`, que es retroalimentación funcional y no decoración (D-080).
- Nombre oficial: **Institución Universitaria Tecnológica de Santander – UTS** (corto: UTS). Ya no se usa "Unidades Tecnológicas".

## Forma de trabajar

- Cambios pequeños y revisables: una funcionalidad por vez.
- Antes de crear algo grande, resume el plan y espera confirmación.
- Escribe pruebas para las reglas de negocio (cupo, cruces de horario, ventanas de cancelación, cambio de salón).
- Si cambias una decisión técnica o una regla de negocio, **actualiza el archivo de `docs/` correspondiente** en el mismo cambio, y registra la decisión en `docs/Decisions.md`.
- Commits en formato Conventional Commits (`feat(scope): description`). Una funcionalidad se considera terminada según la "Definición de terminado" de `docs/Conventions.md`.
- Responde en español. El código, los nombres de variables y los commits van en inglés.

## Flujo SDD (Spec Kit)

- Cada funcionalidad sigue el ciclo `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`.
- Las specs viven en `specs/NNN-nombre/`, una rama de Git por funcionalidad.
- En `/speckit-plan`, respeta `docs/Architecture.md` y `docs/Design.md`. Si el plan los contradice, se detiene y se pregunta.
- La constitución está en `.specify/memory/constitution.md`.

## Pendientes por definir

- Reglas de reprogramación: ¿se valida que la nueva hora no choque con otras tutorías de los estudiantes inscritos?, ¿se excluyen festivos? Ver `docs/Context.md`, sección 10. (Resuelto: el docente cambia la sesión y las futuras, D-069; el estudiante elige sesión o módulo, D-070.)
- Lugar de despliegue del backend y proveedor SMTP de la institución.
