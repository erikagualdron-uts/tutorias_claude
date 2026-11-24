# Data Model: Mi cuenta

Sin cambios de base de datos ni de backend. Se muestran datos que la sesión ya tiene y se usa el endpoint de contraseña que ya existe.

## Entidades que se muestran o usan (sin cambio)

| Entidad | Campos usados | Origen |
|---|---|---|
| Cuenta de la sesión (`UserSummary`) | `firstName?`, `lastName?`, `email`, `role` | `useSession().user`, ya cargada al iniciar sesión |
| Permiso de notificaciones | `granted` / `undetermined` / `denied` / `unavailable` | `usePushPermission()` |
| Cambio de contraseña | `currentPassword`, `newPassword` | `changePasswordSchema`, `POST /auth/change-password` (204) |

## Pantallas y rutas nuevas

| Elemento | Detalle |
|---|---|
| `AccountScreen` (`src/features/account/screens/`) | Mi cuenta: cabecera, datos, notificaciones, acciones |
| `AccountPasswordScreen` (`src/features/account/screens/`) | Cambio de contraseña voluntario, sobrio |
| `PasswordFields` (`src/features/auth/components/`) | Los dos campos de contraseña, extraídos de `ChangePasswordScreen` y usados por las dos pantallas |
| Rutas | `app/(student)/account.tsx`, `app/(teacher)/account.tsx`, `app/(admin)/account.tsx` y las tres `account-password.tsx`, cada una reexporta la pantalla |
| `ROLE_TABS[rol].hidden` | Se suman `{ name: 'account', titleKey: 'account.title' }` y `{ name: 'account-password', titleKey: 'account.password.title' }` en los tres roles |
| `AppBar` | El menú del avatar suma «Mi cuenta» (`profile.myAccount`) antes de «Cerrar sesión», que lleva a `${ROLE_HOME[role]}/account` |

## Estados de la fila de notificaciones

| `state` | Texto | Ícono | Acción |
|---|---|---|---|
| `granted` | `account.notifications.granted` | activadas | ninguna |
| `undetermined` | `account.notifications.undetermined` | sin activar | botón existente `notifications.push.enable` con ícono |
| `denied` o `unavailable` | `account.notifications.blocked` | sin activar | ninguna (se activan en los ajustes del teléfono) |

El texto y el ícono llevan el estado; el color no es el único vehículo (roles `successText` para activadas, `textSecondary` para el resto).

## Reglas de validación

- Las reglas de la contraseña nueva son las de `changePasswordSchema` y las del backend; la pantalla nueva no define reglas propias.
- `headerBudget.test.ts`: `AccountScreen` con un solo `ScreenHeader` y sin patrón; `AccountPasswordScreen` sin cabecera ni patrón.
- `severityIndicators.test.ts` incluye `src/features/account`.
- Paridad de traducciones: las 14 claves nuevas existen en español e inglés.
- Paridad de colores: sin cambios (40 roles).
- Comportamiento del cambio de contraseña obligatorio: sus pruebas existentes pasan sin ajustes.
