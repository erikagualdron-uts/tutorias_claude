# Quickstart: validar la calidad

Guía para comprobar la spec 023. No contiene código de implementación; las listas y los datos están en [data-model.md](data-model.md).

## Preparación

```bash
cd tutorias_uts_db && docker compose up -d
# Base de carga aparte, con las mismas migraciones y la semilla de volumen
docker compose exec postgres createdb -U <usuario> tutorias_load
DATABASE_URL=<url de tutorias_load> npm run migrate:deploy
LOAD_SEED_CONFIRM=yes DATABASE_URL=<url de tutorias_load> npm run seed:load
```

El usuario y la clave de la base salen del `docker-compose.yml`; el nombre de la base de carga debe terminar en `_load` o la semilla se niega.

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test && npm run test:e2e -- test/route-access test/response-secrets test/log-redaction && npm run lint
cd tutorias_uts_mobile && npm run lint && npm run typecheck && npm test
```

| Qué comprueba | Cómo |
|---|---|
| Ninguna ruta sin regla (SC-001) | `route-access.e2e-spec.ts` falla nombrando `MÉTODO /ruta`; para verlo fallar, quitar un `@Roles` o agregar una ruta de prueba y volver a correrla |
| Sin secretos ni contactos ajenos (SC-002) | `response-secrets.e2e-spec.ts` y `log-redaction.e2e-spec.ts` |
| Controles accesibles (SC-003) | las pruebas de pantalla llaman a `controlIssues`; falla un control sin nombre, sin rol o declarado menor que 48 px |
| "Reducir movimiento" (SC-003) | `src/__tests__/reduceMotion.test.ts` |
| Contraste AA (SC-005) | `src/theme/__tests__/contrast.test.ts`, claro y oscuro |
| Letra escalable | `src/__tests__/fontScaling.test.ts` |

## Medición de rendimiento (SC-006)

```bash
cd tutorias_uts_back
PERF_DATABASE_URL=<url de tutorias_load> npm run perf
```

Imprime una tabla con la mediana y el p95 por endpoint y falla si alguno supera `PERF_MAX_MS` (300 por defecto). Anotar el resultado y el entorno en `tasks.md`.

## Recorrido manual con lector de pantalla (SC-003)

Con TalkBack (Android) o VoiceOver (iOS), en español y en inglés, recorrer cada una de estas pantallas con el gesto de pasar al siguiente elemento:

| Rol | Pantallas |
|---|---|
| Todos | Inicio de sesión, registro, recuperar clave, notificaciones, perfil |
| Estudiante | Inicio, módulos y su detalle, cronograma, mensajes y un chat, PQRS (lista, formulario y detalle) |
| Docente | Dashboard, cronograma y la hoja de una sesión, mensajes y un chat, PQRS |
| CAE | Dashboard, módulos y su formulario, docentes y estudiantes, configuración, mensajes, PQRS |

Comprobar en cada una: todo control se anuncia con su nombre y su rol; los íconos junto a un texto no se leen; los estados (cargando, error, vacío, botón deshabilitado con su regla) se anuncian; el orden es el de lectura; un error de formulario se anuncia junto a su campo. Con "reducir movimiento" activo, nada se desplaza ni se repite.

## Recorrido manual con letra grande y modo oscuro (SC-004 y SC-005)

1. Subir la letra del sistema al 200 % y abrir las mismas pantallas: ningún texto se corta ni se superpone y cada acción sigue alcanzable (con desplazamiento si hace falta); la barra de pestañas conserva sus etiquetas.
2. Activar el modo oscuro y abrir las mismas pantallas: todo se lee, los estados siguen distinguiéndose por su texto y su ícono, y el logo se ve sobre el fondo oscuro.
3. Repetir con el dispositivo en inglés, donde los textos son más largos en los botones con ícono.

## Medición manual en la app (SC-006)

Con la API corriendo sobre la base de carga (`DATABASE_URL` apuntando a `tutorias_load`), entrar como el CAE de la semilla y medir cuánto tarda el dashboard en mostrar todas sus cifras (meta: menos de 3 s) y, como el estudiante de la semilla, cuánto tarda el cambio de semana del cronograma (meta: menos de 2 s). Recorrer a mano las listas largas buscando saltos.
