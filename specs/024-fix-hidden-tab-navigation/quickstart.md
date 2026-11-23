# Quickstart: validar la navegación a pantallas sin pestaña

Guía para comprobar la spec 024. No contiene código de implementación; la declaración está en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
```

| Qué comprueba | Cómo |
|---|---|
| Cada pantalla sin pestaña se abre (SC-002, SC-003) | `src/features/shell/__tests__/hiddenScreens.test.tsx` navega a cada una con el router real; con el código anterior (`href: null`) falla nombrando la pantalla |
| La barra no cambia (SC-004) | la misma prueba cuenta las pestañas de cada rol y comprueba que ninguna pantalla oculta aparece |
| La campana abre la bandeja y "atrás" vuelve (SC-001, FR-002) | la misma prueba, desde el inicio y desde otra pestaña |
| Ninguna pantalla nueva queda sin declarar | la misma prueba revisa que cada ruta de nivel superior de `app/(rol)` esté en `tabs` o en `hidden` |
| Nada se rompió (SC-005) | el resto de la suite, la guarda de accesibilidad global incluida |

Para ver la prueba fallar: volver temporalmente a `href: null` en `RoleTabs` y correrla.

## Recorrido manual (dispositivo o emulador)

Con los tres roles (`cae@correo.uts.edu.co`, un docente y un estudiante):

1. Tocar la campana desde el inicio: se abre la bandeja, no el inicio.
2. Tocar la campana desde otra pestaña (módulos, cronograma, mensajes o PQRS): se abre la bandeja; con el botón atrás de Android se regresa a esa pestaña.
3. Como CAE, tocar "Ver todos" en el bloque de cambios del dashboard: se abre la lista; atrás regresa al dashboard.
4. La barra inferior conserva sus pestañas, con el mismo ancho y sin huecos ni pestañas nuevas, también con letra grande y en modo oscuro.
5. Con un lector de pantalla (TalkBack o VoiceOver): la barra no anuncia una pestaña vacía.
6. En iOS, comprobar que se puede salir de la bandeja con la barra inferior (no hay botón atrás).
