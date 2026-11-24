# Data Model: roles y piezas de la spec 028

Sin datos de negocio ni base de datos. **Ningún rol nuevo**: la paleta sigue en 40 roles. Cambia qué rol usa cada pieza como indicador.

## Uso de roles como indicador

| Pieza | Elemento | Antes | Después | Mínimo |
|---|---|---|---|---|
| `SessionBlock` | Línea izquierda e ícono de estado | `error` / `warning` / `primary` | `errorText` / `warningText` / `primary` | 3:1 sobre `surface` |
| `TeacherSessionCard` | Línea, ícono e insignia | `error` / `warning` / `primary` | `errorText` / `warningText` / `primary` | 3:1 sobre `card` |
| `NowLine` | Punto y línea de la hora actual | `error` | `errorText` | 3:1 sobre `screen` y `surface` |
| `OfferCard` | Relleno de la barra de cupo | `warning` (80 a 99 %) | `warningText` | 3:1 sobre `card` |
| `OfferCard` | Borde de las insignias `LAST_SPOTS` y `BLOCKED` | `warning` / `error` | el color de texto de su insignia (`warningText` / `errorText`); `AVAILABLE`, `ENROLLED` y `FULL` no cambian | coherente con el texto (4.5:1) |
| `CapacityBar` | Relleno de la barra | `warning` | `warningText` | 3:1 sobre `card` |
| `DayStrip` | Borde del día sin seleccionar | `border` | `controlBorder` | 3:1 sobre `card` |

Los roles `error`, `warning` y `success` quedan solo para rellenos (botones, avisos, insignia numérica). El día de hoy (2 px `primary`), el día seleccionado (relleno `primary`), las líneas de hora y los contornos de columna no cambian.

## Reglas de validación

- `contrastPairs` incluye `errorText`, `warningText` y `primary` sobre `surface` y `screen` con 3:1 (`ICON_RATIO`), en ambos modos.
- `severityIndicators.test.ts`: ningún archivo de la lista de la fase 2 usa `palette.error`, `palette.warning` ni `palette.success`. La lista crece en las fases siguientes.
- `Design.md` documenta la regla «indicador = rol de texto de severidad; relleno = rol de relleno» en "Component states"; `designDoc.test.ts` sigue exigiendo que la tabla coincida con las paletas (40 roles, sin cambios).
- Paridad: sin cambios (40 llaves).
