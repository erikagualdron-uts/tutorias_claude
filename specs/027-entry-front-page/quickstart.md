# Quickstart: validar entrada y portada

Guía para comprobar la spec 027. Los roles están en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
npx jest src/theme src/components
```

| Qué comprueba | Cómo |
|---|---|
| Contraste de controles (borde 3:1, texto 4.5:1) en ambos modos (FR-013, SC-007) | `contrast.test.ts` con los pares nuevos de `contrastPairs` |
| Mismas llaves en ambas paletas (40 roles) | `paletteParity.test.ts` |
| `Design.md` coincide con el tema | `designDoc.test.ts` |
| Chips y botones no recortan la etiqueta (FR-014) | prueba de `FilterChips` y de `Button` |
| Modo oscuro de `EmptyState`, chips y botones | `darkMode.test.tsx` |
| Inicio del CAE con bloque destacado; los tres inicios con el mismo orden (FR-003) | pruebas de los tableros |
| Navegación, accesibilidad y textos intactos (FR-008, FR-009, SC-004) | suite existente (`hiddenScreens`, `setupA11y`, pantallas) |

## Recorrido manual (teléfono con Expo Go)

1. **Defecto 1:** en modo oscuro, abrir un botón `outlined`, uno `tonal` y los chips de filtro: se distingue el borde sin esforzarse; al presionar el botón primario cambia el color.
2. **Defecto 2:** abrir una lista con chips «All» (por ejemplo módulos del estudiante o PQRS del CAE) en inglés y con letra grande: se lee «All» completo.
3. Recorrer las 12 pantallas de la fase 1 en claro y en oscuro con la lista de reglas de `Design.md` (`screen-inventory.md`).
4. Abrir cada inicio: mismo orden (bloque destacado, métricas, bloques); el del CAE ya tiene bloque destacado.
5. Provocar un estado vacío en un inicio y en una bandeja: lleva el patrón de marca, el mensaje y la acción.
6. Cambiar el modo del teléfono con cada pantalla abierta: cambia sin reiniciar ni destellos.
