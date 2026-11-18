# Research: Configuración del CAE

Decisiones técnicas de la funcionalidad 006. No quedaron marcadores `NEEDS CLARIFICATION`.

## R-1. Un solo periodo activo

- **Decisión**: índice único parcial sobre `status` donde `status = 'ACTIVE' AND deleted_at IS NULL`, creado en la migración con SQL.
- **Motivo**: la base de datos rechaza un segundo activo aunque dos peticiones lleguen a la vez (FR-010, SC-002). El servicio valida antes para dar un error claro.
- **Alternativas**: solo validar en el servicio (vulnerable a carreras); bloqueo consultivo (más piezas, no impide datos inválidos escritos por otra vía).

## R-2. Sin solapamiento de fechas

- **Decisión**: restricción de exclusión `EXCLUDE USING gist (daterange(starts_on, ends_on, '[]') WITH &&) WHERE (deleted_at IS NULL)`, con la extensión `btree_gist`. El rango es cerrado en ambos extremos, así un fin igual a un inicio cuenta como solapamiento (FR-009).
- **Motivo**: garantiza la regla a nivel de datos. El servicio hace la misma consulta antes para devolver el periodo con el que choca (escenario 2 de la historia 1).
- **Alternativas**: comparar en el servicio (carrera); trigger propio (más código que la restricción nativa).
- **Riesgo**: Prisma no modela restricciones de exclusión ni índices parciales. Se declaran solo en la migración SQL; hay que verificar con `prisma migrate diff` que no genere una migración que las elimine. Si el proveedor de PostgreSQL no permite `btree_gist`, se revisa antes de desplegar.

## R-3. Activación con confirmación

- **Decisión**: `POST /academic-periods/:id/activate` con `confirmCloseActive` opcional. Si hay un activo y la bandera no es `true`, responde `409 PERIOD_ACTIVE_EXISTS` con el periodo activo en `details`; la app muestra el aviso y reenvía con `true`. Con la bandera, una sola transacción cierra el activo y activa el nuevo.
- **Motivo**: la confirmación queda impuesta por el servidor y no solo por la app (principio II). La transacción evita estados intermedios sin periodo activo.
- **Detalle**: dentro de la transacción se bloquea la fila del periodo activo (`SELECT ... FOR UPDATE`) y se cierra antes de activar, porque el índice único parcial se comprueba fila a fila.
- **Alternativas**: dos endpoints (cerrar y luego activar): permite quedar sin periodo si el segundo falla.

## R-4. Estados y cierre automático

- **Decisión**: enumeración `PeriodStatus { UPCOMING, ACTIVE, CLOSED }` guardada. Todo periodo nace `UPCOMING`. Transiciones: `UPCOMING → ACTIVE` (solo manual y solo si `endsOn` no ha pasado), `ACTIVE → CLOSED` (manual o automático), sin retorno. Un periodo `CLOSED` es de solo lectura.
- **Cierre automático**: una tarea programada con `@nestjs/schedule` corre cada 15 minutos y cierra el periodo activo cuyo día `endsOn` ya terminó en `America/Bogota` (es decir, `endsOn + 1 día` a las 00:00 hora de Bogotá, equivalente a las 05:00 UTC). Además, el servicio llama a la misma operación al consultar el periodo activo, así que el estado correcto no depende de la puntualidad de la tarea. La operación es idempotente.
- **Motivo**: `Architecture.md` ya prevé `@nestjs/schedule`; evita sumar una cola. Un cierre tardío de 15 minutos no afecta a nadie porque al consultar se corrige.
- **Alternativas**: estado derivado puro de las fechas (descartado por la clarificación 1: la activación es manual); trabajo en BullMQ con repetición (más infraestructura para una sola tarea periódica).

## R-5. Fechas del periodo

- **Decisión**: `starts_on` y `ends_on` son `DATE` (fecha de calendario en Bogotá), expuestas como `YYYY-MM-DD`.
- **Motivo**: un periodo se define por días, no por instantes; guardarlas como `timestamptz` obliga a escoger una hora arbitraria y complica el solapamiento. Las sesiones de módulos (spec posterior) sí usan UTC y se generan convirtiendo desde Bogotá.
- **Alternativas**: `timestamptz` a medianoche UTC (se corre un día al mostrar en Bogotá).

## R-6. Unicidad que ignora mayúsculas y borrados

- **Decisión**: índices únicos parciales sobre `lower(btrim(name))` donde `deleted_at IS NULL`: periodo (nombre), ubicación (nombre) y salón (`location_id`, nombre). Los DTO recortan espacios (`trim.decorator` ya existe).
- **Motivo**: el nombre de un registro eliminado queda libre y "A-101" y "a-101" no coexisten en la misma ubicación (supuesto de la spec).
- **Riesgo**: mismo que R-2 respecto a Prisma; el servicio traduce la violación de unicidad (`P2002`/`23505`) al `code` correcto como respaldo.

## R-7. Reglas que dependen de módulos y PQRS

- **Decisión**: `ConfigUsageService` (módulo `config-usage/`) expone: `countModulesInPeriod`, `getRoomUsage(roomId)` (módulos en periodo activo, módulos en periodos Próximos e inscritos máximos) y `isDropdownItemInUse(itemId)`. Hoy devuelven 0 o `false`. Las funcionalidades de módulos y PQRS reemplazan su cuerpo con consultas reales.
- **Motivo**: deja cableadas y probadas las reglas FR-014, FR-021 y FR-027 (con un doble en las pruebas) y evita tocar los servicios de configuración cuando lleguen los módulos.
- **Aviso previo a desactivar**: `GET /rooms/:id/impact` devuelve esas cifras para que la app muestre cuántos módulos Próximos quedarían con un salón inactivo antes de confirmar (clarificación 3).
- **Alternativas**: consultar tablas inexistentes (no compila); omitir las reglas hasta módulos (se pierde la cobertura).

## R-8. Selector de fecha en la app

> **Sustituida por la spec 008 (D-079, D-081):** las fechas se eligen con `DateField` y el selector del sistema; ya no hay campo de texto `AAAA-MM-DD`.

- **Decisión**: reutilizar los componentes de campo existentes (`FieldBox`, `TextField`) con un campo de fecha de texto `AAAA-MM-DD` validado con Zod, y un selector nativo solo si ya hay una librería de fechas elegida. A confirmar en la primera tarea de la app; si hace falta una dependencia nueva, se pregunta antes de añadirla (`Conventions.md` §5 pide una sola librería de fechas).
- **Motivo**: `package.json` de la app no incluye selector de fecha; no se agrega una dependencia sin decidirlo.

## R-9. Reordenar elementos de lista

- **Decisión**: botones "subir" y "bajar" (48 px, ícono, `accessibilityLabel`) por elemento; cada toque envía el orden completo con `PUT /dropdown-lists/:key/items/order` (lista de ids), y el servidor renumera `sort_order` 1..n en una transacción.
- **Motivo**: accesible y simple; arrastrar y soltar exige una librería nueva y es difícil de usar con lector de pantalla.
- **Alternativas**: arrastrar y soltar (dependencia nueva, accesibilidad).

## R-10. Lista "Tipos de PQRS" precargada

- **Decisión**: la migración inserta la lista (`key = 'PQRS_TYPE'`) y sus cuatro elementos con etiquetas en español e inglés (Petición/Request, Queja/Complaint, Reclamo/Claim, Sugerencia/Suggestion) con ids fijos. Así existe en cualquier entorno, no solo en desarrollo. El `seed.ts` de desarrollo agrega, además, periodo, ubicación y salones de ejemplo.
- **Motivo**: FR-029 exige que el sistema "traiga" la lista; un seed solo de desarrollo no lo cumple en producción.
- **Alternativas**: solo seed (falta en producción).

## R-11. Lectura de listas por los selectores

- **Decisión**: `GET /dropdown-lists/:key/items` para cualquier rol autenticado devuelve solo elementos `ACTIVE` y no eliminados, ordenados por `sort_order`, con `labelEs` y `labelEn`. La app elige la etiqueta según el idioma del dispositivo; si no es español ni inglés, usa español (constitución VI).
- **Motivo**: el servidor no necesita conocer el idioma del dispositivo; la app ya lo resuelve con i18next. La administración (`GET /dropdown-lists` y `GET /dropdown-lists/:key`) queda solo para el CAE e incluye inactivos.
- **Caché de la app**: TanStack Query con `staleTime` corto para que un cambio se vea en la siguiente apertura del selector (SC-006).

## R-12. Eliminar una ubicación con salones inactivos

- **Decisión**: una transacción verifica que no haya salones activos y que ningún salón a eliminar tenga uso bloqueante (`ConfigUsageService`), y luego marca `deleted_at` en los salones y en la ubicación. `GET /locations/:id` devuelve `roomCounts` (activos e inactivos) para que la confirmación muestre cuántos salones se eliminarán (clarificación 4).
- **Alternativas**: restricción de clave foránea con cascada física (prohibida por borrado lógico).

## R-13. Permisos y lecturas abiertas

- **Decisión**: todos los endpoints de administración usan `@Roles(SUPERADMIN)`. Los únicos accesibles a otros roles autenticados son `GET /academic-periods/active` y `GET /dropdown-lists/:key/items`. Una prueba e2e recorre todos los endpoints con docente y estudiante y espera `403` (o `200` solo en esos dos).
- **Motivo**: FR-001, FR-002, FR-016, SC-004.

## R-14. Códigos de error nuevos

`PERIOD_NAME_TAKEN`, `PERIOD_DATES_INVALID`, `PERIOD_DATES_OVERLAP`, `PERIOD_ACTIVE_EXISTS`, `PERIOD_CLOSED_READ_ONLY`, `PERIOD_HAS_MODULES`, `PERIOD_NOT_UPCOMING`, `PERIOD_ALREADY_ENDED`, `PERIOD_NOT_ACTIVE`, `LOCATION_NAME_TAKEN`, `LOCATION_HAS_ACTIVE_ROOMS`, `ROOM_NAME_TAKEN`, `ROOM_CAPACITY_INVALID`, `ROOM_IN_ACTIVE_PERIOD`, `ROOM_CAPACITY_BELOW_ENROLLED`, `ROOM_INACTIVE_OR_DELETED`, `DROPDOWN_LABEL_REQUIRED`, `DROPDOWN_ITEM_IN_USE`, `DROPDOWN_ORDER_INVALID`. Cada una con su texto en `es.json` y `en.json`.
