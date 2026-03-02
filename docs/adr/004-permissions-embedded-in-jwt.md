# ADR-004: Permisos Resueltos al Iniciar Sesión e Insertados en el JWT

**Fecha:** 2026-01-15  
**Estado:** Aceptado

---

## Contexto

Los guards necesitan verificar si un usuario tiene acceso a un recurso específico en cada request. Hay dos enfoques:

**Opción A — Resolver en cada request:** El guard consulta la base de datos en cada request para cargar los roles y permisos del usuario.

**Opción B — Resolver al iniciar sesión:** Los permisos se buscan una sola vez durante el login y se insertan en el payload del JWT. Los guards leen desde el token.

## Decisión

Elegimos la **Opción B**. Al hacer login, `LoginHandler` itera los `roleAssignments` del usuario, busca cada documento `Role` para obtener su `Permission[]`, y construye un array `ResolvedRoleAssignment[]` insertado directamente en el payload del JWT:

```typescript
// login.handler.ts — se ejecuta una sola vez al iniciar sesión
for (const assignment of user.getRoleAssignments()) {
  const role = await this.roleRepository.findById(...);
  resolvedAssignments.push({
    roleId, roleName, permissions: role.getPermissions(), scope
  });
}
// los permisos viajan dentro del JWT desde este punto
```

La interfaz `JwtPayload` refleja esto:

```typescript
export interface JwtPayload {
  isOwner: boolean;
  roleAssignments: ResolvedRoleAssignment[]; // permisos ya resueltos
  ...
}
```

`ScopeGuard` lee `request.user.roleAssignments` directamente — sin base de datos involucrada.

## Consecuencias

**Positivas:**

- Cero consultas a la base de datos por request para autorización — mejor latencia, sin N+1 en rutas protegidas
- Los guards son funciones puras sobre el payload del token; simples y testeables
- Funciona correctamente incluso si la colección de roles no está disponible temporalmente

**Negativas:**

- Los cambios de permisos (ej. se actualizan los permisos de un rol) no tienen efecto hasta que el access token del usuario expire (15 minutos). Si en el futuro se necesita revocación inmediata, habrá que introducir una lista negra de tokens o tokens de vida muy corta.
- El tamaño del JWT crece levemente con cada role assignment. Para usuarios con muchas asignaciones podría ser medible, pero el personal hotelero raramente tendrá más de un puñado.
