# Quickstart: validar administración del CAE

Guía para comprobar la spec 029. Las piezas están en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
npx jest src/theme src/components src/features/accounts src/features/periods src/features/holidays src/features/rooms src/features/modules src/features/dropdown-lists src/features/smtp src/features/dashboard
```

| Qué comprueba | Cómo |
|---|---|
| Ningún indicador usa `error`, `warning` ni `success` en las carpetas de la fase (FR-002, FR-003, SC-003) | `severityIndicators.test.ts` |
| Una sola cabecera por pantalla y ningún patrón (FR-013, SC-008) | `headerBudget.test.ts` |
| Título, número, rol de cabecera, degradado y contraste del texto (FR-014) | `ScreenHeader.test.tsx` |
| Cada lista muestra su cabecera con el número correcto, sin textos nuevos (FR-013, FR-014) | pruebas de cada pantalla |
| Cuenta activa, estado SMTP, barra de PQRS, menú y campo con error en ambos modos (FR-002) | pruebas de las piezas y `darkMode.test.tsx` |
| Administración, cuentas, periodos, feriados, SMTP, navegación y accesibilidad sin cambios (FR-008, FR-009, SC-005) | suite existente |

## Recorrido manual (teléfono con Expo Go)

1. En claro y oscuro, abrir cada lista de administración (módulos, sedes, salones, docentes, estudiantes, periodos, festivos, listas desplegables y sus elementos), los cambios y el índice de «Más»: una cabecera verde compacta con el título y el número, igual en todas, sin patrón.
2. Con una lista vacía: la cabecera muestra `0` y debajo el estado vacío con su acción.
3. Cuentas: el ícono de «activa» y el estado se leen; SMTP: configurada, por reconfigurar y sin configurar se leen; tablero del CAE: la barra de PQRS se distingue por estado.
4. Menú de la barra superior: el borde de «Cerrar sesión» se ve en oscuro.
5. Formularios: provocar un error de campo; el borde y el mensaje se leen en ambos modos.
6. Cambiar el modo del teléfono con cada pantalla abierta: sin reinicio ni destellos.
