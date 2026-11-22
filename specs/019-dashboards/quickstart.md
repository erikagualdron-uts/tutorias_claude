# Quickstart: validar los dashboards

Guía para comprobar la spec 019 de punta a punta. No contiene código de implementación; los contratos están en [contracts/dashboard-api.yaml](contracts/dashboard-api.yaml) y las cifras en [data-model.md](data-model.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d
cd ../tutorias_uts_back && npm run start:dev
cd ../tutorias_uts_mobile && npx expo start
```

Datos de partida (el seed de desarrollo alcanza): un periodo `ACTIVE`, 3 módulos con salones de distinta capacidad (uno lleno, uno por debajo del 30 %), un docente con 2 módulos, un estudiante inscrito en 2, PQRS en los tres estados (una resuelta), y una sesión cancelada por el docente y otra reprogramada.

## Escenarios

| # | Hacer | Resultado esperado |
|---|---|---|
| 1 | Entrar como CAE y abrir "Dashboard" | Ocupación general, módulos llenos y con baja inscripción, tarjetas de módulos, estudiantes, docentes y PQRS radicadas |
| 2 | Comparar cada cifra del CAE con "Módulos", "Docentes", "Estudiantes" y "PQRS" | Coinciden; una cuenta desactivada o eliminada no cuenta |
| 3 | Ver "PQRS por estado" | Radicada, En revisión y Resuelta con número y etiqueta; el promedio es la media de radicación a resolución |
| 4 | Ver "Cambios recientes" y tocar "Ver todo" | 5 filas con módulo y tiempo relativo; la lista paginada muestra el resto |
| 5 | Ver "Uso de salones" | Hasta 3 más y 3 menos ocupados, sin repetir un salón |
| 6 | Registrar un festivo que cancele sesiones | Esas sesiones no aparecen en "Cambios recientes" (R-4) |
| 7 | Entrar como docente | Próxima sesión con salón e inscritos, sesiones de la semana sin las canceladas, barra de cupo por módulo |
| 8 | El docente cancela su próxima sesión y vuelve al dashboard | La tarjeta pasa a la siguiente sesión |
| 9 | Comparar mensajes sin leer con el contador de "Mensajes" | Mismo número |
| 10 | Entrar como estudiante | Próxima sesión con salón, sesiones de la semana, avisos y mensajes sin leer |
| 11 | El estudiante cancela una sola sesión suya y vuelve a "Inicio" | La cuenta de la semana baja en uno; esa sesión no puede ser la próxima |
| 12 | Ver "Cambios recientes" del estudiante | Solo cambios de módulos en los que está inscrito |
| 13 | Entrar con un usuario sin datos (estudiante sin inscripciones, docente sin módulos) | "Sin sesiones próximas" con invitación a explorar módulos; ningún `NaN` ni bloque vacío roto |
| 14 | Apagar la API a medias (cortar solo `/dashboard/admin/rooms`) | Ese bloque muestra "Reintentar" y los demás siguen visibles |
| 15 | Llamar a cada endpoint con otro rol (por ejemplo `GET /dashboard/admin/overview` como docente) | `403`; ningún dato de otro usuario |
| 16 | Repetir 1, 7 y 10 con el dispositivo en inglés | Todos los textos y estados vacíos en inglés |

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
python .claude/skills/i18n-strings/scripts/check_i18n.py ../tutorias_uts_mobile/src/i18n/es.json ../tutorias_uts_mobile/src/i18n/en.json   # paridad es/en, desde Claude/
```

Las e2e (`test/dashboard-*.e2e-spec.ts`) necesitan la base de datos de prueba y deben cubrir los escenarios 2, 3, 6, 8, 11, 12, 13 y 15.

## Medición manual

SC-001 (dashboard completo en menos de 3 segundos con 200 módulos y 200 PQRS) y SC-004 (identificar la próxima tutoría en menos de 5 segundos) se miden a mano en la app y se anotan en la tarea de pruebas manuales.

## Resultado del recorrido (2026-11-22)

Recorrido manual de los 16 escenarios por el equipo, con la app y la API en marcha. Resultado: sin fallos. Los tiempos de SC-001 (dashboard completo en menos de 3 s) y SC-004 (próxima tutoría en menos de 5 s) se cumplen con margen, y el diseño se aprobó. Los tiempos se reportaron sin cifras exactas.
