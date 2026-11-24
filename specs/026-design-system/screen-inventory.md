# Inventario de pantallas: spec 026

Generado el 2026-11-23 desde `tutorias_uts_mobile/app` (58 rutas). Las columnas de defecto se completan con el recorrido manual en el teléfono (T002, T015, T016); lo automático ya está comprobado por las guardas (contraste, valores sueltos, componentes en oscuro).

**Fases:** 1 entrada y portada (inicio de sesión, inicio de cada rol, avisos, estados vacíos) · 2 módulos y horario · 3 administración del CAE · 4 resto (chat, PQRS, perfil).
**Registro:** expresivo = entrada y portada; sobrio = pantallas de trabajo (ver `Design.md`, "Visual registers").

| Ruta | Rol | Registro | Componentes compartidos | Lee el tema | Defecto en claro | Defecto en oscuro | Fase |
|---|---|---|---|---|---|---|---|
| `(auth)/forgot-password.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | por revisar | por revisar | 1 |
| `(auth)/login.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | por revisar | por revisar | 1 |
| `(auth)/register.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | por revisar | por revisar | 1 |
| `(auth)/reset-password.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | por revisar | por revisar | 1 |
| `(auth)/verify-email.tsx` | auth | expressive | AuthLayout, Banner, Button, TextField | no | por revisar | por revisar | 1 |
| `(student)/index.tsx` | student | expressive | Button, Card | sí | por revisar | por revisar | 1 |
| `(student)/messages/[id].tsx` | student | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(student)/messages/index.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | por revisar | por revisar | 4 |
| `(student)/messages/new.tsx` | student | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | por revisar | por revisar | 4 |
| `(student)/modules/[id].tsx` | student | sober | Banner, Button, Card, EmptyState, LoadingScreen | sí | por revisar | por revisar | 2 |
| `(student)/modules/index.tsx` | student | sober | BrandLoader, Button, EmptyState, FilterChips, SearchField | sí | por revisar | por revisar | 2 |
| `(student)/notifications.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 1 |
| `(student)/pqrs/[id].tsx` | student | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(student)/pqrs/filed.tsx` | student | sober | Button, Card | sí | por revisar | por revisar | 4 |
| `(student)/pqrs/index.tsx` | student | sober | BrandLoader, Button, EmptyState, FilterChips | sí | por revisar | por revisar | 4 |
| `(student)/pqrs/new.tsx` | student | sober | Banner, BrandLoader, Button, EmptyState, FilterChips, TextAreaField, TextField | sí | por revisar | por revisar | 4 |
| `(student)/schedule.tsx` | student | sober | BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 2 |
| `(teacher)/index.tsx` | teacher | expressive | Card | sí | por revisar | por revisar | 1 |
| `(teacher)/messages/[id].tsx` | teacher | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(teacher)/messages/index.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | por revisar | por revisar | 4 |
| `(teacher)/messages/new.tsx` | teacher | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | por revisar | por revisar | 4 |
| `(teacher)/notifications.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 1 |
| `(teacher)/pqrs/[id].tsx` | teacher | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(teacher)/pqrs/filed.tsx` | teacher | sober | Button, Card | sí | por revisar | por revisar | 4 |
| `(teacher)/pqrs/index.tsx` | teacher | sober | BrandLoader, Button, EmptyState, FilterChips | sí | por revisar | por revisar | 4 |
| `(teacher)/pqrs/new.tsx` | teacher | sober | Banner, BrandLoader, Button, EmptyState, FilterChips, TextAreaField, TextField | sí | por revisar | por revisar | 4 |
| `(teacher)/schedule/index.tsx` | teacher | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | por revisar | por revisar | 2 |
| `(admin)/changes.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/index.tsx` | admin | expressive | Button, Card | sí | por revisar | por revisar | 1 |
| `(admin)/messages/[id].tsx` | admin | sober | BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 4 |
| `(admin)/messages/index.tsx` | admin | sober | Banner, BrandLoader, Button, EmptyState, SegmentedControl | sí | por revisar | por revisar | 4 |
| `(admin)/messages/new.tsx` | admin | sober | Banner, BrandLoader, Button, Card, EmptyState, SearchField | sí | por revisar | por revisar | 4 |
| `(admin)/modules/[id].tsx` | admin | sober | Banner, BrandLoader, Button, Card, ConfirmDialog, EmptyState, LoadingScreen | sí | por revisar | por revisar | 3 |
| `(admin)/modules/index.tsx` | admin | sober | BrandLoader, Button, EmptyState, SearchField, SelectField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/location-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/locations.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/modules/module-form.tsx` | admin | sober | Banner, Button, Card, EmptyState, LoadingScreen, SelectField, TextAreaField, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/room-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, SelectField, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/modules/rooms.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips, SearchField | sí | por revisar | por revisar | 3 |
| `(admin)/more/create-teacher.tsx` | admin | sober | Banner, Button, TemporaryPasswordDialog, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/dropdown-item-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/dropdown-items.tsx` | admin | sober | Banner, BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/more/dropdown-lists.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState | sí | por revisar | por revisar | 3 |
| `(admin)/more/holiday-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, DateField, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/holidays.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | por revisar | por revisar | 3 |
| `(admin)/more/holidays-import.tsx` | admin | sober | Banner, BrandLoader, Button, Card, FilterChips | sí | por revisar | por revisar | 3 |
| `(admin)/more/index.tsx` | admin | sober | Button, Card | sí | por revisar | por revisar | 3 |
| `(admin)/more/period-form.tsx` | admin | sober | Banner, Button, ConfirmDialog, DateField, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/periods.tsx` | admin | sober | BrandLoader, Button, Card, EmptyState, FilterChips | sí | por revisar | por revisar | 3 |
| `(admin)/more/smtp.tsx` | admin | sober | Banner, Button, Card, EmptyState, LoadingScreen, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/students.tsx` | admin | sober | - | no | por revisar | por revisar | 3 |
| `(admin)/more/teacher-edit.tsx` | admin | sober | Banner, BrandLoader, Button, TextField | sí | por revisar | por revisar | 3 |
| `(admin)/more/teachers.tsx` | admin | sober | - | no | por revisar | por revisar | 3 |
| `(admin)/notifications.tsx` | admin | sober | Banner, BrandLoader, Button, EmptyState | sí | por revisar | por revisar | 1 |
| `(admin)/pqrs/[id].tsx` | admin | sober | Banner, BrandLoader, Button, Card, ConfirmDialog, EmptyState, TextAreaField | sí | por revisar | por revisar | 4 |
| `(admin)/pqrs/index.tsx` | admin | sober | BrandLoader, Button, EmptyState, FilterChips | sí | por revisar | por revisar | 4 |
| `change-password.tsx` | shared | sober | AuthLayout, Banner, Button, TextField | no | por revisar | por revisar | 4 |
| `index.tsx` | shared | expressive | LoadingScreen | no | por revisar | por revisar | 1 |

**Resumen:** fase 1: 12 · fase 2: 4 · fase 3: 22 · fase 4: 20 · total: 58.

**Siguiente spec:** 027, entrada y portada (fase 1).
