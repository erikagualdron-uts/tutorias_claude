# Quickstart: validar el pulido

Guía para comprobar la spec 020 de punta a punta. No contiene código de implementación; los datos están en [data-model.md](data-model.md) y el cambio de API en [contracts/changes.md](contracts/changes.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d
cd ../tutorias_uts_back && npm run start:dev
cd ../tutorias_uts_mobile && npx expo start
```

Datos de partida: un estudiante, un docente, el CAE, y PQRS en los tres estados (una radicada, una en revisión y una resuelta).

## Escenarios

| # | Hacer | Resultado esperado |
|---|---|---|
| 1 | Como estudiante, radicar una PQRS | Aparece la confirmación con el número (8 caracteres), la fecha y "Radicada" |
| 2 | Tocar "Ver mi PQRS" | Abre el detalle de esa PQRS con el mismo número |
| 3 | Repetir 1 y tocar "Volver a mis PQRS" | La lista muestra la nueva PQRS arriba, con el mismo número de la confirmación |
| 4 | Radicar con doble toque | Una sola PQRS y un solo número |
| 5 | Como docente, repetir 1 a 3 | Mismo comportamiento en su pila de PQRS |
| 6 | Abrir el detalle de una PQRS "Radicada" | Línea de tiempo: "Radicada" con fecha y actual; los otros dos pendientes y sin fecha |
| 7 | Abrir una "En revisión" y una "Resuelta" | Pasos cumplidos con fecha y hora de Bogotá; el actual resaltado; nombre en texto con ícono |
| 8 | Como CAE, abrir las mismas | La misma línea de tiempo que el autor |
| 9 | Como CAE, mirar la barra con 3 PQRS radicadas | Insignia con 3 en la pestaña "PQRS" |
| 10 | Pasar una a "En revisión" y volver a la barra | La insignia baja a 2 |
| 11 | Sin PQRS radicadas | La pestaña no muestra insignia |
| 12 | Como docente o estudiante, mirar la barra | Ninguna insignia en "PQRS" |
| 13 | Abrir un dashboard por primera vez | Los números suben de 0 a su valor en menos de un segundo |
| 14 | Refrescar el dashboard | Los números cambian sin repetir el conteo desde 0 |
| 15 | Activar "reducir movimiento" y abrir un dashboard | Los números aparecen directamente con su valor final |
| 16 | Poner `es` y luego `en` en el dispositivo y repetir 1, 6, 9 y 13 | Todos los textos en el idioma del dispositivo |

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
python .claude/skills/i18n-strings/scripts/check_i18n.py ../tutorias_uts_mobile/src/i18n/es.json ../tutorias_uts_mobile/src/i18n/en.json   # paridad es/en, desde Claude/
```

La estabilidad de la suite (SC-005) se comprueba corriendo `npm test` tres veces seguidas en la app, sin fallos por tiempo agotado.

Las e2e (`test/pqrs-mine.e2e-spec.ts` y `pqrs-contract.e2e-spec.ts`) necesitan la base de datos de prueba y deben cubrir el escenario 7 en la parte de la API y el contrato.

## Medición manual

SC-002 (identificar el paso de la PQRS en menos de 5 segundos) y SC-004 (conteo en menos de un segundo, sin repetirse) se miden a mano en la app.
