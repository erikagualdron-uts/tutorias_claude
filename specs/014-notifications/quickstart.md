# Quickstart: Notificaciones de cambios en los módulos

Guía para comprobar la funcionalidad de punta a punta. Contratos en [contracts/notifications-api.yaml](contracts/notifications-api.yaml); tablas en [data-model.md](data-model.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d          # PostgreSQL y Redis
cd tutorias_uts_db && npx prisma migrate dev        # aplica add_notifications
cd tutorias_uts_back && npm run start:dev           # API y worker (sondeo cada 5 s)
cd tutorias_uts_mobile && npx expo start
```

Variables opcionales del backend (valor por defecto entre paréntesis): `OUTBOX_POLL_SECONDS` (5), `NOTIFICATION_DELIVERY_ATTEMPTS` (8), `NOTIFICATION_BACKOFF_SECONDS` (15), `NOTIFICATION_SWEEP_SECONDS` (60). Para el correo local se puede usar un servidor SMTP de pruebas (por ejemplo MailHog en el puerto 1025) y guardarlo desde la pantalla del CAE.

Para el push real, el proyecto de Expo necesita un `projectId` de EAS en `app.json` (`expo.extra.eas.projectId`, se crea con `npx eas init`); sin él la app no obtiene el token y el aviso sigue llegando por la bandeja y el correo. Para el correo, `SMTP_HOST` ya no tiene valor por defecto: sin la fila que guarda el CAE ni esa variable, el correo queda pendiente (con MailPit, `SMTP_HOST=localhost` y `SMTP_PORT=1025`).

Datos de partida: periodo activo, un módulo con un docente y un salón, y dos estudiantes (uno inscrito, otro no).

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run test:e2e   # reglas, bandeja, entrega, SMTP, roles y contrato
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
```

## Recorrido manual

| # | Pasos | Resultado esperado |
|---|---|---|
| 1 | El docente reprograma una sesión (historia 1) | En menos de 30 s el estudiante inscrito ve un aviso con módulo, fecha anterior y nueva, en su idioma y hora de Bogotá; el no inscrito no recibe nada |
| 2 | El docente cancela "ella y las futuras" | Un solo aviso con las fechas resumidas |
| 3 | El CAE cambia el salón y luego el docente | Un aviso por cambio, con el nuevo salón o docente |
| 4 | El estudiante abre la bandeja (historia 2) | Contador en la campana, avisos nuevos resaltados; tocar uno abre el módulo y el contador baja |
| 5 | "Marcar todo como leído" | El contador desaparece |
| 6 | Con otro usuario sin avisos y luego sin red | Estado vacío y error con "Reintentar" |
| 7 | Con un iPhone con Expo Go (o una compilación de desarrollo), el estudiante acepta las notificaciones y se repite el paso 1 (historia 3) | Llega el push; al tocarlo se abre el módulo. Al cerrar sesión en el teléfono, el siguiente cambio ya no le llega |
| 8 | Con el correo configurado (historia 4) | Llega un correo con asunto y cuerpo en el idioma del estudiante |
| 9 | Detener el SMTP 5 minutos, provocar un cambio y reanudarlo | El aviso y el push llegan de inmediato; el correo llega al volver el servidor, sin duplicarse |
| 10 | Detener la API, provocar cambios y reiniciar (historia 5) | Se procesan todos, en orden, una vez cada uno |
| 11 | Como CAE, abrir Más → Correo, guardar datos válidos y "Enviar correo de prueba" (historia 6) | La prueba llega al correo del CAE; al volver a abrir, la clave aparece oculta; con la clave vacía al editar, se conserva |
| 12 | Como docente o estudiante, llamar `GET /settings/smtp` | `403` |

> Limitación de plataforma: Expo Go en Android no admite push remoto; usar un iPhone con Expo Go o una compilación de desarrollo (supuesto de la spec).

## Criterios de salida

SC-001 a SC-009 de la spec, con las pruebas automáticas en verde y los pasos 1 a 12 completados. Antes de unir la rama se corre `feature-done-check`.
