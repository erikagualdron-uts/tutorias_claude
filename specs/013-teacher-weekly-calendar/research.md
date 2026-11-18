# Research: Calendario semanal del docente

Decisiones técnicas de la funcionalidad 013. No quedaron marcadores `NEEDS CLARIFICATION`.

## R-1. De dónde salen las sesiones de una semana

- **Decisión**: un endpoint nuevo de solo lectura, `GET /teacher/calendar?from&to`, con el rango de días de Bogotá (inclusivos, máximo 7 días). Devuelve todas las sesiones del docente en el rango (pasadas y futuras, de cualquier estado) con la misma forma `TeacherSession` de la spec 012, más el periodo y las horas permitidas.
- **Motivo**: `GET /teacher/sessions` solo devuelve sesiones futuras (`startsAt > ahora`) y su paginación sirve a las tarjetas "próximas"; cambiarlo rompería el contrato de la 012 y las tarjetas (FR-008 exige que no cambien al navegar). Un endpoint por semana permite SC-002 (menos de 2 s) con una consulta acotada.
- **Alternativas**: agregar `includePast` a `/teacher/sessions` (mezcla dos usos y obliga a recordar que "desde ahora" ya no aplica); traer todo el periodo de una vez (decenas de sesiones por horario, innecesario para ver una semana).
- **Reutilización**: `TeacherScheduleService.views()` (hoy privado) arma la vista, incluidos `attendees` y las banderas de acción (`canReschedule`, `blockReason`). El método nuevo `calendar()` vive en el mismo servicio y la hoja de acciones de la 012 funciona sin cambios.

## R-2. Qué periodo se muestra

- **Decisión**: el periodo **Activo**; si no hay, el periodo **Cerrado** más reciente (por fecha de fin), en solo lectura (`readOnly`); si tampoco hay, `period: null` y `data: []`. Los periodos Próximos no se muestran (como en la 012).
- **Motivo**: FR-006 limita la navegación al periodo Activo y FR-007 pide solo lectura en periodos Cerrados. Sin periodo Activo el docente aún puede revisar lo último que dictó. La bandera de solo lectura ya la produce `sessionChangeActions` (`PERIOD_CLOSED`).
- **Alternativa**: no mostrar nada sin periodo Activo (el docente perdería la consulta de lo ya dictado tras el cierre).

## R-3. Límites del periodo y horas permitidas, desde el servidor

- **Decisión**: la respuesta incluye `meta.period` (`id`, `startsOn`, `endsOn`, `status`) y `meta.hours` (`earliest`, `latest`, tomadas de `MODULE_EARLIEST_TIME` y `MODULE_LATEST_TIME`).
- **Motivo**: FR-006 necesita las fechas del periodo para limitar las flechas y FR-017 pide no escribir las horas en el código. Hoy la app tiene `EARLIEST_TIME` y `LATEST_TIME` fijos en `features/modules/schemas.ts` (D-089 lo permitía para formularios); el calendario no los usa y lee los de la respuesta. Se deja anotado que esa constante de la app debería salir también de la configuración, fuera del alcance de esta spec.
- **Alternativa**: `GET /periods/active` y un endpoint de configuración (dos llamadas más y un endpoint nuevo de configuración pública).

## R-4. Cómo se ubica una sesión en el día

- **Decisión**: la app convierte `startsAt` y `endsAt` (UTC) a día y minutos de Bogotá con `bogotaParts` (ya existe en `features/modules/format.ts`) y el día como texto `YYYY-MM-DD` con `src/date/day.ts` (D-081). Una sesión se coloca por su hora de Bogotá, nunca por UTC. Sin librería de fechas nueva.
- **Motivo**: evita corrimientos de un día (caso borde de la spec) y cumple la regla de una sola vía de fechas.

## R-5. Teléfono o tableta

- **Decisión**: la vista inicial es **Semana** cuando el ancho de ventana es de 600 dp o más y **Día** en caso contrario (`useWindowDimensions`). El docente puede cambiarla con un control segmentado y su elección se conserva mientras la pantalla está abierta (estado local, no se guarda en el dispositivo).
- **Motivo**: 600 dp es el corte estándar entre teléfono y tableta pequeña. Guardar la preferencia en disco no se pidió.
- **Alternativa**: detectar por tipo de dispositivo (poco fiable en plegables y ventanas divididas).

## R-6. Bloques que se solapan

- **Decisión**: en ambas vistas los bloques se posicionan por su hora dentro del rango visible. El sistema ya impide cruces del mismo docente (D-085); si hubiera datos antiguos solapados, los bloques se reparten el ancho de la columna en partes iguales y ninguno tapa a otro.
- **Alternativa**: un algoritmo de agrupación de eventos como el de calendarios generales; es más código para un caso que las reglas ya evitan.

## R-7. Refresco tras un cambio

- **Decisión**: las consultas del calendario usan la clave `['teacher', 'calendar', from]`; `useInvalidateTeacher()` de la 012 ya invalida `['teacher']`, así que el calendario y las tarjetas se actualizan solos tras reprogramar, cancelar o restaurar (FR-010).
- **Alternativa**: invalidar a mano cada clave (se olvidaría al agregar otra).

## R-8. Componente reutilizable

- **Decisión**: el calendario se construye en `src/components/calendar/` sin conocer al docente: recibe una lista de elementos (`id`, título, salón, línea secundaria, inicio, fin, estado, insignia) y callbacks. La pantalla del docente traduce `TeacherSession` a esos elementos. Los textos fijos del calendario (Hoy, Día, Semana, "Fuera del periodo académico") viven en `es.json` y `en.json` bajo `calendar.*`; el texto de cada bloque lo prepara quien lo usa.
- **Motivo**: FR-015. El estudiante y el CAE lo adoptarán después sin copiarlo.
- **Alternativa**: dentro de `features/teacher-sessions/` (obligaría a moverlo luego).

## R-9. Animaciones y movimiento

- **Decisión**: cambio de semana y de día con un desvanecimiento corto (`FadeInView`/`useMotion` ya existentes, 150–250 ms); con "reducir movimiento" no hay animación. Sin librería nueva ni gestos de arrastre.
- **Motivo**: cumple el estilo del proyecto y la regla de accesibilidad con lo que ya hay.
