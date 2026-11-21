# Quickstart: Gestión de cuentas de docentes y estudiantes

Guía para comprobar la feature de punta a punta. Contrato en [contracts/accounts-api.yaml](contracts/accounts-api.yaml) y datos en [data-model.md](data-model.md).

## Prerrequisitos

- `cd tutorias_uts_db && docker compose up -d` (PostgreSQL, Redis y Mailpit) y `npx prisma migrate dev` para aplicar la extensión `unaccent`.
- `cd tutorias_uts_back && npm run start:dev`.
- `cd tutorias_uts_mobile && npx expo start`, con la sesión abierta como CAE.
- Datos: un periodo activo con dos módulos con cupo, un docente con esos dos módulos, y dos estudiantes verificados, uno inscrito a ambos módulos, además de un estudiante que no verificó su correo.

## Escenarios

| # | Pasos | Resultado esperado |
|---|---|---|
| 1 | Más → Docentes. | Lista por apellido con nombre, correo, estado y "2 módulos". |
| 2 | Escribir `jose` y luego `josé` en la búsqueda; probar con un correo parcial. | Ambas escrituras encuentran a José; el correo parcial también. |
| 3 | Filtrar por "Desactivadas". | Solo cuentas desactivadas; sin ninguna, el estado vacío lo explica. |
| 4 | Más → Estudiantes. | Los verificados con "N módulos"; el que no verificó el correo no aparece. |
| 5 | Abrir un docente → Desactivar. | La hoja dice "2 módulos quedarán con docente no disponible" y pide confirmar. Al confirmar queda "Desactivada". |
| 6 | Con la sesión del docente abierta en otro dispositivo, tocar cualquier pantalla. | Lo lleva al inicio de sesión; al entrar ve que su cuenta está desactivada. |
| 7 | Abrir un módulo del docente desactivado. | Marcado "docente no disponible". Reactivar al docente: vuelve a entrar con su historial. |
| 8 | Abrir el estudiante inscrito a dos módulos → Desactivar. | "2 inscripciones se cancelarán y se liberarán 2 cupos"; al confirmar, quedan canceladas y el cupo libre sube en cada módulo. |
| 9 | Reactivar a ese estudiante. | Entra de nuevo, pero sus inscripciones no se restauran; se inscribe de nuevo si hay cupo. |
| 10 | Eliminar a un estudiante con inscripciones. | Deja de aparecer en la lista, no entra; intentar registrarse con su correo da "correo ya registrado". |
| 11 | Editar un docente: borrar el nombre y guardar; luego corregir el apellido. | El vacío marca el campo y no guarda; el cambio válido se ve en la lista y en sus módulos. El correo aparece sin poder editarse y con la razón. |
| 12 | Docente → Regenerar clave temporal. | Se muestra una sola vez con la advertencia; la anterior deja de servir; al entrar debe cambiarla. En una cuenta desactivada la opción queda deshabilitada con la razón debajo ("Reactiva la cuenta para generar una clave"). |
| 13 | Iniciar sesión como docente y como estudiante y llamar a `GET /teachers` y `GET /students`. | `403` en ambos. |
| 14 | Provocar un aviso para un estudiante y desactivarlo antes de que se entregue el correo (parar el worker). | La entrega queda `SKIPPED` con causa `ACCOUNT_UNAVAILABLE` y no sale ningún correo. |

## Pruebas automáticas

- `cd tutorias_uts_back && npm run lint && npm test`: unitarias del cambio de estado y de la búsqueda.
- `npm run test:e2e` (con PostgreSQL y Redis del `docker compose`, sin la API de desarrollo en marcha): roles, listas y búsqueda con tildes, desactivar, reactivar y eliminar, inscripciones canceladas y cupo libre, carrera de inscribirse contra la baja, entrega omitida y contrato.
- `cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test`: pantallas, hoja de acciones, confirmación con efecto y paridad de textos es/en.

## Cierre

Al terminar, correr `feature-done-check` sobre la 016.
