# Implementation Plan: Editar mi nombre

**Branch**: `033-edit-profile` | **Date**: 2026-11-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/033-edit-profile/spec.md`

## Summary

El estudiante cambia su propio nombre y apellido desde «Mi cuenta» (spec 032). Es la primera escritura de datos propios de la persona: se agrega un endpoint propio del estudiante, un registro interno de cada cambio y una pantalla sin pestaña. Docente y CAE no editan su nombre y ven la regla (detalle en [research.md](research.md)).

Hallazgos que fijan el alcance:

- **El nombre vive en `StudentProfile`**; el docente lo gestiona el CAE y el CAE no tiene perfil. Por eso solo el estudiante tiene acción de edición.
- **Hace falta una tabla nueva**, `student_name_changes`, de solo inserción (registro interno, FR-010); es la única migración.
- **El endpoint cabe en `StudentsModule`**: `PATCH /students/me` con `@Roles('STUDENT')`, sin recibir ningún id (solo opera sobre la cuenta del token).
- **Todo lo demás se reutiliza**: la forma de validar el nombre del registro, `UserSummary`, el patrón de pantallas sin pestaña (D-121, D-129), `setUser`, `ScreenHeader`, los campos y el botón con ícono.

Enfoque:

- **Documento primero** (constitución I): `Architecture.md` (endpoint y tabla), `Design.md` (pantalla sin pestaña), `Context.md` (regla) y D-130.
- **Base primero**: migración y modelo en `tutorias_uts_db`; luego servicio y endpoint con sus pruebas; al final la app.
- **Sin dependencias nuevas y sin roles de color nuevos.**

## Technical Context

**Language/Version**: TypeScript. Backend NestJS con Prisma y PostgreSQL; app React Native + Expo (Expo Router, TanStack Query, Zustand, i18next); Vitest en el backend (pruebas e2e en `test/`) y Jest en la app.

**Primary Dependencies**: las existentes. **Ninguna nueva.**

**Storage**: PostgreSQL; una tabla nueva (`student_name_changes`) y la actualización de `StudentProfile`.

**Testing**: Vitest en backend (`test/students-own-name.e2e-spec.ts`) y Jest en la app (`features/account`, `shell`, `theme`); recorrido manual con los tres roles.

**Target Platform**: Android e iOS; API REST.

**Project Type**: mobile + backend + base de datos + documentación (`tutorias_uts_mobile`, `tutorias_uts_back`, `tutorias_uts_db`, `Claude`).

**Performance Goals**: el cambio responde en menos de 1 s en condiciones normales y la pantalla abre sin esperar red (usa la sesión).

**Constraints**: reglas de `CLAUDE.md` (textos en es y en, colores solo de roles, íconos Iconify solar, botones con ícono a la izquierda, objetivos de 48 px, campos con relleno y borde); permisos con guard de roles; fechas en UTC; borrado lógico salvo el registro de solo inserción, que no se borra nunca; guardas de las specs 026 a 032 en verde.

**Scale/Scope**: 1 endpoint, 1 servicio, 1 DTO, 1 migración, 1 pantalla y su ruta, 1 hook, 1 esquema, ~10 claves de traducción, pruebas de backend y de app.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Architecture.md`, `Design.md` y `Context.md` se actualizan en el mismo cambio. Decisión D-130 |
| II. Reglas de negocio en backend | Rol, propiedad de la cuenta y validación del nombre se aplican en el servidor; la app solo ayuda |
| III. Integridad de datos | Fechas en UTC. El registro es de solo inserción y nunca se borra (no hay borrado que hacer lógico); el perfil sigue con su borrado lógico. Cambio y registro van en una sola transacción |
| IV. Seguridad y privacidad | Guard `STUDENT` en el endpoint; no recibe ids; el servicio usa el usuario del token; el registro no se expone por API; sin datos sensibles en logs |
| V. Pruebas primero en lo crítico | No toca cupo, cruces ni ventanas, pero el permiso y la transacción son sensibles: sus pruebas se escriben antes de la pantalla |
| VI. Internacionalización | Claves nuevas en español e inglés; la paridad la comprueba una prueba existente |
| VII. Diseño consistente | Registro «sobrio con cabecera»; la regla que explica por qué el docente no edita se muestra en pantalla |
| VIII. Desarrollo incremental | Una funcionalidad por rama; ver el registro desde la app queda para otra spec |
| IX. Idioma | Docs en español; código y commits en inglés |

**Resultado**: sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/033-edit-profile/
├── plan.md
├── research.md
├── data-model.md        # tabla nueva, estados de la pantalla
├── quickstart.md
├── contracts/
│   └── profile-api.yaml # PATCH /students/me
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
├── prisma/schema.prisma                                   # modelo StudentNameChange
└── prisma/migrations/<fecha>_add_student_name_changes/    # una tabla, solo inserción

tutorias_uts_back/src/students/
├── dto/update-own-name.dto.ts                             # firstName y lastName, máximo compartido con el registro
├── students.controller.ts                                 # PATCH /students/me (@Roles('STUDENT'))
├── students.service.ts                                    # updateOwnName: transacción, sin cambio no escribe
tutorias_uts_back/test/students-own-name.e2e-spec.ts       # permisos, validación, transacción, sin cambio

tutorias_uts_mobile/
├── app/(student)/account-name.tsx                         # reexporta la pantalla
├── src/features/account/screens/AccountNameScreen.tsx
├── src/features/account/hooks/useUpdateOwnName.ts         # setUser e invalida nombres ajenos
├── src/features/account/schemas.ts                        # nombre y apellido, mismo máximo
├── src/features/account/screens/AccountScreen.tsx         # acción por rol: editar, regla o correo
├── src/features/shell/roleTabs.config.ts                  # account-name oculta en STUDENT
├── src/i18n/{es,en}.json                                  # claves account.name.*
└── src/features/account/__tests__/

Claude/docs/{Architecture,Design,Context,Decisions}.md     # endpoint, tabla, pantalla, regla y D-130
Claude/specs/026-design-system/screen-inventory.md         # pantalla nueva
```

**Structure Decision**: se amplían las carpetas existentes (`students` en el backend y `features/account` en la app); la única pieza nueva de datos es la tabla del registro.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
