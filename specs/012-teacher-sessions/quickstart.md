# Quickstart: Cronograma del docente: reprogramar y cancelar sesiones

Guía para comprobar la funcionalidad de punta a punta. Contrato: [contracts/teacher-sessions-api.yaml](contracts/teacher-sessions-api.yaml). Modelo: [data-model.md](data-model.md).

## Prerrequisitos

- PostgreSQL y Redis locales: `cd tutorias_uts_db && docker compose up -d`.
- Migración y seed: `cd tutorias_uts_db && npx prisma migrate deploy && npx prisma db seed`. El seed deja un periodo Activo, un docente (`docente.ejemplo@correo.uts.edu.co`), el módulo "Cálculo I (ejemplo)" con sus sesiones y un estudiante inscrito.
- Backend: `cd tutorias_uts_back && npm run start:dev`. Variable nueva: `TEACHER_CHANGE_LEAD_MINUTES` (por defecto `120`, ya en `.env.example`).
- App: `cd tutorias_uts_mobile && npx expo start -c` (la `-c` es obligatoria si se añadieron íconos al registro).
- Cuentas: el docente de ejemplo (clave del seed; pide cambiarla), el CAE, el estudiante de ejemplo y un segundo docente. Para los cruces se necesitan un segundo módulo en otro salón y un segundo módulo del mismo docente.

## Verificaciones automáticas

```bash
cd tutorias_uts_back && npm run test && npm run test:e2e && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
```

Deben pasar, entre otras: ventana de 119, 120 y 121 minutos, cruces de salón, docente y estudiantes, alcance de una sesión y de la serie, festivos y semana, eventos (uno por acción y ninguno al rechazar), concurrencia, roles y contrato.

## Recorrido manual (docente)

1. **Cronograma** (SC-001): iniciar sesión como docente → pestaña Cronograma. Se ven sus módulos con salón, horario e inscritos y sus próximas sesiones. Otro docente no ve las suyas.
2. **Reprogramar una sesión**: elegir una a más de 2 horas → Reprogramar → "Solo esta sesión" → otro día de la misma semana. Al elegir la hora se consulta la disponibilidad; se confirma. La sesión queda "Reprogramada" con su hora original.
3. **Reprogramar la serie**: lo mismo con "Esta y las futuras": todas las de ese horario se mueven lo mismo; las de otro horario del módulo no.
4. **Bloqueos**: una sesión a menos de 2 horas tiene las acciones bloqueadas con la regla visible; una hora en que el salón o el docente ya está ocupado se rechaza nombrando el módulo; un festivo, otra semana o fuera de 6:00 a 18:00 se rechazan con su motivo.
5. **Cruce con estudiantes**: con un estudiante inscrito que ya tiene otra tutoría a esa hora, el rechazo dice cuántos estudiantes chocan, sin nombres.
6. **Cancelar y reactivar**: cancelar una sesión (queda "Cancelada por el docente"), reactivarla a más de 2 horas; una cancelada por festivo no ofrece reactivar.
7. **Estudiante y CAE**: el estudiante inscrito ve la nueva hora o "Cancelada por el docente" en el detalle del módulo y en "Mis tutorías"; el CAE lo ve en la lista de sesiones del módulo.
8. **Periodo Cerrado**: el CAE cierra el periodo; el docente ve sus módulos en solo lectura, sin acciones.
9. **Eventos**: en la base de datos, `outbox_events` tiene un registro por acción aceptada y ninguno por las rechazadas (`select type, payload from outbox_events order by created_at desc`).
10. **Roles**: con un token de estudiante o de CAE, llamar a los endpoints de `/teacher`: todos responden `403`; sin token, `401`. Una sesión de otro docente responde `404`.
11. **Idioma y accesibilidad**: repetir en español e inglés; modo oscuro, fuente grande y "reducir movimiento" sin cortes.

## Criterios de salida

- Las verificaciones automáticas pasan en los tres repositorios.
- Los recorridos 1 a 11 se cumplen y se anotan aquí con fecha.
- `docs/` y `Decisions.md` reflejan lo implementado (Definición de terminado de `docs/Conventions.md`).
- Nota de publicación (D-087): no se publica en producción sin la spec 013 o un consumidor del outbox; anotarlo en el PR.

## Resultados

_(Se completa al cerrar la funcionalidad.)_
