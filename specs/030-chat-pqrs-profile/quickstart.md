# Quickstart: validar chat, PQRS y perfil

Guía para comprobar la spec 030. Las piezas están en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
npx jest src/theme src/components src/features/chat src/features/pqrs src/features/auth
```

| Qué comprueba | Cómo |
|---|---|
| Ningún indicador usa `error`, `warning` ni `success` en chat, PQRS y autenticación (FR-002, FR-003, SC-003) | `severityIndicators.test.ts` |
| Una sola cabecera en las 3 pantallas y ninguna en las sobrias de la fase (FR-003, FR-004, SC-004) | `headerBudget.test.ts` |
| Filtros compactos: desplazamiento horizontal, 36 px visuales, 48 px de toque, activo con relleno de marca (FR-013) | prueba de `FilterChips` con `scroll` |
| Insignia de estado de la PQRS y ícono de radicada con roles de texto (FR-002) | pruebas de `StatusBadge` y `PqrsFiledScreen` en claro y oscuro |
| Burbuja ajena con borde en oscuro y sin restos del modo claro (FR-005) | `darkMode.test.tsx` |
| Chat, PQRS, cambio de clave, navegación y accesibilidad sin cambios (FR-009, FR-010, SC-005) | suite existente |

## Recorrido manual (teléfono con Expo Go)

1. En claro y oscuro, abrir mensajes, mis PQRS y PQRS del CAE: cabecera verde compacta con el título (y el número en las dos de PQRS), igual que administración.
2. PQRS del CAE: los tres grupos de filtros en una línea cada uno, deslizables de lado; la primera solicitud se ve sin desplazar la pantalla; el chip activo se destaca.
3. En inglés, con letra grande: «All» se lee completo en los chips de PQRS, docentes, estudiantes y periodos.
4. Radicar una PQRS: el ícono de éxito se ve en claro y oscuro; la insignia de estado se lee en las tres situaciones.
5. Conversación en oscuro: la burbuja ajena se separa del fondo; mensajes propios, avisos y estado de envío se leen.
6. Cambiar el modo del teléfono con cada pantalla abierta: sin reinicio ni destellos.
