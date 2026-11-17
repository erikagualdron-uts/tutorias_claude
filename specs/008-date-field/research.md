# Research: Campo de fecha con selector

No quedaron `NEEDS CLARIFICATION` en el contexto técnico; estas son las decisiones de diseño y su motivo.

## R-1. Selector nativo

- **Decisión**: `@react-native-community/datetimepicker`, instalado con `npx expo install` para que Expo elija la versión compatible con SDK 58.
- **Motivo**: ya decidido en `docs/Architecture.md` y D-079; funciona en Expo Go (sin compilación nativa propia), tiene diálogo en Android y vista en iOS, y admite `minimumDate` y `maximumDate`.
- **Alternativas**: librerías con modal propio (dependencias extra y estilo ajeno al sistema); calendario propio (mucho código, accesibilidad por rehacer); campo de texto con máscara (descartado en D-079: admite fechas mal escritas).
- **Riesgo**: la API del paquete cambia entre versiones mayores (nombre del evento de cambio, `display`). **Verificar al instalar** la forma exacta de `onChange`/`onValueChange` y de `DateTimePickerAndroid.open` en la versión resuelta antes de escribir el componente.

## R-2. Android frente a iOS

- **Decisión**: en Android se abre el diálogo del sistema con `DateTimePickerAndroid.open` (ya trae Aceptar y Cancelar). En iOS se muestra una hoja inferior propia (`DatePickerSheet`) con el selector en modo rueda o calendario y los botones Confirmar y Cancelar, cada uno con ícono a la izquierda y 16 px entre ellos.
- **Motivo**: `Design.md` define diálogo en Android y hoja inferior en iOS. En iOS el selector no tiene botones propios, y sin Confirmar/Cancelar no se podría cumplir FR-010 (cancelar conserva el valor anterior).
- **Alternativas**: selector en línea dentro del formulario (ocupa pantalla y desordena el formulario); aplicar el valor al girar la rueda (no hay forma de cancelar).

## R-3. Sin librería de fechas

- **Decisión**: funciones puras en `src/date/day.ts` sobre texto `YYYY-MM-DD`: `isValidDay`, `parseDay` (→ `{year, month, day}` o `null`), `formatDay` (→ `dd/mm/YYYY`, vacío si es inválido), `toDay(Date)` (con año, mes y día **locales**), `todayInBogota()`, `compareDays` y `addDays`. Para entregar un `Date` al selector se construye a mediodía local (`new Date(y, m - 1, d, 12)`).
- **Motivo**: el día de calendario no tiene hora; usar texto evita los cambios de día por zona horaria o por cambio de horario de verano. Solo se necesitan cinco operaciones, y una dependencia nueva (dayjs, date-fns) no se justifica. `Conventions.md` pide "una sola librería de fechas"; aquí se cumple al existir **un solo módulo** de fechas de calendario.
- **"Hoy en Bogotá"**: `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' })` devuelve `YYYY-MM-DD`. Si el motor no soporta la zona, se usa la fecha local como respaldo.
- **Alternativas**: dayjs o date-fns (dependencia extra para pocas operaciones); `Date` UTC (reintroduce el desfase de un día); `toISOString().slice(0,10)` (da el día UTC, no el elegido, y falla cerca de la medianoche).

## R-4. Regla de inicio y fin

- **Decisión**: el esquema Zod de periodo valida que cada fecha sea un día real y que `endsOn > startsOn` (error en `endsOn`, clave `periods.form.endAfterStart`). El campo de fin recibe `minDate = addDays(startsOn, 1)` cuando hay inicio. Al cambiar el inicio, el formulario revalida el campo de fin si ya tiene valor.
- **Motivo**: cumple FR-008 y FR-009 (error inmediato y regla visible); el esquema evita el envío y el selector evita el error. El servidor sigue validando (`PERIOD_DATES_INVALID`).
- **Alternativas**: validar solo en el servidor (error tardío); `mode: 'onChange'` global (muestra errores en campos que la persona aún no toca).

## R-5. Regla visible bajo el campo

- **Decisión**: `DateField` acepta `hint` (texto de la regla). Se pinta bajo el campo con el estilo de metadato; si hay `error`, el error lo reemplaza en la misma línea (`FieldBox` ya pinta el error con ícono). La regla del fin: "Debe ser posterior a la fecha de inicio."
- **Motivo**: la constitución VII exige mostrar la regla de toda acción bloqueada; el selector que deshabilita días sin explicarlo es opaco.

## R-6. Solapamientos con otros periodos

- **Decisión**: no se bloquean en el selector (aclaración de la sesión 2026-11-17). El servidor responde `PERIOD_DATES_OVERLAP` y la app muestra el mensaje traducido ya existente, con el periodo con el que choca.
- **Motivo**: mantiene el campo genérico y sin dependencia de otros datos.

## R-7. Accesibilidad

- **Decisión**: el campo es un `Pressable` con `accessibilityRole="button"`, `accessibilityLabel` = etiqueta, `accessibilityValue.text` = fecha formateada o "Sin seleccionar", y `accessibilityHint` = "Abre un selector de fecha". Altura mínima 52 px (`FIELD_HEIGHT`). El error usa texto e ícono, no solo color.
- **Motivo**: FR-013 y el patrón de `SelectField`.

## R-8. Reutilización de FieldBox y SelectField

- **Decisión**: `DateField` se parece a `SelectField` pero sin chevron y con ícono `dateRange`; se arma sobre `FieldBox` en lugar de modificar `SelectField`.
- **Motivo**: `SelectField` delega la apertura de la lista a la pantalla y muestra un chevron; mezclar ambos comportamientos complica el componente. Se comparte lo que importa (caja, estados, error) a través de `FieldBox`.

## R-9. Pruebas

- **Decisión**: (1) pruebas unitarias de `day.ts` con casos de bisiesto, fin de mes, entradas inválidas y zona horaria; (2) pruebas de `DateField` con el selector simulado en `jest.setup.tsx`: abrir, elegir, cancelar, deshabilitado, mínimo/máximo, valor inválido, accesibilidad; (3) pruebas del esquema de periodo; (4) actualizar `periods.test.tsx` (hoy escribe `AAAA-MM-DD`).
- **Zona horaria**: la suite se ejecuta también con `TZ=Pacific/Auckland` y `TZ=America/Los_Angeles` para comprobar que el día elegido no se corre (SC-004).
