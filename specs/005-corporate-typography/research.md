# Research: Tipografía corporativa

**R-1 · Estado actual.** `src/theme/tokens.ts` define `fonts` con Roboto (`regular`, `medium`, `bold`, `mono`) y `typography` con los tamaños anteriores (24, 18, 16, 14, 12). En `src` y `app` no hay `fontFamily` ni `fontWeight` fuera del tema; los 13 consumidores usan `typography.*`. `useAppFonts` carga Roboto y `app/_layout.tsx` devuelve `null` mientras carga, sin retener el splash.

**R-2 · Respaldo.** Decisión: Source Sans 3 (`@expo-google-fonts/source-sans-3`, v0.4.2) en 400, 600 y 700, y Source Code Pro (`@expo-google-fonts/source-code-pro`, v0.4.2) en 400. Los nombres exactos de los exports se verifican al instalar. Tokens: `fonts.regular`, `fonts.semibold` (reemplaza `medium`), `fonts.bold`, `fonts.mono`. Alternativa descartada: seguir con Roboto (no es la tipografía institucional, D-051).

**R-3 · Paso a Myriad Pro.** Decisión: al llegar los archivos con licencia, se copian a `assets/fonts/`, se cargan en `useAppFonts` con los nombres de los tokens y se cambian los valores de `fonts`; los componentes no cambian. No se incluyen archivos de Myriad Pro ahora (FR-009).

**R-4 · Peso medio.** Decisión: renombrar `fonts.medium` a `fonts.semibold` y migrar los estilos que lo usaban (`sectionTitle`, `cardTitle`, `label`, `button`). Con fuentes personalizadas el peso va en el archivo, nunca en `fontWeight`.

**R-5 · Tamaños.** Decisión: aplicar los de `Design.md`: `screenTitle` 26/32 Bold, `sectionTitle` 19/26 Semibold, `cardTitle` 17/22 Semibold, `metricNumber` 30/36 Bold (estilo nuevo), `body` 15/22, `bodySmall` 13/18, `metadata` 13/18, `label` 12/16 Semibold con espaciado 0,24, `button` 15/20 Semibold, `code` 14/20. Los controles de 52 px siguen cabiendo con 15/22; los títulos de tarjeta se limitan a 2 líneas con puntos suspensivos donde ya se usan.

**R-6 · Arranque.** Decisión: llamar `SplashScreen.preventAutoHideAsync()` al cargar el módulo del layout raíz y `SplashScreen.hideAsync()` cuando `useFonts` termine, o falle, o pasen 5 s (lo que ocurra primero); si falla, se sigue con la fuente del sistema. Alternativa descartada: `return null` sin retener el splash (deja ver un fogonazo en blanco).

**R-7 · Verificación.** Pruebas: (a) ningún archivo de `src` o `app` fuera de `src/theme/` contiene `fontFamily` o `fontWeight`; (b) los estilos del tema coinciden con `Design.md`; (c) los tokens de fuente apuntan a nombres cargados por `useAppFonts`. En jest se mockean las fuentes, como el resto de módulos nativos.

**R-8 · Documentos.** `Decisions.md`: D-041 (Roboto) queda sustituida por D-051; agregar nota del respaldo activo (Source Sans 3) y del tiempo máximo de carga. `Design.md` ya describe la tipografía y no necesita cambios, salvo indicar el respaldo en uso si cambia.
