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
- **Nota (D-078):** los mismos íconos de hoja, pluma y libro se usan también, de forma funcional y no decorativa, en el loader de la marca (`BrandLoader`); siguen saliendo del registro de íconos y la regla del set `mdi` no cambia.
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

### D-101 · El loader de pantalla completa va centrado
- **Estado:** Aceptada
- **Decisión:** Una pantalla que aún no tiene datos y no muestra nada más devuelve `LoadingScreen` (fondo de pantalla, `BrandLoader` regular centrado en ambos ejes) y no un `BrandLoader` suelto. Un `BrandLoader` dentro de una pantalla ya armada (bajo un título o en una lista) sigue centrado en horizontal dentro de su área.
- **Motivo:** El loader suelto quedaba pegado arriba de pantallas como Correo (SMTP); `LoadingScreen` ya centraba y no exige un componente ni una propiedad nuevos.
- **Descartado:** Una propiedad `fill` en `BrandLoader` (duplica a `LoadingScreen`); centrar siempre con `flex: 1` (dentro de un `ScrollView` no tiene alto que repartir).

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
- **Decisión:** Cuando el docente cambia la hora o cancela, **elige** si el cambio aplica solo a la sesión elegida o a ella y a las futuras de su mismo horario semanal (las ya dictadas no cambian); ajustada el 2026-11-17 en la spec 012, que antes fijaba siempre "ella y todas las futuras del módulo". Se valida disponibilidad de salón y cruces en todas las sesiones afectadas, se respeta la ventana de 2 horas respecto de la primera sesión afectada y se notifica una sola vez a los inscritos.
- **Motivo:** Respuesta del equipo a la pregunta abierta de `Context.md` §10; refleja que un módulo se repite semanalmente.
- **Descartado:** Afectar solo una sesión (obligaría a repetir la acción cada semana).

### D-070 · El estudiante elige el alcance de su cancelación
- **Estado:** Aceptada
- **Decisión:** Al cancelar (hasta 1 hora antes de la sesión), el estudiante elige entre cancelar solo esa sesión o cancelar su inscripción al módulo completo. Cancelar una sesión libera el cupo solo para esa sesión y no lo bloquea de volver a asistir a las siguientes. Cancelar el módulo permite reinscribirse mientras haya cupo.
- **Motivo:** Respuesta del equipo a la pregunta abierta de `Context.md` §10.
- **Pendiente:** Resuelto en D-090 (el cupo se mide por sesión).

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

### D-078 · Loader propio de la marca: un ícono por iteración y fases de espera
- **Estado:** Implementada (spec 007); en parte reemplazada por D-080 (anillo giratorio; ya no se prohíben los círculos para el loader) y por D-082 (tamaño de los íconos, sin sacudida)
- **Decisión:** Los indicadores de carga de la app son el componente `BrandLoader`: un solo ícono de la marca a la vez que cambia en cada iteración en el orden libro → pluma → hoja → libro (los mismos íconos de `BrandPattern`, ver D-049). Cada iteración dura 900 ms (aparece 250, se sostiene 400, se desvanece 250) y solo usa fundidos; con "reducir movimiento" el ícono cambia sin animación. En pantallas y áreas de contenido se muestra por fases: de 0 a 300 ms nada, de 300 a 1000 ms el loader, y pasados 1000 ms se agrega el aviso "Cargando… Esto está tardando más de lo normal."; solo aparece en la primera carga, no en actualizaciones en segundo plano. Los botones en carga muestran el loader compacto (20 px) de inmediato y sin aviso. Reemplaza al `ActivityIndicator`; las listas y tarjetas pueden seguir usando skeletons. No dibuja círculos ni arcos.
- **Motivo:** Pedido del equipo tras probar en el emulador: el spinner del sistema se ve ajeno a la identidad institucional, y `Design.md` ya prohíbe la decoración geométrica. Un ícono que rota entre libro, pluma y hoja lo hace único. Las fases evitan destellos en cargas rápidas y avisan cuando una carga se demora.
- **Descartado:** Mantener el spinner del sistema; un spinner circular propio (sería una figura geométrica); mostrar los tres íconos a la vez; mostrar el loader siempre de inmediato (parpadea en cargas rápidas).

### D-079 · Fechas de calendario: se eligen y se muestran como dd/mm/YYYY
- **Estado:** Aceptada e implementada (spec 008)
- **Decisión:** Los campos de día de calendario (inicio y fin de un periodo) se eligen en un selector de fecha del sistema (`@react-native-community/datetimepicker`, compatible con Expo Go) detrás del componente `DateField`; no se escriben a mano. Se muestran como dd/mm/YYYY en español e inglés, también en los listados. El valor interno y el de la API siguen siendo `YYYY-MM-DD`, sin conversión de zona horaria. El selector bloquea fechas que rompen una regla (la fecha de fin debe ser posterior a la de inicio) y el servidor sigue validando.
- **Motivo:** Pedido del equipo tras probar en el emulador: escribir `AAAA-MM-DD` es incómodo y propenso a errores. Sustituye al campo de texto de la tarea T023 y a la nota R-8 de la spec 006.
- **Descartado:** Campo de texto con formato dd/mm/YYYY (admite fechas mal escritas); formato según el idioma del dispositivo (se pidió un formato fijo).

### D-080 · Loader v2: anillo giratorio (la sacudida quedó descartada en D-082)
- **Estado:** Implementada (spec 009); la salida animada y el caso de quitar el loader a mitad de la entrada se validan en el emulador (T023)
- **Decisión:** El `BrandLoader` rodea el ícono con un anillo giratorio (pista tenue más un arco de 90° que da una vuelta por segundo; 64 px en el tamaño regular y 28 px en el compacto) y el conjunto aparece y desaparece con un fundido de 150 ms (en D-080 era una sacudida lateral; descartada en D-082). Con "reducir movimiento" no hay giro: el anillo queda fijo y su arco pulsa, el ícono cambia sin fundido y la entrada y la salida son un fundido de 150 ms. La secuencia libro → pluma → hoja, las fases de espera y el aviso de demora de D-078 se mantienen.
- **Motivo:** Pedido del equipo tras probar el loader en el emulador: hace falta una señal visual clara de que la app está trabajando y una entrada y salida más suaves. Esto revierte la parte de D-078 que prohibía círculos y arcos: el anillo es retroalimentación funcional, no decoración, así que no contradice la regla de `Design.md` contra la decoración geométrica y queda como su única excepción.
- **Descartado:** Puntos orbitando alrededor del ícono; tres puntos pulsantes debajo; rebote de escala o giro leve como animación de entrada y salida.

### D-081 · Días de calendario con utilidades propias, sin librería de fechas
- **Estado:** Aceptada e implementada (spec 008)
- **Decisión:** Los días de calendario (sin hora) son texto `YYYY-MM-DD` y se manejan con un único módulo, `src/date/day.ts` (`isValidDay`, `parseDay`, `formatDay`, `toDay`, `dayToDate`, `addDays`, `compareDays`, `todayInBogota`). No se agrega dayjs, date-fns ni otra librería de fechas. Al selector del sistema se le entrega un `Date` a mediodía local y de él se leen solo el año, el mes y el día locales. "Hoy" se calcula en `America/Bogota`. En iOS el selector va en una hoja inferior propia (`DatePickerSheet`) con Confirmar y Cancelar, porque el selector del sistema no tiene botones y sin ellos no se podría cancelar conservando el valor.
- **Motivo:** El día de calendario no tiene hora ni zona; tratarlo como texto evita los corrimientos de un día por zona horaria o cambio de horario. Solo se necesitan ocho funciones pequeñas y probadas (en tres zonas horarias), que no justifican una dependencia. Cumple la regla de `Conventions.md` de tener una sola vía de fechas.
- **Descartado:** dayjs o date-fns (dependencia para pocas operaciones); `Date` en UTC o `toISOString().slice(0, 10)` (dan el día UTC, que cerca de la medianoche no es el elegido); selector en línea dentro del formulario (ocupa pantalla); aplicar el valor al girar la rueda de iOS (no habría cómo cancelar).

### D-082 · Loader v3: íconos más pequeños que crecen y se reducen, sin sacudida
- **Estado:** Aceptada e implementada (ajuste de la spec 009)
- **Decisión:** El ícono del `BrandLoader` mide 32 px (regular) y 14 px (compacto) dentro del anillo de 64 px y 28 px, para que no choque con el anillo ni con el mensaje. Cada ícono, dentro de su iteración de 900 ms, **crece de 50 % a 100 %** durante los 250 ms de entrada y **se reduce de 100 % a 50 %** durante los 250 ms de salida, siempre centrado. **No hay sacudida lateral en ninguna parte**: se elimina la del conjunto de D-080 y se descarta la de cada ícono que se probó antes. El conjunto (ícono, anillo y mensaje) aparece y se va con un fundido de 150 ms. Con "reducir movimiento" no hay cambio de tamaño ni giro. Modifica D-080 (sin sacudida) y los tamaños de ícono de D-078.
- **Motivo:** Pedido del equipo tras probar D-080: los íconos de 48 px chocaban con el anillo y el mensaje, y la sacudida no gustó (primero la del conjunto, luego la de cada ícono).
- **Descartado:** Sacudida del conjunto (D-080); sacudida de cada ícono mientras cambia de tamaño; íconos de 40 px (siguen rozando el anillo).

### D-083 · Calendario de festivos del CAE con importación opcional desde Nager.Date
- **Estado:** Aceptada e implementada (spec 010)
- **Decisión:** El CAE administra un calendario de festivos global (fecha única, nombre y origen manual o importado). La generación de sesiones omite esas fechas; al registrar un festivo las sesiones futuras de la fecha quedan canceladas con motivo "festivo" y al eliminarlo se restauran o se generan. El CAE puede importar los festivos de un año desde `https://date.nager.at/api/v3/PublicHolidays/{año}/CO`: el servidor consulta el servicio (límite de 10 s, URL y país en configuración), valida la respuesta, muestra una vista previa y, al confirmar, vuelve a consultar y guarda solo las fechas confirmadas. Solo sale hacia el servicio el año y el país. Si falla, el calendario manual sigue funcionando y no se guarda nada parcial. No se registran, editan, eliminan ni importan festivos con fecha anterior a hoy (Bogotá), y los festivos no modifican sesiones de módulos de periodos Cerrados, que son de solo lectura.
- **Motivo:** Pedido del equipo: evitar sesiones en días sin clase sin que el CAE tenga que digitar cada festivo. Guardar los festivos localmente hace que generar sesiones no dependa de un servicio de terceros. Cierra la pregunta abierta de festivos.
- **Descartado:** No excluir nada y cancelar a mano (el CAE cancelaría decenas de sesiones por periodo); semanas sin tutoría por periodo (amplía la spec 006); consultar el servicio desde la app o en cada generación (dependencia en línea y sin validación en servidor); lista fija en el repositorio (los festivos cambian cada año).

### D-084 · Varios horarios por módulo; el CAE solo los cambia sin inscritos
- **Estado:** Aceptada e implementada (spec 010)
- **Decisión:** Un módulo puede tener varios horarios semanales. El CAE solo cambia los horarios de un módulo sin inscritos activos (se regeneran las sesiones futuras) y solo elimina módulos sin inscritos. Con inscritos, la hora de una sesión o de las futuras la cambia el docente (spec 012), que valida disponibilidad y avisa. Cambiar nombre, descripción, docente o salón se permite siempre que el periodo no esté Cerrado.
- **Motivo:** El CAE no tiene la validación de cruces con los horarios de los estudiantes inscritos (pregunta de reprogramación aún abierta); limitar el cambio a módulos sin inscritos evita dejar a alguien con un cruce o sin aviso. `Architecture.md` ya preveía varios horarios.
- **Descartado:** Que el CAE cambie horarios con inscritos y notifique (sin validar cruces de estudiantes); un solo horario por módulo (obliga a crear dos módulos para martes y jueves).

### D-085 · Cruces de docente y salón impedidos por restricciones de exclusión
- **Estado:** Aceptada e implementada (spec 010)
- **Decisión:** `module_schedules` guarda copias de `period_id`, `teacher_id` y `room_id` y tiene tres restricciones de exclusión (`btree_gist`) sobre el día y el rango de minutos semiabierto `[inicio, fin)`: por docente, por salón y por módulo, solo entre filas no borradas. El servicio valida antes para devolver el módulo con el que choca. El horario se guarda como minutos desde la medianoche de Bogotá (`startMinute`, `endMinute`), la API lo expone como `HH:mm`, y no puede cruzar la medianoche. Toda escritura de módulos bloquea con `FOR SHARE` la fila del periodo y se rechaza si está `CLOSED`.
- **Motivo:** La regla de no cruce debe ser imposible de violar aunque dos peticiones lleguen a la vez, igual que en D-072. Los minutos permiten una exclusión sin expresiones y el `CHECK` impide horarios que crucen el día.
- **Descartado:** Solo validar en el servicio (carreras); restricción sobre sesiones (no cubre horarios sin sesiones y exige miles de filas); `TIME` en vez de minutos (conversiones propensas a errores con Prisma).

### D-086 · La sesión guarda el docente y el salón con que se dicta
- **Estado:** Aceptada e implementada (spec 010)
- **Decisión:** Cada `ModuleSession` guarda `teacherId` y `roomId`. Cambiar el docente o el salón de un módulo solo actualiza las sesiones con inicio futuro; las pasadas conservan los suyos. El cupo se lee siempre de la capacidad del salón actual del módulo.
- **Motivo:** Historial fiel de quién dictó cada sesión y dónde, y la reprogramación del docente (spec 012) lee el salón y el docente de la sesión.
- **Descartado:** Sesiones que heredan docente y salón del módulo (reasignar reescribiría el pasado).

### D-087 · Eventos de módulo en una tabla de eventos para las notificaciones
- **Estado:** Aceptada e implementada (spec 010). La spec 012 agrega los tipos `SESSION_RESCHEDULED`, `SESSION_CANCELLED_TEACHER` y `SESSION_RESTORED_TEACHER`. La spec 011 (inscripción) ya está implementada y no agrega eventos: las notificaciones leen las inscripciones y las ausencias. **Condición cumplida con la spec 014** (2026-11-18): el consumidor del outbox crea los avisos y los entrega (D-098 a D-100); la inscripción puede publicarse cuando esa spec esté en producción.
- **Decisión:** Los cambios de docente, de salón y de festivo escriben un registro en `outbox_events` (tipo, módulo, datos mínimos sin información personal) en la misma transacción que el cambio. La funcionalidad de notificaciones (spec 014) los lee, avisa a los inscritos y los marca como procesados. La spec 010 no envía notificaciones. **Condición:** la inscripción (spec 011) no se publica sin las notificaciones (spec 014) o sin un consumidor del outbox, para que ningún inscrito quede sin aviso (Principio II de la constitución); hasta la 011 no hay inscritos.
- **Motivo:** La regla "todo cambio notifica a los inscritos" no se puede cumplir antes de que exista el canal, pero el cambio y su registro deben ser atómicos para que nada se pierda.
- **Descartado:** Eventos en memoria (se pierden al reiniciar); encolar ya en BullMQ (el canal y las plantillas son de la spec 014); no registrar nada hasta la spec 014 (los cambios hechos antes no avisarían a nadie).

### D-088 · Docente o salón que deja de estar disponible: se marca, no se bloquea
- **Estado:** Aceptada e implementada (spec 010; confirmada por el equipo el 2026-11-17)
- **Decisión:** Si el docente o el salón de un módulo se desactiva, se elimina o pierde el rol después de asignarse, el módulo no cambia: el listado y el detalle lo marcan como "docente no disponible" o "salón no disponible" (`teacherUnavailable`, `roomUnavailable`) y sus sesiones futuras se conservan hasta que el CAE lo reasigne. No se bloquea la desactivación del docente.
- **Motivo:** Las reglas de salones de la spec 006 ya cubren los casos que dejarían clases sin salón en el periodo activo; para el docente, bloquear su baja amplía la spec 001 y puede impedir desactivar cuentas que deben cerrarse de inmediato. Marcarlo da al CAE lo que necesita para reasignar.
- **Descartado:** Impedir desactivar a un docente con módulos en el periodo activo; reasignar o cancelar sus sesiones automáticamente (decidir por el CAE).

### D-089 · Horario de los módulos: de 6:00 a. m. a 6:00 p. m.
- **Estado:** Aceptada e implementada (spec 010; pedida por el equipo el 2026-11-17)
- **Decisión:** Un horario semanal de módulo no puede empezar antes de las 06:00 ni terminar después de las 18:00 (hora de Bogotá; terminar a las 18:00 en punto sí se permite). El backend lo valida al crear el módulo y al reemplazar horarios y responde `422 MODULE_SCHEDULE_OUT_OF_HOURS` con `details.earliest` y `details.latest`. Los límites son configuración (`MODULE_EARLIEST_TIME` y `MODULE_LATEST_TIME`, por defecto `06:00` y `18:00`); la app solo ofrece horas dentro de esa ventana y repite la regla en el formulario.
- **Motivo:** La institución dicta tutorías en horario diurno; sin límite se podían crear módulos de madrugada o de noche, y los límites de horas no se escriben fijos en el código (CLAUDE.md).
- **Descartado:** Límite solo en la app (el servidor es quien aplica las reglas); límite fijo en el código; reutilizar `MODULE_SCHEDULE_INVALID` (no diría al CAE cuál es la ventana permitida).

### D-090 · Cupo por sesión
- **Estado:** Aceptada e implementada (spec 011; aclarada por el equipo el 2026-11-17)
- **Decisión:** El cupo se mide por sesión: la capacidad es la del salón de la sesión y los asistentes son los estudiantes activos con una inscripción ACTIVE (o cancelada cuyo `effectiveUntil` es posterior al inicio de la sesión) sin una ausencia viva en ella. Una cancelación suelta libera el lugar de esa sesión; un módulo está lleno si alguna sesión futura lo está y solo se permite inscribirse si todas tienen al menos un lugar. La app muestra `ocupados/capacidad` con `ocupados = capacidad − cupos disponibles` (la sesión más llena). La regla del cambio de salón sigue contando inscritos activos (Principio II de la constitución).
- **Motivo:** Cierra el pendiente de D-070: sin esta medida, una cancelación suelta liberaría un lugar que otro estudiante ocuparía para todas las sesiones y se pasaría de la capacidad en las demás.
- **Descartado:** Cupo por módulo contando inscripciones (una cancelación suelta no liberaría nada); cambiar la regla del cambio de salón a "asistentes de la sesión más llena" (exigía enmendar la constitución).

### D-091 · Cancelar el módulo aplica desde la primera sesión a más de 1 hora
- **Estado:** Aceptada e implementada (spec 011; pedida por el equipo el 2026-11-17)
- **Decisión:** El estudiante puede cancelar el módulo completo en cualquier momento. La inscripción pasa a CANCELLED con `cancelledAt` y `effectiveUntil = cancelledAt + STUDENT_CANCEL_LEAD_MINUTES` (1 hora por defecto, en configuración); las sesiones que empiezan antes de `effectiveUntil` conservan al estudiante como asistente y las demás quedan libres.
- **Motivo:** Respeta la regla de 1 hora sin impedir que el estudiante cancele el módulo cuando la próxima sesión es inminente.
- **Descartado:** Bloquear la cancelación del módulo si alguna sesión empieza en menos de 1 hora (deja al estudiante inscrito en sesiones lejanas que ya no quiere); liberar todo al instante (rompe la regla de 1 hora de la sesión inminente).

### D-092 · Orden de bloqueo y respaldo de la inscripción
- **Estado:** Aceptada e implementada (spec 011)
- **Decisión:** La inscripción corre en una transacción que bloquea, siempre en este orden, el periodo (`FOR SHARE`), la fila del estudiante y el módulo (`FOR UPDATE`); cancelar el módulo o una sesión bloquea periodo y módulo, y editar la capacidad de un salón bloquea sus módulos ordenados por `id` antes de leer los inscritos. Índices únicos parciales (`enrollments_one_active`, `session_absences_one_live`) y un `CHECK` de fechas respaldan las reglas en la base de datos.
- **Motivo:** Dos inscripciones del mismo estudiante se serializan en su fila (sin cruces simultáneos), dos al mismo módulo en la del módulo (sin sobrecupo), y un orden fijo evita interbloqueos.
- **Descartado:** Solo bloquear el módulo (dos módulos que se cruzan podían inscribirse a la vez); nivel de aislamiento serializable (reintentos y errores difíciles de explicar).

### D-093 · Reprogramar o reactivar se rechaza si un inscrito se cruza
- **Estado:** Aceptada e implementada (spec 012; elegida por el equipo el 2026-11-17)
- **Decisión:** Al reprogramar o reactivar una sesión, el sistema cuenta los asistentes de esa sesión (inscripción vigente, cuenta activa, sin ausencia en ella) que ya asisten a otra sesión de otro módulo a la nueva hora. Si hay alguno, rechaza con `SESSION_STUDENT_CONFLICT` y la cantidad, sin revelar quiénes son (Principio IV). Resuelve la pregunta abierta de `Context.md` §10.
- **Motivo:** Evita dejar estudiantes con dos tutorías a la vez; el docente no necesita saber quiénes, solo cuántos.
- **Descartado:** Solo avisar y dejar pasar (el estudiante resuelve solo); no validar (puede dejar dos tutorías a la vez).

### D-094 · Reprogramar solo dentro de la misma semana
- **Estado:** Aceptada e implementada (spec 012; elegida por el equipo el 2026-11-17)
- **Decisión:** El docente mueve una sesión a otro día y hora de su misma semana (lunes a domingo, hora de Bogotá), en el horario permitido (D-089), sin festivos y dentro del periodo. Para ausentarse más tiempo, cancela. Con "esta y las futuras", cada sesión se desplaza lo mismo dentro de su propia semana y se rechaza toda la serie si alguna falla.
- **Motivo:** Acota la validación y evita que una sesión cambie de semana sin que los estudiantes lo esperen.
- **Descartado:** Cualquier día del periodo (más validaciones y sorpresas); solo la misma fecha (no cubre cambiar de día).

### D-095 · El docente puede reactivar lo que canceló
- **Estado:** Aceptada e implementada (spec 012; elegida por el equipo el 2026-11-17)
- **Decisión:** Una sesión que el docente canceló (motivo `TEACHER`) se puede reactivar mientras falten 2 horas o más, con la misma elección de alcance. Se vuelve a validar salón, docente, festivos y estudiantes, y se registra otro evento (`SESSION_RESTORED_TEACHER`). Las canceladas por festivo no se reactivan desde aquí.
- **Motivo:** Corregir un error sin obligar al CAE a crear una sesión nueva.
- **Descartado:** Cancelación definitiva (no deja corregir un error).

### D-096 · Disponibilidad por sesión y orden de bloqueo del docente
- **Estado:** Aceptada e implementada (spec 012)
- **Decisión:** La disponibilidad al reprogramar o reactivar se comprueba sobre las sesiones reales (no los horarios semanales), con la misma consulta que usa la restauración de festivos. La transacción bloquea, en este orden, el periodo (`FOR SHARE`), el módulo (`FOR UPDATE`), los salones y los docentes de las sesiones que se mueven, cada grupo por `id`; así dos cambios sobre el mismo salón o docente se serializan. Límite conocido: los cruces del CAE al cambiar salón o docente y los de la inscripción (spec 011) miran el horario semanal y no ven una sesión ya movida. La cancelación por festivo ahora incluye las sesiones reprogramadas y su restauración las devuelve reprogramadas.
- **Motivo:** Exactitud con sesiones movidas sin una restricción de exclusión sobre sesiones, que fallaría con datos históricos (D-086).
- **Descartado:** Restricción de exclusión en `module_sessions`; comprobar solo horarios semanales (no vería sesiones movidas).

### D-097 · Calendario semanal del docente: endpoint por rango y componente reutilizable
- **Estado:** Aceptada e implementada (spec 013)
- **Decisión:** El calendario consulta un endpoint de solo lectura propio, `GET /teacher/calendar?from&to` (máximo 7 días, días de Bogotá), que devuelve las sesiones del rango pasadas y futuras con la forma de `/teacher/sessions` y, en `meta`, el periodo y las horas permitidas de la configuración. Muestra el periodo Activo o, sin él, el Cerrado más reciente en solo lectura. Las tarjetas de próximas sesiones siguen usando `/teacher/sessions` y no cambian al navegar semanas. El calendario es un componente genérico en `src/components/calendar/` que recibe elementos ya preparados, para que el estudiante y el CAE lo adopten después. Vista inicial: Día bajo 600 dp y Semana desde 600 dp. Las horas visibles salen del servidor y no están escritas en el calendario; las constantes de los formularios de módulo (`EARLIEST_TIME`, `LATEST_TIME`) siguen fijas en la app y quedan como deuda conocida.
- **Motivo:** `/teacher/sessions` solo devuelve sesiones futuras y su paginación sirve a las tarjetas; cambiarlo rompía el contrato de la spec 012. Una consulta por semana es pequeña y rápida, y entrega de una vez lo que el calendario necesita.
- **Descartado:** Agregar `includePast` a `/teacher/sessions` (mezcla dos usos); traer el periodo completo de una vez; una librería de calendario externa (no encaja con el diseño ni con la regla de fechas D-081); guardar la vista elegida en el dispositivo (no se pidió).

### D-098 · Entrega de avisos: una transacción por evento y un barrido de pendientes
- **Estado:** Aceptada e implementada (spec 014)
- **Decisión:** Un sondeo de BullMQ cada 5 s procesa los eventos de `outbox_events` en orden de creación, **uno por transacción** (`FOR UPDATE SKIP LOCKED`): crea los avisos, una fila de entrega por aviso y canal (`PUSH`, `EMAIL`) y marca el evento como procesado. Un índice único `(event_id, user_id)` impide el aviso duplicado. Después de confirmar se encola un trabajo por entrega con el id de la entrega como `jobId`; un barrido cada 60 s vuelve a encolar lo que sigue `PENDING` (cola caída tras la transacción, o correo esperando configuración). Reintentos: 8 intentos con espera exponencial desde 15 s (unos 31 min); agotados, la entrega pasa a `FAILED` y se registra el tipo de evento, el canal y una causa estable, sin datos personales. Todo configurable por variables de entorno. Un evento sin destino válido (módulo o sesiones eliminados, sin inscritos) se cierra sin avisos y se registra el motivo; uno con error inesperado queda pendiente y se reintenta, nunca se marca procesado sin avisar.
- **Motivo:** Cumple "todo cambio notifica a los inscritos" sin perder ni duplicar avisos aunque el servicio se reinicie, y deja el estado en la base de datos como fuente de verdad: la cola es solo el medio. Cada aviso y canal es un trabajo propio, así un fallo no afecta a los demás.
- **Descartado:** `LISTEN/NOTIFY` (más piezas y no reanuda pendientes al arrancar); encolar desde la transacción del cambio (descartado en D-087); un trabajo por evento (un destinatario lento frena al resto); reintentos infinitos (acumulan basura); rendirse tras N fallos del evento (perder un aviso viola el 100 % de inscritos avisados).

### D-099 · El contador de avisos se consulta, no llega por WebSocket
- **Estado:** Aceptada e implementada (spec 014)
- **Decisión:** La app consulta `GET /notifications/unread-count` cada minuto con la app abierta, al volver a primer plano, al recibir un push y tras marcar leído; la campana de la barra superior muestra el resultado. Los avisos se guardan todos y no se ocultan por antigüedad hasta que otra funcionalidad fije una retención. Los avisos de esta spec van solo a los estudiantes inscritos; los avisos a docentes usarán plantillas aparte (aclarado el 2026-11-18).
- **Motivo:** El WebSocket llega con el chat (otra spec); consultar es simple, barato y suficiente para el contador (el aviso nuevo ya llega por push). El contrato no cambia cuando exista el canal en vivo.
- **Descartado:** WebSocket solo para el contador (adelanta la infraestructura del chat); consulta agresiva (gasta batería); ocultar avisos viejos (no se pidió y complica la bandeja).

### D-100 · Push con cliente propio de Expo, recibos diferidos y descarte al cerrar sesión
- **Estado:** Aceptada e implementada (spec 014)
- **Decisión:** El push se envía con un cliente propio de dos llamadas (`send` y `getReceipts`) de Expo Push, sin la dependencia `expo-server-sdk`, detrás de una interfaz que las pruebas sustituyen. Un trabajo diferido (15 min) consulta los recibos y descarta los dispositivos que Expo reporta como inválidos; los inválidos del ticket se descartan al instante. Un dispositivo (`push_tokens`) tiene un token único y pertenece a un solo usuario y a la sesión con que se registró; al terminar una sesión (cierre de sesión, robo de token, cambio de clave) el servidor descarta sus dispositivos, aunque la app no lo pida. La configuración del correo la lee un servicio común (fila guardada por el CAE, luego variables `SMTP_*`, luego nada) en cada envío, y su pantalla de gestión no devuelve nunca la clave.
- **Motivo:** Dos llamadas no justifican una dependencia; el descarte en el servidor cumple "al cerrar sesión deja de recibir" aunque la app falle; leer la configuración en cada envío hace que un cambio rija sin reiniciar.
- **Descartado:** `expo-server-sdk`; FCM y APNs directos (más credenciales y código, ya se eligió Expo Push en D-024); verificar los recibos en el mismo trabajo (bloquea el worker); depender de que la app pida el descarte al salir.

### D-102 · Logo del correo incrustado, con copia en el backend
- **Estado:** Aceptada
- **Decisión:** El logo `logo-uts.png` viaja incrustado en cada correo (`cid`) y se copia, sin modificarlo, a `tutorias_uts_back/assets/brand/`.
- **Motivo:** El backend aún no tiene despliegue ni dirección pública, y los clientes de correo bloquean las imágenes remotas. De los logos disponibles es el único que pesa menos de 100 KB (96 KB; los demás superan 380 KB).
- **Descartado:** Una URL pública configurable (se vería roto sin servidor); el logo en base64 dentro del HTML (infla el cuerpo y Gmail recorta cerca de los 102 KB); un correo sin imagen. Riesgo: hay dos copias del logo; si la UTS entrega el oficial nuevo, hay que actualizar la app y la API.

### D-103 · Un armador de mensaje y plantillas sin dependencias
- **Estado:** Aceptada
- **Decisión:** Todo correo sale por `MessageBuilder` (módulo `mail`), que arma el HTML, el texto simple y el logo a partir de un `MailContent` que producen las plantillas. El marco es una función de tablas con estilos en línea y un `escapeHtml` propio. El correo escribe sus propias pilas de fuentes (D-107), como excepción a la regla de no escribir nombres de fuente, que rige para los componentes de la app.
- **Motivo:** Había tres caminos de envío (códigos, avisos y prueba SMTP), cada uno con su propio `sendMail`. Myriad Pro y Source Code Pro no se pueden incrustar en un correo.
- **Descartado:** MJML, Handlebars o EJS (una dependencia y un paso de compilación para unas diez plantillas); HTML escrito a mano en cada plantilla.

### D-104 · Un correo por tipo de aviso, sin guardar datos nuevos
- **Estado:** Aceptada
- **Decisión:** Cada tipo de aviso tiene su insignia, su tono (acento) y su introducción en español e inglés. El título y el cuerpo siguen saliendo de `notifications/templates`, única fuente del texto del aviso. Los avisos de salón y de docente informan solo el dato nuevo.
- **Motivo:** El aviso guarda tipo, título y cuerpo, no datos estructurados; mostrar "antes y después" exigiría una migración y un segundo sitio que formatee fechas.
- **Descartado:** Una columna `payload` en `notifications` para pintar una tabla "Antes / Ahora"; volver a leer el contexto del evento al enviar (consultas extra y desfase si el módulo cambió).

### D-105 · Marca del correo en configuración y vencimiento del código en el trabajo
- **Estado:** Aceptada
- **Decisión:** `MAIL_BRAND_NAME` (por defecto el nombre oficial de la institución), `MAIL_CONTACT_EMAIL` y `MAIL_FOOTER_TEXT` viven en variables de entorno. `CodeService.issue` devuelve `expiresAt`, el trabajo de correo lo lleva y la plantilla lo muestra en hora de Bogotá.
- **Motivo:** Lo que cambia entre ambientes no va escrito en el código (constitución, principio III). La vigencia del código es configurable (`auth.verificationCodeTtlHours` y `auth.resetCodeTtlMinutes`); un texto fijo mentiría si el CAE la cambia.
- **Descartado:** Una tabla de ajustes editable por el CAE (sobredimensionado); un texto fijo "vence en 60 minutos".

### D-106 · Lenguaje visual del correo
- **Estado:** Aceptada
- **Decisión:** Tarjeta blanca de 16 px de radio sobre #F2F4EF, con el logo arriba y una franja verde institucional (#34531F con degradado a #132F20 solo como mejora; color sólido de respaldo) que lleva una insignia de texto, el título en blanco (26/32 Bold) y la línea lima de 4 px de los héroes. Texto de 16/24 en #132F20; el detalle del aviso va en una caja #F2F4EF con un filo de 4 px del color del tono; el código va en una caja con relleno y borde tenue como los campos; el pie lleva el nombre oficial, el contacto como enlace y el texto legal. Solo tema claro (`color-scheme: light`). Sin el patrón de hojas, plumas y libros: el correo no tiene Iconify ni una imagen del patrón. Accesibilidad: `lang` en la página, un solo `h1`, tablas `presentation`, pre-encabezado, texto de 12 px como mínimo y de 16 px en el cuerpo, estado siempre con texto (insignia) además del color y todos los pares texto/fondo con contraste mínimo 4.5:1, comprobado por prueba. Para evitar lo que el verificador de Mailpit marca sin soporte se evita `overflow`, estilos en `<body>` y el atajo `background`, y todo relleno lleva también `bgcolor`.
- **Motivo:** Seguir `Design.md` (tarjeta, radios, héroe verde, línea lima, campo con borde, nombre oficial) y mejorar lo que Mailpit marcó: el promedio de los 20 correos pasó de 88,8 % a 94,1 % de soporte y lo parcial de 10,0 % a 4,9 %. Lo que queda marcado es propio de cualquier correo (la etiqueta `<body>`, el pre-encabezado oculto, `max-width` en Outlook, el degradado con color de respaldo y `border-radius`).
- **Insignia de éxito:** el correo usa texto #132F20 sobre #2BA640 (4,6:1) porque el blanco da 3,2:1 y no cumple AA. La insignia de éxito de la app (`Design.md`, "Badges") usa texto blanco con la misma razón de contraste: queda **por revisar** en la app.
- **Descartado:** Un degradado como único fondo (muchos clientes no lo muestran); un modo oscuro propio (la mayoría de los clientes ya invierte colores y se arriesga el contraste); el logo con letras blancas (380 a 530 KB).

### D-107 · Fuente del correo: pila con Myriad Pro primero
- **Estado:** Aceptada
- **Decisión:** El texto del correo usa la pila `'Myriad Pro', 'Source Sans 3', Arial, Helvetica, sans-serif` y el código `'Source Code Pro', 'Courier New', Courier, monospace`. Viven como las constantes `FONTS` de `mail/templates/layout.ts`, el único lugar donde se cambia la fuente de todos los correos.
- **Motivo:** Un correo solo muestra las fuentes que ya están instaladas en el dispositivo de quien lo lee; no se pueden incrustar archivos de fuente. Pedir primero la tipografía corporativa (Myriad Pro, `Design.md`) la usa donde exista, y la pila cae a Source Sans 3 (el respaldo de `Design.md`) y a Arial, que está en casi todos los dispositivos. Nombrar una fuente instalada en CSS no la distribuye, así que no choca con la licencia pendiente (D-051). En la práctica, la mayoría de los lectores verá Arial.
- **Descartado:** Fuentes web (`@font-face`, `@import` o Google Fonts): Gmail y Outlook las ignoran, la petición externa avisa a un tercero de que el correo se abrió y Myriad Pro es comercial; incrustar el archivo de fuente (los clientes de correo no lo soportan); una variable de entorno para la fuente (cambiar una constante basta).

---

## Plantilla para nuevas decisiones

```markdown
### D-0XX · Título corto
- **Estado:** Aceptada | Supuesto | Reemplazada por D-0YY
- **Decisión:** Qué se decidió.
- **Motivo:** Por qué.
- **Descartado:** Alternativas y por qué no.
```
