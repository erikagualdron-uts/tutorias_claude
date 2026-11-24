# Data Model: roles y piezas de la spec 027

Sin datos de negocio ni base de datos. Cambios en el tema y en piezas compartidas.

## Roles de color

| Rol | Cambio | Claro | Oscuro | Uso | Mínimo |
|---|---|---|---|---|---|
| `controlBorder` | **Nuevo** (derivado; 40 roles en total) | `#76827A` | `#7A9A85` | Borde de botón `outlined` y `tonal` y de chip sin seleccionar | 3:1 sobre `card`, `screen` y `selected` |
| `primaryPressed` | **Cambia en oscuro** | `#132F20` (igual) | `#9FB01F` (antes `#C3D730`) | Botón primario presionado | `onPrimary` 4.5:1; distinto de `primary` |

Ningún otro rol cambia de nombre ni de valor.

## Piezas compartidas

| Pieza | Cambio |
|---|---|
| `Button` | `outlined` y `tonal` toman `controlBorder` como borde |
| `FilterChips` | Borde sin seleccionar `controlBorder`; chip y etiqueta sin encogerse; ancho mínimo 48 px; margen derecho de la etiqueta |
| `EmptyState` | Variante `empty` del patrón de marca detrás del ícono (colocaciones fijas) |
| `BrandPattern` | Nueva variante `empty` en `brandPatternLayouts` |
| `AdminDashboardScreen` | Un bloque destacado `HeroCard` con la ocupación (dato ya existente) |

## Reglas de validación

- `contrastPairs` incluye `controlBorder` sobre `card`, `screen` y `selected` con 3:1, en ambos modos.
- En oscuro `primaryPressed` es distinto de `primary`, y `onPrimary` sobre él cumple 4.5:1.
- `Design.md` documenta `controlBorder`, el `primaryPressed` oscuro y la variante `empty`; `designDoc.test.ts` exige que la tabla coincida con las paletas.
- Paridad: las dos paletas tienen las mismas 40 llaves.
