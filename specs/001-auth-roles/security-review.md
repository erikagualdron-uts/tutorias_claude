# Revisión de seguridad: `auth/` (T093)

Alcance: `tutorias_uts_back/src/auth/`, `src/common/guards/`, `src/teachers/` y `src/mail/`. Fecha: 2026-11-16.

## Corregido en esta revisión

| # | Hallazgo | Corrección |
|---|---|---|
| 1 | **Carrera en los intentos de un código**: leer `attempts` y luego incrementarlo permitía superar el límite de 5 con peticiones paralelas. | El intento se reserva con un `updateMany` condicional (`attempts < max`) antes de comparar. Prueba e2e con 20 intentos paralelos. |
| 2 | **Canal de tiempo en el registro**: un correo nuevo calculaba argon2 y uno sin verificar no, lo que delataba si la cuenta existía. | La contraseña se hashea antes de consultar el correo. |
| 3 | El hash del refresh token usaba `JWT_SECRET` sin separación de uso. | Prefijo `refresh-token:` en el HMAC. |
| 4 | El JWT no fijaba el algoritmo al firmar ni al verificar. | `HS256` explícito en `signOptions` y `verifyOptions`. |
| 5 | Swagger quedaba expuesto en `/api/docs` en cualquier entorno. | Solo se monta si `NODE_ENV !== 'production'`. |

## Verificado sin cambios

| Tema | Resultado |
|---|---|
| Comparaciones en tiempo constante | Códigos con `timingSafeEqual`; contraseñas con `argon2.verify`; el token de renovación se busca por su HMAC (256 bits aleatorios). |
| Enumeración de cuentas | Login, recuperación y reenvío responden igual exista o no la cuenta; con correo inexistente el login verifica contra un hash ficticio. El estado de la cuenta solo se revela con la contraseña correcta. El registro sí informa "ya registrado" porque la spec lo exige (FR-010). |
| Bloqueo de login | 5 fallos por correo + IP; el bloqueo se comprueba antes de consultar al usuario. |
| Rotación de tokens | Rotación atómica (`updateMany`); un token ya rotado revoca la sesión (probado). |
| Cuentas desactivadas o borradas | El guard consulta usuario y sesión en cada petición. |
| Secretos | Contraseñas y claves temporales solo como hash argon2; códigos como HMAC; sin cuerpos en los logs (prueba de redacción). |

## Riesgos aceptados o pendientes de decisión

| Riesgo | Por qué queda así / qué hace falta |
|---|---|
| El bloqueo de login es por correo + IP: quien rota de IP lo evita, y un límite por cuenta permitiría bloquear a otros a propósito (descartado en D-034). | Aceptado. Los límites por IP del registro y la recuperación y el límite de intentos por código acotan el daño. |
| `req.ip` detrás de un proxy sería la IP del proxy: el bloqueo y el límite de peticiones se compartirían entre todos los usuarios. | **Pendiente**: configurar `trust proxy` cuando se defina el lugar de despliegue (`CLAUDE.md`, "Pendientes por definir"). |
| El código de verificación viaja en texto plano dentro del trabajo de BullMQ en Redis hasta que se envía (el trabajo se elimina al terminar). | Aceptado: Redis es interno y el código dura poco. Proteger Redis con contraseña y red privada en producción. |
| Cambiar la contraseña con sesión iniciada no cierra las demás sesiones (la recuperación sí). | La spec no lo pide. Se puede agregar si el CAE lo requiere. |
| Sin cabeceras de seguridad (`helmet`) ni CORS. | La API solo la consume la app móvil. Revisar si se agrega un cliente web. |
| El límite de peticiones públicas usa memoria del proceso. | Suficiente con una instancia; con varias habría que mover el almacenamiento a Redis. |
