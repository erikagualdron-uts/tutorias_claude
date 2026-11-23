# Research: Pulido de PQRS, dashboards y pruebas

Sin `NEEDS CLARIFICATION` abiertos. Cada punto resume qué se decidió y por qué.

## R-1. Número de radicado

- **Decisión**: `pqrsCode(id)` devuelve los 8 primeros caracteres hexadecimales del identificador, sin guiones y en mayúsculas (por ejemplo `A1B2C3D4`), calculados en la app. La confirmación, la lista y el detalle del autor y del CAE lo muestran con la etiqueta "N.º".
- **Razón**: aclarado en la spec (opción B). Es determinista, así que un reintento de radicación (misma PQRS) da el mismo número, y no exige columna ni migración. Un identificador de 128 bits recortado a 32 bits tiene colisiones teóricas; con cientos de PQRS por semestre es casi imposible y el CAE no lo usa como llave (el identificador completo sigue siendo la llave).
- **Alternativas**: consecutivo por año (dato nuevo, migración y asignación sin duplicados; descartado en la aclaración); calcularlo también en el backend (nada lo necesita hoy; si los correos o el push lo piden, se agrega la misma función).

## R-2. Fechas de la línea de tiempo del autor

- **Decisión**: el detalle del autor (`GET /pqrs/mine/:id`) agrega `reviewedAt` y `resolvedAt` (fecha-hora o `null`), los mismos campos que ya recibe el CAE. La línea de tiempo usa `createdAt`, `reviewedAt` y `resolvedAt`.
- **Razón**: la spec supuso que el autor ya las recibía; al revisar `pqrs.service.ts` solo las expone `adminDetail`. Es el único cambio de backend: aditivo, mismo guard y misma propiedad (`404` en una PQRS ajena), sin dato nuevo.
- **Alternativas**: pedir el detalle del CAE (prohibido para el autor); deducir las fechas de los avisos (no son confiables).
- **Datos viejos**: una PQRS en revisión o resuelta sin `reviewedAt` (si existiera) se dibuja como paso cumplido sin hora (FR-005).

## R-3. Confirmación al radicar

- **Decisión**: pantalla `filed` dentro de la pila de PQRS de cada rol (`/(student)/pqrs/filed` y `/(teacher)/pqrs/filed`). `NewPqrsScreen` hace `router.replace` hacia ella al recibir la respuesta y le pasa `id`, `createdAt` y `status` por parámetros, que son lo que devolvió el servidor. Muestra el número, la fecha en `America/Bogota` y el estado, con "Ver mi PQRS" (abre el detalle) y "Volver a mis PQRS" (lista).
- **Razón**: `replace` evita que "atrás" regrese al formulario ya enviado (que reintentaría). Usar los parámetros no agrega otra consulta ni un estado de carga.
- **Alternativas**: un diálogo (no tiene dos acciones ni espacio para el número con peso); volver a la lista con un aviso breve (lo que existe hoy y lo que `Design.md` marca como pendiente).

## R-4. Línea de tiempo

- **Decisión**: componente `StatusTimeline` con tres pasos en orden. Cada paso tiene ícono, nombre y fecha en `Bogota`; el cumplido lleva el ícono lleno y el actual va resaltado con el texto en negrita de los tokens; los pendientes, atenuados y sin fecha. Se muestra dentro de `PqrsBody`, que usan el detalle del autor y el del CAE.
- **Razón**: una sola pieza para los dos roles; el estado nunca va solo en color, como la insignia de estado (`Design.md`). Los iconos son los de la insignia (`pqrs`, `clock`, `success`).
- **Alternativas**: reemplazar la insignia por la línea (la lista y la tarjeta la siguen necesitando).

## R-5. Insignia de PQRS radicadas

- **Decisión**: `useFiledCount()` consulta `GET /pqrs?status=FILED&limit=1` y devuelve `meta.total`; la pestaña usa `tabBarBadge` con fondo #B3261E y número blanco, oculta en cero y `99+` desde 100. La clave de la consulta cuelga de `['pqrs']`, que ya se invalida al pasar a revisión, responder o resolver, y se repite cada 60 s y al volver la app a primer plano. El diseño de la barra recibe la cantidad por una opción de pestaña; solo el layout del CAE la pasa.
- **Razón**: reutiliza el endpoint del CAE que ya existe (una fila) en vez de pedir todo el dashboard; el patrón es el del contador de avisos (`useUnreadCount`, D-099). Si la consulta falla, el valor es 0 y no se muestra nada.
- **Alternativas**: `GET /dashboard/admin/overview` (corre las consultas de módulos y salones solo para un número); un canal en vivo (D-099 lo descarta por ahora).

## R-6. Conteo animado

- **Decisión**: `useCountUp(valor)` devuelve el número a mostrar: la primera vez que la tarjeta se monta con un número entero, sube de 0 a su valor en 600 ms con una curva de salida suave; los cambios posteriores devuelven el valor nuevo de inmediato; con `useReducedMotion` devuelve siempre el valor final. `MetricCard` agrega un `accessibilityLabel` con el valor final para que el lector de pantalla no lea los números intermedios.
- **Razón**: `Design.md` pide "count up once on first load"; un gancho con `requestAnimationFrame` no agrega dependencias y es fácil de probar con temporizadores simulados. Los valores no numéricos (el guion, "2 h") pasan tal cual.
- **Alternativas**: `Animated` o `reanimated` con texto animado (más piezas para un texto que cambia unas 30 veces); una librería de contadores (dependencia nueva).

## R-7. Prueba de módulos estable

- **Decisión**: agregar `"testTimeout": 15000` a la configuración de Jest de `package.json`; no se cambia el contenido de `module-form.test.tsx`.
- **Razón**: la prueba (selectores de periodo, docente, salón y horas) hace muchas esperas y en la suite completa compite por CPU; falla por los 5 s por defecto, no por una aserción. En la corrida sola pasa (8 de 8). Un tiempo global evita el mismo problema en otras pruebas pesadas.
- **Alternativas**: subir solo el tiempo de esa prueba (el siguiente fallo sería otra); correr siempre en serie (más lento para todos y oculta el problema).
