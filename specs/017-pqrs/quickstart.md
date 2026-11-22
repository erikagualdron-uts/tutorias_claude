# Quickstart: PQRS: radicación y gestión

Guía para comprobar la funcionalidad de punta a punta. Contrato en [contracts/pqrs-api.yaml](contracts/pqrs-api.yaml); tablas en [data-model.md](data-model.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d
npx prisma migrate deploy       # aplica add_pqrs (migrate dev pide resetear: una migración antigua cambió)
npx prisma db seed              # deja un docente y un estudiante de ejemplo; los tipos de PQRS ya vienen de la migración
cd ../tutorias_uts_back && npm run start:dev
cd ../tutorias_uts_mobile && npx expo start
```

Mailpit recibe los correos de aviso en `http://localhost:8025`.

## Escenarios

| # | Pasos | Resultado esperado |
|---|---|---|
| 1 | Estudiante: PQRS → Nueva → tipo, asunto y descripción → Radicar | Queda "Radicada" en su lista; el docente no la ve |
| 2 | Estudiante: dejar el asunto vacío → Radicar | La app señala el campo y no crea nada |
| 3 | Estudiante: tocar "Radicar" dos veces seguidas | Una sola PQRS (misma `clientRequestId`) |
| 4 | Docente: radicar una PQRS | Aparece en su lista y en la del CAE con rol "Docente" |
| 5 | CAE: filtrar por estado, tipo y rol del autor, solos y combinados | La lista cumple todos los filtros activos |
| 6 | CAE: abrir una "Radicada" → intentar responder o resolver | Bloqueado, con el mensaje "primero pásala a En revisión" |
| 7 | CAE: pasar a "En revisión" | Estado cambia; el autor recibe aviso en bandeja, push y correo, en su idioma |
| 8 | CAE: marcar "Resuelta" sin respuestas | Bloqueado, con el mensaje "primero responde" |
| 9 | CAE: responder y luego resolver | Dos avisos al autor; la PQRS queda "Resuelta" y no admite más respuestas |
| 10 | Estudiante: tocar el aviso de la bandeja | Abre esa PQRS con la respuesta |
| 11 | Cambiar el dispositivo del autor a inglés y repetir 7 | Aviso y correo en inglés |
| 12 | Estudiante: pedir `GET /pqrs/mine/<id de otra persona>` | `404 PQRS_NOT_FOUND` |
| 13 | Estudiante: llamar `POST /pqrs/<id>/review` | `403` |
| 14 | CAE: llamar `POST /pqrs` | `403` |
| 15 | CAE: intentar eliminar el tipo de una PQRS existente en Configuración | Bloqueado con la regla; desactivarlo funciona y la PQRS conserva su tipo |
| 16 | Rechazar el permiso de push y repetir 7 | El aviso igual llega a la bandeja |

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
python .claude/skills/i18n-strings/scripts/check_i18n.py ../tutorias_uts_mobile/src/i18n/es.json ../tutorias_uts_mobile/src/i18n/en.json   # paridad es/en, desde Claude/
```

Los e2e (`test/pqrs.e2e-spec.ts`) necesitan la base de datos de prueba; deben cubrir los escenarios 3 y 6 a 9 y 12 a 15.

## Medición manual

SC-001 (radicar en menos de 2 minutos) y SC-004 (encontrar una PQRS con filtros en menos de 30 segundos con 200 PQRS) se miden a mano en la app y se anotan en la tarea de pruebas manuales.
