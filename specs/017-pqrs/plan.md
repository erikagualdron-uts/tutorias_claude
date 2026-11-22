# Implementation Plan: PQRS: radicación y gestión

**Branch**: `017-pqrs` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/017-pqrs/spec.md`

## Summary

Docentes y estudiantes radican una PQRS (tipo, asunto, descripción) y consultan su estado; el CAE las ve todas con filtros, las pasa a "En revisión", las responde y las resuelve. Cada cambio de estado y cada respuesta avisa al autor por la bandeja, el push y el correo.

Enfoque técnico (detalle en [research.md](research.md)):

- **Dos tablas nuevas**: `pqrs` y `pqrs_messages` (nombres de `Architecture.md`), más el enum de estado. El tipo es una referencia a un elemento de `PQRS_TYPE`.
- **Máquina de estados en el servidor, con una sola operación condicional**: `UPDATE ... WHERE status = <esperado>` dentro de una transacción que también guarda el evento de aviso. Responder bloquea la fila de la PQRS para que no se pueda responder y resolver a la vez.
- **Avisos reutilizando el outbox de la spec 014**: tres tipos de evento nuevos (`PQRS_IN_REVIEW`, `PQRS_RESPONDED`, `PQRS_RESOLVED`). Hoy un evento y un aviso exigen un módulo; la migración hace `module_id` opcional y agrega `pqrs_id`, con una restricción que obliga a que tenga exactamente uno de los dos.
- **El aviso no copia el texto de la respuesta**: dice que hay novedad y el asunto de la PQRS; el contenido se lee dentro de la app.
- **Reglas de `config-usage` conectadas**: `isDropdownItemInUse` deja de devolver siempre `false` y cuenta las PQRS del tipo.
- **Límites en configuración**: tres claves nuevas (`pqrs.subjectMaxLength`, `pqrs.descriptionMaxLength`, `pqrs.responseMaxLength`) con valor por defecto.
- **Radicación sin duplicados** con una clave de idempotencia que genera la app por intento (única por autor).
- **Sin dependencias nuevas** en backend ni en la app.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7, class-validator, `@nestjs/swagger`, BullMQ (presentes). App: Expo Router, TanStack Query, i18next, `react-native-iconify` (presentes). **Ninguna dependencia nueva.**

**Storage**: PostgreSQL. Tablas nuevas `pqrs` y `pqrs_messages`; `outbox_events` y `notifications` ganan `pqrs_id` y su `module_id` pasa a ser opcional (ver [data-model.md](data-model.md)). Una sola migración en `tutorias_uts_db`.

**Testing**: Backend: Vitest (unitarias de la máquina de estados y de las plantillas; e2e con Supertest sobre PostgreSQL de prueba: roles, propiedad, filtros, transiciones, respuesta exigida, tipo en uso, aviso creado, idempotencia) y contrato contra `contracts/pqrs-api.yaml`. App: Jest + React Native Testing Library con paridad de i18n es/en.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service + base de datos. Toca `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db`.

**Performance Goals**: lista del CAE con 200 PQRS y filtros en menos de 300 ms en el servidor (SC-004 se mide a mano en la app; sin prueba automática con tiempo). Índices por autor, por estado y por tipo.

**Constraints**: roles por guard en cada endpoint (`STUDENT` y `TEACHER` radican y consultan lo propio; `SUPERADMIN` gestiona); una PQRS ajena responde `404`; el borrado es lógico (`deletedAt`) aunque esta spec no expone borrar; fechas en UTC; textos solo en `es.json` y `en.json` y en códigos de error traducidos; colores solo de `Design.md`; el estado nunca solo por color; objetivos de 48 px; íconos solo Iconify en `src/icons/`; todo botón con ícono a la izquierda y 16 px entre botones apilados; campos con relleno y borde tenue; los cuatro estados de pantalla (cargando, vacío, error, con datos); ningún dato de contacto en los avisos ni en los logs.

**Scale/Scope**: una institución; cientos de PQRS por semestre. Endpoints nuevos: 9. Pantallas nuevas: 5 (lista y detalle del autor, formulario de radicación, lista y detalle del CAE con sus acciones); las tres pestañas "PQRS" dejan de ser pantalla vacía.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Context.md` (PQRS: solo se radican, solo el CAE gestiona) y D-042, D-073. Se actualizan `Context.md`, `Architecture.md`, `Design.md` y `Decisions.md` (D-111 y D-112; la numeración sigue a D-110 de la 016) en el mismo cambio. |
| II. Reglas de negocio en backend | Roles, propiedad, transiciones y la exigencia de respuesta las valida el servidor; la app solo oculta botones. Esta spec no toca cupo, cruces ni ventanas de cancelación. |
| III. Integridad de datos | `deletedAt` en ambas tablas y las consultas lo filtran; fechas en UTC y texto en `America/Bogota`; límites de largo en configuración, no en el código. |
| IV. Seguridad y privacidad | Guard por rol en los 9 endpoints, con prueba de `403` y `404` cruzado; los avisos y logs llevan ids, nunca texto de la PQRS ni de las respuestas. |
| V. Pruebas primero en lo crítico | Las reglas críticas de esta spec (transiciones, respuesta exigida, propiedad) se prueban antes de implementar; las del Principio II no cambian. |
| VI. Internacionalización | Todos los textos de la app y las plantillas de aviso (bandeja, push, correo) en es y en; errores nuevos con código estable traducido. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; cada acción bloqueada muestra la regla ("primero pásala a En revisión"). |
| VIII. Desarrollo incremental | Una funcionalidad por rama; el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/017-pqrs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── pqrs-api.yaml
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
└── prisma/
    ├── schema.prisma                          # + PqrsStatus, Pqrs, PqrsMessage; OutboxEvent y Notification con moduleId opcional + pqrsId
    └── migrations/<ts>_add_pqrs/              # tablas, enums, valores de OutboxEventType, columnas y restricción

tutorias_uts_back/
├── src/pqrs/
│   ├── pqrs.module.ts
│   ├── pqrs.controller.ts                     # los 9 endpoints, @Roles por ruta
│   ├── pqrs.service.ts                        # radicar, listar, detalle, transiciones, responder
│   ├── pqrs-transitions.ts                    # tabla de transiciones permitidas (función pura)
│   ├── dto/                                   # CreatePqrsDto, RespondDto, ListMinePqrsQuery, ListPqrsQuery
│   └── pqrs-transitions.spec.ts
├── src/config-usage/config-usage.service.ts   # isDropdownItemInUse cuenta PQRS del tipo
├── src/settings/settings.service.ts           # + 3 claves pqrs.* con valor por defecto
├── src/outbox/outbox.service.ts               # OutboxEventInput: moduleId o pqrsId
├── src/notifications/
│   ├── event-context.ts                       # rama PQRS: autor activo y asunto
│   ├── outbox.consumer.ts                     # guarda pqrsId en el aviso
│   ├── deliveries.service.ts                  # data del push con pqrsId
│   ├── notifications.service.ts + dto/        # el aviso expone moduleId | null y pqrsId | null
│   └── templates/{types,es,en}.ts             # 3 plantillas nuevas por idioma
├── src/mail/templates/notice.{es,en}.ts       # marco del correo para los 3 tipos
└── test/pqrs.e2e-spec.ts

tutorias_uts_mobile/
├── app/(student)/pqrs/, (teacher)/pqrs/       # index, new, [id] (mismo patrón que modules)
├── app/(admin)/pqrs/                          # index, [id]
├── src/features/pqrs/
│   ├── api.ts, hooks/                         # useMyPqrs, useCreatePqrs, usePqrsAdmin, transiciones y respuesta
│   ├── schemas.ts                             # validación del formulario con los límites que da la API
│   ├── components/                            # PqrsCard, StatusBadge, PqrsFilters, ResponseList
│   └── screens/                               # MyPqrsScreen, NewPqrsScreen, PqrsDetailScreen, AdminPqrsScreen, AdminPqrsDetailScreen
├── src/features/notifications/openTarget.ts   # un aviso con pqrsId lleva al detalle de la PQRS
├── src/i18n/{es,en}.json                      # textos y errores nuevos
└── src/icons/registry.ts                      # íconos nuevos del set solar

Claude/docs/                                   # Context, Architecture, Design, Decisions
```

**Structure Decision**: tres repos con el mismo patrón de las specs 010 a 016: un módulo de negocio nuevo en el backend (`src/pqrs/`), una carpeta por funcionalidad en la app (`src/features/pqrs/`) y una migración en `tutorias_uts_db`. Los avisos reutilizan `notifications/` y `outbox/` sin módulo paralelo.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
