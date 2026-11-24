# Quickstart: validar «Mi cuenta»

Guía para comprobar la spec 032. Las pantallas están en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
npx jest src/features/account src/features/auth src/features/shell src/components src/theme
```

| Qué comprueba | Cómo |
|---|---|
| El menú del avatar ofrece «Mi cuenta» y «Cerrar sesión» y lleva a la ruta del rol (FR-001) | prueba de `AppBar` |
| Datos de la cuenta con nombre o, si falta, correo, y rol con texto e ícono (FR-002) | pruebas de `AccountScreen` |
| Los tres estados del permiso de notificaciones (FR-011) | pruebas de `AccountScreen` |
| Cambio de contraseña voluntario: válido, clave actual incorrecta, clave nueva inválida; vuelve con confirmación sin cerrar la sesión (FR-003, FR-004) | pruebas de `AccountPasswordScreen` |
| El cambio obligatorio no cambió (FR-004, SC-003) | pruebas existentes de `ChangePasswordScreen` |
| Las pantallas `account` y `account-password` están ocultas de la barra y alcanzables en los tres roles | `hiddenScreens.test.tsx` (lee `ROLE_TABS`) |
| Una cabecera en «Mi cuenta» y ninguna en el cambio de contraseña (FR-008) | `headerBudget.test.ts` |
| Traducciones en español e inglés y sin valores sueltos (FR-009) | paridad de traducciones y `noLooseColors` |

## Recorrido manual (teléfono con Expo Go)

1. Con cada rol, tocar el avatar: aparecen «Mi cuenta» y «Cerrar sesión». Abrir «Mi cuenta»: nombre, correo y rol.
2. «Cambiar contraseña»: probar con datos válidos (vuelve a «Mi cuenta» con la confirmación y la sesión sigue abierta), con clave actual incorrecta y con clave nueva inválida.
3. Notificaciones: ver el estado con el permiso concedido; quitarlo en los ajustes del teléfono y volver (sin activar, con botón; bloqueado, con la explicación); activar desde «Mi cuenta» y comprobar que pasa a «Activadas».
4. «Cerrar sesión» desde la pantalla: vuelve al inicio de sesión.
5. Todo en claro y oscuro, en español e inglés y con letra grande.
6. Entrar con una cuenta de clave temporal: el cambio obligatorio sigue bloqueando la navegación como antes.
