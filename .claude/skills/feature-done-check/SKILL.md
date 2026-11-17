---
name: feature-done-check
description: "Revisa que una funcionalidad cumpla la Definición de terminado del proyecto antes de unir la rama a main: spec, pruebas de reglas de negocio, lint y tipos, textos en es y en, diseño, documentación y decisiones. Úsala siempre que el usuario diga que una funcionalidad está lista, pida revisar antes de hacer merge o Pull Request, o cuando termine /speckit-implement."
---

# Revisión de funcionalidad terminada

Fuente: `docs/Conventions.md` sección 6 ("Definición de terminado"). No des por terminada una funcionalidad sin recorrer **todos** los puntos y reportar el resultado de cada uno.

## Pasos
1. **Spec:** leer `specs/NNN-nombre/spec.md` y confirmar, criterio por criterio, que el código lo cumple. Listar lo que falta.
2. **Reglas de negocio con pruebas:** identificar las reglas de `Context.md` sección 7 que toca la funcionalidad y confirmar que cada una tiene pruebas (ver skill `business-rule-tests`).
3. **Calidad automática:** ejecutar y reportar el resultado real (no suponer):
   ```bash
   cd backend && npm run test && npm run lint
   cd ../mobile && npm run lint && npm run typecheck && npm test
   ```
   Si un comando no existe aún, decirlo; no omitirlo en silencio.
4. **Textos:** ejecutar `check_i18n.py` (skill `i18n-strings`). Buscar textos escritos directamente en componentes.
5. **Diseño:** revisar que no haya hexadecimales sueltos, que se cumplan los cuatro estados de pantalla y los objetivos táctiles de 48 px (skill `uts-ui`). Verificar también: ningún import de librerías de íconos distintas a Iconify (buscar `@expo/vector-icons` y `lucide`), todos los botones con ícono, 16 px entre botones apilados y animaciones que respetan "reducir movimiento", campos de texto con relleno y borde, decoración solo con `BrandPattern` (sin círculos ni arcos) ningún `fontFamily` ni `fontWeight` escrito en componentes (solo tokens del tema) y el nombre oficial de la institución (buscar "Unidades Tecnológicas" en el código y las traducciones).
6. **Seguridad:** endpoints con guard de roles, sin datos sensibles en respuestas ni logs, secretos fuera del repositorio.
7. **Documentación:** confirmar que `docs/` refleja lo implementado (modelo de datos, reglas, pantallas). Si hubo una decisión importante, debe estar en `docs/Decisions.md`.
8. **Git:** commits en formato Conventional Commits y rama `NNN-feature-name`.

## Formato del reporte
Responder con una tabla de 8 filas: punto, estado (Cumple / Falta / No aplica) y evidencia o qué falta. Cerrar con una de estas conclusiones:
- **Lista para unir**, o
- **No lista**, con la lista exacta de pendientes en orden de prioridad.
