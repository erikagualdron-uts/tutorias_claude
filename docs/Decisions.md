# Decisions.md

> Registro de decisiones importantes del proyecto y su motivo. Sirve para que nadie (humano o IA) vuelva a proponer lo que ya se descartó.

## Cómo usar este archivo

- Cada decisión tiene un identificador (`D-001`, `D-002`…), nunca se reutiliza.
- **Estado:** `Aceptada`, `Supuesto` (se asume mientras no se confirme) o `Reemplazada por D-0XX`.
- Las decisiones no se borran: si cambian, se agrega una nueva y la anterior pasa a `Reemplazada`.
- Formato: **Decisión** (qué), **Motivo** (por qué), **Alternativas descartadas** (si aplica).

---

## Producto

### D-001 · Una sola aplicación para los tres roles
- **Estado:** Aceptada
- **Decisión:** Una app móvil única; al iniciar sesión, la navegación cambia según el rol (SUPERADMIN, TEACHER, STUDENT).
- **Motivo:** Una sola base de código es más fácil de mantener, probar y publicar.
- **Descartado:** Tres apps separadas.

### D-002 · Los módulos son recurrentes semanalmente por periodo académico
- **Estado:** Aceptada
- **Decisión:** Cada módulo pertenece a un periodo académico (semestre) y se repite cada semana en su día y hora. El sistema genera una sesión por semana.
- **Motivo:** Así funcionan las tutorías en la institución; permite cancelar o reprogramar una sesión sin afectar las demás.
- **Descartado:** Sesiones únicas con fecha específica.

### D-003 · Solo el CAE crea módulos y define su horario
- **Estado:** Aceptada
- **Decisión:** El CAE define docente, salón y horario. El docente puede cambiar la hora de una sesión o cancelarla, pero no crear módulos.
- **Motivo:** Control centralizado de salones y cupos.

### D-004 · El cupo es la capacidad del salón
- **Estado:** Aceptada
- **Decisión:** El cupo máximo de un módulo se calcula automáticamente a partir de la capacidad del salón y se bloquea la inscripción al llenarse.
- **Motivo:** Evitar sobrecupo sin configuración manual.

### D-005 · Sin cruces de horario para el estudiante
- **Estado:** Aceptada
- **Decisión:** Un estudiante no puede inscribirse a módulos que se crucen. No hay límite de módulos por estudiante.

### D-006 · Ventanas de cancelación: 1 hora (estudiante) y 2 horas (docente)
- **Estado:** Aceptada
- **Decisión:** El estudiante cancela hasta 1 hora antes del inicio; el docente cambia la hora o cancela hasta 2 horas antes. Ambos valores son configurables.
- **Motivo:** Dar tiempo razonable de aviso a los demás involucrados.

### D-007 · Cambio de salón solo con capacidad suficiente
- **Estado:** Aceptada
- **Decisión:** El CAE solo puede cambiar el salón de un módulo si la nueva capacidad es mayor o igual a los estudiantes inscritos.

### D-008 · Reinscripción permitida
- **Estado:** Aceptada
- **Decisión:** Un estudiante que canceló puede volver a inscribirse mientras haya cupo.

### D-009 · Registro con correo institucional
- **Estado:** Aceptada
- **Decisión:** Estudiantes: registro libre con `@uts.edu.co` y verificación del correo. Docentes y administrativos: `@correo.uts.edu.co`; los docentes los crea el CAE con clave temporal.
- **Motivo:** Garantizar que solo personal y estudiantes de la UTS usen la app.

### D-010 · Idiomas: español e inglés, según el dispositivo
- **Estado:** Aceptada
- **Decisión:** La app sigue el idioma del dispositivo; si no es español ni inglés, usa español.
- **Supuesto asociado:** el respaldo en español es una decisión del equipo de desarrollo, no confirmada por la institución.

### D-011 · Estudiante puede escribir primero al docente
- **Estado:** Aceptada
- **Decisión:** El estudiante puede iniciar una conversación con el docente de un módulo en el que está inscrito.

### D-012 · Retención de chats: 6 meses (módulo) y 2 años (individuales)
- **Estado:** Aceptada
- **Decisión:** Mensajes de módulo se eliminan a los 6 meses; chats individuales a los 2 años, mediante un job programado.
- **Motivo:** 6 meses cubren un semestre; los chats individuales pueden servir como evidencia por más tiempo.

### D-013 · Una sola institución
- **Estado:** Aceptada
- **Decisión:** La app es solo para la UTS por ahora; no hay soporte multi-sede ni multi-institución.

### D-014 · Alcance de los cambios del docente y de la cancelación del estudiante
- **Estado:** Supuesto
- **Decisión asumida:** Los cambios del docente afectan solo la sesión de esa semana. La cancelación del estudiante cancela su inscripción al módulo.
- **Pendiente:** Confirmar con el CAE (ver `Context.md`, sección 10).

---

## Técnicas

### D-020 · React Native con Expo
- **Estado:** Aceptada
- **Decisión:** App móvil en React Native + Expo (TypeScript).
- **Motivo:** Una base de código para Android e iOS y buena experiencia de desarrollo.
- **Descartado:** Flutter (tampoco habría resuelto la limitación de iOS en Windows).

### D-021 · Backend con NestJS, PostgreSQL y Prisma
- **Estado:** Aceptada
- **Decisión:** API en NestJS (TypeScript) con PostgreSQL y Prisma.
- **Motivo:** Datos muy relacionales (periodos, módulos, salones, inscripciones) y soporte de tiempo real integrado.
- **Descartado:** Bases NoSQL.

### D-022 · Autenticación con JWT y roles
- **Estado:** Aceptada
- **Decisión:** Access token de vida corta y refresh token rotativo, guardados en `expo-secure-store`. Los permisos se validan con guards de roles en el backend.

### D-023 · Chat en tiempo real con Socket.IO
- **Estado:** Aceptada
- **Decisión:** Mensajería en tiempo real con WebSockets (Socket.IO). Si el destinatario está desconectado, recibe push.
- **Descartado:** Bandeja de mensajes sin tiempo real.

### D-024 · Notificaciones por tres canales con cola
- **Estado:** Aceptada
- **Decisión:** Cada notificación se guarda en la app y se envía por push (Expo Push) y correo (SMTP configurado por el CAE). El envío pasa por una cola (BullMQ + Redis).
- **Motivo:** No frenar la API y poder reintentar envíos fallidos.

### D-025 · Borrado lógico en todo el sistema
- **Estado:** Aceptada
- **Decisión:** Nada se elimina físicamente (salvo la retención de chats); se usa `deletedAt`.

### D-026 · Fechas en UTC, mostradas en America/Bogota
- **Estado:** Aceptada
- **Decisión:** La base de datos guarda UTC. Los horarios semanales se definen en hora local de Bogotá y se convierten al generar las sesiones.

### D-027 · Reglas de negocio validadas siempre en el backend
- **Estado:** Aceptada
- **Decisión:** La app puede mostrar ayudas, pero el backend es la única barrera. La inscripción usa transacción con bloqueo para evitar sobrecupo.

### D-028 · Clave SMTP cifrada
- **Estado:** Aceptada
- **Decisión:** La contraseña SMTP se guarda cifrada (AES-256-GCM); la clave de cifrado vive en variables de entorno.

### D-029 · Demo en iOS desde Windows
- **Estado:** Aceptada
- **Decisión:** Ejecutar iOS requiere macOS y Xcode, por lo que la demo usa un iPhone físico con Expo Go; alternativas: EAS Build con Appetize.io o un Mac en la nube. Android se prueba con el emulador de Android Studio.

---

## Diseño

### D-040 · Paleta basada en el verde institucional UTS
- **Estado:** Aceptada
- **Decisión:** Primario `#34531F`, hover `#132F20`, acento lima `#C3D730`. El lima solo se usa en resaltes y fondos oscuros.
- **Motivo:** El lima del logo tiene contraste de 1.6:1 sobre blanco y no sirve para botones ni texto.
- **Pendiente:** Confirmar los valores con el manual de marca vigente de la UTS (el consultado parece ser una versión anterior).

### D-041 · Tipografía Roboto
- **Estado:** Reemplazada por D-051
- **Decisión:** Roboto en toda la app.
- **Motivo:** Es gratuita y funciona bien en móvil. La fuente institucional (Myriad Pro) no está disponible en Google Fonts.

### D-042 · Navegación por pestañas inferiores según el rol
- **Estado:** Aceptada
- **Decisión:** Estudiante: Inicio, Módulos, Cronograma, Mensajes, PQRS. Docente: Dashboard, Cronograma, Mensajes, PQRS. CAE: Dashboard, Módulos, Mensajes, PQRS, Más (Docentes, Estudiantes, Configuración).

### D-043 · Pantalla de inicio para el estudiante
- **Estado:** Aceptada
- **Decisión:** Se agrega una pantalla de inicio sencilla para el estudiante, que no estaba en el alcance original.

### D-044 · Íconos: Iconify obligatorio con el set Solar
- **Estado:** Aceptada
- **Decisión:** Todos los íconos de la app vienen de Iconify, con el set `solar` (estilo `linear`, y `bold` para el estado activo). Paquete: `react-native-iconify`. Los íconos se declaran en un registro único.
- **Motivo:** Consistencia visual y acceso a un catálogo enorme. `react-native-iconify` es JavaScript más `react-native-svg`, por lo que funciona en Expo Go (ver D-029).
- **Descartado:** `@expo/vector-icons`, Lucide y otras librerías; `@huymobile/react-native-iconify`, porque exige un build de desarrollo y no funciona en Expo Go.

### D-045 · Todos los botones llevan ícono y separación de 16 px
- **Estado:** Aceptada
- **Decisión:** Todo botón tiene un ícono a la izquierda (excepto enlaces de texto y botones solo de ícono). Entre botones apilados, como en el inicio de sesión, hay 16 px.
- **Motivo:** Mejor reconocimiento visual y evitar toques equivocados por botones pegados.

### D-046 · Estilo visual moderno y fluido
- **Estado:** Aceptada
- **Reemplaza:** la regla anterior de tarjetas planas con borde y sin sombra.
- **Decisión:** Tarjetas con sombra suave teñida de verde, radios de 16 a 24 px, fondo de pantalla `#F2F4EF` con tarjetas blancas, degradado de marca en cabeceras y tarjetas destacadas, y micro-animaciones con Reanimated que respetan "reducir movimiento".
- **Motivo:** Una apariencia actual y agradable, sin sacrificar rendimiento ni accesibilidad.

### D-047 · Elementos visuales de la universidad
- **Estado:** Aceptada
- **Decisión:** El logo oficial y los recursos de marca de la UTS se usan sin modificar, en splash, login, perfil y correos. Los demás elementos usan la paleta institucional.
- **Pendiente:** La universidad debe entregar los archivos oficiales (logo a color, logo blanco, símbolo) y confirmar las reglas de uso del manual vigente. Con el cambio de carácter académico es posible que el logo y la paleta se actualicen: confirmar antes de publicar.

### D-048 · Nuevo nombre de la institución
- **Estado:** Aceptada
- **Decisión:** La institución se llama **Institución Universitaria Tecnológica de Santander – UTS** (Resolución MEN 019103 del 23 de julio de 2026); en textos cortos, "UTS". La app sigue llamándose "UTS Tutorías". El nombre anterior ("Unidades Tecnológicas de Santander") no se usa en la app.
- **Motivo:** La institución cambió su carácter académico y conserva la sigla.
- **Pendiente:** Confirmar si los dominios de correo (`@uts.edu.co`, `@correo.uts.edu.co`) y el manual de identidad cambian con el Plan de Transición de la universidad.

### D-049 · Patrón de marca con hojas, plumas y libros
- **Estado:** Aceptada
- **Decisión:** La decoración de las pantallas de acceso, el splash y las tarjetas destacadas usa un patrón de íconos de hoja, pluma y libro (inspirados en los elementos del escudo), con el componente `BrandPattern`. Se permite el set `mdi` solo para estos íconos decorativos si `solar` no tiene equivalente.
- **Motivo:** Dar identidad institucional sin figuras geométricas genéricas y sin reproducir ni alterar el escudo oficial.
- **Descartado:** Círculos y arcos decorativos; usar el escudo como textura.

### D-050 · Campos de texto con relleno y borde tenue
- **Estado:** Aceptada
- **Decisión:** Todo campo tiene relleno (#F2F4EF sobre tarjeta blanca, blanco sobre fondo de pantalla) y borde de 1 px #C9D0C3, con ícono a la izquierda. En foco, borde de 2 px #4E7A2F con halo suave.
- **Motivo:** Que se reconozcan claramente como campos editables.
- **Nota:** El borde es tenue a propósito (aprox. 1.6:1); si se exige contraste estricto de 3:1, usar #8C968A.

### D-051 · Tipografía corporativa Myriad Pro
- **Estado:** Aceptada
- **Reemplaza:** D-041 (Roboto).
- **Decisión:** La app usa **Myriad Pro** (Regular, Semibold y Bold), la fuente institucional de la UTS, y **Source Code Pro** para código. Los nombres de fuente viven solo en los tokens `fonts` del tema. El peso medio (500) pasa a Semibold (600) y los tamaños suben 1 px porque Myriad Pro es más estrecha.
- **Motivo:** Coherencia con la identidad de la universidad.
- **Pendiente:** Myriad Pro es una fuente comercial. La universidad debe entregar los archivos con una licencia que cubra su uso dentro de una app móvil. Mientras tanto se usa **Source Sans 3** (gratuita) con los mismos tokens.
- **Implementación (spec 005):** Hoy corre con Source Sans 3 (400, 600, 700) y Source Code Pro (400). Los nombres de fuente y los archivos que carga la app viven solo en `src/theme/fonts.ts`; para pasar a Myriad Pro se agregan los archivos con licencia en `assets/fonts/` y se cambian los valores de `fontAssets` en ese archivo. El splash se mantiene hasta que cargan las fuentes, con un máximo de 5 s (`FONT_LOAD_TIMEOUT_MS`); si falla o se agota, la app sigue con la fuente del sistema.
- **Descartado:** Cargar Myriad Pro desde Adobe Fonts (no está pensado para incrustarse en apps móviles) y copiarla desde un equipo sin confirmar la licencia.

---

## Proceso

### D-060 · Desarrollo guiado por especificaciones con Spec Kit
- **Estado:** Aceptada
- **Decisión:** Cada funcionalidad sigue el ciclo specify, clarify, plan, tasks, implement, con una rama de Git por funcionalidad.
- **Motivo:** Reducir ambigüedad antes de programar y dar trazabilidad a cada cambio.

### D-061 · `docs/` es la fuente de verdad
- **Estado:** Aceptada
- **Decisión:** Context, Architecture, Design, Conventions y Decisions definen el proyecto. Si algo falta o se contradice, se pregunta antes de decidir y se actualiza el documento.

### D-062 · Idioma: documentación en español, código en inglés
- **Estado:** Aceptada
- **Decisión:** Documentación y comunicación en español; código, ramas y commits en inglés.

### D-063 · Commits con Conventional Commits
- **Estado:** Aceptada
- **Decisión:** Formato `type(scope): description`, con ramas `NNN-feature-name` generadas por Spec Kit.

### D-069 · Cambios del docente afectan a las sesiones futuras
- **Estado:** Aceptada
- **Decisión:** Cuando el docente cambia la hora o cancela, el cambio aplica a la sesión elegida y a todas las sesiones futuras del módulo (las ya dictadas no cambian). Se valida disponibilidad de salón y cruces en todas las sesiones afectadas, se respeta la ventana de 2 horas respecto de la primera sesión afectada y se notifica una sola vez a los inscritos.
- **Motivo:** Respuesta del equipo a la pregunta abierta de `Context.md` §10; refleja que un módulo se repite semanalmente.
- **Descartado:** Afectar solo una sesión (obligaría a repetir la acción cada semana).

### D-070 · El estudiante elige el alcance de su cancelación
- **Estado:** Aceptada
- **Decisión:** Al cancelar (hasta 1 hora antes de la sesión), el estudiante elige entre cancelar solo esa sesión o cancelar su inscripción al módulo completo. Cancelar una sesión libera el cupo solo para esa sesión y no lo bloquea de volver a asistir a las siguientes. Cancelar el módulo permite reinscribirse mientras haya cupo.
- **Motivo:** Respuesta del equipo a la pregunta abierta de `Context.md` §10.
- **Pendiente:** Definir en la spec de inscripción cómo se calcula el cupo cuando hay cancelaciones por sesión.

### D-071 · Estados del periodo: activación manual, cierre manual o automático
- **Estado:** Aceptada
- **Decisión:** Todo periodo nace Próximo. El CAE lo activa a mano (con confirmación si hay otro activo, que se cierra en la misma operación). El activo se cierra a mano o solo cuando termina su fecha de fin en `America/Bogota`. Un periodo cerrado no se reabre y no se puede activar uno cuya fecha de fin ya pasó.
- **Motivo:** Respuesta del equipo en la clarificación de la spec 006: el CAE controla cuándo empieza un semestre, pero nadie debe recordar cerrarlo.
- **Descartado:** Estado derivado solo de las fechas (quita el control al CAE); cierre solo manual (periodos vencidos seguirían activos).

### D-072 · Un solo periodo activo y sin solapamientos, garantizados en la base de datos
- **Estado:** Aceptada
- **Decisión:** Un índice único parcial impide dos periodos activos y una restricción de exclusión sobre el rango de fechas impide solapamientos (un fin igual a un inicio cuenta como solapamiento), ambos sobre registros no borrados. El servicio valida antes para dar un error claro.
- **Motivo:** El criterio de éxito exige que sea imposible, incluso con peticiones simultáneas.
- **Descartado:** Validar solo en el servicio (una carrera entre dos peticiones puede romper la regla).

### D-073 · Listas desplegables predefinidas por el sistema
- **Estado:** Aceptada
- **Decisión:** Las listas (ej. `PQRS_TYPE`) las crean las migraciones porque cada una se conecta a un selector concreto. El CAE solo administra sus elementos: crear, editar, reordenar, desactivar y eliminar (lógico). Un elemento en uso solo se desactiva. Los selectores reciben solo los elementos activos, en orden, con ambas etiquetas, y la app elige según el idioma del dispositivo.
- **Motivo:** Una lista sin selector no tendría efecto visible; las nuevas se agregan con la funcionalidad que las use.
- **Descartado:** Que el CAE cree o renombre listas.

### D-074 · Desactivar un salón con módulos solo en periodos próximos
- **Estado:** Aceptada
- **Decisión:** Solo los módulos del periodo activo bloquean desactivar o eliminar un salón. Si tiene módulos en periodos Próximos, se permite y la app avisa cuántos quedan con un salón inactivo para que el CAE los reasigne.
- **Motivo:** Respeta la regla original del CAE sin atraparlo; los módulos futuros se corrigen cambiando su salón.
- **Descartado:** Bloquear por cualquier periodo no cerrado; dejar los módulos sin salón.

### D-075 · Eliminar una ubicación elimina sus salones inactivos
- **Estado:** Aceptada
- **Decisión:** Una ubicación sin salones activos se puede eliminar; sus salones inactivos se eliminan (lógico) en la misma acción, tras confirmar y mostrando cuántos son. Si alguno de ellos tiene módulos en el periodo activo, la acción se bloquea.
- **Motivo:** Evita salones huérfanos y conserva el historial con borrado lógico.
- **Descartado:** Exigir eliminar los salones uno por uno; dejarlos sin ubicación.

### D-076 · Solo se eliminan periodos Próximos sin módulos
- **Estado:** Aceptada
- **Decisión:** Los periodos Activos y Cerrados no se eliminan; un periodo Próximo se elimina (lógico) solo si no tiene módulos. En un periodo Próximo o Activo solo se editan el nombre y las fechas.
- **Motivo:** Un periodo cerrado es historial; los periodos vacíos creados por error se pueden quitar mientras estén Próximos.
- **Descartado:** Permitir eliminar periodos cerrados sin módulos.

### D-077 · El código vive en tres repositorios hermanos
- **Estado:** Aceptada
- **Decisión:** `tutorias_uts_mobile` (app Expo), `tutorias_uts_back` (API NestJS) y `tutorias_uts_db` (esquema Prisma, migraciones, seed y `docker-compose.yml`) son repositorios separados; `Claude` guarda `docs/`, `specs/` y `CLAUDE.md`. El esquema se edita solo en `tutorias_uts_db` y el backend lo copia con `scripts/sync-schema.mjs` para generar su cliente. En `docs/` y `specs/`, `mobile/` y `backend/` nombran la raíz de `tutorias_uts_mobile` y `tutorias_uts_back`; las rutas de `backend/prisma/` y `docker-compose.yml` corresponden a `tutorias_uts_db`. Cubre lo que `specs/001-auth-roles/tasks.md` cita como D-064, que no estaba escrito aquí.
- **Motivo:** Es la estructura real del trabajo; documentarla evita que las specs y las guías apunten a carpetas que no existen.
- **Descartado:** Un solo repositorio con carpetas `backend/` y `mobile/`.

---

## Plantilla para nuevas decisiones

```markdown
### D-0XX · Título corto
- **Estado:** Aceptada | Supuesto | Reemplazada por D-0YY
- **Decisión:** Qué se decidió.
- **Motivo:** Por qué.
- **Descartado:** Alternativas y por qué no.
```
