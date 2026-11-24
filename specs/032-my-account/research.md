# Research: Mi cuenta

Sin `NEEDS CLARIFICATION` abiertos. Medido en el código el 2026-11-24 (`tutorias_uts_mobile` y `tutorias_uts_back`, rama de la spec 031).

## R-1. Qué hay hoy (medido)

| Pieza | Hallazgo |
|---|---|
| Menú del avatar (`AppBar`) | Un `Modal` con un solo ítem, «Cerrar sesión» (`profile.signOut`). Las iniciales salen de `firstName`, `lastName` o el correo |
| Sesión (`useSession`) | `UserSummary`: `id`, `email`, `role`, `mustChangePassword`, `locale`, `firstName?`, `lastName?` |
| Backend | `POST /auth/change-password` y `GET /auth/me` ya permiten cambiar la clave en cualquier momento (`@AllowPasswordChange`); no hay endpoint para editar datos |
| Cambio de clave | `ChangePasswordScreen` (sobre `AuthLayout`) está en la ruta raíz `/change-password`, que `RouteGate` solo deja abierta si `mustChangePassword` es verdadero: con la clave ya cambiada, esa ruta redirige a la pantalla de inicio del rol, así que **no sirve para el cambio voluntario** |
| `useChangePassword` | Llama al endpoint y al terminar pone `mustChangePassword: false` en la sesión; para el cambio voluntario ese efecto no hace daño (ya era falso) |
| Notificaciones push | `usePushPermission()` devuelve `{ state, enable }` con `state` en `granted`, `undetermined`, `denied` o `unavailable`, y vuelve a leerse al volver a la app; `enable()` ya registra el dispositivo, igual que la bandeja |
| Pantallas sin pestaña | `ROLE_TABS[role].hidden` declara las pantallas sin pestaña (bandeja, cambios) y `app/(rol)/<nombre>.tsx` las monta; `hiddenScreens.test.tsx` las recorre desde esa configuración (D-121) |

## R-2. Dónde vive «Mi cuenta» (FR-001, FR-006)

- **Decisión**: dos pantallas sin pestaña por rol, `account` y `account-password`, declaradas en `ROLE_TABS[...].hidden` y montadas con un archivo por rol en `app/(student)`, `app/(teacher)` y `app/(admin)` que reexporta la misma pantalla. Así la barra de pestañas conserva su forma, hay botón de regreso y las cubre `hiddenScreens.test.tsx` sin editarlo.
- **Razón**: es el patrón de la bandeja de avisos (D-121). El nombre `account-password` evita chocar con la ruta raíz `/change-password`, porque los grupos entre paréntesis no añaden segmento a la URL.
- **Alternativas**: una carpeta `account/` con su propia pila (más archivos para dos pantallas); abrir `account` como una hoja modal desde el avatar (sin ruta, sin pruebas de ruta, sin regreso estándar); reutilizar `/change-password` quitándole la regla de la clave temporal (descartada: SC-003 prohíbe cambiar el comportamiento del cambio obligatorio).

## R-3. Cambio de contraseña voluntario (FR-003, FR-004)

- **Decisión**: una pantalla nueva `AccountPasswordScreen` (sobria, con los mismos dos campos y el mismo esquema `changePasswordSchema`) que usa `useChangePassword`. Para no duplicar los dos campos se extrae de `ChangePasswordScreen` un componente pequeño `PasswordFields`; el formulario obligatorio sigue con su `AuthLayout`, su banner, su botón y su cierre de sesión, sin cambio de comportamiento.
- **Al terminar**: `router.replace` a `account` con el parámetro `passwordChanged=1`; `AccountScreen` muestra un `Banner` de éxito cuando llega ese parámetro. Sin estado global nuevo.
- **Alternativas**: duplicar los campos en la pantalla nueva (descartada: dos copias de las reglas de campo); un estado global de «confirmación pendiente» (descartada: un parámetro de ruta basta); cerrar la sesión al cambiar la clave (descartada: FR-004 prohíbe cerrarla).

## R-4. Contenido de «Mi cuenta» (FR-002, FR-005, FR-010, FR-011)

| Bloque | Contenido | Reutiliza |
|---|---|---|
| Cabecera | `ScreenHeader` con el título «Mi cuenta», sin número | spec 029 |
| Datos | Tarjeta con nombre y apellido (o el correo si faltan), correo y rol en texto con ícono; sin edición | `Card`, `Icon`; roles con ícono del registro |
| Notificaciones | Fila con el estado: `granted` activadas; `undetermined` sin activar, con el botón de activar existente; `denied` o `unavailable` con la explicación de que se activan desde los ajustes del teléfono, sin botón | `usePushPermission`, `notifications.push.enable` |
| Acciones | «Cambiar contraseña» (principal, con ícono) y «Cerrar sesión» (variante destructiva, con ícono) | `Button`, `useSignOut` |

Registro: **sobrio con cabecera** (un solo bloque de color, ningún patrón). Un solo botón principal por área: cambiar la contraseña; cerrar sesión es una acción de severidad aparte.

## R-5. Textos nuevos (FR-009)

Esta spec es la excepción a «sin textos nuevos». Claves nuevas en `es.json` y `en.json` (la prueba de paridad de traducciones ya existe):

| Clave | Español | Inglés |
|---|---|---|
| `profile.myAccount` | Mi cuenta | My account |
| `account.title` | Mi cuenta | My account |
| `account.fullName` | Nombre | Name |
| `account.email` | Correo institucional | Institutional email |
| `account.role` | Rol | Role |
| `account.roles.STUDENT` / `TEACHER` / `SUPERADMIN` | Estudiante / Docente / CAE | Student / Teacher / CAE |
| `account.notifications.title` | Notificaciones | Notifications |
| `account.notifications.granted` | Activadas | On |
| `account.notifications.undetermined` | Sin activar | Off |
| `account.notifications.blocked` | Desactivadas en el teléfono. Actívalas desde los ajustes del teléfono | Off in the phone. Turn them on from the phone settings |
| `account.password.title` | Cambiar contraseña | Change password |
| `account.password.success` | Tu contraseña se cambió | Your password was changed |

Se reutilizan `changePassword.current`, `changePassword.new`, `changePassword.submit`, `notifications.push.enable`, `profile.signOut` y los errores del backend.

## R-6. Guardas (FR-008)

- `headerBudget.test.ts` suma `AccountScreen` a las pantallas con cabecera y `AccountPasswordScreen` a las sobrias sin cabecera.
- `severityIndicators.test.ts` suma `src/features/account` (la pantalla usa roles de texto de severidad).
- La prueba de paridad de traducciones y `noLooseColors` ya cubren textos y valores sueltos.

## R-7. Documentos

- `Design.md`: «Navigation» dice que el avatar abre «profile and sign out»; pasa a decir que abre «My account» y «Sign out», y las pantallas `account` y `account-password` se agregan a «Screens without a tab»; `account` al registro «sobrio con cabecera». D-129.
- `Context.md`: si lista el menú del avatar, se actualiza en el mismo cambio.

## R-8. Verificación manual

- **Decisión**: recorrido final con los tres roles: menú del avatar, «Mi cuenta», cambio de contraseña con datos válidos, con clave incorrecta y con clave nueva inválida, estado de notificaciones en los tres estados del permiso (cambiando el permiso en los ajustes del teléfono), cerrar sesión; en claro y oscuro, español e inglés.

## R-9. Orden de ramas

- **Decisión**: la rama de `tutorias_uts_mobile` se crea desde `031-student-teacher-header` (PR #21 abierto); la de `Claude`, ya creada desde `031-student-teacher-header` (PR #24 abierto). Cada PR apunta a la rama anterior hasta que se fusione la base.
