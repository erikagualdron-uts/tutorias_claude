# Implementation Plan: Acceso y roles

**Branch**: `001-auth-roles` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-auth-roles/spec.md`

## Summary

Inicio de sesión con correo y contraseña, tres roles con navegación propia, registro de
estudiantes con verificación por código, creación de docentes por el CAE con clave temporal,
recuperación de contraseña por código, bloqueo de cuentas desactivadas o borradas, sesión
persistente por dispositivo (30 días de inactividad) y cierre de sesión.

Enfoque técnico (detalle en [research.md](research.md)): API NestJS con JWT de acceso corto y
refresh token opaco rotativo guardado por dispositivo; el guard de autenticación consulta el
estado de la cuenta en cada petición, de modo que desactivar o borrar una cuenta surte efecto
de inmediato. Códigos de 6 dígitos con hash, vencimiento, un solo uso y límite de intentos. La
app Expo guarda el refresh token en `expo-secure-store` y enruta por rol con Expo Router.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS en backend; Expo SDK vigente en la app)

**Primary Dependencies**: Backend: NestJS, Prisma, `@nestjs/jwt`, `@nestjs/throttler`, argon2,
class-validator, Nodemailer, BullMQ. App: Expo Router, TanStack Query, Zustand, React Hook Form
+ Zod, i18next + expo-localization, expo-secure-store.

**Storage**: PostgreSQL (Prisma) para usuarios, sesiones y códigos; Redis solo para colas de
correo.

**Testing**: Backend: Jest (unitarias) y pruebas e2e con Supertest sobre PostgreSQL de prueba.
App: Jest + React Native Testing Library para formularios y enrutamiento por rol.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service (`mobile/` y `backend/`).

**Performance Goals**: Inicio de sesión de punta a punta en menos de 10 s (SC-002); respuesta
de la API de login por debajo de 1 s en condiciones normales (el hash de contraseña domina).

**Constraints**: Reglas siempre validadas en el backend; sin textos fijos en componentes; fechas
en UTC; dominios, vencimientos, límites e intentos en configuración; ningún secreto en el
repositorio ni en logs.

**Scale/Scope**: Una institución, hasta algunos miles de usuarios; 8 pantallas de acceso, un
formulario de creación de docente y tres conjuntos de pestañas vacías por rol.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Architecture.md` (JWT access + refresh, argon2, rate limiting, `mustChangePassword`) y `Design.md`. Cambios a docs: ver "Actualizaciones de docs/". |
| II. Reglas de negocio en backend | Dominios, estados de cuenta, rol y bloqueos se validan en la API; la app solo refleja. (Las reglas de cupo y horarios no aplican a esta funcionalidad.) |
| III. Integridad de datos | Se usa `deletedAt` (sin borrado físico), fechas en UTC y dominios/vencimientos en configuración. |
| IV. Seguridad y privacidad | Guards de roles en cada endpoint, clave temporal mostrada una vez, hash de contraseñas y códigos, sin secretos en logs. |
| V. Pruebas primero | Aunque las reglas críticas del Principio II no aplican aquí, las reglas de acceso (dominios, bloqueos, clave temporal, sesión) tienen pruebas e2e antes de cerrar cada historia. |
| VI. Internacionalización | Textos de la app y de los correos en archivos es/en; los errores de la API devuelven códigos que la app traduce. |
| VII. Diseño consistente | Pantallas según `Design.md` (inputs, botones, banners, regla visible en acciones bloqueadas). |
| VIII. Desarrollo incremental | Una funcionalidad, una rama; las historias se implementan por prioridad. |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones. Se vuelve a revisar tras el diseño (ver abajo): pasa.

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-roles/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── auth-api.yaml
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code (repository root)

```text
backend/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                 # cuenta inicial del CAE desde variables de entorno
├── src/
│   ├── auth/                   # login, registro, verificación, recuperación, sesiones, guards
│   ├── users/                  # entidad base y reglas de estado de cuenta
│   ├── teachers/               # POST /teachers (creación por el CAE)
│   ├── settings/               # lectura de dominios, vencimientos y límites
│   ├── mail/                   # envío de correos de código y plantillas es/en
│   └── common/                 # guards de roles, filtros de error, utilidades de tiempo
└── test/                       # pruebas e2e

mobile/
├── app/                        # solo rutas: cada archivo ensambla una pantalla de features/
│   ├── (auth)/                 # login, register, verify-email, forgot-password, reset-password
│   ├── change-password.tsx     # bloqueo por clave temporal
│   ├── (admin)/                # pestañas del CAE (vacías) + creación de docente
│   ├── (teacher)/              # pestañas del docente (vacías)
│   └── (student)/              # pestañas del estudiante (vacías)
└── src/
    ├── api/                    # cliente HTTP y renovación de sesión
    ├── components/             # Button, TextField, Banner, EmptyState, AppBar, diálogos
    ├── features/
    │   ├── auth/               # screens/, hooks/, api/, schemas.ts, types.ts
    │   ├── teachers/           # screens/CreateTeacherScreen.tsx (alta por el CAE)
    │   └── shell/              # screens/ de las pestañas vacías por rol
    ├── i18n/                   # es.json, en.json
    ├── store/                  # estado de sesión
    └── theme/                  # tokens generados de Design.md
```

**Structure Decision**: Se sigue la estructura de `docs/Architecture.md` §3 (app Expo con
grupos de rutas por rol y API NestJS por módulos) y `docs/Conventions.md` §4–5: las rutas de
Expo Router solo ensamblan pantallas y la lógica vive en `src/features/<feature>/`. La API usa
el prefijo `/api/v1` y el formato de error de `Conventions.md` §4.

## Actualizaciones de docs/ (mismo cambio, por la constitución)

- `docs/Architecture.md` §5: agregar `Session` y `VerificationCode`; añadir `emailVerifiedAt` a `User`.
- `docs/Architecture.md` §7: verificación y recuperación por **código de 6 dígitos**; sesión de 30 días de inactividad por dispositivo; el guard consulta el estado de la cuenta en cada petición.
- `docs/Context.md` §7: sin cambios de reglas (solo se concreta lo ya definido).

## Complexity Tracking

Sin violaciones; no aplica.
