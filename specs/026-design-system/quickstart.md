# Quickstart: validar el sistema de diseño

Guía para comprobar la spec 026. No contiene código; los roles están en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
npx jest src/theme src/components
```

| Qué comprueba | Cómo |
|---|---|
| Claro y oscuro tienen las mismas llaves y colores válidos (SC-002) | `paletteParity.test.ts` |
| Todos los pares de la matriz cumplen el contraste en ambos modos (SC-001) | `contrast.test.ts` |
| Ningún color suelto fuera de `src/theme` y de las excepciones (SC-002) | `noLooseColors.test.ts` |
| La tabla de roles de `Design.md` coincide con las paletas (FR-001, FR-013) | `designDoc.test.ts` (necesita `../Claude/docs/Design.md` o `DESIGN_MD_PATH`) |
| Los componentes compartidos usan solo colores del modo oscuro en oscuro (SC-003) | pruebas de los componentes en `src/components/__tests__` |
| La navegación de la spec 024 y la accesibilidad de la 023 siguen verdes (SC-006) | suite existente (`hiddenScreens`, `setupA11y`) |

Con el tema actual, paridad y contraste fallan en los huecos de modo oscuro de [research.md](research.md) (R-2); deben pasar tras corregir los roles.

## Recorrido manual (teléfono con Expo Go)

1. Poner el teléfono en **modo oscuro**; abrir la app y recorrer los tres roles con la lista de `screen-inventory.md`.
2. Comprobar en cada pantalla: sin fondo claro residual, textos legibles, tarjetas separadas del fondo, avisos con la crema oscura, barra y cabecera en colores oscuros, campos con relleno y borde.
3. Cambiar el modo del teléfono con la app abierta: cambia sin reiniciar ni destellos.
4. Repetir en **modo claro** y comprobar que nada cambió salvo lo previsto.
5. Revisar `Design.md`: cada rol con su valor claro y oscuro, estados de componentes, los dos registros visuales y las reglas de "elegante" y "moderno".
6. Revisar `screen-inventory.md`: las 58 pantallas con defecto y fase.
