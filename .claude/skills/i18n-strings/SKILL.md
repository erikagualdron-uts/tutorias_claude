---
name: i18n-strings
description: "Agrega o modifica textos visibles de la app en español e inglés (archivos de traducción es.json y en.json, claves ordenadas, traducción de códigos de error del backend, plurales e interpolación). Úsala siempre que se escriba un texto que el usuario vea, un mensaje de error, una etiqueta o una plantilla de correo o push, aunque no se mencione i18n."
---

# Textos e idiomas (es / en)

El idioma sigue el del dispositivo (español o inglés, español por defecto). **Ningún texto visible va escrito en el código.**

## Archivos
- `mobile/src/i18n/es.json` (idioma base) y `mobile/src/i18n/en.json`.
- Plantillas de correo y push del backend: un archivo por idioma, según `User.locale`.

## Claves
- Formato `feature.section.key` en `camelCase`: `enrollments.card.enroll`, `schedule.sheet.changeTime`.
- Errores del backend: `errors.<CODE>` con el `code` exacto en `UPPER_SNAKE_CASE`: `errors.ENROLLMENT_SCHEDULE_CONFLICT`. Debe existir una clave por cada `code` que el backend pueda devolver.
- Textos comunes (Aceptar, Cancelar, Reintentar) en `common.*`.

## Pasos
1. Agregar la clave **en ambos archivos a la vez**, en el mismo lugar y orden.
2. Usar `t('clave', { variable })` con interpolación; nunca concatenar textos.
3. Para cantidades usar plurales de i18next (`_one`, `_other`): `18 estudiantes serán notificados` / `1 estudiante será notificado`.
4. Los mensajes de reglas bloqueadas dicen **qué regla** y **qué puede hacer el usuario**, en lenguaje simple.
5. Fechas y horas con el formato del idioma del dispositivo; nunca escribir el formato a mano en el texto.
6. Ejecutar la verificación de paridad:
   ```bash
   python .claude/skills/i18n-strings/scripts/check_i18n.py mobile/src/i18n/es.json mobile/src/i18n/en.json
   ```
   Debe terminar sin claves faltantes. Los textos pueden ser más largos en español; revisar que no se recorten.

## Estilo
- Español neutro y cercano, tuteo ("Tu inscripción se canceló").
- Sin signos de exclamación salvo celebraciones reales; sin tecnicismos.
- Inglés claro y breve, mismo significado que el español.
