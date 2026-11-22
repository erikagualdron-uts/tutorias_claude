# Research: Loader de la marca

Decisiones técnicas de la funcionalidad 007. No quedaron marcadores `NEEDS CLARIFICATION`.

## R-1. Animación de la secuencia libro → pluma → hoja

- **Decisión**: un único valor compartido `t` que recorre de 0 a 3 en 2700 ms de forma lineal y en bucle (3 íconos × 900 ms). Cada ícono `i` deriva su opacidad de `t` con un mapa de cuatro puntos: `[i, i + 0.278, i + 0.722, i + 1] → [0, 1, 1, 0]` (250 ms aparece, 400 ms se sostiene, 250 ms se desvanece). Los tres íconos van apilados en el mismo lugar y solo uno es visible a la vez; como el fundido de salida de uno termina donde empieza el del siguiente, nunca se ven dos juntos.
- **Motivo**: corre en el hilo de interfaz con Reanimated, sin estado de React que cambie por cuadro, y la secuencia se mantiene sincronizada por construcción (una sola fuente de tiempo).
- **Alternativas**: un temporizador de JavaScript que cambie un índice (provoca renderizados y se desfasa si el hilo está ocupado); animaciones independientes por ícono con retardos (se pueden desincronizar).

## R-2. "Reducir movimiento"

- **Decisión**: con el ajuste activo, la opacidad de cada ícono pasa a ser 1 mientras `floor(t) === i` y 0 en los demás casos, es decir, un cambio instantáneo cada 900 ms sin fundido. Se detecta con `useMotion()` (ya existente, basado en `useReducedMotion`). Las fases y el aviso no cambian.
- **Motivo**: cumple `Design.md` ("quitar movimiento y dejar solo fundidos") de la forma más conservadora que pide la spec (FR-014: cambio sin fundido) y mantiene la señal de que la app sigue trabajando.
- **Alternativas**: dejar el primer ícono fijo (parece una pantalla congelada); mantener los fundidos (la spec pide quitarlos).

## R-3. Fases por tiempo de espera

- **Decisión**: un hook `useLoaderPhase(enabled)` devuelve `'hidden' | 'loader' | 'slow'`. Al montarse, programa dos temporizadores (300 ms y 1000 ms) y los cancela al desmontarse. El tamaño compacto no usa el hook: se muestra de inmediato y sin aviso (FR-018). El componente que carga se monta solo mientras hay carga, de modo que montarlo inicia el conteo y desmontarlo lo reinicia (FR: "al volver a mostrarse, el conteo y la secuencia empiezan otra vez").
- **Motivo**: un temporizador por montaje es el modelo más simple que cumple con el reinicio automático; sin estado global ni contadores compartidos entre pantallas.
- **Alternativas**: un contexto global de "cargando" (acopla pantallas y complica el reinicio); calcular las fases con una marca de tiempo y renderizar por intervalos (renderizados innecesarios).

## R-4. Solo en la primera carga

- **Decisión**: las pantallas muestran el loader con la condición `query.isPending` de TanStack Query v5, que es verdadera solo mientras no hay datos; una actualización en segundo plano de datos ya cargados deja `isPending` en falso (usa `isFetching`, que no se consulta para el loader). Las pantallas actuales ya usan `isPending`, así que el cambio es solo de componente.
- **Motivo**: cumple FR-008 sin lógica adicional y sin tocar las consultas.
- **Riesgo**: una consulta deshabilitada y sin datos también tiene `isPending` en verdadero; las pantallas con parámetros opcionales (`id`) ya lo protegen con `id &&` antes de leerlo, y las pruebas de cada pantalla lo cubren.

## R-5. Aviso de demora y accesibilidad

- **Decisión**: el contenedor es un único elemento con rol `progressbar`, etiqueta `common.loading` y estado ocupado; los íconos se ocultan a los lectores. Al aparecer el aviso (fase `slow`) se muestra como texto debajo del ícono y se anuncia una sola vez con `AccessibilityInfo.announceForAccessibility`. El texto sale de la clave nueva `common.loadingSlow` ("Cargando… Esto está tardando más de lo normal." / "Loading… This is taking longer than usual.").
- **Motivo**: cumple FR-013 y FR-017; el anuncio explícito evita que el lector repita el mensaje cada vez que cambia el ícono.
- **Alternativas**: región viva (`accessibilityLiveRegion`) en el texto (en iOS no está disponible; el anuncio explícito funciona en ambas plataformas).

## R-6. Tokens y colores

- **Decisión**: se agrega `motion.loader` a `src/theme/tokens.ts`: `{ iteration: 900, fadeIn: 250, hold: 400, fadeOut: 250, showAfter: 300, slowAfter: 1000 }`. El color por defecto es `palette.primary` (verde `#34531F`); los botones rellenos pasan el color del texto del botón (blanco) con la propiedad `color`. Ningún hexadecimal en el componente.
- **Motivo**: `Conventions.md` exige que duraciones y colores vengan del tema, y hay una prueba que impide hexadecimales en pantallas.
- **Alternativas**: constantes dentro del componente (se ocultan de los tokens y de la documentación).

## R-7. Reemplazo de `ActivityIndicator`

- **Decisión**: `Button` sustituye su indicador por `BrandLoader` compacto dentro de la misma caja (el contenido sigue ocupando el espacio, como hoy, para que el ancho no cambie). `LoadingScreen` y las 9 pantallas de periodos, salones, ubicaciones y listas usan `BrandLoader` regular. Una prueba `noActivityIndicator.test.ts` (mismo patrón que `noOtherIconLibs.test.ts`) recorre `app/` y `src/` y falla si encuentra `ActivityIndicator`, salvo en `__tests__/`.
- **Motivo**: cubre FR-009, FR-010, FR-011 y FR-019 con un cambio mecánico y una red de seguridad automática.
- **Alternativas**: una regla de lint personalizada (más configuración que una prueba de una docena de líneas).

## R-8. Íconos

- **Decisión**: se reutilizan `openBook`, `feather` y `leaf` del registro `src/icons/registry.ts` con el componente `Icon`; no se agregan íconos. La prueba existente que limita el set `mdi` al registro sigue pasando porque el loader no escribe nombres `mdi:` en el componente.
- **Motivo**: respeta D-049 y `Conventions.md` (todo ícono sale del registro).
- **Alternativas**: dibujar los íconos en SVG propio (rompe la regla de usar solo Iconify).
