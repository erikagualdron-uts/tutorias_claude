# Tasks: Avisos por correo para docentes y CAE

**Input**: `specs/025-staff-email-notices/` (plan.md, spec.md, research.md, data-model.md, quickstart.md)

**Prerequisites**: plan.md, spec.md

**Tests**: se piden en la spec (FR-008) y la constitución (V): la prueba del docente se escribe primero y debe fallar con el código actual.

**Repositorios**: código en `tutorias_uts_back` (rama `025-staff-email-notices` desde `origin/main`); documentos en `Claude` (rama `025-staff-email-notices`, ya creada).

## Formato: `[ID] [P?] [Story] Descripción`

## Phase 1: Setup

- [X] T001 En `tutorias_uts_back`, crear la rama `025-staff-email-notices` desde `origin/main` (hoy está en `023-quality`, ya fusionada) y comprobar que `npm test` y `npm run lint` pasan antes de tocar nada.

> Sin fase fundacional: no hay migración, llaves de configuración ni dependencias nuevas (`auth.studentEmailDomain` y `auth.staffEmailDomain` ya existen).

---

## Phase 2: User Story 1 - Un docente recibe por correo los avisos de su PQRS (P1) 🎯 MVP

**Goal**: el docente autor de una PQRS recibe el correo de cada cambio de estado y de cada respuesta, en su idioma y sin el texto de la respuesta.

**Independent Test**: `npx vitest run --config ./vitest.config.e2e.ts test/notifications-staff-email` pasa; antes de T004 falla con `EMAIL_DOMAIN_NOT_ALLOWED`.

- [X] T002 [US1] Crear `tutorias_uts_back/test/notifications-staff-email.e2e-spec.ts` con el patrón de `test/pqrs-notifications.e2e-spec.ts` (`teacherCaller`, `adminCaller`, `createPqrs`, `ctx.runOutbox()`, `DeliveriesService`, `FakeMailTransport`): un docente radica una PQRS, el CAE la pasa a revisión, la responde y la resuelve; se entrega el correo de cada aviso y se comprueba que los 3 quedan `SENT` a la dirección del docente, en español, y uno en inglés cuando el idioma del docente es `en`, sin el texto de la respuesta en el cuerpo.
- [X] T003 [US1] Ejecutar la prueba de T002 y confirmar que **falla** con `EMAIL_DOMAIN_NOT_ALLOWED` (código actual).
- [X] T004 [US1] En `tutorias_uts_back/src/notifications/deliveries.service.ts`, `deliverEmail`: leer `auth.studentEmailDomain` y `auth.staffEmailDomain` y omitir con `EMAIL_DOMAIN_NOT_ALLOWED` solo si `hasEmailDomain(user.email, …)` no coincide con ninguno (o no hay dirección). No tocar el resto del método ni alterar el orden de sus comprobaciones (cuenta no disponible, dominio, SMTP).
- [X] T005 [US1] Ejecutar la prueba de T002 y confirmar que **pasa**; en el mismo archivo añadir el caso de SMTP sin configurar (la entrega del docente queda pendiente, no `FAILED`) y el de cuenta del docente desactivada (`ACCOUNT_UNAVAILABLE`, sin cambios).

**Checkpoint**: un docente recibe los 3 correos de su PQRS.

---

## Phase 3: User Story 2 - La regla vale para cualquier cuenta institucional (P1)

**Goal**: se decide por dominio, no por rol; dominios ajenos siguen omitidos y el cambio de configuración aplica al siguiente aviso.

**Independent Test**: los casos nuevos de `notifications-staff-email` pasan junto con los de T005.

- [X] T006 [US2] En `test/notifications-staff-email.e2e-spec.ts` añadir: (a) una cuenta del CAE (`cae@correo.uts.edu.co`) con un aviso creado directo en la base se envía por la misma regla; (b) cuentas con dominio ajeno (`@gmail.com`), subdominio parecido (`@otra.correo.uts.edu.co`) y texto añadido (`@correo.uts.edu.co.example.com`) quedan `SKIPPED` con `EMAIL_DOMAIN_NOT_ALLOWED` y su aviso de bandeja existe; (c) correo con mayúsculas y espacios se compara normalizado; (d) escribir `auth.staffEmailDomain` en la tabla `settings` cambia la decisión del siguiente envío sin reiniciar.
- [X] T007 [P] [US2] En `test/notifications-delivery-email.e2e-spec.ts` (~línea 152) renombrar la prueba "skips an email of a domain that is not the student domain..." a "...not an institutional domain..." (sigue usando `estudiante@gmail.com`).
- [X] T008 [US2] Ejecutar `npx vitest run --config ./vitest.config.e2e.ts test/notifications-staff-email test/notifications-delivery-email` y confirmar que pasan.

**Checkpoint**: la regla cubre estudiante, docente, CAE y dominio ajeno.

---

## Phase 4: User Story 3 - Nada se reenvía y los estudiantes no cambian (P2)

**Goal**: no hay reenvío retroactivo, los estudiantes siguen igual y los registros no filtran datos.

**Independent Test**: `notifications-delivery-email` y `log-redaction` pasan sin cambios de comportamiento.

- [X] T009 [US3] En `test/notifications-staff-email.e2e-spec.ts` añadir el caso de una entrega ya `SKIPPED` antes del cambio: tras correr el envío sigue `SKIPPED` (solo se procesan `PENDING`, FR-005).
- [X] T010 [US3] En `test/notifications-staff-email.e2e-spec.ts` añadir el caso de registros: capturar los registros del servidor durante la entrega del correo del docente (como hace `test/log-redaction.e2e-spec.ts`) y comprobar que no contienen su dirección, contraseñas ni el texto de la respuesta. `log-redaction.e2e-spec.ts` no se modifica.
- [X] T011 [US3] Ejecutar `npx vitest run --config ./vitest.config.e2e.ts test/notifications-delivery-email test/log-redaction` y confirmar que las pruebas de estudiante (incluido SMTP sin configurar y cuenta desactivada) pasan sin modificar sus expectativas.

---

## Phase 5: Polish y documentación

- [X] T012 [P] En `Claude/docs/Context.md` documentar a quién se le escribe por correo: cualquier cuenta activa con dirección del dominio de estudiantes o del personal (ambos de configuración); otra dirección se omite con su motivo; el CAE no recibe avisos nuevos con esta spec (FR-009).
- [X] T013 [P] En `Claude/docs/Decisions.md` registrar **D-122**: el correo de avisos sigue la regla de dominios institucionales y no el rol; alternativas descartadas (quitar la comprobación, decidir por rol, lista administrable de direcciones).
- [X] T014 En `tutorias_uts_back` ejecutar `npm test`, `npm run lint` y `npm run build`; ejecutar todo `quickstart.md` y confirmar SC-005 (nada que pasaba deja de pasar; el `zz-worker-smoke` ya es inestable, ver nota).
- [X] T015 Marcar la spec como implementada en `specs/025-staff-email-notices/spec.md` (Status) y las tareas como `[X]`. Commit y PR solo cuando el usuario lo pida.

---

## Dependencias y orden

- T001 → T002 → T003 → T004 → T005 (la prueba va antes del código y debe fallar).
- US2 (T006–T008) depende de T004; US3 (T009–T011) depende de T004; US2 y US3 son independientes entre sí, pero T006 y T009 editan el mismo archivo y van en orden.
- T009 y T010 editan el mismo archivo y van en orden; T007 (otro archivo) y T012 y T013 (docs) son paralelos.
- T014–T015 al final.

## Ejemplo paralelo

```text
Tras T004: T007 (delivery-email) en paralelo con T006 (staff-email).
Al final: T012 (Context.md) y T013 (Decisions.md) a la vez.
```

## Estrategia

- **MVP**: T001–T005 (docente recibe su correo). Es el defecto reportado.
- **Entrega incremental**: US2 fija la regla general y el dominio ajeno; US3 protege lo existente; luego documentación.
- **Nota**: `zz-worker-smoke` comparte la cola de Redis con la API de desarrollo y falla de forma intermitente desde antes; no es regresión de esta spec.
