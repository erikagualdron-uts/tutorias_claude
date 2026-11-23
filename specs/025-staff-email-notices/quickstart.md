# Quickstart: validar los avisos por correo del personal

Guía para comprobar la spec 025. No contiene código de implementación; la regla está en [data-model.md](data-model.md) y las decisiones en [research.md](research.md).

## Pruebas automáticas

```bash
cd tutorias_uts_back && npm test && npm run lint
npx vitest run --config ./vitest.config.e2e.ts test/notifications-staff-email test/notifications-delivery-email test/log-redaction
```

| Qué comprueba | Cómo |
|---|---|
| Un docente recibe el correo de cada aviso de su PQRS (SC-001) | `notifications-staff-email.e2e-spec.ts`; con el código anterior falla con `EMAIL_DOMAIN_NOT_ALLOWED` |
| Cuenta del CAE por la misma regla | la misma prueba |
| Dominio ajeno, subdominio parecido o texto añadido siguen omitidos con su motivo (SC-003) | la misma prueba |
| Un cambio de dominio en la configuración aplica al siguiente aviso | la misma prueba |
| Los estudiantes siguen igual (SC-002) | `notifications-delivery-email.e2e-spec.ts` |
| Sin direcciones ni textos en los registros | `log-redaction.e2e-spec.ts` |

## Recorrido manual (base de desarrollo)

1. Con la API en marcha, entrar como `docente.ejemplo@correo.uts.edu.co` y radicar una PQRS (o usar la que ya existe en la base).
2. Como `cae@correo.uts.edu.co`, pasarla a revisión y responderla.
3. En unos 5 segundos, comprobar en la base que la entrega por correo del docente quedó `SENT` (antes quedaba `SKIPPED`) y que el correo llegó a la cuenta de Gmail configurada como SMTP si la dirección existe.
4. Comprobar que los avisos de un estudiante siguen enviándose.
