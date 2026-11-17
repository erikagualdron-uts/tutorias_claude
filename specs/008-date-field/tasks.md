---

description: "Task list for Campo de fecha con selector"
---

# Tasks: Campo de fecha con selector

**Input**: Design documents from `/specs/008-date-field/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/date-field.md, quickstart.md

**Tests**: Incluidas. El plan compromete pruebas del formato, la validez de fechas, la zona horaria, el componente, el esquema y la pantalla de periodos. Escribirlas primero y comprobar que fallan antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. Las utilidades de fecha y la dependencia se preparan antes; cada historia añade su parte del componente y de la pantalla de periodos.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 elegir la fecha en un selector con formato dd/mm/YYYY, US2 bloquear fechas que rompen una regla, US3 accesibilidad y estados
- Todas las rutas son relativas al repositorio `tutorias_uts_mobile` (D-077), salvo las de `docs/` y `specs/`, que van en el repositorio `Claude`

## Path Conventions

- Componentes en `src/components/`, pruebas en `src/components/__tests__/`
- Utilidades de fecha en `src/date/`, pruebas en `src/date/__tests__/`
- Pantallas en `src/features/periods/screens/`
- Textos solo en `src/i18n/es.json` y `en.json`; nunca en componentes
- Colores, espaciados y tiempos solo desde `src/theme/`; ningún hexadecimal ni nombre de fuente en componentes
- Íconos solo del registro `src/icons/registry.ts` (Iconify, set `solar`)
- Comandos: `npm run lint`, `npm run typecheck`, `npm test` (con `--forceExit` si Jest no termina)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Rama, dependencia del selector y simulación para pruebas.

- [X] T001 Crear la rama `008-date-field` en `tutorias_uts_mobile` desde `007-brand-loader` y verificar que `src/icons/registry.ts` ya declara `dateRange`, `success` y `closeCircle` y que existen `src/components/FieldBox.tsx` y `src/components/SelectField.tsx`
- [X] T002 Instalar el selector con `npx expo install @react-native-community/datetimepicker` en `package.json`, comprobar la versión resultante y anotar en `specs/008-date-field/research.md` (R-1) la forma exacta de `onChange` o `onValueChange`, de `DateTimePickerAndroid.open` y de las props `minimumDate`, `maximumDate` y `display` en esa versión
- [X] T003 Agregar en `jest.setup.tsx` una simulación de `@react-native-community/datetimepicker` que exponga el componente de iOS y `DateTimePickerAndroid.open` como funciones espía, para poder elegir o cancelar una fecha en las pruebas

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Utilidades de fecha y textos base que usan las tres historias.

**⚠️ CRITICAL**: Ninguna historia empieza hasta terminar esta fase.

- [X] T004 [P] Escribir `src/date/__tests__/day.test.ts` (deben fallar): `isValidDay` acepta `2028-02-29` y rechaza `2027-02-29`, `2027-13-01`, `2027-1-1` y `''`; `parseDay`; `formatDay('2027-02-05')` da `05/02/2027` y `formatDay('')` y `formatDay('basura')` dan `''`; `toDay(new Date(2026, 11, 31, 23, 59))` da `2026-12-31`; `dayToDate` devuelve mediodía local; `addDays('2027-02-28', 1)` da `2027-03-01` y `addDays('2028-02-28', 1)` da `2028-02-29`; `compareDays`; `todayInBogota` devuelve un `YYYY-MM-DD` válido
- [X] T005 Crear `src/date/day.ts` con `isValidDay`, `parseDay`, `formatDay`, `toDay`, `dayToDate`, `todayInBogota`, `compareDays` y `addDays` según `contracts/date-field.md`: el valor es texto `YYYY-MM-DD`, sin conversión de zona horaria, `formatDay` devuelve `''` si el valor es vacío o inválido, `dayToDate` construye `new Date(y, m - 1, d, 12)`, `todayInBogota` usa `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' })` con la fecha local como respaldo
- [X] T006 [P] Agregar a `src/i18n/es.json` y `src/i18n/en.json`, con claves ordenadas (Confirmar y Cancelar reutilizan `common.confirm` y `common.cancel`), `dateField.placeholder` (dd/mm/aaaa · dd/mm/yyyy), `dateField.hint` (Abre un selector de fecha · Opens a date picker), `dateField.empty` (Sin seleccionar · Not selected) y `validation.invalidDate` (Elige una fecha válida. · Choose a valid date.)

**Checkpoint**: `npm test -- day` en verde; las utilidades están listas.

---

## Phase 3: User Story 1 - Elegir una fecha desde un selector en lugar de escribirla (Priority: P1) 🎯 MVP

**Goal**: Un campo que abre el selector del dispositivo, muestra dd/mm/YYYY y entrega `YYYY-MM-DD`; el formulario y el listado de periodos lo usan.

**Independent Test**: En "Crear periodo", tocar "Fecha de inicio", elegir 05/02/2027 y ver `05/02/2027` en el campo sin teclear; cancelar conserva el valor; el listado muestra dd/mm/YYYY.

### Tests for User Story 1 ⚠️ (escribir primero, deben fallar)

- [X] T007 [P] [US1] Escribir `src/components/__tests__/DateField.test.tsx`: tocar el campo abre el selector y no aparece teclado ni campo de texto editable; confirmar llama a `onChange('2027-02-05')` una sola vez y el campo muestra `05/02/2027`; cancelar no llama a `onChange`; con `value='2027-02-05'` el selector se abre en esa fecha; con `value` vacío se abre en `todayInBogota()`; con `value='basura'` el campo muestra el marcador de posición y no el texto "Invalid date"; el formato es `dd/mm/YYYY` con el idioma en español y en inglés
- [X] T008 [P] [US1] Actualizar `src/features/periods/__tests__/periods.test.tsx`: sustituir los `fireEvent.changeText` de `Fecha de inicio (AAAA-MM-DD)` y `Fecha de fin (AAAA-MM-DD)` por la elección de fecha mediante el selector simulado, comprobar que el cuerpo enviado sigue siendo `{ startsOn: '2030-01-15', endsOn: '2030-06-15' }` y que el listado muestra `15/01/2030 a 15/06/2030`; retirar la prueba del mensaje `Usa el formato AAAA-MM-DD.`

### Implementation for User Story 1

- [X] T009 [P] [US1] Crear `src/components/DatePickerSheet.tsx` (solo iOS): hoja inferior con la etiqueta del campo como título, el selector de fecha, y dos botones apilados con 16 px (`spacing.lg`) entre ellos: Confirmar (primario, ícono `success` a la izquierda) y Cancelar (tonal, ícono `closeCircle` a la izquierda); tocar fuera equivale a cancelar; textos con `t('common.confirm')` y `t('common.cancel')`; animación corta con Reanimated usando las duraciones del tema, sin animación si "reducir movimiento" está activo (`useReducedMotion`)
- [X] T010 [US1] Crear `src/components/DateField.tsx` sobre `FieldBox` con `leadingIcon` por defecto `dateRange` y sin chevron; props `label`, `value`, `onChange`, `placeholder`, `error`, `disabled`, `onCard`, `leadingIcon` y `onBlur` según `contracts/date-field.md`; en Android abre `DateTimePickerAndroid.open` y en iOS muestra `DatePickerSheet`; el selector parte de `dayToDate(value)` o, si está vacío, de `dayToDate(todayInBogota())`; `onChange` solo se llama al confirmar con `toDay(date)`; el texto del campo es `formatDay(value)` o el marcador de posición; nunca muestra teclado
- [X] T011 [US1] Cambiar `src/features/periods/schemas.ts`: `startsOn` y `endsOn` pasan de `regex` a validar con `isValidDay` (clave `validation.invalidDate`) y a ser obligatorios (clave `validation.required`)
- [X] T012 [US1] Cambiar `src/features/periods/screens/PeriodFormScreen.tsx`: los campos `startsOn` y `endsOn` usan `DateField` (ícono `dateRange`, `onCard={false}`, `disabled={readOnly}`, `placeholder={t('dateField.placeholder')}`, `onBlur={field.onBlur}`); el nombre sigue con `TextField`; quitar el `keyboardType` de fechas
- [X] T013 [P] [US1] Cambiar `src/i18n/es.json` y `en.json`: `periods.form.startsOn` y `periods.form.endsOn` pasan a "Fecha de inicio" y "Fecha de fin" (en: "Start date", "End date") sin el `(AAAA-MM-DD)`; eliminar `periods.form.dateFormat`
- [X] T014 [P] [US1] Cambiar `src/features/periods/screens/PeriodsScreen.tsx`: `t('periods.range', { start: formatDay(period.startsOn), end: formatDay(period.endsOn) })`

**Checkpoint**: US1 funciona sola; `npm test -- day DateField periods` en verde.

---

## Phase 4: User Story 2 - Que el selector no deje elegir fechas que rompen una regla (Priority: P1)

**Goal**: El selector bloquea los días fuera del rango, la regla se ve bajo el campo y el fin debe ser posterior al inicio.

**Independent Test**: Con inicio 01/02/2027, el selector del fin no permite el 01/02/2027 ni días anteriores y se lee "Debe ser posterior a la fecha de inicio."; mover el inicio después del fin marca el fin con error.

### Tests for User Story 2 ⚠️

- [X] T015 [P] [US2] Escribir `src/features/periods/__tests__/schemas.test.ts`: fin igual al inicio y fin anterior fallan con error en `endsOn` y clave `periods.form.endAfterStart`; fin posterior pasa; fecha vacía falla con `validation.required`; `2027-02-29` falla con `validation.invalidDate`
- [X] T016 [P] [US2] Ampliar `src/components/__tests__/DateField.test.tsx`: `minDate` y `maxDate` se entregan al selector como `minimumDate` y `maximumDate`; con `hint` el texto aparece bajo el campo; con `error` el error reemplaza al `hint` en la misma línea; si `hoy` queda fuera del rango, el selector se abre en el día permitido más cercano
- [X] T017 [P] [US2] Ampliar `src/features/periods/__tests__/periods.test.tsx`: tras elegir inicio 01/02/2027, el selector del fin recibe `minimumDate` del 02/02/2027 y se lee "Debe ser posterior a la fecha de inicio."; mover el inicio a una fecha igual o posterior al fin marca el fin con error y el botón Guardar no envía; la respuesta `PERIOD_DATES_OVERLAP` muestra el mensaje traducido ya existente y el selector no marca días ocupados

### Implementation for User Story 2

- [X] T018 [US2] Ampliar `src/components/DateField.tsx` con `minDate`, `maxDate` y `hint`: pasar `dayToDate(minDate)` y `dayToDate(maxDate)` al selector (inclusive), pintar `hint` bajo el campo con `typography.metadata` y `palette.textSecondary` (el `error` lo reemplaza), y ajustar la fecha inicial al rango con `max(min, min(max, hoy))`
- [X] T019 [US2] Cambiar `src/features/periods/schemas.ts`: añadir una validación `endsOn > startsOn` con `compareDays`, con error en `endsOn` y clave `periods.form.endAfterStart`, aplicada solo cuando ambas fechas son válidas
- [X] T020 [P] [US2] Agregar `periods.form.endAfterStart` a `src/i18n/es.json` ("Debe ser posterior a la fecha de inicio.") y `en.json` ("Must be after the start date.")
- [X] T021 [US2] Cambiar `src/features/periods/screens/PeriodFormScreen.tsx`: el campo de fin recibe `minDate={startsOn ? addDays(startsOn, 1) : undefined}` y `hint={t('periods.form.endAfterStart')}`; al cambiar el inicio, llamar `trigger('endsOn')` si el fin ya tiene valor; mantener el aviso de `PERIOD_DATES_OVERLAP` y `PERIOD_DATES_INVALID` con `errorMessage(t, failure)`

**Checkpoint**: US1 y US2 funcionan; `npm test -- day DateField periods schemas` en verde.

---

## Phase 5: User Story 3 - Accesibilidad, estados y consistencia (Priority: P2)

**Goal**: El campo se anuncia bien con lector de pantalla, respeta el estado deshabilitado, el área táctil y "reducir movimiento".

**Independent Test**: Con TalkBack o VoiceOver, el campo anuncia etiqueta, valor ("Sin seleccionar" si está vacío) y que abre un selector; en un periodo cerrado no abre el selector y se ve al 60 % de opacidad.

### Tests for User Story 3 ⚠️

- [X] T022 [P] [US3] Escribir `src/components/__tests__/DateField.a11y.test.tsx`: `accessibilityRole` es `button`; `accessibilityLabel` es la etiqueta; `accessibilityValue.text` es la fecha formateada o `t('dateField.empty')`; `accessibilityHint` es `t('dateField.hint')`; `accessibilityState.disabled` es verdadero cuando está deshabilitado; un campo deshabilitado no abre el selector; la altura mínima del área táctil es al menos 48 px; el error se comunica con texto e ícono, no solo con color
- [X] T023 [P] [US3] Escribir `src/components/__tests__/DatePickerSheet.test.tsx`: la hoja muestra Confirmar y Cancelar con su ícono a la izquierda y 16 px entre ellos; con `useReducedMotion` verdadero no anima; cerrar tocando fuera no llama a `onChange`
- [X] T024 [P] [US3] Ampliar `src/features/periods/__tests__/periods.test.tsx`: un periodo `CLOSED` muestra las fechas deshabilitadas y tocarlas no abre el selector

### Implementation for User Story 3

- [X] T025 [US3] Completar `src/components/DateField.tsx`: `Pressable` con `accessibilityRole="button"`, `accessibilityLabel`, `accessibilityValue={{ text }}`, `accessibilityHint={t('dateField.hint')}` y `accessibilityState={{ disabled }}`; `minHeight` igual a `FIELD_HEIGHT`; deshabilitado no abre el selector; el estado de enfoque se activa mientras el selector está abierto
- [X] T026 [US3] Ajustar `src/components/DatePickerSheet.tsx` según T023: duración de entrada desde `motion.duration` y sin animación cuando `useReducedMotion()` es verdadero

**Checkpoint**: las tres historias funcionan; `npm test` completo en verde.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Zona horaria, calidad, documentación y cierre.

- [X] T027 [P] Ejecutar la suite de fechas en otras zonas horarias para confirmar SC-004: `TZ=Pacific/Auckland npm test -- day DateField periods` y `TZ=America/Los_Angeles npm test -- day DateField periods` (en PowerShell: `$env:TZ='Pacific/Auckland'; npm test -- day DateField periods`)
- [X] T028 [P] Buscar en `src/` cualquier otro campo que pida un día de calendario escrito a mano o muestre una fecha `YYYY-MM-DD` al usuario (`rg "AAAA-MM-DD|YYYY-MM-DD" src`) y convertirlo a `DateField` o `formatDay`; los valores internos y del API quedan igual
- [X] T029 Ejecutar `npm run typecheck`, `npm run lint` y `npm test` en `tutorias_uts_mobile`; corregir sin silenciar reglas (en particular `eslint-plugin-i18next`, sin textos en componentes)
- [X] T030 [P] Actualizar `docs/Decisions.md` en el repositorio `Claude`: D-079 pasa de "pendiente de implementar" a "Implementada" (spec 008) y registrar D-080, "Fechas de calendario con utilidades propias, sin librería de fechas", con motivo (texto `YYYY-MM-DD` evita desfases de zona horaria, solo se necesitan ocho funciones pequeñas) y descartados (dayjs, date-fns, `Date` en UTC)
- [X] T031 [P] Revisar `docs/Architecture.md`, `docs/Design.md` y `docs/Conventions.md`: citar `src/date/day.ts` como el módulo único de fechas de calendario, y confirmar que la sección Date fields de `Design.md` describe también la hoja de iOS con Confirmar y Cancelar; corregir solo lo que difiera
- [X] T032 [P] Anotar en `specs/006-cae-configuration/tasks.md` (T023) y `research.md` (R-8) que el campo de texto `AAAA-MM-DD` fue sustituido por la spec 008 (D-079)
- [X] T033 Recorrer `specs/008-date-field/quickstart.md` en Android y en iOS (Expo Go), pasos 1 a 12, y anotar cualquier desvío
- [X] T034 Ejecutar `/feature-done-check` y atender los pendientes antes de unir la rama

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T002 antes de T003.
- **Foundational (Phase 2)**: depende de Setup; bloquea las historias. T005 depende de T004; T006 es independiente.
- **US1 (Phase 3)**: depende de Foundational. Es el MVP.
- **US2 (Phase 4)**: depende de US1 (extiende `DateField`, el esquema y la pantalla).
- **US3 (Phase 5)**: depende de US1 (completa `DateField` y `DatePickerSheet`); es independiente de US2.
- **Polish (Phase 6)**: depende de las historias que se entreguen.

### User Story Dependencies

- **US1**: tras Foundational.
- **US2**: tras US1.
- **US3**: tras US1; puede ir en paralelo con US2 si se coordina `DateField.tsx` (ambas lo tocan: US2 en T018, US3 en T025).

### Within Each User Story

- Pruebas primero y comprobar que fallan.
- Utilidades → componente → esquema → pantalla.
- Un commit por tarea o grupo lógico.

### Parallel Opportunities

- T004 y T006; T007 y T008; T009, T013 y T014; T015, T016 y T017; T022, T023 y T024; T027, T028, T030, T031 y T032.

---

## Parallel Example: User Story 1

```bash
# Pruebas de US1 juntas:
Task: "Pruebas de DateField en src/components/__tests__/DateField.test.tsx"
Task: "Pruebas de periodos en src/features/periods/__tests__/periods.test.tsx"

# Piezas independientes:
Task: "Hoja de iOS en src/components/DatePickerSheet.tsx"
Task: "Textos del formulario en src/i18n/es.json y en.json"
Task: "Rango del listado en src/features/periods/screens/PeriodsScreen.tsx"
```

---

## Implementation Strategy

### MVP First (US1)

1. Setup y Foundational (dependencia, utilidades y pruebas de fecha).
2. US1: el campo y el formulario de periodos con selector y formato dd/mm/YYYY.
3. **Detener y validar** con `quickstart.md` (pasos 1 a 3, 6 y 8).

### Incremental Delivery

1. Foundational → utilidades de fecha listas.
2. US1 → elegir fecha con selector (MVP).
3. US2 → reglas de inicio/fin visibles y bloqueadas.
4. US3 → accesibilidad, deshabilitado y "reducir movimiento".
5. Polish: zonas horarias, documentación, recorrido manual y `feature-done-check`.

---

## Notes

- Una tarea por commit o grupo lógico, en Conventional Commits en inglés (`feat(date-field): ...`).
- La única dependencia nueva es `@react-native-community/datetimepicker`, ya listada en `docs/Architecture.md` (D-079).
- Si el plan contradice `docs/Architecture.md` o `docs/Design.md`, detenerse y preguntar.
- Si la API de la versión instalada del selector difiere de lo previsto, ajustar `DateField` y anotarlo en `research.md` (T002), no cambiar el contrato público del componente.
