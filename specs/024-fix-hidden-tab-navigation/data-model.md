# Data Model: Corregir la navegación a las pantallas sin pestaña

**Sin tablas, columnas, enums ni migraciones, y sin cambios en la API.** Esta spec solo toca la navegación de la app.

## Declaración de pestañas por rol (en el código de la app)

Vive en `tutorias_uts_mobile/src/features/shell/roleTabs.config.ts`.

| Campo | Qué es |
|---|---|
| `tabs` | Las pestañas de la barra inferior de un rol: `name` (archivo de ruta), `titleKey` e `icon`, como hoy |
| `hidden` | Las pantallas del rol sin pestaña: `name` y `titleKey` (para el encabezado) |

| Rol | `tabs` (sin cambios) | `hidden` |
|---|---|---|
| Estudiante | inicio, módulos, cronograma, mensajes, PQRS | `notifications` |
| Docente | las que declara hoy su layout | `notifications` |
| CAE | panel, módulos, mensajes, PQRS, más | `notifications`, `changes` |

**Regla**: toda ruta de nivel superior de `app/(rol)` (archivo o carpeta, salvo `_layout`) debe estar en `tabs` o en `hidden`; la prueba de la spec lo comprueba.
