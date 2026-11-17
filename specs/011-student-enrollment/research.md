# Research: Inscripción de estudiantes a módulos

Decisiones técnicas de la funcionalidad 011. No quedaron marcadores `NEEDS CLARIFICATION`.

## R-1. Cupo por sesión

- **Decisión**: el cupo de una sesión es la capacidad de su salón (`module_sessions.room_id`). Los **asistentes** de una sesión futura son los estudiantes distintos con una inscripción vigente que no la cancelaron:
  - la inscripción no está borrada y la cuenta del estudiante está `ACTIVE` y sin borrar (FR-015);
  - está `ACTIVE`, o está `CANCELLED` pero la sesión empieza antes de su `effective_until` (R-4);
  - no existe una `session_absences` viva (`deleted_at IS NULL`) de esa inscripción para esa sesión.
  Lugares libres de una sesión = capacidad − asistentes. Solo cuentan las sesiones futuras, no borradas y con estado `SCHEDULED` o `RESCHEDULED`. Una sesión cancelada (festivo) no tiene cupo.
- **Inscribirse** exige al menos una sesión futura y que todas tengan al menos un lugar libre. Los **cupos disponibles** que se muestran son el mínimo de lugares libres entre las sesiones futuras (nunca negativo). El módulo está "lleno" cuando ese mínimo es 0.
- **Reactivar una sesión** exige un lugar libre en esa sesión.
- **Motivo**: es lo que se decidió en la aclaración del 2026-11-17 (D-090) y cierra el pendiente de D-070.
- **Cuenta distinta**: el conteo usa `COUNT(DISTINCT student_id)`: un estudiante que cancela el módulo y se reinscribe dentro de la ventana de 1 hora tiene dos filas vigentes para la misma sesión y debe contar una sola vez.
- **Efecto práctico**: una cancelación suelta casi nunca abre lugar a un estudiante nuevo, porque las demás sesiones siguen llenas; sí ocurre cuando queda una sola sesión o cuando alguien cancela el módulo. Se acepta.
- **Regla del cambio de salón**: no cambia. `capacity >= inscritos activos` (Principio II). Con el cupo por sesión puede haber, en casos raros, más inscritos activos que capacidad; la regla sigue contando inscritos y es la más estricta.
- **Alternativas**: cupo por inscripciones activas (más simple, descartado por el equipo); inscripción a una sola sesión para tomar el lugar liberado (amplía el alcance de la spec).

## R-2. Concurrencia: orden de bloqueo

- **Decisión**: toda escritura del estudiante corre en una transacción que bloquea, en este orden:
  1. el periodo con `FOR SHARE` y se rechaza si está `CLOSED` (la misma operación `lockWritablePeriod` de la spec 010);
  2. solo al **inscribir**: la fila del estudiante en `users` con `FOR UPDATE`, para serializar sus propias inscripciones (R-3);
  3. el módulo con `FOR UPDATE` (el mismo bloqueo de `lockModule` de la spec 010, que comenta que una inscripción concurrente bloquea la misma fila).
  Con el módulo bloqueado se cuentan los asistentes y se escribe. El cambio de salón de la spec 010 bloquea la misma fila del módulo, así que cupo y capacidad nunca se evalúan con datos viejos.
- **Sin interbloqueo**: cada operación toma como máximo un módulo y el bloqueo del estudiante solo lo toma la inscripción, siempre antes del módulo; el orden es el mismo en todas partes.
- **Respaldo en la base**: índice único parcial `enrollments_one_active` (un estudiante no tiene dos inscripciones activas al mismo módulo, ni con dos peticiones simultáneas) y `session_absences_one_live`.
- **Alternativas**: `SERIALIZABLE` con reintentos (más costo y errores `40001` visibles al usuario); bloqueos consultivos (`pg_advisory_xact_lock`: no se ven en el esquema y es fácil olvidarlos); contador `enrolled` en `modules` (se desincroniza con las cuentas desactivadas y con el cupo por sesión).

## R-3. Cruce de horarios del estudiante

- **Decisión**: antes de insertar, con el estudiante bloqueado, se buscan los `module_schedules` vivos de sus módulos con inscripción **activa** del **mismo periodo** que coincidan en `day_of_week` y se solapen con los del módulo destino (semiabierto `[)`, igual que la spec 010). El rechazo devuelve el módulo, el día y las horas con los que choca (FR-005). Se compara con los horarios semanales, no sesión por sesión (supuesto de la spec).
- **Por qué el bloqueo del estudiante**: sin él, dos inscripciones simultáneas del mismo estudiante a módulos que se cruzan pasarían ambas la comprobación. No hay una restricción de exclusión posible entre tablas distintas sin copiar horarios al estudiante; el bloqueo da la misma garantía con menos piezas.
- **Qué no cuenta**: una inscripción `CANCELLED`, aunque todavía tenga sesiones dentro de su `effective_until`.
- **Alternativas**: tabla `student_schedules` con exclusión `gist` (la garantía más fuerte, pero duplica datos y hay que sincronizarla con cada cambio de horario); comprobar sin bloquear (carrera real).

## R-4. Cancelar el módulo: `effective_until`

- **Decisión**: cancelar el módulo siempre se acepta (aclaración del 2026-11-17, D-091). La inscripción pasa a `CANCELLED` con `cancelled_at = ahora` y `effective_until = ahora + STUDENT_CANCEL_LEAD_MINUTES`. Las sesiones que empiezan **antes** de `effective_until` conservan al estudiante (siguen contando como asistente, R-1); las que empiezan en `effective_until` o después quedan liberadas.
- **Motivo**: la sesión que empieza en menos de 1 hora no se puede cancelar; el estudiante sale del módulo desde la siguiente. Una columna basta; no hace falta una fila por sesión.
- **Alternativas**: bloquear la cancelación del módulo hasta que pase la sesión (descartado por el equipo); liberar también la sesión próxima (rompe la regla de la hora).

## R-5. Ausencia a una sesión

- **Decisión**: cancelar una sola sesión inserta una fila en `session_absences` (inscripción y sesión). Reactivarla marca esa fila con `deleted_at` (borrado lógico, Principio III); una nueva cancelación inserta otra fila. El índice único parcial `(enrollment_id, session_id) WHERE deleted_at IS NULL` evita duplicados.
- **Idempotencia**: cancelar una sesión ya cancelada por el estudiante, o reactivar una que no lo está, responde `200` con el estado actual, sin error: un reintento por falla de red no confunde al usuario.
- **Reglas de la acción**: la inscripción está `ACTIVE`; la sesión es del módulo, futura, `SCHEDULED` o `RESCHEDULED`; faltan al menos `STUDENT_CANCEL_LEAD_MINUTES` minutos (60 exactos se permiten); el periodo no está `CLOSED`. Reactivar, además, exige lugar libre en la sesión.
- **Alternativas**: columna `cancelled_sessions` (arreglo de ids, sin integridad referencial); estado por sesión y estudiante para todas las sesiones (miles de filas por inscripción).

## R-6. Ventana de cancelación en configuración

- **Decisión**: `STUDENT_CANCEL_LEAD_MINUTES` en `tutorias_uts_back/src/config/env.ts` y `.env.example`, entero positivo, por defecto `60`; la validación falla al arrancar si no es un entero positivo. Se lee con `ConfigService`, igual que los límites de horario de la spec 010 (D-089).
- **Motivo**: Principio III (los límites de horas no se escriben fijos). La app no calcula la regla: el servidor devuelve `canCancel`, `canRestore` y el motivo del bloqueo por sesión, y los textos usan el valor que llega en `details`.
- **Alternativas**: tabla `settings` editable por el CAE (la configuración de la spec 006 no la incluye y el límite del docente, de 2 horas, aún no tiene pantalla); constante en el código (viola el Principio III).

## R-7. Estudiante desactivado o eliminado

- **Decisión**: la inscripción se conserva y deja de ocupar cupo (FR-015): todas las consultas de asistentes e inscritos unen `users` y exigen `status = 'ACTIVE'` y `deleted_at IS NULL`. Si el CAE reactiva la cuenta, la inscripción vuelve a contar; si el módulo ya no tiene lugar, el CAE debe resolverlo a mano (caso raro, fuera de alcance).
- **Alternativas**: cancelar las inscripciones al desactivar (pierde el historial y no es reversible); contarlas siempre (una cuenta que no puede iniciar sesión ocuparía un lugar).

## R-8. Contrato de la API

- **Decisión**: siete endpoints bajo `/api/v1/student`, todos con `@Roles('STUDENT')`; el estudiante sale siempre del token, nunca de un parámetro:

  | Método y ruta | Uso |
  |---|---|
  | `GET /student/modules` | oferta del periodo Activo (búsqueda y paginación) |
  | `GET /student/modules/{id}` | detalle con sesiones futuras y su estado para el estudiante |
  | `POST /student/enrollments` | inscribirse (`{ moduleId }`) |
  | `GET /student/enrollments` | "mis tutorías" (`status` = `ACTIVE` por defecto, `CANCELLED` o `ALL`) |
  | `DELETE /student/enrollments/{id}` | cancelar el módulo completo |
  | `POST /student/enrollments/{id}/sessions/{sessionId}/cancel` | cancelar una sesión |
  | `POST /student/enrollments/{id}/sessions/{sessionId}/restore` | reactivar una sesión |

  El listado de la oferta y el detalle ya devuelven el estado del estudiante, por lo que no hace falta un endpoint de lectura de una inscripción.
- **Códigos de error nuevos** (estables, traducidos en la app): `ENROLLMENT_MODULE_FULL`, `ENROLLMENT_SCHEDULE_CONFLICT`, `ENROLLMENT_ALREADY_ACTIVE`, `ENROLLMENT_MODULE_UNAVAILABLE`, `ENROLLMENT_PERIOD_NOT_OPEN`, `ENROLLMENT_NOT_ACTIVE`, `ENROLLMENT_CANCEL_WINDOW_PASSED`, `ENROLLMENT_SESSION_NOT_CANCELLABLE`. Se reutilizan `PERIOD_CLOSED_READ_ONLY`, `VALIDATION_FAILED`, `NOT_FOUND` y `FORBIDDEN_ROLE`. `NOT_FOUND` también para inscripciones y módulos ajenos o borrados (no se revela su existencia).
- **Una inscripción ajena responde `404`**, no `403`: el guard ya filtra por rol y la búsqueda parte del estudiante del token.
- **Oferta sin consultas por tarjeta**: se cargan en bloque los módulos del periodo, sus horarios y los lugares libres por sesión (una consulta agrupada por `module_id`), y los horarios de las inscripciones activas del estudiante para calcular cruces en memoria.
- **Alternativas**: `/modules` compartido con el CAE (mezcla permisos y formas de respuesta distintas); GraphQL (no está en el stack).

## R-9. App: navegación y componentes

- **Decisión**: la pestaña "Tutorías" del estudiante (`app/(student)/modules`) pasa de archivo a carpeta con `index.tsx` y `[id].tsx`, igual que la del CAE. `index` muestra dos segmentos con `FilterChips`: "Disponibles" (oferta en tarjetas) y "Mis tutorías". El detalle `[id]` muestra el módulo y sus próximas sesiones con las acciones de cancelar o reactivar; la cancelación abre una hoja con la elección de alcance ("Solo esta sesión" o "Todo el módulo") y la regla visible.
- **Tarjeta**: la de `Design.md` ("Module card (students)"): estados Cupos disponibles, Últimos cupos (80 % o más), Lleno e Inscrito, con el texto `libres/capacidad` y la barra de capacidad. `libres` es el mínimo por sesión que entrega la API.
- **Datos**: TanStack Query con claves `['student','modules']` y `['student','enrollments']`; cada mutación invalida ambas y el detalle. Los textos de bloqueo salen del `code` del error y de `details`, sin duplicar la regla en la app. La app no recalcula cupos ni ventanas: usa `canCancel`, `canRestore` y `blockReason` del servidor.
- **Íconos nuevos** (set `solar`, registro `src/icons/registry.ts`; verificar que existan en Iconify antes de añadirlos): inscribirse, cancelar inscripción, sesión cancelada, lleno. Se reutilizan `teacher`, `clock`, `location`, `calendar`.
- **Reuso**: `SessionRow` y `format.ts` de la spec 010 si el formato coincide; si no, componentes propios. Lo decide la implementación, sin inventar componentes que nadie use.

## R-10. Notificaciones y condición de publicación

- **Decisión**: esta spec **no escribe eventos nuevos en `outbox_events`**: la inscripción y las ausencias son filas con fecha, y la spec 013 puede leerlas para avisar a los inscritos de cambios de docente, salón, hora o festivo (los eventos de la spec 010 ya existen). Lo que se registra para trazabilidad (FR-016) son las propias filas: quién (`student_id`), qué (`module_id`, `session_id`) y cuándo (`created_at`, `cancelled_at`, `deleted_at`).
- **Condición de D-087**: la rama se puede fusionar, pero la inscripción **no se publica en producción** sin la spec 013 o sin un consumidor del outbox; se deja escrito en la descripción del PR y en `tasks.md` (tarea de cierre).
- **Alternativas**: eventos `ENROLLED` y `CANCELLED` en el outbox (nadie los consume y el aviso al docente no es una regla del negocio).

## R-11. Estrategia de pruebas

- **Backend (Vitest + Supertest, PostgreSQL de prueba)**: inscribir y llenar; cruce de horarios y borde `[)`; inscripción a periodo Próximo y Cerrado; cuenta desactivada que deja de ocupar cupo; ventana de cancelación a 59, 60 y 61 minutos con `TestClock`; cancelar y reactivar sesión (con y sin lugar); cancelar el módulo con una sesión a menos de 1 hora; reinscripción; concurrencia con 20 estudiantes sobre cupo 5 (SC-002) y con dos inscripciones del mismo estudiante a la vez; el cambio de salón de la spec 010 con inscritos reales; roles (`403` docente y CAE, `401` sin token) sobre la lista de endpoints del propio contrato, y respuestas contra el esquema con `loadContract`.
- **App (Jest + RNTL)**: tarjeta en sus cuatro estados, inscribirse, bloqueo por cruce y por lleno con la regla visible, hoja de cancelación con alcance, estados vacío, de error con reintento y de carga, y paridad es/en.
- **Doble de prueba**: se mantiene `FakeConfigUsage` solo en las pruebas de la spec 010 que lo usan; el servicio real cuenta inscripciones desde ahora.
