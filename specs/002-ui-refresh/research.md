# Research: UI refresh

| Tema | Decisión | Razón | Alternativas |
|---|---|---|---|
| Íconos | `react-native-iconify` (set `solar`) con registro literal en `src/icons/` | Lo exige `Design.md`; funciona en Expo Go | `@huymobile/react-native-iconify` (nativo, descartado en `Design.md`); `@expo/vector-icons` (prohibido) |
| `@expo/vector-icons` y `expo-symbols` | Eliminarlos del `package.json` | FR-001: ninguna otra librería de íconos | Dejarlos sin uso: contradice el spec |
| Logo SVG | `expo-image` con los SVG de `assets/brand/` | Ya instalado, soporta SVG sin transformador y no modifica el logo | `react-native-svg-transformer` (configuración extra) |
| Degradado | `expo-linear-gradient` con `gradients.brand` | Previsto en `Design.md` | Imagen de fondo: no escala |
| Animaciones | Reanimated 4 (`withTiming`, `useReducedMotion`); con reducir movimiento solo fundido | `Design.md` y FR-008 | `Animated` de RN: sin hilo de UI |
| Tema | Portar `theme.ts` de `uts-ui` a `src/theme/` (spacing, radius, shadows, gradients, motion, iconSize); `Palette` conserva sus colores y suma `screen` y `card` | FR-009; evita duplicar colores | Reescribir `colors.ts`: riesgo de regresión en 48 pruebas |
| Sombras en Android | `shadows.*` incluye `elevation` | Compatibilidad | Solo `shadow*`: no se ve en Android |
| Pruebas con íconos | Mock de `Icon` en `jest.setup.ts` | SVG no renderiza en Jest | Probar sin mock: frágil |
| Logo ausente | Pedir los archivos; no redibujar | `Design.md`: nunca rehacer el logo | Placeholder con texto: aceptable solo en desarrollo y señalado |

Sin `NEEDS CLARIFICATION` pendientes.
