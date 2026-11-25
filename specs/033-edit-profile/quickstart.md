# Quickstart: validar «Editar mi nombre»

Guía para comprobar la spec 033. Contrato en [contracts/profile-api.yaml](contracts/profile-api.yaml), tabla en [data-model.md](data-model.md).

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm run test:e2e -- students-own-name
cd tutorias_uts_mobile && npm test && npm run lint && npm run typecheck
```

| Qué comprueba | Dónde |
|---|---|
| Estudiante cambia su nombre y el registro guarda anterior y nuevo | Backend, `students` |
| Sin cambio: 200, sin escritura y sin registro | Backend |
| Nombre vacío, solo espacios o de más de 100: 400 | Backend |
| Docente y CAE reciben 403; sin token, 401 | Backend |
| Cuenta desactivada: no cambia nada | Backend |
| Falla a mitad: ni nombre nuevo ni registro (transacción) | Backend |
| La pantalla, el reflejo en la sesión, la validación y los errores | App, `features/account` |
| Estudiante ve «Editar nombre»; docente ve la regla; CAE ve su correo | App, `AccountScreen` |
| Paridad es y en, indicadores, presupuesto de cabecera | App, guardas existentes |

## Recorrido manual (teléfono, claro y oscuro, es y en)

1. Con la base y el backend arriba, entrar como estudiante, abrir el avatar, «Mi cuenta» y «Editar nombre».
2. Corregir nombre y apellido y guardar: vuelve a «Mi cuenta» con el nombre nuevo y una confirmación; el saludo y el chat lo muestran sin cerrar sesión.
3. Probar campos vacíos y 101 caracteres: error en el campo y no se pierde lo escrito.
4. Guardar sin cambios: vuelve sin error.
5. Entrar como docente: «Mi cuenta» sin acción de editar y con la regla del CAE.
6. Entrar como CAE: «Mi cuenta» con el correo como identificador, sin acción de editar.
7. Revisar en la base que `student_name_changes` tiene una fila por cada cambio efectivo.
