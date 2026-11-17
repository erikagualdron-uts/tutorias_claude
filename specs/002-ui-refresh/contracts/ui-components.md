# Contrato de componentes compartidos

Interfaz interna de la app: lo que las pantallas pueden usar y lo que los componentes garantizan.

## Tema (`@/theme`)

| Token | Valor |
|---|---|
| `spacing` | `xs 4, sm 8, md 12, lg 16, xl 24, xxl 32, xxxl 48, huge 64` |
| `radius` | `badge 8, input 12, card 16, hero 20, sheet 24, header 32, pill 9999` |
| `shadows` | `level1..level3` (con `elevation` para Android) |
| `gradients.brand` | `#34531F → #132F20`, 135° |
| `motion` | `press 150, standard 250, sheet 350` ms; `pressScale button 0.97, card 0.98` |
| `iconSize` | `inline 16, button 20, nav 24, empty 40` |
| `Palette` | los colores actuales más `screen` (`#F2F4EF` claro, `#0B1710` oscuro) y `card` |

Las pantallas no escriben colores, radios, sombras ni espaciados literales.

## `<Icon name size color />` (`@/icons`)

- `name` es una clave del registro (`registry.ts`), no una cadena libre. Cada entrada declara el nombre Iconify `solar:*` como literal.
- Decorativo por defecto (oculto a lectores de pantalla); un control solo de ícono pone `accessibilityLabel` en el `Pressable`.
- `size` por defecto `iconSize.button`; `color` viene de la paleta.

## `<Button label icon onPress variant loading disabled helperText />`

- `icon` es obligatorio (clave del registro), salvo `variant="link"` y el componente `IconButton` (solo ícono, con `accessibilityLabel` obligatorio y 48 px).
- Ícono a la izquierda, 20 px, 8 px de separación con el texto; ancho completo, alto 52.
- Escala 0.97 al pulsar en 150 ms; sin escala con reducir movimiento.
- Botones apilados: el contenedor usa `gap: spacing.lg` (16).

## `<Card>` / `<AuthLayout>` / `<BrandLogo>` / `<FadeInView>`

| Componente | Garantía |
|---|---|
| `Card` | Fondo `card`, radio 16, `shadows.level1`, sin borde |
| `AuthLayout` | Cabecera con `gradients.brand`, borde inferior curvo de 32, logo centrado (variante según el tema) y tarjeta de formulario (radio 24, `level3`) que solapa 24 px; el logo se reduce con el teclado; formulario desplazable |
| `BrandLogo` | Muestra el logo oficial de `assets/brand/` sin modificarlo: `logo-uts-no-bg-letras-blancas.png` en tema claro y `logo-uts-blanco.png` en tema oscuro, directamente sobre el degradado |
| `FadeInView` | Entrada con fundido y subida de 8 px en 250 ms; con reducir movimiento, solo fundido |

## Invariantes comprobables

1. Ninguna importación de `@expo/vector-icons`, `expo-symbols` ni otra librería de íconos en `app/` ni `src/`.
2. Todo `Button` recibe `icon` (el tipo lo exige).
3. `app/` y `src/features/` no contienen literales de color hexadecimal.
