# Inventario de pantallas: spec 026

Generado el 2026-11-23 desde `tutorias_uts_mobile/app` (58 rutas). Las columnas de defecto se completan con el recorrido manual en el teléfono (T002, T015, T016); lo automático ya está comprobado por las guardas (contraste, valores sueltos, componentes en oscuro).

**Fases:** 1 entrada y portada (inicio de sesión, inicio de cada rol, avisos, estados vacíos) · 2 módulos y horario · 3 administración del CAE · 4 resto (chat, PQRS, perfil).
**Registro:** expresivo = entrada y portada; sobrio = pantallas de trabajo (ver `Design.md`, "Visual registers").

| Ruta | Rol | Registro | Componentes compartidos | Lee el tema | Defecto en claro | Defecto en oscuro | Fase |
|---|---|---|---|---|---|---|---|
| `(auth)/forgot-password.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | ninguno (027) | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(auth)/login.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | ninguno (027) | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(auth)/register.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | ninguno (027) | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(auth)/reset-password.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | ninguno (027) | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(auth)/verify-email.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | ninguno (027) | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(student)/index.tsx` | student | expressive | Button, Card | sí | ninguno (027) | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(student)/messages/[id].tsx` | student | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(student)/messages/index.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | por revisar | por revisar | 4 |
| `(student)/messages/new.tsx` | student | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | por revisar | por revisar | 4 |
| `(student)/modules/[id].tsx` | student | sober | Banner, Button, Card, EmptyState, LoadingScreen | sí | ninguno (028) | barra y borde de insignia con `warning` y `error`: corregido en 028 (`warningText`, `errorText`) | 2 |
| `(student)/modules/index.tsx` | student | sober | BrandLoader, Button, EmptyState, FilterChips, SearchField | sí | ninguno (028) | barra y borde de insignia con `warning` y `error`: corregido en 028 (`warningText`, `errorText`) | 2 |
| `(student)/notifications.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState | sí | ninguno (027) | aviso de cancelación con `error` y borde de botones: corregido en 027 | 1 |
| `(student)/pqrs/[id].tsx` | student | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(student)/pqrs/filed.tsx` | student | sober | Button, Card | sí | por revisar | por revisar | 4 |
| `(student)/pqrs/index.tsx` | student | sober | BrandLoader, Button, EmptyState, FilterChips | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 4 |
| `(student)/pqrs/new.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState, FilterChips, TextAreaField, TextField | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 4 |
| `(student)/schedule.tsx` | student | sober | BrandLoader, Button, Card, EmptyState | sí | ninguno (028) | línea, ícono y hora actual con `error` y `warning`; borde de días: corregido en 028 | 2 |
| `(teacher)/index.tsx` | teacher | expressive | Card | sí | ninguno (027) | ninguno (027) | 1 |
| `(teacher)/messages/[id].tsx` | teacher | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(teacher)/messages/index.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | por revisar | por revisar | 4 |
| `(teacher)/messages/new.tsx` | teacher | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | por revisar | por revisar | 4 |
| `(teacher)/notifications.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState | sí | ninguno (027) | aviso de cancelación con `error` y borde de botones: corregido en 027 | 1 |
| `(teacher)/pqrs/[id].tsx` | teacher | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(teacher)/pqrs/filed.tsx` | teacher | sober | Button, Card | sí | por revisar | por revisar | 4 |
| `(teacher)/pqrs/index.tsx` | teacher | sober | BrandLoader, Button, EmptyState, FilterChips | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 4 |
| `(teacher)/pqrs/new.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState, FilterChips, TextAreaField, TextField | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 4 |
| `(teacher)/schedule/index.tsx` | teacher | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | ninguno (028) | línea, ícono y hora actual con `error` y `warning`; borde de días: corregido en 028 | 2 |
| `(admin)/changes.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/index.tsx` | admin | expressive | Button, Card | sí | sin bloque destacado: corregido en 027 | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(admin)/messages/[id].tsx` | admin | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(admin)/messages/index.tsx` | admin | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | por revisar | por revisar | 4 |
| `(admin)/messages/new.tsx` | admin | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | por revisar | por revisar | 4 |
| `(admin)/modules/[id].tsx` | admin | sober | Banner, BrandLoader, Button, Card, ConfirmDialog, EmptyState, LoadingScreen | sí | por revisar | por revisar | 3 |
| `(admin)/modules/index.tsx` | admin | sober | BrandLoader, Button, EmptyState, SearchField, SelectField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/location-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/locations.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/modules/module-form.tsx` | admin | sober | Banner, Button, Card, EmptyState, LoadingScreen, SelectField, TextAreaField, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/room-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, SelectField, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/rooms.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips, SearchField | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 3 |
| `(admin)/more/create-teacher.tsx` | admin | sober | Banner, Button, TemporaryPasswordDialog, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/dropdown-item-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/dropdown-items.tsx` | admin | sober | Banner, BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/more/dropdown-lists.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/more/holiday-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, DateField, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/holidays.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 3 |
| `(admin)/more/holidays-import.tsx` | admin | sober | Banner, BrandLoader, Button, Card, FilterChips | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 3 |
| `(admin)/more/index.tsx` | admin | sober | Button, Card | sí | por revisar | por revisar | 3 |
| `(admin)/more/period-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, DateField, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/periods.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 3 |
| `(admin)/more/smtp.tsx` | admin | sober | Banner, Button, Card, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/students.tsx` | admin | sober | - | no | por revisar | por revisar | 3 |
| `(admin)/more/teacher-edit.tsx` | admin | sober | Banner, BrandLoader, Button, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/teachers.tsx` | admin | sober | - | no | por revisar | por revisar | 3 |
| `(admin)/notifications.tsx` | admin | sober | Banner, BrandLoader, Button, EmptyState | sí | ninguno (027) | aviso de cancelación con `error` y borde de botones: corregido en 027 | 1 |
| `(admin)/pqrs/[id].tsx` | admin | sober | Banner, BrandLoader, Button, Card, ConfirmDialog, EmptyState, TextAreaField | sí | por revisar | por revisar | 4 |
| `(admin)/pqrs/index.tsx` | admin | sober | BrandLoader, Button, EmptyState, FilterChips | sí | chip «All» cortado («Al»): corregido en 027 | chip «All» cortado y borde de chips: corregido en 027 | 4 |
| `change-password.tsx` | shared | sober | AuthLayout, Banner, Button, TextField | no | por revisar | por revisar | 4 |
| `index.tsx` | shared | expressive | LoadingScreen | no | ninguno (027) | ninguno (027) | 1 |

**Resumen:** fase 1: 12 · fase 2: 4 · fase 3: 22 · fase 4: 20 · total: 58.

**Siguiente spec:** 027, entrada y portada (fase 1).

## Defectos del recorrido en el teléfono (spec 027)

| # | Defecto | Causa | Corrección |
|---|---|---|---|
| 1 | Contraste insuficiente de botones y elementos en modo oscuro | El texto ya pasaba; faltaba el borde de los controles (`border` al 8 %) y el color de presionado oscuro era igual al normal | Rol `controlBorder` en botones `outlined` y `tonal` y chips; `primaryPressed` oscuro `#9FB01F` (D-124) |
| 2 | Botones «All» mostraban «Al» | Chip y etiqueta se encogían; Android recorta la última letra con la fuente corporativa y el espaciado entre letras | `FilterChips`: sin encoger, ancho mínimo de 48 px y margen derecho de la etiqueta; confirmar en el teléfono (T009) |

Estado de las 12 pantallas de la fase 1: auditadas contra las 8 reglas de `Design.md`; las autenticaciones, el arranque y los inicios de estudiante y docente cumplen; el inicio del CAE ganó bloque destacado; la bandeja usa `errorText` y el estado vacío con patrón de marca.

## Fase 2 (spec 028): módulos y horario

| Pieza | Uso corregido | Rol nuevo del indicador |
|---|---|---|
| `SessionBlock`, `TeacherSessionCard` | Línea e ícono de estado con `error` y `warning` | `errorText`, `warningText`, `primary` |
| `NowLine` | Línea de la hora actual con `error` | `errorText` |
| `OfferCard`, `CapacityBar` | Relleno de barra y borde de insignia con `warning` y `error` | `warningText`, `errorText` |
| `DayStrip` | Borde de días sin seleccionar con `border` | `controlBorder` |

Auditoría de las 4 pantallas y de `CancelSheet` y `SessionActionsSheet` contra las 8 reglas: cumplen (registro sobrio, un botón primario por estado, regla visible en el botón bloqueado, estados vacío, carga y error con las piezas compartidas, estudiante y docente con el mismo `WeekCalendar`). Sin defectos vistos en el teléfono.

**Pendiente para las fases 3 y 4** (usos de `error`, `warning` o `success` como indicador): `AppBar` (borde del ítem), `AccountCard` (ícono `success`), `StatusStackBar` y `StatusBadge` (colores de estado de PQRS), `PqrsFiledScreen` (ícono `success`), `SmtpSettingsScreen` (estado). Cada fase añade sus carpetas a la prueba `severityIndicators.test.ts`.
