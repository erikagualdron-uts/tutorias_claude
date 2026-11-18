# Implementation Plan: Logo de marca según el tema

**Branch**: `004-brand-logo-theme` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-brand-logo-theme/spec.md`

## Summary

`BrandLogo` elige su imagen según el tema del dispositivo: `logo-uts-no-bg-letras-blancas.png` en claro y `logo-uts-blanco.png` en oscuro, directamente sobre el degradado de la cabecera (sin insignia) y con la proporción real de los archivos (1448:1086). El cambio de código y de documentación ya está hecho (D-068); este plan fija cómo se verifica y qué falta de trazabilidad. Detalle en [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript (Expo y React Native del proyecto)

**Primary Dependencies**: expo-image, `useColorScheme` de React Native

**Storage**: N/A

**Testing**: jest + jest-expo

**Target Platform**: Android e iOS

**Project Type**: mobile-app (solo `tutorias_uts_mobile`; sin impacto en la API)

**Performance Goals**: sin parpadeo al cambiar de tema; ambas imágenes ya están en el paquete

**Constraints**: logo sin modificar (ni recolor ni deformación); solo archivos de `assets/brand/`; sin texto nuevo

**Scale/Scope**: 1 componente (`BrandLogo`) y 1 consumidor (`AuthLayout`)

## Constitution Check

| Principio | Estado |
|---|---|
| I. Fuente de verdad en docs/ | Cumple: `Design.md`, `Conventions.md` y `Decisions.md` (D-068) describen la regla. |
| II y V. Reglas de negocio y pruebas | No aplica: no se toca ninguna regla. |
| III y IV. Datos y seguridad | No aplica. |
| VI. i18n | Cumple: no hay texto nuevo. |
| VII. Diseño | Cumple: solo recursos oficiales sin modificar; sin colores nuevos. |
| VIII y IX | Cumple. |

Resultado: sin violaciones; igual tras el diseño.

## Project Structure

### Documentation (this feature)

```text
specs/004-brand-logo-theme/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/brand-logo.md
└── tasks.md   # lo crea /speckit-tasks
```

### Source Code

```text
tutorias_uts_mobile/
├── src/components/BrandLogo.tsx        # variante por tema, proporción 1448:1086
├── src/components/AuthLayout.tsx       # logo directo sobre el degradado, sin insignia
├── src/components/__tests__/BrandLogo.test.tsx  # prueba nueva (falta)
└── assets/brand/                       # logo-uts-no-bg-letras-blancas.png, logo-uts-blanco.png
docs/{Design,Conventions,Decisions}.md  # ya actualizados
```

**Structure Decision**: solo `tutorias_uts_mobile` y `docs/`; el backend no se toca.

## Complexity Tracking

Sin violaciones que justificar.
