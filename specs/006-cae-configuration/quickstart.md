# Quickstart: validar la Configuración del CAE

Guía para comprobar de punta a punta que la funcionalidad cumple la spec. Contrato: [contracts/config-api.yaml](contracts/config-api.yaml). Modelo: [data-model.md](data-model.md).

## Prerrequisitos

- Docker con PostgreSQL y Redis (`docker compose up -d` en `tutorias_uts_db`).
- Migraciones aplicadas y seed ejecutado (crea el CAE de desarrollo y los datos de ejemplo).
- API en marcha (`npm run start:dev` en `tutorias_uts_back`) y app Expo (`npx expo start` en `tutorias_uts_mobile`).
- Tres usuarios de desarrollo: CAE, docente y estudiante (los del seed de la funcionalidad 001).

## Verificaciones automáticas

```bash
# tutorias_uts_back
npm run test        # reglas de periodos, salones, listas (con doble de ConfigUsageService)
npm run test:e2e    # periods, rooms, dropdown-lists y config-roles (403 por rol)
npm run lint

# tutorias_uts_mobile
npm run lint
npm run typecheck
npm test
```

Deben cubrir, como mínimo: nombre duplicado, fin no posterior al inicio, solapamiento (incluido fin = inicio), activación con y sin confirmación, dos activaciones simultáneas (queda un solo activo), cierre automático al vencer, edición bloqueada en periodo cerrado, eliminación solo de Próximos sin módulos, unicidad de salón por ubicación, capacidad no entera o no positiva, bloqueos de salón por uso (con el doble), cascada al eliminar una ubicación, elementos en uso que solo se desactivan, reordenamiento, y `403` de docente y estudiante en todos los endpoints de administración.

## Recorrido manual (CAE, criterio SC-001: menos de 5 minutos)

1. **Periodo**: Más → Configuración → Periodos → crear "2026-2" con fechas válidas. Aparece como *Próximo*.
2. **Solapamiento**: crear otro periodo con fechas dentro del anterior. Se rechaza y se indica con cuál choca.
3. **Activar**: activar "2026-2". Queda *Activo*. Crear y activar otro periodo: aparece el aviso de que se cerrará el activo; al confirmar, el anterior queda *Cerrado* y el nuevo *Activo*. Abrir el cerrado: solo lectura con la regla explicada.
4. **Ubicación y salón**: pestaña Módulos → crear la ubicación "Sede Central" y el salón "A-101" con capacidad 30. Repetir "A-101" en la misma ubicación: se rechaza. Capacidad 0 o 2,5: se rechaza.
5. **Desactivar y buscar**: desactivar y reactivar el salón; buscarlo por nombre y filtrar por ubicación y estado.
6. **Eliminar ubicación**: con un salón activo se bloquea y se explica; con salones solo inactivos, la confirmación indica cuántos salones se eliminarán.
7. **Listas**: Más → Configuración → Listas → "Tipos de PQRS" ya trae sus cuatro elementos. Agregar "Felicitación / Compliment", subirlo y bajarlo, desactivar uno. Abrir un selector con el rol docente o estudiante: solo se ven los activos, en el idioma del dispositivo y en el orden definido.

## Comprobaciones de seguridad

- Con el token de un docente o estudiante, cada ruta de administración responde `403` y no cambia datos. Solo responden `200` `GET /academic-periods/active` y `GET /dropdown-lists/:key/items`.
- En la base de datos, ningún borrado elimina filas: los registros eliminados conservan `deleted_at`.
- Intentar insertar a mano dos periodos `ACTIVE` o dos rangos solapados falla por las restricciones de la migración.

## Idioma y diseño

- Cambiar el dispositivo entre español e inglés: todas las pantallas, errores de reglas y etiquetas de elementos cambian.
- Cada pantalla muestra carga, vacío, error y datos; botones con ícono a la izquierda y 16 px entre apilados; objetivos de 48 px; confirmación en acciones destructivas.
