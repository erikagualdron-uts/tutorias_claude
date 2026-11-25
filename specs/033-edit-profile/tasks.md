# Tasks: Editar mi nombre

**Input**: `specs/033-edit-profile/` (plan.md, spec.md, research.md, data-model.md, contracts/profile-api.yaml, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: las pide la constitución (V aplicada en el plan: permiso y transacción) y la spec (FR-002, FR-003, FR-010, SC-003, SC-004, SC-007). Las pruebas del backend y de la pantalla se escriben antes de la implementación.

**Repositorios**: `tutorias_uts_db` (migración), `tutorias_uts_back` (endpoint), `tutorias_uts_mobile` (pantalla) y `Claude` (documentos). Cada uno en la rama `033-edit-profile`, creada desde su rama vigente: `Claude` y `tutorias_uts_mobile` desde `032-my-account` (PRs abiertos); `tutorias_uts_back` desde `025-staff-email-notices`; `tutorias_uts_db` desde `023-quality` (la 032 no tocó esos dos repos).

## Formato: `[ID] [P?] [Story] Descripción`

Rutas relativas al repositorio indicado en cada tarea.

## Phase 1: Setup

- [X] T001 Crear la rama `033-edit-profile` en `tutorias_uts_mobile` desde `032-my-account`, en `tutorias_uts_back` desde `025-staff-email-notices` y en `tutorias_uts_db` desde `023-quality` (en `Claude` ya existe) y comprobar que `npm test`, `npm run lint` y `npm run typecheck` pasan en back y mobile antes de cambiar nada.

---

## Phase 2: Foundational (documento, datos y textos primero; bloquea las historias)

- [X] T002 [P] En `Claude/docs/Decisions.md` agregar **D-130 · Solo el estudiante edita su nombre, con registro interno**: decisión (solo `STUDENT` cambia su nombre y apellido; docente lo gestiona el CAE; el CAE no tiene nombre; `PATCH /students/me`; registro de solo inserción en la misma transacción), motivo y descartados (los de `research.md`: nombre del CAE con perfil nuevo, edición libre del docente, registro con pantalla o sin registro).
- [X] T003 [P] En `Claude/docs/Architecture.md` agregar `StudentNameChange` a la tabla de entidades (id, userId, previousFirstName, previousLastName, newFirstName, newLastName, createdAt; solo inserción, sin `deletedAt`) y `PATCH /students/me` (solo `STUDENT`, valida y registra) a la lista de endpoints. En `Claude/docs/Context.md` agregar la regla: solo el estudiante edita su nombre; el correo no se edita; docente y CAE no.
- [X] T004 [P] En `Claude/docs/Design.md`, en «Screens without a tab», agregar `account-name` (solo estudiante, desde «Mi cuenta»), y en `Claude/specs/026-design-system/screen-inventory.md` una sección «Spec 033: Editar mi nombre» con la pantalla y su registro.
- [X] T005 En `tutorias_uts_db/prisma/schema.prisma` agregar el modelo `StudentNameChange` (`@@map("student_name_changes")`) con `id` UUID, `userId` UUID con relación a `User`, `previousFirstName`, `previousLastName`, `newFirstName`, `newLastName` y `createdAt` `timestamptz(6)` por defecto `now()`; índice por `userId` y `createdAt`; **sin `updatedAt` ni `deletedAt`**. Crear la migración con `npx prisma migrate dev --name add_student_name_changes` y comprobar que solo crea esa tabla y su índice.
- [X] T006 [P] En `tutorias_uts_mobile/src/i18n/es.json` y `en.json` agregar las claves `account.name.*` (título, etiquetas de nombre y apellido, acción «Editar nombre», botón guardar, confirmación, regla del docente «Tu nombre lo gestiona el CAE», error de red) ordenadas y con paridad en ambos idiomas; la prueba de paridad existente debe pasar.
- [X] T007 [P] En `tutorias_uts_mobile/src/theme/__tests__/headerBudget.test.ts` agregar `src/features/account/screens/AccountNameScreen.tsx` a `FORMS`; en `severityIndicators.test.ts` agregarla también (el formulario muestra errores de campo). Deben fallar porque la pantalla no existe.

**Checkpoint**: documentos, tabla y textos listos; las guardas fallan porque falta la funcionalidad.

---

## Phase 3: User Story 1 - Corregir mi nombre como estudiante (Priority: P1)

**Goal**: el estudiante cambia su nombre y apellido desde «Mi cuenta»; el servidor valida, solo permite al estudiante y registra el cambio.

**Independent Test**: con una cuenta de estudiante, cambiar nombre y apellido con datos válidos, vacíos y de más de 100 caracteres; cerrar y abrir la app y comprobar que persiste y que la tabla del registro tiene una fila.

- [X] T008 [US1] Crear `tutorias_uts_back/test/students-own-name.e2e-spec.ts` (debe fallar: el endpoint no existe), con el patrón de `students-manage.e2e-spec.ts`: (a) estudiante cambia su nombre: 200, responde el `UserSummary` y hay una fila en `student_name_changes` con anterior y nuevo; (b) mismos valores tras recortar espacios: 200, sin escritura y sin fila; (c) nombre o apellido vacío o solo espacios: 400; (d) 101 caracteres: 400; (e) 100 caracteres: 200; (f) acentos, ñ, apóstrofe y guion se aceptan; (g) cuenta desactivada: 401 `ACCOUNT_DISABLED` y cuenta borrada: 401 `ACCOUNT_UNAVAILABLE` (los devuelve `session.service.ts` antes del servicio), sin cambiar el perfil ni crear fila; (h) fallo al insertar el registro: ni nombre nuevo ni fila (transacción).
- [X] T009 [P] [US1] Crear `tutorias_uts_back/src/students/dto/update-own-name.dto.ts` con `firstName` y `lastName`: `@IsString()`, recorte de espacios, `@IsNotEmpty()` y `@MaxLength(100)`, reutilizando la misma constante o regla que `src/auth/dto/registration.dto.ts` (sin un número nuevo suelto).
- [X] T010 [US1] En `tutorias_uts_back/src/students/students.service.ts` agregar `updateOwnName(userId, dto)`: dentro de una transacción de Prisma, leer el `StudentProfile` del usuario activo y no borrado (si no hay, `ACCOUNT_UNAVAILABLE`, como defensa; el guard de sesión ya rechaza antes las cuentas desactivadas o borradas); si nombre y apellido recortados son iguales a los guardados, devolver `profileOf` sin escribir; si no, actualizar el perfil e insertar la fila de `StudentNameChange` con anterior y nuevo; devolver el `UserSummary` (mismo que `GET /auth/me`).
- [X] T011 [US1] En `tutorias_uts_back/src/students/students.controller.ts` agregar `@Roles('STUDENT') @Patch('me') updateOwnName(@CurrentAuth() { user }, @Body() dto)` **declarado antes de las rutas con `:id`**, con documentación de Swagger acorde a `contracts/profile-api.yaml`; el servicio recibe solo el `user.id` del token, nunca un id de la petición. Correr T008 hasta que pase.
- [X] T012 [P] [US1] Crear `tutorias_uts_mobile/src/features/account/schemas.ts` con `ownNameSchema` (`firstName` y `lastName`: `z.string().trim().min(1, 'validation.required').max(100, ...)`, con el mensaje traducido de largo máximo) y su tipo.
- [X] T013 [US1] Crear `tutorias_uts_mobile/src/features/account/__tests__/AccountNameScreen.test.tsx` (debe fallar): campos rellenados con el nombre actual y, si no cambió nada, guardar vuelve sin enviar; vacío y 101 caracteres muestran el error bajo el campo sin perder lo escrito; guardar válido llama a `PATCH /students/me`, actualiza la sesión con la respuesta y vuelve a «Mi cuenta» con confirmación; error de red muestra el mensaje con reintento y conserva lo escrito; sesión expirada lleva al inicio de sesión; tras guardar, las pantallas propias que muestran el nombre (avatar de la barra superior y «Mi cuenta») leen el valor nuevo de la sesión sin recargar (FR-006).
- [X] T014 [P] [US1] Crear `tutorias_uts_mobile/src/features/account/hooks/useUpdateOwnName.ts`: `useMutation` que llama `api<UserSummary>('/students/me', { method: 'PATCH', body })`, en `onSuccess` hace `setUser` con la respuesta e invalida las consultas de chat y PQRS que muestran nombres, sin cerrar la sesión.
- [X] T015 [US1] Crear `tutorias_uts_mobile/src/features/account/screens/AccountNameScreen.tsx` siguiendo `AccountPasswordScreen.tsx` (registro «sobrio con cabecera», `ScreenHeader`, campos con relleno y borde, un solo botón principal con ícono a la izquierda, 16 px entre botones apilados, objetivos de 48 px, solo roles de color del tema) y crear el archivo de ruta `tutorias_uts_mobile/app/(student)/account-name.tsx` que la reexporta.
- [X] T016 [US1] En `tutorias_uts_mobile/src/features/shell/roleTabs.config.ts` agregar `{ name: 'account-name', titleKey: 'account.name.title' }` a `hidden` **solo de `STUDENT`**; comprobar que `hiddenScreens.test.tsx` la cubre sin editarlo. Correr T013 y T007 hasta que pasen.
- [X] T017 [US1] En `tutorias_uts_mobile/src/features/account/screens/AccountScreen.tsx` mostrar la acción «Editar nombre» (botón o fila con ícono a la izquierda, 48 px) **solo si el rol es `STUDENT`**, que navega a `/(student)/account-name`; actualizar `AccountScreen.test.tsx` (existe de la 032) con el caso del estudiante.

**Checkpoint**: el estudiante cambia su nombre de punta a punta; el servidor valida, restringe por rol y registra.

---

## Phase 4: User Story 2 - Entender por qué no puedo editar mi nombre (Priority: P2)

**Goal**: docente y CAE no ven la acción y entienden la regla; el servidor los rechaza.

**Independent Test**: abrir «Mi cuenta» con docente y con CAE en claro y oscuro, español e inglés; llamar al endpoint con sus tokens y recibir 403.

- [X] T018 [US2] En `tutorias_uts_back/test/students-own-name.e2e-spec.ts` agregar los casos: docente y CAE reciben 403; sin token, 401; el cuerpo con un `userId` o `id` ajeno se ignora y solo cambia la cuenta del token; en ninguno hay fila nueva ni cambio de perfil. Deben pasar con lo de T011 (si fallan, corregir el guard, no la prueba).
- [X] T019 [US2] En `tutorias_uts_mobile/src/features/account/__tests__/AccountScreen.test.tsx` agregar: para `TEACHER` no hay acción de editar y se muestra la regla «Tu nombre lo gestiona el CAE»; para `SUPERADMIN` no hay acción ni texto extra y el correo es el identificador; para `STUDENT` sí hay acción (T017).
- [X] T020 [US2] En `tutorias_uts_mobile/src/features/account/screens/AccountScreen.tsx` mostrar para `TEACHER` la regla con `account.name.teacherRule` (texto más ícono, sin botón que no puede funcionar) y para `SUPERADMIN` nada nuevo; correr T019 hasta que pase.

**Checkpoint**: los tres roles ven lo que les corresponde y el servidor cierra el acceso que la app esconde.

---

## Phase 5: Polish & Cross-Cutting

- [ ] T021 [P] Revisar la pantalla con los tres roles en teléfono, claro y oscuro, español e inglés, letra grande y «Reducir movimiento»; recorrer `quickstart.md` y anotar cualquier desvío.
- [X] T022 [P] Correr en `tutorias_uts_back` `npm test` y `npm run test:e2e` y en `tutorias_uts_mobile` `npm test`, `npm run lint` y `npm run typecheck`; todo en verde, incluidas las guardas de las specs 026 a 032 (SC-007: sin cambios en contraseña, registro ni gestión de docentes).
- [X] T023 Cerrar la spec: actualizar el estado en `spec.md` y el inventario de pantallas, y pasar la revisión de «Definición de terminado» de `docs/Conventions.md` (skill `feature-done-check`) antes del commit, push y PRs en los cuatro repositorios, cada uno con base en la rama de la que salió (`032-my-account` en `Claude` y `tutorias_uts_mobile`; `025-staff-email-notices` en `tutorias_uts_back`; `023-quality` en `tutorias_uts_db`).

---

## Dependencias

- **T001** antes de todo. **T002 a T004, T006 y T007** son documento y textos, independientes entre sí. **T005** (tabla) antes de T008 y T010.
- **US1**: T008 antes de T009 a T011; T009 antes de T010; T010 antes de T011. En la app, T012 y T014 antes de T015; T013 antes de T015; T015 y T016 antes de T017. Back y app pueden avanzar en paralelo tras T005.
- **US2** después de T011 (back) y T017 (app).
- **Polish** al final.

## Estrategia

- **MVP**: Phase 1, 2 y 3 (US1): el estudiante edita su nombre de punta a punta.
- **Incremento**: US2 cierra la regla para docente y CAE y las pruebas de seguridad.
- Commits pequeños: documentos, tabla, backend y app por separado (Conventional Commits en inglés).
