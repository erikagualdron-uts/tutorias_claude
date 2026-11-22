---
name: expo-feature
description: "Crea o modifica una funcionalidad o pantalla de la app móvil React Native + Expo (estructura por feature, Expo Router, TanStack Query, Zustand, manejo de errores del backend, estados de pantalla). Úsala siempre que se pida una pantalla, flujo, hook o llamada a la API en mobile/, aunque no se mencione Expo."
---

# Funcionalidad de la app (Expo)

Lee antes: `docs/Conventions.md` sección 5 (App móvil), `docs/Design.md` (patrones de pantalla del rol afectado) y la `spec.md` de la funcionalidad.

## Estructura
```
mobile/src/features/<feature>/
├── components/
├── hooks/          # useX.ts; consultas y mutaciones con TanStack Query
├── api/            # llamadas HTTP de la feature
├── screens/
└── types.ts
```
Las rutas de `mobile/app/` (Expo Router) solo ensamblan pantallas. Los grupos de rutas son por rol: `(auth)`, `(admin)`, `(teacher)`, `(student)`.

## Reglas
1. **Estado del servidor** con TanStack Query; claves como arreglos: `['modules', { periodId }]`. **Estado local** con Zustand, solo para sesión y preferencias de UI.
2. **La app no es la barrera de las reglas.** Puede deshabilitar un botón como ayuda, pero el backend valida siempre. Un botón deshabilitado **siempre muestra la regla** que lo bloquea (ver `Design.md`).
3. **Errores del backend:** el backend devuelve un `code`; la app lo traduce con `t('errors.<CODE>')`. Nunca mostrar el `message` del servidor al usuario.
4. **Estados:** toda pantalla maneja los cuatro: cargando (skeleton), vacío, error (con "Reintentar") y con datos. Además, el banner de "sin conexión".
5. **Textos, estilos e íconos:** usar `i18n-strings` para los textos y `uts-ui` para estilos, componentes, animaciones y botones. Sin textos ni hexadecimales dentro de los componentes. **Íconos solo con Iconify**; todo botón lleva ícono y hay 16 px entre botones apilados.
6. **Tokens de sesión** en `expo-secure-store`, nunca en `AsyncStorage`.
7. **Fechas:** el backend entrega UTC; mostrar en `America/Bogota` con la librería de fechas única del proyecto.
8. **Accesibilidad:** objetivos táctiles de 48 px, `accessibilityLabel` en íconos con significado, estado nunca solo por color.
9. **Tiempo real:** el chat usa un único cliente de Socket.IO, autenticado con el token; reconectar y mostrar el banner "Reconectando…".

## Pruebas
- Componentes con estados (tarjeta de módulo, bloque de sesión, burbuja de chat): Jest + React Native Testing Library, un caso por estado.
- Hooks con mutaciones: probar éxito y cada `code` de error relevante.

## Al terminar
Pasar la skill `feature-done-check`.
