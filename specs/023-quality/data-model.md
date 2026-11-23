# Data Model: Calidad: seguridad, accesibilidad y rendimiento

**Sin tablas, columnas, enums ni migraciones.** Esta spec no cambia el esquema de `tutorias_uts_db`; solo agrega una semilla de datos de volumen para una base de carga aparte.

## Política de acceso de rutas (en el código de prueba)

Vive en `tutorias_uts_back/test/utils/route-policy.ts`. Cada entrada es `MÉTODO /ruta` con su motivo.

| Lista | Qué contiene | Regla |
|---|---|---|
| `PUBLIC_ROUTES` | Las rutas con `@Public`: hoy `POST /api/v1/auth/register`, `verify-email`, `resend-verification`, `login`, `forgot-password`, `reset-password` y `refresh` | Toda ruta `@Public` debe estar aquí y toda entrada de aquí debe existir; cada una lleva el límite de tasa de `PublicThrottlerGuard` |
| `ANY_ROLE_ROUTES` | Las rutas sin `@Roles` a propósito: lo que puede usar cualquier rol con sesión (por ejemplo `GET /auth/me`, cerrar sesión, cambiar la propia clave, las notificaciones, el chat, `GET /pqrs/limits`, el registro del dispositivo) | Cada entrada lleva su motivo; una entrada que ya no existe, o una ruta sin `@Roles` que no está aquí, hace fallar la prueba |
| (con `@Roles`) | Todas las demás | La regla ya está en el código; la prueba solo comprueba que exista |

`auditRoutes(routes, policy)` devuelve la lista de problemas: `{ route, problem }` con `problem` en `MISSING_RULE`, `PUBLIC_NOT_LISTED`, `STALE_PUBLIC_ENTRY` o `STALE_ANY_ROLE_ENTRY`. Una lista vacía significa que todo cumple.

## Claves prohibidas en respuestas (en el código de prueba)

Vive en `tutorias_uts_back/test/response-secrets.e2e-spec.ts`.

| Regla | Qué busca | Excepciones |
|---|---|---|
| Credenciales | claves `passwordHash`, `password`, `refreshToken`, `accessToken`, `secret`, la clave de SMTP, `verificationCode`, `resetCode`, `codeHash` | Los tokens de `login`, `register` y `refresh`; la `temporaryPassword` de un docente al crearlo o regenerar su clave (se muestra una vez) |
| Contacto ajeno | claves `email` y `phone` en cualquier respuesta del docente o del estudiante | La del propio perfil (`/auth/me`); lo que la spec 016 y la 017 dan al CAE no se prohíbe |

## Pares de contraste (en el código de prueba)

Vive en `tutorias_uts_mobile/src/theme/__tests__/contrast.test.ts`. Cada par es `(color de texto o ícono, fondo, mínimo)` y se evalúa en la paleta clara y en la oscura.

| Par | Mínimo |
|---|---|
| Texto principal y secundario sobre fondo, tarjeta y pantalla | 4,5:1 |
| Blanco sobre primario, sobre error y sobre el fondo de un botón destructivo | 4,5:1 |
| Texto verde oscuro sobre acento, éxito y advertencia | 4,5:1 |
| Enlace y error sobre tarjeta | 4,5:1 |
| Primario, éxito, advertencia y error como íconos sobre tarjeta | 3:1 |

## Conjunto de datos de volumen (`seed:load`)

Se carga solo en una base cuyo nombre termina en `_load` y con `LOAD_SEED_CONFIRM=yes`. Determinista: dos corridas dan los mismos datos. Todos los usuarios usan la clave de pruebas de las e2e.

| Dato | Cantidad | Detalle |
|---|---|---|
| Periodos académicos | 3 | uno activo y dos cerrados |
| Sedes y salones | 15 sedes, 60 salones | capacidades de 15 a 60 |
| Docentes | 40 | 3 desactivados |
| Estudiantes | 500 | 25 desactivados y 10 eliminados lógicos |
| Módulos | 200 | 10 eliminados lógicos; 2 horarios semanales cada uno, sin cruces de docente ni de salón |
| Sesiones | al menos 4.000 | con cancelaciones por festivo y por el docente, y reprogramaciones |
| Inscripciones | unas 4.000 | activas y canceladas con vigencia; cada estudiante en 2 a 12 módulos sin cruces |
| Sesiones omitidas | unas 300 | |
| PQRS | 200 | en los tres estados, con respuestas en las "En revisión" y "Resueltas" |
| Chats | 60 directos y los de módulo | hasta 1.500 mensajes en la conversación más grande |
| Avisos | unos 2.000 | leídos y sin leer |

Usuarios fijos para la medición: un CAE, un docente con 8 módulos y un estudiante con 10 inscripciones.

## Informe de medición (no se guarda)

Una tabla impresa por `npm run perf`: endpoint, rol, mediana y p95 en milisegundos, la meta (`PERF_MAX_MS`, 300 por defecto) y si la cumple, junto con el entorno (sistema, procesador y memoria). Se anota en las notas de `tasks.md`; no es una prueba que decida nada por sí sola fuera de esa corrida.
