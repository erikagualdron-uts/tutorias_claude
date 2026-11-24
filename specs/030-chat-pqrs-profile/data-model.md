# Data Model: roles y piezas de la spec 030

Sin datos de negocio ni base de datos. **Ningún rol nuevo**: la paleta sigue en 40 roles. Una propiedad nueva en una pieza existente y tres cambios de color.

## Pieza existente con propiedad nueva: `FilterChips`

| Propiedad | Tipo | Regla |
|---|---|---|
| `scroll` | booleano, opcional (por defecto `false`) | Con `true`, la fila es un `ScrollView` horizontal sin barra visible: chips de alto visual 36 px con `hitSlop` vertical de 6 px (zona de toque de 48 px), espaciado `sm`, sin salto de línea |

El resto no cambia: relleno `primary` y texto `onPrimary` del activo, `controlBorder` y `card` del inactivo, etiqueta con relleno horizontal y sin espaciado entre letras (corrección de «All»). Sin `scroll`, la fila conserva su salto de línea y sus 48 px.

## Pantallas con cabecera (3) y con filtros compactos

| Pantalla | Cabecera (`ScreenHeader`) | Filtros con `scroll` |
|---|---|---|
| Mensajes | título `tabs.messages`, sin número | no tiene |
| Mis PQRS (estudiante y docente) | título `pqrs.list.title`, número `meta.total` | estado |
| PQRS del CAE | título `pqrs.admin.title`, número `meta.total` | estado, tipo y rol del autor |

## Uso de roles como indicador

| Pieza | Elemento | Antes | Después | Mínimo |
|---|---|---|---|---|
| `StatusBadge` | Borde e ícono de la insignia | `success` / `warning` / `primary` | `successText` / `warningText` / `primary` | 3:1 sobre `card` |
| `PqrsFiledScreen` | Ícono de éxito de 48 px | `success` | `successText` | 3:1 sobre `screen` |
| `MessageBubble` (ajena, oscuro) | Borde de la burbuja | ninguno | 1 px `border`, como `Card` en oscuro | separación de superficie (spec 026) |

## Reglas de validación

- `severityIndicators.test.ts` incluye `src/features/chat`, `src/features/pqrs` y `src/features/auth`.
- `headerBudget.test.ts`: las 3 pantallas con cabecera tienen exactamente un `ScreenHeader` y ningún patrón; las 6 sobrias de la fase no tienen cabecera ni patrón.
- `FilterChips` con `scroll`: la prueba comprueba el desplazamiento horizontal, el alto visual de 36 px, la zona de toque de 48 px (`hitSlop`), que no pierde ningún chip y que el activo conserva relleno y texto del tema.
- `Design.md` documenta la fila de filtros compacta y las pantallas del registro «sobrio con cabecera» de esta fase; `designDoc.test.ts` sigue exigiendo la tabla de 40 roles.
- Paridad: sin cambios (40 llaves).
