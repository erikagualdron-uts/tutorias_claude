---
name: uts-ui
description: "Construye componentes y pantallas de la app con el sistema de diseño UTS Green: estilo moderno y fluido, íconos Iconify, botones con ícono y separación correcta, pantalla de inicio de sesión, tarjetas de módulo, calendario semanal, chat, PQRS, dashboards y elementos visuales de la universidad. Úsala siempre que se cree o modifique interfaz, estilos, colores, animaciones, íconos, botones o cualquier componente visual en mobile/."
---

# Interfaz UTS Green

La fuente de verdad es `docs/Design.md`. Léelo antes de construir (secciones Colors, Elevation, Iconography, Motion, University brand elements, Components y el patrón de pantalla que toque). Esta skill fija cómo aplicarlo.

## Tokens
- Usa `assets/theme.ts` como plantilla de `mobile/src/theme/index.ts`: colores, degradado de marca, espaciados, radios, sombras, movimiento y tipografía.
- **Prohibido escribir hexadecimales, tamaños, radios, sombras o duraciones sueltas dentro de componentes.** Todo sale del tema.
- Si `Design.md` cambia, actualizar el tema en el mismo cambio.

## 1. Íconos: solo Iconify (obligatorio)
- Paquete `react-native-iconify` con `react-native-svg`; set `solar` (`-linear` normal, `-bold` activo). Nunca `@expo/vector-icons`, Lucide, emojis ni SVG sueltos como íconos de interfaz.
- Todos los íconos se declaran en `mobile/src/icons/` con el nombre **escrito literal** (la librería no acepta nombres desde variables) y se consumen con el componente `Icon`.
- Tamaños: 16 (metadatos), 20 (botones e inputs), 24 (barra de pestañas y app bar), 40 (estados vacíos). Color siempre del tema.
- Antes de usar un nombre, verificar que existe en el set. La tabla de referencia está en `Design.md`.
- Un ícono junto a un texto es decorativo (oculto a lectores de pantalla); un ícono solo lleva `accessibilityLabel` y 48 px de área táctil.
- Si no se puede comprobar que la librería funciona en Expo Go, avisar antes de continuar.

## 2. Botones
- **Todo botón lleva un ícono a la izquierda** (20 px, separado 8 px del texto). Excepciones: enlaces de texto y botones solo de ícono.
- **Separación:** botones apilados a **16 px** (`spacing.lg`), nunca menos de 12; lado a lado 12; grupo de botones a 24 del resto. Los botones jamás se tocan.
- Altura 52 px (44 compacto), forma de píldora, escala 0.97 al presionar, háptica ligera en acciones principales.
- Variantes: primary, outlined, tonal, destructive (con diálogo de confirmación), accent (solo fondos oscuros). Deshabilitado siempre con línea de ayuda que explica el motivo. Cargando: el ícono se cambia por un spinner sin cambiar el ancho.

## 3. Estilo moderno y fluido
- Fondo de pantallas de lista y dashboard: `screen` (#F2F4EF) con tarjetas `card` blancas, sombra suave nivel 1 (sin borde), radio 16.
- Tarjetas destacadas y cabeceras: degradado de marca con `expo-linear-gradient`, texto blanco, radio 20, sombra nivel 2.
- Animaciones con `react-native-reanimated` según `motion` del tema: entradas escalonadas (máx. 8 ítems), cambios de barras y badges en 250 ms, skeleton con shimmer. Hojas inferiores con resorte.
- Con "reducir movimiento" activo: quitar desplazamientos, shimmer y conteos; dejar solo fundidos.
- Nada de animaciones que retrasen una acción ni mayores a 400 ms. Mantener 60 fps.

## 4. Pantalla de inicio de sesión
Seguir el patrón "Login" de `Design.md` al pie de la letra: cabecera con degradado, patrón de marca (`BrandPattern`) y logo blanco, tarjeta blanca superpuesta, campos con ícono, botón principal "Iniciar sesión" con ícono, **16 px** de separación, divisor "o", botón outlined "Crear cuenta de estudiante" con ícono, y pie con el nombre de la universidad. Reutilizar la misma estructura para registro, recuperación y cambio de clave temporal.

## 5. Elementos de la universidad
- Usar los recursos oficiales de `mobile/assets/brand/` (logo a color, logo blanco, símbolo). **Nunca** redibujar, recolorear, deformar ni agregar efectos al logo; respetar espacio libre y tamaño mínimo del manual.
- Si los archivos oficiales no existen todavía, **dejar un marcador de posición claro y avisar al usuario**; no inventar ni aproximar un logo.
- El logo aparece en splash, login y pantallas de acceso, perfil o About, correos y (en silueta) el ícono de notificación de Android; no se repite en cada pantalla.
- Detalles de identidad: línea lima de 4 px bajo títulos destacados, el patrón de marca sobre el degradado, fotos solo autorizadas y con superposición verde.
- **Nombre:** "Institución Universitaria Tecnológica de Santander – UTS" (corto: UTS). Nunca "Unidades Tecnológicas". Va en los archivos de traducción, no en el código.

## 6. Patrón de marca (hojas, plumas y libros)
- **Prohibido decorar con figuras geométricas** (círculos, arcos, manchas). La decoración es el patrón de hoja, pluma y libro, inspirado en los elementos del escudo. No es una reproducción del escudo.
- Usar `assets/BrandPattern.tsx` como plantilla de `mobile/src/components/BrandPattern.tsx`. Las posiciones son una lista fija (nunca aleatoria por render) y el centro, donde van logo y título, queda libre.
- Íconos: `mdi:leaf`, `mdi:feather`, `mdi:book-open-page-variant` (verificar nombres; se permite `mdi` solo para estos íconos decorativos). Declararlos en el registro `src/icons/` con nombre literal.
- Blanco al 8-12 % (6 % en modo oscuro) y máximo 3 íconos en lima al 14-18 %. Estático; fundido de entrada de 350 ms; sin animación con "reducir movimiento". Ignora toques y se oculta a los lectores de pantalla.
- Solo en cabeceras de acceso (login, registro, recuperación, cambio de clave), splash y tarjetas destacadas (3 íconos al 10 %). Nunca en pantallas de contenido.

## 7. Campos de texto
- **Todo campo tiene relleno y borde tenue**; nunca un campo sin borde ni relleno. 52 px de alto, radio 12, etiqueta arriba, ícono a la izquierda de 20 px.
- Sobre tarjeta blanca: relleno `inputFill` + borde `inputBorder` (1 px). Sobre el fondo de pantalla: relleno blanco + el mismo borde.
- Foco: borde de 2 px `inputBorderFocus`, relleno blanco, halo suave, 150 ms. Error: borde `error`, halo suave y mensaje debajo con ícono. Deshabilitado: 60 % de opacidad.
- Mismo estilo en áreas de texto, selectores desplegables (con flecha), búsqueda y el campo de escritura del chat.
- El borde es tenue a propósito (aprox. 1.6:1). Si se exige contraste estricto de 3:1, usar #8C968A.

## 8. Tipografía
- Fuente corporativa **Myriad Pro** (Regular, Semibold, Bold) y **Source Code Pro** para código. Los estilos con tamaños y pesos están en `Design.md`, sección Typography.
- Los nombres de fuente viven **solo** en `fonts` del tema. Prohibido escribir `fontFamily` o `fontWeight` dentro de componentes: usar los estilos del tema (`typography.body`, `typography.button`, etc.).
- Cada peso es un archivo (`MyriadPro-Regular`, `-Semibold`, `-Bold`) en `mobile/assets/fonts/`. Cargarlos con `useFonts` y mantener el splash hasta que estén listos.
- El peso medio (500) ya no existe: usar Semibold.
- **Licencia:** Myriad Pro es comercial. Si los archivos oficiales no existen todavía, usar el respaldo **Source Sans 3** cambiando solo `fonts` en el tema, y avisar al usuario; nunca copiar la fuente de otra fuente sin licencia.
- Al probar, revisar que los textos en español no se recorten y que el tamaño de fuente del sistema al 200 % no rompa el diseño.

## Reglas de color (siguen vigentes)
- Acción principal `primary` con texto blanco. `accent` (#C3D730) nunca como texto o ícono sobre fondo claro (contraste 1.6:1).
- `success` y `warning` no van como texto sobre blanco; solo ícono o relleno.
- Rojo solo para errores, cancelaciones, acciones destructivas, no leídos y la línea de "ahora".
- El estado nunca se comunica solo con color.

## Antes de terminar
- Revisar la tabla de contraste de `Design.md` para cualquier combinación nueva.
- Probar con textos en español (30 % más largos) y con el tamaño de fuente del sistema al 200 %.
- Confirmar: cero imports de librerías de íconos distintas a Iconify, cero hexadecimales en componentes, todos los botones con ícono, 16 px entre apilados, todos los campos con relleno y borde, ninguna figura geométrica decorativa y ningún `fontFamily` o `fontWeight` escrito en componentes.
