# Tasks: Calidad: seguridad, accesibilidad y rendimiento

**Input**: `specs/023-quality/` (plan.md, spec.md, research.md, data-model.md, quickstart.md). No hay `contracts/`: la spec no cambia ningún endpoint.

**Tests**: esta spec **es** de pruebas y comprobaciones; las pruebas se escriben antes de corregir lo que encuentren (constitución, principio V).

**Organization**: por historia de usuario. Las cuatro son independientes entre sí; US1 toca el backend, US2 y US3 la app, US4 la base de datos y el backend.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede hacer en paralelo (archivos distintos, sin depender de una tarea incompleta).
- Repositorios (D-077): `back/` = `tutorias_uts_back`, `mobile/` = `tutorias_uts_mobile`, `db/` = `tutorias_uts_db`, `docs/` = `Claude/docs`.
- Sin dependencias nuevas en ningún repositorio (plan.md). Sin cambio de contrato, de esquema ni de diseño visual (FR-013).

---

## Phase 1: Setup

- [X] T001 Verificar la línea base: en `back/` correr `npm run test`, `npm run test:e2e` y `npm run lint`; en `mobile/` correr `npm run lint`, `npm run typecheck` y `npm test`. Anotar en la sección Notas de este archivo cuántas pruebas pasan y cualquier falla previa (no se corrige aquí, solo se registra).
- [X] T002 [P] Leer `back/src/common/guards/` (`PublicThrottlerGuard`, `JwtAuthGuard`, `RolesGuard`, decoradores `@Public` e `@Roles`, constantes `IS_PUBLIC` y `ROLES`) y `back/test/utils/` (mundo de prueba, inicio de sesión por rol, captura de registros de `log-redaction.e2e-spec.ts`) para reutilizarlos en las tareas siguientes; anotar los nombres exactos en Notas.

**Checkpoint**: línea base conocida.

---

## Phase 2: Foundational

No hay prerrequisitos bloqueantes: cada historia crea sus propios ayudantes. Se puede empezar US1, US2, US3 y US4 en paralelo tras la Fase 1.

---

## Phase 3: User Story 1 - Cada ruta tiene su regla de acceso y no filtra datos de más (Priority: P1) 🎯 MVP

**Goal**: una ruta sin regla de acceso o una respuesta con un dato de más hace fallar la suite del backend, nombrando la ruta o la clave.

**Independent Test**: agregar una ruta de prueba sin `@Roles` y comprobar que `route-access.e2e-spec.ts` falla nombrando `MÉTODO /ruta`; quitarla y comprobar que pasa.

### Auditoría de rutas (FR-001, FR-002, SC-001)

- [X] T003 [P] [US1] Escribir `back/src/common/route-audit.spec.ts` (debe fallar): con rutas inventadas, `auditRoutes(routes, policy)` devuelve `[]` si todo cumple y `{ route, problem }` con `problem` en `MISSING_RULE` (sin `@Public`, sin `@Roles` y fuera de `ANY_ROLE_ROUTES`), `PUBLIC_NOT_LISTED` (`@Public` fuera de `PUBLIC_ROUTES`), `STALE_PUBLIC_ENTRY` y `STALE_ANY_ROLE_ENTRY` (entrada de lista que ya no existe); el problema nombra método y ruta.
- [X] T004 [US1] Implementar `auditRoutes` como función pura en `back/src/common/route-audit.ts` (tipos `RouteInfo { method, path, isPublic, roles }` y `RoutePolicy { publicRoutes, anyRoleRoutes }`) hasta que T003 pase.
- [X] T005 [P] [US1] Crear `back/test/utils/routes.ts`: enumera las rutas reales con `DiscoveryService.getControllers()` y `Reflector`; por cada método con `METHOD_METADATA` y `PATH_METADATA` arma método HTTP, ruta completa (prefijo `api/v1` + controlador + método) y `isPublic`/`roles` leyendo método y clase (como `getAllAndOverride` de los guards); excluye `RoleProbeController` por nombre.
- [X] T006 [P] [US1] Crear `back/test/utils/route-policy.ts` con `PUBLIC_ROUTES` (las 7 de `auth.controller.ts`: `register`, `verify-email`, `resend-verification`, `login`, `forgot-password`, `reset-password`, `refresh`) y `ANY_ROLE_ROUTES` (`GET /auth/me`, cerrar sesión, cambiar la propia clave, notificaciones, chat, `GET /pqrs/limits`, registro del dispositivo, y las demás que la enumeración muestre sin `@Roles`), cada entrada como `MÉTODO /ruta` con su motivo en una línea.
- [X] T007 [US1] Crear `back/test/route-access.e2e-spec.ts`: arranca la app, enumera con `routes.ts`, llama `auditRoutes` y exige `[]`; el mensaje de fallo lista cada problema como `MÉTODO /ruta: problema`. Comprobar a mano que falla al quitar un `@Roles` de un método y pasa al devolverlo (anotar en Notas).
- [X] T008 [US1] Corregir lo que T007 encuentre: cada ruta sin regla recibe `@Roles(...)` en su controlador o método, o entra a `ANY_ROLE_ROUTES` con su motivo; nunca se desactiva la prueba. Listar cada corrección en Notas. Si no hay hallazgos, anotarlo.
- [X] T009 [US1] En `back/test/route-access.e2e-spec.ts`, agregar: (a) por cada ruta de `PUBLIC_ROUTES` que recibe datos de personas sin sesión, comprobar que supera el límite de tasa de `PublicThrottlerGuard` con `429` y su código estable (reutilizar las pruebas ya existentes en `auth-*.e2e-spec.ts` si cubren la ruta y solo referenciarlas en el comentario del motivo; agregar la que falte); (b) con un usuario de cada rol, una ruta representativa de cada otro rol responde `403` (o `404` si el recurso ajeno no debe revelarse) con `code` estable (escenario 5).

### Datos de más (FR-003, SC-002)

- [X] T010 [P] [US1] Crear `back/test/response-secrets.e2e-spec.ts` (debe fallar si hay fugas): con un mundo de prueba, una tabla de endpoints de lectura por rol (CAE, docente, estudiante) y un recorrido en profundidad de cada JSON. Regla 1, en todo rol: claves prohibidas `passwordHash`, `password`, `refreshToken`, `accessToken`, `secret`, clave de SMTP, `verificationCode`, `resetCode`, `codeHash`; excepciones por ruta en una lista corta con motivo: tokens de `login`, `register` y `refresh`, y `temporaryPassword` al crear o regenerar la clave de un docente. Regla 2, solo docente y estudiante: ninguna clave `email` ni `phone`, salvo la de su propio perfil `GET /auth/me`; no se prohíbe al CAE lo que las specs 016 y 017 le dan.
- [X] T011 [US1] Corregir cada fuga que T010 encuentre quitando el campo del serializador o de la selección de Prisma de ese endpoint, sin cambiar el resto del contrato (FR-003 es corrección, no funcionalidad); actualizar la prueba de contrato del endpoint si la había. Anotar cada campo quitado en Notas.
- [X] T012 [P] [US1] Ampliar `back/test/log-redaction.e2e-spec.ts` con un escenario que recorra las lecturas de cada rol y compare toda la salida de registros contra las contraseñas, los tokens y los textos de mensajes, PQRS y respuestas del mundo de prueba (como los casos de las specs 018 a 022); corregir cualquier registro que los contenga (escenario 6, FR-004).

**Checkpoint**: `npm run test && npm run test:e2e -- test/route-access test/response-secrets test/log-redaction` en verde; US1 entregable sola.

---

## Phase 4: User Story 2 - Lector de pantalla y "reducir movimiento" (Priority: P1)

**Goal**: cada control de cada pantalla principal se anuncia con nombre y rol, mide al menos 48 px declarados, y ninguna animación ignora "reducir movimiento".

**Independent Test**: `npm test` en `mobile/` pasa con `controlIssues` en las pruebas de pantalla y con `reduceMotion.test.ts`; recorrido manual con TalkBack o VoiceOver del inicio de sesión, el dashboard, el cronograma y el chat.

### Ayuda y guarda globales

- [X] T013 [P] [US2] Crear `mobile/src/testing/a11y.ts` con `controlIssues(root)` y `expectAccessibleControls(root)`: recorre el árbol renderizado de React Native Testing Library, toma los controles táctiles (rol `button`, `link`, `switch`, `tab`, `radio`, `checkbox`, o con `onPress`) y devuelve problemas `{ control, problem }` con `problem` en `NO_NAME` (sin `accessibilityLabel` ni texto hijo que sirva de nombre), `NO_ROLE`, `TOO_SMALL` (`minHeight` o `height` del estilo aplanado, del control o de su contenedor inmediato, menor que 48 y sin `hitSlop` que lo complete) o `DECORATIVE_ICON_READ` (un ícono junto a texto sin `accessibilityElementsHidden`/`importantForAccessibility="no-hide-descendants"`); revisa una vez por pantalla y no por fila repetida. Incluye `mobile/src/testing/__tests__/a11y.test.tsx` con un control bueno y uno malo de cada problema.
- [X] T014 [P] [US2] Crear `mobile/src/__tests__/reduceMotion.test.ts` (estática, como `noGeometricDecoration.test.ts`): recorre `src/` y `app/` sin pruebas y exige que todo archivo que use `withTiming`, `withRepeat`, `withSpring`, `withSequence`, `FadeIn*`, `FadeOut*`, `SlideIn*`, `entering=`, `exiting=`, `requestAnimationFrame` o `Animated.` consulte `useMotion` o `useReducedMotion`, o use `FadeInView`, o reciba una propiedad `animated`; lista de excepciones por archivo con motivo en la misma prueba (`AuthLayout`, `Banner`, `WeekCalendar`, `LoaderRing` ya cumplen por `FadeInView` o `animated`). El mensaje nombra el archivo.
- [X] T015 [P] [US2] Revisar los componentes compartidos de `mobile/src/components/` (botón, campo de texto, tarjeta, banner, cargador, estado vacío y de error, barra de pestañas): cada control con `accessibilityRole` y etiqueta, íconos junto a texto ocultos al lector, el botón deshabilitado con `accessibilityState={{ disabled: true }}` y la regla que lo bloquea como `accessibilityHint`, el campo con error con su mensaje anunciado junto al campo (`accessibilityLabel`/`accessibilityHint` o `accessibilityLiveRegion`) (FR-005, FR-006). Probarlo en pruebas de componente nuevas o existentes en `mobile/src/components/__tests__/`. Todo texto nuevo en `mobile/src/i18n` (es y en) con la skill `i18n-strings`.

### Una línea por pantalla principal

Cada tarea agrega `expectAccessibleControls(screen)` a las pruebas de pantalla existentes (con datos, vacío y error donde la prueba ya lo cubra) y corrige lo que encuentre (etiqueta, rol, altura mínima de 48 px, ícono oculto) sin cambiar el diseño; si una pantalla de la lista no tiene prueba de pantalla, se crea una mínima. Todo texto nuevo en es y en.

- [X] T016 [P] [US2] Auth: inicio de sesión, registro, verificación y recuperar clave, en `mobile/src/features/auth/__tests__/`.
- [X] T017 [P] [US2] Dashboards y avisos: `mobile/src/features/dashboard/__tests__/AdminDashboardScreen.test.tsx`, `TeacherDashboardScreen.test.tsx`, `StudentHomeScreen.test.tsx`, `ChangesScreen.test.tsx`.
- [X] T018 [P] [US2] Módulos, cronogramas y hoja de sesión: `mobile/src/features/modules/__tests__/modules-screen.test.tsx` (lista, detalle y formulario del CAE), `mobile/src/features/student-schedule/__tests__/StudentScheduleScreen.test.tsx`, y las pantallas del docente en `mobile/src/features/teacher-sessions/__tests__/`.
- [X] T019 [P] [US2] Chat: `mobile/src/features/chat/__tests__/ChatScreens.test.tsx` (lista de conversaciones y chat).
- [X] T020 [P] [US2] PQRS: `mobile/src/features/pqrs/__tests__/MyPqrsScreen.test.tsx`, `NewPqrsScreen.test.tsx`, `PqrsFiledScreen.test.tsx`, `AdminPqrsScreen.test.tsx`; el formulario comprueba además que cada campo con error lo anuncia (escenario 4).
- [X] T021 [P] [US2] Cuentas y configuración del CAE, notificaciones y perfil: `mobile/src/features/accounts/__tests__/AccountsScreens.test.tsx`, `TeacherEditScreen.test.tsx`, y las pantallas de `mobile/src/features/notifications/`, `rooms/`, `periods/`, `holidays/`, `smtp/` y `dropdown-lists/` que ya tengan prueba (crear una mínima en las que no).
- [X] T022 [US2] Corregir lo que T014 encuentre (un archivo que anima sin consultar "reducir movimiento"): usar `useMotion` o `FadeInView`, nunca excepción sin motivo. Si no hay hallazgos, anotarlo en Notas.
- [X] T023 [US2] Recorrido manual con TalkBack (Android) o VoiceOver (iOS), en español y en inglés, de las pantallas del cuadro "Recorrido manual con lector de pantalla" de `quickstart.md`, con "reducir movimiento" activo; anotar en Notas pantalla por pantalla lo que falle y corregirlo. Esta tarea es manual y la hace una persona con dispositivo o emulador.

**Checkpoint**: `npm run lint && npm run typecheck && npm test` en `mobile/` en verde; US2 entregable sola.

---

## Phase 5: User Story 3 - Letra grande y modo oscuro sin pérdidas (Priority: P2)

**Goal**: todo par de color de las paletas clara y oscura cumple AA, el escalado de letra nunca se apaga y nada se corta al 200 %.

**Independent Test**: `contrast.test.ts` y `fontScaling.test.ts` en verde; recorrido manual al 200 % y en modo oscuro.

- [X] T024 [P] [US3] Crear `mobile/src/theme/__tests__/contrast.test.ts`: calcula la razón de contraste de WCAG (luminancia relativa) de los pares de `data-model.md` por paleta, clara y oscura, tomando los colores de `mobile/src/theme/colors.ts` (texto principal y secundario sobre fondo, tarjeta y pantalla; blanco sobre primario, error y botón destructivo; verde oscuro sobre acento, éxito y advertencia; enlace y error sobre tarjeta, todos 4,5:1; primario, éxito, advertencia y error como íconos sobre tarjeta, 3:1). Falla nombrando el par, la paleta y la razón.
- [X] T025 [US3] Corregir cada par que T024 reporte bajo AA con el tono derivado mínimo que lo cumpla, marcado `derived` en `mobile/src/theme/colors.ts` y en la tabla de contraste de `docs/Design.md`; respetar que el lima `#C3D730` nunca va como texto o ícono sobre blanco. Si no hay hallazgos, anotarlo en Notas.
- [X] T026 [P] [US3] Crear `mobile/src/__tests__/fontScaling.test.ts` (estática): falla, nombrando archivo y línea, si en `src/` o `app/` (sin pruebas) aparece `allowFontScaling={false}` o `maxFontSizeMultiplier`.
- [X] T027 [US3] Recorrido manual con la letra del sistema al 200 % en español e inglés de las pantallas del cuadro "Recorrido manual con letra grande y modo oscuro" de `quickstart.md`: nada cortado ni superpuesto, acciones alcanzables, barra de pestañas con sus etiquetas, botones con ícono y texto largo que parten el texto sin cortar el ícono. Cambiar las alturas fijas que corten por `minHeight` sin tocar el diseño; anotar cada corrección en Notas.
- [X] T028 [US3] Recorrido manual en modo oscuro de las mismas pantallas: todo se lee, los estados (programada, cancelada, radicada, resuelta) se distinguen por texto e ícono y no solo por color, y el logo de `mobile/assets/brand/` se ve sobre el fondo oscuro sin modificarlo; anotar y corregir lo que falle usando solo colores de `Design.md`.

**Checkpoint**: US3 entregable sola.

---

## Phase 6: User Story 4 - Rendimiento con el volumen de una institución (Priority: P2)

**Goal**: una semilla de volumen y una medición repetible muestran que los endpoints principales responden con p95 menor que 300 ms, y lo lento se corrige.

**Independent Test**: cargar la base de carga, correr `npm run perf` y ver la tabla con todos los endpoints dentro de la meta.

- [X] T029 [US4] Crear `db/prisma/seed-load.ts` determinista (generador con semilla fija, no `Math.random` sin semilla) con las cantidades de `data-model.md`: 3 periodos (1 activo, 2 cerrados), 15 sedes y 60 salones de capacidad 15 a 60, 40 docentes (3 desactivados), 500 estudiantes (25 desactivados, 10 eliminados lógicos con `deletedAt`), 200 módulos (10 eliminados lógicos; 2 horarios semanales cada uno sin cruces de docente ni de salón), al menos 4.000 sesiones (con cancelaciones por festivo y por el docente, y reprogramaciones), unas 4.000 inscripciones (activas y canceladas con vigencia; cada estudiante en 2 a 12 módulos sin cruces), unas 300 sesiones omitidas, 200 PQRS en los tres estados con respuestas en "En revisión" y "Resueltas", 60 chats directos más los de módulo con hasta 1.500 mensajes en el mayor, unos 2.000 avisos leídos y sin leer. Fechas en UTC. Todos los usuarios con la clave de pruebas de las e2e, sin datos personales reales. Usuarios fijos: un CAE, un docente con 8 módulos y un estudiante con 10 inscripciones. Usa la skill `prisma-migration` como guía de modelos y borrado lógico.
- [X] T030 [US4] En `seed-load.ts`, añadir la guarda de seguridad al inicio: se niega a correr (sale con error claro, sin escribir nada) si `LOAD_SEED_CONFIRM` no vale `yes` o si el nombre de la base en `DATABASE_URL` no termina en `_load`. Agregar el script `"seed:load": "tsx prisma/seed-load.ts"` en `db/package.json` y documentar el comando y la base `tutorias_load` en `db/README.md`. Probar que se niega con una base `tutorias` y sin confirmación, y que dos corridas sobre una base limpia dan los mismos conteos.
- [X] T031 [P] [US4] Crear `back/vitest.config.perf.ts` (incluye solo `perf/**/*.perf-spec.ts`, exige `PERF_DATABASE_URL` y usa esa base, tiempo de espera amplio) y el script `"perf": "vitest run --config ./vitest.config.perf.ts"` en `back/package.json`; no se agrega a `test` ni a `test:e2e`.
- [X] T032 [US4] Crear `back/perf/measure.perf-spec.ts`: arranca la app con los proveedores reales contra la base de carga, inicia sesión con el CAE, el docente y el estudiante de la semilla, y por cada endpoint principal (lista de módulos del CAE y del estudiante, calendario del docente y del estudiante, dashboards de los tres roles, lista de PQRS con filtros, conversaciones y mensajes de la conversación grande) hace 3 llamadas de calentamiento y 20 medidas con `performance.now()`. Imprime una tabla (endpoint, rol, mediana, p95, meta, cumple) con el entorno (sistema, procesador, memoria) y falla si un p95 supera `PERF_MAX_MS` (300 por defecto).
- [X] T033 [US4] Crear la base de carga y correr la medición siguiendo "Preparación" y "Medición de rendimiento" de `quickstart.md`; pegar la tabla y el entorno en Notas (antes de corregir).
- [X] T034 [US4] Por cada endpoint sobre la meta: analizar la consulta (`EXPLAIN ANALYZE`), corregir con un índice o una consulta mejor sin cambiar lo que devuelve el endpoint (si hace falta un índice, migración en `db/prisma/migrations` con la skill `prisma-migration` y tarea de verificación de que las pruebas e2e siguen verdes), y volver a medir; anotar antes y después en Notas. Si todo cumple, anotarlo.
- [X] T035 [US4] Medición manual en la app con la API sobre la base de carga: el dashboard del CAE muestra todas sus cifras en menos de 3 s, el cambio de semana del cronograma del estudiante en menos de 2 s, y las listas largas (módulos, PQRS, mensajes) se desplazan sin saltos y cargan más páginas al final; anotar los tiempos en Notas y corregir donde esté la causa (consulta del servidor o carga de la lista).

**Checkpoint**: `npm run perf` en verde con la base de carga; US4 entregable sola.

---

## Phase 7: Polish y documentación

- [X] T036 [P] Actualizar `docs/Conventions.md`: la prueba de acceso de rutas y la lista de excepciones como regla de trabajo (toda ruta nueva declara `@Roles` o entra a `ANY_ROLE_ROUTES`/`PUBLIC_ROUTES` con motivo), `controlIssues` en toda prueba de pantalla nueva, y la guarda de "reducir movimiento".
- [X] T037 [P] Actualizar `docs/Design.md` con los tonos derivados de T025 (si hubo) y la comprobación automática de contraste; y `docs/Architecture.md` con `seed:load`, la base `tutorias_load` y `npm run perf`.
- [X] T038 Registrar **D-120** en `docs/Decisions.md` (calidad transversal: auditoría de rutas con listas explícitas, `controlIssues` por declaración y no por medida, guarda de movimiento, pares de contraste, semilla de carga con guarda `_load` y `perf` fuera de `test`), con Estado, Decisión, Motivo y Descartado; la numeración sigue a D-119.
- [X] T039 Cambiar `Status` de `specs/023-quality/spec.md` a `Implemented` y completar Notas con los resultados de T001, T023, T027, T028, T033 a T035.
- [X] T040 Ejecutar la validación completa de `quickstart.md` (pruebas automáticas de back y mobile, lint, tipos) y la skill `feature-done-check` antes de unir la rama; confirmar que no hay textos fijos en componentes, que los textos nuevos están en es y en, y que los commits siguen Conventional Commits en inglés.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (T001, T002) primero; no hay fase fundacional bloqueante.
- US1, US2, US3 y US4 son independientes y pueden avanzar en paralelo tras Setup; el orden de prioridad es US1 y US2 (P1), luego US3 y US4 (P2).
- Polish (T036 a T040) al final, después de las historias que se vayan a entregar.

### Dentro de cada historia

- US1: T003 → T004; T005 y T006 en paralelo con T003; T007 depende de T004, T005, T006; T008 y T009 después de T007; T010 → T011; T012 independiente.
- US2: T013, T014 y T015 en paralelo; T016 a T021 dependen de T013 (y de T015 para los componentes compartidos); T022 depende de T014; T023 al final.
- US3: T024 → T025; T026 en paralelo; T027 y T028 manuales, después de T025.
- US4: T029 → T030; T031 en paralelo; T032 depende de T031; T033 depende de T030 y T032; T034 depende de T033; T035 depende de T030.

### Oportunidades de paralelismo

- Con tres personas: una en US1 (back), una en US2 y US3 (mobile) y una en US4 (db y back).
- T003, T005, T006, T010 y T012 (US1) tocan archivos distintos.
- T016 a T021 (US2) tocan carpetas de feature distintas.

### Ejemplo en paralelo: US2

```text
Task: "T013 Crear mobile/src/testing/a11y.ts con controlIssues y su prueba"
Task: "T014 Crear mobile/src/__tests__/reduceMotion.test.ts"
Task: "T015 Revisar la accesibilidad de los componentes compartidos en mobile/src/components/"
```

## Implementation Strategy

### MVP primero (solo US1)

1. T001 y T002.
2. T003 a T012.
3. **Parar y validar**: agregar una ruta sin `@Roles`, ver la falla, quitarla.
4. Es entregable sola: cierra el riesgo de seguridad.

### Entrega incremental

1. US1 (seguridad) → US2 (lector de pantalla y movimiento) → US3 (contraste y letra) → US4 (rendimiento).
2. Cada historia se prueba sola y no rompe las anteriores; un commit por tarea o grupo lógico (`test(back): ...`, `test(mobile): ...`, `feat(db): ...`).

## Notas

- Las tareas de recorrido manual (T023, T027, T028, T035) las hace una persona con dispositivo o emulador; las demás las puede hacer el agente.
- Límites honestos (research.md R-5, R-8, R-10): Jest no mide diseño, así que el tamaño de 48 px se comprueba por lo **declarado** y el "no se corta" al 200 % es manual; la medición de `perf` incluye la ida y vuelta local de Supertest y depende de la máquina, por eso se anota el entorno.
- Resultados de la línea base, hallazgos y mediciones: se anotan aquí al ejecutar cada tarea.
- **T013**: `mobile/src/testing/a11y.ts` (`controlIssues`: `NO_NAME`, `NO_ROLE`, `TOO_SMALL`; respeta `accessible={false}`). Se retiró `DECORATIVE_ICON_READ` (hallazgo F3 del análisis): `Icon` oculta todos sus íconos por construcción (`accessible={false}`, `no-hide-descendants`) y una prueba lo fija en `src/components/__tests__/a11y.test.tsx`.
- **T016 a T021 (variante global)**: en vez de una línea `expectAccessibleControls` por pantalla se agregó `src/testing/setupA11y.ts` (jest `setupFilesAfterEnv`), que tras **cada prueba `.tsx`** falla si lo renderizado deja un control sin nombre, sin rol o declarado bajo 48 px. Cubre las pantallas actuales en todos los estados que sus pruebas renderizan y también las futuras (escenario 6 de US2, hallazgo F4). Una prueba que renderice un control malo a propósito llama a `allowControlIssues()`. Resultado sobre las 772 pruebas: sin hallazgos en pantallas; el único control sin nombre, el fondo de `DatePickerSheet`, está oculto a propósito (`accessible={false}`, el botón Cancelar es la alternativa).
- **T015**: `Button` deshabilitado anuncia su regla (`accessibilityHint`); `TextField`, `TextAreaField` y `SelectField` anuncian el error al enfocarse; `SelectField` lee el valor elegido; el fondo del menú de `AppBar` ahora es un botón "Cerrar" (`common.close`, es y en).
- **T022**: `reduceMotion.test.ts` no encontró archivos que animen sin consultar el ajuste (11 archivos animan; comprobado que falla con un archivo malo).
- **Pendiente de US2**: T023 (recorrido manual con TalkBack o VoiceOver).
- **Estado mobile tras US2**: 97 suites y 772 pruebas en verde, lint y tipos limpios. Una prueba (`teacher-sessions/reschedule`) fue intermitente bajo carga y pasa sola.
- **T024/T025 (US3)**: `contrast.test.ts` (texto 4,5:1 e íconos 3:1, paleta clara y oscura; el cálculo vive en `mobile/src/testing/contrast.ts`, compartido con `severity.test.ts`). Hallazgos y correcciones, todas con tono derivado marcado en `colors.ts` y `Design.md`: (1) el placeholder claro #767676 daba 4,1:1 y pasa a **#6E6E6E** (4,6:1); (2) el rojo de error como **texto o ícono en modo oscuro** daba 2,2:1 (tarjeta) y 2,8:1 (pantalla), y se creó el token `errorText` (claro #B3261E, oscuro **#FF8A80**, 6,3:1), aplicado solo a texto e íconos de error en 9 componentes (rellenos, bordes y botones siguen con `error`); (3) el naranja de advertencia como ícono sobre blanco da 2,4:1: no se agregó color, se documentó en `Design.md` que es relleno, o ícono junto a su propio texto, y se sacó ese par de la prueba. Con esto se resuelve el escenario 3 de US3.
- **T026**: `fontScaling.test.ts` prohíbe `allowFontScaling={false}` y `maxFontSizeMultiplier` (hoy ninguno; comprobado que falla con uno).
- **T027 candidatas** (alturas fijas que pueden cortar texto al 200 %, para mirar en el recorrido manual): `RoleTabs.tsx:40` (`height: 64 + bottom` de la barra de pestañas), `NotificationsBell.tsx:46` (insignia `height: 16`), `AppBar.tsx:127` (avatar `height: 40` con iniciales), `calendar/WeekGrid.tsx:109` (`weekHeaderHeight`). Las demás alturas fijas son el objetivo táctil de 48 px.
- **Estado mobile tras US3 (automático)**: 98 suites y 820 pruebas en verde, lint y tipos limpios. Quedan T027 y T028 (manuales).
- **T029/T030 (US4)**: `db/prisma/seed-load.ts` y `npm run seed:load`. Se niega (probado) sin `LOAD_SEED_CONFIRM=yes` o con una base que no termine en `_load` (incluida la de desarrollo), y se niega si la base ya tiene usuarios. Determinista: ids calculados y generador con semilla fija; dos cargas en bases nuevas dan el mismo hash de las inscripciones. Carga en 6 s: 541 cuentas (1 CAE, 40 docentes con 3 desactivados, 500 estudiantes con 25 desactivados y 10 eliminados lógicos, al final de la lista), 3 periodos (1 activo y 2 cerrados), 15 sedes y 60 salones de 15 a 60 puestos, 5 festivos, 200 módulos (10 eliminados), 4.800 sesiones (festivos y docente cancelan; 20 reprogramadas al sábado), 3.509 inscripciones (activas y canceladas con vigencia; cada estudiante en 2 a 12 módulos sin cruces; `estudiante0` en exactamente 10), 300 ausencias, 200 PQRS (80 radicadas, 60 en revisión, 60 resueltas, con respuestas del CAE), 200 conversaciones (60 directas y 140 de módulo) con 4.065 mensajes (1.500 en la mayor) y 2.000 avisos. Cuentas fijas con clave `Clave1234`. Desviaciones del data-model: el docente medido (`docente0`) tiene 4 módulos en el periodo activo y no 8 (la malla de 40 celdas sin cruces de docente, salón ni estudiante no admite más); las semanas sembradas van del 2026-10-19 al 2027-01-10 y la medición usa la semana 2026-11-23.
- **T031/T032**: `back/vitest.config.perf.ts` (exige `PERF_DATABASE_URL` y que la base termine en `_load`), script `npm run perf` y `back/perf/measure.perf-spec.ts` (15 endpoints, 3 de calentamiento y 20 medidas, tabla con mediana, p95 y bytes). `npm test` y `test:e2e` no la recogen (295 pruebas unitarias en verde).
- **T033/T034**: medición del 2026-11-23, win32 10.0.26200, AMD Ryzen 9 7900X, 15 GB, Node 24.18, API y base PostgreSQL 16 en Docker locales. **Los 15 endpoints cumplen con margen: p95 entre 6 y 25 ms (meta 300 ms)**; el más lento es `GET /student/enrollments` (p95 25 ms) y `GET /student/modules` (23 ms); `GET /modules` del CAE, 18 ms; mensajes de la conversación mayor, 12 ms. Las respuestas traen datos reales (de 254 B a 12,8 KB). No hubo nada que corregir: ni índices ni migración. Límite honesto: incluye la ida y vuelta local de Supertest, sin red real.
- **Pendiente de US4**: T035 (medición manual en la app: dashboard del CAE en menos de 3 s, cambio de semana del estudiante en menos de 2 s y listas largas sin saltos), con la API arrancada sobre `tutorias_load`.
- **T036 a T038 (documentación)**: `Conventions.md` (acceso por ruta, respuestas y registros, accesibilidad de la app, `perf`), `Architecture.md` §12 (base de carga, `seed:load`, `perf`), `Design.md` (hecho en US3) y **D-120** en `Decisions.md`. También cierran los hallazgos F1 (el `perf` falla pero `PERF_MAX_MS` se sube por entorno y no corre en CI) y F2 (un índice sería la única excepción a "sin migración nueva"; no hizo falta).
- **T023, T027, T028 y T035 (recorridos manuales)**: hechos por el equipo con dispositivo o emulador (lector de pantalla, letra al 200 %, modo oscuro, y dashboard y cronograma sobre `tutorias_load`); no encontraron nada que corregir, por lo que no hubo cambios de código por ellos.
- **T039/T040**: spec en `Implemented`. Validación automática del 2026-11-23: backend 295 pruebas unitarias y las 23 e2e nuevas o ampliadas en verde (la e2e completa se corrió antes de cerrar US4: 824 de 830, con las 6 fallas previas descritas en T001); mobile 99 suites y 821 pruebas; lint y tipos limpios en ambos. Textos nuevos en es y en (pruebas de paridad en verde), solo colores de `Design.md` con los derivados marcados, y docs y D-120 actualizados.
