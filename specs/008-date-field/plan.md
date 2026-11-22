# Implementation Plan: Campo de fecha con selector

**Branch**: `008-date-field` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-date-field/spec.md`

## Summary

Se crea el componente `DateField`: un campo con el mismo aspecto que `TextField`/`SelectField` (reutiliza `FieldBox`) que abre el selector de fecha del dispositivo, muestra el día como **dd/mm/YYYY** y entrega el valor como `YYYY-MM-DD` sin conversión de zona horaria. Admite mínimo, máximo, una regla visible debajo del campo y los estados de error y deshabilitado. El formulario y el listado de periodos pasan a usarlo (sustituye la tarea T023 y la nota R-8 de la spec 006). Es solo de app: el API no cambia.

Enfoque técnico (detalle en [research.md](research.md)):
- Selector nativo con `@react-native-community/datetimepicker` (ya decidido en `docs/Architecture.md` y D-079; se instala con `npx expo install`). Android: diálogo del sistema. iOS: hoja inferior propia con el selector y botones Confirmar y Cancelar.
- Sin librería de fechas: unas funciones puras y probadas (`src/date/day.ts`) para dar formato, interpretar, comparar y obtener "hoy en Bogotá". Todo el valor viaja como texto `YYYY-MM-DD`.
- La relación inicio/fin se valida en el esquema Zod del formulario y se anticipa con `minDate` en el campo de fin.

## Technical Context

**Language/Version**: TypeScript ~6.0 sobre React Native 0.88 / Expo SDK 58 (app `tutorias_uts_mobile`).

**Primary Dependencies**: Existentes: Expo Router, React Hook Form + Zod, i18next, `react-native-iconify`, Reanimated, `FieldBox`. **Nueva (1)**: `@react-native-community/datetimepicker` (versión que resuelva `npx expo install` para SDK 58), ya listada en `docs/Architecture.md`.

**Storage**: N/A. Sin cambios de esquema, migraciones ni API.

**Testing**: Jest (`jest-expo`) y `@testing-library/react-native`. Pruebas de funciones de fecha, del componente (con el selector simulado), del esquema y de la pantalla de periodos.

**Target Platform**: Android e iOS (Expo Go y compilaciones propias).

**Project Type**: mobile-app (cambio solo en `tutorias_uts_mobile`; `docs/` y `specs/` en `Claude`).

**Performance Goals**: el selector se abre en menos de 300 ms tras el toque; sin parpadeo del valor al confirmar.

**Constraints**: formato fijo dd/mm/YYYY en es y en; valor `YYYY-MM-DD` sin zona horaria; objetivo táctil ≥ 48 px; textos solo en `es.json` y `en.json`; colores solo del tema; íconos solo del registro Iconify; respeta "reducir movimiento".

**Scale/Scope**: 1 componente nuevo, 1 módulo de utilidades, 2 pantallas adaptadas (formulario y listado de periodos), ~6 claves de traducción.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en `docs/` | Sigue D-079, `Design.md` (Date fields) y `Conventions.md` §5. Se actualiza `Decisions.md` (D-079 pasa a implementada; se registra la decisión de no usar librería de fechas) y `Architecture.md` si cambia algo. **Pasa** |
| II. Reglas en el backend | La app solo anticipa; el servidor sigue validando fechas y solapamientos (FR-015). No se toca el backend. **Pasa** |
| III. Integridad de datos | El día de calendario no pasa por UTC ni zona horaria; "hoy" se calcula en `America/Bogota`. **Pasa** |
| IV. Seguridad y privacidad | Sin datos sensibles ni secretos. **Pasa** |
| V. Pruebas primero | No toca cupo, cruces ni ventanas; aun así, el formato, la validez de fechas y la zona horaria llevan pruebas. **Pasa** |
| VI. i18n | Todo texto en `es.json` y `en.json`; el formato de fecha es fijo pero los nombres de mes y día los dibuja el sistema. **Pasa** |
| VII. Diseño | Mismo `FieldBox`, ícono Iconify, 48 px, regla visible bajo el campo, sin colores nuevos. **Pasa** |
| VIII. Incremental | Una funcionalidad por rama; una dependencia nueva ya aprobada en `Architecture.md`. **Pasa** |
| IX. Idioma | Docs en español, código en inglés. **Pasa** |

Sin violaciones; no se requiere Complexity Tracking.

**Re-evaluación tras el diseño (Phase 1)**: sin cambios. El diseño no añade colores, íconos fuera del registro, librerías de fechas ni cambios de API.

## Project Structure

### Documentation (this feature)

```text
specs/008-date-field/
├── plan.md              # Este archivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── date-field.md    # Contrato del componente y de las funciones de fecha
├── checklists/
│   └── requirements.md
└── tasks.md             # Lo crea /speckit-tasks
```

### Source Code (repositorio `tutorias_uts_mobile`)

```text
src/
├── date/
│   ├── day.ts                      # NUEVO: parseDay, formatDay, toDay, todayInBogota, compareDays, addDays, isValidDay
│   └── __tests__/day.test.ts       # NUEVO
├── components/
│   ├── DateField.tsx               # NUEVO: campo + selector (Android) / hoja (iOS)
│   ├── DatePickerSheet.tsx         # NUEVO: hoja inferior de iOS con Confirmar y Cancelar
│   ├── FieldBox.tsx                # sin cambios (se reutiliza; su pie muestra la regla)
│   └── __tests__/DateField.test.tsx  # NUEVO
├── features/periods/
│   ├── schemas.ts                  # CAMBIA: día válido real + fin posterior al inicio
│   ├── screens/PeriodFormScreen.tsx  # CAMBIA: DateField en lugar de TextField para fechas
│   ├── screens/PeriodsScreen.tsx   # CAMBIA: rango con formatDay
│   └── __tests__/                  # CAMBIA: periods.test.tsx; schema test nuevo
├── i18n/{es,en}.json               # CAMBIA: claves de DateField y reglas; se retira periods.form.dateFormat
└── icons/registry.ts               # solo si falta un ícono (confirmar, cerrar); si no, sin cambios
jest.setup.tsx                      # CAMBIA: simulación de @react-native-community/datetimepicker
package.json                        # CAMBIA: dependencia nueva
```

Repositorio `Claude` (documentación): `docs/Decisions.md` (D-079 y nueva D-080), y `docs/Design.md`/`docs/Conventions.md` solo si el diseño final difiere de lo ya escrito.

**Structure Decision**: componente genérico en `src/components/` junto a `TextField` y `SelectField` (no es de una sola funcionalidad); utilidades de fecha en `src/date/` porque `Conventions.md` pide una sola vía de fechas en toda la app y hoy no hay carpeta de utilidades. La adopción queda en `features/periods/`.

## Complexity Tracking

Sin violaciones que justificar.
