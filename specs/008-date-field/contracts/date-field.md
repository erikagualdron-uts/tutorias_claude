# Contrato: `DateField` y funciones de fecha

Contrato de interfaz de la app (no hay endpoints nuevos).

## Componente `DateField` (`src/components/DateField.tsx`)

```ts
interface DateFieldProps {
  label: string;               // texto ya traducido
  value: string;               // Day 'YYYY-MM-DD' o ''
  onChange: (value: string) => void;  // solo se llama al confirmar; entrega 'YYYY-MM-DD'
  placeholder: string;         // texto traducido, por ejemplo "dd/mm/aaaa"
  minDate?: string;            // Day, inclusive
  maxDate?: string;            // Day, inclusive
  hint?: string;               // regla traducida, visible bajo el campo
  error?: string;              // mensaje traducido; reemplaza a hint en la misma línea
  disabled?: boolean;          // no abre el selector; opacidad 60 %
  onCard?: boolean;            // por defecto true, igual que SelectField
  leadingIcon?: IconName;      // por defecto 'dateRange'
  onBlur?: () => void;         // se llama al cerrar el selector (para React Hook Form)
}
```

**Comportamiento**
1. Tocar el campo (si no está deshabilitado) abre el selector con `minimumDate = minDate` y `maximumDate = maxDate`.
2. Fecha inicial del selector: `value` si es válido; si no, hoy en Bogotá ajustado al rango (`max(min, min(max, hoy))`).
3. Confirmar llama a `onChange(day)` una sola vez y cierra el selector. Cancelar o cerrar no llama a `onChange`.
4. El texto del campo es `formatDay(value)`; si queda vacío muestra `placeholder`.
5. Accesibilidad: `accessibilityRole="button"`, `accessibilityLabel={label}`, `accessibilityValue={{ text: formato o "sin seleccionar" }}`, `accessibilityHint` traducido, `accessibilityState={{ disabled }}`.
6. El campo nunca muestra teclado ni acepta texto.

## Hoja `DatePickerSheet` (solo iOS, `src/components/DatePickerSheet.tsx`)

Hoja inferior con título (la etiqueta del campo), el selector, y dos botones apilados con 16 px entre ellos: **Confirmar** (primario, ícono a la izquierda) y **Cancelar** (enlace de texto o tonal, ícono a la izquierda). Cerrar tocando fuera equivale a cancelar.

## Funciones `src/date/day.ts`

| Función | Entrada → salida | Notas |
|---|---|---|
| `isValidDay(s)` | `string` → `boolean` | Formato `YYYY-MM-DD` y día existente. |
| `parseDay(s)` | `string` → `{ year, month, day } \| null` | `null` si es inválido. |
| `formatDay(s)` | `string` → `string` | `dd/mm/YYYY`; `''` si es inválido o vacío. |
| `toDay(date)` | `Date` → `string` | Usa año, mes y día **locales**. |
| `dayToDate(s)` | `string` → `Date \| undefined` | Mediodía local; `undefined` si es inválido. |
| `todayInBogota()` | → `string` | `YYYY-MM-DD` en `America/Bogota`. |
| `compareDays(a, b)` | `string, string` → `-1 \| 0 \| 1` | Comparación por texto; ambos válidos. |
| `addDays(s, n)` | `string, number` → `string` | Aritmética de calendario (fin de mes y bisiestos). |

## Textos de traducción (es / en)

| Clave | Español | English |
|---|---|---|
| `dateField.placeholder` | dd/mm/aaaa | dd/mm/yyyy |
| `dateField.hint` | Abre un selector de fecha | Opens a date picker |
| `dateField.empty` | Sin seleccionar | Not selected |
| `dateField.confirm` | Confirmar | Confirm |
| `dateField.cancel` | Cancelar | Cancel |
| `validation.invalidDate` | Elige una fecha válida. | Choose a valid date. |
| `periods.form.startsOn` | Fecha de inicio | Start date |
| `periods.form.endsOn` | Fecha de fin | End date |
| `periods.form.endAfterStart` | Debe ser posterior a la fecha de inicio. | Must be after the start date. |

Se retira `periods.form.dateFormat` ("Usa el formato AAAA-MM-DD") y se quita el `(AAAA-MM-DD)` de las etiquetas.

## Contrato con el API (sin cambios)

`POST/PATCH` de periodos reciben `startsOn` y `endsOn` como `YYYY-MM-DD`; las respuestas los devuelven igual. Errores relevantes ya traducidos: `PERIOD_DATES_INVALID`, `PERIOD_DATES_OVERLAP`, `PERIOD_CLOSED_READ_ONLY`.
