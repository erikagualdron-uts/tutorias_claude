# Data Model: Editar mi nombre

## Entidad nueva: `StudentNameChange` (tabla `student_name_changes`)

Constancia interna de cada cambio de nombre. Solo se inserta.

| Campo | Tipo | Regla |
|---|---|---|
| `id` | UUID | PK, generado |
| `userId` | UUID | FK a `users`; la persona que cambió su nombre |
| `previousFirstName` | texto | nombre anterior |
| `previousLastName` | texto | apellido anterior |
| `newFirstName` | texto | nombre nuevo, ya recortado |
| `newLastName` | texto | apellido nuevo, ya recortado |
| `createdAt` | timestamptz (UTC) | por defecto `now()`; se mostraría en `America/Bogota` si algún día se consulta |

- Índice por `userId` y `createdAt` (para que el CAE pueda investigar un caso).
- Sin `updatedAt` ni `deletedAt`: el registro no se edita ni se borra.
- Una fila por cambio efectivo; si no cambió nada, no hay fila.
- Se escribe en la misma transacción que la actualización de `StudentProfile`.

## Entidades existentes (sin cambio de esquema)

| Entidad | Uso |
|---|---|
| `StudentProfile` | `firstName` y `lastName` se actualizan |
| `User` | Se lee `status` y `deletedAt` para rechazar cuentas no disponibles |

## Estados de la pantalla (app)

| Estado | Comportamiento |
|---|---|
| Inicial | Campos con el nombre actual; si se guarda sin cambios, vuelve a «Mi cuenta» sin enviar nada |
| Enviando | Botón con indicador, campos no editables |
| Error de campo | Mensaje bajo el campo, sin perder lo escrito |
| Error de red o servidor | Mensaje con reintento, sin perder lo escrito |
| Éxito | Confirmación y regreso a «Mi cuenta» con el nombre nuevo |
