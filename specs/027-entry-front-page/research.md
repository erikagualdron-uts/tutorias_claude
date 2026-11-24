# Research: Entrada y portada renovadas

Sin `NEEDS CLARIFICATION` abiertos. Medido en el código el 2026-11-23 (`tutorias_uts_mobile`, rama de la spec 026).

## R-1. Contraste de botones en oscuro (defecto 1)

- **Hallazgo**: los pares de **texto** de cada variante de botón ya pasan en ambos modos (medido: `onPrimary`/`primary` 8.99, `onAccent`/`success` 4.56, `onAccent`/`warning` 6.08, `onError`/`error` 6.54). El defecto está en lo **no textual**:

| Pieza | Problema medido (oscuro) |
|---|---|
| Botón `outlined` | Borde `border` = blanco al 8 %: casi invisible; el botón parece texto suelto |
| Botón `tonal` y deshabilitado | Relleno `surface` contra su contenedor: 1.2:1 sobre `card`, 1.5:1 sobre `screen` |
| Chip de filtro sin seleccionar | Borde `border` al 8 % y relleno `card` contra `screen`: 1.27:1 |
| `primaryPressed` | Igual a `primary` (`#C3D730`): al presionar solo cambia la escala, el color no |
| Botón `accent` | Sin color de presionado propio (`pressed` = `accent`) |

- **Causa de fondo**: la matriz de la spec 026 mide texto e íconos, pero no el borde de los controles ni la diferencia entre presionado y normal. En claro pasa lo mismo (`border` `#E5E5E5` sobre blanco es 1.3:1), pero se nota menos.
- **Decisión**: un rol nuevo **`controlBorder`** (derivado) para el borde de botones `outlined` y `tonal` y de chips sin seleccionar, con 3:1 sobre `card`, `screen` y `selected` en ambos modos; y un `primaryPressed` oscuro distinto de `primary`. El campo de texto conserva su borde tenue (exento, D-123). Candidatos medidos: claro `#76827A` (4.00 sobre blanco, 3.62 sobre `screen`, 3.28 sobre `selected`); oscuro `#7A9A85` (4.67 sobre `card`, 5.93 sobre `screen`, 3.24 sobre `selected`); `primaryPressed` oscuro `#9FB01F` (texto `onPrimary` 5.98).
- **Alternativas**: engrosar el borde a 2 px (descartada: el rol sigue faltando y cambia la forma); subir `border` para todo (descartada: `border` también separa filas y tarjetas, donde un 3:1 sería ruido).

## R-2. Etiqueta «All» cortada en chips (defecto 2)

- **Hallazgo**: `FilterChips` no define ancho mínimo ni impide que el texto se encoja; la etiqueta usa `typography.label` (Myriad Pro semibold, 12 px, `letterSpacing` 0.24). En Android, el texto con espaciado entre letras y fuente propia se mide algo más corto de lo que pinta y recorta la última letra cuando el contenedor se ajusta al ancho exacto (efecto «Al»).
- **No reproducible en Jest** (no mide texto); se verifica en el teléfono.
- **Decisión**: el chip y su texto no se encogen (`flexShrink: 0`), el chip tiene un ancho mínimo (objetivo táctil de 48 px de ancho), y la etiqueta lleva un pequeño margen derecho. Una prueba comprueba esas propiedades en cada chip y en las demás piezas con etiqueta corta (`Button`, `NotificationsBell`), y la verificación manual lo confirma en el teléfono (español e inglés, letra grande).
- **Alternativas**: quitar `letterSpacing` de `label` (descartada: cambia todo texto pequeño del sistema); ancho fijo (descartada: rompe «Todos» o etiquetas largas).

## R-3. Guarda de contraste de controles

- **Decisión**: ampliar `contrastPairs` con los pares no textuales de los controles (`controlBorder` sobre `card`, `screen`, `selected`; `primary` sobre `screen` como relleno de botón) y con una comprobación de que `primaryPressed` difiere de `primary` en oscuro. Si el par falla, falla la prueba de la spec 026; no hay prueba nueva.
- **Razón**: el defecto se escapó porque la matriz no medía el borde de los controles; cerrar ese hueco evita que vuelva.

## R-4. Inicio de cada rol (FR-003)

- **Hallazgo**: estudiante y docente abren con `HeroSessionCard` (degradado, patrón, texto sobre el degradado); el CAE abre con una tarjeta de ocupación sin bloque de marca. `MetricCard`, `Card` y el espaciado (16/12/24) ya son los mismos.
- **Decisión**: el inicio del CAE gana un único bloque destacado con `HeroCard`, con el dato que ya muestra su primera tarjeta (ocupación de módulos), sin datos ni textos nuevos; las métricas y bloques siguen igual. Los tres inicios quedan con el mismo orden: bloque destacado, métricas, bloques.
- **Alternativa**: dejar el CAE sin bloque destacado (descartada: rompe la consistencia entre roles que pidió la spec).

## R-5. Estado vacío expresivo (FR-005)

- **Hallazgo**: `EmptyState` se usa 53 veces; hoy es ícono, título, descripción y acción, sin identidad de marca. El patrón solo tiene las variantes `header` y `hero`.
- **Decisión**: una variante `empty` del patrón (colocaciones fijas, pequeñas) detrás del ícono de `EmptyState`, con tono que cumple el registro (decoración, no texto). Se documenta en `Design.md` (Brand pattern, Empty states). Vale para las 53 pantallas, porque `Design.md` ya define los estados vacíos como expresivos.
- **Riesgo**: se toca un componente compartido; las pruebas de pantallas que lo usan no cambian de texto y la prueba de modo oscuro cubre el nuevo bloque.
- **Alternativa**: solo las 12 pantallas (descartada: dos estados vacíos distintos en la app).

## R-6. Bandeja de avisos (FR-004)

- **Hallazgo**: las tres bandejas montan la misma pantalla (`NotificationsScreen`); lo no leído se distingue por `selected` y peso. La franja blanca de la spec 026 ya se corrigió con `useShadows` y los roles.
- **Decisión**: sin rediseño estructural; se verifican leído/no leído, vacío, carga y error con las guardas y la lista de revisión, y se aplica el nuevo `EmptyState` y `controlBorder` en sus botones.

## R-7. Autenticación y arranque (FR-002, FR-006)

- **Hallazgo**: las cinco pantallas ya usan `AuthLayout` (cabecera de marca, logo por modo, patrón) y `Button`/`TextField`; el fondo del arranque es `palette.screen` y la barra de estado se fija en la spec 026.
- **Decisión**: sin rediseño; auditoría con la lista de reglas y corrección de lo que falle. El arranque conserva `LoadingScreen`. El color de fondo nativo del arranque (`app.json`: `#34531F` claro, `#0B1710` oscuro) ya coincide con el modo.

## R-8. Verificación del recorrido manual

- **Decisión**: la lista por pantalla (12 filas) va en `screen-inventory.md`; los dos defectos del teléfono se anotan con su causa y su corrección. Los chips «All» (fases 2 a 4) se cierran por la pieza compartida y se marcan como resueltos en el inventario.

## R-9. Orden de ramas

- **Decisión**: la rama de `tutorias_uts_mobile` se crea desde `026-design-system` (PR #16 abierto sobre la rama de la 024); la de `Claude`, ya creada desde `026-design-system` (PR #19 abierto). Cada PR apunta a la rama anterior hasta que se fusione la base.
