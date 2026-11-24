# Research: Sistema de diseño renovado

Sin `NEEDS CLARIFICATION` abiertos. Medido en el código el 2026-11-23 (`tutorias_uts_mobile`, rama de la spec 024).

## R-1. Estado real del tema

- **Hallazgo**: `src/theme/colors.ts` define 32 roles (`Palette`) con valores en `lightPalette` y `darkPalette`; `tokens.ts` define espaciado, radios, sombras, tipografía y movimiento. En pantallas y componentes hay **0** colores escritos (hex, `rgb`, nombres) fuera de `src/theme`; 113 de 196 archivos `.tsx` leen `usePalette`, y el resto no pinta color propio (rutas que solo montan pantallas, utilidades de prueba, logo).
- **Decisión**: no se reconstruye el tema; se completa. Se conservan todos los nombres de rol (cambiarlos tocaría cientos de líneas sin valor para el usuario).
- **Alternativas**: reemplazar `Palette` por un sistema de tokens de dos capas (primitivos y semánticos); descartado, no hay un defecto que lo exija y multiplica el cambio.

## R-2. Huecos del modo oscuro (qué se corrige)

| # | Hueco | Evidencia | Corrección |
|---|---|---|---|
| 1 | `surfaceWarm` (crema `#F8E9D4`) es igual en oscuro | `colors.ts`; lo usan `Banner` (info) y `AnnouncementCard` | Variante oscura derivada y `onSurfaceWarm` con contraste ≥ 4.5:1 |
| 2 | `card` y `surface` son el mismo `#132F20` en oscuro | `darkPalette` | `surface` oscuro más claro que `card` (derivado), para chips, campos sobre tarjeta y burbujas |
| 3 | Las sombras son verde profundo `#132F20` y no se ven sobre fondo oscuro | `shadows` en `tokens.ts`, 11 usos | Rol `shadow` por modo; en oscuro la elevación se marca con superficie más clara y borde de 1 px (FR-004) |
| 4 | Éxito y advertencia solo valen como relleno o ícono | Design.md, tabla de contraste | Roles `successText` y `warningText` por modo, para texto de estado legible |
| 5 | La prueba de contraste cubre 20 pares por modo, no todos los del documento | `contrast.test.ts` | Matriz completa generada desde los roles (R-5) |

El cálculo exacto de cada valor derivado lo hace la prueba (que falla si el par no llega al mínimo); el plan no fija hex que no se hayan medido.

## R-3. Dos registros visuales (aclaración 1)

- **Decisión**: `Design.md` define **sobrio** (listas, horario, detalle, administración, chat, PQRS) y **expresivo** (inicio de sesión, inicio de cada rol, estados vacíos). Reglas comprobables: en sobrio, 0 degradados y 0 patrón de marca, un solo color de acento por pantalla; en expresivo, un solo bloque de degradado o cabecera de color y un patrón por pantalla, siempre con texto blanco o deep green según el rol de contraste.
- **Razón**: ya existen `HeroCard`, `gradients.brand` y `BrandPattern`; se trata de decir dónde van, no de crear piezas.
- **Alternativas**: todo sobrio (pierde identidad UTS) o todo expresivo (carga las pantallas con datos); descartadas en la aclaración.

## R-4. Barra de pestañas y cabecera (aclaración 2)

- **Decisión**: solo colores. `RoleTabs` toma de la paleta el fondo, el color activo e inactivo y el borde; `AppBar` ya usa `card` y `textPrimary`. Sin cambios de estructura, destinos ni de las pruebas de la spec 024.
- **Riesgo**: `RoleTabs.tsx` lo modificó la spec 024, cuyo PR (#15) sigue abierto. Ver R-9.

## R-5. Guardas automáticas

| Guarda | Qué comprueba | Cómo |
|---|---|---|
| Paridad | `lightPalette` y `darkPalette` tienen las mismas llaves y valores de color válidos (hex o `rgba`) | Jest, sin render |
| Contraste | Todos los pares texto/fondo, ícono/fondo e indicador/fondo de la tabla de roles, en ambos modos | La lista de pares sale de una constante exportada que también usa el documento |
| Colores sueltos | Ningún `.ts`/`.tsx` fuera de `src/theme`, `__tests__` y de una lista de excepciones (recursos de marca) contiene hex, `rgb()` ni nombres de color | Recorrido de archivos en Jest |
| Documento | Cada fila de la tabla de roles de `Design.md` coincide con ambas paletas | Lee `../Claude/docs/Design.md` o `DESIGN_MD_PATH`; falla con mensaje claro si no existe |
| Modo oscuro de componentes | Los componentes compartidos renderizados en oscuro solo usan colores de `darkPalette` | `useColorScheme` simulado a `dark`; se inspeccionan los estilos resueltos |

- **Alternativas**: pruebas de capturas de pantalla (requieren infraestructura nueva y son frágiles); descartado.

## R-6. Contraste de bordes de campos

- **Hallazgo**: la spec pedía 3:1 para "bordes de componentes", pero la regla de `CLAUDE.md` exige borde tenue en los campos (`#C9D0C3` sobre blanco da cerca de 1.6:1).
- **Decisión**: el borde tenue se mantiene como regla de marca; el campo se identifica por relleno, etiqueta y borde de foco (`inputBorderFocus`, 3:1 exigido). Se ajustó FR-002 de la spec para decirlo.
- **Alternativa**: borde de 3:1; descartada porque rompe el aspecto definido en `CLAUDE.md` y no la pidió nadie.

## R-7. Inventario de pantallas (FR-011)

- **Decisión**: `screen-inventory.md` lista las 58 pantallas de `app/` por rol con: pantalla, registro (sobrio o expresivo), componentes compartidos que usa, defecto visible en claro y en oscuro (de la revisión manual con Expo Go y de las guardas), y fase (1 entrada y portada; 2 módulos y horario; 3 administración; 4 resto). Las pantallas con un defecto que viene de un rol o de un componente compartido se corrigen en esta spec; el resto, en su fase.
- **Razón**: FR-011 y FR-012.

## R-8. Idioma de `Design.md`

- **Hallazgo**: `Design.md` está escrito en inglés; la constitución (IX) pide documentación en español.
- **Decisión propuesta**: se conserva el inglés en esta spec para que el cambio sea revisable (un rediseño por roles ya reescribe buena parte del archivo) y se anota como deuda en `Decisions.md`. Se pregunta al CAE de producto si prefiere traducirlo dentro de esta spec.

## R-9. Orden de ramas

- **Hallazgo**: el PR de la spec 024 (mobile #15, docs #17) sigue abierto y toca `RoleTabs.tsx`, `NotificationsScreen.tsx` y `Conventions.md`.
- **Decisión**: la rama de `tutorias_uts_mobile` se crea desde la rama de la spec 024 si el PR no se ha fusionado (PR apilado), o desde `main` si ya se fusionó. Misma regla para `Claude`: `Design.md` no lo tocó la 024.

## R-10. Pruebas primero

- **Decisión**: se escriben primero la paridad, el contraste completo y el modo oscuro de componentes; con los valores actuales deben fallar en los huecos 1 a 4 de R-2. Se corrigen los roles hasta que pasen. Luego se reescribe `Design.md` y se añade la prueba de coincidencia.
