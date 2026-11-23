# Research: PQRS: radicación y gestión

No quedaron marcadores `NEEDS CLARIFICATION`. Estas son las decisiones de diseño, con lo que se revisó en el código el 2026-11-22.

## R-1: Cómo avisar sin módulo

- **Hallazgo**: `OutboxEvent.moduleId` y `Notification.moduleId` son claves foráneas obligatorias a `Module`; el consumidor (`outbox.consumer.ts`) y `resolveEvent` asumen que todo evento trata de un módulo.
- **Decisión**: hacer `module_id` opcional en ambas tablas, agregar `pqrs_id` opcional con clave foránea a `pqrs`, y una restricción `CHECK (num_nonnulls(module_id, pqrs_id) = 1)`. `resolveEvent` se bifurca: si el evento trae `pqrsId`, lee la PQRS y avisa a su autor; si no, sigue como hoy.
- **Razón**: reutiliza bandeja, entregas, cola, reintentos y recibos de push tal cual (FR-009, FR-010) y el índice único `(event_id, user_id)` sigue evitando duplicados.
- **Alternativas descartadas**: un módulo "ficticio" para colgar los avisos (ensucia las listas de módulos y rompe sus conteos); una segunda tabla de avisos (duplica bandeja, contador y entregas, y la app tendría dos bandejas).

## R-2: Qué dice el aviso

- **Decisión**: el aviso lleva el asunto de la PQRS y el nuevo estado o "tienes una respuesta"; **no copia el texto de la respuesta**. La app y el correo dirigen a la PQRS.
- **Razón**: el correo y el push salen de la app hacia canales externos, y `Context.md` pide ids y no datos personales en lo que sale. El asunto lo escribió el propio autor.
- **Alternativa descartada**: incluir la respuesta completa en el correo; amplía lo que sale a un canal externo sin que la spec lo pida.

## R-3: Transiciones sin carreras

- **Decisión**: una tabla pura de transiciones (`FILED → IN_REVIEW`, `IN_REVIEW → RESOLVED`) y una actualización condicional `UPDATE pqrs SET status = $to WHERE id = $id AND status = $from`; si afecta 0 filas, se responde `409 PQRS_INVALID_TRANSITION`. Responder y resolver bloquean la fila (`SELECT ... FOR UPDATE`) y verifican el estado y, al resolver, que exista al menos una respuesta. Todo en la misma transacción que guarda el evento de aviso.
- **Razón**: dos CAE a la vez no pueden resolver dos veces ni responder una PQRS recién resuelta (FR-004, FR-007, SC-006).
- **Alternativa descartada**: validar en memoria tras leer; deja una ventana entre leer y escribir.

## R-4: Radicar sin duplicados

- **Decisión**: la app genera un `clientRequestId` (UUID) por intento y lo manda en el cuerpo; hay un índice único `(author_id, client_request_id)`. Un reintento con la misma clave devuelve la PQRS ya creada con `200` en vez de `201`.
- **Razón**: el doble toque o un reintento de red no crea dos PQRS (FR-013), sin bloquear a nadie por el contenido.
- **Alternativa descartada**: solo deshabilitar el botón; no protege contra reintentos de red.

## R-5: Tipo en uso y tipo desactivado

- **Decisión**: `ConfigUsageService.isDropdownItemInUse(itemId)` cuenta filas de `pqrs` con ese `type_id`, también las de borrado lógico. Radicar valida que el elemento pertenezca a la lista `PQRS_TYPE`, esté `ACTIVE` y sin `deletedAt` (`PQRS_TYPE_UNAVAILABLE`). Al leer una PQRS se devuelven ambas etiquetas del tipo aunque esté desactivado.
- **Razón**: cierra el cableado que la spec 006 dejó listo (FR-012) y conserva el historial.

## R-6: Límites de texto

- **Decisión**: `pqrs.subjectMaxLength` = 120, `pqrs.descriptionMaxLength` = 2000, `pqrs.responseMaxLength` = 2000 en `SettingValues` con su valor por defecto. Las columnas tienen un techo físico mayor (`VarChar(200)` y `VarChar(4000)`) para que cambiar la configuración no exija migración. La app los lee de `GET /pqrs/limits` para mostrar el contador sin repetir el número. Los tipos disponibles salen del selector que ya existe (`GET /dropdown-lists/PQRS_TYPE/items`, abierto a todo rol con sesión).
- **Razón**: la constitución pide límites en configuración; el valor concreto no está en `docs/` y se parte de un valor razonable que el equipo puede cambiar.

## R-7: Filtros y orden del CAE

- **Decisión**: la lista del CAE filtra por `status`, `typeId` y `authorRole` (`TEACHER` o `STUDENT`), combinables, y ordena de la más reciente a la más antigua con paginación del proyecto (`PageQuery`). El filtro por rol une `pqrs` con `users`. Índices en `(status, created_at DESC)`, `(author_id, created_at DESC)` y `(type_id)`.
- **Razón**: cubre FR-006 y SC-004 sin búsqueda de texto, que la spec no pide.

## R-8: Datos para los dashboards

- **Decisión**: la spec solo exige que se pueda consultar (FR-015). Basta con `total` de la lista filtrada por estado (CAE y autor) y con dos fechas guardadas en la PQRS (`reviewed_at`, `resolved_at`) para calcular el tiempo de respuesta después. No hay endpoint de resumen en esta spec.
- **Razón**: evita un endpoint que nadie usa todavía; el dashboard lo agregará cuando exista su pantalla.

## R-9: Navegación desde el aviso

- **Decisión**: `openTarget.ts` suma `pqrsTarget(role, id)`; un aviso o push con `pqrsId` abre el detalle de la PQRS del rol; con `moduleId` sigue como hoy. `NotificationDto` y la data del push exponen `moduleId` y `pqrsId`, uno de los dos nulo.
- **Razón**: un toque lleva a la PQRS (historia 4, escenario 3). La app acepta ambos campos, así que una versión de la app anterior que solo lee `moduleId` recibe `null` y no navega, sin fallar.

## R-10: Fuera de esta spec

Adjuntos, respuesta del autor dentro de la PQRS, reapertura, alertas de demora, búsqueda por texto, la pantalla del dashboard y el chat.
