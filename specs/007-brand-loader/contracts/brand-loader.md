# Contrato: componente `BrandLoader`

> **Reemplazado por la spec 009** (`specs/009-brand-loader-v2/contracts/brand-loader.md`): el loader ahora lleva un anillo giratorio y entra y sale con una sacudida. Este documento describe la versión 1.

Interfaz que la funcionalidad 007 expone al resto de la app. Ubicación: `tutorias_uts_mobile/src/components/BrandLoader.tsx`.

## Propiedades

| Propiedad | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `size` | `'regular' \| 'compact'` | `'regular'` | `regular` = 48 px, con fases de espera y aviso de demora; `compact` = 20 px, inmediato y sin aviso |
| `color` | texto (color del tema) | verde primario del tema | Color del ícono; los botones rellenos pasan el color de su texto |

El componente no recibe textos: la etiqueta accesible y el aviso salen de las traducciones.

## Comportamiento

| Tamaño | Tiempo desde el montaje | Qué se ve |
|---|---|---|
| regular | 0 a 300 ms | Nada (ocupa su espacio sin pintar) |
| regular | 300 a 1000 ms | Un ícono centrado, en secuencia |
| regular | más de 1000 ms | El ícono en secuencia y debajo el aviso de demora |
| compact | desde 0 ms | Un ícono en secuencia, sin aviso |

- **Secuencia**: libro abierto → pluma → hoja → libro abierto; 900 ms por ícono (aparece 250, sostiene 400, desvanece 250); un solo ícono visible a la vez; siempre empieza por el libro al montarse.
- **Reducir movimiento**: el ícono cambia cada 900 ms sin fundido; fases y aviso iguales.
- **Desmontaje**: cancela temporizadores y animaciones; al volver a montarse, el conteo y la secuencia empiezan de cero.
- **Accesibilidad**: un solo elemento con rol `progressbar`, etiqueta de `common.loading` y estado ocupado; íconos ocultos a los lectores; el aviso de demora se anuncia una sola vez al aparecer.

## Traducciones requeridas

| Clave | Español | Inglés |
|---|---|---|
| `common.loading` (existe) | Cargando… | Loading… |
| `common.loadingSlow` (nueva) | Cargando… Esto está tardando más de lo normal. | Loading… This is taking longer than usual. |

## Constantes de tiempo (tokens del tema, `motion.loader`)

| Token | Valor |
|---|---|
| `iteration` | 900 ms |
| `fadeIn` / `hold` / `fadeOut` | 250 / 400 / 250 ms |
| `showAfter` | 300 ms |
| `slowAfter` | 1000 ms |

## Quién lo usa

| Consumidor | Tamaño |
|---|---|
| `LoadingScreen` (arranque y restauración de sesión) | regular |
| Pantallas de periodos, salones, ubicaciones y listas desplegables (primera carga) | regular |
| `Button` en estado de carga | compact |

## Regla de regresión

Ningún archivo de `app/` ni de `src/` (fuera de `__tests__/`) puede usar `ActivityIndicator`; lo verifica `src/__tests__/noActivityIndicator.test.ts`.
