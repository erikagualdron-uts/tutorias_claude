# Data Model: Gestión de cuentas de docentes y estudiantes

**Sin tablas ni columnas nuevas.** La única migración habilita la extensión `unaccent` de PostgreSQL para la búsqueda sin tildes. Todo lo demás usa lo que ya existe.

## Entidades que se usan

### User (sin cambios)

| Campo | Uso en esta spec |
|---|---|
| `role` | Solo `TEACHER` y `STUDENT` son gestionables; cualquier otro (`SUPERADMIN`) responde `404 ACCOUNT_NOT_FOUND`. |
| `status` (`ACTIVE` \| `INACTIVE`) | Desactivar pone `INACTIVE`; reactivar pone `ACTIVE`. |
| `deletedAt` | Eliminar lo pone a la hora de la acción. Una cuenta con `deletedAt` no se lista, no se gestiona y no se reactiva. |
| `emailVerifiedAt` | Un estudiante sin correo verificado no aparece ni se gestiona. |
| `mustChangePassword` | Regenerar la clave temporal lo pone en `true`. |
| `passwordHash` | Regenerar la clave guarda solo el hash de la nueva. |
| `email` | Solo lectura desde esta función; no cambia. |

### TeacherProfile (sin cambios)

`firstName`, `lastName` y `phone` los edita el CAE. Reglas de validación de la edición (las mismas del alta): `firstName` y `lastName` obligatorios, sin espacios sobrantes y con el mismo largo máximo que `CreateTeacherDto`; `phone` opcional y puede quedar vacío (`null`).

### StudentProfile (sin cambios)

`firstName`, `lastName` y `program` solo se leen.

### Enrollment (sin cambios de estructura)

Una baja de estudiante cancela sus inscripciones vigentes así:

| Campo | Valor al cancelar por baja |
|---|---|
| `status` | `CANCELLED` (desde `ACTIVE`) |
| `cancelledAt` | la hora de la baja |
| `effectiveUntil` | la hora de la baja (el cupo queda libre para toda sesión posterior; las ya dadas conservan al estudiante) |

"Vigente" = `status = ACTIVE`, `deletedAt` nulo, módulo sin borrar y de un periodo **Activo**. Las inscripciones de periodos Cerrados no se tocan (solo lectura, historial). Sin periodo activo no hay inscripciones vigentes.

## Conteos derivados (no se guardan)

| Conteo | Definición |
|---|---|
| `modulesCount` (docente) | Módulos sin borrar de ese docente en el periodo activo. |
| `enrolledCount` (estudiante) | Inscripciones vigentes del estudiante (definición de arriba). |

## Estados de una cuenta

```text
ACTIVE ──deactivate──▶ INACTIVE ──reactivate──▶ ACTIVE
   │                       │
   └──────delete───────────┴──────delete──────▶ DELETED (deletedAt; sin vuelta desde la app)
```

- Desactivar una cuenta ya `INACTIVE` y reactivar una `ACTIVE` son operaciones sin efecto (200, mismo resultado).
- Eliminar prevalece sobre todo: una cuenta eliminada responde `404 ACCOUNT_NOT_FOUND` a cualquier acción.
- Reactivar una cuenta de estudiante **no** restaura sus inscripciones (spec, FR-010).

## Errores nuevos (códigos estables)

| Código | HTTP | Cuándo | Traducción en la app |
|---|---|---|---|
| `ACCOUNT_NOT_FOUND` | 404 | El id no es de un docente o estudiante vivo (incluye eliminados, estudiantes sin verificar y administrativos) | `errors.ACCOUNT_NOT_FOUND` |
| `ACCOUNT_NOT_ACTIVE` | 409 | Regenerar la clave de una cuenta desactivada | `errors.ACCOUNT_NOT_ACTIVE` |

La validación de la edición reutiliza el `422` con `details` por campo que ya usan los demás formularios.

## Migración

`tutorias_uts_db/prisma/migrations/<ts>_enable_unaccent/migration.sql`:

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

Es reversible (`DROP EXTENSION unaccent`) y no toca datos. `schema.prisma` no cambia.
