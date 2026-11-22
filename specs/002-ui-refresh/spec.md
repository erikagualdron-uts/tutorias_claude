# Feature Specification: Renovación visual de la app (UI refresh)

**Feature Branch**: `002-ui-refresh`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Renovación visual de la app: aplicar a todas las pantallas existentes lo definido en Design.md y Conventions.md (íconos Iconify con registro único, botones con ícono a la izquierda y 16 px entre apilados, estilo moderno y fluido, logo oficial UTS, tema centralizado). Fuera de alcance: reglas de negocio o funcionalidades."

## Clarifications

### Session 2026-11-16

- Q: En modo oscuro, ¿qué fondo y estilo deben tener las pantallas renovadas? → A: Conservar la paleta oscura actual (fondo y superficies); solo se aplican íconos, botones, tarjetas, radios y animaciones.
- Q: ¿Qué hace el degradado de marca en las pantallas de acceso? → A: Cabecera con degradado y logo; el formulario va en una tarjeta sobre el fondo claro.
- Q: ¿Qué animaciones deben tener las pantallas? → A: Entrada de pantalla y tarjetas (fundido y deslizamiento leve), aparición de diálogos y retroalimentación al pulsar botones; todo de 200 a 300 ms.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acceso con identidad UTS (Priority: P1)

Quien abre la app ve el logo oficial de la UTS en la pantalla de carga y en las pantallas de acceso (inicio de sesión, registro, verificación, recuperación y restablecimiento), con fondo `#F2F4EF`, degradado de marca, tarjetas con sombra suave y botones con ícono a la izquierda separados 16 px.

**Why this priority**: es la primera impresión y la única parte que ven todos los roles; valida el sistema visual completo.

**Independent Test**: abrir la app sin sesión y recorrer las pantallas de acceso; comprobar logo, fondo, tarjetas, botones e íconos.

**Acceptance Scenarios**:

1. **Given** la app se abre, **When** carga, **Then** se muestra el logo oficial sin modificar en la pantalla de carga.
2. **Given** la pantalla de inicio de sesión, **When** se ven los botones apilados, **Then** cada uno tiene ícono a la izquierda y hay 16 px entre ellos.
3. **Given** cualquier pantalla de acceso, **When** se muestra, **Then** usa el fondo `#F2F4EF` y los formularios van en tarjetas con sombra suave y radios de 16 a 24 px.

---

### User Story 2 - Pantallas internas renovadas (Priority: P2)

Estudiante, docente y CAE ven las pantallas posteriores al acceso (pestañas, barra superior, menú de perfil, cambio de clave, alta de docente y diálogos) con el mismo estilo: íconos unificados, botones con ícono, tarjetas y animaciones cortas.

**Why this priority**: extiende la coherencia visual a toda la app existente.

**Independent Test**: iniciar sesión con cada rol y recorrer todas las pantallas verificando íconos y botones.

**Acceptance Scenarios**:

1. **Given** cualquier pantalla existente, **When** muestra un ícono, **Then** proviene del set `solar` de Iconify declarado en el registro único.
2. **Given** cualquier botón (salvo enlaces de texto y botones solo de ícono), **When** se muestra, **Then** lleva ícono a la izquierda.
3. **Given** los diálogos y tarjetas, **When** aparecen o cambian de estado, **Then** lo hacen con una animación corta.

---

### User Story 3 - Movimiento reducido y tema único (Priority: P3)

Quien activó "reducir movimiento" en su dispositivo no ve animaciones de transición; y el equipo cambia un color, espaciado, radio o sombra en un solo lugar y se refleja en toda la app.

**Why this priority**: accesibilidad y mantenibilidad; no cambia lo que ve la mayoría.

**Independent Test**: activar "reducir movimiento" y recorrer la app; cambiar un valor del tema y verificar que se refleja en todas las pantallas.

**Acceptance Scenarios**:

1. **Given** "reducir movimiento" activo, **When** se navega o aparecen elementos, **Then** no hay animaciones de movimiento.
2. **Given** un valor del tema modificado, **When** se abre cualquier pantalla, **Then** todos los usos reflejan el cambio sin editar pantallas individuales.

---

### Edge Cases

- Fuente del sistema muy grande: botones, tarjetas y barra superior siguen legibles y con objetivos táctiles de al menos 48 px.
- Modo oscuro: tarjetas, íconos y botones renovados deben seguir legibles sobre la paleta oscura existente.
- Un ícono que no existe en el registro: no debe quedar un botón sin ícono ni un hueco vacío.
- Pantallas pequeñas: el logo y el degradado no empujan el formulario fuera de la vista.
- El lima `#C3D730` nunca se usa como texto o ícono sobre blanco.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Todos los íconos de la app MUST provenir del set `solar` de Iconify, declarados en un único registro, y no MUST existir otra librería de íconos.
- **FR-002**: Todo botón MUST llevar ícono a la izquierda, salvo enlaces de texto y botones solo de ícono.
- **FR-003**: Los botones apilados MUST tener 16 px de separación.
- **FR-004**: Las pantallas MUST usar el fondo `#F2F4EF` en modo claro; en modo oscuro MUST conservar la paleta oscura actual (fondo y superficies) sin colores nuevos.
- **FR-005**: Los contenedores de contenido MUST ser tarjetas con sombra suave y radios de 16 a 24 px.
- **FR-006**: Las pantallas de acceso MUST mostrar una cabecera con degradado de marca y el logo; el formulario MUST ir en una tarjeta sobre el fondo de la pantalla.
- **FR-007**: El logo oficial de la UTS MUST mostrarse sin modificar en la pantalla de carga y en las pantallas de acceso, desde los recursos de marca.
- **FR-008**: Las animaciones se limitan a la entrada de pantallas y tarjetas (fundido y deslizamiento leve), la aparición de diálogos y la retroalimentación al pulsar botones, de 200 a 300 ms, y MUST desactivarse cuando el dispositivo tiene "reducir movimiento".
- **FR-009**: Colores, espaciados, radios y sombras MUST definirse en un tema único basado en el archivo de tema de la skill `uts-ui`; las pantallas no MUST contener valores visuales sueltos.
- **FR-010**: Solo se MUST usar colores de `Design.md`; cualquier color nuevo se marca como derivado.
- **FR-011**: Los objetivos táctiles MUST medir al menos 48 px.
- **FR-012**: La renovación NO MUST cambiar reglas de negocio, flujos ni textos funcionales; las pruebas existentes siguen pasando.

### Key Entities

No aplica: la funcionalidad no introduce datos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de las pantallas existentes usa íconos del registro único y 0 íconos de otras fuentes.
- **SC-002**: El 100 % de los botones aplicables muestra ícono a la izquierda y 16 px entre botones apilados.
- **SC-003**: Con "reducir movimiento" activo, 0 animaciones de movimiento en un recorrido completo por la app.
- **SC-004**: Un cambio de color o radio del tema se refleja en todas las pantallas editando un solo lugar.
- **SC-005**: Todos los flujos de la funcionalidad 001 se completan igual que antes (sin regresiones en las pruebas existentes).
- **SC-006**: Al revisar con el equipo de diseño, las pantallas de acceso se consideran conformes con `Design.md` en la primera revisión.

## Assumptions

- Aplica solo a las pantallas ya construidas en la funcionalidad 001; las futuras seguirán el mismo sistema.
- Los archivos de marca de la UTS ya existen en la carpeta de recursos de marca de la app y no se modifican.
- El modo oscuro conserva su paleta actual; el fondo `#F2F4EF` es del modo claro.
- Sin efectos decorativos continuos ni animación del logo.
- Los textos visibles no cambian, salvo etiquetas de accesibilidad que los íconos requieran (en español e inglés).
