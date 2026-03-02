# ADR-006: Solo Roles del Sistema — Sin Roles Personalizados

**Fecha:** 2026-02-01  
**Estado:** Aceptado  
**Reemplaza:** diseño de la era ADR-005 donde `Role` tenía `tenantId` y factory `createCustom()`

---

## Contexto

La entidad `Role` original soportaba tanto roles del sistema (sin `tenantId`) como roles personalizados por tenant (con `tenantId`). Esto requería consultas `findByIdAndTenantId()`, una factory `createCustom()`, métodos de mutación `updatePermissions()` / `rename()`, guards contra la mutación de roles del sistema, y endpoints adicionales para CRUD de roles. Toda esta complejidad fue agregada de forma especulativa antes de que existiera alguna necesidad real de producto.

## Decisión

Se eliminan los roles personalizados. El sistema tiene exactamente dos roles: `ADMIN` y `STAFF`. Estos se insertan automáticamente al arrancar mediante `RoleSeedService` usando `OnApplicationBootstrap`.

La entidad `Role` ya no tiene `tenantId`, `isSystem`, `createCustom()`, `updatePermissions()`, ni `rename()`. La interfaz del repositorio se reduce a tres métodos: `save`, `findById`, `findSystemRoles`.

```
Permisos ADMIN: CRUD de propiedades, CRUD de unidades, reservas, finanzas, CRM, integraciones, gestión de usuarios
Permisos STAFF: lectura de propiedades/unidades, crear/editar/eliminar reservas
```

El nivel de acceso real de un miembro del personal resulta de combinar su rol (qué permisos otorga) con su scope (a qué recursos aplican esos permisos).

## Consecuencias

**Positivas:**

- Modelo de dominio, repositorio y schema drásticamente más simples
- No se requiere una API de gestión de roles — nada que construir, documentar, asegurar ni testear
- El seeding es idempotente y se ejecuta con seguridad en cada arranque

**Negativas:**

- Los tenants no pueden definir conjuntos de permisos personalizados. Si un cliente futuro necesita un rol entre STAFF y ADMIN, esta decisión debe revisarse.
- Para cambiar lo que ADMIN o STAFF pueden hacer, se requiere un cambio de código + despliegue
