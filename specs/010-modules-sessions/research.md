# Research: Módulos y sesiones (CAE)

Decisiones técnicas de la funcionalidad 010. No quedaron marcadores `NEEDS CLARIFICATION`.

## R-1. Cruces de docente y salón

- **Decisión**: tres restricciones de exclusión sobre `module_schedules` (solo filas con `deleted_at IS NULL`), con `btree_gist` ya instalado:
  - docente: `EXCLUDE USING gist (teacher_id WITH =, period_id WITH =, day_of_week WITH =, int4range(start_minute, end_minute, '[)') WITH &&)`;
  - salón: lo mismo con `room_id`;
  - mismo módulo: lo mismo con `module_id` (dos horarios del mismo módulo no se solapan).
  El rango es semiabierto `[)`: terminar a las 16:00 y empezar a las 16:00 no se solapa (escenario 6 de la historia 1).
- **Motivo**: la base de datos rechaza el cruce aunque dos peticiones lleguen a la vez (FR-007, SC-002). El servicio hace la misma consulta antes para devolver el módulo y el horario con el que choca y un `code` claro.
- **Columnas copiadas**: `period_id`, `teacher_id` y `room_id` viven también en `module_schedules` porque una restricción de exclusión solo ve su propia tabla. Cambiar docente o salón actualiza `modules` y `module_schedules` en la misma transacción; la actualización vuelve a pasar por la restricción.
- **Por qué incluir `period_id`**: dos módulos de periodos distintos pueden usar el mismo día y hora; los periodos no se solapan (D-072) y el cruce solo importa dentro del periodo.
- **Alternativas**: solo validar en el servicio (vulnerable a carreras); una restricción sobre sesiones (no cubre horarios sin sesiones generadas y exige miles de filas por comprobar); bloqueo consultivo (no impide datos inválidos escritos por otra vía).
- **Riesgo**: Prisma no modela las exclusiones; se escriben en la migración SQL y se verifica con `prisma migrate diff` que no proponga eliminarlas (igual que en la spec 006).

## R-2. Periodo Cerrado y cierres simultáneos

- **Decisión**: toda operación que escribe en módulos, horarios o sesiones corre en una transacción que empieza con `SELECT ... FROM academic_periods WHERE id = $1 AND deleted_at IS NULL FOR SHARE` y rechaza si `status = 'CLOSED'` con `PERIOD_CLOSED_READ_ONLY` (ya existe). El cierre (`UPDATE` del periodo) espera a que terminen las escrituras en curso y las nuevas ven el estado `CLOSED`.
- **Motivo**: el caso límite "el periodo se cierra mientras el CAE edita" debe rechazar el guardado, no dejar pasar una escritura en un periodo cerrado.
- **Detalle**: el cierre automático ya se aplica al leer el periodo (`closeExpired`, spec 006); `ModulesService` llama a esa operación antes de abrir la transacción.
- **Alternativas**: comprobar el estado al inicio sin bloquear (ventana entre lectura y escritura); `SERIALIZABLE` (reintentos y más costo para un caso raro).
- **Crear en periodo Próximo o Activo**: solo se rechaza `CLOSED` (los módulos de un periodo cerrado son de solo lectura; los periodos Próximos permiten crear módulos para prepararlos).

## R-3. Horario como minutos locales

- **Decisión**: `module_schedules` guarda `day_of_week` (1 = lunes a 7 = domingo, `CHECK` 1..7) y `start_minute` y `end_minute` (minutos desde la medianoche de Bogotá, `CHECK` `0 <= start < end <= 1439`). La API expone `startTime` y `endTime` como `"HH:mm"`.
- **Motivo**: la restricción de exclusión se escribe con `int4range` sin funciones de extracción, y el `CHECK` obliga a que inicio y fin estén el mismo día (el horario no cruza la medianoche). `Architecture.md` decía `startTime` y `endTime`: es el mismo dato en otra representación y se actualiza el documento.
- **Alternativas**: `TIME` (Prisma lo devuelve como `Date` de 1970, conversiones propensas a errores y la exclusión necesita expresiones).
- **Límite**: el fin máximo es 23:59 (`end_minute <= 1439`); un horario que termine a las 24:00 no se admite, por simplicidad (FR-003).

## R-4. Generación de sesiones

- **Decisión**: función pura `occurrences(period, schedules, holidays, now)` en `sessions.rules.ts` que devuelve, por cada horario, las fechas (`YYYY-MM-DD`) desde `startsOn` hasta `endsOn` (inclusive) cuyo día de la semana coincide, sin festivos y con `startsAt > now`. La conversión es una sola: `startsAt = Date.UTC(y, m, d, 0, minute + 300)` (Bogotá es UTC-5 todo el año; la constante ya existe en `common/clock.ts`). `sessions.generator.ts` escribe las filas con `INSERT ... ON CONFLICT DO NOTHING` sobre el índice único `(schedule_id, original_starts_at)` parcial a `deleted_at IS NULL`, de modo que repetir la generación no duplica.
- **Motivo**: idempotente, probada con funciones puras (conteo de martes en un periodo, festivos, periodo en curso) y reutilizable al borrar un festivo y al regenerar horarios.
- **Periodo en curso** (FR-005): solo se generan las sesiones con `startsAt > now`. Un horario sin ocurrencias en el periodo deja el módulo sin sesiones para ese día y la respuesta incluye `sessionsGenerated` por horario para que la app avise.
- **Alternativas**: generar bajo demanda al consultar (las specs de inscripción y cancelación necesitan filas reales y estado por sesión); una librería de recurrencia (dependencia para una regla semanal fija).

## R-5. Cambio de horarios semanales (solo sin inscritos)

- **Decisión**: `PUT /modules/:id/schedules` reemplaza todos los horarios en una transacción: bloquea el periodo (R-2), cuenta inscritos activos (`ConfigUsageService`) y rechaza con `MODULE_HAS_ENROLLMENTS` si hay alguno; marca como eliminados (`deleted_at`) los horarios y las sesiones **futuras** anteriores, inserta los nuevos horarios (las exclusiones se evalúan sin contar los eliminados) y genera las sesiones. Las sesiones pasadas se conservan con su horario original.
- **Motivo**: FR-013. Con inscritos, la hora de una sesión o de las futuras la cambia el docente (spec 012), que valida disponibilidad y avisa.
- **Alternativas**: permitir el cambio y notificar (el CAE no tiene validación de cruces con los estudiantes; la pregunta de reprogramación sigue abierta en `Context.md`).

## R-6. Docente y salón por sesión

- **Decisión**: `module_sessions` guarda `teacher_id` y `room_id` al generarse. Cambiar docente o salón del módulo actualiza `modules`, `module_schedules` y las sesiones con `starts_at > now()` y `deleted_at IS NULL` (incluidas las canceladas por festivo); las pasadas no cambian (clarificación 2).
- **Motivo**: historial fiel de quién dictó qué y dónde; la spec 012 leerá el salón y el docente de la sesión sin reconstruirlos.
- **Cupo**: sigue leyéndose de `rooms.capacity` del salón **actual del módulo**; la sesión no guarda cupo.
- **Alternativas**: sesiones sin docente ni salón y herencia del módulo (cambiar el módulo reescribe el pasado).

## R-7. Cambio de salón y capacidad

- **Decisión**: `PATCH /modules/:id/room` abre transacción, bloquea el periodo (R-2) y la fila del módulo (`FOR UPDATE`), exige salón `ACTIVE` y no eliminado, cuenta inscritos activos (`ConfigUsageService.countActiveEnrollments`) y rechaza con `MODULE_ROOM_CAPACITY_BELOW_ENROLLED` si `capacity < inscritos`, con las dos cifras en `details`. Luego actualiza como en R-6; un cruce lo detecta la exclusión (`MODULE_ROOM_CONFLICT`).
- **Motivo**: FR-010. El bloqueo del módulo evita que una inscripción simultánea (spec 011, que bloquea la misma fila) se cuele entre el conteo y la escritura.
- **ConfigUsageService**: `countModulesInPeriod` y `getRoomUsage` pasan a consultar módulos reales; se añade `countActiveEnrollments(moduleId)` que devuelve 0 hasta la spec 011. Las pruebas lo sustituyen por un doble.

## R-8. Festivos

- **Decisión**: tabla `holidays` (`date` DATE, `name`, `source` MANUAL o IMPORTED, `deleted_at`) con índice único parcial sobre `date` entre no borrados. Alta, edición y baja solo del CAE; los festivos pasados no se editan ni eliminan (`HOLIDAY_IN_PAST`, comparando con el día de hoy en Bogotá).
- **Al registrar** (transacción): las sesiones `SCHEDULED` con `starts_at` futura y cuya fecha en Bogotá es la del festivo pasan a `CANCELLED` con `cancel_reason = 'HOLIDAY'` y `holiday_id`; se registra un evento por módulo afectado (R-10). **Al eliminar**: las sesiones con ese `holiday_id`, futuras y sin cruce de salón o docente con otra sesión no cancelada, vuelven a `SCHEDULED`; después el generador (R-4) crea las que faltaban porque el festivo existía al crear el módulo. La respuesta lista `restored` y `notRestored` con el motivo.
- **Motivo**: FR-005a, FR-022 y FR-025. Un festivo borrado debe devolver la fecha tanto a las sesiones canceladas como a las que nunca se generaron.
- **Periodos Cerrados**: registrar o eliminar un festivo no cancela, restaura ni genera sesiones de módulos de un periodo `CLOSED` (un periodo activo cerrado a mano conserva sesiones futuras, pero es de solo lectura, FR-015).
- **Fechas pasadas**: no se registran, editan ni eliminan festivos con fecha anterior a hoy en Bogotá; la vista previa de importación las marca con `isPast` y la importación las omite, porque no hay sesiones futuras que afectar.
- **Fuera de alcance**: sesiones `RESCHEDULED` movidas a un festivo y festivos por sede o módulo; los define la spec 012 si hacen falta.

## R-9. Importación desde Nager.Date

- **Decisión**: el servidor (no la app) consulta `GET {HOLIDAYS_API_BASE_URL}/PublicHolidays/{año}/{HOLIDAYS_COUNTRY}` (por defecto `https://date.nager.at/api/v3` y `CO`) con `AbortSignal.timeout(HOLIDAYS_TIMEOUT_MS)` (10 000 ms). Valida que la respuesta sea una lista de objetos con `date` (`YYYY-MM-DD` real del año pedido) y `localName` o `name`; descarta elementos inválidos y, si la lista queda vacía o no es una lista, responde `502 HOLIDAYS_IMPORT_UNAVAILABLE`. Solo importa los de tipo `Public`.
  - `GET /holidays/import-preview?year=` devuelve la lista con `alreadyExists` por fecha; no guarda nada.
  - `POST /holidays/import` recibe `{ year, dates[] }` y **vuelve a consultar** el servicio: solo guarda las fechas confirmadas que también estén en la respuesta, saltando las existentes. No guarda nada si la consulta falla.
- **Verificado el 2026-11-17**: la URL de ejemplo responde una lista JSON con `date`, `localName` (en español), `name` (en inglés), `types` y otros campos. Como es un servicio público sin garantía, se valida y no se confía en la forma.
- **Privacidad**: solo salen el año y el código de país. Sin cabeceras con datos del usuario ni del proyecto; el cliente se identifica con un nombre genérico.
- **Nombre**: se guarda `localName` (español), editable; los nombres se muestran tal como se guardaron (no se traducen).
- **Alternativas**: consultar desde la app (expone la dependencia en cada dispositivo y no se puede validar en servidor); guardar la lista en el repositorio (festivos móviles de Colombia cambian cada año); librería de festivos (dependencia y datos desactualizados).
- **Riesgo**: cambio del formato o caída del servicio; por eso el calendario manual siempre funciona y el cliente va tras una interfaz para sustituirlo en las pruebas.

## R-10. Eventos para notificaciones (FR-021)

- **Decisión**: tabla `outbox_events` (`id`, `type`, `module_id`, `payload` JSON, `created_at`, `processed_at` nulo). `OutboxService.record(tx, ...)` escribe en la misma transacción del cambio. Tipos: `MODULE_TEACHER_CHANGED`, `MODULE_ROOM_CHANGED`, `SESSIONS_CANCELLED_HOLIDAY` y `SESSIONS_RESTORED_HOLIDAY`. La spec 013 los lee y envía; aquí no se envía nada.
- **Motivo**: patrón de bandeja de salida: el cambio y su registro son atómicos y nada se pierde si las notificaciones aún no existen.
- **Alternativas**: emitir eventos en memoria (se pierden al reiniciar); encolar en BullMQ ya (el canal y las plantillas son de la spec 013).

## R-11. Sesiones y estado del módulo

- **Decisión**: `module_sessions.status` usa `SCHEDULED`, `RESCHEDULED` y `CANCELLED` como en `Architecture.md`, más `cancel_reason` (`HOLIDAY` por ahora, nulo si no está cancelada). `Module` no guarda estado propio: está vigente mientras `deleted_at IS NULL`; que el periodo esté Cerrado se deriva del periodo.
- **Motivo**: evita un estado duplicado que pueda quedar desfasado del periodo.

## R-12. Listados y selectores

- **Decisión**: `GET /modules` pagina y filtra por `periodId` (por defecto el activo, o el próximo más cercano si no hay activo, se resuelve en el servidor), `search` (nombre, sin distinguir mayúsculas), `teacherId` y `roomId`, y devuelve `capacity` y `enrolled` calculados. El selector de salón reutiliza `GET /rooms` con `status=ACTIVE`. El de docente necesita `GET /teachers`, que **no existe todavía** (la spec 001 solo creó `POST /teachers`): se agrega un listado de solo lectura para el CAE con `search` y `status`, que devuelve `id`, nombres y estado, sin contraseñas ni datos de acceso.
- **Docente o salón que deja de estar disponible** (FR-027, D-088): no se bloquea su desactivación fuera de las reglas de la spec 006. `GET /modules` y `GET /modules/:id` devuelven `teacherUnavailable` y `roomUnavailable` (inactivo, eliminado o sin rol docente) para que la app marque el módulo y el CAE lo reasigne; las sesiones futuras se conservan. Alternativa descartada: impedir desactivar a un docente con módulos en el periodo activo (obliga a reasignar antes de dar de baja a alguien y amplía la spec 001).

## R-13. App: navegación y pantallas

- **Decisión**: `app/(admin)/modules/index.tsx` pasa a ser el listado de módulos (selector de periodo, búsqueda y chips de docente y salón); un botón de la barra superior abre `modules/rooms.tsx` (la pantalla actual de salones y ubicaciones). El detalle `[id].tsx` muestra datos, horarios, cupo y sesiones, con acciones por fila de menú: Editar, Cambiar salón, Cambiar docente, Eliminar. Los selectores de docente y salón son hojas inferiores con búsqueda; la opción de un salón sin capacidad suficiente se ve deshabilitada con el mensaje de regla (`Design.md`, "Module management"). Festivos: `more/holidays.tsx` con lista por año, `holiday-form.tsx` y `holidays-import.tsx` con vista previa y casillas.
- **Motivo**: cumple la barra de pestañas fijada en `Design.md` y reutiliza `DateField`, `BrandLoader` y los componentes de lista de la spec 006.
- **Alternativas**: dejar salones en la pestaña y colgar módulos de Más (contradice `Design.md`).
