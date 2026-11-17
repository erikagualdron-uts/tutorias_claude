# Quickstart: validar el loader v2

Guía para comprobar de punta a punta la funcionalidad 009. Contrato del componente: [contracts/brand-loader.md](contracts/brand-loader.md).

## Prerrequisitos

- API y base de datos corriendo (`tutorias_uts_db` con `docker compose up -d` y `tutorias_uts_back` con `npm run start:dev`).
- La app en el emulador (`npx expo start` en `tutorias_uts_mobile`) con sesión del CAE.
- Para simular esperas: el control de red del emulador (Android Studio → Extended controls → Network, velocidad GPRS) o detener la API unos segundos mientras se abre una pantalla.

## Verificaciones automáticas

```bash
# tutorias_uts_mobile
npm run lint
npm run typecheck
npm test
```

Deben cubrir, como mínimo: los desplazamientos de la entrada (0, −6, +6, −3, +3, 0) y de la salida (0, +6, −6, +3, 0) y sus duraciones, el giro de una vuelta por segundo y el pulso del anillo con "reducir movimiento", el tamaño del anillo (64 y 28 px) y su grosor, que el tamaño compacto usa fundido de 150 ms y nunca sacudida, que no hay entrada ni salida visibles en cargas de menos de 300 ms, que la etiqueta accesible y el aviso se conservan, y que la prueba contra `ActivityIndicator` sigue pasando.

## Prueba de concepto (antes de construir el resto)

1. En el emulador, con un loader de prueba, comprobar que al quitarlo la animación de salida se reproduce y el contenido ocupa su sitio al instante.
2. Quitarlo en medio de la entrada: la salida debe arrancar desde donde estaba, sin saltos.
3. Si alguno falla, aplicar la alternativa de `research.md` R-2 (propiedad `visible` y componente montado durante la salida).

## Recorrido manual

1. **Anillo**: con la red lenta, abrir Más → Configuración → Periodos. Tras unos 300 ms aparece el ícono rodeado de un anillo fino cuyo arco da una vuelta por segundo, sin saltos; el ícono cambia (libro → pluma → hoja) sin que el anillo se detenga.
2. **Entrada**: al aparecer, el conjunto se mueve suavemente de lado a lado unos 6 px mientras se hace visible, y queda quieto en el centro.
3. **Salida**: al llegar los datos, el conjunto se mueve de lado a lado y se desvanece mientras el contenido ya se está viendo; el contenido no espera.
4. **Aviso de demora**: mantener la espera más de 1 segundo; el mensaje aparece debajo sin tocar el anillo y se va junto con el loader.
5. **Carga rápida**: con la red normal, abrir la misma pantalla; no debe verse anillo ni sacudida.
6. **Botones**: pulsar "Guardar periodo" con la red lenta. El ícono del botón se reemplaza de inmediato, con un fundido corto, por el ícono pequeño con su anillo girando; el botón no cambia de tamaño ni recorta el anillo; no hay sacudida ni aviso; al terminar, el loader se desvanece.
7. **Modo oscuro**: el ícono y el anillo se ven casi blancos (nunca lima) y la pista, tenue.
8. **Reducir movimiento**: activarlo en el emulador. No hay sacudida ni giro: el loader entra y sale con un fundido corto, el anillo queda fijo y su arco pulsa, y el ícono cambia de golpe cada 900 ms.
9. **Lector de pantalla**: con TalkBack o VoiceOver, la carga se anuncia como "Cargando…" una vez; el anillo no añade anuncios y el aviso de demora se anuncia una sola vez.
10. **Texto grande**: con el tamaño de letra del sistema al máximo, el loader conserva su tamaño y la sacudida no recorta el contenido vecino.

## Comprobación de consistencia

- Ninguna pantalla muestra el círculo giratorio del sistema.
- `grep` de `ActivityIndicator` en `app/` y `src/` (fuera de pruebas) no devuelve nada.
