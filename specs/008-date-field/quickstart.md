# Quickstart: validar el campo de fecha

Guía de validación; el detalle de la interfaz está en [contracts/date-field.md](contracts/date-field.md) y los valores en [data-model.md](data-model.md).

## Prerrequisitos

```bash
cd tutorias_uts_db && docker compose up -d      # PostgreSQL y Redis
cd tutorias_uts_back && npm run start:dev       # API
cd tutorias_uts_mobile && npm install
npx expo install @react-native-community/datetimepicker
```

Iniciar sesión como CAE y abrir **Más → Periodos académicos → Crear periodo**.

## Automático

```bash
cd tutorias_uts_mobile
npm run typecheck && npm run lint
npm test
TZ=Pacific/Auckland npm test -- day DateField periods     # que el día no se corra
TZ=America/Los_Angeles npm test -- day DateField periods
```

Esperado: todo en verde en las tres zonas horarias.

## Manual (Android y iOS, Expo Go)

1. **Elegir sin teclear** — tocar "Fecha de inicio": se abre el selector del sistema, no el teclado. Elegir 05/02/2027 y confirmar: el campo muestra `05/02/2027`.
2. **Cancelar** — con la fecha anterior ya elegida, abrir el selector, cambiar de día y cancelar: el campo sigue en `05/02/2027`.
3. **Posición inicial** — volver a tocar el campo: el selector abre en febrero de 2027.
4. **Regla inicio/fin** — abrir "Fecha de fin": el 05/02/2027 y días anteriores no se pueden elegir; debajo se lee "Debe ser posterior a la fecha de inicio."
5. **Cambiar el inicio después** — elegir fin 10/02/2027 y mover el inicio a 15/02/2027: el fin se marca con error y la regla se explica; "Guardar periodo" no envía.
6. **Obligatoria** — guardar con una fecha vacía: error "Este campo es obligatorio" (o su clave equivalente) bajo el campo.
7. **Solapamiento** — crear un periodo que choque con otro: la app muestra el mensaje con el periodo con el que choca.
8. **Listado** — las fechas del listado se ven como `dd/mm/YYYY` en español e inglés (cambiar el idioma del dispositivo).
9. **Solo lectura** — abrir un periodo cerrado: las fechas se ven con 60 % de opacidad y no abren el selector.
10. **Zona horaria** — cambiar la zona del dispositivo a Nueva Zelanda y a Los Ángeles, elegir 31/12/2026, guardar y reabrir: sigue siendo `31/12/2026`.
11. **Lector de pantalla** (TalkBack o VoiceOver) — el campo anuncia etiqueta, valor ("Sin seleccionar" si está vacío) y que abre un selector de fecha.
12. **Reducir movimiento** — activado, la hoja de iOS aparece sin animación.

## Criterios de salida

SC-001 a SC-006 de [spec.md](spec.md) comprobados; `/feature-done-check` sin pendientes.
