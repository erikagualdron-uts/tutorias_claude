# Implementation Plan: Loader de la marca

**Branch**: `007-brand-loader` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-brand-loader/spec.md`

## Summary

Un componente `BrandLoader` propio reemplaza todo `ActivityIndicator` de la app. Muestra un solo ícono de la marca por iteración (libro → pluma → hoja → libro, 900 ms cada una, solo fundidos) y, en su tamaño regular, atraviesa tres fases por tiempo de espera: nada hasta 300 ms, loader de 300 a 1000 ms y, pasado 1000 ms, loader más el aviso de demora. En su tamaño compacto (botones) aparece de inmediato y sin aviso.

Enfoque técnico (detalle en [research.md](research.md)): la animación corre en el hilo de interfaz con un único valor compartido que recorre los tres íconos y del que cada ícono deriva su opacidad; las fases se controlan con dos temporizadores que nacen al montar el componente, por lo que "solo en la primera carga" se cumple mostrando el loader mientras la consulta no tiene datos (`isPending`) y nunca en una actualización en segundo plano. Una prueba que recorre el código impide volver a usar `ActivityIndicator`. Es un cambio solo de la app: no toca backend ni base de datos.

## Technical Context

**Language/Version**: TypeScript (Expo SDK vigente, React Native).

**Primary Dependencies**: `react-native-reanimated` 4.7 (ya instalado), `react-native-iconify` con el registro de íconos existente, `i18next`. Sin dependencias nuevas.

**Storage**: N/A.

**Testing**: Jest + React Native Testing Library, con temporizadores simulados para las fases y el avance de la secuencia.

**Target Platform**: Android e iOS (app Expo).

**Project Type**: mobile-app; el cambio vive solo en `tutorias_uts_mobile`.

**Performance Goals**: la animación corre a 60 fps en el hilo de interfaz; sin renderizados de React por cuadro. Un loader desmontado no deja temporizadores ni animaciones activas.

**Constraints**: solo fundidos (sin movimiento ni escala); respeta "reducir movimiento"; íconos solo del registro existente; colores solo de los tokens del tema; ningún texto escrito en el componente; objetivos y anchos de botón sin cambios.

**Scale/Scope**: 1 componente nuevo, 1 hook de fases, 2 claves de traducción nuevas por idioma, 1 prueba de regresión y el reemplazo de 11 usos de `ActivityIndicator` (`Button`, `LoadingScreen` y 9 pantallas).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Design.md` (sección Loader), `Conventions.md` y D-078, que ya recogen las fases, los tamaños y el orden de íconos. Los umbrales de 300 y 1000 ms y las duraciones pasan a tokens del tema. Ver "Actualizaciones de docs/". |
| II. Reglas de negocio en backend | No aplica: no hay reglas de negocio. |
| III. Integridad de datos | No aplica: sin datos nuevos. |
| IV. Seguridad y privacidad | No aplica: sin endpoints ni datos sensibles. |
| V. Pruebas primero | No toca reglas críticas; aun así las fases, la secuencia, "reducir movimiento", la accesibilidad y la prohibición de `ActivityIndicator` tienen pruebas automáticas antes de cerrar. |
| VI. Internacionalización | La etiqueta `common.loading` ya existe; el aviso de demora es una clave nueva en `es.json` y `en.json`. Ningún texto en el componente. |
| VII. Diseño consistente | Color `#34531F` y blanco desde los tokens del tema; íconos del registro; objetivos de 48 px del botón sin cambios; sin círculos ni arcos. |
| VIII. Desarrollo incremental | Una funcionalidad, una rama, tareas pequeñas. |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones. Se vuelve a revisar tras el diseño (ver abajo): pasa.

## Project Structure

### Documentation (this feature)

```text
specs/007-brand-loader/
├── plan.md
├── research.md
├── quickstart.md
├── contracts/
│   └── brand-loader.md      # contrato del componente (propiedades y comportamiento)
└── tasks.md                 # lo genera /speckit-tasks
```

No hay `data-model.md`: la funcionalidad no maneja entidades ni datos.

### Source Code

Todo en el repositorio `tutorias_uts_mobile` (D-077).

```text
tutorias_uts_mobile/
├── src/
│   ├── theme/tokens.ts                     # + motion.loader (duraciones y umbrales)
│   ├── components/
│   │   ├── BrandLoader.tsx                 # nuevo: componente
│   │   ├── useLoaderPhase.ts               # nuevo: fases por tiempo de espera
│   │   ├── Button.tsx                      # usa BrandLoader compacto
│   │   ├── LoadingScreen.tsx               # usa BrandLoader regular
│   │   └── __tests__/
│   │       ├── BrandLoader.test.tsx
│   │       └── useLoaderPhase.test.tsx
│   ├── features/{periods,rooms,dropdown-lists}/screens/*   # usan BrandLoader regular
│   ├── i18n/{es,en}.json                   # + common.loadingSlow
│   └── __tests__/noActivityIndicator.test.ts
```

**Structure Decision**: componente compartido en `src/components/` junto a `Button` y `LoadingScreen`, como indica `docs/Conventions.md` §5 para lo reutilizable. Las constantes de tiempo viven en `src/theme/tokens.ts` (sección `motion`), que es donde el proyecto guarda las duraciones.

## Actualizaciones de docs/

En el mismo cambio que la implementación (`CLAUDE.md`, "Forma de trabajar"):

- `docs/Design.md` (sección Loader) y `docs/Decisions.md` (D-078): ya reflejan lo especificado; al terminar, marcar D-078 como implementada y ajustar cualquier valor que cambie.
- `docs/Decisions.md` (D-049): anotar que los íconos de hoja, pluma y libro también se usan, de forma funcional, en el loader.
- `docs/Conventions.md`: sin cambios (la regla del loader ya está).

## Re-evaluación tras el diseño

El diseño no introduce backend, datos ni dependencias; las fases y la animación quedan dentro del componente y de los tokens del tema. **Resultado**: pasa sin violaciones.

## Complexity Tracking

Sin violaciones de la constitución ni complejidad que justificar.
