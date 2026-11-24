# Tasks: Mi cuenta

**Input**: `specs/032-my-account/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden de forma implícita en la spec (FR-003, FR-004, FR-008, SC-003, SC-004) y por la constitución (V aplicada en el plan): las pruebas de la contraseña y de la pantalla se escriben antes de la implementación y deben fallar.

**Repositorios**: código en `tutorias_uts_mobile` (rama `032-my-account`, desde `031-student-teacher-header`); documentos en `Claude` (rama `032-my-account`, ya creada desde `031-student-teacher-header`). Backend y base de datos no se tocan.

## Formato: `[ID] [P?] [Story] Descripción`

Rutas del front relativas a `tutorias_uts_mobile/`; las de documentos, a `Claude/`.

## Phase 1: Setup

- [X] T001 En `tutorias_uts_mobile`, comprobar que la rama `032-my-account` (desde `031-student-teacher-header`, PR #21 abierto) está activa y que `npm test`, `npm run lint` y `npm run typecheck` pasan antes de cambiar nada.

---

## Phase 2: Foundational (documento, textos y guardas primero; bloquea las historias)

- [X] T002 [P] En `docs/Design.md`: (a) en "Navigation", donde dice que el avatar «opens profile and sign out», cambiar a «opens a menu with "My account" and "Sign out"»; (b) en la sección "Screens without a tab", agregar `account` y `account-password` (alcanzables desde el menú del avatar, con botón de regreso); (c) en "Visual registers", sumar «My account» a la fila **Sober with header**. Buscar en `docs/Context.md` («avatar», «perfil», «cerrar sesión») y actualizar la línea si describe el menú del avatar. Ejecutar `npx jest src/theme/__tests__/designDoc.test.ts`.
- [X] T003 [P] En `src/i18n/es.json` y `src/i18n/en.json` agregar las 14 claves de `research.md` R-5 (`profile.myAccount`, `account.title`, `account.fullName`, `account.email`, `account.role`, `account.roles.STUDENT`, `account.roles.TEACHER`, `account.roles.SUPERADMIN`, `account.notifications.title`, `account.notifications.granted`, `account.notifications.undetermined`, `account.notifications.blocked`, `account.password.title`, `account.password.success`) con los textos exactos de esa tabla y en el orden alfabético que ya siguen los archivos. Ejecutar `npx jest src/i18n`: la paridad pasa.
- [X] T004 [P] En `src/theme/__tests__/headerBudget.test.ts` agregar `src/features/account/screens/AccountScreen.tsx` a `WITH_HEADER` y `src/features/account/screens/AccountPasswordScreen.tsx` a `FORMS`; en `src/theme/__tests__/severityIndicators.test.ts` agregar `src/features/account` a `REVIEWED`. Ejecutarlas: deben fallar (los archivos aún no existen; constitución V).

**Checkpoint**: documento y textos listos, y las guardas fallan porque falta la funcionalidad.

---

## Phase 3: User Story 1 - Ver mi cuenta (Priority: P1)

**Goal**: «Mi cuenta» alcanzable desde el avatar, con los datos de la sesión, igual en los tres roles.

**Independent Test**: con cada rol, abrir «Mi cuenta» desde el avatar y comprobar nombre, correo y rol, en claro y oscuro, español e inglés.

- [X] T005 [US1] Crear `src/features/account/__tests__/AccountScreen.test.tsx` (debe fallar: la pantalla no existe; mockear `expo-router` con `router` y `useLocalSearchParams`): con `useSession.setState` de un usuario `STUDENT`, `TEACHER` y `SUPERADMIN` (con `firstName`, `lastName` y `email`), la pantalla muestra un encabezado «Mi cuenta» (`getByRole('header', { name })`), el nombre y apellido, el correo y el rol traducido (`account.roles.<ROL>`); sin nombre ni apellido muestra el correo como identificador sin campos vacíos; y la estructura es la misma en los tres roles (mismos textos de etiqueta); no aparece ninguna acción de crear, activar o desactivar cuentas (FR-006).
- [X] T006 [US1] Crear `src/features/account/screens/AccountScreen.tsx`: `SafeAreaView` con `edges={['bottom', 'left', 'right']}` y fondo `palette.screen`, un `ScrollView` con relleno y espaciado de `spacing`; primer hijo `<ScreenHeader title={t('account.title')} />`; una `Card` con tres filas (nombre y apellido o correo, con `Icon name="user"`; correo con `Icon name="email"`; rol con el ícono `student`, `teacher` o `user` según el rol y el texto `account.roles.<ROL>`), datos de `useSession((s) => s.user)`; sin edición (FR-010). Ejecutar T005: debe pasar.
- [X] T007 [US1] En `src/components/AppBar.tsx` agregar al menú del avatar un ítem «Mi cuenta» (`profile.myAccount`, ícono `user`, `accessibilityRole="menuitem"`, objetivo de 48 px) antes de «Cerrar sesión»: cierra el menú y navega con `router.push(\`${ROLE_HOME[user.role]}/account\`)` (import de `ROLE_HOME` de `@/features/auth/routing` y de `router` de `expo-router`); el estilo del ítem sigue al de «Cerrar sesión» sin el color de error.
- [X] T008 [P] [US1] Crear `src/components/__tests__/AppBar.test.tsx` (mockear `expo-router` y la sesión): al abrir el menú del avatar aparecen «Mi cuenta» y «Cerrar sesión»; tocar «Mi cuenta» navega a `/(student)/account`, `/(teacher)/account` o `/(admin)/account` según el rol y cierra el menú; «Cerrar sesión» conserva su comportamiento.
- [X] T009 [US1] Agregar las rutas: en `src/features/shell/roleTabs.config.ts` sumar `{ name: 'account', titleKey: 'account.title' }` al arreglo `hidden` de los tres roles, y crear `app/(student)/account.tsx`, `app/(teacher)/account.tsx` y `app/(admin)/account.tsx`, cada uno con `import { AccountScreen } from '@/features/account/screens/AccountScreen'; export default AccountScreen;`. Ejecutar `npx jest src/features/shell src/theme/__tests__/headerBudget.test.ts`: `hiddenScreens` cubre `account` en los tres roles y `headerBudget` pasa para `AccountScreen`.

**Checkpoint**: «Mi cuenta» se ve y se alcanza desde el avatar en los tres roles.

---

## Phase 4: User Story 2 - Cambiar mi contraseña cuando yo quiera (Priority: P1)

**Goal**: cambio de contraseña voluntario, sin cerrar la sesión; el obligatorio no cambia.

**Independent Test**: con cada rol, cambiar la contraseña con datos válidos, con clave actual incorrecta y con clave nueva inválida; el cambio obligatorio sigue bloqueando la navegación.

- [X] T010 [US2] Crear `src/features/account/__tests__/AccountPasswordScreen.test.tsx` (debe fallar: la pantalla no existe; mockear `@/api/client` y `expo-router`): con datos válidos llama a `POST /auth/change-password` con `{ currentPassword, newPassword }`, y navega con `router.replace` a la ruta `account` del rol con el parámetro `passwordChanged: '1'` sin llamar a `signOut` (la sesión sigue); con la clave actual incorrecta (el mock rechaza con `ApiError`) muestra el error con `Banner` y conserva lo escrito; con una clave nueva inválida muestra el error de campo del esquema y no llama al endpoint; hay un solo botón principal con ícono.
- [X] T011 [US2] Extraer de `src/features/auth/screens/ChangePasswordScreen.tsx` el bloque de los dos campos de contraseña (el `map` sobre `['currentPassword', 'newPassword']` con sus `Controller` y `TextField`) a `src/features/auth/components/PasswordFields.tsx` (props `control` y `errors`), y usarlo en `ChangePasswordScreen` sin cambiar su `AuthLayout`, su banner, su botón ni su cierre de sesión. Ejecutar `npx jest src/features/auth`: todas las pruebas existentes pasan sin ajustes (FR-004, SC-003).
- [X] T012 [US2] Crear `src/features/account/screens/AccountPasswordScreen.tsx`: `SafeAreaView` sobrio con `ScrollView`, `useForm` con `zodResolver(changePasswordSchema)`, `PasswordFields`, un `Banner` de error con `errorMessage(t, change.error)` y un único `Button` principal «Cambiar contraseña» (`changePassword.submit`, ícono `key`) con `loading`; al éxito de `useChangePassword`, `router.replace({ pathname: \`${ROLE_HOME[role]}/account\`, params: { passwordChanged: '1' } })`. Sin título propio: el título lo da la barra superior (`account.password.title`). Ejecutar T010: debe pasar.
- [X] T013 [US2] Agregar la ruta: en `src/features/shell/roleTabs.config.ts` sumar `{ name: 'account-password', titleKey: 'account.password.title' }` a `hidden` de los tres roles y crear `app/(student)/account-password.tsx`, `app/(teacher)/account-password.tsx` y `app/(admin)/account-password.tsx` que reexportan `AccountPasswordScreen`. Ejecutar `npx jest src/features/shell`: `hiddenScreens` cubre la nueva pantalla.
- [X] T014 [US2] En `src/features/account/screens/AccountScreen.tsx` agregar el botón principal «Cambiar contraseña» (`changePassword.submit`, ícono `key`) que navega con `router.push(\`${ROLE_HOME[role]}/account-password\`)`, y mostrar un `Banner` de éxito (`account.password.success`) cuando la ruta llega con el parámetro `passwordChanged` (`useLocalSearchParams`). Ampliar `AccountScreen.test.tsx`: el botón navega a `account-password` y, con el parámetro, aparece la confirmación y sin él no.

**Checkpoint**: el cambio voluntario funciona y el obligatorio no cambió.

---

## Phase 5: User Story 3 - Cerrar sesión desde mi cuenta (Priority: P2)

**Goal**: cerrar la sesión desde «Mi cuenta».

**Independent Test**: cerrar sesión desde la pantalla con cada rol y volver al inicio de sesión.

- [X] T015 [US3] En `src/features/account/screens/AccountScreen.tsx` agregar un `Button` «Cerrar sesión» (`profile.signOut`, `variant="destructive"`, ícono `signOut`) que llama a `useSignOut()` (el mismo hook del menú del avatar), separado del botón principal por 16 px. Ampliar `AccountScreen.test.tsx`: tocarlo llama a la acción de cerrar sesión, y hay un solo botón principal (el de cambiar contraseña).

**Checkpoint**: la pantalla ya agrupa datos, contraseña y cierre de sesión.

---

## Phase 6: User Story 4 - Saber si recibiré avisos (Priority: P2)

**Goal**: el estado de las notificaciones push y su activación desde «Mi cuenta».

**Independent Test**: «Mi cuenta» con el permiso concedido, sin decidir y bloqueado.

- [X] T016 [US4] Ampliar `src/features/account/__tests__/AccountScreen.test.tsx` (debe fallar: la fila no existe; mockear `@/features/notifications/push` con `pushPermission` y `enablePush`): con `granted` muestra «Activadas» y ningún botón de activar; con `undetermined` muestra «Sin activar» y el botón `notifications.push.enable`, y al tocarlo llama a `enablePush` y la fila pasa a «Activadas»; con `denied` y con `unavailable` muestra `account.notifications.blocked` y ningún botón.
- [X] T017 [US4] En `src/features/account/screens/AccountScreen.tsx` agregar la fila «Notificaciones» en una `Card` aparte (título `account.notifications.title` con `Icon name="notifications"`), usando `usePushPermission()` de `@/features/notifications/hooks/usePushPermission`: `granted` → texto `account.notifications.granted` con color `palette.successText`; `undetermined` → `account.notifications.undetermined` más `Button` `notifications.push.enable` (ícono `notifications`, variante `tonal`) que llama a `enable`; `denied` o `unavailable` → `account.notifications.blocked` en `palette.textSecondary`, sin botón. Ejecutar T016: debe pasar.

**Checkpoint**: «Mi cuenta» completa.

---

## Phase 7: Polish y documentos

- [X] T018 Ejecutar `npm test`, `npm run lint` y `npm run typecheck` completos en `tutorias_uts_mobile`; confirmar SC-003, SC-004 y SC-006 (el cambio obligatorio sin ajustes, guardas de las specs 026 a 031 en verde, `headerBudget` y `severityIndicators` en verde, paridad de traducciones en verde, sin acciones de administración en «Mi cuenta»).
- [X] T019 [P] En `docs/Decisions.md` agregar D-129 («Mi cuenta» como pantalla sin pestaña por rol alcanzable desde el avatar; solo consulta, sin endpoint de edición; cambio de contraseña voluntario en una pantalla propia y el obligatorio sin cambio; fila de notificaciones con el estado y la activación existentes; 14 textos nuevos), con su motivo y alternativas descartadas (R-2, R-3): hoja modal sin ruta, reutilizar `/change-password` quitando su regla, estado global de confirmación, editar el nombre y el idioma).
- [X] T020 [P] En `specs/026-design-system/screen-inventory.md` agregar una sección «Spec 032: Mi cuenta» con las dos pantallas nuevas, su registro y la nota de que la edición del nombre queda para otra spec.
- [ ] T021 [manual, usuario] Recorrido de `quickstart.md` en el teléfono con los tres roles: menú del avatar, «Mi cuenta», cambio de contraseña (válido, clave actual incorrecta, clave nueva inválida), estado de notificaciones en los tres estados del permiso (cambiándolo en los ajustes del teléfono), cerrar sesión; claro y oscuro, español e inglés; y entrar con una cuenta de clave temporal para comprobar que el cambio obligatorio sigue bloqueando la navegación (SC-001, SC-002, SC-003).
- [ ] T022 Marcar la spec como implementada (`Status` en `spec.md`) cuando T021 esté confirmado.

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational**: T002, T003 y T004 en paralelo.
- **US1 (T005–T009)**: T005 antes de T006; T007 y T008 pueden ir en paralelo con T006; T009 después de T006.
- **US2 (T010–T014)** después de T006: T010 antes de T012; T011 independiente; T013 después de T012; T014 después de T013 y T006.
- **US3 (T015)** y **US4 (T016–T017)** después de T006; T015, T016 y T017 tocan el mismo archivo que T014: van en orden (T014, T015, T017).
- **Polish (T018–T022)** al final; T019 y T020 pueden empezar tras US2.

## Parallel Opportunities

- Foundational: T002, T003 y T004 en paralelo (archivos distintos).
- US1: T007 y T008 en paralelo con T006.
- US2: T011 en paralelo con T010.
- Polish: T019 y T020 en paralelo.

## Implementation Strategy

- **MVP**: Foundational + US1 + US2 (T001–T014): ver la cuenta y cambiar la contraseña cuando se quiera, que es lo más útil y lo que el backend ya soporta.
- **Incremento 2**: US3 (cerrar sesión desde la pantalla) y US4 (notificaciones).
- **Cierre**: documentos, inventario y recorrido manual con los tres roles.
