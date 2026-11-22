# Research: Dashboards de los tres roles

Sin `NEEDS CLARIFICATION` abiertos. Cada punto resume qué se decidió y por qué.

## R-1. Qué se reutiliza y qué endpoint es nuevo

- **Decisión**: reutilizar `GET /chat/unread-count`, `GET /notifications/unread-count` y `GET /pqrs/mine?limit=3` (ya paginado por `PageQuery`); crear solo 5 endpoints de lectura.
- **Razón**: el contador del dashboard debe ser el de la pestaña (spec, escenario 4 del docente) y la forma más segura de que coincidan es que sea la misma consulta. Además cada bloque fallaría solo, como pide FR-012.
- **Alternativas**: un endpoint por rol con todo adentro (duplica las consultas de chat, avisos y PQRS y un fallo tumba toda la pantalla); componer todo en la app con `GET /teacher/sessions` y `GET /enrollments` (la semana en `America/Bogota`, las sesiones omitidas y las canceladas quedarían decididas en el cliente, contra el Principio II).

## R-2. Quién asiste a una sesión

- **Decisión**: reutilizar `ATTENDS_SESSION` y `sessionSeats` (`enrollments/seats.ts`) para la próxima sesión, los inscritos y la semana, del docente y del estudiante.
- **Razón**: ya cuentan solo estudiantes activos, con inscripción vigente y sin ausencia de esa sesión. Una cifra nueva con otra definición se desviaría de la pantalla del módulo (SC-002).
- **Alternativas**: contar inscripciones `ACTIVE` por módulo (ignora las ausencias y las cancelaciones con vigencia).

## R-3. "Esta semana" y "próxima sesión"

- **Decisión**: la semana es lunes a domingo en `America/Bogota`, con `weekRangeBogota` (función pura nueva en `dashboard.rules.ts`, sobre `bogotaCalendarDay` de `common/clock.ts`; `calendar.rules.ts` no trae un helper de semana); se cuentan sesiones en estado `SCHEDULED` o `RESCHEDULED`, pasadas de la semana incluidas. La próxima sesión es la de menor `starts_at` mayor que ahora (`Clock`, no `new Date()`) en esos estados.
- **Razón**: coincide con el calendario semanal del docente (spec 013) y permite mover el tiempo en las pruebas.
- **Alternativas**: contar solo desde ahora (no coincide con "tutorías de la semana").

## R-4. Cambios recientes sin tabla de historial

- **Decisión**: `module_sessions` con `status IN ('RESCHEDULED','CANCELLED')`, `deleted_at IS NULL` y `cancel_reason` distinto de `HOLIDAY`, ordenadas por `updated_at` descendente; cada fila lleva módulo, tipo, hora original y nueva, y `changedAt = updated_at`. Para el estudiante, solo módulos con inscripción vigente.
- **Razón**: respeta "sin tablas nuevas". Se excluyen las cancelaciones por festivo porque las genera el calendario, no una decisión, y llenarían las 5 filas con la misma fecha en todos los módulos a la vez.
- **Límites aceptados**: una sesión restaurada vuelve a `SCHEDULED` y sale de la lista; los cambios de docente o de salón del módulo no aparecen (la spec pide cancelaciones y reprogramaciones). Si el CAE quiere ver los festivos, es un cambio de una condición.
- **Alternativas**: leer `outbox_events` (tiene el tipo y el texto, pero hay que descifrar el `payload` y no existe filtro por inscrito); crear una tabla de historial (viola FR-009).

## R-5. "Ver todo" de los cambios del CAE

- **Decisión**: `GET /dashboard/admin/changes` es paginado (`page`, `limit`; el dashboard pide 5) y una pantalla `changes` reutiliza `ChangeRow` para listar el resto.
- **Razón**: FR-003 pide el enlace a la lista completa y hoy no existe una pantalla que liste cambios. Es la única pantalla nueva fuera de los dashboards.
- **Alternativas**: enlazar a la lista de módulos (no muestra qué cambió).

## R-6. Ocupación, baja inscripción y salones

- **Decisión**: módulos activos son los no eliminados del periodo `ACTIVE`. Ocupación de un módulo = inscritos con `ACTIVE` y cuenta activa sobre la capacidad de su salón (`countActiveEnrollments`, agregado en una sola consulta); la general es la suma de inscritos sobre la suma de capacidades. "Lleno" es inscritos ≥ capacidad. "Baja inscripción" es inscritos / capacidad < `dashboard.lowEnrollmentPercent` / 100 y no cuenta un módulo ya lleno. La ocupación de un salón es el promedio de la de sus módulos activos; se listan los 3 más y los 3 menos ocupados, sin repetir un salón si hay 6 o menos, y no entran los salones sin módulos. Capacidad total 0 → 0 %.
- **Razón**: aclarado en la spec (FR-004 y FR-005). Reutiliza el mismo conteo de inscritos que la lista de módulos.
- **Alternativas**: horas asignadas por salón (descartada en la aclaración).

## R-7. Configuración del umbral

- **Decisión**: una clave `dashboard.lowEnrollmentPercent` en `SETTING_DEFAULTS` (30), leída con `SettingsService`. No se agrega una pantalla de edición.
- **Razón**: el Principio III exige que viva en configuración; el patrón es el de `pqrs.*MaxLength` (D-111). Editarlo desde la app queda fuera de esta spec.

## R-8. PQRS del CAE

- **Decisión**: conteo por estado con `GROUP BY status` sobre `pqrs` no eliminadas; el tiempo promedio de respuesta es el promedio de `resolved_at - created_at` de las resueltas, en segundos, o `null` si no hay.
- **Razón**: `resolved_at` y `created_at` ya existen (spec 017); es la definición de la spec.

## R-9. Frescura y errores en la app

- **Decisión**: TanStack Query con una consulta por bloque, `refetchOnFocus` al volver a la pestaña y pull-to-refresh; cada bloque pinta su carga, vacío, error con "Reintentar" y datos. Los contadores de sin leer reutilizan los hooks que ya alimentan la pestaña.
- **Razón**: FR-011 y FR-012 sin infraestructura nueva; un fallo no se propaga a los demás bloques.
- **Alternativas**: WebSocket para refrescar en vivo (fuera de alcance, la spec no lo pide).

## R-10. Diseño

- **Decisión**: se siguen la tarjeta de métrica, la tarjeta principal con degradado y el patrón de hojas, las barras de cupo (mismas reglas de color que la tarjeta de módulo) y una barra apilada de PQRS (Neutral, Warning, Success con etiqueta y número, nunca solo color). Los gráficos son barras estáticas de `View`, sin librería de gráficos.
- **Razón**: `Design.md` ya lo define; una librería de gráficos sería una dependencia nueva sin necesidad.
