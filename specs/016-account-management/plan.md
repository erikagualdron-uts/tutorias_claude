# Implementation Plan: Gestión de cuentas de docentes y estudiantes

**Branch**: `016-account-management` | **Date**: 2026-11-21 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/016-account-management/spec.md`

## Summary

El CAE gestiona las cuentas de docentes y estudiantes desde la pestaña Más: listas con búsqueda y filtro, desactivar y reactivar, eliminar (borrado lógico), editar los datos de un docente y regenerar su clave temporal. Cada baja muestra antes su efecto con números y, en el caso de un estudiante, cancela sus inscripciones vigentes en la misma transacción.

Enfoque técnico (detalle en [research.md](research.md)):

- **Casi todo el cimiento ya existe**: `User.status` y `User.deletedAt`, el guard que valida la cuenta en cada petición (pérdida de acceso inmediata), `SessionService.revokeAllForUser` (cierra sesiones y descarta dispositivos push), el generador de clave temporal, `TemporaryPasswordDialog` y los componentes `SearchField`, `FilterChips` y `ConfirmDialog` de la app. No hay tablas nuevas.
- **Un servicio por rol, el mismo patrón**: `TeachersService` crece (detalle, edición, estado, borrado, clave) y un `StudentsService` nuevo hace lo propio para estudiantes; ambos usan una función compartida que cambia el estado de una cuenta y cierra sus sesiones.
- **Baja de un estudiante en una transacción** con el orden de bloqueo de D-092 (periodo, fila del estudiante, módulos por `id`): cancela sus inscripciones vigentes del periodo activo con `effectiveUntil = ahora`, cambia el estado y confirma o deshace todo junto.
- **Entregas pendientes**: una entrega de correo o push ya creada para una cuenta que luego se desactiva se omite (`SKIPPED`, `ACCOUNT_UNAVAILABLE`), cumpliendo FR-013 donde hoy podría salir.
- **Búsqueda sin tildes** con la extensión `unaccent` de PostgreSQL, habilitada por una migración mínima en `tutorias_uts_db`.
- **Sin dependencias nuevas** en backend ni en la app.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7, class-validator, `@nestjs/swagger` (presentes). App: Expo Router, TanStack Query, i18next, `react-native-iconify` (presentes). **Ninguna dependencia nueva.**

**Storage**: PostgreSQL. Sin tablas ni columnas nuevas; una migración habilita la extensión `unaccent` (`CREATE EXTENSION IF NOT EXISTS unaccent`). `Enrollment`, `User` y los perfiles se usan como están.

**Testing**: Backend: Vitest (unitarias del cálculo del efecto y de la validación; e2e con Supertest sobre PostgreSQL de prueba: roles, listas y búsqueda, desactivar y reactivar, borrar, inscripciones canceladas, carrera inscripción contra baja, entrega omitida) y contrato contra `contracts/accounts-api.yaml`. App: Jest + React Native Testing Library con paridad de i18n es/en.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service + base de datos. Toca `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db` (una migración).

**Performance Goals**: meta informativa: lista de 500 cuentas con búsqueda en menos de 300 ms en el servidor (no hay prueba automática con tiempo para que la carga no la haga fallar; SC-001 se mide a mano en T056); una baja de estudiante con 20 inscripciones en una sola transacción de menos de 1 s.

**Constraints**: solo rol `SUPERADMIN` en cada endpoint; la baja no se bloquea por módulos (D-088) pero un estudiante pierde sus inscripciones vigentes de forma atómica; el borrado es siempre lógico (`deletedAt`); el correo no cambia; las claves temporales se muestran una sola vez y nunca se registran; textos solo en `es.json` y `en.json` y en los códigos de error traducidos; colores solo de `Design.md`; objetivos de 48 px; íconos solo Iconify en `src/icons/`; todo botón con ícono a la izquierda y 16 px entre botones apilados; campos con relleno y borde tenue; todo estado de pantalla (cargando, vacío, error, con datos).

**Scale/Scope**: una institución; cientos de estudiantes y decenas de docentes. Endpoints nuevos: 11 (6 de docentes y 5 de estudiantes) y 1 modificado (la lista de docentes, que suma correo y módulos). Pantallas nuevas: 4 (lista de docentes, lista de estudiantes, editar docente, y la ficha de cuenta con sus acciones como hoja inferior) y 1 modificada (pestaña Más).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Context.md` (glosario de desactivar, reglas de cuentas y borrado lógico) y D-088. Se actualizan `Context.md`, `Architecture.md`, `Design.md` y `Decisions.md` (D-108 y D-109; la numeración sigue a D-107 de la 015) en el mismo cambio. |
| II. Reglas de negocio en backend | La baja y la cancelación de inscripciones las valida y ejecuta el servidor; la app solo pide confirmación. Cupo: la cancelación libera el cupo bajo el orden de bloqueo de D-092, sin sobrecupo posible. Roles por guard en cada endpoint. |
| III. Integridad de datos | Borrado lógico siempre; el historial (inscripciones, sesiones, avisos) se conserva. Fechas en UTC y texto en `America/Bogota`. Sin valores fijos de configuración nuevos. |
| IV. Seguridad y privacidad | Guard `SUPERADMIN` en los 11 endpoints nuevos y en el modificado (respuesta `403` a otros roles, con prueba); la clave temporal se muestra una vez, no se registra y no se devuelve en ninguna otra respuesta; las sesiones del afectado se cierran al instante. |
| V. Pruebas primero en lo crítico | Se escriben antes de implementar: cancelación atómica de inscripciones, carrera inscripción contra baja, entrega omitida, roles. |
| VI. Internacionalización | Todos los textos de la app en es y en con paridad; los errores nuevos con código estable traducido. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; la baja muestra siempre la regla y el efecto con números ("toda acción bloqueada muestra la regla"); el estado nunca solo por color. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/016-account-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── accounts-api.yaml
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
└── prisma/migrations/<ts>_enable_unaccent/    # CREATE EXTENSION IF NOT EXISTS unaccent; sin cambios en schema.prisma

tutorias_uts_back/
├── src/accounts/                              # lo que comparten docentes y estudiantes
│   ├── accounts.module.ts                     # importa el módulo que exporta SessionService y exporta el servicio
│   ├── account-status.ts                      # AccountStatusService: estado o borrado + cierre de sesiones, idempotente
│   ├── list-accounts.dto.ts                   # ListAccountsQuery: PageQuery + search + status (la usan docentes y estudiantes)
│   ├── account-search.ts                      # condición SQL con unaccent para nombre, apellido y correo
│   └── account-status.spec.ts
├── src/teachers/
│   ├── teachers.controller.ts                 # + GET :id, PATCH :id, POST :id/deactivate, :id/reactivate, :id/temporary-password, DELETE :id
│   ├── teachers.service.ts                    # lista con correo y módulos; detalle, edición, estado, borrado, clave
│   └── dto/{update-teacher,list-teachers}.dto.ts
├── src/students/                              # módulo nuevo (CAE)
│   ├── students.module.ts
│   ├── students.controller.ts                 # GET, GET :id, POST :id/deactivate, :id/reactivate, DELETE :id
│   ├── students.service.ts                    # lista, detalle y baja con cancelación atómica de inscripciones
│   └── dto/list-students.dto.ts
├── src/notifications/deliveries.service.ts    # omite push y correo de una cuenta desactivada o eliminada
├── src/common/errors/                         # códigos ACCOUNT_NOT_FOUND y ACCOUNT_NOT_ACTIVE
└── test/
    ├── accounts-roles.e2e-spec.ts             # 403 a docente y estudiante, y 401 sin sesión
    ├── teachers-manage.e2e-spec.ts            # lista, búsqueda con tildes, edición, estado, borrado, clave
    ├── students-manage.e2e-spec.ts            # lista, búsqueda, baja con inscripciones canceladas y cupo libre
    ├── students-concurrency.e2e-spec.ts       # inscribirse contra la baja del mismo estudiante
    ├── accounts-delivery.e2e-spec.ts          # entrega pendiente de una cuenta dada de baja
    └── accounts-contract.e2e-spec.ts          # respuestas contra accounts-api.yaml

tutorias_uts_mobile/
├── app/(admin)/more/{teachers,students,teacher-edit}.tsx   # rutas finas que montan las pantallas
├── src/features/accounts/
│   ├── screens/{TeachersScreen,StudentsScreen,TeacherEditScreen}.tsx
│   ├── components/{AccountCard,AccountSheet,BajaDialog}.tsx # tarjeta, hoja con acciones y confirmación con efecto
│   ├── hooks/{useTeacherAccounts,useStudentAccounts,useAccountActions}.ts # TanStack Query, páginas y mutaciones (no `useTeachers`, que ya es el selector del formulario de módulo)
│   ├── schemas.ts
│   └── __tests__/
├── src/features/shell/screens/MoreScreen.tsx               # filas "Docentes" y "Estudiantes"
├── src/icons/registry.ts                                   # íconos nuevos
└── src/i18n/{es,en}.json                                   # textos y errores nuevos

Claude/docs/
├── Context.md                                 # 4.1 puntos 4 y 5 y reglas de cuentas
├── Architecture.md                            # endpoints y orden de bloqueo de la baja
├── Design.md                                  # pantallas de cuentas y confirmación con efecto
└── Decisions.md                               # D-108 y D-109
```

**Structure Decision**: docentes y estudiantes tienen cada uno su módulo, y lo común (cambiar el estado y cerrar sesiones, y la búsqueda sin tildes) vive en `src/accounts/`. Así `TeachersService` no se hincha y `StudentsService` no copia lógica. La app agrupa todo en una feature `accounts`, con una sola hoja de acciones y una sola confirmación para los dos roles.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
