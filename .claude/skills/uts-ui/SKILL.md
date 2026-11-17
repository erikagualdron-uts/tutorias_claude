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
Seguir el patrón "Login" de `Design.md` al pie de la letra: cabecera con degradado y logo blanco, tarjeta blanca superpuesta, campos con ícono, botón principal "Iniciar sesión" con ícono, **16 px** de separación, divisor "o", botón outlined "Crear cuenta de estudiante" con ícono, y pie con el nombre de la universidad. Reutilizar la misma estructura para registro, recuperación y cambio de clave temporal.

## 5. Elementos de la universidad
- Usar los recursos oficiales de `mobile/assets/brand/` (logo a color, logo blanco, símbolo). **Nunca** redibujar, recolorear, deformar ni agregar efectos al logo; respetar espacio libre y tamaño mínimo del manual.
- Si los archivos oficiales no existen todavía, **dejar un marcador de posición claro y avisar al usuario**; no inventar ni aproximar un logo.
- El logo aparece en splash, login y pantallas de acceso, perfil o About, correos y (en silueta) el ícono de notificación de Android; no se repite en cada pantalla.
- Detalles de identidad: línea lima de 4 px bajo títulos destacados, círculos decorativos blancos al 6-10 % sobre el degradado, fotos solo autorizadas y con superposición verde.

## Reglas de color (siguen vigentes)
- Acción principal `primary` con texto blanco. `accent` (#C3D730) nunca como texto o ícono sobre fondo claro (contraste 1.6:1).
- `success` y `warning` no van como texto sobre blanco; solo ícono o relleno.
- Rojo solo para errores, cancelaciones, acciones destructivas, no leídos y la línea de "ahora".
- El estado nunca se comunica solo con color.

## Antes de terminar
- Revisar la tabla de contraste de `Design.md` para cualquier combinación nueva.
- Probar con textos en español (30 % más largos) y con el tamaño de fuente del sistema al 200 %.
- Confirmar: cero imports de librerías de íconos distintas a Iconify, cero hexadecimales en componentes, todos los botones con ícono y 16 px entre apilados.
