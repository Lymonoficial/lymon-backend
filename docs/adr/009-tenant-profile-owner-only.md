# ADR-009: Gestión de Perfil del Tenant — Acceso OWNER-only (US-004)

**Fecha:** 2026-03-02  
**Estado:** Aceptado

---

## Contexto

Se implementó la capacidad de leer y actualizar el perfil del tenant (`GET /tenant/profile`, `PATCH /tenant/profile`). Surgieron decisiones sobre qué campos son editables, quién puede editarlos, y cómo modelar el acceso exclusivo del Owner sin introducir un rol nuevo.

---

## Decisión 1 — Campos editables del perfil

### Campos incluidos

| Campo          | Tipo           | Razón                                                        |
|----------------|----------------|--------------------------------------------------------------|
| `name`         | `string`       | Nombre del negocio — puede cambiar por rebranding            |
| `contactPhone` | `string\|null` | Teléfono de contacto operativo                               |
| `address`      | `string\|null` | Dirección física del negocio                                 |
| `website`      | `string\|null` | Sitio web público                                            |
| `logoUrl`      | `string\|null` | URL del logo (upload manejado por separado, ver ADR-008)     |

### Campos excluidos

| Campo        | Razón de exclusión                                                |
|--------------|-------------------------------------------------------------------|
| `ownerEmail` | Cambio de email requiere verificación y rehashing de credenciales |
| `plan`       | Cambio de plan es operación de billing con implicaciones de límites|

---

## Decisión 2 — OWNER-only via permiso existente, sin rol nuevo

### Problema

`PATCH /tenant/profile` debe ser accesible únicamente por el Owner. La forma de restringir acceso en este sistema es mediante `@RequirePermission(Permission.X)`. Se podría:

- **Opción A:** Crear un nuevo permiso `TENANT_PROFILE_UPDATE` no asignado a nadie más
- **Opción B:** Reutilizar el permiso existente `TENANT_SETTINGS_EDIT` que ya existe en el enum y no está asignado a `ADMIN_PERMISSIONS` ni `STAFF_PERMISSIONS`

### Decisión

Se eligió la **Opción B**. El endpoint usa `@RequirePermission(Permission.TENANT_SETTINGS_EDIT)`.

### Razón

`TENANT_SETTINGS_EDIT` fue definido desde el inicio con exactamente esta semántica. No tiene sentido introducir otro permiso con el mismo significado. El `PermissionGuard` otorga acceso implícito a `isOwner = true` sin revisar permisos, por lo que el flujo es:

```
Owner     → PermissionGuard ve isOwner=true → acceso concedido
ADMIN     → PermissionGuard revisa permissions[] → no contiene TENANT_SETTINGS_EDIT → 403
STAFF     → PermissionGuard revisa permissions[] → no contiene TENANT_SETTINGS_EDIT → 403
```

---

## Decisión 3 — GET profile accesible a todos los usuarios del tenant

### Problema

¿Quién puede leer el perfil del tenant?

- **Opción A:** Solo el Owner
- **Opción B:** Cualquier usuario autenticado del tenant (sin `@RequirePermission`)

### Decisión

Se eligió la **Opción B**. `GET /tenant/profile` usa solo `JwtAuthGuard`.

### Razón

El nombre del negocio, dirección y datos de contacto son información operativa que el STAFF necesita para su trabajo diario. No hay riesgo de exposición — el tenant ID en el JWT garantiza que cada usuario solo accede al perfil de su propio tenant.

---

## Consecuencias

- `TENANT_SETTINGS_EDIT` permanece sin asignar en `ADMIN_PERMISSIONS` y `STAFF_PERMISSIONS` — cualquier intento futuro de asignarlo a ADMIN rompería el acceso exclusivo del Owner
- Los campos opcionales se inicializan como `null` en `Tenant.create()` — los tenants existentes no requieren migración de datos gracias a `@Prop({ default: null })`
- Si en el futuro se requiere que ADMIN gestione el perfil, basta con agregar `TENANT_SETTINGS_EDIT` a `ADMIN_PERMISSIONS` — no requiere cambio de código en controllers ni handlers
