# Quickstart: validar el UI refresh

Prerrequisitos: API y Docker de la 001 en marcha; app con `npx expo start` en Expo Go; los logos en `assets/brand/`.

## Chequeos automáticos (`tutorias_uts_mobile`)

```bash
npm run typecheck && npm run lint && npm test
```

Esperado: todo en verde, incluidas las 48 pruebas previas y las nuevas de `Icon`, `Button` y de ausencia de otras librerías de íconos.

Chequeos estáticos (sin resultados esperados):

```bash
grep -rnE "vector-icons|expo-symbols" app src package.json
grep -rnE "#[0-9A-Fa-f]{6}" app src/features
```

## Escenarios manuales

| # | Escenario | Resultado esperado |
|---|---|---|
| 1 | Abrir la app sin sesión | Splash con el logo oficial; luego login con cabecera de degradado, logo blanco y tarjeta (FR-006, FR-007) |
| 2 | Login: ver botones | "Iniciar sesión" y "Crear cuenta" con ícono a la izquierda y 16 px entre ellos (FR-002, FR-003) |
| 3 | Registro, verificación, recuperar, restablecer y cambio de clave | Misma cabecera, tarjeta y botones con ícono |
| 4 | Entrar como estudiante, docente y CAE | Pestañas y barra con íconos `solar`; fondo `#F2F4EF` en claro (FR-004) |
| 5 | Abrir diálogo de clave temporal y menú de perfil | Aparecen con animación corta |
| 6 | Activar "reducir movimiento" y repetir 1 a 5 | Solo fundidos, sin deslizamientos ni escala (FR-008) |
| 7 | Modo oscuro | Paleta oscura actual, íconos y botones legibles |
| 8 | Fuente del sistema grande | Sin recortes; objetivos de 48 px (FR-011) |
| 9 | Cambiar `radius.card` en el tema | Todas las tarjetas cambian (SC-004) |
| 10 | Repetir los flujos de la 001 (login, registro, recuperación, alta de docente) | Funcionan igual (FR-012) |
