# Quickstart: validar el loader de la marca

Guía para comprobar de punta a punta la funcionalidad 007. Contrato del componente: [contracts/brand-loader.md](contracts/brand-loader.md).

## Prerrequisitos

- La API y la base de datos corriendo (`tutorias_uts_db` con `docker compose up -d` y `tutorias_uts_back` con `npm run start:dev`).
- La app corriendo en el emulador (`npx expo start` en `tutorias_uts_mobile`) con sesión del CAE.
- Para simular esperas: el control de red del emulador (Android Studio → Extended controls → Network, velocidad GPRS) o detener la API unos segundos mientras se abre una pantalla.

## Verificaciones automáticas

```bash
# tutorias_uts_mobile
npm run lint
npm run typecheck
npm test
```

Deben cubrir, como mínimo: la secuencia libro → pluma → hoja → libro con un solo ícono visible, las tres fases con temporizadores simulados (nada antes de 300 ms, loader de 300 a 1000 ms, aviso pasados 1000 ms), el reinicio al volver a montarse, el cambio sin fundido con "reducir movimiento", la etiqueta accesible y el anuncio único del aviso, el loader compacto inmediato y sin aviso, el botón que conserva su ancho y no repite la acción, y la prueba que prohíbe `ActivityIndicator`.

## Recorrido manual

1. **Carga rápida**: abrir Más → Configuración → Periodos con la red normal. No debe verse ningún loader (la carga termina antes de 300 ms) o, si tarda un poco, solo el ícono sin texto.
2. **Carga normal**: con la red lenta, abrir Periodos. Después de unos 300 ms aparece un solo ícono que cambia libro → pluma → hoja → libro, uno a la vez, centrado y en verde.
3. **Carga lenta**: mantener la espera más de 1 segundo. Debajo del ícono aparece "Cargando… Esto está tardando más de lo normal." y el ícono sigue cambiando. Al llegar los datos, ícono y aviso desaparecen juntos.
4. **Error tras demora**: detener la API durante la espera. Pasado 1 segundo se ve el aviso; al fallar, desaparece y se muestra el estado de error con "Intentar de nuevo".
5. **Actualización en segundo plano**: con datos ya visibles, salir y volver a la pantalla. No debe aparecer el loader ni ocultarse el contenido.
6. **Botones**: pulsar "Guardar periodo" con la red lenta. El ícono del botón se reemplaza de inmediato por el loader compacto, el botón no cambia de tamaño y no se puede pulsar otra vez; sin aviso de demora.
7. **Arranque**: cerrar la app y abrirla con la red lenta; la pantalla de espera mientras se restaura la sesión usa el loader.
8. **Reducir movimiento**: activarlo en el emulador. Los íconos cambian de golpe cada 900 ms, sin fundido; las fases y el aviso se mantienen.
9. **Lector de pantalla**: con TalkBack o VoiceOver, una carga se anuncia como "Cargando…" y, pasado 1 segundo, el aviso de demora se anuncia una sola vez; el cambio de ícono no genera anuncios.
10. **Idioma**: cambiar el dispositivo entre español e inglés; el aviso y la etiqueta cambian.

## Comprobación de consistencia

- Ninguna pantalla muestra el círculo giratorio del sistema.
- `grep` de `ActivityIndicator` en `app/` y `src/` (fuera de pruebas) no devuelve nada.
