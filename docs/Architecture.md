# Architecture.md

> El cómo técnico del proyecto. Para el qué y el porqué ver `Context.md`.

## 1. Visión general

```
┌──────────────────────┐        HTTPS (REST)        ┌─────────────────────────┐
│  App móvil           │ ─────────────────────────► │  API NestJS             │
│  React Native (Expo) │ ◄───────────────────────── │  - Auth / RBAC          │
│  Android + iOS       │      WebSocket (Socket.IO) │  - Módulos de negocio   │
└──────────────────────┘ ◄────────────────────────► │  - Gateway de chat      │
         ▲                                           └───────┬───────┬─────────┘
         │ push (FCM / APNs)                                 │       │
         │                                         ┌─────────▼──┐ ┌──▼────────┐
   Expo Push Service ◄──────────────────────────── │ PostgreSQL │ │ Redis     │
                                                   └────────────┘ │ (colas)   │
                                                                  └──┬────────┘
                                                                     │
                                                          Worker: correos (SMTP),
                                                          push, limpieza de datos
```

## 2. Stack tecnológico

### App móvil
| Necesidad | Tecnología |
|---|---|
| Framework | React Native + **Expo** (TypeScript) |
| Navegación | Expo Router, con grupos de rutas por rol |
| Datos del servidor | TanStack Query |
| Estado local | Zustand |
| Formularios | React Hook Form + Zod |
| Idiomas (es / en) | i18next + expo-localization (sigue el idioma del dispositivo) |
| Chat en tiempo real | socket.io-client |
| Push | expo-notifications |
| Sesión segura | expo-secure-store (tokens) |
| Calendario semanal | react-native-big-calendar (o vista propia) |

### Backend
| Necesidad | Tecnología |
|---|---|
| Framework | **NestJS** (TypeScript) |
| Base de datos | **PostgreSQL** |
| ORM | Prisma |
| Autenticación | JWT (access + refresh), contraseñas con argon2 |
| Tiempo real | NestJS WebSockets (Socket.IO) |
| Colas y tareas | BullMQ + Redis |
| Tareas programadas | `@nestjs/schedule` (limpieza por retención) |
| Correo | Nodemailer con configuración SMTP leída desde BD |
| Validación | class-validator / class-transformer |
| Documentación API | Swagger (OpenAPI) |

## 3. Estructura del repositorio

```
/
├── CLAUDE.md
├── docs/            # Context.md, Architecture.md, Design.md, etc.
├── mobile/          # App Expo
│   ├── app/         # Rutas (Expo Router)
│   │   ├── (auth)/
│   │   ├── (admin)/       # SUPERADMIN (CAE)
│   │   ├── (teacher)/     # DOCENTE
│   │   └── (student)/     # ESTUDIANTE
│   ├── src/
│   │   ├── components/
│   │   ├── features/      # una carpeta por funcionalidad
│   │   ├── api/           # cliente HTTP y hooks de TanStack Query
│   │   ├── i18n/          # es.json, en.json
│   │   └── store/
└── backend/         # API NestJS
    ├── src/
    │   ├── auth/
    │   ├── users/         # base común de usuarios
    │   ├── teachers/
    │   ├── students/
    │   ├── rooms/         # salones y ubicaciones
    │   ├── periods/       # periodos académicos (semestres)
    │   ├── modules/       # tutorías
    │   ├── enrollments/   # inscripciones
    │   ├── chat/
    │   ├── notifications/
    │   ├── pqrs/
    │   ├── dashboard/
    │   ├── settings/      # configuración, listas y SMTP
    │   └── mail/
    └── prisma/
```

## 4. Una sola app, tres roles

- Hay **una sola app**. Al iniciar sesión, según el rol, se redirige al grupo de rutas correspondiente.
- Roles: `SUPERADMIN`, `TEACHER`, `STUDENT`.
- El backend es la **fuente de verdad** de los permisos: cada endpoint usa un guard de roles. Ocultar pantallas en la app no es seguridad.

## 5. Modelo de datos (entidades principales)

| Entidad | Campos clave |
|---|---|
| `User` | id, email, passwordHash, role, status (ACTIVE / INACTIVE), deletedAt, mustChangePassword, locale |
| `TeacherProfile` | userId, nombres, datos de contacto |
| `StudentProfile` | userId, nombres, programa |
| `Room` | id, nombre, ubicación, capacidad, deletedAt |
| `AcademicPeriod` | id, nombre (ej. 2026-2), startsOn, endsOn, status (ACTIVE / CLOSED) |
| `Module` | id, periodId, nombre, descripción, teacherId, roomId, status, cupo (derivado de `Room.capacidad`) |
| `ModuleSchedule` | id, moduleId, dayOfWeek, startTime, endTime (horario semanal; un módulo puede tener varios) |
| `ModuleSession` | id, moduleId, originalStartsAt, startsAt, endsAt, status (SCHEDULED / RESCHEDULED / CANCELLED) |
| `Enrollment` | id, studentId, moduleId, status (ACTIVE / CANCELLED), createdAt |
| `Conversation` | id, type (DIRECT / MODULE), moduleId?, createdAt |
| `ConversationMember` | conversationId, userId, lastReadAt |
| `Message` | id, conversationId, senderId, body, createdAt |
| `Notification` | id, userId, type, title, body, readAt, createdAt |
| `PushToken` | id, userId, token, platform |
| `Pqrs` | id, authorId, tipo, asunto, descripción, status, createdAt |
| `PqrsMessage` | id, pqrsId, authorId, body |
| `Setting` / `DropdownList` / `DropdownItem` | configuración general y listas desplegables |
| `SmtpConfig` | host, port, user, passwordEncrypted, from |

Notas:
- Los borrados lógicos usan `deletedAt`; siempre se filtra por él en las consultas.
- Todas las fechas se guardan en **UTC**. La app las muestra en la zona horaria `America/Bogota`.

### Tutorías recurrentes por periodo

- Un módulo pertenece a un `AcademicPeriod` y define su horario en `ModuleSchedule` (día de la semana y hora local).
- Al crear el módulo, el backend **genera una `ModuleSession` por cada semana** del periodo (de `startsOn` a `endsOn`), convirtiendo la hora local de `America/Bogota` a UTC.
- La `Enrollment` es al **módulo**, no a cada sesión: el estudiante queda inscrito en todas las sesiones del periodo.
- Cancelar o reprogramar una sesión modifica solo esa `ModuleSession` (guarda `originalStartsAt` para trazabilidad) y notifica a los inscritos.
- Si el CAE cambia salón o docente de un módulo, se aplica a las sesiones futuras.
- Solo un periodo puede estar `ACTIVE` a la vez; el estudiante ve los módulos del periodo activo.
- Al cerrar un periodo, sus módulos pasan a solo lectura.

## 6. Reglas críticas que se validan en el backend

| Regla | Cómo se garantiza |
|---|---|
| Cupo máximo = capacidad del salón | Al inscribir: transacción con bloqueo de fila sobre el módulo, se cuenta la inscripción activa y se compara con `Room.capacidad`. |
| Sin cruces de horario del estudiante | Antes de inscribir: compara los `ModuleSchedule` de sus módulos activos del mismo periodo (mismo día y horas que se solapen). |
| Sin cruces de salón ni docente | Al crear o mover un módulo o sesión: validación de disponibilidad. |
| Cambio de salón | Solo si `nuevoSalón.capacidad >= inscritosActivos`. |
| Cancelación del estudiante | Se rechaza si falta menos de **1 hora** para `startsAt`. |
| Cambio o cancelación del docente | Se rechaza si falta menos de **2 horas** para `startsAt`. |
| Dominios de correo | Estudiantes: `@uts.edu.co`. Docentes y administrativos: `@correo.uts.edu.co`. |
| Reinscripción | Permitida si el módulo tiene cupo. |

Los límites de horas y los dominios se leen de **configuración**, no se escriben fijos en el código.

## 7. Autenticación y seguridad

- **Estudiantes:** registro con correo `@uts.edu.co` y verificación por código o enlace.
- **Docentes:** los crea el CAE con clave temporal y `mustChangePassword = true`.
- Access token de vida corta y refresh token rotativo, guardados en `expo-secure-store`.
- Una cuenta desactivada o borrada no puede iniciar sesión ni refrescar tokens.
- La contraseña SMTP se guarda **cifrada** (AES-256-GCM) con una clave que vive en variables de entorno.
- Rate limiting en login, registro y recuperación de contraseña.
- Secretos y claves siempre en variables de entorno; nunca en el repositorio.

## 8. Chat en tiempo real

- Socket.IO con autenticación JWT al conectar.
- Salas (rooms) por conversación; los mensajes se guardan en BD antes de emitirse.
- Si el destinatario no está conectado, se envía **push**.
- **Retención:** un job programado elimina mensajes de módulo con más de **6 meses** y chats individuales con más de **2 años**.

## 9. Notificaciones

Un solo servicio crea la notificación y la entrega por tres canales:

1. **En la app:** se guarda en la tabla `Notification`.
2. **Push:** vía Expo Push Service (que usa FCM y APNs).
3. **Correo:** vía SMTP configurado por el CAE.

El envío de push y correo va por **cola (BullMQ)** para no frenar la API y poder reintentar.

Eventos que notifican: cancelación o cambio de hora, salón o docente de un módulo, anuncios del docente, mensajes nuevos, y cambios de estado de una PQRS.

## 10. Internacionalización (es / en)

- La app usa i18next y toma el idioma del dispositivo; si no es español ni inglés, usa español.
- Las plantillas de correo y push se generan en el idioma guardado en `User.locale`.
- Las listas desplegables administrables guardan sus etiquetas en ambos idiomas.

## 11. Estrategia de demo en iOS

El límite no es React Native: **compilar y ejecutar apps de iOS requiere macOS + Xcode**. Android Studio no puede correr iOS. Alternativas, de más simple a más completa:

1. **iPhone físico + Expo Go:** se escanea un QR. No necesita Mac ni cuenta de pago. Sirve para casi toda la demo.
2. **Build de simulador en la nube con EAS + Appetize.io:** se genera el build iOS en la nube y se ejecuta en un iPhone simulado desde el navegador.
3. **Mac en la nube** (MacinCloud o similar) o un Mac prestado, con Xcode y simulador.
4. **TestFlight:** instalación en iPhones reales. Requiere cuenta Apple Developer de pago.

Para Android, se usa el emulador de Android Studio sin ningún inconveniente.

## 12. Entornos y despliegue

- **Desarrollo:** `docker-compose` con PostgreSQL y Redis; API local.
- **Producción:** por definir (VPS, contenedor en la nube o servicio gestionado).
- **Builds de la app:** EAS Build.

## 13. Decisiones pendientes

- [ ] Alcance de los cambios del docente: ¿una sola sesión o las semanas restantes? (supuesto actual: una sola sesión)
- [ ] Alcance de la cancelación del estudiante: ¿módulo completo o una sesión? (supuesto actual: inscripción al módulo)
- [ ] ¿Se valida el cruce con los horarios de los estudiantes al reprogramar una sesión?
- [ ] ¿Festivos o semanas sin tutoría dentro del periodo?
- [ ] ¿Dónde se desplegará el backend?
- [ ] ¿Se cuenta con Mac, iPhone físico o cuenta Apple Developer para la demo?
- [ ] ¿Qué proveedor de SMTP usa la institución?
