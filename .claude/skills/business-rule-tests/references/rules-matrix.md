# Matriz de casos mínimos

Los `code` son sugeridos; alinéalos con los definidos en la spec de la funcionalidad.

## Cupo
| Caso | Esperado |
|---|---|
| Inscribir con cupo disponible | OK |
| Inscribir con el módulo lleno | 409 `ENROLLMENT_MODULE_FULL` |
| N inscripciones simultáneas con M cupos (N > M) | Exactamente M exitosas; nunca más de M activas |
| Reinscribir tras cancelar, con cupo | OK |
| Reinscribir tras cancelar, sin cupo | 409 `ENROLLMENT_MODULE_FULL` |
| Inscribirse dos veces al mismo módulo | 409 `ENROLLMENT_ALREADY_ACTIVE` |

## Cruces de horario
| Caso | Esperado |
|---|---|
| Estudiante: mismo día, horas que se solapan | 409 `ENROLLMENT_SCHEDULE_CONFLICT` |
| Estudiante: horas adyacentes (10-12 y 12-14) | OK |
| Estudiante: mismo horario en otro día | OK |
| Estudiante: mismo horario en otro periodo | OK |
| Crear módulo con salón ocupado en ese horario | 409 `ROOM_SCHEDULE_CONFLICT` |
| Crear módulo con docente ocupado en ese horario | 409 `TEACHER_SCHEDULE_CONFLICT` |
| Reprogramar sesión a un horario ocupado (salón o docente) | 409 con el code correspondiente |

## Ventanas de cancelación (reloj controlado)
| Caso | Esperado |
|---|---|
| Estudiante cancela con más de 1 hora de anticipación | OK |
| Estudiante cancela con menos de 1 hora | 409 `ENROLLMENT_CANCEL_WINDOW_CLOSED` |
| Docente cambia hora o cancela con más de 2 horas | OK |
| Docente cambia hora o cancela con menos de 2 horas | 409 `SESSION_CHANGE_WINDOW_CLOSED` |
| Límite exacto (1 h / 2 h) | Confirmar con la spec |
| Cambiar los valores de configuración | Las reglas usan el nuevo valor |

## Cambio de salón
| Caso | Esperado |
|---|---|
| Nueva capacidad mayor o igual a los inscritos | OK |
| Nueva capacidad menor que los inscritos | 409 `ROOM_CAPACITY_INSUFFICIENT` |
| Nuevo salón ocupado en ese horario | 409 `ROOM_SCHEDULE_CONFLICT` |
| Cambio exitoso | Notificación a cada inscrito |

## Cuentas y correo
| Caso | Esperado |
|---|---|
| Registro de estudiante con `@uts.edu.co` | OK (con verificación de correo) |
| Registro de estudiante con otro dominio | 422 `AUTH_EMAIL_DOMAIN_NOT_ALLOWED` |
| Crear docente con `@correo.uts.edu.co` | OK, con clave temporal y `mustChangePassword` |
| Crear docente con `@uts.edu.co` u otro dominio | 422 `AUTH_EMAIL_DOMAIN_NOT_ALLOWED` |
| Login con cuenta desactivada o borrada | 403 `AUTH_ACCOUNT_DISABLED` |
| Refrescar token con cuenta desactivada | 403 `AUTH_ACCOUNT_DISABLED` |
| Docente con `mustChangePassword` accede a otro endpoint | 403 hasta cambiar la clave |

## Sesiones recurrentes
| Caso | Esperado |
|---|---|
| Crear módulo genera una sesión por semana del periodo | Cantidad exacta según fechas |
| Cancelar una sesión | Solo esa sesión cambia; las demás siguen |
| Reprogramar una sesión | `originalStartsAt` se conserva |
| Horas locales a UTC | Correctas en `America/Bogota` |

## Retención
| Caso | Esperado |
|---|---|
| Mensaje de módulo con más de 6 meses | Eliminado por el job |
| Mensaje de módulo con menos de 6 meses | Se conserva |
| Chat individual con más de 2 años | Eliminado por el job |
| Chat individual con menos de 2 años | Se conserva |

## Roles
| Caso | Esperado |
|---|---|
| Cada endpoint sensible con un rol sin permiso | 403 |
| Estudiante intenta crear módulo | 403 |
| Docente intenta ver PQRS de otros | 403 |
