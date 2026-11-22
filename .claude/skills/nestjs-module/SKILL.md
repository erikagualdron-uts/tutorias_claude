---
name: nestjs-module
description: "Crea o modifica un módulo de negocio del backend NestJS (controller, service, DTOs, guards de roles, errores con code y pruebas). Úsala siempre que se pida un endpoint, servicio, módulo o regla de negocio nueva en backend/, aunque el usuario no mencione NestJS."
---

# Módulo NestJS

Antes de escribir código lee, en este orden:
1. `docs/Conventions.md` secciones 3, 4 y 6 (estilo, backend, pruebas).
2. `docs/Architecture.md` secciones 5 y 6 (modelo de datos y reglas críticas).
3. La `spec.md` y el `plan.md` de la funcionalidad actual en `specs/`.

No copies reglas de negocio de memoria: las reglas están en `docs/Context.md` sección 7.

## Pasos
1. Crear o ubicar `backend/src/<module>/` con la estructura de Conventions.md (module, controller, service, `dto/`, pruebas).
2. **Controlador:** solo valida la entrada con DTOs y delega al servicio. Sin lógica de negocio.
3. **Guards:** cada endpoint declara `@Roles(...)`. Un endpoint sin guard es un error.
4. **Servicio:** aquí viven las reglas. Si hay riesgo de concurrencia (cupo, cruces), usar transacción con bloqueo de fila (ver skill `prisma-migration`).
5. **Errores:** cada regla violada lanza un error con `code` en `UPPER_SNAKE_CASE`, con el formato de Conventions.md sección 4. Nunca mensajes sueltos.
6. **Consultas:** siempre filtrar `deletedAt: null`. Nunca devolver `passwordHash` ni datos sensibles.
7. **Valores configurables** (ventanas de 1 y 2 horas, dominios de correo): leerlos de configuración, no escribirlos en el código.
8. **Notificaciones:** si la regla afecta a los inscritos (cambio o cancelación), encolar la notificación (push, correo, en la app); no enviarla dentro de la petición.
9. Documentar con decoradores de Swagger.
10. Escribir pruebas del servicio. Para las reglas críticas usar la skill `business-rule-tests`.

## Al terminar
- Lint, tipos y pruebas pasan.
- Si cambió el modelo de datos o una regla, actualizar el archivo de `docs/` afectado.
- Pasar la skill `feature-done-check` antes de unir la rama.
