# Data Model: Roles de color

**Sin tablas, columnas ni migraciones y sin cambios en la API.** El "modelo" es el conjunto de roles de color del tema (`Palette`), con un valor por modo.

## Reglas de la tabla de roles

- Cada rol tiene nombre, valor claro, valor oscuro, origen (marca o derivado) y uso.
- Ningún rol existente cambia de nombre ni se elimina; solo se agregan roles y se corrigen valores oscuros.
- Todo valor derivado nuevo se marca como derivado y su contraste mínimo lo comprueba la prueba antes de aceptarse.
- Los dos modos tienen exactamente las mismas llaves.

## Roles existentes (32)

`background`, `screen`, `card`, `surface`, `surfaceWarm`, `primary`, `primaryPressed`, `onPrimary`, `accent`, `onAccent`, `link`, `textPrimary`, `textSecondary`, `border`, `error`, `errorText`, `errorPressed`, `onError`, `success`, `successPressed`, `warning`, `warningPressed`, `disabledText`, `scrim`, `inputFill`, `inputFillOnScreen`, `inputBorder`, `inputBorderFocus`, `inputLabelFocus`, `inputPlaceholder`, `focusGlow`, `errorGlow`.

## Cambios

| Rol | Tipo | Modo claro | Modo oscuro | Contraste mínimo | Uso |
|---|---|---|---|---|---|
| `surfaceWarm` | valor oscuro corregido | `#F8E9D4` (sin cambio) | crema oscura derivada | con `onSurfaceWarm`: 4.5:1 | avisos e información importante |
| `onSurfaceWarm` | nuevo | `#132F20` | crema clara derivada | 4.5:1 sobre `surfaceWarm` | texto e íconos sobre `surfaceWarm` |
| `surface` | valor oscuro corregido | `#F2F4EF` (sin cambio) | más claro que `card` (derivado) | `textPrimary` y `textSecondary` 4.5:1 | chips, campos sobre tarjeta, burbujas |
| `shadow` | nuevo | `#132F20` | `#000000` | no aplica | color de sombra de `shadows` |
| `successText` | nuevo | verde más oscuro que `success` (derivado) | verde claro (derivado) | 4.5:1 sobre `card` y `screen` | texto de estado "disponible", "resuelta" |
| `warningText` | nuevo | ámbar oscuro (derivado) | ámbar claro (derivado) | 4.5:1 sobre `card` y `screen` | texto de estado "en revisión", "reprogramada" |
| `selected` | nuevo | verde muy claro (derivado) | verde profundo claro (derivado) | `textPrimary` 4.5:1 | fila, chip o tarjeta seleccionada |
| `tabActive` y `tabInactive` | nuevos | `primary` y `textSecondary` | `accent` y `textSecondary` | 3:1 sobre el fondo de la barra | color de la pestaña activa e inactiva (FR-012a) |

Total: 32 roles existentes + 7 nuevos (`onSurfaceWarm`, `shadow`, `successText`, `warningText`, `selected`, `tabActive`, `tabInactive`) = 39. Los valores derivados se fijan en la implementación contra la prueba de contraste.

## Escalas (existentes, sin cambios de valor)

| Escala | Fuente | Nota |
|---|---|---|
| Espaciado | `spacing` (4 a 64) | se documentan con su uso |
| Radios | `radius` (4 a pill) | se documentan con su uso |
| Tipografía | `typography` (10 estilos) | Myriad Pro solo por `fonts` |
| Elevación | `shadows.level1` a `level3` | en oscuro: superficie más clara, borde de 1 px y color `shadow` |
| Movimiento | `motion` | sin cambios |

## Pares de contraste (lo que cubre la matriz)

Texto: `textPrimary` y `textSecondary` sobre `background`, `screen`, `card`, `surface` y `selected`; `onSurfaceWarm` sobre `surfaceWarm`; `onPrimary` sobre `primary` y `primaryPressed`; `onAccent` sobre `accent`; `onError` sobre `error`; `link` sobre `card`, `screen` y `surface`; `errorText`, `successText` y `warningText` sobre `card` y `screen`; `textPrimary` y `inputPlaceholder` sobre `inputFill` y `inputFillOnScreen`.

Íconos e indicadores (3:1): `primary`, `success`, `errorText`, `tabActive` y `tabInactive` sobre su fondo; `inputBorderFocus` sobre `card`; `textSecondary` sobre `inputFill`.

Exentos: `disabledText`, `inputBorder` (R-6 del research), `border` y `scrim` (decorativos), `accent` como relleno.
