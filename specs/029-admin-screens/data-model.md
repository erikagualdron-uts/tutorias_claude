# Data Model: roles y piezas de la spec 029

Sin datos de negocio ni base de datos. **Ningún rol nuevo**: la paleta sigue en 40 roles. Una pieza nueva (`ScreenHeader`) y cinco usos corregidos.

## Pieza nueva: `ScreenHeader`

| Propiedad | Tipo | Regla |
|---|---|---|
| `title` | texto | Texto que ya existe en las traducciones; nunca un texto nuevo |
| `count` | número, opcional | Solo cuando los datos ya cargaron; `0` es válido; ausente en el índice de «Más» y mientras carga |

| Aspecto | Valor |
|---|---|
| Fondo | `gradients.brand` (sin patrón) |
| Forma | radio `card`, relleno `lg`, sombra nivel 1 de `useShadows()` |
| Título | `typography.screenTitle`, color `onGradient.text`, `accessibilityRole="header"` |
| Línea | 4 px, `radius.line`, rol `accent` (detalle de marca) |
| Número | `typography.metricNumber`, color `onGradient.text` |
| Accesibilidad | El contenedor no es `accessible` (un padre accesible ocultaría el rol de cabecera del título): el título es cabecera y el número es otro texto, así el lector dice «título, número»; objetivo táctil no aplica (no es interactivo) |
| Contraste | `onGradient.text` 4.5:1 o más sobre `#34531F` y `#132F20` en ambos modos |

## Pantallas con cabecera (10)

Módulos, sedes, salones, docentes y estudiantes (misma pantalla de cuentas), periodos, festivos, listas desplegables, elementos de lista, cambios, índice de «Más». Las 9 pantallas de formulario y el detalle de módulo no llevan cabecera.

## Uso de roles como indicador

| Pieza | Elemento | Antes | Después | Mínimo |
|---|---|---|---|---|
| `AppBar` | Borde del ítem «Cerrar sesión» | `error` | `errorText` | 3:1 sobre `card` |
| `AccountCard` | Ícono de cuenta activa | `success` | `successText` | 3:1 sobre `card` |
| `StatusStackBar` | Segmentos «en revisión» y «resuelta» | `warning` / `success` | `warningText` / `successText` | 3:1 sobre `surface` |
| `SmtpSettingsScreen` | Borde e ícono del estado | `success` / `warning` (duplicado de `textColor`) | `textColor` único (`successText`, `warningText`, `textSecondary`) | 3:1 sobre `card` |
| `FieldBox` | Borde del campo con error | `error` | `errorText` | 3:1 sobre `inputFill` |

`error`, `warning` y `success` quedan solo para rellenos (botones, avisos, número blanco sobre `error` de las insignias).

## Reglas de validación

- `severityIndicators.test.ts` incluye las rutas de la fase 3 (R-4) y pasa; `shell` queda fuera.
- `headerBudget.test.ts`: las pantallas de la fase no importan `BrandPattern` ni `HeroCard`, y ninguna monta más de un `ScreenHeader`.
- `ScreenHeader`: la prueba del componente comprueba título, número presente y ausente, el rol de cabecera, los colores del degradado y el contraste de `onGradient.text` sobre ambos extremos.
- `Design.md` documenta el registro «sobrio con cabecera», la regla 2 ajustada y el error de campo con `errorText`; `designDoc.test.ts` sigue exigiendo la tabla de 40 roles.
- Paridad: sin cambios (40 llaves).
