# Data Model: Avisos por correo para docentes y CAE

**Sin tablas, columnas, enums ni migraciones, y sin cambios en la API.** Solo cambia la decisión de a quién se envía el correo de un aviso.

## Configuración que se lee (ya existe)

| Llave (`settings`) | Valor por defecto | Quién la usa |
|---|---|---|
| `auth.studentEmailDomain` | `uts.edu.co` | Registro de estudiantes y, con esta spec, el envío de avisos |
| `auth.staffEmailDomain` | `correo.uts.edu.co` | Creación de docentes y, con esta spec, el envío de avisos |

## Regla de la entrega por correo

Para una entrega de correo `PENDING`:

| Condición del destinatario | Resultado |
|---|---|
| Cuenta desactivada o eliminada | `SKIPPED` con `ACCOUNT_UNAVAILABLE` (sin cambios) |
| Dirección vacía, o fuera de los dos dominios | `SKIPPED` con `EMAIL_DOMAIN_NOT_ALLOWED` |
| Dirección del dominio de estudiantes **o** del personal | Se continúa: SMTP sin configurar deja la entrega pendiente; con SMTP, se envía y queda `SENT` (o se reintenta y puede quedar `FAILED`) |

La comparación es exacta sobre el dominio completo, sin distinguir mayúsculas ni espacios; `otra.correo.uts.edu.co` y `correo.uts.edu.co.example.com` no coinciden.
