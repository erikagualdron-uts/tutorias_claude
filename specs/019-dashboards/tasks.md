---

description: "Task list for Dashboards de los tres roles"
---

# Tasks: Dashboards de los tres roles

**Input**: Design documents from `/specs/019-dashboards/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/dashboard-api.yaml, quickstart.md

**Tests**: Incluidas. La constitución (Principios IV y V) y `docs/Conventions.md` §6 exigen pruebas de roles (`403`) y de contrato; aquí se suman las de los cálculos (ocupación, baja inscripción, ranking de salones, semana en `America/Bogota`, cambios recientes) y la concordancia con los datos de origen (SC-002). Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1, US2 y US3 son P1 y no dependen entre sí una vez hecha la fase 2; US4 es P2. **No cambia `tutorias_uts_db`** (sin migración); cambian `tutorias_uts_back`, `tutorias_uts_mobile` y `Claude/docs`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 dashboard del CAE, US2 dashboard del docente, US3 inicio del estudiante, US4 cada cifra lleva a su detalle
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas junto al código en `__tests__/`
- `Claude/` = `docs/` y `specs/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes; el estado de una PQRS y el del cupo nunca se indican solo por color (llevan texto); el lima `#C3D730` nunca va como texto o ícono sobre blanco
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Errores siempre con `AppException(status, 'CODE', mensaje, details?)`; la app traduce `errors.<CODE>`
- Roles por endpoint con `@Roles(...)`: `'SUPERADMIN'` para `/dashboard/admin/*`, `'TEACHER'` para `/dashboard/teacher` y `'STUDENT'` para `/dashboard/student`; las cifras personales salen del usuario autenticado (`@CurrentAuth()`), nunca de un parámetro
- Hora actual siempre con `Clock` (`common/clock.ts`), nunca `new Date()`; "esta semana" va de lunes a domingo en `America/Bogota`
- Todas las consultas excluyen filas con `deleted_at`; las fechas salen en UTC (ISO 8601) y la app las muestra en `America/Bogota`
- Sin datos: listas `[]`, `nextSession` `null`, tiempo de respuesta `null`; nunca `NaN`
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí ni con la API de desarrollo en marcha (base de datos y cola de Redis compartidas)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Esqueleto del módulo y de la carpeta de la app, sin lógica

- [ ] T001 Crear en `tutorias_uts_back/src/dashboard/` los archivos vacíos `dashboard.module.ts`, `dashboard.controller.ts`, `admin-dashboard.service.ts`, `person-dashboard.service.ts`, `dashboard.rules.ts` y `dto/changes-query.dto.ts`, e importar `DashboardModule` en `tutorias_uts_back/src/app.module.ts`
- [ ] T002 [P] Crear en `tutorias_uts_mobile/src/features/dashboard/` las carpetas `hooks/`, `components/`, `screens/` y `__tests__/`, y el archivo `types.ts` con los tipos de `specs/019-dashboards/contracts/dashboard-api.yaml` (`AdminOverview`, `RecentChange`, `RoomUsage`, `NextSession`, `TeacherDashboard`, `StudentDashboard`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cálculos puros, configuración, roles y piezas visuales que usan las tres historias

**⚠️ CRITICAL**: Ninguna historia empieza hasta terminar esta fase

### Tests for Foundational ⚠️

- [ ] T003 [P] Escribir `tutorias_uts_back/src/dashboard/dashboard.rules.spec.ts` (deben fallar): `occupancyPercent(enrolled, capacity)` devuelve `0` con capacidad `0` y nunca supera `100`; `classifyModule(enrolled, capacity, lowPercent)` devuelve `full` con inscritos ≥ capacidad, `low` si no está lleno y `enrolled / capacity * 100 < lowPercent`, y `normal` en otro caso; `rankRooms(rooms)` devuelve `most` y `least` de hasta 3 sin repetir un salón cuando hay 6 o menos, ordena por porcentaje y desempata por nombre, y excluye los salones sin módulos; `weekRangeBogota(now)` devuelve de lunes 00:00 a lunes siguiente 00:00 en `America/Bogota` (en UTC: +5 h) incluso el domingo 23:30 Bogotá y el lunes 00:10 Bogotá
- [ ] T004 [P] Añadir a `tutorias_uts_back/test/` un archivo `dashboard-roles.e2e-spec.ts` (debe fallar): los 5 endpoints responden `401` sin sesión y `403` con cualquier rol que no sea el suyo (`/dashboard/admin/*` solo `SUPERADMIN`, `/dashboard/teacher` solo `TEACHER`, `/dashboard/student` solo `STUDENT`); el código de error es el estable de `RolesGuard`

### Implementation for Foundational

- [ ] T005 Implementar en `tutorias_uts_back/src/dashboard/dashboard.rules.ts` las funciones puras de T003 (`occupancyPercent`, `classifyModule`, `rankRooms`, `weekRangeBogota` con `bogotaCalendarDay` de `common/clock.ts`)
- [ ] T006 [P] Añadir en `tutorias_uts_back/src/settings/settings.service.ts` la clave `'dashboard.lowEnrollmentPercent': number` con valor por defecto `30` en `SETTING_DEFAULTS` (entero de 1 a 100, mismo patrón de `pqrs.subjectMaxLength`) y un caso en la prueba de `settings` que compruebe el valor por defecto
- [ ] T007 Implementar `tutorias_uts_back/src/dashboard/dashboard.controller.ts` y `dashboard.module.ts` con las 5 rutas de `contracts/dashboard-api.yaml` y su `@Roles(...)` por ruta (cuerpos que devuelven datos vacíos con la forma del contrato mientras las historias los llenan); `dto/changes-query.dto.ts` extiende `PageQuery` con `limit` entre `1` y `50` y `20` por defecto
- [ ] T008 [P] Crear en `tutorias_uts_mobile/src/features/dashboard/components/` `MetricCard.tsx` (tarjeta blanca, radio 16, relleno 16, nivel de sombra 1, número arriba y etiqueta en estilo Metadata abajo), `CapacityBar.tsx` (etiqueta a la izquierda, `18/30` a la derecha, barra de 8 px, mismas reglas de color que `ModuleCard`) y `BlockState.tsx` (envoltorio de los cuatro estados de un bloque: carga con `BrandLoader`, vacío con `EmptyState`, error con botón "Reintentar" con ícono a la izquierda y datos), con pruebas en `__tests__/components.test.tsx`
- [ ] T009 [P] Crear `tutorias_uts_mobile/src/features/dashboard/components/HeroSessionCard.tsx`: degradado de marca (de `#34531F` a `#132F20` con los tokens del tema), texto blanco, radio 20, relleno 20, línea lima de 4 px bajo el título y `BrandPattern` al 10 % en la esquina inferior derecha; muestra módulo, día y hora, salón y, si viene, la cantidad de inscritos; botón "Ver detalle" de estilo Accent con ícono a la izquierda; sin sesión muestra una tarjeta de fondo `#F2F4EF` con `dashboard.noUpcoming`; prueba en `__tests__/hero-session-card.test.tsx` (con sesión, sin sesión, con y sin inscritos)
- [ ] T010 [P] Añadir los textos comunes a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`dashboard.title`, `dashboard.noUpcoming`, `dashboard.nextSession`, `dashboard.viewDetail`, `dashboard.retry`, `dashboard.empty.*`) con las claves ordenadas, y los íconos nuevos del set `solar` en `tutorias_uts_mobile/src/icons/registry.ts`; ejecutar `check_i18n.py` y reiniciar Metro con `npx expo start -c`
- [ ] T011 Crear `tutorias_uts_mobile/src/features/dashboard/api.ts` con el cliente de los 5 endpoints (mismo patrón de `src/features/pqrs/api.ts`) y configurar en los hooks `refetchOnWindowFocus` y `staleTime: 0` para que las cifras se refresquen al volver a la pestaña (FR-011)

**Checkpoint**: Reglas puras, roles y piezas visuales listos; las historias pueden empezar.

---

## Phase 3: User Story 1 - Dashboard del CAE (Priority: P1) 🎯 MVP

**Goal**: El CAE ve ocupación, módulos llenos y con baja inscripción, cuentas activas, PQRS por estado con tiempo de respuesta, últimos 5 cambios y uso de salones.

**Independent Test**: Con módulos de distinta ocupación, PQRS en los tres estados y una cancelación reciente, abrir "Dashboard" y comprobar que cada cifra coincide con los datos.

### Tests for User Story 1 ⚠️

- [ ] T012 [P] [US1] Escribir `tutorias_uts_back/test/dashboard-admin.e2e-spec.ts` (debe fallar) para `GET /dashboard/admin/overview`: la ocupación es inscritos activos sobre la suma de capacidades de los módulos del periodo `ACTIVE` sin borrado lógico; `modules.full`, `modules.lowEnrollment` y `lowEnrollmentPercent` coinciden con el umbral (30 por defecto, cambia si se actualiza la clave en `settings`); una cuenta desactivada o eliminada no cuenta en `accounts` ni como inscrito; `pqrs.filed`, `inReview` y `resolved` cuentan solo PQRS sin borrado; `avgResponseSeconds` es el promedio de `resolved_at - created_at` de las resueltas, `null` si no hay; sin módulos, `percent` es `0` y no hay `NaN`
- [ ] T013 [P] [US1] Añadir a `dashboard-admin.e2e-spec.ts` los casos de `GET /dashboard/admin/changes` y `/rooms`: `changes` devuelve solo sesiones `RESCHEDULED` o `CANCELLED` con `cancel_reason` distinto de `HOLIDAY` y sin borrado, por `updated_at` descendente, paginado con `meta.total`, `limit` fuera de `1` a `50` responde `400`; `rooms` devuelve hasta 3 `most` y 3 `least` sin repetir un salón, sin salones sin módulos, con `percent` entre `0` y `100`
- [ ] T014 [P] [US1] Escribir `tutorias_uts_mobile/src/features/dashboard/__tests__/AdminDashboardScreen.test.tsx` (debe fallar): muestra los cuatro estados por bloque, la barra grande de ocupación con `X módulos llenos · Y con baja inscripción`, las 4 tarjetas, la barra apilada de PQRS con etiqueta y número (nunca solo color) y el promedio, 5 cambios con "Ver todo", y los salones; si falla `rooms` los demás bloques siguen visibles y ese muestra "Reintentar"; el tiempo de respuesta `null` muestra el texto de vacío

### Implementation for User Story 1

- [ ] T015 [US1] Implementar en `tutorias_uts_back/src/dashboard/admin-dashboard.service.ts` `overview()`: una consulta agregada con `$queryRaw` (como `enrollments/seats.ts`) para inscritos y capacidad por módulo del periodo `ACTIVE`, `classifyModule` con el umbral de `SettingsService`, conteos de `users` activos por rol, `GROUP BY status` de `pqrs` y el promedio de `resolved_at - created_at`; cuerpo según `AdminOverview` del contrato
- [ ] T016 [US1] Implementar en el mismo servicio `changes(page, limit)` (R-4: `module_sessions` con estado `RESCHEDULED` o `CANCELLED`, `cancel_reason <> 'HOLIDAY'`, `deleted_at IS NULL`, módulo incluido para el nombre, `updated_at` descendente) y `rooms()` (porcentaje por salón con `rankRooms`); conectarlos en `dashboard.controller.ts`
- [ ] T017 [P] [US1] Crear en `tutorias_uts_mobile/src/features/dashboard/components/` `StatusStackBar.tsx` (una sola barra horizontal apilada con segmentos Neutral, Warning y Success, etiqueta y número en cada uno), `ChangeRow.tsx` (ícono, módulo, tiempo relativo y tipo con texto) y `RoomBars.tsx` (barras horizontales de más y menos ocupados), con pruebas en `__tests__/`
- [ ] T018 [US1] Crear `tutorias_uts_mobile/src/features/dashboard/hooks/useAdminDashboard.ts` (`useAdminOverview`, `useAdminChanges`, `useAdminRooms`) y `screens/AdminDashboardScreen.tsx` según "CAE Dashboard" de `Design.md` (ocupación, 4 tarjetas, PQRS por estado, 5 cambios, salones), con pull-to-refresh; cada bloque dentro de `BlockState`
- [ ] T019 [US1] Cambiar `tutorias_uts_mobile/app/(admin)/index.tsx` para exportar `AdminDashboardScreen` en lugar de `EmptyTabScreen`
- [ ] T020 [P] [US1] Añadir los textos del CAE a `es.json` y `en.json` (ocupación, módulos llenos y con baja inscripción, tarjetas, estados de PQRS, tiempo promedio de respuesta, cambios recientes, salones y sus estados vacíos) y ejecutar `check_i18n.py`

**Checkpoint**: US1 funciona y se prueba sola; es el MVP.

---

## Phase 4: User Story 2 - Inicio del docente (Priority: P1)

**Goal**: El docente ve su próxima sesión, las de la semana, el cupo de cada módulo, sus mensajes sin leer y sus 3 PQRS más recientes.

**Independent Test**: Con un docente con dos módulos, sesiones esta semana, mensajes sin leer y dos PQRS, abrir "Dashboard"; cancelar la próxima sesión y comprobar que pasa a la siguiente.

### Tests for User Story 2 ⚠️

- [ ] T021 [P] [US2] Escribir `tutorias_uts_back/test/dashboard-teacher.e2e-spec.ts` (debe fallar) para `GET /dashboard/teacher`: `nextSession` es la de menor `starts_at` mayor que ahora en estado `SCHEDULED` o `RESCHEDULED` del propio docente, con salón y `attendees` iguales a los de `sessionSeats` (una ausencia de estudiante lo baja en uno); `weekSessions` cuenta las de la semana en `America/Bogota` sin las canceladas y con el borde del domingo 23:30 y el lunes 00:10; `modules` solo trae los del periodo `ACTIVE` del docente con `enrolled` y `capacity`; otro docente nunca aparece; sin sesiones `nextSession` es `null`; al cancelar la próxima, la respuesta pasa a la siguiente
- [ ] T022 [P] [US2] Escribir `tutorias_uts_mobile/src/features/dashboard/__tests__/TeacherDashboardScreen.test.tsx` (debe fallar): tarjeta principal con y sin sesión, 2 tarjetas de métrica (sesiones de la semana y mensajes sin leer), una barra de cupo por módulo, hasta 3 PQRS con insignia de estado con texto y estado vacío; el número de mensajes sin leer sale del mismo hook que la pestaña "Mensajes"

### Implementation for User Story 2

- [ ] T023 [US2] Implementar en `tutorias_uts_back/src/dashboard/person-dashboard.service.ts` `teacher(userId)`: próxima sesión y semana (`weekRangeBogota`, `Clock`), inscritos con `sessionSeats` y módulos con `countActiveEnrollments` o su equivalente agregado; conectar `GET /dashboard/teacher` en el controlador con `@CurrentAuth()`
- [ ] T024 [US2] Crear `tutorias_uts_mobile/src/features/dashboard/hooks/useTeacherDashboard.ts` y `screens/TeacherDashboardScreen.tsx` según "Teacher Dashboard" de `Design.md` (tarjeta principal, 2 tarjetas de métrica, `CapacityBar` por módulo, "Mis PQRS"); mensajes sin leer con el hook de `src/features/chat/hooks/useChatData.ts` y las 3 PQRS con `GET /pqrs/mine?limit=3` mediante un hook nuevo en `src/features/pqrs/hooks/useAuthorPqrs.ts`
- [ ] T025 [US2] Cambiar `tutorias_uts_mobile/app/(teacher)/index.tsx` para exportar `TeacherDashboardScreen`
- [ ] T026 [P] [US2] Añadir los textos del docente a `es.json` y `en.json` (sesiones de la semana, mensajes sin leer, cupo por módulo, mis PQRS y estados vacíos) y ejecutar `check_i18n.py`

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Inicio del estudiante (Priority: P1)

**Goal**: El estudiante ve su próxima tutoría, las de la semana, avisos y mensajes sin leer, los cambios que lo afectan y sus 3 PQRS más recientes.

**Independent Test**: Con un estudiante inscrito en dos módulos, un cambio reciente y una PQRS, abrir "Inicio" y comprobar cada bloque.

### Tests for User Story 3 ⚠️

- [ ] T027 [P] [US3] Escribir `tutorias_uts_back/test/dashboard-student.e2e-spec.ts` (debe fallar) para `GET /dashboard/student`: `nextSession` y `weekSessions` respetan `ATTENDS_SESSION` (una sesión omitida por el estudiante, una inscripción cancelada con vigencia posterior y una cuenta de módulo ajeno no cuentan ni son la próxima); sin canceladas; `changes` trae como máximo `5` cambios de módulos con su inscripción vigente, sin los de festivo y sin los de módulos ajenos; un estudiante sin inscripciones recibe `nextSession: null`, `weekSessions: 0` y `changes: []`
- [ ] T028 [P] [US3] Escribir `tutorias_uts_mobile/src/features/dashboard/__tests__/StudentHomeScreen.test.tsx` (debe fallar): tarjeta principal con y sin sesión (sin inscripciones: texto e invitación a explorar módulos con botón con ícono a la izquierda), tarjetas de sesiones de la semana y de avisos y mensajes sin leer, lista de cambios recientes y hasta 3 PQRS con estado

### Implementation for User Story 3

- [ ] T029 [US3] Implementar en `tutorias_uts_back/src/dashboard/person-dashboard.service.ts` `student(userId)`: consulta con `ATTENDS_SESSION` para la próxima sesión y la semana, y los 5 cambios más recientes de los módulos con inscripción vigente (misma regla de R-4 que `changes()` del CAE: extraer la condición común a una constante en el servicio); conectar `GET /dashboard/student` en el controlador
- [ ] T030 [US3] Crear `tutorias_uts_mobile/src/features/dashboard/hooks/useStudentDashboard.ts` y `screens/StudentHomeScreen.tsx` según "Student Dashboard (Home)" de `Design.md`; avisos sin leer con `src/features/notifications/hooks/useUnreadCount.ts`, mensajes sin leer con `useChatData.ts` y las 3 PQRS con el hook de T024
- [ ] T031 [US3] Cambiar `tutorias_uts_mobile/app/(student)/index.tsx` para exportar `StudentHomeScreen`
- [ ] T032 [P] [US3] Añadir los textos del estudiante a `es.json` y `en.json` (sesiones inscritas de la semana, avisos y mensajes sin leer, cambios recientes, invitación a explorar módulos) y ejecutar `check_i18n.py`

**Checkpoint**: Las tres historias P1 funcionan.

---

## Phase 6: User Story 4 - Cada cifra lleva a su detalle (Priority: P2)

**Goal**: Cada bloque abre la pantalla donde se trabaja con ese dato, y el "Ver todo" de cambios del CAE lista el resto.

**Independent Test**: Tocar cada bloque de cada rol y comprobar que abre la pantalla correspondiente.

### Tests for User Story 4 ⚠️

- [ ] T033 [P] [US4] Escribir `tutorias_uts_mobile/src/features/dashboard/__tests__/dashboard-links.test.tsx` (debe fallar): "Ver detalle" de la tarjeta principal abre el módulo de esa sesión (docente y estudiante); "Mis PQRS" abre la lista de PQRS; el bloque "PQRS por estado" del CAE abre la lista con el filtro del estado tocado; el contador de mensajes abre "Mensajes" y el de avisos la bandeja; una fila de cambio abre su módulo; "Ver todo" abre `changes`
- [ ] T034 [P] [US4] Escribir `tutorias_uts_mobile/src/features/dashboard/__tests__/ChangesScreen.test.tsx` (debe fallar): lista paginada con `ChangeRow`, carga más páginas al final y muestra los cuatro estados

### Implementation for User Story 4

- [ ] T035 [US4] Crear `tutorias_uts_mobile/src/features/dashboard/screens/ChangesScreen.tsx` y la ruta `tutorias_uts_mobile/app/(admin)/changes.tsx`, y registrarla en `tutorias_uts_mobile/src/features/shell/RoleTabs.tsx` oculta de la barra con `href: null`, igual que `notifications`; el hook usa `GET /dashboard/admin/changes` con `limit` por defecto
- [ ] T036 [US4] Conectar la navegación en las tres pantallas de `src/features/dashboard/screens/`: tarjeta principal al módulo, tarjetas de sin leer a "Mensajes" y a la bandeja, "Mis PQRS" y "PQRS por estado" a la lista de PQRS (el CAE con el filtro del estado) y filas de cambio al módulo; cada elemento táctil mide como mínimo 48 px

**Checkpoint**: Las cuatro historias funcionan.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Contrato, privacidad, documentación, decisiones y cierre

- [ ] T037 [P] Escribir `tutorias_uts_back/test/dashboard-contract.e2e-spec.ts` que valide las respuestas reales de los 5 endpoints contra `specs/019-dashboards/contracts/dashboard-api.yaml` (mismo patrón de `pqrs-contract.e2e-spec.ts` y `test/utils/contract.ts`)
- [ ] T038 [P] Añadir a `tutorias_uts_back/test/log-redaction.e2e-spec.ts` que consultar los 5 endpoints no escribe nombres de personas, asuntos ni textos de PQRS o de chat en los registros
- [ ] T039 [P] Actualizar `Claude/docs/Context.md` §8: definiciones de ocupación (inscritos sobre capacidad de los módulos activos), módulo lleno, baja inscripción (menos del 30 % del cupo, configurable), ocupación de un salón, tiempo promedio de respuesta (radicación a resolución), semana (lunes a domingo en `America/Bogota`) y cambios recientes (sin cancelaciones por festivo)
- [ ] T040 [P] Actualizar `Claude/docs/Architecture.md`: módulo `dashboard/` de solo lectura, los 5 endpoints, la clave `dashboard.lowEnrollmentPercent`, que se reutilizan `ATTENDS_SESSION` y `sessionSeats`, y que no hay tablas nuevas
- [ ] T041 [P] Actualizar `Claude/docs/Design.md` con la pantalla de "Ver todo" de cambios del CAE y marcar los dashboards como construidos
- [ ] T042 Registrar en `Claude/docs/Decisions.md` D-116 (dashboards: endpoints de solo lectura por rol y por bloque del CAE, reutilización de los contadores y de `GET /pqrs/mine`, cambios recientes desde `module_sessions` sin festivos, umbral de baja inscripción en configuración, sin selector de periodo), con su motivo y lo descartado
- [ ] T043 [P] Comprobar en `tutorias_uts_back` y `tutorias_uts_mobile` que ningún `console.log` ni registro escribe datos de personas, que `grep` de `Unidades Tecnológicas` no encuentra nada, que `python .claude/skills/i18n-strings/scripts/check_i18n.py <es.json> <en.json>` da paridad es/en y que no hay hexadecimales, `fontFamily`, `fontWeight` ni librerías de íconos distintas de Iconify en los componentes nuevos
- [ ] T044 Recorrer los 16 escenarios de `specs/019-dashboards/quickstart.md` en español e inglés con la app y la API en marcha y anotar el resultado en ese archivo, incluido el tiempo de carga del dashboard completo con 200 módulos y 200 PQRS (SC-001, menos de 3 s) y el de identificar la próxima tutoría (SC-004, menos de 5 s)
- [ ] T045 Ejecutar la habilidad `feature-done-check` (spec, pruebas, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte
- [ ] T046 Cambiar `Status` de `specs/019-dashboards/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de `tutorias_uts_back`, `tutorias_uts_mobile` (contra `main`) y `Claude` (contra `master`); `tutorias_uts_db` no lleva PR porque esta spec no lo cambia

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: sin dependencias.
- **Phase 2 (Foundational)**: depende de la fase 1 y bloquea todas las historias. Dentro de ella: T005 depende de T003; T007 de T001; T011 de T002 y T010.
- **Historias**: US1, US2 y US3 empiezan tras la fase 2 y no dependen entre sí. US4 (P2) toca las tres pantallas y por eso va al final.
- **Polish**: depende de las historias que se quieran entregar; T044 a T046 van al final y en ese orden.

### Dentro de cada historia

- Las pruebas primero y deben fallar; luego servicio del backend, hooks y pantalla de la app, ruta y textos.
- US3 reutiliza la condición de cambios de T016 (extraída en T029); si US3 va antes que US1, extraerla ahí y que US1 la use.

### Parallel Opportunities

- Fase 2: T003 y T004 juntas; T006, T008, T009 y T010 en paralelo.
- Cada historia: sus pruebas de backend y de app en paralelo, y sus textos junto a la pantalla.
- Dos personas pueden llevar el backend (T012 a T016, T021 a T023, T027 a T029) y la app (T014 a T020, T022 a T026, T028 a T032) a la vez, con los contratos como acuerdo.

### Parallel Example: User Story 1

```text
T012 dashboard-admin.e2e-spec.ts (overview)   T013 changes y rooms   T014 AdminDashboardScreen.test.tsx
T017 StatusStackBar, ChangeRow, RoomBars      T020 textos del CAE
```

## Implementation Strategy

- **MVP**: Fase 1, fase 2 y US1 (dashboard del CAE). Se puede probar y mostrar solo.
- **Entrega incremental**: US2, luego US3 y por último US4; cada una se prueba sin las siguientes.
- Un commit por tarea o grupo pequeño, en formato Conventional Commits (`feat(dashboard): ...`), y la rama `019-dashboards` en cada repositorio que cambie.
- Si algún bloque no cumple los 300 ms por endpoint con 200 módulos, se ajusta la consulta del servicio (sin tablas ni índices nuevos) y se registra en `research.md`.
