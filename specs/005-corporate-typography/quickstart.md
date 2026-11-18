# Quickstart: validación

1. En `tutorias_uts_mobile`: `npm run typecheck`, `npm run lint` y `npm test` (las pruebas de 001 a 004 deben pasar y las nuevas de tipografía también).
2. Buscar `fontFamily` y `fontWeight` en `src` y `app` fuera de `src/theme/`: 0 resultados. Buscar `Roboto` en `src`, `app` y `package.json`: 0 resultados.
3. `npx expo start` y recorrer login, registro, verificación, recuperar, restablecer, cambio de clave, alta de docente, pestañas de cada rol y el diálogo de clave temporal: todos los textos en Source Sans 3, la clave temporal en Source Code Pro, y los estilos con los tamaños de `Design.md`.
4. Arranque en frío varias veces: el splash se mantiene hasta que aparece la primera pantalla ya con la fuente correcta, sin parpadeo.
5. Simular un fallo de carga de fuentes: la app continúa con la fuente del sistema pasados 5 s, sin quedarse en el splash.
6. Fuente del sistema al tamaño máximo y textos en español: los botones y estados no se cortan; los títulos de tarjeta se limitan a 2 líneas.
