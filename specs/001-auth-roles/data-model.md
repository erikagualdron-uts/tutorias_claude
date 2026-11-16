# Data Model: Acceso y roles

Todas las fechas se guardan en UTC. Los borrados son lógicos (`deletedAt`) y toda consulta lo filtra.

**Convenciones de base de datos** (`docs/Conventions.md` §4): modelos Prisma en `PascalCase` singular; tablas en `snake_case` plural con `@@map` (`users`, `sessions`, `verification_codes`); columnas en `snake_case` con `@map`. Todas las tablas llevan `id` (UUID), `createdAt` y `updatedAt`; las entidades con borrado lógico, además `deletedAt`, y las consultas filtran siempre `deletedAt: null`. Una migración ya aplicada nunca se edita.

## User

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| email | texto | Único (sobre el valor normalizado: minúsculas, sin espacios); su dominio se valida contra el rol |
| passwordHash | texto | argon2id; nunca se expone ni se registra |
| role | enum | `SUPERADMIN`, `TEACHER`, `STUDENT` |
| status | enum | `ACTIVE`, `INACTIVE` |
| emailVerifiedAt | fecha, nulo | Nulo = sin verificar. Estudiantes: obligatorio para iniciar sesión. Docentes y CAE: se fija al crearlos |
| mustChangePassword | booleano | `true` para docentes recién creados y el CAE inicial |
| locale | enum | `es`, `en`; por defecto el del dispositivo al registrarse |
| createdAt, updatedAt | fecha | |
| deletedAt | fecha, nulo | Borrado lógico; el correo sigue ocupado (FR-025) |

Perfiles (`StudentProfile`, `TeacherProfile`) son los de `docs/Architecture.md` §5; aquí solo se crean con los nombres que reciba el alta.

**Dominios válidos**: `STUDENT` → dominio de estudiantes; `TEACHER` y `SUPERADMIN` → dominio de docentes y administrativos. Ambos se leen de configuración.

### Transiciones de estado

```text
(registro) → STUDENT sin verificar ──código correcto──▶ STUDENT verificado
(CAE crea) → TEACHER con mustChangePassword ──cambio de clave──▶ TEACHER normal
                                              └─restablecer por código─▶ TEACHER normal
ACTIVE ⇄ INACTIVE   (la administración completa la define otra funcionalidad)
cualquier estado ──borrado lógico──▶ deletedAt fijado (sin retorno en esta funcionalidad)
```

Puede iniciar sesión solo si: `status = ACTIVE`, `deletedAt` nulo y, para estudiantes, `emailVerifiedAt` no nulo.

## Session (una por dispositivo)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK; viaja en el JWT de acceso |
| userId | FK User | |
| refreshTokenHash | texto | Hash del token opaco vigente |
| previousRefreshTokenHash | texto, nulo | Hash del token que se acaba de rotar; presentarlo de nuevo revoca la sesión |
| deviceLabel | texto, nulo | Modelo o plataforma, informativo |
| createdAt, updatedAt | fecha | |
| lastUsedAt | fecha | Se actualiza al renovar |
| expiresAt | fecha | `lastUsedAt` + 30 días (configurable) |
| revokedAt | fecha, nulo | Cierre de sesión, restablecer clave, pérdida de acceso o reutilización de un token rotado |

Válida si `revokedAt` es nulo y `expiresAt` es futuro. Eliminar la cuenta o restablecer la clave revoca todas las sesiones del usuario.

## VerificationCode

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| userId | FK User | |
| purpose | enum | `EMAIL_VERIFICATION`, `PASSWORD_RESET` |
| codeHash | texto | HMAC del código de 6 dígitos |
| expiresAt | fecha | 24 h verificación, 1 h recuperación (configurable) |
| attempts | entero | Máximo 5; al agotarse el código queda inutilizable |
| usedAt | fecha, nulo | Un solo uso |
| createdAt, updatedAt | fecha | `createdAt` se usa para la espera de 60 s y el máximo de 5 por hora |

Como mucho un código vigente (sin usar y sin vencer) por usuario y propósito: emitir uno nuevo invalida el anterior.

## Configuración (lectura)

Claves de `Setting` usadas por esta funcionalidad, con sus valores por defecto: `auth.studentEmailDomain` (`uts.edu.co`), `auth.staffEmailDomain` (`correo.uts.edu.co`), `auth.passwordMinLength` (8), `auth.sessionInactivityDays` (30), `auth.verificationCodeTtlHours` (24), `auth.resetCodeTtlMinutes` (60), `auth.codeMaxAttempts` (5), `auth.resendCooldownSeconds` (60), `auth.resendMaxPerHour` (5), `auth.loginMaxFailures` (5), `auth.loginLockoutMinutes` (15).

## Mapa de requisitos

| Requisito | Dónde se cumple |
|---|---|
| FR-006, 007, 010, 013, 032 | `User.email`, dominios de configuración |
| FR-008, 009, 019 | `emailVerifiedAt`, `VerificationCode` |
| FR-014, 015, 016, 016a | `mustChangePassword` |
| FR-022, 024, 025 | `status`, `deletedAt`, `Session.revokedAt` |
| FR-026, 027, 027a | `Session` |
| FR-017, 029 | `User.locale` |
