# Data Model: Calendario semanal del docente

**Sin cambios en la base de datos.** No hay tablas, columnas, índices ni migraciones nuevas. Se leen `module_sessions`, `modules`, `module_schedules`, `rooms`, `academic_periods`, `enrollments` y `session_absences` como en la spec 012. La consulta del rango usa el índice `(teacher_id, starts_at)` que añadió la 012.

## Vistas (respuesta de la API)

### CalendarSession

Es la `TeacherSession` del contrato de la spec 012, sin cambios: `id`, `moduleId`, `moduleName`, `startsAt`, `endsAt`, `originalStartsAt`, `status` (`SCHEDULED`, `RESCHEDULED`, `CANCELLED`), `cancelReason` (`HOLIDAY`, `TEACHER` o nulo), `room`, `attendees`, `canReschedule`, `canCancel`, `canRestore` y `blockReason`.

Regla: en el calendario aparecen también las sesiones pasadas; para ellas `blockReason` es `PAST` y no se ofrece ninguna acción.

### CalendarResponse

| Campo | Contenido |
|---|---|
| `data` | `CalendarSession[]` ordenadas por `startsAt` y `id`, solo del docente del token, no borradas. |
| `meta.from`, `meta.to` | Días `YYYY-MM-DD` (Bogotá) pedidos. |
| `meta.period` | `{ id, name, startsOn, endsOn, status }` del periodo mostrado, o `null` si el docente no tiene periodo Activo ni Cerrado (R-2). |
| `meta.hours` | `{ earliest, latest }` en `HH:mm`, de la configuración (D-089). |
| `meta.changeLeadMinutes` | Límite de cambio de la 012. |

## Estado de la pantalla (solo en la app, no se guarda)

| Estado | Valores y regla |
|---|---|
| `weekStart` | Lunes de la semana visible (`YYYY-MM-DD`). Inicia en el lunes de hoy (o el de la semana del periodo más cercana a hoy si hoy cae fuera). |
| `selectedDay` | Día elegido en la vista Día; siempre dentro de `weekStart` a `weekStart + 6`. Al cambiar de semana pasa al mismo día de la semana nueva, o a hoy si hoy está en ella. |
| `view` | `day` o `week`; inicial por ancho de ventana (R-5). |

Restricciones: `weekStart` nunca queda antes del lunes de `period.startsOn` ni después del lunes de `period.endsOn`; la flecha correspondiente se desactiva y se explica con "Fuera del periodo académico".

## Reglas derivadas

- **Marca de día**: un día tiene marca si existe al menos una sesión suya en `data` (cualquier estado).
- **Rango de horas visible**: de `hours.earliest` a `hours.latest`, ampliado hacia abajo o hacia arriba, a horas enteras, si alguna sesión de la semana cae fuera (FR-017).
- **Línea de hora actual**: solo en hoy y solo si la hora actual de Bogotá cae dentro del rango visible.
- **Elemento de calendario** (entrada del componente reutilizable): `id`, `title`, `room`, `detail` (línea secundaria como "18 estudiantes"), `startsAt`, `endsAt`, `status`, `badge` (texto de la insignia) y `strike` (tachado).
