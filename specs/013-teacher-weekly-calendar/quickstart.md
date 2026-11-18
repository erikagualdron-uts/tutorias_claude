# Quickstart: Calendario semanal del docente

Guía para comprobar la funcionalidad de punta a punta. Contrato: [contracts/teacher-calendar-api.yaml](contracts/teacher-calendar-api.yaml). Modelo: [data-model.md](data-model.md).

## Prerrequisitos

- PostgreSQL y Redis locales: `cd tutorias_uts_db && docker compose up -d`.
- Migración y seed: `cd tutorias_uts_db && npx prisma migrate deploy && npx prisma db seed` (esta funcionalidad no agrega migraciones). El seed deja un periodo Activo, el docente `docente.ejemplo@correo.uts.edu.co` y el módulo "Cálculo I (ejemplo)" con sus sesiones.
- Backend: `cd tutorias_uts_back && npm run start:dev`.
- App: `cd tutorias_uts_mobile && npx expo start -c` (la `-c` es obligatoria si se añadieron íconos al registro).
- Para ver varios días con marca y un día vacío, crear con el CAE un segundo módulo del mismo docente en otro día de la semana. Para ver un bloque reprogramado y otro cancelado, usar las acciones de la spec 012.

## Verificaciones automáticas

```bash
cd tutorias_uts_back && npm run test && npm run test:e2e && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
```

Deben pasar, entre otras: rango de fechas y su límite de 7 días, sesiones pasadas y futuras de cualquier estado, solo las del docente del token (`403` para estudiante y CAE, `401` sin token), periodo Activo, Cerrado o ausente, ubicación por hora de Bogotá, rango de horas ampliado, límites de navegación y contrato.

## Recorrido manual

Repetir en español e inglés, con modo oscuro, fuente grande y "reducir movimiento".

1. **Semana actual (US1)**: como docente, abrir el cronograma. Se ve la semana actual con hoy seleccionado, marcas en los días con sesiones y las sesiones de hoy por hora. Debajo están las tarjetas de próximas sesiones y al final el resumen de módulos. Tocar otro día cambia la lista; un día sin sesiones muestra "No hay sesiones este día".
2. **Hora actual**: en hoy, una línea marca la hora dentro del horario; en otros días no aparece.
3. **Navegar (US2)**: avanzar y retroceder semanas hasta los límites del periodo; más allá, la flecha no avanza y se lee "Fuera del periodo académico". "Hoy" vuelve a la semana actual. Las tarjetas de abajo no cambian al navegar.
4. **Estados (US3)**: reprogramar una sesión a otro día de su semana y cancelar otra. Al volver, la reprogramada está en su día y hora nuevos con la insignia y la hora original; la cancelada sigue visible, tachada, con su motivo. Un festivo en la semana deja sus sesiones canceladas con ese motivo.
5. **Acciones (US4)**: tocar un bloque abre la hoja de la spec 012; una sesión a menos de 2 horas muestra su bloqueo con la regla. Tras confirmar un cambio, calendario y tarjetas se actualizan solos.
6. **Vista Semana**: cambiar a **Semana** con el selector (y comprobarla abriendo la app en una tableta o ventana ancha, donde es la inicial). Siete columnas con bloques de hora y salón; todo lo anterior funciona igual.
7. **Datos ajenos**: con el CAE, un estudiante y otro docente, consultar `/teacher/calendar` debe responder `403` o devolver solo lo propio.
8. **Calidad visual (SC-004, SC-006)**: objetivos táctiles de 48 px, sin textos cortados con fuente grande, y revisión con docentes del reconocimiento de hoy, día elegido y estados.

## Medición

- **SC-001**: tomar el tiempo en que 5 personas responden "¿cuándo es mi próxima tutoría?" desde que abren el cronograma (meta: menos de 10 s).
- **SC-002**: medir la carga de una semana con red normal (meta: menos de 2 s).

## Resultados

- **2026-11-18, recorrido manual (reportado por el equipo):** el flujo se recorrió en el emulador y el resultado se aprobó. No se registraron mediciones de SC-001, SC-002 ni SC-004, ni la revisión con docentes; quedan sin medir.
- **Automático (2026-11-18):** backend 93 unitarias y 373 e2e; app 60 suites y 474 pruebas; lint y tipos limpios; paridad es/en de 504 claves.
