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
| **Módulo** | Una tutoría académica. Tiene docente, salón, horario semanal y estudiantes inscritos. Pertenece a un periodo académico. |
| **Periodo académico** | Semestre en el que se dictan los módulos (ej. 2026-2), con fecha de inicio y fin. |
| **Sesión** | Cada ocurrencia semanal de un módulo, en una fecha y hora concretas. |
| **UTS** | Institución Universitaria Tecnológica de Santander (antes Unidades Tecnológicas de Santander). Cambió su carácter académico por la Resolución MEN 019103 del 23 de julio de 2026 y conserva la sigla UTS. |
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
   - Periodos académicos (semestres): crear, definir fechas de inicio y fin, y cuál está activo.
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
   - Cambiar la hora de una tutoría (consultando disponibilidad) o cancelarla, solo esa sesión o ella y las futuras de su horario semanal, y reactivar lo que canceló. Se notifica a todos los estudiantes inscritos.
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
- Los módulos se organizan en un **listado por periodo académico** (semestre). El estudiante ve y se inscribe a los módulos del periodo activo.
- Cada módulo **se repite semanalmente** en su día y hora durante todo el periodo. Cada semana es una **sesión**. Los cambios de hora y las cancelaciones del docente afectan a la sesión elegida **y a todas las sesiones futuras** del módulo (ver D-069).
- La inscripción es al módulo (todas sus sesiones del periodo) y solo a módulos del periodo **activo**.
- El **cupo máximo** de un módulo se calcula automáticamente según la capacidad del salón asignado y se mide **por sesión**: si una cancelación suelta libera un lugar en una sesión, otro estudiante no puede inscribirse mientras alguna sesión futura esté llena (D-090).
- Al llegar al cupo, el sistema **bloquea** nuevas inscripciones.
- Un estudiante **no puede inscribirse** a dos módulos que se crucen en horario.
- No hay límite de módulos por estudiante, siempre que no se crucen.
- El estudiante puede **cancelar** hasta **1 hora antes** del inicio de la sesión, y elige el alcance: **solo esa sesión** o **el módulo completo** (su inscripción). Pasado ese tiempo, la cancelación se bloquea (ver D-070). El estudiante puede **reactivar** una sesión que canceló mientras falte más de 1 hora y haya lugar. Cancelar el módulo libera el lugar desde la primera sesión que empiece en más de 1 hora; una sesión que empieza antes conserva al estudiante (D-091).
- Un estudiante puede **volver a inscribirse** a un módulo que canceló, mientras no se haya llenado el cupo máximo.
- El CAE solo puede **cambiar el salón** de un módulo si la capacidad del nuevo salón es **mayor o igual** a la cantidad de estudiantes inscritos. De lo contrario, el sistema bloquea el cambio.
- Un salón o un docente no puede tener dos módulos en el mismo horario dentro del periodo; terminar a la hora en que otro empieza no es un cruce.
- Los horarios de un módulo van **de 6:00 a. m. a 6:00 p. m.** (hora de Bogotá): ninguno puede empezar antes ni terminar después. El límite vive en configuración (`MODULE_EARLIEST_TIME` y `MODULE_LATEST_TIME`) y se aplica en el backend (ver D-089).
- Un módulo puede tener **varios horarios semanales** (por ejemplo martes y jueves). El CAE solo cambia esos horarios mientras el módulo **no tenga inscritos**; con inscritos, la hora de una sesión o de las futuras la cambia el docente (D-084).
- El CAE solo elimina (lógico) un módulo **sin inscritos**. Cambiar el docente o el salón se aplica a las sesiones futuras y las pasadas conservan lo que tenían (D-086).
- Los módulos de un periodo **Cerrado** son de solo lectura, también frente a los festivos.
- Si el docente o el salón de un módulo se desactiva o elimina después de asignarse, el módulo se marca como no disponible y el CAE lo reasigna; no se bloquea la desactivación (D-088).
- El docente solo puede cambiar la hora **consultando disponibilidad** (salón, docente y cruces con los horarios de los estudiantes inscritos) y solo dentro de la misma semana de la sesión.
- El docente puede **cambiar la hora o cancelar** una tutoría hasta **2 horas antes** de su inicio, y elige el alcance: **solo esa sesión** o **ella y las futuras de su mismo horario semanal** (D-069). Puede **reactivar** una sesión que él canceló mientras falten 2 horas o más. Pasado ese tiempo, la acción se bloquea.
- Cambiar hora, salón o docente, o cancelar un módulo, **siempre notifica** a los estudiantes inscritos.

### Configuración del CAE (periodos, salones y listas)
- Un periodo nace **Próximo**; el CAE lo **activa** y, si ya hay uno activo, confirma que se cierra. El periodo activo se cierra a mano o solo al pasar su fecha de fin. Un periodo **Cerrado** es de solo lectura y no se reabre. Los periodos no se solapan y solo se eliminan los Próximos sin módulos (D-071, D-072, D-076).
- En un periodo Próximo o Activo el CAE solo edita el **nombre y las fechas**; en el activo, la fecha de fin no puede ser anterior a hoy.
- Un salón tiene nombre único dentro de su ubicación, capacidad entera positiva y estado Activo o Inactivo. No se desactiva ni elimina un salón con módulos en el periodo activo; con módulos solo en periodos Próximos se permite, avisando cuántos quedan afectados (D-074). Eliminar una ubicación sin salones activos elimina también sus salones inactivos (D-075).
- Las **listas desplegables** las define el sistema (ej. "Tipos de PQRS"); el CAE administra sus elementos con etiqueta en español e inglés, orden y estado. Un elemento en uso solo se desactiva (D-073).
- Reglas que **la funcionalidad de módulos debe cumplir** porque la configuración no puede aplicarlas sola: el cupo es la capacidad del salón, un salón inactivo o eliminado no se asigna, y los módulos de un periodo cerrado no se modifican.

### Festivos
- El CAE administra un **calendario de festivos**: agrega, edita y elimina (lógico) festivos con fecha y nombre, y puede **importar** los de un año desde un servicio público (Nager.Date) revisando antes la lista. No se registran, editan, eliminan ni importan festivos con fecha anterior a hoy (D-083).
- Las sesiones no se generan en festivos. Al registrar un festivo, las sesiones futuras de esa fecha se cancelan con el motivo "festivo" y se avisa a los inscritos; al eliminarlo, se restauran o se generan de nuevo.
- La importación nunca es obligatoria: si el servicio externo falla, el CAE registra los festivos a mano.

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

- [x] Cuando el docente cambia la hora o cancela, ¿afecta solo esa sesión o también las semanas restantes? **Resuelto (D-069): afecta la sesión elegida y todas las futuras.**
- [x] Cuando el estudiante cancela, ¿cancela su inscripción al módulo completo o solo su asistencia a una sesión? **Resuelto (D-070): elige entre solo la sesión o el módulo completo.**
- [x] Al reprogramar una sesión, ¿también se valida que no choque con otras tutorías de los estudiantes inscritos? **Resuelto (D-093): sí, se rechaza y se dice cuántos estudiantes se cruzan.**
- [x] ¿Se excluyen festivos o semanas sin tutoría dentro del periodo? **Resuelto (D-083): calendario de festivos del CAE con importación opcional.**
- [x] ¿Un módulo puede tener más de un horario semanal (por ejemplo lunes y miércoles)? **Resuelto (D-084): sí; el CAE solo los cambia sin inscritos.**
