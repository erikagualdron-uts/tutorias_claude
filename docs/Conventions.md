# Conventions.md

> Cómo se escribe y se entrega el código en este proyecto. Si una convención choca con la realidad, se cambia aquí y se registra en `Decisions.md`.

## 1. Idioma

- **Documentación y comunicación:** español.
- **Código, nombres de variables, funciones, archivos, ramas y commits:** inglés.
- **Textos visibles para el usuario:** nunca en el código; van en archivos de traducción (`es` y `en`).

## 2. Git

### Ramas
- `main`: siempre estable.
- Una rama por funcionalidad, con el nombre que genera Spec Kit: `NNN-feature-name` (ej. `004-module-management`).
- Correcciones pequeñas fuera de una spec: `fix/short-description`. Documentación: `docs/short-description`.

### Commits (Conventional Commits, en inglés)
Formato: `type(scope): short description`, en imperativo y sin punto final.

| Tipo | Uso |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un error |
| `docs` | Solo documentación |
| `refactor` | Cambio interno sin cambiar comportamiento |
| `test` | Agregar o corregir pruebas |
| `chore` | Dependencias, configuración, tareas de mantenimiento |

Ejemplos: `feat(enrollments): block enrollment when module is full`, `fix(auth): reject deactivated users on token refresh`.

### Reglas
- Commits pequeños; un propósito por commit.
- Nunca se suben `.env`, claves, ni `.claude/settings.local.json`. Se mantiene un `.env.example` sin valores reales.
- Una funcionalidad se une a `main` por Pull Request, con las pruebas pasando.

## 3. Estilo de código (backend y app)

- **TypeScript en modo estricto** (`strict: true`). Prohibido `any` salvo justificación en un comentario.
- **ESLint + Prettier** con la misma configuración en `backend/` y `mobile/`. El código se formatea automáticamente al guardar y se verifica en CI.
- Nombres:
  - Variables y funciones: `camelCase`.
  - Clases, tipos, interfaces y componentes React: `PascalCase`.
  - Constantes y enums: `UPPER_SNAKE_CASE` para valores (`ENROLLMENT_STATUS.ACTIVE`).
  - Archivos del backend: `kebab-case` con sufijo de rol (`enrollments.service.ts`, `create-module.dto.ts`).
  - Archivos de componentes de la app: `PascalCase.tsx` (`ModuleCard.tsx`); hooks en `useX.ts`.
- Funciones cortas con un solo propósito. Preferir retornos tempranos sobre `if` anidados.
- Comentarios para explicar **por qué**, no **qué**. Las reglas de negocio llevan un comentario que referencia la sección de `Context.md` cuando no es obvio.
- Sin código muerto ni `console.log` olvidados.

## 4. Backend (NestJS)

### Estructura por módulo
Cada módulo de negocio vive en `backend/src/<module>/` con:

```
<module>/
├── <module>.module.ts
├── <module>.controller.ts      # solo HTTP: valida entrada, llama al servicio
├── <module>.service.ts         # reglas de negocio
├── dto/                        # DTOs de entrada y salida
├── entities o types/
└── <module>.service.spec.ts    # pruebas
```

- Los controladores **no** contienen lógica de negocio.
- Las reglas críticas (cupo, cruces, ventanas de cancelación, cambio de salón) viven en el servicio, dentro de transacciones cuando haya riesgo de concurrencia.
- Los DTOs se validan con `class-validator`; la respuesta nunca incluye `passwordHash` ni datos sensibles.
- Cada endpoint declara su guard de roles (`@Roles(...)`). Un endpoint sin guard es un error de revisión.

### API REST
- Prefijo `/api/v1`. Recursos en plural y `kebab-case`: `/modules`, `/rooms`, `/enrollments`, `/academic-periods`.
- JSON en `camelCase`. Fechas en **ISO 8601 UTC** (`2026-11-16T15:00:00Z`).
- Métodos: `GET` leer, `POST` crear, `PATCH` modificar parcialmente, `DELETE` borrado lógico.
- Listados paginados: `?page=1&limit=20`; respuesta `{ "data": [...], "meta": { "page", "limit", "total" } }`.
- Toda la API documentada con Swagger.

### Errores
Formato único de error:

```json
{
  "statusCode": 409,
  "code": "ENROLLMENT_SCHEDULE_CONFLICT",
  "message": "Schedule conflict with another module",
  "details": { "conflictingModuleId": "..." }
}
```

- `code` es estable, en `UPPER_SNAKE_CASE`, y es lo que usa la app para mostrar el mensaje traducido (`errors.ENROLLMENT_SCHEDULE_CONFLICT`). El `message` es solo para desarrolladores.
- Códigos HTTP: `400` datos inválidos, `401` sin sesión, `403` sin permiso, `404` no existe, `409` regla de negocio violada, `422` validación semántica.
- Cada regla de negocio de `Context.md` tiene su propio `code`.

### Base de datos (Prisma + PostgreSQL)
- Modelos en `PascalCase` singular (`Module`); tablas en `snake_case` plural con `@@map` (`modules`); columnas en `snake_case` con `@map`.
- Todas las tablas: `id` (UUID), `createdAt`, `updatedAt`. Las entidades con borrado lógico: `deletedAt`. Las consultas filtran siempre `deletedAt: null`.
- Nunca se edita una migración ya aplicada: se crea una nueva. Los nombres de migración describen el cambio (`add_module_schedule_table`).
- Existe un script de **seed** para desarrollo: periodo activo, un SUPERADMIN, salones y datos de ejemplo.

### Registro (logs)
- Niveles: `error`, `warn`, `log`, `debug`.
- Nunca se registran contraseñas, tokens, claves SMTP ni cuerpos de mensajes del chat.

### Configuración
- Variables de entorno validadas al arrancar; si falta una obligatoria, la API no inicia.
- Los valores de negocio configurables (ventanas de 1 y 2 horas, dominios de correo) se leen de la tabla de configuración, no de constantes sueltas.

## 5. App móvil (React Native + Expo)

- Organización por funcionalidad: `src/features/<feature>/` con `components/`, `hooks/`, `api/`, `screens/` y `types.ts`. Lo compartido va en `src/components/` y `src/api/`.
- Las rutas de Expo Router solo ensamblan pantallas; la lógica vive en `features/`.
- **Estado del servidor:** TanStack Query. Las claves de consulta son arreglos: `['modules', { periodId }]`. **Estado local:** Zustand, solo para sesión y preferencias de UI.
- **La app no es la barrera de las reglas de negocio.** Puede mostrar ayudas (botón deshabilitado, aviso), pero el backend siempre valida y la app muestra el `code` de error traducido.
- **Estilos:** todos los colores, espaciados y radios vienen de un archivo de tokens (`src/theme/`) generado a partir de `Design.md`. Prohibido escribir colores hexadecimales dentro de los componentes.
- **Textos:** siempre `t('feature.section.key')`. Las claves se organizan por funcionalidad (`enrollments.card.enroll`) y existen en `es.json` y `en.json`. Un texto sin traducción en ambos idiomas es un error de revisión.
- **Fechas:** no se usa librería de fechas: los días de calendario se manejan con el módulo único `src/date/day.ts` (D-081). La app recibe UTC y muestra en `America/Bogota`. Los días de calendario (inicio y fin de un periodo) se **eligen** con `@react-native-community/datetimepicker` mediante el componente `DateField`, se **muestran como dd/mm/YYYY** en español e inglés y viajan a la API como `YYYY-MM-DD`, sin pasar por una conversión de zona horaria (D-079). Prohibido pedir una fecha escribiéndola a mano.
- **Accesibilidad:** objetivos táctiles de 48 px, `accessibilityLabel` en íconos con significado, y estado nunca solo por color.
- **Íconos:** solo Iconify (`react-native-iconify`, set `solar`). Prohibido `@expo/vector-icons`, Lucide y otras librerías de íconos. Todos los íconos se declaran en un único registro (`src/icons/`) con el nombre escrito como texto literal, y se usan con el componente `Icon`.
- **Botones:** todo botón lleva un ícono a la izquierda (20 px), salvo enlaces de texto y controles solo de ícono (con `accessibilityLabel`). Entre botones apilados hay **16 px** (`spacing.lg`).
- **Animaciones:** con `react-native-reanimated`, usando las duraciones y curvas definidas en el tema (150, 250 y 350 ms). Respetar el ajuste "reducir movimiento". Efectos de pulsación y háptica con `expo-haptics`.
- **Marca:** el logo y los recursos institucionales viven en `mobile/assets/brand/` y se usan sin modificarlos. Los gradientes usan `expo-linear-gradient` con los colores del tema.
- **Tipografía:** Myriad Pro (Regular, Semibold y Bold) y Source Code Pro para código, siempre a través de los tokens `fonts` del tema. Prohibido escribir nombres de fuente o `fontWeight` dentro de los componentes. Los archivos viven en `mobile/assets/fonts/`, se cargan con `useFonts` y el splash se mantiene hasta que carguen. Myriad Pro es de pago: no subir los archivos al repositorio sin confirmar que la licencia lo permite.
- **Campos de texto:** siempre con relleno y borde tenue, ícono a la izquierda y el estado de foco y error definidos en `Design.md`. Nunca un campo sin borde ni relleno.
- **Decoración:** nada de figuras geométricas (círculos, arcos, manchas); se usa el componente `BrandPattern` (hojas, plumas y libros). La única excepción es el anillo giratorio del `BrandLoader`, que es retroalimentación funcional y no decoración (D-080).
- **Nombre de la institución:** "Institución Universitaria Tecnológica de Santander – UTS" (corto: "UTS"). No usar "Unidades Tecnológicas" en la app. El nombre vive en los archivos de traducción.
- **Pantallas sin pestaña (spec 024, D-121):** se declaran en `src/features/shell/roleTabs.config.ts` (`hidden`) y `RoleTabs` las oculta con `tabBarItemStyle: { display: 'none' }`; nunca con `href: null`, que en Expo Router 58 deja la pantalla sin poder abrirse (redirige al inicio). Toda ruta de nivel superior de `app/(rol)` es una pestaña o una pantalla oculta declarada, y `hiddenScreens.test.tsx` (router real) lo vigila.
- Cada pantalla maneja sus cuatro estados: cargando (`BrandLoader` o skeleton), vacío, error y con datos.
- **Loader:** el indicador de carga es el componente `BrandLoader` (un solo ícono de la marca por iteración, que va cambiando entre libro, pluma y hoja, dentro de un anillo giratorio; cada ícono crece al entrar y se reduce al salir, sin sacudida; todo con movimientos que respetan "reducir movimiento"). Prohibido `ActivityIndicator` en componentes y pantallas; un botón en carga usa el `BrandLoader` compacto (D-078, D-080). Una pantalla sin datos que no muestra nada más devuelve `LoadingScreen` (loader centrado en la pantalla), no un `BrandLoader` suelto (D-101).
- Tokens y datos de sesión en `expo-secure-store`; nunca en `AsyncStorage`.

## 6. Pruebas

### Qué debe tener pruebas sí o sí
- **Reglas de negocio del backend:** cupo, sobrecupo concurrente, cruces de horario (estudiante, docente y salón), ventana de 1 hora, ventana de 2 horas, cambio de salón con capacidad insuficiente, reinscripción, dominios de correo.
- **Autenticación y roles:** cada endpoint sensible se prueba con un rol sin permiso y debe responder `403`.
- **Retención de datos:** los jobs que eliminan chats antiguos.
- **Componentes de la app con estados:** tarjeta de módulo (los siete estados), bloque de sesión, burbuja de chat.
- **Acceso por ruta (spec 023):** `test/route-access.e2e-spec.ts` falla, nombrando `MÉTODO /ruta`, si una ruta no es pública y listada, no lleva `@Roles` y no está en la lista de "cualquier rol". Toda ruta nueva declara `@Roles(...)` o entra en `test/utils/route-policy.ts` (`PUBLIC_ROUTES` o `ANY_ROLE_ROUTES`) con su motivo; nunca se desactiva la prueba. Una ruta pública nueva también exige límite de tasa y su caso en `test/public-rate-limit.e2e-spec.ts`.
- **Respuestas y registros:** `test/response-secrets.e2e-spec.ts` recorre las lecturas de cada rol y falla ante claves de credenciales o, para docente y estudiante, `email` o `phone` ajenos. Un endpoint de lectura nuevo se agrega a su tabla.
- **Accesibilidad de la app:** cada prueba de pantalla (`.tsx`) pasa sola por `src/testing/setupA11y.ts`, que falla si lo renderizado deja un control sin nombre, sin rol o declarado bajo 48 px (`allowControlIssues()` solo para quien renderiza un control malo a propósito). `reduceMotion.test.ts` exige que todo archivo que anima consulte "reducir movimiento", `fontScaling.test.ts` prohíbe apagar o limitar el escalado de letra, y `contrast.test.ts` exige AA en los dos temas.

### Herramientas
- Rendimiento: `npm run perf` en el backend (aparte de `test` y `test:e2e`) mide el p95 de los endpoints principales contra la base de carga; ver `Architecture.md` §12.
- Backend: Jest. Pruebas unitarias de servicios y pruebas de integración con una base de datos PostgreSQL de prueba. Las pruebas de concurrencia lanzan varias inscripciones simultáneas y verifican que nunca se supere el cupo.
- App: Jest + React Native Testing Library.

### Definición de terminado
Una funcionalidad está terminada cuando:
1. Cumple su `spec.md` y sus criterios de aceptación.
2. Las reglas de negocio tienen pruebas que pasan.
3. Lint, tipos y pruebas pasan sin errores.
4. Todos los textos están en `es` y `en`.
5. Cumple `Design.md` (colores, estados, accesibilidad).
6. Los archivos de `docs/` afectados están actualizados y, si hubo una decisión importante, está en `Decisions.md`.

## 7. Seguridad

- Contraseñas con argon2. Tokens de acceso de vida corta y refresh rotativo.
- Limitar la tasa de peticiones en login, registro y recuperación de contraseña.
- Validar y sanear toda entrada; consultas siempre parametrizadas (Prisma).
- Los secretos solo en variables de entorno; la clave SMTP, cifrada en la base de datos.
- La clave temporal de un docente se muestra una sola vez y no se guarda en texto plano.

## 8. Documentación

- `docs/` es la fuente de verdad. Si el código y la documentación se contradicen, se corrige uno de los dos en el mismo cambio.
- Las decisiones importantes se anotan en `Decisions.md` con su motivo.
- Cada módulo del backend y cada funcionalidad de la app tiene su spec en `specs/NNN-nombre/`.
