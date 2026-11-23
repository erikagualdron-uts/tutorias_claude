# Quickstart: validar el pulido del chat

Guía para comprobar la spec 022 de punta a punta. No contiene código de implementación; los datos están en [data-model.md](data-model.md) y el evento nuevo en [contracts/chat-typing.md](contracts/chat-typing.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d
cd ../tutorias_uts_back && npm run start:dev
cd ../tutorias_uts_mobile && npx expo install @react-native-async-storage/async-storage && npx expo start
```

Datos de partida: un docente y dos estudiantes (uno inscrito en su módulo), un chat directo entre el docente y el estudiante y el chat de su módulo. Hacen falta dos dispositivos o un dispositivo y un emulador para los escenarios de escritura.

## Escenarios

| # | Hacer | Resultado esperado |
|---|---|---|
| 1 | En modo avión, escribir un mensaje en un chat y cerrar la app por completo | Al reabrirla, el mensaje sigue en la conversación con el estado "enviando" |
| 2 | Quitar el modo avión | El mensaje sale una sola vez, pasa a "enviado" y la otra persona lo recibe |
| 3 | Repetir 1 y 2 con dos mensajes en dos conversaciones | Salen en el orden en que se escribieron, cada uno en su conversación |
| 4 | Dejar un mensaje que el servidor rechace (desactivar la cuenta de la otra persona) y reabrir | Sigue "falló" con su motivo y "Toca para reintentar"; no se reenvía solo |
| 5 | Tocar "Descartar" en un mensaje "enviando" o "falló" | Desaparece de la conversación y no sale nunca, ni al reabrir la app |
| 6 | Dejar un mensaje pendiente, cerrar sesión y entrar con otra cuenta | La otra cuenta no ve ni envía ese mensaje; al volver a la primera tampoco aparece |
| 7 | Abrir la lista de conversaciones | Avatares con iniciales ("AS" para Ana Soto, "L" para un solo nombre) y el ícono de grupo en el chat de módulo |
| 8 | Abrir un chat directo | El encabezado muestra el mismo avatar con iniciales que la lista |
| 9 | Con un lector de pantalla, pasar por un avatar | No lee las letras; lee el nombre que está al lado |
| 10 | La otra persona escribe en el chat directo que tienes abierto | En menos de 2 s ves tres puntos y "está escribiendo…" |
| 11 | La otra persona deja de escribir | El indicador desaparece en menos de 6 s |
| 12 | La otra persona envía el mensaje | El indicador desaparece y aparece el mensaje |
| 13 | Alguien escribe en el chat de un módulo | Nadie ve ningún indicador |
| 14 | Tener la lista de conversaciones abierta (no el chat) mientras la otra persona escribe | No llega nada |
| 15 | Activar "reducir movimiento" y repetir 10 | Los puntos están quietos y el texto "está escribiendo…" se ve |
| 16 | Poner el dispositivo en español y en inglés y repetir 1, 5, 7 y 10 | Todos los textos en el idioma del dispositivo |

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
python .claude/skills/i18n-strings/scripts/check_i18n.py ../tutorias_uts_mobile/src/i18n/es.json ../tutorias_uts_mobile/src/i18n/en.json   # paridad es/en, desde Claude/
```

La e2e `test/chat-typing.e2e-spec.ts` necesita la base de datos de prueba y debe cubrir los escenarios 10 a 14 en la parte del servidor (acceso, chat directo, presencia, límite de frecuencia). Las e2e de `chat-gateway`, `chat-direct` y `log-redaction` deben seguir en verde.

## Medición manual

SC-004 (el indicador llega en menos de 2 s y se apaga en menos de 6 s) y SC-001 (todos los mensajes escritos sin conexión salen una sola vez tras cerrar y reabrir) se miden a mano con dos dispositivos.
