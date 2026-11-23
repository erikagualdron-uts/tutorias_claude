# Research: Corregir la navegación a las pantallas sin pestaña

Sin `NEEDS CLARIFICATION` abiertos. Todo lo de abajo se comprobó con el router real (`expo-router/testing-library`, Expo Router 58) el 2026-11-23.

## R-1. Por qué la campana termina en el inicio

- **Hallazgo**: `RoleTabs` declara la bandeja (y, en el CAE, `changes`) con `options={{ href: null }}`. Con `href: null`, `router.push('/(student)/notifications')` (y las variantes `/notifications` y con o sin grupo) deja la ruta en `/` y no muestra la pantalla. Una pestaña visible sí navega (`/notifications`).
- **Causa**: en esta versión del router, una pantalla con `href: null` no es un destino de navegación; la barra la ignora y la ruta cae al inicio, que es el comportamiento que ve la persona.
- **Por qué no se vio**: `inbox.test.tsx` simula `expo-router` entero (`router.push` es un `jest.fn`) y solo comprueba la llamada.

## R-2. Cómo ocultar la pestaña sin bloquear la navegación

| Opción | ¿Navega? | Notas |
|---|---|---|
| `href: null` (hoy) | No | La causa del error |
| `tabBarItemStyle: { display: 'none' }` | Sí | **Elegida.** Es la forma documentada de React Navigation para no mostrar el botón y quitar su hueco; el elemento queda fuera del árbol de accesibilidad |
| `tabBarButton: () => null` | Sí | Navega, pero puede dejar un hueco del ancho de una pestaña en la barra |

- **Decisión**: `tabBarItemStyle: { display: 'none' }` en las pantallas sin pestaña, junto con `title` para el encabezado (la barra superior usa `options.title`).
- **Razón**: FR-001, FR-004 y FR-005; no cambia lo que se ve.
- **Verificación pendiente en dispositivo**: que la barra conserve el ancho de sus pestañas (SC-004) y que un lector de pantalla no anuncie una pestaña vacía; se revisa en el recorrido manual (`quickstart.md`) porque Jest no mide diseño.

## R-3. "Volver atrás" desde una pantalla sin pestaña

- **Hallazgo**: con el comportamiento por defecto de las pestañas, tras abrir la bandeja desde la pestaña Módulos, "atrás" va al inicio (`/`), no a Módulos. Con `backBehavior="history"` regresa a `/modules`.
- **Decisión**: `RoleTabs` fija `backBehavior="history"`.
- **Efecto secundario aceptado**: en Android, el botón atrás del sistema recorre las pestañas visitadas en orden inverso en vez de saltar siempre al inicio; es la convención de la plataforma y se registra en D-121.
- **Límite**: iOS no tiene botón atrás del sistema, y ni la bandeja ni la lista de cambios tienen botón propio; la persona vuelve con la barra inferior. Agregar un botón de volver a la barra superior sería un cambio de diseño y queda fuera de esta spec (FR-008); se anota como pendiente en D-121.

## R-4. Una sola declaración de pantallas sin pestaña

- **Decisión**: `src/features/shell/roleTabs.config.ts` exporta, por rol, `tabs` y `hidden`. `hidden` incluye `notifications` en los tres roles y `changes` en el CAE. Los tres `_layout.tsx` y la prueba lo leen; `RoleTabs` deja de escribir `notifications` a mano. El layout del CAE sigue sumando el contador de PQRS radicadas a la pestaña de PQRS (un dato vivo que no va en la configuración).
- **Razón**: FR-007; si la prueba tuviera su propia lista, una pantalla nueva sin pestaña no quedaría cubierta.
- **Alternativas**: dejar `hidden` solo en `app/(admin)/_layout.tsx` y la bandeja en `RoleTabs` (la prueba no podría enumerarlas sin montar los layouts reales, que traen consultas y contadores); inferir las pantallas ocultas escaneando archivos (no distingue una pestaña de una pantalla sin pestaña).

## R-5. La prueba con el router real

- **Decisión**: `src/features/shell/__tests__/hiddenScreens.test.tsx`, con `renderRouter` y una sesión iniciada en el almacén de sesión:
  1. Por cada rol y cada pantalla de `hidden`: se navega a ella y se ve su contenido (relleno).
  2. La barra muestra tantas pestañas como `tabs` y ningún título de `hidden`.
  3. La campana (el componente real, con el contador simulado a nivel de API) abre la bandeja desde el inicio y desde otra pestaña, y "atrás" regresa a la pestaña de origen.
  4. Sin sesión, la bandeja no se muestra (la guarda manda al inicio de sesión).
  5. Cada archivo de nivel superior de `app/(rol)` es una pestaña o está en `hidden`.
- **Razón**: FR-006 y FR-007; la prueba 1 falla con `href: null` (se comprobó) y pasa con la corrección.
- **Límite honesto**: usa pantallas de relleno, no las reales (las reales traen consultas y mocks). Comprueba la navegación y la barra, no el contenido de la bandeja, que ya cubre `inbox.test.tsx`.
- **Nota**: el almacén de sesión y la API se simulan como en `inbox.test.tsx`; el router no.
