# Quickstart: validar Módulos y sesiones (CAE)

Guía para comprobar de punta a punta que la funcionalidad cumple la spec. Contrato: [contracts/modules-api.yaml](contracts/modules-api.yaml). Modelo: [data-model.md](data-model.md).

## Prerrequisitos

- Docker con PostgreSQL y Redis (`docker compose up -d` en `tutorias_uts_db`).
- Migraciones aplicadas y seed ejecutado (CAE de desarrollo, periodo, ubicación y salones de la spec 006, y docentes de ejemplo).
- API en marcha (`npm run start:dev` en `tutorias_uts_back`) y app Expo (`npx expo start` en `tutorias_uts_mobile`).
- Para la importación real de festivos, salida a internet hacia `date.nager.at`; sin ella se prueba el fallo controlado.
- Tres usuarios de desarrollo: CAE, docente y estudiante (los del seed de la funcionalidad 001).

## Verificaciones automáticas

```bash
# tutorias_uts_back
npm run test        # reglas puras: ocurrencias semanales, conversión Bogotá a UTC, solapamiento, festivos
npm run test:e2e    # modules, modules-concurrency, holidays y modules-roles (403 por rol)
npm run lint

# tutorias_uts_mobile
npm run lint
npm run typecheck
npm test
```

Deben cubrir, como mínimo: módulo con un horario y con dos; hora de fin no posterior al inicio; horarios del mismo módulo que se solapan; cruce de docente y de salón (y que fin = inicio no cruza); dos peticiones simultáneas que asignan el mismo salón u otro docente a la misma hora (solo una se guarda); periodo en curso (sin sesiones pasadas); conteo de sesiones por horario; periodo más corto que una semana; cambio de salón con capacidad menor, igual y mayor que los inscritos (con el doble de `ConfigUsageService`); cambio de docente que respeta las sesiones pasadas; cambio de horarios y eliminación con y sin inscritos; periodo Cerrado y cierre simultáneo durante una escritura; festivo nuevo que cancela sesiones futuras y deja un evento; festivo eliminado que las restaura o las genera; festivo pasado bloqueado; festivos que no tocan módulos de un periodo Cerrado; módulo con docente o salón desactivado después, marcado como no disponible; fechas repetidas; importación con servicio caído, lento (más de 10 s) y con respuesta inválida (sin guardar nada parcial); y `403` de docente y estudiante en todos los endpoints.

## Recorrido manual (CAE)

1. **Festivos**: Más → Configuración → Festivos → el año siguiente al actual → Importar. Se ve la lista de Nager.Date (por ejemplo "Año Nuevo", 1 de enero) con las ya existentes marcadas; confirmar. Con el año en curso, las fechas pasadas aparecen marcadas y no se pueden seleccionar. Repetir y comprobar que no se duplica. Agregar a mano un día sin tutoría. Desconectar la red y comprobar el aviso de importación no disponible y que el alta manual sigue funcionando.
2. **Crear módulo** (SC-001, menos de 2 minutos): pestaña Módulos → periodo activo → Nuevo módulo: nombre, docente, salón y un horario (martes 14:00 a 16:00). Al guardar, aparece en la lista con el cupo igual a la capacidad del salón.
3. **Sesiones**: abrir el detalle. Hay una sesión por cada martes del periodo (sin los festivos y, si el periodo ya empezó, sin las pasadas), con hora de Bogotá (SC-003, SC-008). La lista indica las fechas omitidas por festivo.
4. **Cruces**: crear otro módulo con el mismo docente el martes 15:00 a 17:00: se rechaza mostrando el módulo y el horario con el que choca. Repetir con el mismo salón. Crear uno de 16:00 a 18:00: se permite (SC-002).
5. **Cambiar salón**: elegir un salón con capacidad menor que los inscritos (con el doble de inscritos activado en desarrollo): la opción aparece deshabilitada con el mensaje de la regla; con capacidad mayor, el cambio se aplica y el cupo cambia (SC-004).
6. **Cambiar docente**: reasignar a uno libre y a uno ocupado; las sesiones futuras cambian y las pasadas conservan el anterior.
7. **Editar y eliminar**: cambiar nombre; cambiar el horario sin inscritos (las sesiones futuras se regeneran); simular inscritos y comprobar que el horario y la eliminación se bloquean con la regla; eliminar uno sin inscritos y comprobar que libera docente y salón.
8. **Festivo con módulos**: registrar un festivo en una fecha con sesiones futuras: pasan a canceladas con el motivo "festivo" y se crea un evento en `outbox_events`. Eliminarlo: vuelven a programadas.
9. **Periodo Cerrado** (SC-005): cerrar el periodo y comprobar que sus módulos se ven en solo lectura sin acciones de crear, editar ni eliminar, con el motivo explicado. Probar por la API que el servidor rechaza las escrituras.
10. **Roles** (SC-006): con un token de docente o de estudiante, llamar a `/modules` y `/holidays`: todos responden `403`.
11. **Idioma**: repetir en español e inglés; todos los textos y errores están traducidos. Modo oscuro, fuente grande y "reducir movimiento" sin cortes.

## Criterios de salida

- Las verificaciones automáticas pasan en los tres repositorios.
- Los recorridos 1 a 11 se cumplen y se anotan aquí con fecha.
- `docs/` y `Decisions.md` reflejan lo implementado (Definición de terminado de `docs/Conventions.md`).

## Resultados

**2026-11-17 · Verificaciones automáticas** (incluye el límite de horario 06:00–18:00, D-089)

| Repositorio | Resultado |
|---|---|
| `tutorias_uts_back` | 47 pruebas unitarias y 222 e2e pasan; lint y tipos limpios |
| `tutorias_uts_mobile` | 49 suites y 336 pruebas pasan; lint y tipos limpios; paridad es/en |
| `tutorias_uts_db` | migración y seed aplicados y repetibles |

**2026-11-17 · Recorrido manual y revisión visual (T080, T081):** hecho por el equipo en español e inglés, con modo oscuro y fuente grande. Una observación (avatar sin borde en oscuro y menú de perfil demasiado abajo) se corrigió en `AppBar.tsx`; el resto, sin observaciones. Los tiempos de SC-001 y SC-010 y SC-007 no se registraron por escrito.
