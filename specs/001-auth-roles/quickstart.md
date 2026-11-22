# Quickstart: validar Acceso y roles

Guía para comprobar de punta a punta que la funcionalidad cumple la spec. Contratos en
[contracts/auth-api.yaml](contracts/auth-api.yaml); entidades en [data-model.md](data-model.md).

## Prerrequisitos

- Docker (PostgreSQL, Redis y Mailpit para ver los correos), Node.js 20 LTS.
- Variables de entorno del backend (en un `.env` local, **no versionado**): conexión a la base,
  secreto del JWT, secreto de HMAC de códigos, y credenciales del CAE inicial para la siembra.

## Arranque

```bash
docker compose up -d
cd backend && npx prisma migrate dev && npx prisma db seed   # crea el CAE inicial
npm run start:dev
cd ../mobile && npx expo start
```

Los correos de código se ven en la interfaz web de Mailpit (puerto indicado en `docker-compose.yml`).

## Pruebas automatizadas

```bash
cd backend && npm run test && npm run test:e2e
cd ../mobile && npm run lint && npm run typecheck && npm run test
```

## Escenarios de validación manual

| # | Escenario | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Registrar un estudiante con `@uts.edu.co` | Llega un código de 6 dígitos a Mailpit; no puede iniciar sesión aún | US1 |
| 2 | Registrar con `@correo.uts.edu.co` o `@gmail.com` | Rechazo con el mensaje del dominio requerido | US1 |
| 3 | Escribir un código incorrecto 5 veces | El código queda inutilizable; se ofrece reenviar | US1 |
| 4 | Verificar con el código correcto e ingresar | Se ve la navegación de estudiante | US1, US2 |
| 5 | Iniciar sesión como CAE (siembra) | Obliga a cambiar la clave, luego muestra la navegación del CAE | US2 |
| 6 | Como CAE, crear un docente con `@correo.uts.edu.co` | Diálogo con la clave temporal una sola vez y botón de copiar | US3 |
| 7 | Cerrar el diálogo y reintentar verla | No es posible | US3 |
| 8 | Iniciar sesión como el docente | Solo se accede a "cambiar contraseña" hasta completarlo | US3 |
| 9 | Docente pierde la clave: usar "Recuperar contraseña" | Tras restablecer, ya no se exige otro cambio | US3, US4 |
| 10 | Recuperar contraseña con un correo inexistente | Misma respuesta que con uno existente | US4 |
| 11 | Restablecer la contraseña estando con sesión en otro dispositivo | La otra sesión queda cerrada | US4 |
| 12 | Cerrar la app por completo y reabrirla | Sigue dentro de su rol | US5 |
| 13 | Cerrar sesión en un dispositivo con dos sesiones | Solo cae la del dispositivo actual | US5 |
| 14 | Marcar una cuenta como `INACTIVE` o con `deletedAt` en la base | No inicia sesión; la sesión abierta cae en la siguiente petición | US6 |
| 15 | Cambiar el idioma del dispositivo a inglés, español y otro | Textos y correos en el idioma esperado (español por defecto) | US7 |
| 16 | Hacer 5 inicios de sesión fallidos seguidos | Bloqueo temporal con el tiempo de espera visible | FR-005 |
| 17 | Con un token de estudiante, llamar `POST /teachers` | 403 `FORBIDDEN_ROLE` | FR-003 |

## Criterio de terminado

Las pruebas automáticas pasan, los 17 escenarios se comportan como se describe y no aparece
ningún texto fijo en los componentes ni ningún secreto en el repositorio ni en los logs.

## Resultado de la validación (T094)

Fecha: 2026-11-16. API real (`nest start`) contra PostgreSQL, Redis y Mailpit de `docker-compose`, con correos entregados por SMTP y la cola BullMQ. Se ejecutaron por HTTP con un guion (los escenarios de la app se cubren con sus pruebas de componentes). Para la corrida se subió el límite de peticiones públicas (`THROTTLE_PUBLIC_LIMIT=1000`).

| # | Resultado | Evidencia |
|---|---|---|
| 1 | ✅ | Correo "Verifica tu correo" con código de 6 dígitos; login → 403 `EMAIL_NOT_VERIFIED` |
| 2 | ✅ | `@correo.uts.edu.co` y `@gmail.com` → 422 `EMAIL_DOMAIN_NOT_ALLOWED` |
| 3 | ✅ | 5 × `CODE_INVALID`; el código correcto → `CODE_ATTEMPTS_EXCEEDED`; el reenvío responde 202 con temporizador |
| 4 | ✅ | Reenvío tras 60 s, verificación 204 y login 200 con rol `STUDENT` |
| 5 | ✅ | CAE sembrado: `mustChangePassword`, cambia la clave y entra como `SUPERADMIN` |
| 6 | ✅ | `POST /teachers` → 201 con clave temporal de 12 caracteres (el diálogo con botón copiar se prueba en `teacher-flow.test.tsx`) |
| 7 | ✅ | En la base solo hay su hash y no reaparece en ninguna respuesta |
| 8 | ✅ | Con clave temporal, otras rutas → 403 `PASSWORD_CHANGE_REQUIRED`; `me` sigue disponible |
| 9 | ✅ | Tras restablecer por código, `mustChangePassword` es falso |
| 10 | ✅ | Mismo 202 y misma forma con correo existente e inexistente |
| 11 | ✅ | Las dos sesiones abiertas → 401 tras restablecer |
| 12 | ✅ (API) | `refresh` 200 conserva el rol; la restauración al abrir la app se prueba en `session-restore.test.tsx`. No se probó en un emulador. |
| 13 | ✅ | Solo cae el dispositivo que cerró sesión |
| 14 | ✅ | `INACTIVE` → `ACCOUNT_DISABLED` (sesión abierta cae en la siguiente petición); `deletedAt` → `ACCOUNT_UNAVAILABLE` |
| 15 | ✅ (correos) | Correo en inglés y en español según el idioma guardado; el idioma de la app se prueba en `i18n.test.ts`. No se probó cambiando el idioma de un dispositivo. |
| 16 | ✅ | 6.º intento → 429 `RATE_LIMITED` con `retryAfterSeconds` |
| 17 | ✅ | Token de estudiante en `POST /teachers` → 403 `FORBIDDEN_ROLE` |

El log de la API no contiene contraseñas, códigos ni tokens (solo las rutas mapeadas) y no registró errores. Pendiente de una persona: recorrer las pantallas en un emulador o dispositivo (escenarios 12 y 15 con interfaz).
