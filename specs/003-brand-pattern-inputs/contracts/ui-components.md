# Contrato de componentes

**BrandPattern**: prop `variant` (`header` o `hero`). Sin toques, oculto a lectores, memoizado, fundido único de 350 ms (sin animación con reducir movimiento). En `header` deja libre la zona central. Solo se monta en cabeceras de acceso, splash y tarjetas destacadas.

**TextField**: props `label`, `leadingIcon` (obligatorio), `error`, `password`, `onCard` (true por defecto) y `disabled`. Altura 52 px, radio 12, relleno horizontal 16, borde 1 px; foco 2 px con halo; error 1 px #B3261E con ícono y mensaje; deshabilitado al 60 %.

**SelectField, TextAreaField, SearchField y campo de chat**: mismas reglas visuales. El selector lleva chevron al final; el área de texto crece hasta 6 líneas con contador abajo a la derecha; el chat sigue la caja de `Design.md` (mínimo 48 px, hasta 5 líneas).

**Textos**: `brand.institution` = "Institución Universitaria Tecnológica de Santander – UTS" en español e inglés.
