# Quickstart: validar módulos y horario

Guía para comprobar la spec 028. Los roles están en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
npx jest src/theme src/components src/features/enrollments src/features/student-schedule src/features/teacher-sessions
```

| Qué comprueba | Cómo |
|---|---|
| Indicadores con 3:1 sobre `card`, `screen` y `surface` en ambos modos (FR-003, SC-003) | `contrast.test.ts` con los pares nuevos de `contrastPairs` |
| Ninguna pieza de la fase 2 usa `error`, `warning` ni `success` como indicador (FR-003) | `severityIndicators.test.ts` |
| Orden de la tarjeta de módulo: nombre, docente, horario, cupo, estado (FR-002) | prueba de `OfferCard` |
| Línea e ícono de sesión en oscuro con roles de texto (FR-005) | pruebas de `SessionBlock` y `TeacherSessionCard` |
| Borde de los días sin seleccionar (FR-007) | prueba de `DayStrip` |
| Modo oscuro de las piezas tocadas | `darkMode.test.tsx` |
| Inscripción, cancelación, horario, navegación y accesibilidad sin cambios (FR-009, FR-010, SC-005) | suite existente |

## Recorrido manual (teléfono con Expo Go)

1. En oscuro, abrir la lista de módulos con módulos disponibles, con últimos cupos, llenos y con cruce: barra y borde de insignia legibles.
2. Abrir el horario del estudiante y del docente con sesiones programadas, reprogramadas y canceladas: la línea y el ícono de estado se ven en ambos modos.
3. Ver la línea de la hora actual en oscuro (día de hoy).
4. Ver la tira de días: el borde de los días sin seleccionar se distingue.
5. Provocar vacío, carga y error en las 4 pantallas: mismas piezas.
6. Cambiar el modo del teléfono con cada pantalla abierta: sin reinicio ni destellos.
