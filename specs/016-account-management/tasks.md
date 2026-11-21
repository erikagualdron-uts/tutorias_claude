---

description: "Task list for Gestión de cuentas de docentes y estudiantes"
---

# Tasks: Gestión de cuentas de docentes y estudiantes

**Input**: Design documents from `/specs/016-account-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/accounts-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principios II y V) exige pruebas de la cancelación de inscripciones y del cupo, y `docs/Conventions.md` §6 exige pruebas de roles (`403`), contrato y reglas. Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1, US2 y US3 son P1 y van primero; US4 y US5 son P2. Cambia `tutorias_uts_db` (una migración sin tablas), `tutorias_uts_back` y `tutorias_uts_mobile`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 ver y buscar, US2 desactivar y reactivar, US3 eliminar, US4 editar un docente, US5 regenerar la clave temporal
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_db/` = esquema Prisma, migraciones y seed
- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas junto al código en `__tests__/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`
- Roles: `@Roles('SUPERADMIN')` en cada endpoint nuevo
- Nunca se registran claves temporales, correos ni nombres en los registros
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí ni con la API de desarrollo en marcha (base de datos y cola de Redis compartidas)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF
- Orden de bloqueo de una baja de estudiante (D-092): periodo activo `FOR SHARE`, fila del estudiante `FOR UPDATE`, módulos ordenados por `id` `FOR UPDATE`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ramas, migración y piezas de prueba que todas las historias usan

- [ ] T001 Crear la rama `016-account-management` desde `main` en `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db`, comprobando antes que los PR de la spec 015 están unidos (si no, partir de la rama `015-email-templates`)
- [ ] T002 Crear la migración `tutorias_uts_db/prisma/migrations/<ts>_enable_unaccent/migration.sql` con `CREATE EXTENSION IF NOT EXISTS unaccent;` (sin cambios en `schema.prisma`) y aplicarla con `npx prisma migrate dev` en la base de desarrollo y con `npx prisma migrate deploy` en la base de pruebas (`TEST_DATABASE_URL`)
- [ ] T003 [P] Añadir a `tutorias_uts_back/test/utils/factories.ts` un `createAdminSession(ctx)` que cree un `SUPERADMIN` (como `createUser(ctx.prisma, { role: 'SUPERADMIN' })` en `test/rooms.e2e-spec.ts`) y devuelva su token; un estudiante sin verificar ya se crea con `createStudent(ctx.prisma, { verified: false })`, que `createUser` admite
- [ ] T004 [P] Añadir a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` las claves `errors.ACCOUNT_NOT_FOUND` y `errors.ACCOUNT_NOT_ACTIVE`, en orden alfabético y con paridad (skill `i18n-strings`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: La lógica compartida por docentes y estudiantes: cambiar el estado de una cuenta y buscar sin tildes

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [ ] T005 [P] Escribir `tutorias_uts_back/src/accounts/account-status.spec.ts`: desactivar pone `INACTIVE`, reactivar pone `ACTIVE`, eliminar pone `deletedAt` y prevalece sobre todo; repetir una acción no cambia nada ni falla; reactivar una cuenta eliminada responde `404 ACCOUNT_NOT_FOUND`; un `SUPERADMIN` o un id desconocido responde `404 ACCOUNT_NOT_FOUND`; cada baja llama a `revokeAllForUser`
- [ ] T006 [P] Escribir `tutorias_uts_back/src/accounts/account-search.spec.ts`: el patrón se escapa (`%`, `_` y `\` son literales), un término vacío o de solo espacios no filtra, y la condición cubre nombre, apellido y correo
- [ ] T007 Crear `tutorias_uts_back/src/accounts/account-status.ts` con `AccountStatusService` (Prisma, `Clock`, `SessionService`): `apply(tx, userId, roles, action)` que cambia `status` o `deletedAt`, valida que el usuario sea un `TEACHER` o `STUDENT` sin borrar (`404 ACCOUNT_NOT_FOUND` si no) y es idempotente; `closeSessions(userId)` que llama a `SessionService.revokeAllForUser`; y `tutorias_uts_back/src/accounts/accounts.module.ts` con `AccountsModule`, que importa el módulo que exporta `SessionService` y exporta el servicio; hace pasar T005
- [ ] T008 Crear `tutorias_uts_back/src/accounts/account-search.ts` con `searchCondition(term)` que devuelve un `Prisma.Sql` con `unaccent(lower(campo)) LIKE '%' || unaccent(lower($1)) || '%'` sobre nombre, apellido y correo, escapando `%`, `_` y `\`; hace pasar T006
- [ ] T009 [P] Crear `tutorias_uts_back/src/accounts/list-accounts.dto.ts` con `ListAccountsQuery`, que extiende `PageQuery` (`tutorias_uts_back/src/common/page-query.ts`, que ya trae `page` y `limit`) y suma `search` (texto de hasta 100 caracteres, con `@Trim()`) y `status` (`ACTIVE` o `INACTIVE`), tomados de `ListTeachersQuery`; hacer que `tutorias_uts_back/src/teachers/dto/list-teachers.dto.ts` y el nuevo `tutorias_uts_back/src/students/dto/list-students.dto.ts` la reutilicen, sin redeclarar la paginación
- [ ] T010 Registrar `AccountsModule` en `tutorias_uts_back/src/app.module.ts` y en `tutorias_uts_back/src/teachers/teachers.module.ts`

**Checkpoint**: El cambio de estado y la búsqueda existen y están probados; las historias los usan

---

## Phase 3: User Story 1 - Ver y buscar a los docentes y estudiantes (Priority: P1) 🎯 MVP

**Goal**: El CAE ve las listas de docentes y de estudiantes con estado y conteos, y las busca y filtra.

**Independent Test**: Con docentes y estudiantes de ejemplo, abrir cada lista, buscar por nombre y por correo con y sin tildes, filtrar por estado y comprobar que los conteos coinciden.

### Tests for User Story 1 ⚠️

> **NOTE: Escribirlas PRIMERO y comprobar que FALLAN antes de implementar**

- [ ] T011 [P] [US1] Escribir en `tutorias_uts_back/test/teachers-manage.e2e-spec.ts` la parte de lista: `GET /teachers` devuelve `email` y `modulesCount` (solo módulos sin borrar del periodo activo), excluye eliminados, ordena por apellido y nombre, busca `jose` y `josé` por igual y por correo parcial, filtra por `status`, y respeta `page`, `limit` y `meta.total`; `GET /teachers/:id` devuelve el detalle con `phone` y `modulesCount`; los campos que ya devolvía la lista (`id`, `firstName`, `lastName` y `status`) se mantienen, porque el selector de docente del formulario de módulo la llama con `limit=100&status=ACTIVE`
- [ ] T012 [P] [US1] Escribir en `tutorias_uts_back/test/students-manage.e2e-spec.ts` la parte de lista: `GET /students` muestra solo estudiantes con correo verificado y sin eliminar, con `enrolledCount` (inscripciones `ACTIVE` del periodo activo; las de un periodo Cerrado no cuentan), orden, búsqueda con y sin tildes y mayúsculas, filtro de estado y paginación (con 500 cuentas sembradas la búsqueda devuelve las correctas y `meta.total` es 500); `GET /students/:id` devuelve el detalle y `404 ACCOUNT_NOT_FOUND` para un estudiante sin verificar
- [ ] T013 [P] [US1] Escribir `tutorias_uts_back/test/accounts-roles.e2e-spec.ts`: una tabla con todas las rutas de `contracts/accounts-api.yaml` comprueba `401` sin sesión y `403` con sesión de docente o de estudiante, y que un `SUPERADMIN` recibe `404 ACCOUNT_NOT_FOUND` al apuntar a su propio id o al de otro administrativo
- [ ] T014 [P] [US1] Escribir pruebas de pantalla con React Native Testing Library en `tutorias_uts_mobile/src/features/accounts/__tests__/AccountsScreens.test.tsx`: `TeachersScreen` y `StudentsScreen` muestran los cuatro estados (cargando, vacío con su explicación, error con "Reintentar" y con datos), la búsqueda y el filtro de estado llaman al servidor con los parámetros, se cargan más páginas al llegar al final, cada tarjeta muestra nombre, correo, estado con texto y su conteo, y las claves de textos existen en es y en

### Implementation for User Story 1

- [ ] T015 [US1] Reescribir `list` en `tutorias_uts_back/src/teachers/teachers.service.ts` con una consulta SQL que use `searchCondition`, devuelva `email` y `modulesCount` y la paginación `{ data, meta: { page, limit, total } }`, y añadir `detail(id)` con `phone` y `modulesCount`; añadir `GET :id` a `tutorias_uts_back/src/teachers/teachers.controller.ts` con `@Roles('SUPERADMIN')`; la respuesta conserva los campos anteriores y se corren las pruebas de módulos de la spec 010 y las del formulario de módulo en la app; hace pasar la parte de lista de T011
- [ ] T016 [P] [US1] Crear el módulo `tutorias_uts_back/src/students/` con `students.module.ts`, `students.controller.ts` (`GET /students` y `GET /students/:id`, `@Roles('SUPERADMIN')`) y `students.service.ts` (`list` y `detail` con `searchCondition`, solo correo verificado y sin borrar, `enrolledCount`), y registrarlo en `tutorias_uts_back/src/app.module.ts`; hace pasar T012 y T013
- [ ] T017 [P] [US1] Crear `tutorias_uts_mobile/src/features/accounts/hooks/useTeacherAccounts.ts` y `useStudentAccounts.ts` (no `useTeachers`, que ya existe en `features/modules/hooks/` para el selector de docente) con `useInfiniteQuery` (claves `['teacher-accounts', { search, status }]` y `['student-accounts', { search, status }]`), parámetros de búsqueda y estado, y tipos en `tutorias_uts_mobile/src/api/types.ts` (ampliando `Teacher` con correo y conteo en lugar de crear otro)
- [ ] T018 [P] [US1] Añadir a `tutorias_uts_mobile/src/icons/registry.ts` los íconos de docente, estudiante, búsqueda y filtro del set `solar`, y las claves de la sección de cuentas (títulos, estados "Activa" y "Desactivada", "N módulos", "N inscripciones", vacíos y errores) a `tutorias_uts_mobile/src/i18n/es.json` y `en.json`
- [ ] T019 [US1] Crear `tutorias_uts_mobile/src/features/accounts/components/AccountCard.tsx` (nombre, correo, insignia de estado con texto y ícono, conteo; el toque abre la hoja de acciones; 48 px) y las pantallas `tutorias_uts_mobile/src/features/accounts/screens/TeachersScreen.tsx` y `StudentsScreen.tsx` con `SearchField`, `FilterChips` (Todas, Activas, Desactivadas), `BrandLoader`, `EmptyState`, error con "Reintentar" y carga de más páginas
- [ ] T020 [US1] Crear las rutas `tutorias_uts_mobile/app/(admin)/more/teachers.tsx` y `students.tsx` que montan esas pantallas y añadir las filas "Docentes" y "Estudiantes" a `tutorias_uts_mobile/src/features/shell/screens/MoreScreen.tsx`; hace pasar T014
- [ ] T021 [US1] Ejecutar `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back`, y `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`, y corregir lo que falle

**Checkpoint**: El CAE ve y busca docentes y estudiantes; US1 se prueba sola

---

## Phase 4: User Story 2 - Desactivar y reactivar una cuenta (Priority: P1)

**Goal**: El CAE desactiva y reactiva cuentas viendo antes el efecto; la cuenta desactivada pierde el acceso al instante y conserva su historial; un estudiante pierde sus inscripciones vigentes de forma atómica.

**Independent Test**: Desactivar una cuenta con una sesión abierta, comprobar que no puede seguir usando la app ni iniciar sesión, reactivarla y comprobar que vuelve a entrar con su historial.

### Tests for User Story 2 ⚠️

- [ ] T022 [P] [US2] Añadir a `tutorias_uts_back/test/teachers-manage.e2e-spec.ts`: `POST /teachers/:id/deactivate` responde `{ status: 'INACTIVE', unavailableModules }` con el número de módulos del periodo activo; el token de acceso del docente ya emitido recibe `401 ACCOUNT_DISABLED` en la petición siguiente, no puede iniciar sesión ni pedir recuperar la clave; sus módulos siguen existiendo marcados "docente no disponible" (D-088) y sus sesiones pasadas no cambian; desactivar dos veces responde igual; `reactivate` devuelve el acceso con el historial intacto
- [ ] T023 [P] [US2] Añadir a `tutorias_uts_back/test/students-manage.e2e-spec.ts`: `POST /students/:id/deactivate` cancela sus inscripciones `ACTIVE` del periodo activo (`status = CANCELLED`, `cancelledAt` y `effectiveUntil` iguales a la hora de la baja) y responde `{ cancelledEnrollments }`; el cupo libre de cada módulo sube en uno; las sesiones ya dadas conservan al estudiante; las inscripciones de un periodo Cerrado no se tocan; sin periodo activo (entre semestres) la baja cambia el estado y responde `cancelledEnrollments: 0`; al reactivar las inscripciones siguen `CANCELLED`; si la transacción falla a la mitad (error provocado al cancelar la segunda), no queda ninguna cancelada ni cambia el estado
- [ ] T024 [P] [US2] Escribir `tutorias_uts_back/test/students-concurrency.e2e-spec.ts`: inscribirse a un módulo y desactivar al mismo estudiante a la vez, repetido 20 veces, nunca deja una inscripción `ACTIVE` de un estudiante `INACTIVE` y no produce interbloqueo; dos desactivaciones simultáneas del mismo estudiante dejan un único resultado coherente (el caso de dos acciones sobre un docente lo cubre T005)
- [ ] T025 [P] [US2] Escribir `tutorias_uts_back/test/accounts-delivery.e2e-spec.ts`: una entrega de correo `PENDING` de un aviso creado antes de la baja, procesada después de desactivar o eliminar la cuenta, queda `SKIPPED` con `lastError = 'ACCOUNT_UNAVAILABLE'`, no sale ningún correo y no se reintenta; la de una cuenta reactivada antes de entregarse sí sale; el push no se envía a una cuenta desactivada
- [ ] T026 [P] [US2] Escribir en `tutorias_uts_mobile/src/features/accounts/__tests__/AccountSheet.test.tsx`: la hoja de acciones abre con el detalle recién pedido, muestra "N módulos quedarán con docente no disponible" o "N inscripciones se cancelarán y se liberarán N cupos" antes de confirmar, la confirmación llama a la acción y refresca la lista con el estado nuevo, "Reactivar" reemplaza a "Desactivar" en una cuenta desactivada, y un error del servidor se muestra traducido

### Implementation for User Story 2

- [ ] T027 [US2] Añadir `deactivate(id)` y `reactivate(id)` a `tutorias_uts_back/src/teachers/teachers.service.ts` y las rutas `POST /teachers/:id/deactivate` y `POST /teachers/:id/reactivate` a `teachers.controller.ts` (`@Roles('SUPERADMIN')`), usando `AccountStatusService` y devolviendo `unavailableModules`; hace pasar T022
- [ ] T028 [US2] Añadir `deactivate(id)` y `reactivate(id)` a `tutorias_uts_back/src/students/students.service.ts` y las rutas a `students.controller.ts`: la baja corre en una transacción con el orden de bloqueo de D-092 (periodo activo `FOR SHARE`, fila del estudiante `FOR UPDATE`, módulos ordenados por `id` `FOR UPDATE`), busca el periodo activo y cancela las inscripciones `ACTIVE` de sus módulos (si no hay periodo activo no cancela ninguna y responde `cancelledEnrollments: 0`) con `cancelledAt` y `effectiveUntil` iguales a la hora actual (`Clock`), cambia el estado y cierra las sesiones al confirmar; hace pasar T023 y T024
- [ ] T029 [US2] Hacer que `tutorias_uts_back/src/notifications/deliveries.service.ts` compruebe, al entregar push y correo, que la cuenta del destinatario siga `ACTIVE` y sin `deletedAt`; si no, cerrar la entrega como `SKIPPED` con `ACCOUNT_UNAVAILABLE` sin reintentar; hace pasar T025
- [ ] T030 [P] [US2] Crear `tutorias_uts_mobile/src/features/accounts/hooks/useAccountActions.ts` con las mutaciones `deactivate` y `reactivate` para docentes y estudiantes (TanStack Query, invalidan las listas) y el detalle de cada cuenta recién pedido al abrir la hoja
- [ ] T031 [US2] Crear `tutorias_uts_mobile/src/features/accounts/components/AccountSheet.tsx` (hoja inferior con el detalle y las acciones, cada botón con ícono a la izquierda y 16 px entre ellos) y `BajaDialog.tsx` (`ConfirmDialog` con el efecto en números y el botón de confirmar), conectarlas a `TeachersScreen` y `StudentsScreen`, y añadir sus textos (es y en) y íconos; hace pasar T026
- [ ] T032 [US2] Ejecutar `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back`, y `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`, y corregir lo que falle

**Checkpoint**: Desactivar y reactivar funcionan para los dos roles, con el efecto visible y atómico

---

## Phase 5: User Story 3 - Eliminar una cuenta (borrado lógico) (Priority: P1)

**Goal**: El CAE elimina una cuenta (borrado lógico) viendo antes el efecto; deja de aparecer y de poder entrar, se conserva su historial y su correo sigue reservado.

**Independent Test**: Eliminar una cuenta con historial; comprobar que no sale en listas ni selectores, que su correo no se reutiliza y que sus módulos e inscripciones pasadas siguen consultables.

### Tests for User Story 3 ⚠️

- [ ] T033 [P] [US3] Añadir a `tutorias_uts_back/test/teachers-manage.e2e-spec.ts`: `DELETE /teachers/:id` responde `{ deleted: true, unavailableModules }`, el docente deja de aparecer en `GET /teachers`, `deactivate`, `reactivate`, `PATCH` y la clave responden `404 ACCOUNT_NOT_FOUND`, no puede iniciar sesión ni usar su token, crear otro docente con su correo responde `409 EMAIL_ALREADY_REGISTERED`, sus módulos siguen con el docente marcado "no disponible" y no aparece en los selectores de docente de un módulo; eliminar a uno ya desactivado funciona
- [ ] T034 [P] [US3] Añadir a `tutorias_uts_back/test/students-manage.e2e-spec.ts`: `DELETE /students/:id` cancela sus inscripciones vigentes igual que desactivar, responde `{ deleted: true, cancelledEnrollments }`, desaparece de la lista, no entra, y registrarse con su correo responde que ya está registrado; sus inscripciones pasadas y avisos se conservan en la base de datos
- [ ] T035 [P] [US3] Añadir a `tutorias_uts_mobile/src/features/accounts/__tests__/AccountSheet.test.tsx`: "Eliminar" abre una confirmación con el efecto en números y la advertencia de que no se puede deshacer desde la app, y tras confirmar la cuenta sale de la lista

### Implementation for User Story 3

- [ ] T036 [US3] Añadir `remove(id)` a `tutorias_uts_back/src/teachers/teachers.service.ts` y `DELETE /teachers/:id` a `teachers.controller.ts` usando `AccountStatusService`; hace pasar T033
- [ ] T037 [US3] Añadir `remove(id)` a `tutorias_uts_back/src/students/students.service.ts` y `DELETE /students/:id` a `students.controller.ts`, reutilizando la transacción de T028; hace pasar T034
- [ ] T038 [US3] Añadir la acción "Eliminar" (con la mutación en `useAccountActions.ts`, la entrada en `AccountSheet.tsx`, el texto de advertencia en `BajaDialog.tsx` y sus claves es y en) en `tutorias_uts_mobile/src/features/accounts/`; hace pasar T035
- [ ] T039 [US3] Ejecutar `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back`, y `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`, y corregir lo que falle

**Checkpoint**: Las tres historias P1 funcionan de punta a punta

---

## Phase 6: User Story 4 - Actualizar los datos de un docente (Priority: P2)

**Goal**: El CAE corrige el nombre, el apellido y el teléfono de un docente; el correo no se puede cambiar.

**Independent Test**: Editar cada campo y comprobar que el cambio se ve en el perfil, en sus módulos y en las listas.

### Tests for User Story 4 ⚠️

- [ ] T040 [P] [US4] Añadir a `tutorias_uts_back/test/teachers-manage.e2e-spec.ts`: `PATCH /teachers/:id` guarda `firstName`, `lastName` y `phone`, devuelve el detalle, el cambio se ve en `GET /teachers`, en el detalle del módulo del docente y en los avisos nuevos; `firstName` o `lastName` vacíos o de solo espacios responden `422` con el campo en `details`; más de 80 caracteres en nombre o apellido y más de 30 en el teléfono responden `422`; `phone: null` borra el teléfono; un campo `email` en el cuerpo responde `422` y el correo no cambia; un docente eliminado o inexistente responde `404 ACCOUNT_NOT_FOUND`
- [ ] T041 [P] [US4] Escribir `tutorias_uts_mobile/src/features/accounts/__tests__/TeacherEditScreen.test.tsx`: el formulario carga los datos del docente, marca el campo vacío y no guarda, guarda y vuelve a la lista con el cambio, el correo se muestra deshabilitado con la razón debajo, y los errores `422` del servidor se muestran junto a su campo

### Implementation for User Story 4

- [ ] T042 [US4] Crear `tutorias_uts_back/src/teachers/dto/update-teacher.dto.ts` con `firstName` y `lastName` (texto sin espacios sobrantes, mínimo 1 y máximo 80 caracteres, obligatorios) y `phone` (texto de hasta 30 caracteres o `null`, opcional), rechazando campos desconocidos como `email`; añadir `update(id, dto)` a `teachers.service.ts` y `PATCH /teachers/:id` a `teachers.controller.ts` (`@Roles('SUPERADMIN')`); hace pasar T040
- [ ] T043 [US4] Crear `tutorias_uts_mobile/src/features/accounts/screens/TeacherEditScreen.tsx` con campos de relleno y borde tenue (nombre, apellido, teléfono y el correo deshabilitado con su razón), el esquema en `tutorias_uts_mobile/src/features/accounts/schemas.ts`, la mutación en `useAccountActions.ts`, la ruta `tutorias_uts_mobile/app/(admin)/more/teacher-edit.tsx`, la acción "Editar" en `AccountSheet.tsx` y sus textos es y en; hace pasar T041
- [ ] T044 [US4] Ejecutar `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back`, y `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`, y corregir lo que falle

**Checkpoint**: La edición de docentes funciona sola

---

## Phase 7: User Story 5 - Regenerar la clave temporal de un docente (Priority: P2)

**Goal**: El CAE genera una clave temporal nueva para un docente activo; se muestra una sola vez, cierra sus sesiones y debe cambiarse al entrar.

**Independent Test**: Regenerar la clave de un docente con sesión abierta; comprobar que la anterior ya no sirve, que la nueva se ve una sola vez y que el docente debe cambiarla.

### Tests for User Story 5 ⚠️

- [ ] T045 [P] [US5] Añadir a `tutorias_uts_back/test/teachers-manage.e2e-spec.ts`: `POST /teachers/:id/temporary-password` devuelve `{ temporaryPassword }` y no lo guarda (solo su hash), la clave anterior ya no inicia sesión y la nueva sí con `mustChangePassword = true` (la app lo obliga a cambiarla), las sesiones abiertas del docente se cierran, una cuenta desactivada responde `409 ACCOUNT_NOT_ACTIVE`, una eliminada responde `404`, la clave no aparece en `GET /teachers/:id` ni en ninguna línea de `ctx.logs`, y un estudiante como destino responde `404 ACCOUNT_NOT_FOUND`
- [ ] T046 [P] [US5] Añadir a `tutorias_uts_mobile/src/features/accounts/__tests__/AccountSheet.test.tsx`: "Regenerar clave" abre `TemporaryPasswordDialog` con la clave una sola vez y la advertencia; al cerrar no se puede volver a ver; en una cuenta desactivada el botón está deshabilitado con la razón debajo; la opción no existe en la hoja de un estudiante

### Implementation for User Story 5

- [ ] T047 [US5] Añadir `regeneratePassword(id)` a `tutorias_uts_back/src/teachers/teachers.service.ts` (genera con `TemporaryPasswordService`, guarda solo el hash, pone `mustChangePassword = true`, cierra las sesiones y devuelve la clave una vez) y `POST /teachers/:id/temporary-password` a `teachers.controller.ts` (`@Roles('SUPERADMIN')`); `409 ACCOUNT_NOT_ACTIVE` si la cuenta no está activa; hace pasar T045
- [ ] T048 [US5] Añadir la acción "Regenerar clave" para docentes (la mutación en `useAccountActions.ts`, el botón en `AccountSheet.tsx` deshabilitado con su razón en una cuenta desactivada, el uso de `tutorias_uts_mobile/src/components/TemporaryPasswordDialog.tsx` y sus textos es y en); hace pasar T046
- [ ] T049 [US5] Ejecutar `npm run lint`, `npm run test` y `npm run test:e2e` en `tutorias_uts_back`, y `npm run lint`, `npm run typecheck` y `npm test` en `tutorias_uts_mobile`, y corregir lo que falle

**Checkpoint**: Las cinco historias funcionan

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Contrato, documentación, decisiones y cierre

- [ ] T050 Escribir `tutorias_uts_back/test/accounts-contract.e2e-spec.ts` que valide las respuestas de los 12 endpoints contra `specs/016-account-management/contracts/accounts-api.yaml` con el helper de `tutorias_uts_back/test/utils/contract.ts`
- [ ] T051 [P] Actualizar `Claude/docs/Context.md` (sección 4.1, puntos 4 y 5, y las reglas de cuentas: lo que hace desactivar y eliminar, las inscripciones canceladas, la clave regenerada y el correo que no cambia)
- [ ] T052 [P] Actualizar `Claude/docs/Architecture.md` con los endpoints de cuentas, el orden de bloqueo de la baja de un estudiante y la extensión `unaccent`
- [ ] T053 [P] Actualizar `Claude/docs/Design.md` con las pantallas de docentes y estudiantes, la hoja de acciones y la confirmación con el efecto en números
- [ ] T054 Registrar en `Claude/docs/Decisions.md` D-108 (gestión de cuentas: rutas `/teachers` y `/students`, efecto visible antes de confirmar, `unaccent`) y D-109 (la baja de un estudiante cancela sus inscripciones con `effectiveUntil` igual a la hora de la baja y no se restauran; una entrega pendiente de una cuenta dada de baja se omite)
- [ ] T055 [P] Comprobar en `tutorias_uts_back` que ningún `console.log` ni registro escribe una clave temporal, un correo o un nombre, y que `grep` de `Unidades Tecnológicas` no encuentra nada en el código ni en las traducciones
- [ ] T056 Recorrer los 14 escenarios de `specs/016-account-management/quickstart.md` en español e inglés con la app y la API en marcha y anotar el resultado en ese archivo, incluido el tiempo de encontrar una cuenta entre 500 (SC-001, menos de 10 s) y el de regenerar una clave (SC-006, menos de 2 min)
- [ ] T057 Ejecutar la habilidad `feature-done-check` (spec, pruebas de reglas de negocio, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte
- [ ] T058 Cambiar `Status` de `specs/016-account-management/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de `tutorias_uts_db`, `tutorias_uts_back`, `tutorias_uts_mobile` y `Claude` (el de `Claude` apunta a `001-auth-roles`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; T001 primero, T003 y T004 en paralelo; T002 antes de cualquier prueba e2e.
- **Foundational (Phase 2)**: depende de Setup y bloquea las historias. T005 y T006 (pruebas) antes de T007 y T008; T009 en paralelo; T010 al final.
- **User Stories (Phase 3 en adelante)**: dependen de Foundational. US1 va primero porque US2 a US5 usan sus listas y su hoja de acciones; US2, US3, US4 y US5 se pueden trabajar después en paralelo por personas distintas en backend, y la app comparte `AccountSheet.tsx`, `useAccountActions.ts` y `es.json`/`en.json`, así que sus tareas de app van en orden.
- **Polish (Phase 8)**: depende de que las historias estén terminadas; T050 necesita los 12 endpoints.

### User Story Dependencies

- **US1 (P1)**: tras Foundational; no depende de otras historias.
- **US2 (P1)**: tras US1 (usa las listas y la tarjeta); en backend es independiente salvo `TeachersService` y `StudentsService`, que crecen con cada historia.
- **US3 (P1)**: tras US2 (reutiliza la transacción de baja de T028 y la hoja de acciones).
- **US4 (P2)** y **US5 (P2)**: tras US1; independientes entre sí y de US2 y US3 en backend.

### Within Each User Story

- Las pruebas se escriben primero y deben fallar.
- Servicio → controlador → app; hooks y textos antes de las pantallas que los usan.

### Parallel Opportunities

- Setup: T003 y T004.
- Foundational: T005 y T006; luego T009 en paralelo con T007 y T008.
- US1: T011, T012, T013 y T014 juntas; T016, T017 y T018 juntas.
- US2: T022, T023, T024, T025 y T026 juntas; T030 en paralelo con T027 a T029.
- US3, US4 y US5: sus pruebas `[P]` juntas.
- Polish: T051, T052, T053 y T055.

## Parallel Example: User Story 2

```text
# Pruebas de US2 juntas:
T022 teachers-manage.e2e-spec.ts (desactivar y reactivar un docente)
T023 students-manage.e2e-spec.ts (baja de estudiante con inscripciones)
T024 students-concurrency.e2e-spec.ts
T025 accounts-delivery.e2e-spec.ts
T026 AccountSheet.test.tsx
```

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1 y Phase 2 (T001 a T010): migración, cambio de estado y búsqueda.
2. Phase 3 (US1): las listas.
3. **Parar y validar**: el CAE ve y busca a docentes y estudiantes (hoy no puede ver a los estudiantes).

### Incremental Delivery

1. Setup y Foundational → la lógica compartida probada.
2. US1 → listas (MVP).
3. US2 → desactivar y reactivar con el efecto atómico.
4. US3 → eliminar.
5. US4 → editar un docente.
6. US5 → regenerar la clave.
7. Polish → contrato, docs, decisiones y Pull Requests.

## Notes

- `[P]` = archivos distintos, sin dependencias pendientes.
- Verificar que las pruebas fallan antes de implementar.
- Un commit por historia (Conventional Commits, en inglés).
- Las pruebas e2e no se corren a la vez que otras suites ni con la API de desarrollo en marcha.
- Un estudiante que no verificó su correo no es gestionable (`404 ACCOUNT_NOT_FOUND`).
