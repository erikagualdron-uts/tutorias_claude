---

description: "Task list for Pulido de PQRS, dashboards y pruebas"
---

# Tasks: Pulido de PQRS, dashboards y pruebas

**Input**: Design documents from `/specs/020-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/changes.md, quickstart.md

**Tests**: Incluidas. La constitución (Principios IV y V) y `docs/Conventions.md` §6 exigen pruebas de roles y de contrato; aquí se suman las de las piezas nuevas (número de radicado, pasos de la línea de tiempo, insignia, conteo animado) y la del campo aditivo del backend. Se escriben primero y deben fallar antes de implementar.

**Organization**: Tareas agrupadas por historia de usuario. US1 y US2 son P1; US3 y US4 son P2; US5 es P3. **No cambia `tutorias_uts_db`** (sin migración); cambian `tutorias_uts_mobile`, `tutorias_uts_back` (un campo) y `Claude/docs`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[Story]**: US1 confirmación al radicar, US2 línea de tiempo, US3 insignia del CAE, US4 conteo animado, US5 suite estable
- Las rutas llevan el nombre del repositorio hermano al inicio

## Path Conventions

- `tutorias_uts_back/` = API NestJS; pruebas unitarias junto al código (`*.spec.ts`) y e2e en `test/`
- `tutorias_uts_mobile/` = app Expo; rutas en `app/`, código en `src/`, pruebas en `__tests__/` y ayudas de prueba en `testing/` (una ayuda dentro de `__tests__/` falla: Jest la toma por una prueba sin casos)
- `Claude/` = `docs/` y `specs/`
- Textos visibles solo en `tutorias_uts_mobile/src/i18n/es.json` y `en.json`; nunca en componentes
- Íconos solo Iconify (set `solar`), declarados en `tutorias_uts_mobile/src/icons/registry.ts`; todo botón lleva ícono a la izquierda y 16 px entre botones apilados
- Colores, fuentes y espacios solo con los tokens de `@/theme`; nunca hexadecimales, `fontFamily` ni `fontWeight` en componentes; el estado nunca se indica solo por color; objetivos táctiles de 48 px como mínimo
- Backend: `npm run test`, `npm run test:e2e`, `npm run lint`; app: `npm run lint`, `npm run typecheck`, `npm test`
- Las fechas salen en UTC y se muestran en `America/Bogota` con `bogotaParts` (`src/features/modules/format.ts`); una fecha ausente nunca se reemplaza ni se inventa
- Esta versión de Testing Library es asíncrona: `await render(...)`, `await fireEvent.press(...)`; el `screen` es el del último `render`
- Las pruebas e2e y las de la app no se ejecutan en paralelo entre sí ni con la API de desarrollo en marcha (base de datos y cola de Redis compartidas)
- Al escribir archivos largos, usar la herramienta de escritura de archivos; un heredoc de shell con apóstrofos falla
- Los archivos de `docs/` con terminaciones CRLF conservan CRLF
- Tras cambiar el registro de íconos, reiniciar Metro con `npx expo start -c`

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Lo que comparten las historias de PQRS: el número de radicado y el tipo con las fechas

### Tests for Foundational ⚠️

- [X] T001 [P] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/code.test.ts` (debe fallar): `pqrsCode('a1b2c3d4-0000-4000-8000-000000000001')` es `'A1B2C3D4'`; siempre tiene 8 caracteres de `[0-9A-F]`; no depende de los guiones ni de mayúsculas o minúsculas; el mismo identificador siempre da el mismo código y dos identificadores distintos en sus 8 primeros caracteres dan códigos distintos

### Implementation for Foundational

- [X] T002 Crear `tutorias_uts_mobile/src/features/pqrs/code.ts` con `pqrsCode(id: string): string` (los 8 primeros caracteres del identificador sin guiones, en mayúsculas)
- [X] T003 [P] Cambiar en `tutorias_uts_mobile/src/api/types.ts` `PqrsDetail` para que lleve `reviewedAt: string | null` y `resolvedAt: string | null`, y quitar esos dos campos de `PqrsAdminDetail` (ya los hereda)

**Checkpoint**: El número y el tipo están listos; las historias pueden empezar.

---

## Phase 2: User Story 1 - Confirmación al radicar una PQRS (Priority: P1) 🎯 MVP

**Goal**: Al radicar, el autor ve una pantalla con el número de radicado, la fecha y el estado, y puede abrir la PQRS o volver a la lista; el mismo número aparece en la lista y el detalle.

**Independent Test**: Radicar una PQRS y comprobar la confirmación, que el número coincide en la lista y el detalle, y que "Ver mi PQRS" abre ese detalle.

### Tests for User Story 1 ⚠️

- [X] T004 [P] [US1] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/PqrsFiledScreen.test.tsx` (debe fallar): muestra el número (`pqrsCode(id)`), la fecha en `America/Bogota` y el estado "Radicada" con texto; "Ver mi PQRS" abre el detalle de esa PQRS y "Volver a mis PQRS" abre la lista, con la ruta del estudiante o la del docente según el rol de la sesión; los textos salen en español e inglés
- [X] T005 [P] [US1] Añadir a `tutorias_uts_mobile/src/features/pqrs/__tests__/NewPqrsScreen.test.tsx` que al radicar bien la app hace `router.replace` a la confirmación con `id`, `createdAt` y `status` de la respuesta (y no `router.back`), que un reintento con la misma respuesta lleva al mismo número y que, si falla, no hay confirmación y el formulario conserva lo escrito
- [X] T006 [P] [US1] Añadir a `tutorias_uts_mobile/src/features/pqrs/__tests__/MyPqrsScreen.test.tsx` y `AdminPqrsScreen.test.tsx` que cada tarjeta de la lista muestra "N.º" con el mismo número que `pqrsCode(id)`, y que los detalles del autor y del CAE (`PqrsBody`) lo muestran igual

### Implementation for User Story 1

- [X] T007 [P] [US1] Añadir los textos a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`pqrs.filed.title`, `pqrs.filed.number`, `pqrs.filed.date`, `pqrs.filed.view`, `pqrs.filed.back`, `pqrs.code` con la etiqueta "N.º"/"No.") con las claves ordenadas, y ejecutar `check_i18n.py`
- [X] T008 [US1] Crear `tutorias_uts_mobile/src/features/pqrs/screens/PqrsFiledScreen.tsx`: lee `id`, `createdAt` y `status` de los parámetros; muestra el ícono de éxito, el título, el número de radicado con el tipo de letra de código del tema (`typography.code`), la fecha con `bogotaParts` y `StatusBadge`; botón "Ver mi PQRS" (ícono a la izquierda) hacia `${base}/[id]` y botón "Volver a mis PQRS" hacia `${base}`, con 16 px entre ellos y el mismo `base` por rol que `MyPqrsScreen.tsx`
- [X] T009 [P] [US1] Crear las rutas `tutorias_uts_mobile/app/(student)/pqrs/filed.tsx` y `app/(teacher)/pqrs/filed.tsx` que exportan `PqrsFiledScreen`
- [X] T010 [US1] Cambiar `tutorias_uts_mobile/src/features/pqrs/screens/NewPqrsScreen.tsx`: el `onSuccess` de `create.mutate` hace `router.replace` a `${base}/filed` con `id`, `createdAt` y `status` de la respuesta, en lugar de `router.back()`
- [X] T011 [P] [US1] Mostrar el número en `tutorias_uts_mobile/src/features/pqrs/components/PqrsCard.tsx` (una línea `N.º A1B2C3D4` con `typography.code`) y en `PqrsBody.tsx` bajo el asunto, con `pqrsCode(pqrs.id)`

**Checkpoint**: US1 funciona y se prueba sola; es el MVP.

---

## Phase 3: User Story 2 - Línea de tiempo del estado (Priority: P1)

**Goal**: El detalle de una PQRS, para el autor y el CAE, muestra una línea de tiempo vertical con los tres pasos, el actual resaltado y la fecha y hora de cada paso cumplido.

**Independent Test**: Con tres PQRS, una en cada estado, abrir cada detalle y comprobar pasos, fechas y paso actual.

### Tests for User Story 2 ⚠️

- [X] T012 [P] [US2] Añadir a `tutorias_uts_back/test/pqrs-mine.e2e-spec.ts` (debe fallar): el detalle del autor devuelve `reviewedAt` y `resolvedAt` como `null` en una PQRS "Radicada", `reviewedAt` en fecha y `resolvedAt` en `null` en una "En revisión", y ambas en fecha en una "Resuelta"; una PQRS ajena sigue respondiendo `404 PQRS_NOT_FOUND`; el CAE y los roles ajenos siguen recibiendo `403`
- [X] T013 [P] [US2] Actualizar `Claude/specs/017-pqrs/contracts/pqrs-api.yaml`: el esquema `PqrsMineDetail` agrega `reviewedAt` y `resolvedAt` (`type: string, format: date-time, nullable: true`, obligatorios) y comprobar en `tutorias_uts_back/test/pqrs-contract.e2e-spec.ts` que el detalle del autor se valida contra él también en "En revisión" y "Resuelta"
- [X] T014 [P] [US2] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/timeline.test.ts` (debe fallar) para `timelineSteps(pqrs)`: una "Radicada" da `FILED` cumplido y actual con `createdAt`, y los otros dos pendientes sin fecha; una "En revisión" da dos cumplidos con su fecha y el segundo actual; una "Resuelta" da los tres cumplidos y el tercero actual; un paso cumplido con fecha `null` queda cumplido con `at` nulo y nunca con una fecha inventada
- [X] T015 [P] [US2] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/StatusTimeline.test.tsx` (debe fallar): dibuja los tres pasos en orden con nombre en texto (`pqrs.status.*`) y un ícono cada uno, la fecha y hora de Bogotá en los cumplidos, el paso actual marcado con texto y no solo con color, los pendientes sin fecha; un paso cumplido sin fecha se muestra sin hora; y el detalle del autor y el del CAE incluyen la línea de tiempo

### Implementation for User Story 2

- [X] T016 [US2] Modificar `tutorias_uts_back/src/pqrs/pqrs.service.ts`: la función `detail(p)` del autor incluye `reviewedAt: p.reviewedAt` y `resolvedAt: p.resolvedAt` (mismos campos y orden que `adminDetail`); sin tocar guards, consultas ni propiedad
- [X] T017 [P] [US2] Crear `tutorias_uts_mobile/src/features/pqrs/timeline.ts` con `timelineSteps(pqrs)` (según [data-model.md](data-model.md): `step`, `at`, `done`, `current`)
- [X] T018 [P] [US2] Añadir los textos de la línea de tiempo a `tutorias_uts_mobile/src/i18n/es.json` y `en.json` (`pqrs.timeline.title`, `pqrs.timeline.current`, `pqrs.timeline.pending`, `pqrs.timeline.noTime`) y ejecutar `check_i18n.py`
- [X] T019 [US2] Crear `tutorias_uts_mobile/src/features/pqrs/components/StatusTimeline.tsx`: columna vertical con un ícono por paso (`pqrs`, `clock`, `success` del registro), nombre en texto, fecha con `bogotaParts` y una línea conectora entre pasos; el cumplido en color primario, el actual en negrita con la etiqueta "Actual", el pendiente atenuado; cada paso con `accessibilityLabel` completo (nombre, estado y fecha)
- [X] T020 [US2] Mostrar `StatusTimeline` en `tutorias_uts_mobile/src/features/pqrs/components/PqrsBody.tsx` entre la descripción y las respuestas, de modo que lo vean `PqrsDetailScreen` y `AdminPqrsDetailScreen`

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 4: User Story 3 - PQRS radicadas a la vista del CAE (Priority: P2)

**Goal**: La pestaña "PQRS" del CAE muestra una insignia con la cantidad de PQRS radicadas, oculta en cero y `99+` desde 100.

**Independent Test**: Radicar PQRS, entrar como CAE, ver la cantidad; pasar una a "En revisión" y comprobar que baja.

### Tests for User Story 3 ⚠️

- [ ] T021 [P] [US3] Escribir `tutorias_uts_mobile/src/features/pqrs/__tests__/filedBadge.test.tsx` (debe fallar): `badgeLabel(0)` es `undefined`, `badgeLabel(7)` es `'7'`, `badgeLabel(99)` es `'99'` y `badgeLabel(100)` es `'99+'`; `useFiledCount` pide `/pqrs?status=FILED&limit=1` y devuelve `meta.total`, devuelve 0 si la consulta falla y no muestra error; su clave de consulta empieza por `['pqrs']` para que las acciones del CAE que ya invalidan `['pqrs']` la actualicen
- [ ] T022 [P] [US3] Escribir `tutorias_uts_mobile/src/features/shell/__tests__/RoleTabs.test.tsx` (debe fallar): una pestaña con `badge` mayor que 0 lleva `tabBarBadge` con fondo de error y número blanco, sin `badge` o con 0 no lleva insignia, y solo la pestaña que la recibe la muestra (las de docente y estudiante no)

### Implementation for User Story 3

- [ ] T023 [US3] Crear `tutorias_uts_mobile/src/features/pqrs/hooks/useFiledCount.ts`: `useFiledCount()` con `useQuery` sobre `/pqrs?status=FILED&limit=1` (clave `['pqrs', 'admin', 'filed-count']`), `refetchInterval` de 60 s y refresco al volver la app a primer plano (mismo patrón de `useUnreadCount.ts`), que devuelve `meta.total` o 0; y `badgeLabel(count)` en el mismo archivo
- [ ] T024 [US3] Modificar `tutorias_uts_mobile/src/features/shell/RoleTabs.tsx`: `TabSpec` gana `badge?: number` y la pestaña lo traduce a `tabBarBadge` con `badgeLabel`, `tabBarBadgeStyle` de fondo `palette.error`, texto `palette.onError` y mínimo de 16 px (`Design.md`, "Unread tab badge")
- [ ] T025 [US3] Modificar `tutorias_uts_mobile/app/(admin)/_layout.tsx` para llamar a `useFiledCount()` y pasar `badge` a la pestaña `pqrs`; los layouts de docente y estudiante no cambian

**Checkpoint**: US3 funciona; US1, US2 y US3 son independientes.

---

## Phase 5: User Story 4 - Cifras que cuentan hacia arriba (Priority: P2)

**Goal**: Las tarjetas de métrica cuentan de 0 a su valor una sola vez en la primera carga, sin repetirse y sin movimiento si el dispositivo pide reducirlo.

**Independent Test**: Abrir un dashboard, ver el conteo; refrescar sin repetirlo; activar "reducir movimiento" y verlo sin conteo.

### Tests for User Story 4 ⚠️

- [ ] T026 [P] [US4] Escribir `tutorias_uts_mobile/src/features/dashboard/__tests__/useCountUp.test.tsx` (debe fallar) con temporizadores simulados: con valor 40 arranca en 0, sube sin retroceder y termina exactamente en 40 a los 600 ms; si el valor pasa a 45 después, muestra 45 de inmediato sin volver a 0; con "reducir movimiento" muestra el valor final desde el primer cuadro; un valor no numérico o con decimales se devuelve tal cual; si el valor cambia durante el conteo, termina en el más reciente
- [ ] T027 [P] [US4] Actualizar `tutorias_uts_mobile/src/features/dashboard/__tests__/components.test.tsx` (debe fallar): `MetricCard` expone un `accessibilityLabel` con el valor final y la etiqueta (`40 Estudiantes activos`) desde el primer cuadro, incluso mientras cuenta

### Implementation for User Story 4

- [ ] T028 [US4] Crear `tutorias_uts_mobile/src/features/dashboard/hooks/useCountUp.ts` con `useCountUp(value)`: un entero no negativo sube de 0 a su valor en 600 ms (`requestAnimationFrame`, curva de salida suave), solo en el primer montaje; los cambios posteriores devuelven el valor nuevo de inmediato; con `useMotion().movement` en falso devuelve el valor final; cualquier otro valor se devuelve sin cambios; limpia el cuadro pendiente al desmontar
- [ ] T029 [US4] Modificar `tutorias_uts_mobile/src/features/dashboard/components/MetricCard.tsx` para mostrar `useCountUp(value)` y poner `accessibilityLabel={`${value} ${label}`}` en la tarjeta (también la que no se pulsa) con `accessible`, de modo que el lector de pantalla lea el valor final y no los intermedios
- [ ] T030 [US4] Ajustar las pruebas existentes de los dashboards (`AdminDashboardScreen.test.tsx`, `TeacherDashboardScreen.test.tsx`, `StudentHomeScreen.test.tsx`, `dashboard-links.test.tsx` en `tutorias_uts_mobile/src/features/dashboard/__tests__/`) para que esperen el valor final con `findBy*` o con los temporizadores simulados, ya que ahora el número aparece contando

**Checkpoint**: Las cuatro historias de comportamiento funcionan.

---

## Phase 6: User Story 5 - Una suite de pruebas estable (Priority: P3)

**Goal**: La suite completa de la app pasa de forma repetible, sin tiempos agotados.

**Independent Test**: Correr `npm test` tres veces seguidas en la app sin fallos.

- [ ] T031 [US5] Añadir `"testTimeout": 15000` a la clave `jest` de `tutorias_uts_mobile/package.json`, sin cambiar el contenido de `src/features/modules/__tests__/module-form.test.tsx`
- [ ] T032 [US5] Correr `npm test` en `tutorias_uts_mobile` tres veces seguidas (en paralelo, sin `--runInBand`) y anotar el resultado en las notas de este archivo; si falla alguna prueba por tiempo agotado, subir el valor o aislar la prueba y volver a correr

**Checkpoint**: Las cinco historias funcionan.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentación, decisión, revisión y cierre

- [ ] T033 [P] Actualizar `Claude/docs/Design.md`: quitar de "Not built yet" de PQRS el número de radicado, la línea de tiempo y la insignia de la pestaña (dejar "Notificar usuario" y "Responder por correo"), y describir la pantalla de confirmación, la línea de tiempo (iconos, pasos, fechas y paso actual con texto), el número de radicado (`typography.code`) y el conteo animado de las tarjetas
- [ ] T034 [P] Actualizar `Claude/docs/Architecture.md`: el detalle del autor (`GET /pqrs/mine/:id`) incluye `reviewedAt` y `resolvedAt`; la insignia del CAE usa `GET /pqrs?status=FILED&limit=1`; el número de radicado se calcula en la app a partir del identificador
- [ ] T035 [P] Actualizar `Claude/docs/Context.md` en la sección de PQRS: el autor recibe un número de radicado (código de 8 caracteres derivado del identificador, no consecutivo) y ve la línea de tiempo del estado con las fechas de cada paso
- [ ] T036 Registrar en `Claude/docs/Decisions.md` D-117 (pulido: número de radicado derivado del identificador sin dato nuevo y con colisión teórica aceptada, fechas de los pasos entregadas también al autor, insignia con la consulta del CAE de una fila, conteo animado propio sin librería y `testTimeout` global), con su motivo y lo descartado
- [ ] T037 [P] Comprobar en `tutorias_uts_back` y `tutorias_uts_mobile` que `npm run test`, `npm run lint`, `npm run typecheck` y `python .claude/skills/i18n-strings/scripts/check_i18n.py <es.json> <en.json>` dan resultado limpio, que no hay hexadecimales, `fontFamily`, `fontWeight` ni librerías de íconos distintas de Iconify en los componentes nuevos, y que `grep` de `Unidades Tecnológicas` no encuentra nada
- [ ] T038 Correr las e2e del backend de PQRS (`pqrs-mine`, `pqrs-contract`, `pqrs-roles`) con la base de datos de prueba y anotar el resultado
- [ ] T039 Recorrer los 16 escenarios de `specs/020-polish/quickstart.md` en español e inglés con la app y la API en marcha y anotar el resultado en ese archivo, incluidos SC-002 (paso de la PQRS en menos de 5 s) y SC-004 (conteo en menos de un segundo, sin repetirse)
- [ ] T040 Ejecutar la habilidad `feature-done-check` (spec, pruebas, lint y tipos, textos es/en, diseño, documentación y decisiones) y corregir lo que reporte
- [ ] T041 Cambiar `Status` de `specs/020-polish/spec.md` a `Implemented`, marcar las tareas de esta lista y abrir los Pull Requests de la rama `020-polish` a la rama principal: `tutorias_uts_back` y `tutorias_uts_mobile` contra `main` y `Claude` contra `master`; `tutorias_uts_db` no lleva PR porque esta spec no lo cambia

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: sin dependencias; bloquea US1 y US2. T002 depende de T001; T003 es independiente.
- **US1 y US2** (P1) empiezan tras la fase 1 y no dependen entre sí, salvo que ambas tocan `PqrsBody.tsx` (T011 y T020): hacer T011 antes de T020 o resolver el cruce al unir.
- **US3, US4 y US5** no dependen de las demás ni entre sí; US3 solo toca la barra y un gancho; US4 solo el dashboard; US5 solo `package.json`.
- **Polish**: depende de las historias que se quieran entregar; T039 a T041 van al final y en ese orden.

### Dentro de cada historia

- Las pruebas primero y deben fallar; luego la pieza pura, el componente, la pantalla o ruta y los textos.
- El campo del backend (T016) y su contrato (T013) deben estar antes de T020 en un entorno real, aunque las pruebas de la app usan respuestas simuladas.

### Parallel Opportunities

- Fase 1: T001 y T003 juntas.
- US1: T004, T005, T006 y T007 en paralelo; T009 y T011 en paralelo tras T008.
- US2: T012 a T015 en paralelo; T017 y T018 en paralelo.
- US3: T021 y T022 en paralelo. US4: T026 y T027 en paralelo.
- Dos personas pueden llevar el backend (T012, T013, T016) y la app (el resto) a la vez, con `contracts/changes.md` como acuerdo; US3, US4 y US5 se pueden repartir por completo.

### Parallel Example: User Story 1

```text
T004 PqrsFiledScreen.test.tsx   T005 NewPqrsScreen.test.tsx   T006 listas y detalles   T007 textos es/en
T009 rutas filed.tsx            T011 número en PqrsCard y PqrsBody
```

## Implementation Strategy

- **MVP**: Fase 1 y US1 (confirmación con número). Se puede probar y mostrar sola.
- **Entrega incremental**: US2 (con el único campo de backend), luego US3, US4 y US5; cada una se prueba sin las siguientes.
- Un commit por tarea o grupo pequeño, en formato Conventional Commits (`feat(pqrs): ...`, `feat(dashboard): ...`, `test(app): ...`), y la rama `020-polish` en cada repositorio que cambie.
- Si el conteo animado falla en la suite (temporizadores), se prefiere `jest.useFakeTimers()` en esas pruebas antes que cambiar la duración de 600 ms.

## Notas de implementación (2026-11-22)

- **Primera pasada**: fundamentos, US1 y US2 en la app y el backend. Pendientes: US3 (insignia), US4 (conteo animado), US5 (suite estable) y el cierre (T021 a T041).
- **Backend** (commit `11831f3`): 285 pruebas unitarias, lint y tipos en verde; las 8 e2e de PQRS pasan (87 de 87) con el campo aditivo `reviewedAt` y `resolvedAt` del detalle del autor y el contrato de la 017 actualizado.
- **App** (commits `fec8721` y el de la línea de tiempo): lint, tipos y paridad es/en (750 claves) en verde; suite completa en serie 678 de 678.
- La pantalla de confirmación toma `id`, `createdAt` y `status` de los parámetros de la ruta; no hace otra consulta. El formulario usa `router.replace` para que "atrás" no regrese a un formulario ya enviado.
- Al mostrar la línea de tiempo en `PqrsBody`, el estado actual aparece dos veces en el detalle (insignia y paso actual); la prueba del autor ahora espera dos coincidencias.
- Las pantallas no se han visto corriendo en un simulador.

