# Research: Administración del CAE renovada

Sin `NEEDS CLARIFICATION` abiertos. Medido en el código el 2026-11-23 (`tutorias_uts_mobile`, rama de la spec 028).

## R-1. Estructura real de las 22 pantallas

- **Hallazgo**: las 8 listas de administración (módulos, sedes, salones, cuentas, periodos, feriados, listas desplegables y elementos de lista) abren con un `Text` de título (`typography.screenTitle`) dentro del `ScrollView` o de la cabecera de la lista, seguido de filtros o búsqueda, tarjetas y un botón de crear. Los 9 formularios abren con su título y campos. Cada pantalla repite esa composición sin pieza compartida (1 145 líneas en 9 listas).
- **El índice de «Más»** (`MoreScreen`) y los **cambios** (`ChangesScreen`) no tienen título en pantalla; el título lo da la barra superior. Existen textos reutilizables: `tabs.more` («Más») y `dashboard.admin.changes.title`.
- **Decisión**: una sola pieza compartida, `ScreenHeader`, reemplaza el `Text` de título de las 8 listas y se agrega al índice y a los cambios con textos que ya existen. Sin pieza compartida de lista completa: reescribir 9 pantallas por una abstracción es más cambio que valor.
- **Alternativas**: un `AdminListScreen` genérico (descartada: filtros, paginación y acciones difieren y las pruebas actuales dependen de cada estructura); no tocar las listas (descartada por la decisión de la clarificación).

## R-2. Cabecera «sobrio con cabecera» (clarificación 2)

- **Decisión**: `ScreenHeader({ title, count? })`, en `src/components`:
  - Degradado de marca (`gradients.brand`), radio `card`, sombra nivel 1 (`useShadows`), relleno `lg`.
  - Título con `typography.screenTitle` en `onGradient.text`; línea de 4 px en `accent` bajo el título (detalle de marca de `Design.md`); el número, si existe, en `typography.metricNumber` con `onGradient.text`.
  - Sin `BrandPattern` y sin colores nuevos. Es el único bloque de color de la pantalla.
  - Accesibilidad: el título lleva `accessibilityRole="header"` y el número es otro texto; el contenedor no es `accessible`, para no ocultar el rol del título al lector de pantalla, que dice «título, número».
  - Contraste: `onGradient.text` (blanco) tiene 4.5:1 o más sobre los dos extremos (`#34531F` 8.7:1, `#132F20` 14.4:1); la prueba de la spec 026 ya lo comprueba para `HeroCard`, se repite para la cabecera.
- **Razón**: ya existen el degradado, la línea lima y el texto sobre degradado en los inicios (spec 027); se trata de usarlos en pequeño, no de crear piezas visuales.
- **Alternativas**: `HeroCard` con padding reducido (descartada: arrastra el patrón `hero`, que el nuevo registro no permite); cabecera de color a todo el ancho con la barra superior (descartada: la barra solo cambia de color, spec 026).

## R-3. Qué número muestra cada cabecera (FR-014, sin textos nuevos)

| Pantalla | Título (texto existente) | Número |
|---|---|---|
| Módulos | `modules.title` | `data.length` (módulos del periodo mostrado) |
| Sedes | `locations` (texto actual de la pantalla) | `data.length` |
| Salones | texto actual de la pantalla | `data.length` (con filtro de sede aplicado) |
| Docentes y estudiantes | `more.teachers` / `more.students` | `pages[0].meta.total` |
| Periodos | `periods.title` | `data.length` (con filtro aplicado) |
| Festivos | `holidays.title` | `data.length` |
| Listas desplegables | texto actual de la pantalla | `data.length` |
| Elementos de lista | texto actual de la pantalla | `items.length` |
| Cambios | `dashboard.admin.changes.title` | `pages[0].meta.total` |
| Índice de «Más» | `tabs.more` | ninguno (es un menú) |

El número aparece solo cuando los datos ya cargaron; mientras carga, la cabecera muestra solo el título. Con 0 elementos muestra `0` y la lista cae en su estado vacío debajo (sin repetir el mensaje en la cabecera). Un número no necesita texto nuevo: la etiqueta de accesibilidad une el título y el número.

- **Alternativa**: «12 salones» con textos de cantidad nuevos (descartada: viola «sin textos nuevos»; si más adelante se quiere, es una spec de textos).

## R-4. Indicadores pendientes de la 028 (FR-002)

Medido con los valores de las paletas:

| Pieza | Uso actual | Medida | Corrección |
|---|---|---|---|
| `AppBar`, ítem «Cerrar sesión» | borde `error` sobre `card` | oscuro 2.21:1 | `errorText` (texto e ícono ya lo usan) |
| `AccountCard`, ícono de cuenta activa | `success` sobre `card` | claro 3.17:1 (pasa justo); es un rol de relleno | `successText` (guarda D-125) |
| `StatusStackBar`, segmentos de PQRS | `warning` y `success` sobre `surface` | `warning` claro 2.14:1, `success` claro 2.86:1 | `warningText` y `successText` |
| `SmtpSettingsScreen`, borde e ícono de estado | `success` y `warning` sobre `card` | `warning` claro 2.37:1 | un solo `textColor` (`successText`, `warningText`, `textSecondary`) para borde, ícono y texto; se elimina `color` duplicado |
| `FieldBox` (formularios), borde de campo con error | `error` sobre `inputFill` | oscuro 2.81:1 | `errorText` (6.3:1 o más; el mensaje ya usa `errorText`) |

`StatusBadge` y `PqrsFiledScreen` son de PQRS y quedan para la fase 4. El borde de los ítems de `shell/badge.ts` y de `NotificationsBell` son rellenos (número blanco sobre `error`) y siguen con `error`.

- **Decisión**: se aplican los 5 cambios y la guarda `severityIndicators.test.ts` suma `src/features/accounts`, `src/features/periods`, `src/features/holidays`, `src/features/rooms`, `src/features/modules`, `src/features/dropdown-lists`, `src/features/smtp`, `src/features/teachers`, `AppBar.tsx`, `FieldBox.tsx` y `StatusStackBar.tsx`. `shell` queda fuera (rellenos legítimos).

## R-5. Presupuesto del registro nuevo (FR-012)

- **Decisión**: `Design.md` agrega el registro «sobrio con cabecera» (tabla de registros) y ajusta la regla 2: una pantalla de ese registro tiene exactamente un `ScreenHeader` y ningún `BrandPattern`; un sobrio puro, ninguno. Una prueba `headerBudget.test.ts` recorre las pantallas de la fase y falla si importan `BrandPattern` o `HeroCard`, o si montan más de un `ScreenHeader`.
- **Razón**: «un solo bloque de color y un patrón por pantalla» de la regla 2 ya existe; la prueba convierte la nueva en comprobable, como las demás.

## R-6. Formularios (FR-005)

- **Hallazgo**: los 9 formularios ya usan `TextField`, `SelectField`, `DateField`, `ConfirmDialog` y un solo botón primario con ícono. Lo que cambia son piezas compartidas (`FieldBox` con error, `controlBorder` en botones outlined y tonal desde la 027).
- **Decisión**: sin cambios de estructura en los formularios; se verifican con la lista de reglas y se corrige solo lo que se anote. Los formularios siguen sin cabecera (clarificación 2).

## R-7. Verificación manual

- **Decisión**: un recorrido final de las pantallas con cabecera (10) y de los formularios (9) en claro y oscuro, español e inglés, con datos, sin datos y con error. Se anota en `screen-inventory.md`.

## R-8. Orden de ramas

- **Decisión**: la rama de `tutorias_uts_mobile` se crea desde `028-modules-schedule` (PR #18 abierto); la de `Claude`, ya creada desde `028-modules-schedule` (PR #21 abierto). Cada PR apunta a la rama anterior hasta que se fusione la base.
