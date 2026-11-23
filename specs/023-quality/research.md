# Research: Calidad: seguridad, accesibilidad y rendimiento

Sin `NEEDS CLARIFICATION` abiertos. Cada punto resume qué se decidió y por qué.

## R-1. Qué significa "una ruta sin regla de acceso"

- **Decisión**: hoy tres guards globales se encadenan: `PublicThrottlerGuard` (límite de tasa solo a las rutas `@Public`), `JwtAuthGuard` (exige sesión salvo `@Public`) y `RolesGuard` (si no hay `@Roles`, cualquier rol con sesión pasa). Por eso no hay rutas "abiertas" por olvido, pero sí rutas que debían llevar `@Roles` y no lo llevan (queda abierta a los tres roles). La auditoría clasifica cada ruta real en una de tres categorías: **pública** (`@Public`, debe estar en `PUBLIC_ROUTES`), **con roles** (`@Roles`, en el método o la clase) o **de cualquier rol con sesión** (sin `@Roles`, debe estar en `ANY_ROLE_ROUTES` con su motivo). Todo lo demás es un problema.
- **Razón**: FR-001 y SC-001. Una ruta nueva de un solo rol sin `@Roles` deja de pasar inadvertida, y una lista de "cualquier rol" corta y justificada es revisable en un vistazo.
- **Alternativas**: exigir `@Roles` en todas las rutas (obligaría a listar los tres roles en `/auth/me`, las notificaciones y el chat, y borra la diferencia entre "a propósito" y "por olvido"); invertir el guard para negar por defecto (cambia el comportamiento y es un cambio de seguridad mayor que lo que pide esta spec).

## R-2. Cómo se enumeran las rutas

- **Decisión**: `test/utils/routes.ts` usa `DiscoveryService.getControllers()` y, para cada método con `METHOD_METADATA` y `PATH_METADATA`, arma el método HTTP, la ruta completa (prefijo global `api/v1` + ruta del controlador + ruta del método) y lo que dicen `IS_PUBLIC` y `ROLES` en el método o en la clase (como `getAllAndOverride` de los guards). `auditRoutes(routes, policy)` es una función pura en `src/common/route-audit.ts`, con su prueba unitaria; la e2e le pasa las rutas reales. El controlador de prueba `RoleProbeController` se excluye por nombre.
- **Razón**: separar la regla (pura y fácil de probar con rutas inventadas) de la enumeración (que solo existe con la aplicación armada); así la prueba unitaria demuestra que una ruta sin regla falla (escenario 2 de la historia 1).
- **Alternativas**: leer los archivos con expresiones regulares (frágil ante clases con `@Roles` y herencia); recorrer el router de Express (sin acceso a los metadatos de los guards).

## R-3. Qué se considera un dato de más

- **Decisión**: la e2e `response-secrets` llama a los endpoints de lectura de cada rol (una tabla de rutas por rol con datos reales de un mundo de prueba) y recorre cada JSON en profundidad con dos reglas. Regla 1, claves prohibidas en cualquier respuesta: `passwordHash`, `password`, `refreshToken`, `accessToken`, `secret`, `smtp` con clave o contraseña, `verificationCode`, `resetCode`, `codeHash`; con una lista corta de excepciones por ruta (los tokens del inicio de sesión, del registro y de `refresh`; la clave temporal de un docente, que se muestra una vez). Regla 2, datos de contacto ajenos: en las respuestas del docente y del estudiante no aparecen claves `email` ni `phone`, salvo la de su propio perfil (`/auth/me`); el CAE sí los ve donde la spec 016 y la 017 lo definen.
- **Razón**: FR-003 y SC-002; las dos reglas cubren los dos riesgos reales (credenciales y datos personales entre roles) y dejan visible la lista de excepciones.
- **Alternativas**: revisar a mano cada serializador (no se repite); prohibir `email` también al CAE (rompería lo que la 016 y la 017 prometen).

## R-4. Registros

- **Decisión**: se amplía `test/log-redaction.e2e-spec.ts` con un escenario que recorre las lecturas de cada rol y compara la salida contra contraseñas, tokens y textos de los datos del mundo de prueba (como ya hacen los casos de las specs 017 a 022).
- **Razón**: FR-004 y SC-002 con la infraestructura de captura que ya existe.

## R-5. Accesibilidad de los controles

- **Decisión**: `src/testing/a11y.ts` exporta `controlIssues(root)`, que recorre los elementos de la pantalla renderizada que son controles táctiles (rol `button`, `link`, `switch`, `tab`, `radio`, `checkbox` o con `onPress`) y devuelve los problemas: sin etiqueta ni texto que sirva de nombre, sin rol, o con una altura declarada menor que 48 px (`minHeight` o `height` del estilo aplanado, del control o de su contenedor inmediato, o `hitSlop` que lo complete). Las pruebas de pantalla ya existentes lo llaman con una línea (`expect(controlIssues(screen)).toEqual([])`), por pantalla principal y por estado (con datos, vacío, error).
- **Límite honesto**: Jest no tiene motor de diseño, así que la altura solo se comprueba por lo **declarado** en los estilos, no por lo medido; el recorrido con un lector de pantalla real es manual (`quickstart.md`).
- **Razón**: FR-005 y SC-003; una línea por pantalla es barata de mantener y cubre justo el defecto más común (un control sin nombre).
- **Alternativas**: una prueba nueva por pantalla (duplica los mocks de cada feature); una herramienta externa de auditoría (dependencia nueva y no corre en Jest).

## R-6. "Reducir movimiento" en toda la app

- **Decisión**: `src/__tests__/reduceMotion.test.ts` escanea `src/` y `app/` (sin pruebas) y exige que todo archivo que use animaciones (`withTiming`, `withRepeat`, `withSpring`, `withSequence`, `FadeIn*`, `FadeOut*`, `SlideIn*`, `entering=`, `exiting=`, `requestAnimationFrame` o `Animated.`) cumpla una de tres: consulta `useMotion` o `useReducedMotion`, envuelve con `FadeInView` (que ya lo consulta) o recibe una propiedad `animated` que ya decidió el padre. Hoy lo cumplen todos; los cuatro archivos que no nombran el gancho (`AuthLayout`, `Banner`, `WeekCalendar` y `LoaderRing`) usan `FadeInView` o `animated`. Una lista de excepciones por archivo, con motivo, queda en la misma prueba.
- **Razón**: FR-007; es la misma técnica de `noGeometricDecoration` (D-049) y evita que una animación nueva ignore el ajuste.
- **Alternativas**: exigir el gancho en todos (obligaría a duplicar la consulta en los envoltorios que ya la tienen).

## R-7. Contraste

- **Decisión**: `src/theme/__tests__/contrast.test.ts` calcula la razón de contraste de WCAG (luminancia relativa) de una lista de pares (texto y fondo) por paleta, tomada de la tabla de contraste de `Design.md`: texto principal y secundario sobre fondo, tarjeta y pantalla; blanco sobre primario y sobre error; texto verde oscuro sobre acento, éxito y advertencia; enlace y error sobre tarjeta; el verde de marca como texto. Mínimo 4,5:1 para texto normal y 3:1 para texto grande e íconos. Falla nombrando el par y su razón. Los pares que hoy no cumplan se corrigen con el tono derivado mínimo, marcado "derived" en `colors.ts` y en `Design.md`.
- **Razón**: FR-009 y SC-005; una prueba aritmética es exacta y no necesita un dispositivo.
- **Alternativas**: verificar con capturas (frágil y manual).

## R-8. Letra grande

- **Decisión**: una guarda estática (`fontScaling.test.ts`) prohíbe `allowFontScaling={false}` y `maxFontSizeMultiplier` en `src/` y `app/`; hoy no hay ninguno. El recorrido al 200 % de cada pantalla principal es manual y queda como lista en `quickstart.md`; lo que se corte se corrige cambiando alturas fijas por `minHeight` y dejando que el texto se parta, sin tocar el diseño.
- **Límite honesto**: Jest no mide diseño, así que no hay prueba automática de "no se corta"; solo la guarda que impide apagar el escalado.
- **Alternativas**: simular `fontScale` en Jest (no cambia nada medible sin motor de diseño).

## R-9. Datos de volumen

- **Decisión**: `tutorias_uts_db/prisma/seed-load.ts` crea, de forma determinista, 1 periodo activo y 2 cerrados, 15 sedes y salones con capacidades variadas, 40 docentes, 500 estudiantes (algunos desactivados y eliminados), 200 módulos (algunos eliminados) con sus horarios y al menos 4.000 sesiones (con cancelaciones, reprogramaciones y festivos), inscripciones, sesiones omitidas, 200 PQRS en los tres estados con respuestas, conversaciones directas y de módulo con mensajes, y avisos. Todos los usuarios comparten la clave de pruebas de las e2e. Se niega a correr si `LOAD_SEED_CONFIRM` no vale `yes` o si el nombre de la base no termina en `_load`. Script `npm run seed:load`.
- **Razón**: FR-010; determinista para que dos corridas den la misma medición, y con filas "sucias" (desactivadas, eliminadas, cerradas) porque son las que más cuestan en las consultas.
- **Alternativas**: reutilizar la semilla de desarrollo (tiene pocos datos); generar al azar (dos corridas no se pueden comparar).

## R-10. Medición

- **Decisión**: `perf/measure.perf-spec.ts` y `vitest.config.perf.ts` (incluye solo `perf/**/*.perf-spec.ts`; exige `PERF_DATABASE_URL` y usa esa base) arrancan la aplicación con los proveedores reales, inician sesión con un CAE, un docente y un estudiante de la semilla de carga y piden cada endpoint principal 3 veces de calentamiento y 20 de medida, con `performance.now()`. Imprime una tabla (endpoint, rol, mediana, p95) y falla si algún p95 supera `PERF_MAX_MS` (por defecto 300). El script `npm run perf` la corre; no forma parte de `npm run test` ni de `test:e2e`. Los endpoints: lista de módulos del CAE y del estudiante, calendario del docente y del estudiante, los dashboards de los tres roles, lista de PQRS con filtros, conversaciones y mensajes de una conversación grande.
- **Razón**: FR-011 y SC-006; repetible, con el volumen real, y aparte de las pruebas del día a día para no volverlas lentas. Corregir lo lento es una tarea con índice o consulta mejor, medida antes y después.
- **Límite honesto**: el tiempo incluye la ida y vuelta local de Supertest y depende de la máquina; se anota el entorno junto al resultado y no se interpreta como garantía de producción.
- **Alternativas**: una herramienta de carga externa (dependencia nueva y más ruido que el que esta spec necesita).

## R-11. Rendimiento en la app

- **Decisión**: el dashboard del CAE (3 s) y el cambio de semana (2 s) se miden a mano con la app contra la API que corre sobre la base de carga, y se anotan en el recorrido; las listas largas (módulos, PQRS, mensajes) se revisan a mano buscando saltos. Si algo falla, se corrige donde esté (consulta del servidor o carga de la lista) y no en la medición.
- **Razón**: no hay un banco de pruebas de rendimiento de la app en Jest; inventarlo costaría más que el riesgo que cubre, y el cuello de botella real suele estar en el servidor, que sí se mide (R-10).
