# Quickstart: validar el cronograma del estudiante

Guía para comprobar la spec 021 de punta a punta. No contiene código de implementación; la forma de la respuesta está en [contracts/student-calendar-api.yaml](contracts/student-calendar-api.yaml) y las reglas en [data-model.md](data-model.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d
cd ../tutorias_uts_back && npm run start:dev
cd ../tutorias_uts_mobile && npx expo start
```

Datos de partida: un periodo activo, dos módulos con sesiones semanales (docentes y salones distintos), un estudiante inscrito en ambos y otro estudiante sin inscripciones, un festivo que cancela una sesión, una sesión reprogramada, una cancelada por el docente y una que el estudiante cancela para sí.

## Escenarios

| # | Hacer | Resultado esperado |
|---|---|---|
| 1 | Como estudiante inscrito, abrir "Cronograma" en un teléfono | Semana actual, hoy seleccionado, vista Día, sesiones del día por hora con módulo, salón y docente |
| 2 | Mirar el encabezado | Rango de la semana, flechas, "Hoy" y siete días con una marca en los que tienen sesiones |
| 3 | Cambiar a la vista Semana y volver | Siete columnas con hora, salón y estado; la elección se mantiene al cambiar de semana |
| 4 | Abrir en una tableta (o a 600 dp o más) | Abre en la vista Semana |
| 5 | Mirar el día de hoy dentro del horario | Línea con la hora actual |
| 6 | Seleccionar un día sin sesiones | "No hay sesiones este día" |
| 7 | Ver la sesión reprogramada | En su hora nueva, con la etiqueta "Reprogramada" y la hora original |
| 8 | Ver la sesión cancelada por festivo y la cancelada por el docente | Visibles, tachadas, con su motivo |
| 9 | Ver la sesión que el estudiante canceló para sí | Visible, tachada, "Cancelada por ti" |
| 10 | Comprobar que no aparece ninguna sesión de un módulo en el que no está inscrito | Ninguna |
| 11 | Cancelar toda la inscripción de un módulo con vigencia futura y ver la semana de la vigencia y las siguientes | Sesiones hasta la fecha de vigencia y ninguna después |
| 12 | Navegar semanas hasta el límite del periodo | La flecha se ve deshabilitada y al tocarla dice "Fuera del periodo académico" |
| 13 | Tocar "Hoy" desde otra semana | Vuelve a la semana actual con hoy seleccionado |
| 14 | Tocar una sesión | Abre el detalle de su módulo; al volver, el calendario conserva semana y día; no hay acciones de cambio |
| 15 | Entrar con el estudiante sin inscripciones | Estado vacío con invitación a explorar módulos, sin calendario en blanco |
| 16 | El docente reprograma una sesión; el estudiante vuelve a la pestaña | El calendario muestra el cambio; repetir con el dispositivo en inglés y comprobar todos los textos |

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
python .claude/skills/i18n-strings/scripts/check_i18n.py ../tutorias_uts_mobile/src/i18n/es.json ../tutorias_uts_mobile/src/i18n/en.json   # paridad es/en, desde Claude/
```

Las e2e (`test/student-calendar*.e2e-spec.ts`) necesitan la base de datos de prueba y deben cubrir los escenarios 7 a 11 y 15 en la parte de la API, el contrato y los permisos (`403` a docente y CAE, `401` sin sesión, `400` fuera del rango de 7 días). Las e2e del cronograma del docente (`teacher-calendar*`) deben seguir en verde porque comparten la resolución del periodo.

## Medición manual

SC-001 (identificar la próxima tutoría de la semana en menos de 10 segundos) y SC-004 (cambiar de semana en menos de 2 segundos) se miden a mano en la app.
