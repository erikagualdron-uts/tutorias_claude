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
| `(student)/messages/[id].tsx` | student | sober | BrandLoader, Button, EmptyState | sí | ninguno (030) | burbuja ajena sin borde en oscuro: corregido en 030 | 4 |
| `(student)/messages/index.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | ninguno (030) | cabecera de marca añadida (registro sobrio con cabecera) | 4 |
| `(student)/messages/new.tsx` | student | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | ninguno (030) | ninguno (030) | 4 |
| `(student)/modules/[id].tsx` | student | sober | Banner, Button, Card, EmptyState, LoadingScreen | sí | ninguno (028) | barra y borde de insignia con `warning` y `error`: corregido en 028 (`warningText`, `errorText`) | 2 |
| `(student)/modules/index.tsx` | student | sober | BrandLoader, Button, EmptyState, FilterChips, SearchField | sí | ninguno (028) | barra y borde de insignia con `warning` y `error`: corregido en 028 (`warningText`, `errorText`) | 2 |
| `(student)/notifications.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState | sí | ninguno (027) | aviso de cancelación con `error` y borde de botones: corregido en 027 | 1 |
| `(student)/pqrs/[id].tsx` | student | sober | BrandLoader, Button, EmptyState | sí | ninguno (030) | insignia de estado con `success`/`warning`: corregido en 030 | 4 |
| `(student)/pqrs/filed.tsx` | student | sober | Button, Card | sí | ninguno (030) | ícono de éxito con `success`: corregido en 030 (`successText`) | 4 |
| `(student)/pqrs/index.tsx` | student | sober | BrandLoader, Button, EmptyState, FilterChips | sí | ninguno (030) | cabecera de marca y filtros en una fila compacta con desplazamiento: corregido en 030 | 4 |
| `(student)/pqrs/new.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState, FilterChips, TextAreaField, TextField | sí | ninguno (030) | ninguno (030) | 4 |
| `(student)/schedule.tsx` | student | sober | BrandLoader, Button, Card, EmptyState | sí | ninguno (028) | línea, ícono y hora actual con `error` y `warning`; borde de días: corregido en 028 | 2 |
| `(teacher)/index.tsx` | teacher | expressive | Card | sí | ninguno (027) | ninguno (027) | 1 |
| `(teacher)/messages/[id].tsx` | teacher | sober | BrandLoader, Button, EmptyState | sí | ninguno (030) | burbuja ajena sin borde en oscuro: corregido en 030 | 4 |
| `(teacher)/messages/index.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | ninguno (030) | cabecera de marca añadida (registro sobrio con cabecera) | 4 |
| `(teacher)/messages/new.tsx` | teacher | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | ninguno (030) | ninguno (030) | 4 |
| `(teacher)/notifications.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState | sí | ninguno (027) | aviso de cancelación con `error` y borde de botones: corregido en 027 | 1 |
| `(teacher)/pqrs/[id].tsx` | teacher | sober | BrandLoader, Button, EmptyState | sí | ninguno (030) | insignia de estado con `success`/`warning`: corregido en 030 | 4 |
| `(teacher)/pqrs/filed.tsx` | teacher | sober | Button, Card | sí | ninguno (030) | ícono de éxito con `success`: corregido en 030 (`successText`) | 4 |
| `(teacher)/pqrs/index.tsx` | teacher | sober | BrandLoader, Button, EmptyState, FilterChips | sí | ninguno (030) | cabecera de marca y filtros en una fila compacta con desplazamiento: corregido en 030 | 4 |
| `(teacher)/pqrs/new.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState, FilterChips, TextAreaField, TextField | sí | ninguno (030) | ninguno (030) | 4 |
| `(teacher)/schedule/index.tsx` | teacher | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | ninguno (028) | línea, ícono y hora actual con `error` y `warning`; borde de días: corregido en 028 | 2 |
| `(admin)/changes.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/index.tsx` | admin | expressive | Button, Card | sí | sin bloque destacado: corregido en 027 | contraste del borde de botones: corregido en 027 (`controlBorder`) | 1 |
| `(admin)/messages/[id].tsx` | admin | sober | BrandLoader, Button, EmptyState | sí | ninguno (030) | burbuja ajena sin borde en oscuro: corregido en 030 | 4 |
| `(admin)/messages/index.tsx` | admin | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | ninguno (030) | cabecera de marca añadida (registro sobrio con cabecera) | 4 |
| `(admin)/messages/new.tsx` | admin | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | ninguno (030) | ninguno (030) | 4 |
| `(admin)/modules/[id].tsx` | admin | sober | Banner, BrandLoader, Button, Card, ConfirmDialog, EmptyState, LoadingScreen | sí | ninguno (029) | ninguno (029) | 3 |
| `(admin)/modules/index.tsx` | admin | sober | BrandLoader, Button, EmptyState, SearchField, SelectField | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/modules/location-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/modules/locations.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/modules/module-form.tsx` | admin | sober | Banner, Button, Card, EmptyState, LoadingScreen, SelectField, TextAreaField, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/modules/room-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, SelectField, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/modules/rooms.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips, SearchField | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/more/create-teacher.tsx` | admin | sober | Banner, Button, TemporaryPasswordDialog, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/more/dropdown-item-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/more/dropdown-items.tsx` | admin | sober | Banner, BrandLoader, Button, Card, EmptyState | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/more/dropdown-lists.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/more/holiday-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, DateField, LoadingScreen, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/more/holidays.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/more/holidays-import.tsx` | admin | sober | Banner, BrandLoader, Button, Card, FilterChips | sí | ninguno (029) | ninguno (029) | 3 |
| `(admin)/more/index.tsx` | admin | sober | Button, Card | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/more/period-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, DateField, EmptyState, LoadingScreen, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/more/periods.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | ninguno (029) | cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/more/smtp.tsx` | admin | sober | Banner, Button, Card, EmptyState, LoadingScreen, TextField | sí | ninguno (029) | borde e ícono del estado con `warning` y `success`: corregido en 029 | 3 |
| `(admin)/more/students.tsx` | admin | sober | - | no | ninguno (029) | ícono de cuenta activa con `success`: corregido en 029; cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/more/teacher-edit.tsx` | admin | sober | Banner, BrandLoader, Button, TextField | sí | ninguno (029) | borde de campo con error `error` en oscuro: corregido en 029 (`FieldBox`) | 3 |
| `(admin)/more/teachers.tsx` | admin | sober | - | no | ninguno (029) | ícono de cuenta activa con `success`: corregido en 029; cabecera de marca añadida (registro sobrio con cabecera) | 3 |
| `(admin)/notifications.tsx` | admin | sober | Banner, BrandLoader, Button, EmptyState | sí | ninguno (027) | aviso de cancelación con `error` y borde de botones: corregido en 027 | 1 |
| `(admin)/pqrs/[id].tsx` | admin | sober | Banner, BrandLoader, Button, Card, ConfirmDialog, EmptyState, TextAreaField | sí | ninguno (030) | insignia de estado con `success`/`warning`: corregido en 030 | 4 |
| `(admin)/pqrs/index.tsx` | admin | sober | BrandLoader, Button, EmptyState, FilterChips | sí | ninguno (030) | cabecera de marca y filtros en una fila compacta con desplazamiento: corregido en 030 | 4 |
| `change-password.tsx` | shared | sober | AuthLayout, Banner, Button, TextField | no | ninguno (030) | ninguno (030) | 4 |
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

## Fase 3 (spec 029): administración del CAE

| Pieza | Cambio |
|---|---|
| `ScreenHeader` (nueva) | Cabecera compacta de marca en 10 pantallas: módulos, sedes, salones, docentes, estudiantes, periodos, festivos, listas desplegables, elementos de lista, cambios e índice de «Más» (docentes y estudiantes comparten pantalla) |
| `AppBar` | Borde de «Cerrar sesión» con `errorText` |
| `AccountCard` | Ícono de cuenta activa con `successText` |
| `StatusStackBar` | Segmentos con `warningText` y `successText` |
| `SmtpSettingsScreen` | Un solo `textColor` para borde, ícono y texto del estado |
| `FieldBox` | Borde de campo con error con `errorText` |

Auditoría de los 11 formularios y detalle (sin cabecera): cada botón lleva ícono a la izquierda, solo hay un primario por estado y sus campos usan `FieldBox`; sin defectos vistos en el teléfono.

**Pendiente para la fase 4**: `StatusBadge` y `PqrsFiledScreen` (PQRS), chat y perfil; cada fase añade sus carpetas a `severityIndicators.test.ts` y sus pantallas a `headerBudget.test.ts` si usan cabecera.

## Fase 4 (spec 030): chat, PQRS y perfil

| Pieza | Cambio |
|---|---|
| `FilterChips` | Propiedad `scroll`: fila compacta con desplazamiento horizontal (36 px visuales, 48 px de toque); la usan las 3 listas de PQRS |
| `ScreenHeader` | Cabecera en mensajes (sin número), mis PQRS y PQRS del CAE (con total) |
| `StatusBadge`, `PqrsFiledScreen` | `successText`, `warningText` y `primary` en lugar de `success` y `warning` |
| `MessageBubble` | Borde de 1 px en oscuro para la burbuja ajena |

**Defecto del recorrido en el teléfono:** los filtros de PQRS se veían feos y eran molestos (en el CAE, tres filas de chips de 48 px con salto de línea). Corregido con la fila compacta (supuesto por defecto, opción B).

**Pendiente de confirmar en el teléfono:** la etiqueta «All» de los chips en inglés (la corrección de la spec 029 y la de relleno en `FilterChips`); si persiste, se ajusta en `FilterChips` para todas las listas.

Auditoría de las pantallas de chat, PQRS y cambio de clave contra las 8 reglas: cada botón lleva ícono a la izquierda, hay un solo primario por estado, los formularios usan `FieldBox` y los estados vacío, de carga y de error usan las piezas compartidas; el envío de mensajes no tiene un estado bloqueado en la interfaz que explicar. Sin otros defectos vistos.

**Cierre del inventario:** con esta fase quedan cubiertas las 58 pantallas de la spec 026 (fases 1 a 4).

## Spec 031: cabecera en estudiante y docente

| Pantalla | Cambio |
|---|---|
| Módulos del estudiante | `ScreenHeader` con el título y el número de módulos disponibles (sin número en «mis módulos») |
| Horario del estudiante | `ScreenHeader` encima del calendario, con el texto de su pestaña |
| Horario del docente | `ScreenHeader` en lugar del título de texto |

El detalle de módulo del estudiante sigue sobrio y los inicios expresivos. Sin defectos vistos en el teléfono; el pedido fue de aspecto (más moderno y refrescante).

## Spec 032: Mi cuenta

| Pantalla | Registro |
|---|---|
| Mi cuenta (`account`) | Sobrio con cabecera: datos de la sesión, notificaciones, cambiar contraseña y cerrar sesión |
| Cambiar contraseña (`account-password`) | Sobrio sin cabecera: los dos campos y un botón principal |

Las dos se alcanzan desde el avatar. La edición del nombre queda para otra spec.
