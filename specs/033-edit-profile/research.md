# Research: Editar mi nombre

Decisiones que fijan el diseño. Sin incógnitas abiertas.

| # | Tema | Decisión | Alternativas descartadas |
|---|---|---|---|
| 1 | Endpoint | `PATCH /students/me` con `@Roles('STUDENT')`, dentro de `StudentsModule`. La ruta literal `me` no choca con `:id` (que solo existe en GET, POST y DELETE) | `PATCH /auth/profile` (mezcla perfil con autenticación y exigiría ramificar por rol); `PATCH /users/me` (no hay módulo de usuarios y habría que filtrar roles dentro) |
| 2 | Permiso | El guard de roles rechaza docente y CAE con el error de permisos existente; el servicio solo opera sobre el `userId` del token, nunca sobre un id recibido | Recibir el id en la ruta (permitiría intentar cuentas ajenas) |
| 3 | Validación | DTO con `firstName` y `lastName`: texto, recortado, obligatorio, máximo 100, igual que `registration.dto.ts`. El máximo sale de una constante compartida con el registro, no de un número nuevo | Reglas de caracteres (el registro no las tiene; endurecer una sola entrada sería inconsistente) |
| 4 | Sin cambios | Si tras recortar el nombre y apellido son iguales a los guardados, responde 200 con la cuenta y no escribe ni actualiza nada ni deja registro | Registrar de todas formas (llenaría el registro de ruido) |
| 5 | Registro | Tabla `student_name_changes` de solo inserción, escrita en la misma transacción que la actualización del perfil. Sin `deletedAt`: nunca se borra ni se edita, así que no hay nada que ocultar. Sin pantalla ni endpoint de lectura | Guardarlo en el perfil como JSON (se pierde la integridad); guardarlo solo en logs (no es durable ni consultable) |
| 6 | Cuenta desactivada | Si la cuenta no está activa o está borrada, el servicio responde con el error existente de cuenta no disponible y no cambia nada | Permitirlo (el estudiante desactivado no puede ni iniciar sesión) |
| 7 | Respuesta | Devuelve el mismo `UserSummary` que `GET /auth/me`, para que la app actualice la sesión sin otra petición | Responder 204 y volver a pedir `/auth/me` (un viaje más sin beneficio) |
| 8 | App: pantalla | Ruta sin pestaña `account-name` solo en `(student)`, declarada en `ROLE_TABS.STUDENT.hidden` como `account` y `account-password` (D-121, D-129). Formulario con los campos y el botón existentes | Hoja modal (sin regreso estándar ni pruebas de ruta, descartada ya en D-129) |
| 9 | App: reflejo del cambio | `onSuccess` hace `setUser` con la respuesta e invalida las consultas que muestran nombres de otras personas (conversaciones y mensajes del chat, PQRS) | Reiniciar la sesión (la spec lo prohíbe en FR-006) |
| 10 | Docente y CAE | `AccountScreen` ya recibe el rol: el estudiante ve la acción «Editar nombre»; el docente ve la regla «Tu nombre lo gestiona el CAE»; el CAE ve su correo como identificador, sin texto extra | Una pantalla distinta por rol (rompe FR-006 de la spec 032) |
| 11 | Traducciones | Claves nuevas bajo `account.name.*`; todo en es y en, con la paridad que ya comprueba una prueba | Textos en el componente (prohibido) |
| 12 | Decisión | D-130 en `docs/Decisions.md` | — |

## Hallazgos del código

- `profileOf` ya devuelve el `UserSummary` con `firstName` y `lastName` desde `StudentProfile` y `TeacherProfile`; el CAE no tiene perfil y no cambia.
- No existe ninguna tabla de auditoría; el registro de esta spec es la primera, pero se mantiene mínimo y propio de este caso (no se crea un sistema de auditoría genérico).
- El chat y los avisos leen el nombre del perfil en cada consulta, por eso un cambio se refleja sin reescribir datos históricos.
