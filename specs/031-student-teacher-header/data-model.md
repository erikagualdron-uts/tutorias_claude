# Data Model: pantallas de la spec 031

Sin datos de negocio ni base de datos. **Ningún rol, token ni pieza nueva**: se reutiliza `ScreenHeader` (spec 029). Cambia solo dónde se monta.

## Pantallas con cabecera (3)

| Pantalla | `title` | `count` | Dónde se monta |
|---|---|---|---|
| `StudentModulesScreen` | `t('student.modules.title')` | `segment === 'available' ? offer.data?.data.length : undefined` | En lugar del `Text` de título, dentro del `ScrollView` |
| `StudentScheduleScreen` | `t('tabs.schedule')` | no lleva | Primer hijo del `ScrollView`, encima de la `Card` del calendario |
| `TeacherScheduleScreen` | `t('teacher.schedule.title')` | no lleva | En lugar del `Text` de título, dentro del `ScrollView` |

## Pantallas que no cambian

| Pantalla | Registro | Motivo |
|---|---|---|
| `StudentModuleDetailScreen` | Sobrio, sin cabecera | Detalle, como el detalle de módulo del CAE |
| Inicios de estudiante y docente | Expresivo | Ya tienen su bloque de marca |
| `MyEnrollmentsScreen` | No tiene ruta propia: se muestra dentro de los módulos del estudiante | Sin cambio |

## Reglas de validación

- `headerBudget.test.ts`: las 3 pantallas tienen exactamente un `ScreenHeader` y ningún `BrandPattern`/`HeroCard`; `StudentModuleDetailScreen` no tiene cabecera.
- Pruebas de pantalla: la cabecera muestra el título existente (`getByRole('header', { name })`); en módulos, el número del segmento «disponibles» y ninguno en «mis módulos»; en los horarios, ningún número.
- El calendario, `CalendarHeader`, la navegación de semana, las vistas y las tarjetas de sesión conservan sus pruebas sin cambio.
- `Design.md` suma estas pantallas al registro «sobrio con cabecera»; `designDoc.test.ts` sigue exigiendo la tabla de 40 roles.
- Paridad: sin cambios (40 llaves).
