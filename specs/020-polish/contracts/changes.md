# Cambios de contrato (spec 020)

La spec 020 **no agrega endpoints**. Hay un solo cambio, aditivo, sobre `specs/017-pqrs/contracts/pqrs-api.yaml`.

## `GET /pqrs/mine/:id` (roles `STUDENT` y `TEACHER`)

El esquema `PqrsMineDetail` agrega dos campos obligatorios que pueden ser nulos:

```yaml
reviewedAt: { type: string, format: date-time, nullable: true }
resolvedAt: { type: string, format: date-time, nullable: true }
```

- Mismos nombres y tipos que ya tiene `PqrsAdminDetail`.
- Una PQRS ajena sigue respondiendo `404 PQRS_NOT_FOUND`; los permisos no cambian.
- Compatibilidad: quien ignora los campos nuevos sigue funcionando.
- Al implementar, se actualiza `pqrs-api.yaml` (esquema `PqrsMineDetail`) y `pqrs-contract.e2e-spec.ts` valida la respuesta real contra él.

## Endpoints que se reutilizan sin cambios

| Uso | Endpoint |
|---|---|
| Insignia de PQRS radicadas del CAE | `GET /pqrs?status=FILED&limit=1` (`meta.total`), solo `SUPERADMIN` |
| Radicar | `POST /pqrs` (la respuesta ya trae `id`, `createdAt` y `status`) |
