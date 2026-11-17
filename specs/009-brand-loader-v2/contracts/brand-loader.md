# Contrato: componente `BrandLoader` (versión 2)

Reemplaza al contrato de la spec 007 (`specs/007-brand-loader/contracts/brand-loader.md`) como referencia vigente. Ubicación: `tutorias_uts_mobile/src/components/BrandLoader.tsx`.

## Propiedades

| Propiedad | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `size` | `'regular' \| 'compact'` | `'regular'` | `regular`: ícono de 32 px y anillo de 64 px, con fases de espera y aviso de demora; `compact`: ícono de 14 px y anillo de 28 px, inmediato y sin aviso |
| `color` | texto (color del tema) | verde primario del tema (casi blanco en oscuro) | Color del ícono y del anillo; los botones rellenos pasan el color de su texto |

El componente no recibe textos: la etiqueta accesible y el aviso salen de las traducciones.

## Comportamiento visual

| Tamaño | Momento | Qué se ve |
|---|---|---|
| regular | 0 a 300 ms | Nada pintado; el espacio de 64 px queda reservado |
| regular | al llegar a 300 ms | Entrada: fundido de 150 ms del conjunto |
| regular | 300 a 1000 ms | Ícono en secuencia dentro del anillo que gira; cada ícono crece de 50 % a 100 % al entrar (250 ms) y se reduce de 100 % a 50 % al salir (250 ms), centrado y sin moverse de lado a lado |
| regular | más de 1000 ms | Lo anterior y, debajo, el aviso de demora |
| regular | al terminar la carga | Salida: fundido de 150 ms del conjunto, superpuesto al contenido, que no espera |
| compact | desde 0 ms | Fundido de entrada de 150 ms; ícono en secuencia dentro del anillo que gira; sin aviso |
| compact | al terminar la acción | Fundido de salida de 150 ms |

- **Anillo**: pista del color del ícono al 20 % de opacidad y arco de 90° con extremos redondeados que da una vuelta por segundo a velocidad constante; grosor de 3 px (regular) o 2 px (compacto); el ícono queda centrado y derecho dentro.
- **Secuencia de íconos, fases de espera, aviso de demora y primera carga**: sin cambios respecto a la 007.
- **Reducir movimiento**: entrada y salida con fundido de 150 ms; los íconos no cambian de tamaño; el anillo queda fijo y su arco pulsa entre 40 % y 100 % de opacidad cada 1,2 s; el ícono cambia cada 900 ms sin fundido.
- **Desmontaje**: cancela temporizadores y animaciones; al volver a montarse, el conteo, la secuencia y la entrada empiezan de cero.
- **Accesibilidad**: un solo elemento con rol `progressbar`, etiqueta de `common.loading` y estado ocupado, solo mientras es visible; el ícono y el anillo se ocultan a los lectores; el aviso se anuncia una sola vez al aparecer.

## Constantes de tiempo y tamaño (tokens del tema, `motion.loader`)

| Token | Valor |
|---|---|
| `iteration` / `fadeIn` / `hold` / `fadeOut` | 900 / 250 / 400 / 250 ms (sin cambios) |
| `showAfter` / `slowAfter` | 300 / 1000 ms (sin cambios) |
| `ring.regular` | tamaño 64 px, grosor 3 px |
| `ring.compact` | tamaño 28 px, grosor 2 px |
| `ring.sweepDegrees` / `ring.turn` | 90° / 1000 ms por vuelta |
| `ring.pulse` / `ring.pulseMin` | 1200 ms / 0,4 |
| `ring.trackOpacity` | 0,2 |
| `icon.regular` / `icon.compact` | 32 / 14 px |
| `iconScaleMin` | 0,5 (los íconos crecen de 0,5 a 1 al entrar y vuelven a 0,5 al salir) |
| `fade` | 150 ms (aparición y salida del conjunto) |

## Quién lo usa

| Consumidor | Tamaño |
|---|---|
| `LoadingScreen` (arranque y restauración de sesión) | regular |
| Pantallas de periodos, salones, ubicaciones y listas desplegables (primera carga) | regular |
| `Button` en estado de carga | compact |

## Regla de regresión

Se mantiene la de la 007: ningún archivo de `app/` ni de `src/` (fuera de `__tests__/`) puede usar `ActivityIndicator`.
