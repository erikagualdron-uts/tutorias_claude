# Research: Logo de marca según el tema

**R-1 · Selección por tema.** Decisión: `BrandLogo` lee `useColorScheme()` y elige entre dos `require` estáticos (claro: `logo-uts-no-bg-letras-blancas.png`; oscuro: `logo-uts-blanco.png`). Ambos van en el paquete, así no hay descarga ni parpadeo al cambiar de tema. Alternativa descartada: una sola imagen con filtro de color (prohibido recolorear el logo, `Design.md`).

**R-2 · Sin insignia.** Decisión: el logo va directo sobre el degradado verde de la cabecera. La insignia blanca anterior ocultaba el logo blanco; se elimina de `AuthLayout`. Ambas variantes tienen fondo transparente.

**R-3 · Proporción.** Hallazgo: el componente usaba 632/210 (proporción del logo a color) con archivos de 1448×1086, lo que estiraba la imagen. Decisión: usar 1448/1086, la proporción real de ambas variantes (tienen el mismo tamaño), y subir el ancho de 144 a 200 px (120 con teclado) para compensar que la imagen es más cuadrada.

**R-4 · Alcance.** Splash y correos quedan fuera: el splash usa su imagen estática (spec 003) y los correos usan el logo a color sobre fondo blanco. Los otros usos futuros del logo (perfil, Acerca de) heredan la regla al usar `BrandLogo`.

**R-5 · Verificación.** No existe prueba del componente. Decisión: agregar una prueba que renderice `BrandLogo` en claro y oscuro y verifique la fuente elegida y la proporción. En jest se mockea `useColorScheme`.
