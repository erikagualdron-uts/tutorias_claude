# Implementation Plan: Loader de la marca, versión 2

> **Nota (D-082):** este documento es del diseño original de la spec 009 y se conserva como historial. La sacudida lateral que describe quedó **descartada**: cada ícono crece de 50 % a 100 % al entrar y se reduce al salir, el ícono mide 32 px (14 px compacto) y el conjunto solo se desvanece 150 ms. Manda D-082, `spec.md`, `contracts/brand-loader.md` y la sección Loader de `docs/Design.md`.

**Branch**: `009-brand-loader-v2` | **Date**: 2026-11-17 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-brand-loader-v2/spec.md`

## Summary

El `BrandLoader` de la spec 007 suma dos cosas: un **anillo giratorio** alrededor del ícono (pista tenue más un arco de 90° que da una vuelta por segundo) y una **sacudida lateral suave** al entrar (350 ms) y al salir (250 ms). En los botones el loader compacto lleva anillo, pero entra y sale con un fundido de 150 ms y sin sacudida. Con "reducir movimiento" no hay sacudida ni giro: el anillo queda fijo con el arco pulsando y la entrada y la salida son un fundido de 150 ms.

Enfoque técnico (detalle en [research.md](research.md)): el anillo se dibuja con `react-native-svg` (ya instalado por los íconos) y gira rotando su vista contenedora con un valor compartido de Reanimated, sin animar propiedades de SVG; la sacudida y los fundidos usan las animaciones de entrada y salida de Reanimated (`Keyframe`, `FadeIn`, `FadeOut`) sobre la vista raíz del loader, de modo que la salida se superpone al contenido y no lo retrasa; los tiempos, desplazamientos y tamaños pasan a tokens del tema. Es un cambio solo de la app: no toca backend ni base de datos. La salida con animación depende de un comportamiento de Reanimated que se valida primero con una prueba de concepto en el emulador (tarea inicial) antes de construir el resto.

## Technical Context

**Language/Version**: TypeScript (Expo SDK 58, React Native).

**Primary Dependencies**: `react-native-reanimated` 4.7.1 y `react-native-worklets` 0.13 (ya instalados), `react-native-svg` 15.16 (ya instalado), `react-native-iconify`, `i18next`. Sin dependencias nuevas.

**Storage**: N/A.

**Testing**: Jest + React Native Testing Library. La animación corre en el hilo de interfaz, así que las pruebas se apoyan en funciones puras (desplazamientos y opacidades por instante) y en comprobar qué animaciones de entrada y salida recibe cada vista; la simulación global de Reanimated se amplía con lo nuevo que use el componente.

**Target Platform**: Android e iOS (app Expo).

**Project Type**: mobile-app; el cambio vive solo en `tutorias_uts_mobile`.

**Performance Goals**: giro y sacudida a 60 fps en el hilo de interfaz, sin renderizados de React por cuadro; un loader desmontado no deja temporizadores ni animaciones activas.

**Constraints**: ícono 48/20 px dentro de un anillo de 64/28 px (grosor 3/2 px); el anillo compacto cabe en el botón sin cambiar su tamaño; la salida no retrasa el contenido; sin colores fuera del tema; ningún texto en el componente; las fases de espera y el aviso de demora de la 007 no cambian.

**Scale/Scope**: 1 componente existente que se amplía (`BrandLoader`), 1 componente nuevo (`LoaderRing`), 1 módulo de movimiento puro nuevo, ampliación de tokens y de la simulación de pruebas; los 11 puntos de uso de la 007 no cambian de código porque ya consumen `BrandLoader`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Design.md` (sección Loader), `Conventions.md` y D-080, que ya recogen el anillo, la sacudida, los botones y "reducir movimiento". Los valores pasan a tokens del tema. Ver "Actualizaciones de docs/". |
| II. Reglas de negocio en backend | No aplica. |
| III. Integridad de datos | No aplica. |
| IV. Seguridad y privacidad | No aplica: sin endpoints ni datos sensibles. |
| V. Pruebas primero | No toca reglas críticas; aun así los desplazamientos, el giro, los fundidos de los botones, "reducir movimiento" y la accesibilidad tienen pruebas automáticas antes de cerrar. |
| VI. Internacionalización | Sin textos nuevos: se reutilizan `common.loading` y `common.loadingSlow`. |
| VII. Diseño consistente | Colores del tema (verde primario, texto casi blanco en oscuro, color del texto del botón); íconos del registro; sin figuras geométricas decorativas: el anillo es retroalimentación funcional y es la excepción registrada en D-080. Objetivos y tamaños de botón sin cambios. |
| VIII. Desarrollo incremental | Una funcionalidad, una rama, tareas pequeñas; una prueba de concepto antes del grueso. |
| IX. Idioma | Documentación en español; código y commits en inglés. |

**Resultado**: pasa sin violaciones. Se vuelve a revisar tras el diseño (ver abajo): pasa.

## Project Structure

### Documentation (this feature)

```text
specs/009-brand-loader-v2/
├── plan.md
├── research.md
├── quickstart.md
├── contracts/
│   └── brand-loader.md      # contrato v2; reemplaza al de la spec 007
└── tasks.md                 # lo genera /speckit-tasks
```

No hay `data-model.md`: la funcionalidad no maneja entidades ni datos.

### Source Code

Todo en el repositorio `tutorias_uts_mobile` (D-077).

```text
tutorias_uts_mobile/
├── src/
│   ├── theme/tokens.ts                       # + motion.loader.ring y motion.loader.shake
│   ├── components/
│   │   ├── BrandLoader.tsx                   # se amplía: anillo, entrada y salida
│   │   ├── LoaderRing.tsx                    # nuevo: anillo SVG que gira o pulsa
│   │   ├── brandLoaderMotion.ts              # nuevo: desplazamientos y opacidades puras
│   │   ├── brandLoaderTiming.ts              # sin cambios (secuencia de íconos)
│   │   ├── Button.tsx                        # sin cambios de lógica (usa el compacto)
│   │   └── __tests__/
│   │       ├── BrandLoader.test.tsx          # se amplía
│   │       ├── BrandLoader.a11y.test.tsx     # se amplía
│   │       ├── LoaderRing.test.tsx           # nuevo
│   │       └── brandLoaderMotion.test.ts     # nuevo
│   └── ../jest.setup.tsx                     # simulación de Reanimated ampliada
```

**Structure Decision**: el anillo es un componente propio (`LoaderRing`) para aislar el dibujo SVG y su animación; la matemática del movimiento vive en un módulo puro (`brandLoaderMotion.ts`) probado sin Reanimated, igual que `brandLoaderTiming.ts` en la 007.

## Actualizaciones de docs/

- `docs/Design.md` (Loader), `docs/Decisions.md` (D-080), `docs/Conventions.md`, `docs/Architecture.md` y `CLAUDE.md`: ya reflejan lo especificado; al terminar, marcar D-080 como "Implementada" y actualizar D-078 ("en parte reemplazada").
- Si la prueba de concepto (research R-2) cambia cómo se logra la salida, anotarlo en `docs/Design.md` (sección Loader) sin cambiar el comportamiento visible.

## Re-evaluación tras el diseño

El diseño no introduce dependencias, textos, datos ni endpoints; el dibujo y el movimiento quedan dentro del componente y de los tokens. **Resultado**: pasa sin violaciones.

## Complexity Tracking

Sin violaciones de la constitución. Una complejidad deliberada:

| Elemento | Por qué es necesario | Alternativa más simple descartada |
|---|---|---|
| Prueba de concepto de la salida antes del grueso | La sacudida de salida depende de que Reanimated anime una vista que se desmonta; si no funciona como se espera hay que cambiar de estrategia | Construir todo y descubrir el problema al final |
