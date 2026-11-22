# Research: Loader de la marca, versión 2

> **Nota (D-082):** este documento es del diseño original de la spec 009 y se conserva como historial. La sacudida lateral que describe quedó **descartada**: cada ícono crece de 50 % a 100 % al entrar y se reduce al salir, el ícono mide 32 px (14 px compacto) y el conjunto solo se desvanece 150 ms. Manda D-082, `spec.md`, `contracts/brand-loader.md` y la sección Loader de `docs/Design.md`.

Decisiones técnicas de la funcionalidad 009. No quedaron marcadores `NEEDS CLARIFICATION`; la única incógnita técnica (R-2) tiene un plan de validación y una alternativa.

## R-1. Dibujo y giro del anillo

- **Decisión**: un componente `LoaderRing` dibuja con `react-native-svg` dos círculos con el mismo radio: la **pista** (trazo completo, opacidad 20 %) y el **arco** (trazo con `strokeDasharray` de un cuarto de la circunferencia, extremos redondeados). El giro se logra rotando la vista contenedora con un valor compartido de Reanimated que va de 0° a 360° cada 1000 ms en bucle y de forma lineal; las propiedades del SVG no se animan.
- **Motivo**: rotar una vista corre en el hilo de interfaz y es barato; animar propiedades de SVG obliga a puentes más lentos. `react-native-svg` ya está instalado por Iconify, así que no hay dependencias nuevas. Usar la misma opacidad sobre el mismo color evita calcular un color derivado para la pista.
- **Alternativas**: un arco recortado con `borderTopColor` en una vista redonda (se ve mal en Android con trazos finos); animar `strokeDashoffset` con `Animated` de SVG (más trabajo en el hilo de JavaScript); un componente de biblioteca externa (dependencia nueva).

## R-2. Entrada y salida con sacudida (incógnita a validar primero)

- **Decisión**: la vista raíz del loader usa las animaciones de entrada y salida de Reanimated con `Keyframe`: entrada de 350 ms con desplazamientos `0 → −6 → +6 → −3 → +3 → 0` y opacidad `0 → 1`; salida de 250 ms con `0 → +6 → −6 → +3 → 0` y opacidad `1 → 0`; ambas con la curva estándar del tema. Una animación de salida de Reanimated mantiene la vista visible aunque su componente se desmonte, y esa vista deja de ocupar espacio en el diseño, de modo que el contenido aparece de inmediato y la salida se superpone sin retrasarlo (FR-008).
- **Motivo**: es la forma nativa de animar una vista que se desmonta sin que cada pantalla tenga que posponer su cambio de estado.
- **Validación**: una prueba de concepto en el emulador (primera tarea) comprueba tres cosas: que la salida se reproduce cuando el padre quita el loader, que el contenido ocupa su sitio al instante y que, si el loader se quita durante la entrada, la salida no produce un salto. Si falla, la alternativa es un patrón de presencia: `BrandLoader` recibe una propiedad `visible` y el componente se mantiene montado hasta terminar su salida, mientras la pantalla ya muestra el contenido en una capa debajo.
- **Alternativas**: retrasar el desmontaje 250 ms en cada pantalla (contradice FR-008); animar con valores compartidos y un temporizador de desmontaje propio (más código y más estado).
- **Estado de la implementación**: se construyó con las animaciones de entrada y salida de Reanimated sobre la vista raíz del loader, que es la que se desmonta (durante los primeros 300 ms el componente devuelve solo una vista vacía que reserva el espacio, así que la vista animada nunca queda anidada dentro de otra que se desmonte). La prueba de concepto en el emulador (T002) **no se ejecutó** porque requiere dispositivo; la comprobación de que la salida se reproduce y se superpone al contenido queda en el recorrido manual (T023). Si falla, se aplica la alternativa de la propiedad `visible` (T014).
- **Limitación conocida (FR-010)**: la salida usa fotogramas que parten del reposo. Si el loader se quita con la entrada a medias, la opacidad pasa del valor actual a 1 y luego baja. `shakeFrames('exit', from)` ya construye una salida que parte del estado actual, pero no está conectada, porque una animación de salida de Reanimated no recibe el valor actual en esa API; se evalúa en T023 si el salto es perceptible.

## R-3. Ubicación de la espera de 300 ms y del espacio reservado

- **Decisión**: se conserva el hook `useLoaderPhase` de la 007. Mientras la fase es `hidden`, el loader reserva su espacio (64 px de alto en el regular) con una vista vacía que no se anima; al pasar a `loader` aparece la vista animada con su entrada. Los botones usan el tamaño compacto, que no espera y no se sacude.
- **Motivo**: conserva el comportamiento de la 007 (nada pintado antes de 300 ms y sin saltos de diseño) y limita la entrada animada al momento en que de verdad se ve.
- **Alternativas**: no reservar espacio (el contenido de abajo saltaría 64 px a los 300 ms).

## R-4. Fundido de los botones

- **Decisión**: el loader compacto usa `FadeIn` y `FadeOut` de Reanimated con 150 ms (el mismo valor de la respuesta al pulsar del tema), sin sacudida. Como el contenido del botón se oculta con opacidad dentro de la misma caja, el ancho y el alto no cambian.
- **Motivo**: cumple FR-012 con las animaciones ya usadas en la app (`FadeInView`).
- **Alternativas**: cambio instantáneo (se descartó en la clarificación de la spec); fundido de 250 ms (más lento sin necesidad).

## R-5. "Reducir movimiento"

- **Decisión**: con el ajuste activo (`useMotion()`), la entrada y la salida pasan a `FadeIn`/`FadeOut` de 150 ms; el anillo no rota y su arco pulsa entre 40 % y 100 % de opacidad cada 1,2 s con un valor compartido en bucle; el ícono sigue cambiando cada 900 ms sin fundido (`iconOpacity` con `animated = false` de la 007).
- **Motivo**: cumple FR-014 y la regla de `Design.md` ("sin movimiento, solo fundidos") sin dejar la pantalla aparentemente congelada.
- **Alternativas**: quitar el anillo (pierde la señal de que la app trabaja); dejar el anillo girando (es movimiento continuo).

## R-6. Tokens

- **Decisión**: `motion.loader` crece con `ring` y `shake`: `ring: { regular: { size: 64, stroke: 3 }, compact: { size: 28, stroke: 2 }, sweepDegrees: 90, turn: 1000, pulse: 1200, pulseMin: 0.4, trackOpacity: 0.2 }` y `shake: { enter: { duration: 350, offsets: [0, -6, 6, -3, 3, 0] }, exit: { duration: 250, offsets: [0, 6, -6, 3, 0] }, fade: 150 }`. Los colores siguen saliendo del tema.
- **Motivo**: `Conventions.md` pide que duraciones y tamaños vivan en tokens.
- **Alternativas**: constantes dentro del componente (quedan fuera de los tokens y de la documentación).

## R-7. Pruebas

- **Decisión**: la matemática del movimiento (`brandLoaderMotion.ts`) es pura y se prueba sin Reanimated: desplazamientos y opacidades por instante, la suma de las duraciones y que cada salida arranca desde el estado actual. La simulación global de Reanimated en `jest.setup.tsx` se amplía con `Keyframe`, `FadeOut` y `withSequence`; las pruebas del componente comprueban qué entrada y salida recibe cada tamaño y cada modo de movimiento, el giro y el pulso del anillo mediante los valores del valor compartido, y que el contenedor sigue siendo un único elemento de progreso con el anillo oculto a los lectores.
- **Motivo**: la animación corre en el hilo de interfaz y no se puede observar cuadro a cuadro en Jest; las funciones puras son lo que sí se puede verificar.
- **Alternativas**: pruebas de captura de pantalla (infraestructura nueva para un solo componente).

## R-8. Convivencia con la spec 007

- **Decisión**: la 009 amplía el componente de la 007 sin cambiar sus puntos de uso (`LoadingScreen`, pantallas y `Button`). Se reemplazan los requisitos FR-004 ("solo fundidos") y FR-005 ("sin círculos ni arcos") de la 007, y la prueba de la 007 que asumía un único ícono visible sin anillo se actualiza a lo nuevo. El contrato de la 009 reemplaza al de la 007 como referencia vigente.
- **Motivo**: el cambio es visual y aditivo; las fases, la secuencia, la accesibilidad y la prueba contra el spinner del sistema se mantienen.
- **Alternativas**: reescribir el componente desde cero (riesgo innecesario).
