# Research: Módulos y horario renovados

Sin `NEEDS CLARIFICATION` abiertos. Medido en el código el 2026-11-23 (`tutorias_uts_mobile`, rama de la spec 027).

## R-1. Qué falla en la fase 2 (medido)

El teléfono no mostró defectos; la revisión del código sí. El texto de las 4 pantallas ya cumple (los pares de la matriz de la spec 026 pasan). Lo que falla es el **color de severidad usado como indicador** (ícono, línea, relleno de barra), que exige 3:1, con los roles de relleno `error`, `warning` y `success`, que son para rellenos y no para indicadores:

| Dónde | Uso actual | Medida | Falla |
|---|---|---|---|
| `SessionBlock`: línea izquierda e ícono de estado | cancelada `error`, reprogramada `warning` | `error` sobre `surface` oscuro 1.84:1; `warning` sobre `surface` claro 2.14:1 | ícono 3:1 |
| `TeacherSessionCard`: color de línea, ícono e insignia | igual que arriba, sobre `card` | `error` sobre `card` oscuro 2.21:1; `warning` sobre `card` claro 2.37:1 | 3:1 |
| `NowLine`: punto y línea de la hora actual | `error` | `error` sobre `screen` oscuro 2.81:1, sobre `surface` 1.84:1 | indicador 3:1 |
| `OfferCard`: relleno de la barra de cupo («últimos cupos») | `warning` | `warning` sobre `card` claro 2.37:1 | 3:1 |
| `OfferCard`: borde de las insignias `LAST_SPOTS` y `BLOCKED` | `warning`, `error` (`AVAILABLE` usa `primary`, `ENROLLED` `link` y `FULL` `textSecondary`, que ya cumplen) | bajo 3:1 en uno de los modos (el texto de la insignia ya usa `warningText` y `errorText`) | borde igual al de su texto |
| `CapacityBar` (barra compartida con los tableros) | `warning` | igual que la barra de `OfferCard` | 3:1 |
| `DayStrip`: borde de los días sin seleccionar (son botones) | `border` (blanco al 8 % en oscuro) | 1.1:1 | borde de control 3:1 |

Lo que **no** falla y se deja: las líneas de hora de la rejilla y los contornos de las columnas (`border`, separadores decorativos que no identifican un control); el día de hoy (2 px `primary`) y el día seleccionado (relleno `primary`), que ya pasan; los estados, que ya son texto más ícono; el estado vacío, la carga y el error, que ya usan las piezas compartidas.

- **Causa de fondo**: la matriz mide pares de texto e íconos de roles de la tabla, pero no impide que un componente tome `error` o `warning` como color de indicador. Es el mismo hueco de la 027 (bordes de controles).
- **Decisión**: indicadores con roles de texto de severidad (`errorText`, `warningText`, `primary`), que ya cumplen 3:1 sobre `card`, `screen` y `surface` en ambos modos; los roles `error`, `warning` y `success` quedan solo para rellenos (botones, avisos, insignia numérica). Sin colores ni roles nuevos.
- **Alternativas**: un rol nuevo `indicator*` (descartada: los roles de texto de severidad ya existen y miden lo mismo); engrosar las líneas (descartada: el contraste sigue sin cumplirse).

## R-2. Guarda para que no vuelva

- **Decisión**: una prueba `severityIndicators.test.ts` (cubre los 6 archivos con color de severidad; el borde de `DayStrip` lo cubre su prueba) que recorre los archivos de la fase 2 (calendario, módulos del estudiante, horario del estudiante, horario del docente y `CapacityBar`) y falla si usan `palette.error`, `palette.warning` o `palette.success`. Cada fase siguiente añade sus carpetas a la lista, así que nunca se bloquea trabajo de fases que aún no se han revisado. La matriz de contraste añade los pares `errorText`, `warningText` y `primary` sobre `surface` y `screen` con 3:1 (hoy solo sobre `card`).
- **Razón**: los cuatro hallazgos de R-1 vienen de una misma confusión de roles; la prueba la cierra por construcción.
- **Alternativa**: una regla de lint personalizada (descartada: más infraestructura que una prueba que lee archivos, como `noLooseColors`).

## R-3. Consistencia entre estudiante y docente (FR-004)

- **Hallazgo**: ambos horarios ya montan la misma pieza `WeekCalendar` con `SessionBlock`, `DayStrip`, `WeekGrid` y `NowLine`. Lo único distinto es la lista de tarjetas bajo el calendario del docente (`TeacherSessionCard`), que no existe en el estudiante por diseño (spec 021).
- **Decisión**: sin cambios de estructura; se unifican los colores de indicador (R-1) para que ambos roles muestren los mismos estados con los mismos roles. `TeacherSessionCard` sigue siendo del docente.
- **Alternativa**: dar al estudiante una lista igual (descartada: la spec 021 la excluyó).

## R-4. Tarjeta de módulo (FR-002)

- **Hallazgo**: `OfferCard` ya muestra nombre, docente, horario, cupo (número y barra) y estado como texto con insignia; se usa en la lista y en el detalle.
- **Decisión**: sin cambio de estructura; solo los indicadores de R-1 (barra y borde de insignia). El orden de la jerarquía se fija con una prueba que comprueba la secuencia de textos (nombre, docente, horario, cupo, estado).
- **Alternativa**: rediseñar la tarjeta (descartada: no hay defecto visto y la spec pide consistencia, no una tarjeta nueva).

## R-5. Estados y regla de bloqueo (FR-006, FR-008)

- **Hallazgo**: las 4 pantallas ya usan `EmptyState` (con patrón desde la 027), `BrandLoader` y `Banner`; el botón deshabilitado ya muestra su regla (`helperText`).
- **Decisión**: se verifican con pruebas existentes y una lista de revisión; sin cambios de código salvo lo que la revisión anote.

## R-6. Verificación manual

- **Decisión**: un recorrido final de las 4 pantallas (claro y oscuro, español e inglés) con módulos de todos los estados y sesiones canceladas, reprogramadas y de la hora actual. Se anota en `screen-inventory.md`.

## R-7. Orden de ramas

- **Decisión**: la rama de `tutorias_uts_mobile` se crea desde `027-entry-front-page` (PR #17 abierto); la de `Claude`, ya creada desde `027-entry-front-page` (PR #20 abierto). Cada PR apunta a la rama anterior hasta que se fusione la base.
