# Contrato de tipografía

**Tokens `fonts`** (`src/theme/tokens.ts`): `regular`, `semibold`, `bold`, `mono`. Son el único lugar con nombres de fuente. Cambiar de respaldo a Myriad Pro es cambiar estos valores y los archivos que carga `useAppFonts`.

**Estilos `typography`**: los de `data-model.md`. Los componentes y pantallas MUST usar solo estos estilos (`typography.body`, `typography.button`, etc.) y MUST NOT escribir `fontFamily` ni `fontWeight`.

**`useAppFonts`** (`src/theme/index.ts`): carga las fuentes con `useFonts` y devuelve si están listas (o si fallaron).

**Arranque** (`app/_layout.tsx`): retiene el splash hasta que las fuentes carguen, fallen o pasen 5 s; después muestra la app (con la fuente del sistema si falló).

**Prueba de contrato**: ningún archivo fuera de `src/theme/` contiene `fontFamily` ni `fontWeight`.
