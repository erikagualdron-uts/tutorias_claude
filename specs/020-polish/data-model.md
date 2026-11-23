# Data Model: Pulido de PQRS, dashboards y pruebas

**Sin tablas, columnas, enums ni migraciones.** Esta spec no toca `tutorias_uts_db`.

## Lo que ya se guarda y se reutiliza

| Dato | Tabla y columna | Quién lo recibe hoy |
|---|---|---|
| Fecha de radicación | `pqrs.created_at` | autor y CAE |
| Fecha del paso a "En revisión" | `pqrs.reviewed_at` (nullable) | CAE; **esta spec lo agrega al autor** |
| Fecha de resolución | `pqrs.resolved_at` (nullable) | CAE; **esta spec lo agrega al autor** |
| Identificador de la PQRS | `pqrs.id` (UUID) | autor y CAE |

## Valores calculados (no se guardan)

- **Número de radicado**: `pqrsCode(id)` = los 8 primeros caracteres del UUID sin guiones, en mayúsculas (`[0-9A-F]{8}`). Determinista: la misma PQRS siempre da el mismo número.
- **Pasos de la línea de tiempo**: `[{ step: 'FILED' | 'IN_REVIEW' | 'RESOLVED', at: fecha | null, done: boolean, current: boolean }]`. `FILED` usa `createdAt`; `IN_REVIEW`, `reviewedAt`; `RESOLVED`, `resolvedAt`. `done` es verdadero si el estado de la PQRS ya llegó a ese paso o lo pasó; `current` marca el paso del estado actual. Un paso cumplido sin fecha queda `done` con `at` nulo.
- **Cantidad de PQRS radicadas del CAE**: `meta.total` de `GET /pqrs?status=FILED&limit=1`.

## Cambio de la API (aditivo)

`GET /pqrs/mine/:id` agrega `reviewedAt` y `resolvedAt` (`string` fecha-hora o `null`). Ver [contracts/changes.md](contracts/changes.md).

## Reglas

- Los pasos nunca retroceden ni se saltan (D-111); la línea de tiempo solo los muestra.
- Fechas en UTC en la respuesta y en `America/Bogota` en pantalla.
- Una fecha ausente nunca se reemplaza por otra ni se inventa.
