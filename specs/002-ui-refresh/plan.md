# Implementation Plan: Renovación visual de la app (UI refresh)

**Branch**: `002-ui-refresh` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-ui-refresh/spec.md`

## Summary

Aplicar `docs/Design.md` a las pantallas de la 001: tema centralizado (tokens de `uts-ui/assets/theme.ts`), registro único de íconos Iconify `solar`, `Button` con ícono a la izquierda, tarjetas y cabecera con degradado, animaciones con Reanimated que respetan "reducir movimiento" y logo oficial UTS. Solo cambia `tutorias_uts_mobile`; sin cambios de API, datos ni reglas de negocio.

## Technical Context

**Language/Version**: TypeScript 6, Expo SDK 58, React Native 0.88, React 19

**Primary Dependencies**: existentes: `react-native-reanimated` 4.7, `expo-image`, `expo-router`, i18next. Nuevas: `react-native-iconify`, `react-native-svg`, `expo-linear-gradient`. Se eliminan `@expo/vector-icons` y `expo-symbols` (otras librerías de íconos)

**Storage**: N/A

**Testing**: Jest + RNTL (48 pruebas existentes deben seguir pasando) + pruebas nuevas de `Icon`, `Button` (ícono y reducir movimiento) y un chequeo estático de que no quedan importaciones de otras librerías de íconos

**Target Platform**: Android e iOS (Expo Go, requisito de `Design.md`)

**Project Type**: mobile-app

**Performance Goals**: 60 fps; animaciones en el hilo de UI, sin retrasar acciones del usuario

**Constraints**: nombres de ícono como literales (la librería no acepta variables); sin colores nuevos salvo derivados marcados; objetivos táctiles de 48 px; textos solo por i18n

**Scale/Scope**: 19 botones, ~20 pantallas, 7 componentes compartidos

## Constitution Check

| Principio | Resultado |
|---|---|
| I. Fuente de verdad en `docs/` | OK. Se sigue `Design.md`; `Architecture.md` ya lista `src/icons/` y `src/theme/` |
| II, III, IV, V (negocio, datos, seguridad, pruebas críticas) | N/A: no toca reglas, datos ni permisos |
| VI. i18n | OK. Las etiquetas de accesibilidad nuevas van en es/en |
| VII. Diseño | OK. Solo paleta de `Design.md`; lima nunca como texto o ícono sobre claro; 48 px |
| VIII. Incremental | OK. Un cambio visual sin funcionalidad nueva |
| IX. Idioma | OK |

Sin violaciones. Se repite el chequeo tras el diseño: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-refresh/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-components.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repo `tutorias_uts_mobile`)

```text
assets/brand/            # NUEVO: logos oficiales (los entrega la universidad)
src/
├── icons/               # NUEVO: registro único + <Icon>
│   ├── registry.ts
│   └── Icon.tsx
├── theme/               # colors.ts, tokens.ts (spacing/radius/shadows/motion/gradients), index.ts
├── components/
│   ├── Button.tsx       # icon obligatorio a la izquierda, escala al pulsar
│   ├── Card.tsx         # NUEVO
│   ├── AuthLayout.tsx   # NUEVO: cabecera con degradado + logo + tarjeta
│   ├── BrandLogo.tsx    # NUEVO
│   ├── FadeInView.tsx   # NUEVO: entrada animada con reducir movimiento
│   ├── TextField.tsx    # ícono inicial y de mostrar/ocultar
│   └── (AppBar, Banner, EmptyState, LoadingScreen, TemporaryPasswordDialog: íconos y tema)
├── features/{auth,shell,teachers}/screens/   # usan AuthLayout, Card y Button con ícono
└── i18n/{es,en}.json    # etiquetas de accesibilidad
app/                     # splash (app.json) y _layout
```

**Structure Decision**: un solo repo (`tutorias_uts_mobile`). Los componentes compartidos concentran el estilo para que las pantallas no tengan valores visuales sueltos (FR-009).

## Riesgos y puntos abiertos

| Punto | Tratamiento |
|---|---|
| `assets/brand/` **no existe** en el repo (el spec lo suponía) | Bloqueo parcial: los logos los entrega la universidad. El código referencia las rutas de `Design.md`; sin los archivos no se debe dibujar un logo propio. Se pide a la universidad o al usuario antes de cerrar la historia 1 |
| `RoleTabs` y `EmptyTabScreen` usan `Ionicons` | Se migran a `Icon` y se eliminan las dependencias |
| `radius` actuales (card 12, input 8) difieren del tema nuevo (card 16, input 12) | Se reemplazan por los de `theme.ts`; `Palette` gana `screen` y `card` |
| Pruebas con SVG en Jest | `Icon` se mockea en `jest.setup.ts` |
| Dark mode | Se conserva la paleta oscura actual (clarificación) |

## Complexity Tracking

Sin violaciones que justificar.
