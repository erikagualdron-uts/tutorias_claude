# Implementation Plan: Ajustes visuales de marca e inputs

**Branch**: `003-brand-pattern-inputs` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-brand-pattern-inputs/spec.md`

## Summary

Tres ajustes solo visuales y de texto, sin tocar reglas de negocio: (1) un componente único `BrandPattern` (hoja, pluma, libro) que reemplaza los círculos de `AuthLayout` y se usa en splash y tarjetas destacadas; (2) un `TextField` con relleno, borde tenue, ícono a la izquierda y estados de foco, error y deshabilitado, más variantes de selector, área de texto, búsqueda y chat que reutilizan la misma base; (3) reemplazo del nombre antiguo de la institución en las traducciones (los correos no lo contienen, ver R-4). Detalle en [research.md](research.md).

## Technical Context

**Language/Version**: TypeScript (Expo y React Native del proyecto)

**Primary Dependencies**: react-native-iconify (solar y mdi decorativo), react-native-reanimated 4.7, react-native-svg, expo-linear-gradient, i18next

**Storage**: N/A

**Testing**: jest + jest-expo en la app; vitest en el backend solo si cambian plantillas de correo

**Target Platform**: Android e iOS

**Project Type**: mobile-app (impacto mínimo en la API NestJS)

**Performance Goals**: el patrón no se vuelve a renderizar al abrir el teclado (memoizado); transiciones de campo de 150 ms

**Constraints**: solo colores de `Design.md`; sin librerías de íconos nuevas; textos solo en es.json y en.json; "reducir movimiento" respetado

**Scale/Scope**: 7 pantallas de acceso, clave y alta de docente; 1 componente nuevo y 1 reescrito

## Constitution Check

| Principio | Estado |
|---|---|
| I. Fuente de verdad en docs/ | Cumple: implementa lo definido en Design.md (D-049, D-050). Ver R-4 sobre correos. |
| II y V. Reglas de negocio y pruebas | No aplica: no se toca ninguna regla; las pruebas existentes deben seguir pasando (FR-016). |
| III. Datos | No aplica. |
| IV. Seguridad | No aplica. |
| VI. i18n | Cumple: el nombre vive en `brand.institution`; ningún texto nuevo en componentes. |
| VII. Diseño | Cumple: colores derivados ya marcados en Design.md; campo de 52 px (mínimo 48); lima nunca como texto sobre claro. |
| VIII y IX | Cumple. |

Resultado: sin violaciones; igual tras el diseño.

## Project Structure

### Documentation (this feature)

```text
specs/003-brand-pattern-inputs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/ui-components.md
└── tasks.md   # lo crea /speckit-tasks
```

### Source Code

```text
tutorias_uts_mobile/
├── src/components/
│   ├── BrandPattern.tsx          # nuevo
│   ├── brandPatternLayouts.ts    # nuevo: listas fijas de ubicaciones
│   ├── AuthLayout.tsx            # quita círculos, usa BrandPattern
│   ├── TextField.tsx             # relleno, borde, foco, error, deshabilitado
│   ├── SelectField.tsx, TextAreaField.tsx, SearchField.tsx  # sobre la base de TextField
│   └── __tests__/
├── src/icons/registry.ts         # + leaf, feather, openBook (mdi), chevron, search
├── src/theme/colors.ts, tokens.ts  # + tokens de campo; se elimina onGradient.circle
├── src/i18n/{es,en}.json         # brand.institution
├── assets/brand/                 # splash estático con patrón (app.json)
└── app.json
tutorias_uts_back/src/mail/templates/   # sin cambios previstos (R-4)
```

**Structure Decision**: cambios en `tutorias_uts_mobile`; el backend no se toca salvo que se decida lo contrario en R-4.

## Complexity Tracking

Sin violaciones que justificar.
