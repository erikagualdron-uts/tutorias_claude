---
name: prisma-migration
description: "Crea o modifica modelos Prisma, migraciones de PostgreSQL y el seed de desarrollo, con borrado lógico, UUID y transacciones seguras. Úsala siempre que se pida una tabla, entidad, campo, índice, migración o dato de ejemplo nuevo, o cuando una regla requiera bloquear filas para evitar sobrecupo."
---

# Prisma y migraciones

Lee `docs/Architecture.md` sección 5 (modelo de datos, incluido `AcademicPeriod`, `ModuleSchedule` y `ModuleSession`) y `docs/Conventions.md` sección 4 (Base de datos).

## Modelos
- Modelo en `PascalCase` singular (`Module`); tabla con `@@map("modules")`; columnas con `@map("snake_case")`.
- Toda tabla: `id` UUID, `createdAt`, `updatedAt`. Entidades con borrado lógico: `deletedAt DateTime?`.
- Fechas siempre en UTC. Los horarios semanales (`ModuleSchedule`) guardan hora local de `America/Bogota` como `dayOfWeek` + `startTime` + `endTime`; las sesiones (`ModuleSession`) guardan instantes en UTC.
- Enums para estados (`EnrollmentStatus`, `SessionStatus`, `PqrsStatus`).
- Índices en columnas de búsqueda frecuente y restricciones únicas donde la regla lo exige (por ejemplo, una inscripción activa por estudiante y módulo).

## Migraciones
1. Editar `schema.prisma`.
2. `npx prisma migrate dev --name <descripcion_en_snake_case>` (ej. `add_module_schedule_table`).
3. **Nunca editar una migración ya aplicada**: crear una nueva.
4. Revisar el SQL generado antes de continuar; si borra datos o columnas, detenerse y avisar.
5. Actualizar el seed (`prisma/seed.ts`): periodo activo, un SUPERADMIN, salones y datos de ejemplo. No poner contraseñas reales.
6. Actualizar la tabla del modelo de datos en `docs/Architecture.md` en el mismo cambio.

## Transacciones y concurrencia
Para inscribir (cupo) y para mover o crear sesiones (cruces):
- Usar `prisma.$transaction`.
- Bloquear la fila del módulo con `SELECT ... FOR UPDATE` mediante `$queryRaw` antes de contar inscripciones.
- Contar inscripciones **activas** dentro de la misma transacción y comparar con `Room.capacidad`.
- Nunca validar el cupo fuera de la transacción.

## Prohibido
- Borrado físico (salvo los jobs de retención de chats).
- Consultas sin filtrar `deletedAt: null`.
- SQL con concatenación de strings; siempre parámetros.
