# Research: Acceso y roles

El stack ya está fijado en `docs/Architecture.md`; aquí se resuelven los puntos abiertos del plan.

## 1. Estrategia de sesión

- **Decision**: JWT de acceso de vida corta (15 min) + refresh token opaco aleatorio (256 bits), uno por dispositivo, guardado como hash en la tabla `Session`. Cada renovación rota el token y extiende la caducidad 30 días (ventana deslizante). Si se presenta un refresh token ya rotado, se revoca esa sesión.
- **Rationale**: Cumple `Architecture.md` §7, la caducidad de 30 días por inactividad y el cierre por dispositivo (FR-026, FR-027, FR-027a).
- **Alternatives considered**: Sesión únicamente con JWT largo (no permite cerrar sesión en el servidor); sesión de servidor con cookies (no encaja en móvil).

## 2. Efecto inmediato de desactivar o borrar una cuenta

- **Decision**: El guard de autenticación carga el usuario en cada petición y rechaza si está desactivado, con `deletedAt` o si la sesión está revocada o caducada.
- **Rationale**: Un JWT de 15 min seguiría válido tras desactivar la cuenta; la consulta por petición es barata y cumple FR-022 y FR-024 sin lista negra.
- **Alternatives considered**: Confiar solo en la expiración del JWT (deja una ventana de acceso); lista negra en Redis (más piezas para el mismo resultado).

## 3. Códigos de verificación y recuperación

- **Decision**: Código numérico de 6 dígitos generado con un generador criptográfico. Se guarda solo su HMAC (con un secreto del servidor), con propósito (`EMAIL_VERIFICATION` o `PASSWORD_RESET`), vencimiento (24 h y 1 h, configurables), un solo uso y máximo 5 intentos. Solo hay un código vigente por usuario y propósito: uno nuevo invalida el anterior. Reenvío: espera de 60 s entre envíos y máximo 5 por hora.
- **Rationale**: 6 dígitos son fáciles de escribir pero débiles ante fuerza bruta; el límite de intentos y el vencimiento corto lo compensan. Guardar el HMAC evita exponer códigos si se filtra la base.
- **Alternatives considered**: Enlace con token largo (requiere enlaces profundos en iOS y Android); contraseña de un solo uso por SMS (no hay proveedor).

## 4. Hash de contraseñas

- **Decision**: argon2id con los parámetros por defecto recomendados de la librería. Política: mínimo 8 caracteres, con letras y números.
- **Rationale**: Es lo definido en `Architecture.md` §2.
- **Alternatives considered**: bcrypt (más antiguo, sin ventaja aquí).

## 5. Límites de intentos

- **Decision**: Inicio de sesión: 5 fallos en 15 min por combinación correo + IP bloquean 15 min; registro y recuperación: 10 solicitudes por hora por IP. Todo en configuración. Las respuestas de bloqueo incluyen el tiempo de espera para mostrárselo al usuario (FR-005).
- **Rationale**: Equilibra seguridad y el caso de un estudiante que se equivoca varias veces. Resuelve el pendiente "Outstanding" de límites exactos.
- **Alternatives considered**: Bloqueo permanente de la cuenta tras N fallos (permite bloquear a otro a propósito).

## 6. Correo en desarrollo y en producción

- **Decision**: El módulo de correo lee `SmtpConfig` de la base de datos (según `Architecture.md`). Mientras la pantalla de configuración (otra funcionalidad) no exista, se acepta una configuración inicial por variables de entorno, usada solo si no hay registro en la base. En desarrollo, un contenedor Mailpit en `docker-compose` recibe los correos. Los envíos van por cola (BullMQ).
- **Rationale**: Permite probar el flujo completo sin depender del proveedor SMTP institucional, que sigue pendiente (`CLAUDE.md`).
- **Alternatives considered**: Imprimir códigos en consola (filtra códigos a los logs, prohibido por la constitución).

## 7. Cuenta inicial del CAE

- **Decision**: Un script de siembra crea el primer usuario SUPERADMIN con correo y contraseña tomados de variables de entorno; la cuenta nace con cambio de clave obligatorio. Nunca se versionan credenciales.
- **Rationale**: Resuelve la suposición de que el CAE no se registra solo, sin agregar un flujo de creación de administradores.
- **Alternatives considered**: Endpoint público de "primer administrador" (riesgo de seguridad).

## 8. Efecto de recuperar la contraseña

- **Decision**: Restablecer con éxito cierra todas las sesiones (FR-020), quita `mustChangePassword` (FR-016a) y marca el correo como verificado, porque el código demuestra que la persona controla el correo.
- **Rationale**: Evita que un estudiante sin verificar quede atrapado entre "verifica tu correo" y "recupera tu contraseña".
- **Alternatives considered**: Exigir verificación aparte tras recuperar (un paso extra sin beneficio de seguridad).

## 9. Respuestas que no revelan información

- **Decision**: Login con credenciales incorrectas y recuperación de contraseña devuelven la misma respuesta exista o no el correo (FR-004, FR-018). El registro sí informa si el correo ya está verificado, porque la spec lo exige (FR-010). Los errores usan códigos estables (`EMAIL_DOMAIN_NOT_ALLOWED`, `ACCOUNT_DISABLED`, `EMAIL_NOT_VERIFIED`, `RATE_LIMITED`, etc.) que la app traduce.
- **Rationale**: Mantiene el texto visible en los archivos de traducción (Principio VI).
- **Alternatives considered**: Mensajes de texto desde la API (rompe la internacionalización).

## 10. Navegación por rol en la app

- **Decision**: Un layout raíz lee el estado de sesión y redirige: sin sesión → `(auth)`; con `mustChangePassword` → `change-password` (sin otra ruta accesible); si no → `(admin)`, `(teacher)` o `(student)` según el rol. Cada grupo muestra sus pestañas de `Design.md` con pantallas de estado vacío. El CAE tiene además la pantalla de creación de docente.
- **Rationale**: Cumple FR-002 y FR-015 y deja listo el esqueleto para las siguientes funcionalidades.
- **Alternatives considered**: Una sola navegación con pestañas condicionales (mezcla roles, más propensa a fugas).
