# Research: Avisos por correo para docentes y CAE

Sin `NEEDS CLARIFICATION` abiertos. Lo comprobado en el código y en la base de desarrollo el 2026-11-23.

## R-1. De dónde viene el defecto

- **Hallazgo**: `DeliveriesService.deliverEmail` lee solo `auth.studentEmailDomain` y omite la entrega con `EMAIL_DOMAIN_NOT_ALLOWED` si la dirección no coincide. Un docente (`@correo.uts.edu.co`) nunca coincide. Comprobado con el flujo real: el aviso de una PQRS de `docente.ejemplo` se creó y su correo quedó omitido; el de un estudiante se envió.
- **Origen**: cuando se escribió (spec 014) los avisos iban solo a estudiantes, y la regla evitaba escribir a direcciones ajenas. Con las PQRS (spec 017) un docente puede ser destinatario y la regla quedó corta; no está documentada en `docs/` ni en las specs.

## R-2. Qué regla aplicar

- **Decisión**: la dirección es válida si coincide con `auth.studentEmailDomain` **o** con `auth.staffEmailDomain`, comparada con `hasEmailDomain` (exacta, sin distinguir mayúsculas ni espacios, y sin aceptar subdominios ni texto añadido). Cualquier otra se omite con el mismo motivo.
- **Razón**: FR-001 y FR-002; conserva la salvaguarda, usa llaves de configuración que ya existen (Principio III) y no depende del rol, así que un aviso futuro para el CAE funciona sin otro cambio.
- **Alternativas**: quitar la comprobación (permitiría escribir a una dirección personal del CAE de desarrollo, pero pierde la salvaguarda; descartado en la aclaración); decidir por rol (docente y CAE sí, estudiante por dominio: duplica la regla y no cubre una cuenta con un correo fuera de su dominio); una lista de direcciones permitidas administrable (agrega configuración y pantalla; descartado en la aclaración).

## R-3. Configuración en tiempo de ejecución

- **Hallazgo**: `SettingsService.get` lee la tabla `settings` en cada llamada, sin caché.
- **Decisión**: se leen las dos llaves en cada entrega; un cambio de dominio hecho por el CAE aplica al siguiente aviso (escenario 4 de la historia 2), sin reiniciar. Una prueba lo comprueba escribiendo la llave en la base.
- **Coste**: una consulta más por entrega por correo, despreciable frente al envío.

## R-4. Qué no se toca

- **Sin avisos nuevos**: el CAE no es destinatario de ningún evento y sigue sin serlo (aclaración 1). La regla le abre el canal para el día que lo sea; su cuenta de desarrollo, `cae@correo.uts.edu.co`, ya está en el dominio del personal.
- **Sin reenvío retroactivo**: las entregas ya `SKIPPED` quedan así; el envío solo procesa entregas `PENDING` (FR-005).
- **Sin SMTP**: se mantiene el comportamiento actual (la entrega queda pendiente y no gasta intentos).
- **Registros**: no se agrega ningún registro; la prueba de la 023 (`log-redaction`) ya cubre que no salgan direcciones ni textos y se amplía con el caso del docente.

## R-5. Pruebas

- **Decisión**: `notifications-staff-email.e2e-spec.ts` con el patrón de `pqrs-notifications.e2e-spec.ts`: un docente autor de una PQRS, el CAE la pasa a revisión, la responde y la resuelve, se corre la salida de eventos y se entrega el correo de cada aviso con el falso de SMTP. Casos: (1) los tres avisos del docente se envían a su dirección, en español, y uno en inglés cuando su idioma lo es, sin el texto de la respuesta; (2) una cuenta del CAE con un aviso creado directamente en la base se envía por la misma regla; (3) una cuenta de dominio ajeno, con subdominio parecido o con texto añadido queda omitida con su motivo y su aviso de bandeja existe; (4) cambiar `auth.staffEmailDomain` en la base cambia la decisión del siguiente envío; (5) las entregas de estudiantes siguen igual (la prueba existente).
- **Razón**: FR-008 y SC-001 a SC-003; escribir primero el caso del docente, que falla con el código actual por `EMAIL_DOMAIN_NOT_ALLOWED`.
