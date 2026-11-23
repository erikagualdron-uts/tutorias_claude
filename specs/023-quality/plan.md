# Implementation Plan: Calidad: seguridad, accesibilidad y rendimiento

**Branch**: `023-quality` | **Date**: 2026-11-22 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/023-quality/spec.md`

## Summary

Una revisión transversal sin funcionalidad nueva: pruebas que impiden que una ruta quede sin regla de acceso o que una respuesta filtre un dato de más, comprobaciones repetibles de accesibilidad (etiquetas, "reducir movimiento", contraste) en la app, y una medición de rendimiento con el volumen de una institución.

Enfoque técnico (detalle en [research.md](research.md)):

- **Acceso de rutas**: todas las rutas ya exigen sesión por defecto (`JwtAuthGuard` global) y `RolesGuard` solo restringe cuando hay `@Roles`. El riesgo real es una ruta que debía llevar `@Roles` y no lo lleva. Una función pura `auditRoutes` (con su prueba unitaria) compara las rutas reales, que una prueba e2e enumera con `DiscoveryService`, contra dos listas explícitas: las **públicas** (hoy las 7 de `auth.controller.ts`) y las **de cualquier rol con sesión** (con su motivo). Una ruta fuera de las dos listas y sin `@Roles` hace fallar la suite y se nombra.
- **Datos de más**: una e2e llama a los endpoints de lectura de cada rol y recorre el JSON buscando claves prohibidas (hashes, tokens, claves, códigos) y, para docente y estudiante, correos y teléfonos ajenos; las excepciones (tokens en el inicio de sesión, la clave temporal que se muestra una vez) van en una lista corta. La prueba de registros de la 018 a la 022 se amplía.
- **App, lector de pantalla**: una ayuda de prueba revisa que cada control táctil de una pantalla tenga nombre y rol y un tamaño declarado de al menos 48 px, y se llama desde las pruebas de pantalla que ya existen (una línea por pantalla principal). El recorrido real con TalkBack o VoiceOver es manual.
- **App, "reducir movimiento"**: una prueba estática (como `noGeometricDecoration`) falla si un archivo anima y no consulta `useMotion` o `useReducedMotion`, ni usa `FadeInView`, ni recibe un `animated` ya decidido.
- **App, contraste**: una prueba calcula la razón de contraste de cada par de color de las paletas clara y oscura y falla bajo AA; los pares que hoy no cumplan se corrigen con el tono derivado mínimo (marcado en `Design.md`).
- **App, letra grande**: una guarda estática impide `allowFontScaling={false}` y los límites de escala; el 200 % se recorre a mano con una lista y lo que se corte se corrige cambiando alturas fijas por mínimas.
- **Rendimiento**: una semilla de volumen (`seed:load`) en `tutorias_uts_db`, que se niega a correr contra una base que no sea de carga, y una medición `npm run perf` en el backend que arranca la API contra esa base, mide el p95 de los endpoints principales y lo compara con 300 ms.
- **Sin dependencias nuevas** en backend ni en la app.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 LTS o superior en backend; Expo SDK 58 en la app).

**Primary Dependencies**: Backend: NestJS 12 (`DiscoveryService`, `Reflector`), Prisma 7, Vitest, Supertest (presentes). App: Jest, React Native Testing Library, `react-native-reanimated` (presentes). **Ninguna dependencia nueva.**

**Storage**: PostgreSQL. Una **base aparte para la carga** (`tutorias_load`) en el mismo contenedor, con las mismas migraciones; ni las pruebas ni la semilla de desarrollo la tocan. Sin migración nueva.

**Testing**: Backend: unitaria de `auditRoutes`; e2e de acceso de rutas, de secretos en respuestas y de registros; medición `perf` aparte (no corre en `npm run test` ni en `test:e2e`). App: pruebas de contraste, de "reducir movimiento" (estática), de letra y de accesibilidad por pantalla dentro de las pruebas de pantalla existentes, con paridad de i18n.

**Target Platform**: Android e iOS (app); API HTTPS.

**Project Type**: mobile-app + web-service + base de datos. Toca `tutorias_uts_back`, `tutorias_uts_mobile` y `tutorias_uts_db` (solo la semilla de carga y su script).

**Performance Goals**: p95 de servidor por debajo de 300 ms en los endpoints principales con 200 módulos, 4.000 sesiones, 200 PQRS, 500 estudiantes y 40 docentes; dashboard del CAE en menos de 3 s y cambio de semana en menos de 2 s en la app (estos dos, a mano).

**Constraints**: ningún cambio de contrato ni de funcionalidad (salvo quitar un dato que no debía salir, FR-003); los datos de carga son sintéticos y nunca se cargan en producción (la semilla verifica el nombre de la base y una confirmación explícita); colores solo de `Design.md` (un tono derivado se marca como tal); textos nuevos en es y en; sin cambiar lo que ve la persona usuaria.

**Scale/Scope**: unas 110 rutas del backend, unas 25 pantallas principales, 4 archivos de pruebas nuevos en la app y 3 en el backend, una semilla y una medición.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|---|---|
| I. Fuente de verdad en docs/ | Se respeta `Design.md` (paleta, contraste, 48 px, accesibilidad) y `Conventions.md` §7. Se actualizan `Conventions.md` (la prueba de acceso y la lista de excepciones como regla de trabajo), `Design.md` (cualquier tono derivado nuevo), `Architecture.md` (la semilla de carga y `perf`) y `Decisions.md` (D-120; la numeración sigue a D-119 de la 022). |
| II. Reglas de negocio en backend | No cambia ninguna regla; la prueba de acceso vigila justamente que los permisos por rol se validen en el servidor en cada ruta. |
| III. Integridad de datos | La semilla de carga solo escribe en la base de carga, nunca borra datos fuera de ella, y respeta `deletedAt` y UTC. |
| IV. Seguridad y privacidad | Es el objetivo de la spec: acceso por ruta comprobado, respuestas sin secretos, registros sin contraseñas ni textos. Los datos de carga no incluyen personas reales. |
| V. Pruebas primero en lo crítico | La prueba de acceso y la de secretos se escriben antes de corregir lo que encuentren. |
| VI. Internacionalización | Las etiquetas de accesibilidad que falten se agregan en es y en. |
| VII. Diseño consistente | Solo paleta y componentes de `Design.md`; el contraste AA y los 48 px se verifican, no se redefinen. |
| VIII. Desarrollo incremental | Una funcionalidad por rama; las cuatro historias son independientes y el plan se resume y espera confirmación antes de implementar. |
| IX. Idioma | Docs en español, código y commits en inglés. |

**Resultado**: sin violaciones. Se vuelve a revisar al final de la fase 1: sin cambios.

## Project Structure

### Documentation (this feature)

```text
specs/023-quality/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── tasks.md             # lo genera /speckit-tasks
```

No hay `contracts/`: esta spec no cambia ningún endpoint.

### Source Code

```text
tutorias_uts_back/
├── src/common/route-audit.ts                  # auditRoutes(routes, policy): problemas (función pura)
├── src/common/route-audit.spec.ts
├── test/utils/routes.ts                       # enumera las rutas reales con DiscoveryService y Reflector
├── test/utils/route-policy.ts                 # PUBLIC_ROUTES y ANY_ROLE_ROUTES con su motivo
├── test/route-access.e2e-spec.ts              # ninguna ruta sin regla; las listas no tienen entradas viejas
├── test/response-secrets.e2e-spec.ts          # claves prohibidas y datos de contacto ajenos, por rol
├── test/log-redaction.e2e-spec.ts             # se amplía con las lecturas de cada rol
├── perf/measure.perf-spec.ts                  # p95 por endpoint contra la base de carga
├── vitest.config.perf.ts
└── package.json                               # script "perf"

tutorias_uts_db/
├── prisma/seed-load.ts                        # datos de volumen, solo en una base de carga
└── package.json                               # script "seed:load"

tutorias_uts_mobile/
├── src/testing/a11y.ts                        # controlIssues(root): control sin nombre, sin rol o más pequeño que 48 px
├── src/theme/__tests__/contrast.test.ts       # razones de contraste por par, paleta clara y oscura
├── src/__tests__/reduceMotion.test.ts         # estática: quien anima consulta "reducir movimiento"
├── src/__tests__/fontScaling.test.ts          # estática: ni allowFontScaling={false} ni límites de escala
├── src/features/*/__tests__/…                 # una línea expectAccessibleControls en las pruebas de pantalla
└── src/theme/colors.ts                        # solo si un par no cumple AA (tono derivado, marcado)

Claude/docs/                                   # Conventions, Design, Architecture, Decisions
```

**Structure Decision**: las comprobaciones viven junto a lo que vigilan (la auditoría de rutas junto a los guards, las pruebas de contraste junto al tema) y la carga en el repositorio de la base de datos, donde ya vive la semilla. La medición `perf` es una configuración de Vitest aparte para no enlentecer ni inestabilizar las pruebas del día a día.

## Complexity Tracking

Sin violaciones de la constitución que justificar.
