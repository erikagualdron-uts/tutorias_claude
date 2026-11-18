# Feature Specification: Logo de marca según el tema

**Feature Branch**: `004-brand-logo-theme`

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "BrandLogo: se modifica la imagen principal en la que está basado el logo de marca de acuerdo con el tema (claro u oscuro), usando las variantes blancas del logo: `logo-uts-no-bg-letras-blancas` en tema claro y `logo-uts-blanco` en tema oscuro."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Logo legible en tema claro y oscuro (Priority: P1)

Quien abre las pantallas de acceso ve el logo de la UTS directamente sobre el degradado verde de la cabecera, sin recuadro blanco detrás, en la variante que corresponde al tema del dispositivo: símbolo lima con letras blancas en tema claro y todo blanco en tema oscuro.

**Why this priority**: es la primera imagen de la marca que ve cualquier usuario; el logo blanco sobre un recuadro blanco no se distinguía.

**Independent Test**: abrir el login con el dispositivo en tema claro y luego en oscuro; comprobar la variante del logo y que se lee con claridad sobre el verde.

**Acceptance Scenarios**:

1. **Given** el dispositivo en tema claro, **When** se muestra la cabecera de acceso, **Then** el logo es `logo-uts-no-bg-letras-blancas` (símbolo lima, letras blancas) sobre el degradado, sin recuadro detrás.
2. **Given** el dispositivo en tema oscuro, **When** se muestra la cabecera de acceso, **Then** el logo es `logo-uts-blanco` (todo blanco) sobre el degradado, sin recuadro detrás.
3. **Given** que se cambia el tema con la app abierta, **When** la cabecera se vuelve a mostrar, **Then** el logo corresponde al tema nuevo.
4. **Given** cualquier tema, **When** se muestra el logo, **Then** conserva su proporción original (sin estirarse ni deformarse) y su zona libre.

---

### User Story 2 - Documentación alineada con el logo (Priority: P2)

Quien lee la documentación del proyecto encuentra qué archivo de logo se usa en cada tema y dónde, y no encuentra referencias a archivos que ya no se usan.

**Why this priority**: evita que futuras pantallas usen la variante equivocada.

**Independent Test**: buscar en `docs/` y `specs/` los nombres de logo; cada mención coincide con la regla vigente.

**Acceptance Scenarios**:

1. **Given** `docs/Design.md`, **When** se consulta la sección de marca, **Then** indica la variante del logo por tema y que va sobre el degradado.
2. **Given** los contratos de componentes y las decisiones, **When** se consultan, **Then** coinciden con esa regla y registran el motivo del cambio.

---

### Edge Cases

- Tema que cambia mientras el teclado está abierto: el logo cambia de variante sin saltar de tamaño ni posición.
- Teclado abierto: el logo se reduce pero mantiene su proporción.
- El splash conserva su propio logo blanco (imagen estática, ver spec 003); este cambio no lo modifica.
- Superficies blancas (por ejemplo, correos): usan el logo a color, no estas variantes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El logo de marca MUST mostrarse con `logo-uts-no-bg-letras-blancas` en tema claro y con `logo-uts-blanco` en tema oscuro.
- **FR-002**: El logo MUST mostrarse directamente sobre el degradado de la cabecera, sin recuadro ni insignia detrás.
- **FR-003**: El logo MUST conservar la proporción del archivo original y MUST NOT redibujarse, recolorearse ni deformarse.
- **FR-004**: El logo MUST seguir el tema del dispositivo y actualizarse si el tema cambia.
- **FR-005**: El logo MUST reducirse cuando el teclado está abierto, sin perder legibilidad.
- **FR-006**: El logo MUST ser decorativo para los lectores de pantalla; el nombre de la app ya se anuncia en el título.
- **FR-007**: `docs/Design.md`, `docs/Conventions.md`, `docs/Decisions.md` y el contrato de componentes de la spec 002 MUST describir esta regla y no mencionar los archivos de logo anteriores.
- **FR-008**: Estos ajustes MUST NOT cambiar reglas de negocio ni funcionalidades, y las pruebas existentes siguen pasando.

### Key Entities

No aplica: no introduce datos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En el 100 % de las pantallas de acceso el logo aparece en la variante correcta del tema.
- **SC-002**: 0 recuadros blancos detrás del logo en las pantallas de acceso.
- **SC-003**: El logo se ve sin estirarse en cualquier tamaño de pantalla probado (proporción 1448:1086 conservada).
- **SC-004**: 0 menciones en la documentación a archivos de logo que ya no se usan.
- **SC-005**: Los flujos de las funcionalidades 001 a 003 se completan igual que antes (sin regresiones en las pruebas).

## Assumptions

- Esta funcionalidad documenta y formaliza un cambio ya implementado en `BrandLogo` y `AuthLayout` (D-068); la spec sirve para trazabilidad y revisión.
- "Tema claro" y "tema oscuro" son los del dispositivo (modo automático), igual que el resto de la app.
- Los archivos `logo-uts-no-bg-letras-blancas.png` y `logo-uts-blanco.png` ya están en `assets/brand/` y se usan sin modificar.
- La cabecera es verde en ambos temas, por eso las dos variantes son blancas o de letras blancas.
- El logo a color (`logo-uts.png`) queda reservado para superficies blancas, como los correos.
- El splash queda fuera de alcance: ya usa su imagen estática de la spec 003.
