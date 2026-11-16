# Context.md

> Qué es el proyecto, para quién es y qué incluye. Para el cómo técnico ver `Architecture.md`.

## 1. Resumen

Aplicación móvil (Android e iOS) para la gestión de **tutorías académicas**, llamadas **módulos**. Conecta a tres tipos de usuario: el Centro de Administración Estudiantil (CAE), los docentes y los estudiantes.

## 2. Problema que resuelve

- Centralizar la oferta, asignación y seguimiento de tutorías académicas.
- Que el CAE controle salones, docentes y estudiantes desde un solo lugar.
- Facilitar la comunicación entre CAE, docentes y estudiantes (notificaciones y mensajes).
- Dar un canal formal para quejas y solicitudes (PQRS).

## 3. Glosario

| Término | Significado |
|---|---|
| **Módulo** | Una tutoría académica. Tiene docente, salón, horario y estudiantes inscritos. |
| **CAE** | Centro de Administración Estudiantil. Es quien administra la plataforma (rol SUPERADMIN). |
| **PQRS** | Peticiones, quejas, reclamos y sugerencias. |
| **Borrado lógico** | El registro no se elimina de la base de datos, solo se marca como eliminado. |
| **Desactivar** | La cuenta queda bloqueada pero sigue visible y se puede reactivar. |
| **Clave temporal** | Contraseña generada por el CAE al crear un docente; debe cambiarse en el primer ingreso. |

## 4. Roles y alcance funcional

### 4.1 SUPERADMIN (CAE)

1. **Configuración**
   - Datos generales: cantidad de salones, capacidad de personas por salón, etc.
   - Listas desplegables administrables.
   - Correos institucionales de docentes.
   - SMTP: configuración del servicio de envío de correos.
2. **Módulos**
   - **Salones**: gestión de salones y ubicaciones.
   - **Gestión de módulos**: cambiar salón de un módulo y cambiar docente de un módulo.
3. **Notificaciones**: mensajes directos entre el CAE y los docentes (en ambos sentidos).
4. **Docentes**: crear, generar clave temporal, actualizar datos, desactivar y borrado lógico.
5. **Estudiantes**: ver registrados, desactivar cuentas y borrado lógico.
6. **PQRS**: ver las generadas por docentes y estudiantes, atenderlas, y luego notificar al usuario o mantener la conversación por correo con la persona encargada.
7. **Dashboard**.

### 4.2 DOCENTE

1. **Notificaciones**
   - Enviar mensajes a los estudiantes de sus módulos.
   - Recibir mensajes de los estudiantes de sus módulos.
   - Conversar con el CAE.
2. **Cronograma**
   - Calendario semanal con sus tutorías: hora, salón y cantidad de estudiantes.
   - Cambiar la hora de una tutoría (consultando disponibilidad) o cancelarla. Se notifica a todos los estudiantes inscritos.
3. **Dashboard**.
4. **PQRS**: solo radicar (vista de usuario).

### 4.3 ESTUDIANTE

1. **Elegir tutorías** en formato de tarjetas.
2. **Cancelar** las tutorías en las que esté inscrito.
3. **Cronograma** semanal de solo lectura.
4. **Notificaciones**: anuncios de las tutorías, mensajes directos con docentes y avisos de cancelaciones.
5. **PQRS**: solo radicar (vista de usuario).

## 5. Fuera de alcance (por ahora)

- Pagos o cobros.
- Calificación de docentes.
- Videollamadas / tutorías virtuales.
- Versión web.
- Múltiples sedes o instituciones (por ahora es una sola institución).

> Ajustar esta lista según lo que decidas.

## 6. Plataformas

- Android e iOS (aplicación móvil).

## 7. Reglas de negocio

### Registro y cuentas
- Los **estudiantes** se registran libremente, pero solo con correo institucional **@uts.edu.co** (se valida el dominio y se verifica el correo).
- Los **docentes** y administrativos usan correo **@correo.uts.edu.co**.
- Los **docentes** no se registran solos: los crea el CAE con clave temporal y deben cambiarla en el primer ingreso. El CAE solo puede crearlos con un correo del dominio @correo.uts.edu.co.
- Los borrados son **lógicos**, nunca físicos.
- Una cuenta desactivada no puede iniciar sesión, pero conserva su historial.

### Módulos, cupos y horarios
- **Solo el CAE** crea módulos y define su docente, salón y horario.
- El **cupo máximo** de un módulo se calcula automáticamente según la capacidad del salón asignado.
- Al llegar al cupo, el sistema **bloquea** nuevas inscripciones.
- Un estudiante **no puede inscribirse** a dos módulos que se crucen en horario.
- No hay límite de módulos por estudiante, siempre que no se crucen.
- El estudiante puede **cancelar** una tutoría hasta **1 hora antes** de su inicio. Pasado ese tiempo, la cancelación se bloquea.
- Un estudiante puede **volver a inscribirse** a un módulo que canceló, mientras no se haya llenado el cupo máximo.
- El CAE solo puede **cambiar el salón** de un módulo si la capacidad del nuevo salón es **mayor o igual** a la cantidad de estudiantes inscritos. De lo contrario, el sistema bloquea el cambio.
- Un salón o un docente no puede tener dos módulos en el mismo horario.
- El docente solo puede cambiar la hora **consultando disponibilidad** (salón y cruces de horario).
- El docente puede **cambiar la hora o cancelar** una tutoría hasta **2 horas antes** de su inicio. Pasado ese tiempo, la acción se bloquea.
- Cambiar hora, salón o docente, o cancelar un módulo, **siempre notifica** a los estudiantes inscritos.

### Comunicación
- La **mensajería es en tiempo real** (chat).
- Las notificaciones llegan por **push** y por **correo** (vía el SMTP que configura el CAE).
- Quién puede escribir a quién:
  - CAE ↔ docentes.
  - Docente ↔ estudiantes de sus módulos.
  - El estudiante **puede iniciar** la conversación con el docente de un módulo en el que está inscrito.
- **Retención del historial:**
  - Mensajes de módulo (anuncios y chats grupales): **6 meses** (lo que dura un semestre).
  - Chats individuales: se conservan **2 años**.

### PQRS
- Docentes y estudiantes solo **radican** PQRS.
- Solo el CAE las **gestiona**: las atiende, notifica al usuario o continúa la conversación por correo.

## 8. Dashboards (métricas propuestas)

### CAE
- Módulos activos y porcentaje de ocupación general de cupos.
- Módulos llenos y módulos con baja inscripción.
- Estudiantes registrados y activos; docentes activos.
- PQRS por estado (radicada, en revisión, resuelta) y tiempo promedio de respuesta.
- Cancelaciones y reprogramaciones recientes.
- Uso de salones (más y menos ocupados).

### Docente
- Próxima tutoría (hora, salón y cantidad de estudiantes).
- Tutorías de la semana.
- Ocupación de cupos de cada uno de sus módulos.
- Mensajes sin leer.
- Estado de las PQRS que radicó.

### Estudiante
> Aún no estaba en el alcance original; se propone una pantalla de inicio sencilla.
- Próxima tutoría.
- Tutorías inscritas esta semana.
- Cancelaciones o cambios recientes.
- Notificaciones y mensajes sin leer.
- Estado de las PQRS que radicó.

## 9. Idiomas

- La app tendrá **soporte multilenguaje** (i18n) en **español** (idioma base) e **inglés**.
- El idioma **sigue el del dispositivo**. Si el dispositivo está en otro idioma distinto a español o inglés, se usa español por defecto.
- Los textos no van escritos directamente en el código, sino en archivos de traducción.
- Las listas desplegables administrables y las plantillas de correo también deben poder traducirse.

## 10. Preguntas abiertas

Ninguna por ahora. Agregar aquí las que surjan durante el desarrollo.
