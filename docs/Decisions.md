# Decisions.md

> Registro de decisiones importantes del proyecto y su motivo. Sirve para que nadie (humano o IA) vuelva a proponer lo que ya se descartó.

## Cómo usar este archivo

- Cada decisión tiene un identificador (`D-001`, `D-002`…), nunca se reutiliza.
- **Estado:** `Aceptada`, `Supuesto` (se asume mientras no se confirme) o `Reemplazada por D-0XX`.
- Las decisiones no se borran: si cambian, se agrega una nueva y la anterior pasa a `Reemplazada`.
- Formato: **Decisión** (qué), **Motivo** (por qué), **Alternativas descartadas** (si aplica).

---

## Producto

### D-001 · Una sola aplicación para los tres roles
- **Estado:** Aceptada
- **Decisión:** Una app móvil única; al iniciar sesión, la navegación cambia según el rol (SUPERADMIN, TEACHER, STUDENT).
- **Motivo:** Una sola base de código es más fácil de mantener, probar y publicar.
- **Descartado:** Tres apps separadas.

### D-002 · Los módulos son recurrentes semanalmente por periodo académico
- **Estado:** Aceptada
- **Decisión:** Cada módulo pertenece a un periodo académico (semestre) y se repite cada semana en su día y hora. El sistema genera una sesión por semana.
- **Motivo:** Así funcionan las tutorías en la institución; permite cancelar o reprogramar una sesión sin afectar las demás.
- **Descartado:** Sesiones únicas con fecha específica.

### D-003 · Solo el CAE crea módulos y define su horario
- **Estado:** Aceptada
- **Decisión:** El CAE define docente, salón y horario. El docente puede cambiar la hora de una sesión o cancelarla, pero no crear módulos.
- **Motivo:** Control centralizado de salones y cupos.

### D-004 · El cupo es la capacidad del salón
- **Estado:** Aceptada
- **Decisión:** El cupo máximo de un módulo se calcula automáticamente a partir de la capacidad del salón y se bloquea la inscripción al llenarse.
- **Motivo:** Evitar sobrecupo sin configuración manual.

### D-005 · Sin cruces de horario para el estudiante
- **Estado:** Aceptada
- **Decisión:** Un estudiante no puede inscribirse a módulos que se crucen. No hay límite de módulos por estudiante.

### D-006 · Ventanas de cancelación: 1 hora (estudiante) y 2 horas (docente)
- **Estado:** Aceptada
- **Decisión:** El estudiante cancela hasta 1 hora antes del inicio; el docente cambia la hora o cancela hasta 2 horas antes. Ambos valores son configurables.
- **Motivo:** Dar tiempo razonable de aviso a los demás involucrados.

### D-007 · Cambio de salón solo con capacidad suficiente
- **Estado:** Aceptada
- **Decisión:** El CAE solo puede cambiar el salón de un módulo si la nueva capacidad es mayor o igual a los estudiantes inscritos.

### D-008 · Reinscripción permitida
- **Estado:** Aceptada
- **Decisión:** Un estudiante que canceló puede volver a inscribirse mientras haya cupo.

### D-009 · Registro con correo institucional
- **Estado:** Aceptada
- **Decisión:** Estudiantes: registro libre con `@uts.edu.co` y verificación del correo. Docentes y administrativos: `@correo.uts.edu.co`; los docentes los crea el CAE con clave temporal.
- **Motivo:** Garantizar que solo personal y estudiantes de la UTS usen la app.

### D-010 · Idiomas: español e inglés, según el dispositivo
- **Estado:** Aceptada
- **Decisión:** La app sigue el idioma del dispositivo; si no es español ni inglés, usa español.
- **Supuesto asociado:** el respaldo en español es una decisión del equipo de desarrollo, no confirmada por la institución.

### D-011 · Estudiante puede escribir primero al docente
- **Estado:** Aceptada
- **Decisión:** El estudiante puede iniciar una conversación con el docente de un módulo en el que está inscrito.

### D-012 · Retención de chats: 6 meses (módulo) y 2 años (individuales)
- **Estado:** Aceptada
- **Decisión:** Mensajes de módulo se eliminan a los 6 meses; chats individuales a los 2 años, mediante un job programado.
- **Motivo:** 6 meses cubren un semestre; los chats individuales pueden servir como evidencia por más tiempo.

### D-013 · Una sola institución
- **Estado:** Aceptada
- **Decisión:** La app es solo para la UTS por ahora; no hay soporte multi-sede ni multi-institución.

### D-014 · Alcance de los cambios del docente y de la cancelación del estudiante
- **Estado:** Supuesto
- **Decisión asumida:** Los cambios del docente afectan solo la sesión de esa semana. La cancelación del estudiante cancela su inscripción al módulo.
- **Pendiente:** Confirmar con el CAE (ver `Context.md`, sección 10).

---

## Técnicas

### D-020 · React Native con Expo
- **Estado:** Aceptada
- **Decisión:** App móvil en React Native + Expo (TypeScript).
- **Motivo:** Una base de código para Android e iOS y buena experiencia de desarrollo.
- **Descartado:** Flutter (tampoco habría resuelto la limitación de iOS en Windows).

### D-021 · Backend con NestJS, PostgreSQL y Prisma
- **Estado:** Aceptada
- **Decisión:** API en NestJS (TypeScript) con PostgreSQL y Prisma.
- **Motivo:** Datos muy relacionales (periodos, módulos, salones, inscripciones) y soporte de tiempo real integrado.
- **Descartado:** Bases NoSQL.

### D-022 · Autenticación con JWT y roles
- **Estado:** Aceptada
- **Decisión:** Access token de vida corta y refresh token rotativo, guardados en `expo-secure-store`. Los permisos se validan con guards de roles en el backend.

### D-023 · Chat en tiempo real con Socket.IO
- **Estado:** Aceptada
- **Decisión:** Mensajería en tiempo real con WebSockets (Socket.IO). Si el destinatario está desconectado, recibe push.
- **Descartado:** Bandeja de mensajes sin tiempo real.

### D-024 · Notificaciones por tres canales con cola
- **Estado:** Aceptada
- **Decisión:** Cada notificación se guarda en la app y se envía por push (Expo Push) y correo (SMTP configurado por el CAE). El envío pasa por una cola (BullMQ + Redis).
- **Motivo:** No frenar la API y poder reintentar envíos fallidos.

### D-025 · Borrado lógico en todo el sistema
- **Estado:** Aceptada
- **Decisión:** Nada se elimina físicamente (salvo la retención de chats); se usa `deletedAt`.

### D-026 · Fechas en UTC, mostradas en America/Bogota
- **Estado:** Aceptada
- **Decisión:** La base de datos guarda UTC. Los horarios semanales se definen en hora local de Bogotá y se convierten al generar las sesiones.

### D-027 · Reglas de negocio validadas siempre en el backend
- **Estado:** Aceptada
- **Decisión:** La app puede mostrar ayudas, pero el backend es la única barrera. La inscripción usa transacción con bloqueo para evitar sobrecupo.

### D-028 · Clave SMTP cifrada
- **Estado:** Aceptada
- **Decisión:** La contraseña SMTP se guarda cifrada (AES-256-GCM); la clave de cifrado vive en variables de entorno.

### D-029 · Demo en iOS desde Windows
- **Estado:** Aceptada
- **Decisión:** Ejecutar iOS requiere macOS y Xcode, por lo que la demo usa un iPhone físico con Expo Go; alternativas: EAS Build con Appetize.io o un Mac en la nube. Android se prueba con el emulador de Android Studio.

---

## Diseño

### D-040 · Paleta basada en el verde institucional UTS
- **Estado:** Aceptada
- **Decisión:** Primario `#34531F`, hover `#132F20`, acento lima `#C3D730`. El lima solo se usa en resaltes y fondos oscuros.
- **Motivo:** El lima del logo tiene contraste de 1.6:1 sobre blanco y no sirve para botones ni texto.
- **Pendiente:** Confirmar los valores con el manual de marca vigente de la UTS (el consultado parece ser una versión anterior).

### D-041 · Tipografía Roboto
- **Estado:** Aceptada
- **Decisión:** Roboto en toda la app.
- **Motivo:** Es gratuita y funciona bien en móvil. La fuente institucional (Myriad Pro) no está disponible en Google Fonts.

### D-042 · Navegación por pestañas inferiores según el rol
- **Estado:** Aceptada
- **Decisión:** Estudiante: Inicio, Módulos, Cronograma, Mensajes, PQRS. Docente: Dashboard, Cronograma, Mensajes, PQRS. CAE: Dashboard, Módulos, Mensajes, PQRS, Más (Docentes, Estudiantes, Configuración).

### D-043 · Pantalla de inicio para el estudiante
- **Estado:** Aceptada
- **Decisión:** Se agrega una pantalla de inicio sencilla para el estudiante, que no estaba en el alcance original.

---

## Proceso

### D-060 · Desarrollo guiado por especificaciones con Spec Kit
- **Estado:** Aceptada
- **Decisión:** Cada funcionalidad sigue el ciclo specify, clarify, plan, tasks, implement, con una rama de Git por funcionalidad.
- **Motivo:** Reducir ambigüedad antes de programar y dar trazabilidad a cada cambio.

### D-061 · `docs/` es la fuente de verdad
- **Estado:** Aceptada
- **Decisión:** Context, Architecture, Design, Conventions y Decisions definen el proyecto. Si algo falta o se contradice, se pregunta antes de decidir y se actualiza el documento.

### D-062 · Idioma: documentación en español, código en inglés
- **Estado:** Aceptada
- **Decisión:** Documentación y comunicación en español; código, ramas y commits en inglés.

### D-063 · Commits con Conventional Commits
- **Estado:** Aceptada
- **Decisión:** Formato `type(scope): description`, con ramas `NNN-feature-name` generadas por Spec Kit.

### D-064 · Tres repositorios: back, mobile y db
- **Estado:** Aceptada
- **Decisión:** El código vive en `tutorias_uts_back` (API NestJS), `tutorias_uts_mobile` (app Expo) y `tutorias_uts_db` (esquema Prisma, migraciones, seed y `docker-compose.yml`). Las carpetas `backend/` y `mobile/` de los documentos corresponden a la raíz de los dos primeros. El esquema Prisma tiene una sola fuente (`tutorias_uts_db/prisma/schema.prisma`); el back lo copia con `npm run prisma:generate` para generar su cliente.
- **Motivo:** Es como el equipo ya creó los repositorios; separar la base de datos permite que sus migraciones evolucionen sin tocar la API.
- **Descartado:** Monorepo con `backend/` y `mobile/` (el plan original); esquema duplicado a mano en el back (se desincroniza).

### D-065 · Herramientas del scaffold vigente: Vitest y oxlint en el backend
- **Estado:** Aceptada
- **Decisión:** El backend usa Vitest (pruebas) y oxlint (lint) con Prettier, que es lo que genera NestJS 12; la app usa Jest y ESLint (`eslint-config-expo`). `Conventions.md` §3 y §6 se actualizan.
- **Motivo:** Es el scaffold oficial actual y evita configurar a mano Jest y ESLint sobre ESM.
- **Descartado:** Jest + ESLint en el backend (el texto original de `Conventions.md`).

---

## Plantilla para nuevas decisiones

```markdown
### D-0XX · Título corto
- **Estado:** Aceptada | Supuesto | Reemplazada por D-0YY
- **Decisión:** Qué se decidió.
- **Motivo:** Por qué.
- **Descartado:** Alternativas y por qué no.
```
