# ADR-005: Los Usuarios Tienen Múltiples Role Assignments en Lugar de un Rol Único

**Fecha:** 2026-01-15  
**Estado:** Aceptado  
**Reemplaza:** diseño inicial donde `User` tenía `role: UserRoleEnum` y `scope: UserScope`

---

## Contexto

El modelo inicial le daba a cada usuario un único `role` (OWNER | ADMIN | STAFF) y un único `scope` (TENANT | PROPERTY | UNIT con resourceIds). Esto se convirtió en un problema al considerar un caso de uso hotelero real: un miembro del personal podría ser ADMIN en la Propiedad A, pero solo tener acceso STAFF en la Propiedad B. Un único role+scope no puede representar esto.

## Decisión

Los usuarios ahora tienen un array `roleAssignments: RoleAssignment[]` en lugar de un rol único. Cada entrada combina un rol con un scope:

```typescript
export interface RoleAssignment {
  roleId: string;
  scope: UserScope; // { type: 'TENANT' } | { type: 'PROPERTY', resourceIds: string[] } | ...
}
```

Los owners se identifican por `isOwnerFlag: boolean` en lugar de un valor de rol. El getter `isOwner()` retorna este flag. Los owners tienen `roleAssignments: []` vacío — su acceso completo es implícito.

`ScopeGuard` itera el array y otorga acceso en cuanto encuentra cualquier assignment que coincida. Esto hace que la autorización sea aditiva.

Al invitar a un miembro del personal vía `POST /user/add-staff`, el caller provee el array `roleAssignments` completo en el cuerpo del request.

## Consecuencias

**Positivas:**

- Puede representar cualquier patrón de acceso real del personal sin cambios de schema
- Agregar una nueva asignación de recurso a un usuario existente es un simple append al array
- La lógica del guard permanece como un escaneo lineal único del array

**Negativas:**

- Flujo de invitación levemente más complejo — el caller debe construir un array en lugar de proveer un único string de rol
