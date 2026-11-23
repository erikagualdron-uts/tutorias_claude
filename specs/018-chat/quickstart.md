# Quickstart: Chat y anuncios

Guía para comprobar la funcionalidad de punta a punta. Contratos en [chat-api.yaml](contracts/chat-api.yaml) y [chat-socket.md](contracts/chat-socket.md); tablas en [data-model.md](data-model.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d
npx prisma migrate deploy       # aplica add_chat (migrate dev pide resetear: una migración antigua cambió)
npx prisma db seed              # docente y estudiante de ejemplo inscrito en un módulo
cd ../tutorias_uts_back && npm install && npm run start:dev
cd ../tutorias_uts_mobile && npm install && npx expo start
```

Hacen falta dos sesiones a la vez (dos teléfonos o un teléfono y un emulador) para ver la entrega en vivo.

## Escenarios

| # | Pasos | Resultado esperado |
|---|---|---|
| 1 | Estudiante inscrito: Mensajes → Chats → Nuevo mensaje | Solo ve a los docentes de sus módulos |
| 2 | Estudiante escribe al docente | Se crea la conversación; el docente la ve con el mensaje y el contador en 1 |
| 3 | Estudiante vuelve a elegir al mismo docente | Abre la misma conversación (no hay otra) |
| 4 | Docente responde con la conversación abierta en los dos | Llega a los 2 s sin recargar |
| 5 | CAE: Nuevo mensaje | Solo ve a los docentes; escribe a uno y el docente le responde |
| 6 | Pedir por la API una conversación de otro usuario | `404 CHAT_NOT_FOUND` |
| 7 | Estudiante intenta escribir a otro estudiante o al CAE por la API | `403 CHAT_PARTNER_NOT_ALLOWED` |
| 8 | Docente abre la lista con mensajes sin leer y entra a una | Su contador queda en 0, los demás no cambian; el total baja en lo mismo |
| 9 | Apagar los datos del teléfono del estudiante y escribir | "Reconectando…" y el mensaje en "enviando"; al volver, sale una sola vez |
| 10 | Destinatario con la app cerrada y el dispositivo registrado | Push con el nombre y el texto; al tocarlo abre la conversación |
| 11 | Enviar tres mensajes seguidos a un destinatario ausente | Un solo push |
| 12 | Docente publica un anuncio en el chat de su módulo | Los inscritos lo ven como tarjeta "Anuncio" con su nombre y reciben push |
| 13 | Un inscrito escribe un mensaje normal en el módulo | Los demás lo ven con el contador y no reciben push |
| 14 | Un estudiante se da de baja del módulo | Deja de ver el chat y sus mensajes nuevos; la conversación individual con el docente queda de solo lectura con la regla visible |
| 15 | CAE desactiva la cuenta de un docente (spec 016) | Nadie puede escribirle ni él a nadie; el historial se conserva |
| 16 | Periodo cerrado | El chat del módulo es de solo lectura |
| 17 | Correr la tarea de retención con mensajes de 7 meses (módulo) y 3 años (individual) | Desaparecen; uno individual de 8 meses se conserva |
| 18 | Abrir la app en dos dispositivos del mismo usuario | El contador coincide en los dos |

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run lint
npx vitest run --config ./vitest.config.e2e.ts chat      # necesita la base de datos de prueba
cd ../tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
python .claude/skills/i18n-strings/scripts/check_i18n.py ../tutorias_uts_mobile/src/i18n/es.json ../tutorias_uts_mobile/src/i18n/en.json   # desde Claude/
```

Los e2e (`test/chat-*.e2e-spec.ts`) cubren los escenarios 1 a 8, 10 a 17 y los permisos de cada ruta; el 9 y el 18 se comprueban con el socket simulado en la app y con dos conexiones `socket.io-client` en el backend.

## Medición manual

SC-001 (menos de 2 s) y SC-002 (iniciar y enviar en menos de 1 minuto) se miden a mano con dos dispositivos y se anotan en la tarea de pruebas manuales.
