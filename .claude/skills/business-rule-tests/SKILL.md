---
name: business-rule-tests
description: "Escribe pruebas automatizadas de las reglas de negocio críticas (cupo y sobrecupo concurrente, cruces de horario, ventanas de cancelación de 1 y 2 horas, cambio de salón, dominios de correo, roles, retención de chats). Úsala siempre que se implemente o cambie una de esas reglas, o cuando se pidan pruebas del backend."
---

# Pruebas de reglas de negocio

La constitución del proyecto exige pruebas para estas reglas **antes** de darlas por terminadas.

Lee `references/rules-matrix.md`: contiene los casos mínimos de cada regla con el `code` de error esperado. Las reglas completas están en `docs/Context.md` sección 7.

## Cómo escribirlas
1. Una prueba por caso de la matriz; el nombre describe el caso (`rejects enrollment when module is full`).
2. Probar el **servicio**; para reglas con base de datos usar PostgreSQL de prueba, no mocks de Prisma.
3. Verificar el `code` del error, no el texto del mensaje.
4. **Tiempo:** inyectar un reloj controlable (fake timers o un `ClockService`); nunca depender de la hora real. Probar siempre los límites: justo antes, exacto y justo después de la ventana. Si la spec no dice si el límite exacto está permitido, **preguntar** antes de fijarlo.
5. **Concurrencia (cupo):** lanzar N inscripciones simultáneas con `Promise.allSettled` sobre un módulo con M cupos y verificar que exactamente M tienen éxito y que el total de inscripciones activas nunca supera M.
6. **Roles:** para cada endpoint sensible, una prueba con un rol sin permiso que espere `403`.
7. **Notificaciones:** al cancelar o reprogramar, verificar que se crea una notificación por cada estudiante inscrito (cantidad exacta).
8. Cada prueba prepara sus propios datos y limpia después; las pruebas no dependen del orden.

## Al terminar
- Todas las pruebas pasan varias veces seguidas (las de concurrencia no deben ser intermitentes).
- Si apareció un caso que la matriz no cubre, agregarlo a `references/rules-matrix.md`.
