# Implementation Plan: Notificaciones de cambios en los módulos

**Branch**: `014-notifications` | **Date**: 2026-11-18 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/014-notifications/spec.md`

## Summary

Un consumidor del registro de eventos (`outbox_events`, D-087) convierte cada cambio de un módulo en un aviso por estudiante inscrito, en su idioma, y lo entrega por tres canales: la bandeja de la app, push (Expo) y correo (SMTP). La app suma la bandeja con contador, el registro del dispositivo para push y la pantalla del CAE para configurar el correo.

Enfoque técnico (detalle en [research.md](research.md)):

- **Un solo punto atómico**: por cada evento, una transacción crea los avisos (`notifications`), una fila de entrega por canal (`notification_deliveries`) y marca el evento como procesado. Ningún aviso se pierde ni se duplica aunque el servicio se reinicie (índice único `(event_id, user_id)`).
- **Entrega por cola**: BullMQ con `jobId = deliveryId`. Un barrido periódico vuelve a encolar las entregas pendientes, así Redis caído o correo sin configurar no pierden envíos.
- **Sin dependencias nuevas en el backend**: cliente propio del servicio de push de Expo (como `holidays-client`) y el Nodemailer, BullMQ y `@nestjs/schedule` ya presentes. La app suma solo `expo-notifications`.
- **Base de datos**: una migración en `tutorias_uts_db` con `notifications`, `notification_deliveries` y `push_tokens`. `SmtpConfig` y `OutboxEvent` ya existen.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12, Prisma 7, BullMQ 6, `@nestjs/bullmq`, `@nestjs/schedule`, Nodemailer, class-validator y `@nestjs/swagger` (todo presente); sin dependencias nuevas. App: Expo Router, TanStack Query, i18next, Reanimated, `react-native-iconify`, `expo-device` y `expo-constants` (presentes) y **`expo-notifications`** (nueva, compatible con SDK 58).

**Storage**: PostgreSQL. Tablas nuevas: `notifications`, `notification_deliveries`, `push_tokens`; sin cambios en `outbox_events`, `smtp_configs` ni `users`. Redis para las colas (ya presente).

**Testing**: Backend: Vitest (unitarias de plantillas, resolución de destinatarios y reglas de entrega; e2e con Supertest sobre PostgreSQL de prueba, `TestClock`, un `PushGateway` y un `MailTransport` falsos) y contrato contra `contracts/notifications-api.yaml`. App: Jest + React Native Testing Library con paridad de i18n es/en.

**Target Platform**: Android e iOS (app); API HTTPS; worker en el mismo proceso de la API.

**Project Type**: mobile-app + web-service + base de datos. Toca `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db`.

**Performance Goals**: aviso en la app en menos de 30 s para el 95 % de los cambios (SC-001, sondeo del outbox cada 5 s); 100 inscritos procesados en menos de 2 min (SC-006, un solo `INSERT` por evento y envíos de push en lotes de 100).

**Constraints**: avisos solo de estudiantes inscritos; el evento nunca lleva datos personales (FR-004); clave SMTP cifrada y nunca devuelta ni registrada; fechas en UTC y texto en Bogotá; reintentos y sondeo desde variables de entorno con valor por defecto, no fijos en el código; textos de aviso solo en plantillas es/en; colores solo de `Design.md`; objetivos de 48 px; íconos solo Iconify en `src/icons/`; todo botón con ícono a la izquierda.

**Scale/Scope**: una institución; cientos de estudiantes y decenas de cambios por día. Endpoints nuevos: 9. Pantallas nuevas: 2 (bandeja, configuración del correo) y 1 modificada (barra superior con campana y contador). Tablas nuevas: 3.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Context.md` (todo cambio notifica por push, correo y app), `Architecture.md` §9 y D-024, D-028 y D-087. Se actualizan `Architecture.md`, `Context.md`, `Design.md` y `Decisions.md` en el mismo cambio (ver abajo). |
| II. Reglas de negocio en backend | "Todo cambio o cancelación notifica a los inscritos" lo cumple el servidor: destinatarios resueltos en el servidor al procesar el evento, nunca por la app. Roles en cada endpoint. |
| III. Integridad de datos | Fechas en UTC y texto en `America/Bogota` en un solo punto (plantillas). `push_tokens` con `deletedAt`; `notifications` y `notification_deliveries` son registros sin borrado (no hay función que los elimine). Reintentos y sondeo desde configuración. |
| IV. Seguridad y privacidad | `@Roles` en cada endpoint; el aviso solo lo lee su dueño (`404` en ajeno); clave SMTP cifrada (AES-256-GCM), nunca en respuestas, registros ni errores; el evento no contiene datos de estudiantes y los registros de fallo no llevan correos ni tokens. |
| V. Pruebas primero | Pruebas de destinatarios (inscrito, cancelado vigente, cancelado vencido, ausencia, no inscrito), no duplicar tras reiniciar, un solo aviso por cambio de varias sesiones, plantillas es/en en Bogotá, reintentos y fallo aislado por destinatario, roles `403/401` y contrato. |
| VI. Internacionalización | Textos de la app bajo `notifications.*` y `smtp.*` en `es.json` y `en.json`; textos de aviso, push y correo en plantillas es/en del backend por `User.locale`. |
| VII. Diseño consistente | Campana `solar:bell-linear` ya definida en `Design.md`; contador con el rojo de error existente; tarjetas, estados y campos del sistema; la regla bloqueada se muestra (p. ej. módulo ya no disponible). |
| VIII. Desarrollo incremental | Una rama; historias por prioridad: avisos en la app (US1 y US2), push (US3), correo (US4), garantía de entrega (US5) y configuración (US6). |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones.

**Re-evaluación tras el diseño (Fase 1)**: sin cambios. La única decisión que toca `docs/` (el diseño de la entrega y el contador sin tiempo real) se registra como D-098 a D-100.

## Project Structure

### Documentation (this feature)

```text
specs/014-notifications/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── notifications-api.yaml
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

### Source Code

```text
tutorias_uts_db/
└── prisma/
    ├── schema.prisma                         # + Notification, NotificationDelivery, PushToken y enums
    └── migrations/<ts>_add_notifications/    # tablas, índice único (event_id, user_id), índices de bandeja y de entrega

tutorias_uts_back/
├── src/notifications/
│   ├── notifications.module.ts
│   ├── notifications.controller.ts           # bandeja: lista, contador, leer, leer todo
│   ├── devices.controller.ts                 # PUT/DELETE de dispositivos push
│   ├── notifications.service.ts              # consultas de la bandeja y marcas de lectura (solo dueño)
│   ├── devices.service.ts                    # registro idempotente, un usuario por dispositivo
│   ├── outbox.consumer.ts                    # sondeo cada N s, un evento por transacción, en orden
│   ├── recipients.ts                         # estudiantes que reciben el evento (reutiliza ATTENDS_SESSION)
│   ├── event-context.ts                      # módulo, docente, salón y sesiones del evento, leídos al procesar
│   ├── deliveries.service.ts                 # crea entregas, encola, barrido de pendientes
│   ├── delivery.processor.ts                 # worker BullMQ: push y correo, reintentos, registro de fallos
│   ├── push/push-gateway.ts                  # interfaz PUSH_GATEWAY + cliente de Expo (lotes, tickets, recibos)
│   ├── templates/{index,es,en}.ts            # título y cuerpo por tipo de evento e idioma; fechas en Bogotá
│   ├── dto/notifications.dto.ts
│   └── *.spec.ts
├── src/mail/
│   ├── smtp-config.service.ts                # configuración vigente (BD, luego env), estado, cifrado, transporte
│   ├── mail.processor.ts                     # usa SmtpConfigService (sin duplicar la lógica de transporte)
│   └── templates/notification.{es,en}.ts     # plantilla de correo del aviso (texto plano)
├── src/settings/smtp/
│   ├── smtp.controller.ts                    # GET/PUT /settings/smtp, POST /settings/smtp/test (SUPERADMIN)
│   └── dto/smtp.dto.ts
├── src/config/env.ts                         # + OUTBOX_POLL_SECONDS, NOTIFICATION_DELIVERY_ATTEMPTS, NOTIFICATION_BACKOFF_SECONDS, NOTIFICATION_SWEEP_SECONDS
├── src/auth/auth.service.ts                  # logout descarta los dispositivos de esa sesión
└── test/
    ├── notifications-outbox.e2e-spec.ts      # eventos → avisos: destinatarios, idioma, orden, sin duplicar
    ├── notifications-inbox.e2e-spec.ts       # bandeja, contador, leer, paginación, solo propios
    ├── notifications-devices.e2e-spec.ts     # registro idempotente, logout, token inválido
    ├── notifications-delivery.e2e-spec.ts    # push y correo: reintentos, fallo aislado, correo sin configurar
    ├── smtp-settings.e2e-spec.ts             # estado, guardar, clave oculta, prueba, 403
    ├── notifications-roles.e2e-spec.ts       # 401/403 en cada endpoint
    └── notifications-contract.e2e-spec.ts

tutorias_uts_mobile/
├── app/(student)/notifications.tsx           # tres rutas delgadas que montan la misma pantalla
├── app/(teacher)/notifications.tsx
├── app/(admin)/notifications.tsx
├── app/(admin)/more/smtp.tsx                 # configuración del correo (CAE)
└── src/
    ├── features/notifications/
    │   ├── screens/NotificationsScreen.tsx   # cuatro estados, paginación, marcar todo
    │   ├── components/{NotificationCard,NotificationsBell}.tsx
    │   ├── hooks/{useNotifications,useUnreadCount,useMarkRead,usePushRegistration}.ts
    │   ├── push.ts                           # permiso explicado, token, escuchas de recepción y toque
    │   ├── openTarget.ts                     # aviso → ruta del módulo según el rol
    │   └── __tests__/
    ├── features/smtp/                        # pantalla del CAE, formulario Zod y hooks
    ├── components/AppBar.tsx                 # + campana con contador junto al avatar
    ├── features/auth/hooks/useSignOut.ts     # descarta el dispositivo antes de cerrar sesión
    ├── api/types.ts                          # + Notification, SmtpSettings
    ├── i18n/{es,en}.json                     # + notifications.* y smtp.*
    └── icons/registry.ts                     # + íconos nuevos si faltan (set solar)
```

**Structure Decision**: Se sigue `docs/Conventions.md` §4 y §5. El módulo `notifications/` ya figura en `Architecture.md` §3 y reúne bandeja, dispositivos, consumidor y entrega; la configuración del correo vive en `settings/smtp/` porque `Architecture.md` ubica allí el SMTP. La lógica de transporte SMTP se extrae a `SmtpConfigService` para que los códigos de verificación (spec 001) y los avisos usen la misma configuración. El puerto del push y el del correo son interfaces inyectables para que las pruebas no salgan a la red.

## Actualizaciones de docs/

En el mismo cambio (`CLAUDE.md`, "Forma de trabajar"):

- `docs/Architecture.md`: §5 (campos de `Notification`, nueva `NotificationDelivery`, `PushToken` con `deletedAt`, nota de `SmtpConfig`), §9 (flujo del consumidor, entrega y reintentos, estados) y la nota de que `OutboxEvent` ya tiene consumidor.
- `docs/Context.md`: §4 (bandeja para los tres roles, push y correo) y la configuración del SMTP del CAE.
- `docs/Design.md`: campana con contador en la barra superior, pantalla de la bandeja y pantalla de configuración del correo.
- `docs/Decisions.md`: D-087 pasa a "condición cumplida"; nuevas D-098 (entrega atómica con barrido), D-099 (contador por consulta periódica y al recibir un push, no por WebSocket) y D-100 (cliente propio de Expo y recibos en un trabajo diferido).

## Complexity Tracking

Sin violaciones de la constitución que justificar.
