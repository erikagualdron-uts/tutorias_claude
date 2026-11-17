# Quickstart: Inscripción de estudiantes a módulos

Guía para comprobar la funcionalidad de punta a punta. Contrato: [contracts/enrollments-api.yaml](contracts/enrollments-api.yaml). Modelo: [data-model.md](data-model.md).

## Prerrequisitos

- PostgreSQL y Redis locales: `cd tutorias_uts_db && docker compose up -d`.
- Migración y seed: `cd tutorias_uts_db && npx prisma migrate deploy && npx prisma db seed`. El seed deja un periodo Activo, un docente, un módulo de ejemplo con sesiones y un estudiante de ejemplo. (Si `migrate dev` pide un reset por la migración 006 editada, usar `migrate deploy`.)
- Backend: `cd tutorias_uts_back && npm run start:dev`. Variable nueva: `STUDENT_CANCEL_LEAD_MINUTES` (por defecto `60`, ya en `.env.example`).
- App: `cd tutorias_uts_mobile && npx expo start -c`. Si se añadieron íconos al registro, usar `-c` para limpiar la caché.
- Cuentas: un estudiante (`@uts.edu.co`) y el CAE (SUPERADMIN). Para el recorrido de cupo se necesitan 3 estudiantes y un módulo en un salón de capacidad 2 (se crean con el CAE).

## Verificaciones automáticas

```bash
cd tutorias_uts_back && npm run test && npm run test:e2e && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
```

Deben pasar, entre otras: concurrencia con 20 estudiantes sobre un módulo de cupo 5 (SC-002), cruces de horario (SC-003), ventana de cancelación a 59, 60 y 61 minutos (SC-005), roles (SC-007), respuestas contra el contrato, paridad de i18n es/en y el cambio de salón de la spec 010 con inscritos reales.

## Recorrido manual (estudiante)

1. **Oferta** (SC-001, menos de 1 minuto): iniciar sesión como estudiante → pestaña Tutorías → "Disponibles". Se ven tarjetas del periodo Activo con docente, salón, horario y `libres/capacidad`. Buscar por nombre. Los módulos de periodos Próximos o Cerrados no aparecen.
2. **Inscribirse**: abrir un módulo e inscribirse. La tarjeta pasa a "Inscrito", los cupos bajan en uno y el módulo aparece en "Mis tutorías" con su próxima sesión.
3. **Lleno**: con el salón de capacidad 2, inscribir a dos estudiantes; el tercero ve "Lleno", el botón deshabilitado y el motivo.
4. **Cruce** (SC-003): inscribirse a otro módulo que se solape con el primero: se rechaza mostrando el módulo y el horario con el que choca. Uno que termina cuando empieza el otro se permite.
5. **Cancelar una sesión** (SC-004, menos de 30 s): en "Mis tutorías" → módulo → una sesión a más de 1 hora → "Solo esta sesión". Sigue inscrito en las demás. Después **reactivarla**: se permite si hay lugar.
6. **Fuera de plazo** (SC-005): una sesión a menos de 1 hora (se prepara con la hora del sistema o una sesión del seed) tiene la cancelación bloqueada y muestra la regla.
7. **Cancelar el módulo**: "Todo el módulo" libera el cupo; la sesión que empieza en menos de 1 hora, si la hay, se mantiene. Volver a inscribirse funciona si hay cupo; con el módulo lleno, se bloquea con el aviso.
8. **Periodo Cerrado**: el CAE cierra el periodo; sus inscripciones se ven en solo lectura, sin acciones, con el motivo.
9. **CAE con inscritos reales**: el listado y el detalle de módulos muestran los inscritos. Cambiar el salón a uno con capacidad menor que los inscritos se bloquea; editar horarios y eliminar el módulo también. Con todos los inscritos cancelados, se permiten.
10. **Cuenta desactivada**: el CAE desactiva a un estudiante inscrito; su lugar queda libre en el módulo y su inscripción se conserva en el historial.
11. **Roles** (SC-007): con un token de docente o de CAE, llamar a los endpoints de `/student`: todos responden `403`; sin token, `401`. Un estudiante que pide la inscripción de otro recibe `404`.
12. **Idioma y accesibilidad** (SC-008, SC-009): repetir en español e inglés; modo oscuro, fuente grande y "reducir movimiento" sin cortes; las reglas de bloqueo se entienden sin ayuda.

## Criterios de salida

- Las verificaciones automáticas pasan en los tres repositorios.
- Los recorridos 1 a 12 se cumplen y se anotan aquí con fecha.
- `docs/` y `Decisions.md` reflejan lo implementado (Definición de terminado de `docs/Conventions.md`).
- Nota de publicación (D-087): la inscripción no se publica en producción sin la spec 013 o sin un consumidor del outbox; anotarlo en el PR.

## Resultados

_(Se completa al cerrar la funcionalidad.)_
