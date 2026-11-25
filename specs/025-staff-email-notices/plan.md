# Implementation Plan: Avisos por correo para docentes y CAE

**Branch**: `025-staff-email-notices` | **Date**: 2026-11-23 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/025-staff-email-notices/spec.md`

## Summary

La entrega por correo de un aviso solo compara la dirección con el dominio de estudiantes (`auth.studentEmailDomain`), por lo que ningún docente ni CAE recibe correo. Se corrige para que la dirección pueda pertenecer a cualquiera de los dos dominios institucionales configurados, el de estudiantes o el del personal (`auth.staffEmailDomain`, que ya existe y se usa al crear docentes). Una dirección de otro dominio sigue omitida con su motivo.

Enfoque técnico (detalle en [research.md](research.md)):

- **Un cambio en `DeliveriesService.deliverEmail`** (`tutorias_uts_back`): se leen los dos dominios y se acepta la dirección si coincide con alguno; el resto del método (SMTP sin configurar, plantilla, idioma, reintentos) no se toca.
- **Sin migración, sin llave de configuración nueva, sin cambios en la app, el push, la bandeja ni las plantillas.** Tampoco hay avisos ni destinatarios nuevos (el CAE sigue sin recibir avisos; aclaración del 2026-11-23).
- **Pruebas**: una e2e nueva para docente (PQRS), CAE y dominio ajeno, y se actualiza la existente de dominio no permitido, que hoy se llama "no es el dominio de estudiantes".
- **Documentación**: `Context.md` (a quién se le escribe) y la decisión D-122.
- **Sin dependencias nuevas.**

## Technical Context

**Language/Version**: TypeScript, Node.js 20 LTS o superior; NestJS 12, Prisma 7.

**Primary Dependencies**: las existentes (`SettingsService`, `hasEmailDomain`, `DeliveriesService`). **Ninguna dependencia nueva.**

**Storage**: PostgreSQL; sin migración. Las llaves `auth.studentEmailDomain` y `auth.staffEmailDomain` de la tabla `settings` ya existen y se leen en cada envío (sin caché, así que un cambio de configuración aplica al siguiente aviso).

**Testing**: Vitest + Supertest (e2e con base de pruebas), con los falsos de correo y push de `test/utils/test-app.ts`.

**Target Platform**: API del backend; sin cambios en la app móvil.

**Project Type**: web-service. Toca `tutorias_uts_back` y `Claude/docs`.

**Performance Goals**: sin cambios (el correo sale en menos de 30 s desde el evento, como hoy; el cambio añade una lectura de configuración por entrega).

**Constraints**: los dominios viven en configuración (Principio III); no se escriben direcciones ni textos en los registros (Principio IV); el CAE no recibe avisos nuevos; las entregas ya omitidas no se reenvían.

**Scale/Scope**: 1 método, 1 archivo de pruebas nuevo, 1 prueba existente renombrada y 2 documentos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | `Context.md` ya promete correo al autor de una PQRS, también docente; se corrige el código para cumplirlo y se registra D-122. |
| II. Reglas de negocio en backend | La regla de a quién se escribe vive en el backend. |
| III. Integridad de datos | Los dominios siguen en configuración, no en el código. |
| IV. Seguridad y privacidad | Se mantiene la salvaguarda de no escribir a dominios ajenos; sin direcciones ni textos en registros (la prueba lo comprueba). |
| V. Pruebas primero en lo crítico | No es una de las reglas críticas, pero la prueba del docente se escribe antes de la corrección y debe fallar con el código actual. |
| VI. Internacionalización | Sin textos nuevos; el correo del docente usa las plantillas es y en existentes. |
| VII. Diseño consistente | No aplica (sin cambios de interfaz). |
| VIII. Desarrollo incremental | Una funcionalidad por rama; cambio mínimo. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Revisado tras el diseño: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/025-staff-email-notices/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: no cambia ningún endpoint ni interfaz.

### Source Code

```text
tutorias_uts_back/
├── src/notifications/deliveries.service.ts          # deliverEmail: acepta el dominio de estudiantes o el del personal
└── test/
    ├── notifications-staff-email.e2e-spec.ts        # nueva: docente (PQRS), CAE, dominio ajeno, cambio de dominio, registros
    └── notifications-delivery-email.e2e-spec.ts     # la prueba "dominio que no es el de estudiantes" pasa a "dominio institucional"

Claude/docs/                                         # Context (a quién se escribe) y Decisions (D-122)
```

**Structure Decision**: la regla se queda donde está (`deliverEmail`), sin una función nueva compartida: solo la usa este método y `hasEmailDomain` ya hace la comparación exacta y normalizada.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
