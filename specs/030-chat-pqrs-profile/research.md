# Research: Chat, PQRS y perfil renovados

Sin `NEEDS CLARIFICATION` abiertos. Medido en el código el 2026-11-24 (`tutorias_uts_mobile`, rama de la spec 029).

## R-1. Qué falla en la fase 4 (medido)

| Dónde | Hallazgo | Corrección |
|---|---|---|
| `StatusBadge` (insignia de estado de la PQRS) | Borde e ícono con `success` y `warning` (roles de relleno): `warning` claro sobre `card` 2.37:1; `success` claro 3.17:1 pasa por poco pero es un rol de relleno. El texto de la insignia ya usa `textPrimary` | Un solo color de indicador: `successText`, `warningText` o `primary` |
| `PqrsFiledScreen` | Ícono de éxito de 48 px con `success` sobre `screen`: claro 2.86:1 | `successText` |
| Chat (`MessageBubble`, `AnnouncementCard`, `Composer`, `TypingIndicator`) | Ya usan roles de texto de severidad (`errorText`); sin usos de `error`, `warning` ni `success` | Sin cambio de color |
| `MessageBubble` ajena en oscuro | Fondo `card` sobre `screen`: 1.27:1; el texto la identifica pero no tiene el borde de 1 px que la spec 026 dio a las tarjetas en oscuro | Mismo borde de 1 px en oscuro que `Card` |
| Autenticación (cambio de clave) | Sin usos de roles de relleno | Sin cambio |

No hay colores ni roles nuevos. `SegmentedControl`, `ConfirmDialog`, `TextAreaField` y `SearchField` ya usan roles y `controlBorder`.

## R-2. Filtros de PQRS (defecto del recorrido)

- **Causa medida**: la lista del CAE apila tres `FilterChips` (estado, tipo y rol del autor); cada chip mide 48 px y la fila hace salto de línea (`flexWrap`), de modo que el tipo (lista que crece con el CAE) puede ocupar varias líneas. Estudiante y docente tienen una fila de cuatro chips.
- **Decisión (opción B, por defecto; sin respuesta de la persona dueña del producto)**: `FilterChips` gana la propiedad `scroll`: la fila es un `ScrollView` horizontal sin barra visible, con chips de 36 px de alto visual y `hitSlop` vertical de 6 px (la prueba de accesibilidad cuenta la zona de toque ampliada: 36 + 12 = 48), espaciado `sm`, el activo con relleno `primary` y texto `onPrimary` (ya es así) y el resto con `controlBorder`. Se usa solo en las tres listas de PQRS; el resto de listas conserva su fila con salto de línea.
- **Razón**: una línea de 36 px por grupo reduce el espacio a la mitad o menos sin perder ningún filtro ni cambiar su lógica ni sus textos.
- **Alternativas**: A, solo compactar sin desplazamiento (los chips de tipo seguirían envolviéndose); C, hoja de filtros (añade un paso y un texto de botón nuevo, descartada por «sin textos nuevos»).
- **Riesgo**: el desplazamiento horizontal oculta chips fuera de pantalla. Mitigación: los chips se cortan en el borde de la pantalla (señal de que hay más), sin barra visible. No se mide ni se desplaza el chip activo: sería código sin que nadie lo haya pedido.

## R-3. Cabeceras (FR-004)

| Pantalla | Título (texto existente) | Número |
|---|---|---|
| Mensajes (`MessagesScreen`) | `tabs.messages` | ninguno: reúne dos pestañas (avisos y conversaciones) y el total de conversaciones no está a ese nivel |
| Mis PQRS | `pqrs.list.title` | `pages[0].meta.total` |
| PQRS del CAE | `pqrs.admin.title` | `pages[0].meta.total` |

La cabecera reemplaza el `Text` de título de las dos listas de PQRS (dentro de su `header`) y va encima del selector de vista en mensajes. La conversación, el nuevo chat, los detalles y formularios de PQRS y el cambio de clave siguen como están (sobrios y, el último, expresivo con `AuthLayout`).

## R-4. Guardas (FR-003)

- `severityIndicators.test.ts` suma `src/features/chat`, `src/features/pqrs` y `src/features/auth` (hoy sin usos, la guarda evita regresiones; falla con `pqrs` antes de corregir).
- `headerBudget.test.ts` suma las 3 pantallas con cabecera y, como sobrias sin cabecera, `ChatScreen`, `NewChatScreen`, `PqrsDetailScreen`, `AdminPqrsDetailScreen`, `NewPqrsScreen` y `PqrsFiledScreen`; `ChangePasswordScreen` queda fuera (es expresiva, con `AuthLayout`).

## R-5. Etiqueta «All» (FR-006)

- **Hallazgo**: la corrección de la spec 029 (relleno horizontal, sin espaciado entre letras) está pendiente de confirmar en el teléfono. La propiedad `scroll` mantiene esos estilos de etiqueta.
- **Decisión**: ninguna acción nueva salvo comprobarlo en el recorrido final; si persiste, se corrige en `FilterChips` para todas las listas.

## R-6. Verificación manual

- **Decisión**: recorrido final de las 3 pantallas con cabecera, los filtros de PQRS (CAE con sus tres grupos), una conversación con mensajes propios, ajenos, avisos y escritura, y los formularios, en claro y oscuro, español e inglés. Se anota en `screen-inventory.md`.

## R-7. Orden de ramas

- **Decisión**: la rama de `tutorias_uts_mobile` se crea desde `029-admin-screens` (rama ya subida; PR sin abrir); la de `Claude`, ya creada desde `029-admin-screens`. Cada PR apunta a la rama anterior hasta que se fusione la base.
