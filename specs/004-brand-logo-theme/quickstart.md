# Quickstart: validación

1. En `tutorias_uts_mobile`: `npm run typecheck`, `npm run lint` y `npm test`; deben pasar, incluida la prueba nueva de `BrandLogo`.
2. `npx expo start` con el dispositivo en tema claro: el login muestra símbolo lima con letras blancas sobre el degradado, sin recuadro.
3. Cambiar el dispositivo a tema oscuro: el logo pasa a todo blanco sin recargar la app.
4. Abrir el teclado: el logo se reduce (120 px) conservando la proporción.
5. Revisar `docs/Design.md`, `docs/Conventions.md`, `docs/Decisions.md` (D-068) y `specs/002-ui-refresh/contracts/ui-components.md`: ninguno menciona `uts-logo*.svg`.
