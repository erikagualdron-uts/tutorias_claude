# CLAUDE.md

Aplicación móvil (Android e iOS) de **tutorías académicas** de las Unidades Tecnológicas de Santander (UTS). Las tutorías se llaman **módulos**. Tres roles: `SUPERADMIN` (CAE), `TEACHER` (docente) y `STUDENT` (estudiante).

## Documentación del proyecto

Lee estos archivos antes de proponer o escribir código:

- @docs/Context.md: qué hace la app, roles, reglas de negocio y dashboards.
- @docs/Architecture.md: stack, estructura, modelo de datos y flujos técnicos.
- @docs/Design.md: paleta UTS, componentes y patrones de pantalla.

Si algo no está en estos archivos, **pregunta antes de decidir**. No inventes reglas de negocio.

## Stack

- **App:** React Native + Expo (TypeScript), Expo Router, TanStack Query, Zustand, i18next, socket.io-client.
- **Backend:** NestJS (TypeScript), PostgreSQL, Prisma, Socket.IO, BullMQ + Redis, Nodemailer.
- **Carpetas:** `mobile/` (app), `backend/` (API), `docs/` (documentación).

## Comandos

> Verificar y ajustar estos comandos cuando el proyecto esté creado.

```bash
# Infraestructura local (PostgreSQL y Redis)
docker compose up -d

# Backend
cd backend
npm run start:dev            # API en modo desarrollo
npm run test                 # pruebas
npx prisma migrate dev       # aplicar migraciones

# App móvil
cd mobile
npx expo start               # servidor de desarrollo
npm run lint                 # lint
npm run typecheck            # verificación de tipos
```

## Reglas que nunca se rompen

**Negocio (siempre validadas en el backend, no solo en la app):**
- Solo el CAE crea módulos y define docente, salón y horario.
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

## Forma de trabajar

- Cambios pequeños y revisables: una funcionalidad por vez.
- Antes de crear algo grande, resume el plan y espera confirmación.
- Escribe pruebas para las reglas de negocio (cupo, cruces de horario, ventanas de cancelación, cambio de salón).
- Si cambias una decisión técnica o una regla de negocio, **actualiza el archivo de `docs/` correspondiente** en el mismo cambio.
- Responde en español. El código, los nombres de variables y los commits van en inglés.

## Pendientes por definir

- ¿Las tutorías son recurrentes semanalmente o sesiones únicas? (afecta `ModuleSession`)
- Lugar de despliegue del backend y proveedor SMTP de la institución.
- Archivos de documentación por crear: `Conventions.md` (estilo de código, commits, pruebas) y `Decisions.md` (registro de decisiones). Cuando existan, enlázalos aquí.
