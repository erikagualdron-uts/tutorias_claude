# Data Model: Configuración del CAE

Convenciones de `docs/Conventions.md` §4: modelos `PascalCase` singular, tablas `snake_case` plural con `@@map`, columnas `snake_case` con `@map`; todas con `id` (UUID), `createdAt`, `updatedAt` y, las que se pueden borrar, `deletedAt`. Toda consulta filtra `deletedAt: null`. Las migraciones aplicadas nunca se editan. Los índices parciales, de expresión y la restricción de exclusión se escriben en el SQL de la migración (Prisma no los modela).

## AcademicPeriod (`academic_periods`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| name | texto | Obligatorio, recortado, 1 a 50 caracteres. Único sobre `lower(btrim(name))` entre no borrados |
| startsOn | fecha (`DATE`) | Obligatorio |
| endsOn | fecha (`DATE`) | Obligatorio; `endsOn > startsOn` (restricción `CHECK`) |
| status | enum `PeriodStatus` | `UPCOMING` (por defecto), `ACTIVE`, `CLOSED` |
| closedAt | fecha-hora UTC, nulo | Se fija al cerrar (manual o automático) |
| closedBy | enum, nulo | `MANUAL` o `AUTOMATIC`; informativo |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | Solo si `UPCOMING` y sin módulos |

Restricciones en la base de datos (solo registros con `deleted_at IS NULL`):
- Un único `ACTIVE`: índice único parcial sobre una constante, `WHERE status = 'ACTIVE'`.
- Sin solapamiento: `EXCLUDE USING gist (daterange(starts_on, ends_on, '[]') WITH &&)`.
- `CHECK (ends_on > starts_on)`.

### Transiciones de estado

```text
(crear) ──▶ UPCOMING ──activar (manual, endsOn no vencido)──▶ ACTIVE ──cerrar (manual)────────▶ CLOSED
                │                                               └──fecha de fin vencida (auto)──▶ CLOSED
                └──eliminar (sin módulos)──▶ deletedAt fijado
CLOSED: solo lectura, sin retorno. ACTIVE: no se elimina. CLOSED: no se elimina.
```

- Activar con otro `ACTIVE`: exige `confirmCloseActive = true`; en una transacción el anterior pasa a `CLOSED` y el nuevo a `ACTIVE`.
- Editar: `UPCOMING` y `ACTIVE` permiten cambiar nombre y fechas (con las mismas validaciones y sin solapar); `CLOSED` no. En `ACTIVE`, acortar `endsOn` antes de hoy se rechaza (`PERIOD_DATES_INVALID`).

## Location (`locations`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| name | texto | Obligatorio, recortado, 1 a 80 caracteres. Único sobre `lower(btrim(name))` entre no borrados |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | Solo sin salones activos; elimina también sus salones inactivos |

## Room (`rooms`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| locationId | FK Location | Obligatoria; la ubicación no debe estar borrada |
| name | texto | Obligatorio, recortado, 1 a 40 caracteres. Único por ubicación sobre `lower(btrim(name))` entre no borrados |
| capacity | entero | `CHECK (capacity > 0)`; entero positivo sin tope máximo |
| status | enum `RoomStatus` | `ACTIVE` (por defecto), `INACTIVE` |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | |

Reglas dependientes de módulos (vía `ConfigUsageService`, hoy en cero):
- Desactivar o eliminar: bloqueado si tiene módulos en el periodo `ACTIVE` (`ROOM_IN_ACTIVE_PERIOD`). Si solo tiene módulos en periodos `UPCOMING`, se permite y `GET /rooms/:id/impact` informa la cantidad antes de confirmar.
- Bajar `capacity`: bloqueado si queda por debajo del máximo de inscritos en cualquier módulo que lo use (`ROOM_CAPACITY_BELOW_ENROLLED`).
- Un salón `INACTIVE` o eliminado no se puede asignar a módulos nuevos (`ROOM_INACTIVE_OR_DELETED`); lo aplica la funcionalidad de módulos.

Mover un salón a otra ubicación está permitido con las mismas validaciones de unicidad.

## DropdownList (`dropdown_lists`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK |
| key | texto | Único, estable, `UPPER_SNAKE_CASE` (ej. `PQRS_TYPE`); lo usan los selectores |
| nameEs, nameEn | texto | Nombre visible de la lista |
| createdAt, updatedAt | fecha-hora | |

Las listas las crea el sistema (migración); la API no crea, renombra ni elimina listas. No lleva `deletedAt`.

## DropdownItem (`dropdown_items`)

| Campo | Tipo | Reglas |
|---|---|---|
| id | uuid | PK; es lo que referencian otros registros (ej. una PQRS) |
| listId | FK DropdownList | |
| labelEs, labelEn | texto | Ambas obligatorias, recortadas, 1 a 80 caracteres; solo espacios cuenta como vacío |
| sortOrder | entero | 1..n dentro de la lista, sin huecos tras reordenar; un elemento nuevo va al final |
| status | enum `ItemStatus` | `ACTIVE` (por defecto), `INACTIVE` |
| createdAt, updatedAt | fecha-hora | |
| deletedAt | fecha-hora, nulo | Solo si no está en uso (`DROPDOWN_ITEM_IN_USE`) |

Los elementos eliminados no cuentan para el orden y no se muestran en ninguna lectura. Reordenar recibe todos los ids no eliminados de la lista (si falta o sobra alguno: `DROPDOWN_ORDER_INVALID`).

### Datos precargados (migración)

| Lista | key | Elementos (es / en) |
|---|---|---|
| Tipos de PQRS / PQRS types | `PQRS_TYPE` | Petición / Request, Queja / Complaint, Reclamo / Claim, Sugerencia / Suggestion |

## Relaciones

```text
Location 1 ──── * Room
AcademicPeriod 1 ──── * Module        (spec posterior; hoy ConfigUsageService devuelve 0)
Room 1 ──── * Module                  (spec posterior)
DropdownList 1 ──── * DropdownItem
DropdownItem 1 ──── * Pqrs            (spec posterior)
```

## Extensiones y ajustes de `docs/`

`Architecture.md` §5 ya lista `Room`, `AcademicPeriod` y `Setting / DropdownList / DropdownItem`; se amplían (ver "Actualizaciones de docs/" en `plan.md`): `Location` como entidad propia, estado `UPCOMING`, `closedAt` y los campos de las listas.
