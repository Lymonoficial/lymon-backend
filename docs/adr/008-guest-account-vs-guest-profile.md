# ADR-008: Separación entre GuestAccount (credenciales) y Guest (perfil CRM)

**Fecha:** 2026-03-02  
**Estado:** Aceptado

---

## Contexto

Lymon originalmente modelaba al huésped como una única entidad `Guest` que mezclaba dos responsabilidades distintas:

1. **Credenciales de acceso** — email, contraseña, estado de verificación, tokens de seguridad.
2. **Perfil CRM** — datos de contacto, historial de estancias, notas internas, scoped por tenant.

Este modelo generaba varios problemas:

- Un huésped que se hospeda en dos propiedades de tenants diferentes necesitaría dos cuentas con la misma dirección de email, o se compartiría el mismo registro entre tenants (violación del aislamiento multi-tenant).
- Los datos de autenticación (hash de contraseña, token de verificación de email) convivían con datos CRM de naturaleza operativa.
- No existía forma de registrar a un huésped en el portal sin que eso creara o interfiriera con los registros CRM de los tenants.
- Huéspedes importados desde canales externos (Airbnb, Booking.com) no tienen cuenta en el portal, pero sí deben existir como perfil CRM para cada tenant.

## Decisión

Dividimos el concepto de "huésped" en dos entidades con responsabilidades distintas:

### `GuestAccount` — credenciales globales

```
domain/guest-account/
  entities/guest-account.entity.ts      ← aggregate root
  entities/guest-account.types.ts
  value-objects/guest-account-id.vo.ts
  value-objects/guest-account-status.vo.ts
  repositories/guest-account.repository.ts
```

- Existe **una sola instancia por dirección de email** en todo el sistema (no está scoped por tenant).
- Almacena: hash de contraseña, estado de verificación de email, tokens de seguridad (hashed SHA-256), `passwordChangedAt`.
- Sus estados son: `PENDING_VERIFICATION → ACTIVE → SUSPENDED`.
- Tiene su propia estrategia Passport (`'guest-jwt'`) con un discriminador `type: 'guest'` en el payload para impedir que tokens de staff se usen en endpoints de huéspedes y viceversa.

### `Guest` — perfil CRM por tenant

```
domain/guest/
  entities/guest.entity.ts    ← aggregate root (sin cambios de comportamiento)
```

- Siempre está scoped por `tenantId`.
- Almacena: nombre, email de contacto (snapshot, no auth), teléfono, país, notas, resumen agregado del historial de reservas.
- Contiene un campo opcional `guestAccountId: GuestAccountId | null` que, cuando está presente, vincula el perfil CRM con la cuenta del portal.
- Es gestionado por el staff del tenant, no directamente por el huésped.

### Regla de vinculación

```
GuestAccount (global, 1 por email)
       │
       │ guestAccountId (nullable)
       ▼
Guest  (per-tenant, N por GuestAccount posibles)
```

`guestAccountId` puede ser `null` en tres escenarios válidos:

- Huéspedes importados desde canales externos (Airbnb, Booking.com) que nunca se registraron en el portal.
- Reservas de walk-in creadas manualmente por el staff.
- Huéspedes que se registran en el portal después de su primera reserva (el vínculo se establece a posteriori).

## Consecuencias

**Positivas:**

- Un huésped puede tener perfil en múltiples tenants con una sola cuenta — el email es la clave global, los datos CRM están aislados por tenant.
- Los endpoints de autenticación del portal (`/guest/auth/*`) operan sobre `GuestAccount` sin tocar datos CRM de ningún tenant.
- El staff puede crear y gestionar perfiles `Guest` sin necesidad de que el huésped tenga cuenta en el portal.
- La invalidación de sesión por cambio de contraseña funciona correctamente: `passwordChangedAt` en `GuestAccount` se compara con el claim `iat` del JWT en la estrategia `GuestJwtStrategy`.
- Los tokens de verificación de email y recuperación de contraseña usan el patrón plain-in-email / hash-in-DB con SHA-256, que permite queries directas por token sin exponer datos ante una filtración de base de datos.

**Negativas:**

- Cuando un huésped se registra en el portal, se requiere un paso extra para vincular su `GuestAccount` al perfil `Guest` preexistente del tenant (búsqueda por email normalizado).
- Dos modelos para "huésped" puede sorprender a desarrolladores que se incorporen al proyecto — requiere documentación explícita de la distinción.
