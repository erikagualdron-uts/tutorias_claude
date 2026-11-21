# Quickstart: Plantillas de correo institucionales

Guía para comprobar la feature de punta a punta. Detalle de tipos y configuración en [data-model.md](data-model.md).

## Prerrequisitos

- `cd tutorias_uts_db && docker compose up -d` (PostgreSQL, Redis y **Mailpit**: SMTP en `1025`, bandeja en `http://localhost:8025`).
- En `tutorias_uts_back/.env`: `SMTP_HOST=localhost`, `SMTP_PORT=1025`, `SMTP_FROM=no-reply@uts.edu.co` y, si se quiere ver el bloque de contacto, `MAIL_CONTACT_EMAIL` y `MAIL_FOOTER_TEXT`.
- `cd tutorias_uts_back && npm run start:dev`.
- Un estudiante inscrito en un módulo del periodo activo, con correo `@uts.edu.co`, y un CAE con la sesión abierta.

## Escenarios

| # | Pasos | Resultado esperado |
|---|---|---|
| 1 | Registrar un estudiante nuevo. | En Mailpit llega "Verifica tu correo" con la marca UTS, el logo, el código destacado y su vencimiento en hora de Bogotá. El código no está en el asunto. |
| 2 | Pedir restablecer la clave. | Correo de restablecimiento con el código destacado y la advertencia de que la UTS no pide la clave. |
| 3 | Como docente, reprogramar una sesión. | Correo "sesión reprogramada" al estudiante, acento Warning, con la hora anterior y la nueva en hora de Bogotá. |
| 4 | Como docente, cancelar una sesión y luego reactivarla. | Dos correos distintos: cancelación (acento Error) y reactivación (acento Success). |
| 5 | Como CAE, cambiar el salón y el docente del módulo. | Dos correos con acento Primary, uno por cambio, con el dato nuevo. |
| 6 | Como CAE, crear un festivo que cae sobre una sesión y luego quitarlo. | Un correo de cancelación por festivo y otro de restauración. |
| 7 | Cambiar el idioma del estudiante a inglés y repetir el escenario 3. | El mismo correo en inglés, completo. |
| 8 | En Configuración, pulsar "Enviar correo de prueba". | Correo corto de prueba con la misma marca, en el idioma del CAE. |
| 9 | Abrir cada correo con las imágenes desactivadas (o como texto en Mailpit). | Se lee completo en texto simple; el nombre de la institución identifica el mensaje. |
| 10 | Poner `<b>x</b>` en el nombre de un módulo y reprogramar una sesión. | El correo muestra el texto literal, sin negrita. |
| 11 | Parar Mailpit, provocar un aviso, volver a levantarlo. | El aviso queda pendiente con su causa y llega al reintentar; solo una vez. |
| 12 | Quitar `MAIL_CONTACT_EMAIL` y `MAIL_FOOTER_TEXT` y reiniciar. | Los correos salen igual, sin ese bloque. |

## Pruebas automáticas

- `cd tutorias_uts_back && npm run lint && npm test`: unitarias de las 20 versiones de plantilla (sin marcadores, escapado, texto equivalente, idioma, código fuera del asunto).
- `npm run test:e2e`: entrega de correo de la 014 (envío único, reintento, dominio no permitido, servidor sin configurar) y `mail-templates.e2e-spec.ts` (siete avisos y dos códigos con marca e idioma). Requiere PostgreSQL y Redis del `docker compose`.

## Cierre de la 014

- Escenarios 3 a 6 y 11 cubren el recorrido del quickstart de la 014 (T078) para el canal de correo. El push real en iPhone sigue siendo verificación de dispositivo.
- Al terminar, correr `feature-done-check` sobre la 014 y la 015 (T079).
