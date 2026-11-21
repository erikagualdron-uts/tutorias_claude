# Research: Gestión de cuentas de docentes y estudiantes

Sin `NEEDS CLARIFICATION` pendientes. Las decisiones salen de revisar `tutorias_uts_back`, `tutorias_uts_db` y `tutorias_uts_mobile` el 2026-11-21.

## R1. Pérdida de acceso inmediata

- **Decision**: no se agrega nada al guard. Basta con cambiar `User.status` o `User.deletedAt` y llamar a `SessionService.revokeAllForUser`.
- **Rationale**: `JwtAuthGuard` carga la sesión y el usuario en **cada** petición (`SessionService.validate` → `assertUsable`, que rechaza `deletedAt` con `ACCOUNT_UNAVAILABLE` y un estado distinto de `ACTIVE` con `ACCOUNT_DISABLED`). Un token de acceso vigente deja de servir en la siguiente petición. `revokeAllForUser` además revoca los refresh tokens y descarta los dispositivos push, así que no vuelve a recibir avisos.
- **Alternatives considered**: lista negra de tokens en Redis (innecesaria: la consulta por petición ya existe); cerrar solo las sesiones sin cambiar el estado (el inicio de sesión volvería a funcionar).

## R2. Una entrega ya creada para una cuenta dada de baja

- **Decision**: `DeliveriesService` revisa, al entregar push y correo, que la cuenta siga activa y sin borrar; si no, cierra la entrega como `SKIPPED` con causa `ACCOUNT_UNAVAILABLE` y no la reintenta.
- **Rationale**: la resolución de destinatarios ya excluye cuentas inactivas (`u.status = 'ACTIVE' AND u.deleted_at IS NULL` en `recipients.ts` y `seats.ts`), pero una entrega de correo que quedó `PENDING` antes de la baja se enviaría igual cuando el barrido la retome. FR-013 pide que no salga "desde el momento de la acción". El push ya se corta porque `revokeAllForUser` borra los dispositivos.
- **Alternatives considered**: cancelar las entregas pendientes dentro de la transacción de baja (acopla este módulo al de notificaciones y no cubre las que se crean entre medias); dejar que el barrido las descarte con el tiempo (no cumple FR-013).

## R3. Baja de un estudiante: inscripciones, cupo y bloqueos

- **Decision**: una transacción por baja, con el orden de D-092: periodo activo `FOR SHARE`, fila del estudiante `FOR UPDATE` y luego los módulos con inscripción vigente `FOR UPDATE` **ordenados por `id`**. Dentro de ella: cancelar las inscripciones `ACTIVE` del estudiante en módulos del periodo activo (`status = CANCELLED`, `cancelledAt = ahora`, `effectiveUntil = ahora`), poner `status = INACTIVE` (desactivar) o `deletedAt = ahora` (eliminar) y devolver cuántas se cancelaron. Cerrar las sesiones del estudiante después de confirmar.
- **Rationale**: con `effectiveUntil = ahora` el cupo queda libre para toda sesión que empiece después de ese instante y las sesiones ya dadas conservan al estudiante (historial), sin esperar la hora de gracia de D-091, que existe para proteger a quien cancela por su cuenta, no a una baja del CAE. El mismo orden de bloqueo que `enroll` evita interbloqueos y una inscripción simultánea del mismo estudiante queda serializada por su fila. Solo se cancelan inscripciones del periodo activo: los módulos de un periodo Cerrado son de solo lectura y los de uno Próximo no admiten inscripciones. Si no hay periodo activo (entre semestres) no hay inscripciones vigentes que cancelar: la baja cambia la cuenta y responde `cancelledEnrollments: 0`.
- **Reactivar no restaura** (spec, FR-010): la inscripción queda `CANCELLED`; el estudiante se inscribe de nuevo si hay cupo.
- **Alternatives considered**: dejar que el cupo se libere solo porque `seats.ts` solo cuenta estudiantes activos (reactivar devolvería el cupo sin que nadie lo ocupe a propósito, contra la regla); `effectiveUntil = ahora + 1 hora` como D-091 (retiene un cupo por una baja que no lo merece); aislamiento `SERIALIZABLE` (D-092 ya lo descartó).

## R4. Docentes: qué pasa con los módulos

- **Decision**: no se toca ningún módulo. Desactivar o eliminar a un docente solo cambia su cuenta; los módulos quedan marcados "docente no disponible" por la regla existente (D-088). La respuesta de la baja trae `unavailableModules` (los módulos del periodo activo que tenía) para el aviso final.
- **Rationale**: D-088 ya decidió no bloquear y no reasignar solo; reasignar es del CAE. El número que ve el CAE antes de confirmar sale del detalle (R7).
- **Alternatives considered**: bloquear la baja si tiene módulos (D-088 lo descartó); cancelar sus sesiones (decisión del CAE, no del sistema).

## R5. Búsqueda sin distinguir tildes ni mayúsculas

- **Decision**: habilitar la extensión `unaccent` con una migración (`CREATE EXTENSION IF NOT EXISTS unaccent`) y buscar con `unaccent(lower(campo)) LIKE '%' || unaccent(lower($1)) || '%'` sobre nombre, apellido y correo, con una consulta SQL directa. El patrón del usuario se escapa (`%`, `_` y `\`).
- **Rationale**: Prisma `contains` con `mode: insensitive` ignora mayúsculas pero no tildes, y la spec lo pide (SC-001 y el borde de tildes). `unaccent` es una extensión estándar de PostgreSQL ("trusted", la puede crear el dueño de la base) y a este volumen (cientos de filas) un `LIKE` sin índice responde en milisegundos.
- **Alternatives considered**: una columna `searchKey` normalizada por la app (una columna y un sitio más que mantener al editar el nombre); filtrar en memoria (exige traer todas las filas); una extensión `pg_trgm` con índice (sobredimensionado a este tamaño).

## R6. Nombres de las rutas

- **Decision**: `/teachers` (ya existe) y `/students` para el CAE, ambos con `@Roles('SUPERADMIN')`. Acciones como subrecursos: `POST /:id/deactivate`, `POST /:id/reactivate`, `POST /teachers/:id/temporary-password` y `DELETE /:id`.
- **Rationale**: sigue la convención de recursos en plural y `kebab-case` de `Conventions.md`, y reutiliza el prefijo de docentes que la app ya conoce. Ya existe `/student` (en singular) para lo que ve el propio estudiante; los dos nombres conviven porque los separa el rol y el guard, y las pruebas de roles lo confirman.
- **Alternatives considered**: `/admin/students` (rompe la convención del resto de rutas del CAE); `PATCH /:id` con un campo `status` (mezcla edición de datos con acciones que tienen efectos y respuestas distintas).

## R7. Mostrar el efecto antes de confirmar

- **Decision**: el detalle de cada cuenta (`GET /teachers/:id`, `GET /students/:id`) trae el conteo en vivo (`modulesCount` del docente, `enrolledCount` del estudiante) y la app lo pide al abrir la hoja de acciones. La respuesta de cada baja repite el efecto real (`unavailableModules`, `cancelledEnrollments`).
- **Rationale**: FR-008 pide mostrar números antes de confirmar; un conteo recién leído al abrir la hoja es lo bastante fresco, y la respuesta final dice lo que pasó de verdad si cambió entre medias. Evita endpoints "de vista previa" que duplicarían la consulta.
- **Alternatives considered**: endpoints `/impact` (dos consultas por acción); usar solo los números de la lista (pueden tener minutos de antigüedad).

## R8. Borrado lógico y correo reservado

- **Decision**: eliminar pone `deletedAt` y no toca el correo. `RegistrationService` ya trata una cuenta con `deletedAt` como correo ocupado, y `TeachersService.create` también (`EMAIL_ALREADY_REGISTERED`).
- **Rationale**: es el comportamiento que ya describe la spec 001 y lo que pide la spec 016 (correo reservado). No requiere cambios.
- **Alternatives considered**: liberar el correo al eliminar (permitiría volver a registrarse, pero mezcla historiales de dos personas).

## R9. Regenerar la clave temporal

- **Decision**: `POST /teachers/:id/temporary-password` genera con `TemporaryPasswordService`, guarda solo el hash, pone `mustChangePassword = true`, cierra las sesiones y devuelve la clave una vez. Solo si la cuenta está activa y sin borrar; si no, `409 ACCOUNT_NOT_ACTIVE`.
- **Rationale**: es el mismo mecanismo del alta (`TeachersService.create`) y la app ya tiene `TemporaryPasswordDialog` para mostrarla una sola vez con la advertencia y el botón de copiar.
- **Alternatives considered**: enviar la clave por correo (la regla del proyecto es mostrarla una sola vez al CAE, nunca enviarla); permitirlo en cuentas desactivadas (la clave serviría para nada hasta reactivar y mezcla dos acciones).

## R10. La lista de estudiantes solo muestra cuentas verificadas

- **Decision**: la lista y el detalle de estudiantes filtran `emailVerifiedAt IS NOT NULL AND deletedAt IS NULL`; la de docentes, `deletedAt IS NULL`. Una cuenta pendiente de verificar no se gestiona (`404`).
- **Rationale**: FR-004 y el borde de la spec: quien no terminó el registro no es todavía un estudiante registrado, y el código de verificación caduca solo.
- **Alternatives considered**: mostrarlas con una marca "sin verificar" (más ruido para el CAE sin una acción útil que ofrecerle).
