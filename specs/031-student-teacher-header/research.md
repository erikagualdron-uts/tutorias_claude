# Research: Cabecera de marca en estudiante y docente

Sin `NEEDS CLARIFICATION` abiertos. Medido en el código el 2026-11-24 (`tutorias_uts_mobile`, rama de la spec 030).

## R-1. Estructura real de las pantallas (medida)

| Pantalla | Cómo abre hoy | Lo que hay debajo |
|---|---|---|
| Módulos del estudiante (`StudentModulesScreen`) | Un `Text` de título (`student.modules.title`) dentro del `ScrollView` | Dos segmentos con `FilterChips` (disponibles y «mis módulos»; este último monta `MyEnrollmentsScreen`, que no tiene ruta propia), búsqueda y tarjetas de módulo |
| Horario del estudiante (`StudentScheduleScreen`) | Sin título: solo una `Card` con el calendario dentro del `ScrollView` | `WeekCalendar` (rango de semana, vistas de día y semana, tira de días, rejilla) |
| Horario del docente (`TeacherScheduleScreen`) | Un `Text` de título (`teacher.schedule.title`, «Cronograma») | Una `Card` con el calendario y la lista de próximas sesiones (`TeacherSessionCard`) |

- **Decisión**: la pieza `ScreenHeader` de la spec 029 reemplaza el título de texto de módulos y del horario del docente, y se agrega encima de la tarjeta del calendario en el horario del estudiante. No hay pieza nueva ni cambia el calendario.
- **Alternativas**: integrar la cabecera dentro del calendario o de `CalendarHeader` (descartada: es una pieza compartida con el docente y cambiaría su estructura, que la spec manda conservar); dejar el horario sin cabecera (descartada: es lo que pidió la persona dueña del producto).

## R-2. Qué muestra cada cabecera (FR-001, FR-005, sin textos nuevos)

| Pantalla | Título (texto existente) | Número |
|---|---|---|
| Módulos del estudiante | `student.modules.title` | `offer.data?.data.length` solo en el segmento «disponibles»; en «mis módulos», sin número (esa lista tiene su propia carga) |
| Horario del estudiante | `tabs.schedule` («Cronograma»; el mismo texto de su pestaña) | ninguno (es un calendario) |
| Horario del docente | `teacher.schedule.title` | ninguno (es un calendario) |

El detalle de módulo del estudiante y los inicios no llevan cabecera.

## R-3. Espacio del calendario (SC-003, FR-003)

- **Hallazgo**: `ScreenHeader` mide unos 70 px (relleno de 16, título de 32 de interlineado, línea de 4 y márgenes) más 16 de separación; en un teléfono de 640 px de alto, con la barra superior y la de pestañas, quedan unos 400 px útiles. El calendario ya desplaza dentro de su `ScrollView`; la cabecera se desplaza con el contenido, no queda fija.
- **Decisión**: la cabecera va dentro del `ScrollView` (se va al desplazar), de modo que no resta altura permanente al calendario. SC-003 se verifica en el teléfono; si en el recorrido el primer bloque de horas no se ve sin desplazar, se reduce el relleno de la cabecera en estas pantallas (no el de las demás) antes de cerrar.
- **Alternativas**: cabecera fija encima del `ScrollView` (descartada: resta altura al calendario); cabecera solo en la vista de semana (descartada: rompe la consistencia entre vistas).

## R-4. Guardas (FR-002, FR-008)

- `headerBudget.test.ts` suma a `WITH_HEADER` las 3 pantallas (`StudentModulesScreen`, `StudentScheduleScreen`, `TeacherScheduleScreen`) y a `FORMS` (sobrias sin cabecera) `StudentModuleDetailScreen`; los inicios no están en la lista (son expresivos).
- `severityIndicators.test.ts` ya cubre `src/features/enrollments`, `student-schedule` y `teacher-sessions`: no cambia.

## R-5. Documento (FR-002, FR-010)

- **Decisión**: `Design.md` suma el horario del estudiante, el del docente y los módulos del estudiante a la fila **Sober with header** y aclara en el registro sobrio que el detalle de módulo y de sesión siguen sin cabecera. D-128.

## R-6. Verificación manual

- **Decisión**: recorrido final de las 3 pantallas con cabecera en claro y oscuro, español e inglés, en vista de día y de semana, con sesiones programadas, reprogramadas y canceladas, con y sin inscripciones, y comprobando SC-003 (primeras horas visibles sin desplazar). Se anota en `screen-inventory.md`.

## R-7. Orden de ramas

- **Decisión**: la rama de `tutorias_uts_mobile` se crea desde `030-chat-pqrs-profile` (PR #20 abierto); la de `Claude`, ya creada desde `030-chat-pqrs-profile` (PR #23 abierto). Cada PR apunta a la rama anterior hasta que se fusione la base.
