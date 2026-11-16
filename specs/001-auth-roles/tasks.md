---

description: "Task list for Acceso y roles"
---

# Tasks: Acceso y roles

**Input**: Design documents from `/specs/001-auth-roles/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principio V) exige pruebas antes de dar por terminadas las reglas de negocio, y el plan las compromete para las reglas de acceso. Escribirlas primero y comprobar que fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario para implementar y probar cada una por separado.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: historia a la que pertenece (US1…US7)
- Todas las rutas son relativas a la raíz del repositorio

## Path Conventions

- API: `backend/src/` y pruebas e2e en `backend/test/`
- App: `mobile/app/` (rutas) y `mobile/src/` (código); pruebas junto al código en `__tests__/`
- Textos visibles: solo en `mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- **Repos reales (D-064):** `backend/` = raíz de `tutorias_uts_back`; `mobile/` = raíz de `tutorias_uts_mobile`; `backend/prisma/` (esquema, migraciones, `seed.ts`) y `docker-compose.yml` = `tutorias_uts_db`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Crear los proyectos y la infraestructura local.

- [X] T001 Crear el proyecto NestJS (TypeScript) en `backend/` con los scripts `start:dev`, `test` y `test:e2e`
- [X] T002 Crear el proyecto Expo (TypeScript) con Expo Router en `mobile/` con los scripts `lint`, `typecheck` y `test`
- [X] T003 [P] Crear `docker-compose.yml` en la raíz con PostgreSQL, Redis y Mailpit (para ver los correos de código)
- [X] T004 [P] Crear `backend/.env.example` y `mobile/.env.example` solo con nombres de variables y valores de ejemplo vacíos (URL de la base, secreto JWT, secreto HMAC de códigos, clave AES de SMTP, credenciales del CAE inicial, host de Redis, URL de la API); añadir `.env` al `.gitignore`
- [X] T005 [P] Instalar dependencias del backend en `backend/package.json`: `@nestjs/jwt`, `@nestjs/throttler`, `@nestjs/swagger`, `prisma`, `@prisma/client`, `argon2`, `class-validator`, `class-transformer`, `nodemailer`, `bullmq`, `ioredis`, `supertest`
- [X] T006 [P] Instalar dependencias de la app en `mobile/package.json`: `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `i18next`, `react-i18next`, `expo-localization`, `expo-secure-store`, `expo-clipboard`, `@expo-google-fonts/roboto`, `@expo-google-fonts/roboto-mono`, `@testing-library/react-native`
- [X] T007 [P] Configurar ESLint y Prettier en `backend/` y `mobile/` (depende de T001, T002)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Núcleo común que TODAS las historias necesitan.

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase.

### Backend

- [X] T008 Definir `backend/prisma/schema.prisma` según `data-model.md` y crear la migración inicial. Reglas a transcribir: `User.email` único sobre el valor normalizado (minúsculas, sin espacios); `role` enum `SUPERADMIN | TEACHER | STUDENT`; `status` enum `ACTIVE | INACTIVE`; `emailVerifiedAt` fecha nula (nulo = sin verificar); `mustChangePassword` booleano; `locale` enum `es | en`; `deletedAt` fecha nula (el correo sigue ocupado). `Session`: `refreshTokenHash`, `deviceLabel` nulo, `lastUsedAt`, `expiresAt`, `revokedAt` nulo. `VerificationCode`: `purpose` enum `EMAIL_VERIFICATION | PASSWORD_RESET`, `codeHash`, `expiresAt`, `attempts` entero, `usedAt` nulo. Incluir además `StudentProfile`, `TeacherProfile`, `Setting` y `SmtpConfig` (`passwordEncrypted`). Todas las fechas en UTC. Convenciones (`docs/Conventions.md` §4): modelos `PascalCase` singular; tablas `snake_case` plural con `@@map` (`users`, `sessions`, `verification_codes`); columnas `snake_case` con `@map`; todas las tablas con `id` UUID, `createdAt` y `updatedAt`; `deletedAt` en las entidades con borrado lógico
- [X] T009 Crear `PrismaModule` y `PrismaService` en `backend/src/prisma/` (depende de T008)
- [X] T010 [P] Crear `SettingsService` en `backend/src/settings/settings.service.ts` que lee las claves con estos valores por defecto: `auth.studentEmailDomain` = `uts.edu.co`, `auth.staffEmailDomain` = `correo.uts.edu.co`, `auth.passwordMinLength` = 8, `auth.sessionInactivityDays` = 30, `auth.verificationCodeTtlHours` = 24, `auth.resetCodeTtlMinutes` = 60, `auth.codeMaxAttempts` = 5, `auth.resendCooldownSeconds` = 60, `auth.resendMaxPerHour` = 5, `auth.loginMaxFailures` = 5, `auth.loginLockoutMinutes` = 15 (depende de T009)
- [X] T011 [P] Crear `AppException` y un filtro global en `backend/src/common/errors/` que responde `{ statusCode, code, message, details? }` (formato de `docs/Conventions.md` §4) con los códigos de `contracts/auth-api.yaml`; `message` solo para desarrolladores; `retryAfterSeconds` y `fields` van dentro de `details`
- [X] T012 [P] Crear utilidades de correo en `backend/src/common/email.util.ts`: normalizar (minúsculas, sin espacios laterales) y comprobar el dominio exacto (rechazar `uts.edu.co.example.com` y subdominios no permitidos)
- [X] T013 [P] Crear `PasswordService` en `backend/src/auth/password.service.ts`: hash argon2id, verificación y política (mínimo `auth.passwordMinLength` caracteres, con letras y números); incluir una verificación contra un hash ficticio para igualar tiempos con correos inexistentes
- [X] T014 [P] Crear `backend/src/common/crypto.util.ts`: HMAC con secreto del servidor, hash de tokens, comparación en tiempo constante y AES-256-GCM para la clave SMTP
- [X] T015 [P] Crear `CodeService` en `backend/src/auth/code.service.ts`: generar código de 6 dígitos con generador criptográfico, guardar solo su HMAC, un único código vigente por usuario y propósito (el nuevo invalida el anterior), vencimiento por propósito, un solo uso, máximo `auth.codeMaxAttempts` intentos, espera `auth.resendCooldownSeconds` y máximo `auth.resendMaxPerHour` por hora (depende de T008, T010, T014)
- [X] T016 [P] Crear `MailModule` en `backend/src/mail/` con cola BullMQ y procesador; la configuración SMTP sale de `SmtpConfig` (clave descifrada con T014) y, si no hay registro, de variables de entorno; plantillas es/en cargadas por `locale` del usuario (depende de T014)
- [X] T017 [P] Crear `SessionService` en `backend/src/auth/session.service.ts`: crear sesión por dispositivo con token de renovación opaco de 256 bits (guardar solo el hash), rotar al renovar con ventana deslizante de `auth.sessionInactivityDays` días, revocar la sesión reutilizada si se presenta un token ya rotado, revocar una sesión o todas las de un usuario (depende de T008, T010, T014)
- [X] T018 [P] Crear `LoginAttemptsService` en `backend/src/auth/login-attempts.service.ts` (Redis): contar fallos por correo + IP, bloquear `auth.loginLockoutMinutes` minutos tras `auth.loginMaxFailures` fallos y devolver los segundos restantes (depende de T010)
- [X] T019 Crear `JwtAuthGuard`, `RolesGuard`, `@Public()` y `@Roles()` en `backend/src/common/guards/`: el guard valida el JWT (15 min), carga al usuario y la sesión en cada petición y rechaza si el usuario está `INACTIVE`, tiene `deletedAt`, o la sesión está revocada o caducada (depende de T017)
- [X] T020 Cablear `backend/src/auth/auth.module.ts` y `backend/src/main.ts`: configuración de JWT, guards globales, `@nestjs/throttler` en endpoints públicos, redacción de contraseñas, códigos y tokens en los logs, prefijo global `/api/v1` y Swagger; crear además el esqueleto de `backend/src/auth/auth.controller.ts` (sin rutas) para que cada historia le añada las suyas (depende de T019)
- [X] T021 [P] Crear `backend/prisma/seed.ts`: crea la cuenta SUPERADMIN inicial con correo y contraseña de variables de entorno, `emailVerifiedAt` fijado y `mustChangePassword = true`; no versiona credenciales (depende de T013)
- [X] T022 [P] Crear el arnés de pruebas e2e en `backend/test/utils/`: aplicación de prueba, limpieza de la base, reloj controlable y un buzón falso que captura los correos de código (depende de T016)

### Mobile

- [X] T023 [P] Cargar Roboto y Roboto Mono y crear los tokens de `docs/Design.md` en `mobile/src/theme/` (solo los colores, tipografías y espaciados del documento; sin colores nuevos)
- [X] T024 [P] Configurar i18next en `mobile/src/i18n/index.ts` con `expo-localization`: idioma del dispositivo, español si no es es/en; crear `es.json` y `en.json` con la estructura común
- [X] T025 [P] Crear `Button` en `mobile/src/components/Button.tsx` (primario, delineado, tonal; 48 px de alto; estado deshabilitado con línea de ayuda que explica la regla; spinner sin cambiar ancho)
- [X] T026 [P] Crear `TextField` en `mobile/src/components/TextField.tsx` (48 px, etiqueta arriba, estado de error con mensaje, alternar mostrar/ocultar contraseña)
- [X] T027 [P] Crear `Banner` en `mobile/src/components/Banner.tsx` (fondo crema de `Design.md`, ícono opcional) para avisos y reglas de bloqueo
- [X] T028 [P] Crear el almacén de sesión: `mobile/src/store/secureSession.ts` (token de renovación en `expo-secure-store`) y `mobile/src/store/session.ts` (Zustand: usuario, rol, `mustChangePassword`, estado de carga)
- [X] T029 Crear el cliente HTTP en `mobile/src/api/client.ts`: añade el token de acceso, renueva una sola vez ante 401 (una renovación en curso a la vez) y convierte los errores en `ApiError` con `code` (depende de T028)
- [X] T030 [P] Crear `mobile/src/api/errors.ts` (tabla de `code` de error → clave de traducción, con `details.retryAfterSeconds` de `RATE_LIMITED`) y el layout `mobile/app/(auth)/_layout.tsx` (pila sin encabezado) que usan todas las pantallas de acceso

**Checkpoint**: Base lista; las historias pueden empezar.

---

## Phase 3: User Story 1 - Estudiante se registra y verifica su correo (Priority: P1) 🎯 MVP

**Goal**: Un estudiante se registra con `@uts.edu.co` y verifica su correo con un código de 6 dígitos.

**Independent Test**: Registrar un correo `@uts.edu.co`, recibir el código en Mailpit, verificarlo y comprobar que la cuenta queda verificada; probar rechazo de dominios, código incorrecto y reenvío. (El bloqueo de ingreso sin verificar se prueba en US2.)

### Tests for User Story 1 ⚠️ (escribir primero y ver que fallan)

- [ ] T031 [P] [US1] Pruebas unitarias de normalización y dominio (FR-006, FR-007, FR-010, FR-032) en `backend/src/common/email.util.spec.ts`
- [ ] T032 [P] [US1] Pruebas e2e de registro, verificación y reenvío en `backend/test/auth-register.e2e-spec.ts`: registro correcto, dominio no permitido (incluido `@correo.uts.edu.co`), correo verificado duplicado → 409, cuenta sin verificar → reenvía el código con respuesta idéntica a un registro nuevo y su contraseña NO cambia (un registro con otra contraseña no permite iniciar sesión con ella tras verificar), correo con `deletedAt` → rechazado, código incorrecto, 5 intentos agotan el código, código vencido, código usado, espera y límite de reenvíos, respuesta idéntica del reenvío exista o no la cuenta
- [ ] T033 [P] [US1] Pruebas de la app para el formulario de registro y la pantalla de verificación en `mobile/src/features/auth/__tests__/register.test.tsx` (requisitos de contraseña visibles, error de dominio, temporizador de reenvío)

### Implementation for User Story 1

- [ ] T034 [US1] Crear los DTO de registro, verificación y reenvío en `backend/src/auth/dto/` con validación (`email`, contraseña mínima de 8, `firstName`, `lastName`, `locale` `es|en`, `code` con patrón `^[0-9]{6}$`)
- [ ] T035 [US1] Implementar `RegistrationService` en `backend/src/auth/registration.service.ts`: normalizar, validar dominio de estudiantes desde configuración, unicidad incluyendo cuentas con `deletedAt`, cuenta sin verificar existente → solo reenviar el código sin modificar contraseña, nombres ni `locale` y responder igual que en un alta nueva, creación de `User` STUDENT con `StudentProfile` y `locale`, emisión del código `EMAIL_VERIFICATION` y envío por cola (depende de T034)
- [ ] T036 [US1] Añadir (el controlador existe desde T020) `POST /auth/register`, `/auth/verify-email` y `/auth/resend-verification` en `backend/src/auth/auth.controller.ts` según `contracts/auth-api.yaml` (todas `@Public()` y con límite de peticiones) (depende de T035)
- [ ] T037 [P] [US1] Crear la plantilla de correo del código de verificación en español e inglés en `backend/src/mail/templates/verification.{es,en}.ts`
- [ ] T038 [P] [US1] Crear el esquema Zod en `mobile/src/features/auth/schemas.ts`, el hook `mobile/src/features/auth/hooks/useRegister.ts`, la pantalla `mobile/src/features/auth/screens/RegisterScreen.tsx` (nombres, correo, contraseña con requisitos visibles, idioma del dispositivo enviado como `locale`) y la ruta `mobile/app/(auth)/register.tsx` que solo la renderiza
- [ ] T039 [P] [US1] Crear `mobile/src/features/auth/screens/VerifyEmailScreen.tsx` (entrada de 6 dígitos, reenvío con cuenta regresiva desde `resendAvailableAt`, mensajes por código de error), su hook en `hooks/` y la ruta `mobile/app/(auth)/verify-email.tsx`
- [ ] T040 [US1] Añadir las claves es/en de registro, verificación y reglas de dominio y contraseña en `mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US1 funciona y se prueba sola.

---

## Phase 4: User Story 2 - Inicio de sesión y navegación por rol (Priority: P1)

**Goal**: Cualquier usuario activo inicia sesión y llega a la navegación de su rol.

**Independent Test**: Iniciar sesión con una cuenta de cada rol (CAE de la siembra, estudiante verificado, docente) y comprobar que cada una ve solo sus pestañas.

### Tests for User Story 2 ⚠️

- [X] T041 [P] [US2] Pruebas e2e en `backend/test/auth-login.e2e-spec.ts`: ingreso correcto por rol, `INVALID_CREDENTIALS` idéntico con correo inexistente o contraseña errónea, estudiante sin verificar → 403 `EMAIL_NOT_VERIFIED`, bloqueo tras 5 fallos con `details.retryAfterSeconds`, `GET /auth/me`, acceso a una ruta de otro rol → 403 `FORBIDDEN_ROLE`
- [X] T042 [P] [US2] Pruebas de enrutamiento por rol en `mobile/src/features/auth/__tests__/role-routing.test.tsx` (sin sesión → login; cada rol → su grupo; rol equivocado → redirige al propio)

### Implementation for User Story 2

- [X] T043 [US2] Implementar `AuthService.login` en `backend/src/auth/auth.service.ts`: verificar contraseña (con hash ficticio si no existe), comprobar `status = ACTIVE`, `deletedAt` nulo y, para estudiantes, `emailVerifiedAt` no nulo; registrar fallos y bloqueo (T018); crear sesión (T017) y devolver tokens y `UserSummary` (depende de T017, T018)
- [X] T044 [US2] Añadir `POST /auth/login` (público) y `GET /auth/me` en `backend/src/auth/auth.controller.ts` (depende de T043)
- [X] T045 [P] [US2] Crear `mobile/src/features/auth/screens/LoginScreen.tsx` con `TextField`, `Button`, `Banner` para bloqueos y errores traducidos, su hook `hooks/useLogin.ts` y la ruta `mobile/app/(auth)/login.tsx` que solo la renderiza
- [X] T046 [US2] Crear `mobile/app/_layout.tsx` y `mobile/app/index.tsx`: sin sesión → `(auth)`; con `mustChangePassword` → `change-password`; si no, grupo del rol; los layouts de cada grupo redirigen si el rol no coincide
- [X] T047 [P] [US2] Crear `mobile/src/components/EmptyState.tsx`, `mobile/src/features/shell/screens/EmptyTabScreen.tsx` y el grupo `mobile/app/(student)/` con las pestañas de `Design.md` (Inicio · Módulos · Cronograma · Mensajes · PQRS); cada ruta solo renderiza `EmptyTabScreen`
- [X] T048 [P] [US2] Crear el grupo `mobile/app/(teacher)/` con las pestañas (Dashboard · Cronograma · Mensajes · PQRS); cada ruta renderiza `EmptyTabScreen` (depende de T047)
- [X] T049 [P] [US2] Crear el grupo `mobile/app/(admin)/` con las pestañas (Dashboard · Módulos · Mensajes · PQRS · Más); cada ruta renderiza `EmptyTabScreen` (depende de T047)
- [X] T050 [US2] Añadir las claves es/en de login, pestañas, estados vacíos y mensajes de bloqueo en `mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US1 y US2 funcionan; el CAE sembrado ya puede ingresar.

---

## Phase 5: User Story 3 - El CAE crea un docente y este cambia su clave temporal (Priority: P1)

**Goal**: El CAE crea docentes con clave temporal visible una sola vez; el docente debe cambiarla antes de usar la app.

**Independent Test**: Como CAE crear un docente, copiar la clave, iniciar sesión como docente y comprobar que solo puede cambiar la clave hasta completarlo.

### Tests for User Story 3 ⚠️

- [ ] T051 [P] [US3] Pruebas e2e en `backend/test/teachers.e2e-spec.ts`: creación por el CAE, dominio distinto de `@correo.uts.edu.co` → 422, no CAE → 403, correo duplicado → 409, la clave temporal solo aparece en la respuesta de creación, el docente con `mustChangePassword` recibe 403 `PASSWORD_CHANGE_REQUIRED` en todo salvo cambio de clave, `me` y cierre de sesión; el cambio rechaza clave débil, igual a la actual (`PASSWORD_SAME_AS_CURRENT`) o clave actual incorrecta; tras cambiar, accede normal
- [ ] T052 [P] [US3] Pruebas de la app en `mobile/src/features/auth/__tests__/teacher-flow.test.tsx`: el diálogo de clave temporal se muestra una vez, no se puede reabrir, y la pantalla de cambio bloquea la navegación

### Implementation for User Story 3

- [ ] T053 [P] [US3] Crear `TemporaryPasswordService` en `backend/src/teachers/temporary-password.service.ts` (generador criptográfico que cumple la política de contraseñas)
- [ ] T054 [US3] Extender `JwtAuthGuard` en `backend/src/common/guards/` para devolver 403 `PASSWORD_CHANGE_REQUIRED` a cualquier ruta salvo `/auth/change-password`, `/auth/me` y `/auth/logout` cuando `mustChangePassword` es verdadero (depende de T019)
- [ ] T055 [US3] Crear `TeachersModule` en `backend/src/teachers/` con DTO, servicio y `POST /teachers` con `@Roles(SUPERADMIN)`: validar el dominio de docentes desde configuración, crear `User` TEACHER con `TeacherProfile`, `emailVerifiedAt` fijado y `mustChangePassword = true`, y devolver la clave temporal solo en esa respuesta, sin registrarla en logs (depende de T053)
- [ ] T056 [US3] Añadir `POST /auth/change-password` en `backend/src/auth/auth.controller.ts`: verificar la clave actual, aplicar la política, exigir que sea distinta, quitar `mustChangePassword` (depende de T054)
- [ ] T057 [P] [US3] Crear `mobile/src/features/auth/screens/ChangePasswordScreen.tsx` (bloquea toda la navegación hasta completar el cambio y vuelve al grupo del rol), su hook en `hooks/` y la ruta `mobile/app/change-password.tsx` que solo la renderiza
- [ ] T058 [P] [US3] Crear `mobile/src/components/TemporaryPasswordDialog.tsx`: clave en Roboto Mono sobre bloque `Surface`, botón "Copiar" (`expo-clipboard`), aviso de cambio en el primer ingreso; al cerrarse no vuelve a mostrarla
- [ ] T059 [US3] Crear `mobile/src/features/teachers/screens/CreateTeacherScreen.tsx` (formulario con nombres y correo, error en línea de dominio y diálogo de clave temporal al terminar), su hook en `mobile/src/features/teachers/hooks/` y la ruta `mobile/app/(admin)/more/create-teacher.tsx` que solo la renderiza (depende de T058)
- [ ] T060 [US3] Añadir las claves es/en del alta de docente, el diálogo y el cambio de clave obligatorio en `mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: Las tres historias P1 funcionan.

---

## Phase 6: User Story 4 - Recuperación de contraseña por correo (Priority: P2)

**Goal**: Cualquier usuario restablece su contraseña con un código enviado por correo.

**Independent Test**: Solicitar el código, escribirlo, definir una nueva contraseña e ingresar con ella.

### Tests for User Story 4 ⚠️

- [ ] T061 [P] [US4] Pruebas e2e en `backend/test/auth-reset.e2e-spec.ts`: respuesta idéntica con correo existente o no, código vencido, usado o con intentos agotados, contraseña débil, cierre de todas las sesiones, restablecer quita `mustChangePassword` de un docente (FR-016a), restablecer marca verificado a un estudiante sin verificar, cuenta desactivada o con `deletedAt` no recibe código ni se restablece
- [ ] T062 [P] [US4] Pruebas de la app en `mobile/src/features/auth/__tests__/reset.test.tsx` (flujo de dos pasos, errores por código)

### Implementation for User Story 4

- [ ] T063 [US4] Crear `PasswordResetService` en `backend/src/auth/password-reset.service.ts`: emitir el código `PASSWORD_RESET` solo para cuentas activas; al restablecer, cambiar el hash, fijar `emailVerifiedAt` si era nulo, poner `mustChangePassword` en falso y revocar todas las sesiones (depende de T015, T017)
- [ ] T064 [US4] Añadir `POST /auth/forgot-password` y `/auth/reset-password` en `backend/src/auth/auth.controller.ts` (públicas, con límite de peticiones) (depende de T063)
- [ ] T065 [P] [US4] Crear la plantilla del correo de recuperación es/en en `backend/src/mail/templates/reset.{es,en}.ts`
- [ ] T066 [P] [US4] Crear `mobile/src/features/auth/screens/ForgotPasswordScreen.tsx`, su hook en `hooks/` y la ruta `mobile/app/(auth)/forgot-password.tsx` que solo la renderiza
- [ ] T067 [P] [US4] Crear `mobile/src/features/auth/screens/ResetPasswordScreen.tsx` (código de 6 dígitos y nueva contraseña con requisitos visibles), su hook en `hooks/` y la ruta `mobile/app/(auth)/reset-password.tsx` que solo la renderiza
- [ ] T068 [US4] Enlazar "¿Olvidaste tu contraseña?" desde `mobile/app/(auth)/login.tsx` y añadir las claves es/en en `mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US4 funciona sola.

---

## Phase 7: User Story 5 - Sesión persistente y cierre de sesión (Priority: P2)

**Goal**: La sesión sobrevive al cierre de la app y se puede cerrar por dispositivo.

**Independent Test**: Iniciar sesión, cerrar la app por completo, reabrirla (sigue dentro), cerrar sesión (se pide ingresar).

### Tests for User Story 5 ⚠️

- [ ] T069 [P] [US5] Pruebas e2e en `backend/test/auth-session.e2e-spec.ts`: renovar rota el token, un token ya rotado revoca la sesión, caducidad tras 30 días sin uso con el reloj controlable (y renovación de la ventana con cada uso), cerrar sesión solo afecta al dispositivo actual, restablecer contraseña cierra todos los dispositivos
- [ ] T070 [P] [US5] Pruebas de la app en `mobile/src/features/auth/__tests__/session-restore.test.tsx` (restaura al abrir; con renovación fallida pide ingresar con aviso)

### Implementation for User Story 5

- [ ] T071 [US5] Añadir `POST /auth/refresh` (público) y `POST /auth/logout` en `backend/src/auth/auth.controller.ts` usando `SessionService` (depende de T017)
- [ ] T072 [US5] Restaurar la sesión al iniciar en `mobile/app/_layout.tsx`: leer el token de `expo-secure-store`, renovar, mostrar pantalla de carga y, si falla, volver a `(auth)/login` con aviso de sesión caducada (depende de T029, T046)
- [ ] T073 [P] [US5] Crear `mobile/src/components/AppBar.tsx`: barra superior con avatar a la derecha que abre un menú con "Cerrar sesión" (cierra en el servidor, borra el almacén seguro y vuelve al login)
- [ ] T074 [US5] Usar `AppBar` en los layouts de `mobile/app/(student)/`, `(teacher)/` y `(admin)/` (depende de T073)
- [ ] T075 [US5] Añadir las claves es/en del menú de perfil, cierre de sesión y sesión caducada en `mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US5 funciona sola.

---

## Phase 8: User Story 6 - Cuentas desactivadas o eliminadas sin acceso (Priority: P2)

**Goal**: Una cuenta desactivada o con borrado lógico no entra, no conserva sesiones y mantiene su historial.

**Independent Test**: Desactivar una cuenta y borrar lógicamente otra directamente en la base; ninguna inicia sesión, sus sesiones abiertas caen en la siguiente petición y sus datos siguen existiendo.

### Tests for User Story 6 ⚠️

- [ ] T076 [P] [US6] Pruebas e2e en `backend/test/auth-account-state.e2e-spec.ts`: login de cuenta desactivada → 403 `ACCOUNT_DISABLED`; con `deletedAt` → 403 `ACCOUNT_UNAVAILABLE`; sesión abierta rechazada en la siguiente petición; renovación rechazada; reactivar devuelve el acceso con la contraseña vigente; el correo borrado sigue ocupado para registros; el historial (usuario y sesiones) permanece
- [ ] T077 [P] [US6] Pruebas de la app en `mobile/src/features/auth/__tests__/account-state.test.tsx`: `ACCOUNT_DISABLED` y `ACCOUNT_UNAVAILABLE` cierran la sesión y muestran la regla que bloquea

### Implementation for User Story 6

- [ ] T078 [US6] Crear `UsersService` en `backend/src/users/users.service.ts` con `setStatus` y `softDelete` que revocan todas las sesiones del usuario y nunca borran filas (para que la futura administración de cuentas los reutilice)
- [ ] T079 [US6] Auditar `backend/src/auth/` y `backend/src/common/guards/` para que login, renovación, recuperación y registro filtren siempre por `deletedAt` y estado; el mensaje de cuenta desactivada indica la causa y a quién acudir, y el de cuenta borrada no revela más
- [ ] T080 [US6] Tratar `ACCOUNT_DISABLED` y `ACCOUNT_UNAVAILABLE` en `mobile/src/api/client.ts` y `mobile/src/features/auth/screens/LoginScreen.tsx`: cerrar la sesión local y mostrar un `Banner` con la regla
- [ ] T081 [US6] Añadir las claves es/en de cuenta desactivada, no disponible y a quién acudir en `mobile/src/i18n/es.json` y `en.json`

**Checkpoint**: US6 funciona sola.

---

## Phase 9: User Story 7 - Idioma según el dispositivo (Priority: P3)

**Goal**: Toda la app y los correos siguen el idioma del dispositivo (español por defecto).

**Independent Test**: Cambiar el idioma del dispositivo entre español, inglés y un tercero, y revisar las pantallas de acceso y los correos.

### Tests for User Story 7 ⚠️

- [ ] T082 [P] [US7] Pruebas de resolución de idioma en `mobile/src/i18n/__tests__/i18n.test.ts` (es, en, y un idioma distinto → es)
- [ ] T083 [P] [US7] Pruebas en `backend/test/mail-locale.e2e-spec.ts`: los correos de verificación y recuperación salen en el `locale` guardado del usuario

### Implementation for User Story 7

- [ ] T084 [US7] Hacer que `mobile/src/i18n/index.ts` reaccione al cambio de idioma del dispositivo con la app abierta
- [ ] T085 [P] [US7] Añadir en `mobile/.eslintrc.js` una regla que prohíbe texto literal en componentes (`i18next/no-literal-string` o equivalente)
- [ ] T086 [P] [US7] Crear `mobile/src/i18n/__tests__/parity.test.ts`: `es.json` y `en.json` tienen las mismas claves y cada `code` de error de `contracts/auth-api.yaml` tiene traducción
- [ ] T087 [US7] Corregir los textos fijos que detecte T085 en `mobile/app/` y `mobile/src/` y revisar que las pantallas toleran textos largos en español y fuente al 200 %

**Checkpoint**: Todas las historias funcionan.

---

## Phase 10: Polish & Cross-Cutting Concerns

- [ ] T088 [P] Crear `backend/test/log-redaction.e2e-spec.ts`: ninguna contraseña, clave temporal, código ni token aparece en los logs durante registro, login, recuperación y alta de docente
- [ ] T089 [P] Validar las respuestas de la API contra `specs/001-auth-roles/contracts/auth-api.yaml` en `backend/test/contract.e2e-spec.ts`
- [ ] T090 [P] Revisar accesibilidad de las pantallas de acceso: objetivos de 48 px, etiquetas de accesibilidad, estados de carga y error de `Design.md` y contraste de la paleta
- [ ] T091 [P] Verificar y ajustar la sección "Comandos" de `CLAUDE.md` con los comandos reales del proyecto creado
- [ ] T092 [P] Confirmar que `docs/Architecture.md` y `docs/Context.md` coinciden con lo implementado (entidades, código de 6 dígitos, sesión de 30 días, prefijo `/api/v1`) y actualizarlos si cambió algo; registrar en `docs/Decisions.md` (formato D-0XX, sin reutilizar IDs) las decisiones de esta funcionalidad: código numérico de 6 dígitos en vez de enlace, sesión de 30 días de inactividad por dispositivo, sesiones en varios dispositivos, registro sobre cuenta sin verificar solo reenvía el código, recuperar la contraseña verifica el correo y quita el cambio obligatorio del docente, límites de intentos por defecto
- [ ] T093 Revisión de seguridad de `backend/src/auth/` (comparaciones en tiempo constante, enumeración de cuentas, límites de intentos, rotación de tokens)
- [ ] T094 Ejecutar los 17 escenarios de `specs/001-auth-roles/quickstart.md` y registrar el resultado

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias.
- **User Stories (Phases 3–9)**: dependen de Foundational. Orden de prioridad: US1, US2, US3 (P1) → US4, US5, US6 (P2) → US7 (P3).
- **Polish (Phase 10)**: depende de las historias deseadas.

### User Story Dependencies

- **US1**: tras Foundational; sin dependencias de otras historias.
- **US2**: tras Foundational; las pruebas de "sin verificar" necesitan una cuenta creada, que se puede insertar directamente en la base.
- **US3**: tras Foundational; el alta de docente requiere iniciar sesión como CAE, así que su prueba de extremo a extremo depende de US2.
- **US4**: tras Foundational; sus pruebas de "docente" y "sesiones" aprovechan US2 y US3.
- **US5**: depende de US2 (necesita sesión iniciada).
- **US6**: depende de US2 (login) y de Foundational (guard).
- **US7**: transversal; se puede hacer en cualquier momento tras US1 y US2.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- DTO → servicio → controlador en el backend; en la app, pantalla tras esquema y cliente.
- Las traducciones es/en se completan antes de cerrar cada historia.
- Las tareas que editan `backend/src/auth/auth.controller.ts` o los archivos i18n no son [P] entre sí.

### Parallel Opportunities

- Setup: T003–T007.
- Foundational backend: T010–T018 (tras T008, T009); Foundational app: T023–T028 y T030.
- Las pruebas de cada historia son [P] entre sí; las pantallas y plantillas marcadas [P] también.
- Tras Foundational, US1 y US2 pueden avanzar en paralelo con personas distintas; los grupos de pestañas T047–T049 son independientes.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 a la vez:
Task: "T031 Pruebas unitarias de normalización y dominio en backend/src/common/email.util.spec.ts"
Task: "T032 Pruebas e2e de registro en backend/test/auth-register.e2e-spec.ts"
Task: "T033 Pruebas de la app en mobile/src/features/auth/__tests__/register.test.tsx"

# Piezas independientes de US1:
Task: "T037 Plantilla de verificación en backend/src/mail/templates/"
Task: "T038 Pantalla de registro en mobile/src/features/auth/screens/RegisterScreen.tsx"
Task: "T039 Pantalla de verificación en mobile/src/features/auth/screens/VerifyEmailScreen.tsx"
```

---

## Implementation Strategy

### MVP First (US2 + US1 + US3)

1. Phase 1 Setup y Phase 2 Foundational.
2. US2: el CAE sembrado inicia sesión y ve su navegación (primera demostración).
3. US1 y US3: entran estudiantes y docentes, que son todos los roles.
4. **PARAR Y VALIDAR** las tres historias P1 con el quickstart (escenarios 1–9).
5. Demostrar.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US2 → demo (login y roles) → US1 → demo → US3 → demo (MVP completo de roles).
3. US4, US5, US6 → robustez de cuentas y sesiones.
4. US7 → pulido de idioma.
5. Polish → seguridad, contratos y quickstart completo.

### Notes

- [P] = archivos distintos y sin dependencias pendientes.
- La etiqueta [Story] vincula cada tarea con su historia.
- Verificar que las pruebas fallan antes de implementar y hacer commit por tarea o grupo lógico.
- Ningún secreto en el repositorio; ningún texto visible en los componentes.
