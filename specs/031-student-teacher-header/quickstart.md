# Quickstart: validar la cabecera en estudiante y docente

Guía para comprobar la spec 031. Las pantallas están en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
npx jest src/theme src/features/enrollments src/features/student-schedule src/features/teacher-sessions src/components
```

| Qué comprueba | Cómo |
|---|---|
| Una sola cabecera y ningún patrón en las 3 pantallas, y ninguna en el detalle de módulo (FR-001, FR-002) | `headerBudget.test.ts` |
| La cabecera muestra el título existente y, en módulos, el número solo en «disponibles» (FR-001, FR-005) | pruebas de cada pantalla |
| El calendario, la navegación de semana, las vistas y las tarjetas de sesión no cambian (FR-003, FR-007) | pruebas existentes del calendario |
| Inscripción, cancelación, horario, navegación y accesibilidad sin cambios (FR-006, FR-007, SC-004) | suite existente |
| Guardas de las specs 026 a 030 en verde (FR-008, SC-005) | suite completa |

## Recorrido manual (teléfono con Expo Go)

1. En claro y oscuro, abrir módulos del estudiante, horario del estudiante y horario del docente: la misma cabecera verde compacta que administración, sin patrón.
2. Módulos: el número aparece en «disponibles» y desaparece en «mis módulos»; con la lista vacía muestra 0 y debajo el estado vacío.
3. Horarios: cabecera arriba y calendario debajo; en un teléfono de unos 640 px de alto, la vista del día muestra las primeras horas sin desplazar (SC-003). Cambiar entre día y semana, y de semana, sin que la cabecera cambie.
4. Docente: la lista de próximas sesiones sigue con sus indicadores de estado y la cabecera es el único bloque de color.
5. En inglés y con letra grande: título y número no se cortan.
6. Cambiar el modo del teléfono con cada pantalla abierta: sin reinicio ni destellos.
