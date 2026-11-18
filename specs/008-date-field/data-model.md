# Data Model: Campo de fecha con selector

No hay cambios en la base de datos ni en el API. Este documento describe los valores que maneja la app.

## Día de calendario (`Day`)

- **Representación**: texto `YYYY-MM-DD` (por ejemplo `2027-02-05`). Es el valor interno del formulario, el que viaja al API y el que devuelve el API (`startsOn`, `endsOn`).
- **Vacío**: cadena vacía `''` (sin fecha elegida).
- **Validez**: año de 4 dígitos, mes 1–12 y día existente en ese mes (incluye bisiestos: `2028-02-29` válido, `2027-02-29` inválido).
- **Visualización**: `dd/mm/YYYY` (`05/02/2027`), igual en español e inglés. Si el valor es inválido o vacío, `formatDay` devuelve `''` y el campo muestra el marcador de posición.
- **Sin hora ni zona**: nunca se convierte a UTC. Solo al abrir el selector se construye un `Date` a mediodía local, y al confirmar se lee el año, mes y día **locales** del `Date` devuelto.

## Restricción de fecha (`DateConstraint`)

| Campo | Tipo | Descripción |
|---|---|---|
| `minDate` | `Day` opcional | Primer día seleccionable (inclusive). |
| `maxDate` | `Day` opcional | Último día seleccionable (inclusive). |
| `hint` | texto traducido opcional | Regla en lenguaje claro que se muestra bajo el campo. |

Regla activa en esta funcionalidad: en el formulario de periodo, `minDate` del fin = `addDays(startsOn, 1)`.

## Periodo (existente, spec 006)

Sin cambios de modelo. Solo cambia cómo se elige y se muestra:

| Campo | Entrada | Salida en pantalla |
|---|---|---|
| `startsOn` | selector → `YYYY-MM-DD` | `dd/mm/YYYY` |
| `endsOn` | selector → `YYYY-MM-DD`, posterior a `startsOn` | `dd/mm/YYYY` |

## Validaciones

| Regla | Dónde | Mensaje (clave) |
|---|---|---|
| Fecha obligatoria | Esquema Zod | `validation.required` |
| Día real del calendario | Esquema Zod | `validation.invalidDate` |
| Fin posterior al inicio | Esquema Zod + `minDate` del selector | `periods.form.endAfterStart` |
| Fin posterior al inicio, solapamientos, periodo cerrado | Servidor | `PERIOD_DATES_INVALID`, `PERIOD_DATES_OVERLAP`, `PERIOD_CLOSED_READ_ONLY` (ya traducidos) |

## Estados del campo

`vacío` → `con valor` (al confirmar) → `error` (regla incumplida, el error gana sobre el enfoque) → `deshabilitado` (periodo cerrado). `enfocado` mientras el selector está abierto. Cancelar el selector nunca cambia el estado ni el valor.
