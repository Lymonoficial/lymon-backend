# Roles y Control de Acceso

## Resumen

El sistema implementa **control de acceso basado en roles (RBAC)** con alcance por tenant y granularidad a nivel de recurso. Cada usuario del sistema es un **Owner** (acceso total) o un **miembro del personal** con uno o más role assignments. Cada assignment combina un rol del sistema con un scope que limita a qué recursos aplica.

---

## Conceptos Fundamentales

### 1. Tipos de Usuario

| Tipo      | Cómo se crea           | Acceso                                                                 |
| --------- | ---------------------- | ---------------------------------------------------------------------- |
| **Owner** | `POST /auth/register`  | Acceso total a todo dentro de su tenant. No necesita role assignments. |
| **Staff** | `POST /user/add-staff` | Acceso limitado definido por su array `roleAssignments`.               |

El flag `isOwner` es la fuente de verdad. Todos los guards permiten el paso al owner incondicionalmente.

---

### 2. Roles del Sistema

Existen exactamente dos roles predefinidos. Los roles personalizados no están soportados. Los roles se insertan automáticamente en la base de datos al arrancar la aplicación.

#### `ADMIN`

Acceso operativo amplio. Pensado para managers que dirigen las operaciones del día a día.

| Permiso               | Descripción                               |
| --------------------- | ----------------------------------------- |
| `PROPERTY_VIEW`       | Ver propiedades                           |
| `PROPERTY_CREATE`     | Crear nuevas propiedades                  |
| `PROPERTY_EDIT`       | Editar propiedades                        |
| `UNIT_VIEW`           | Ver unidades                              |
| `UNIT_CREATE`         | Crear nuevas unidades                     |
| `UNIT_EDIT`           | Editar unidades                           |
| `RESERVATION_VIEW`    | Ver reservas                              |
| `RESERVATION_CREATE`  | Crear reservas                            |
| `RESERVATION_EDIT`    | Editar reservas                           |
| `FINANCE_VIEW`        | Ver datos financieros                     |
| `FINANCE_CREATE`      | Crear registros financieros               |
| `FINANCE_EDIT`        | Editar registros financieros              |
| `CRM_VIEW`            | Ver datos de CRM                          |
| `CRM_MANAGE`          | Gestionar datos de CRM                    |
| `INTEGRATION_VIEW`    | Ver integraciones                         |
| `TENANT_USERS_MANAGE` | Invitar y gestionar miembros del personal |

#### `STAFF`

Acceso operativo restringido. Pensado para personal de recepción u operativo.

| Permiso              | Descripción       |
| -------------------- | ----------------- |
| `PROPERTY_VIEW`      | Ver propiedades   |
| `UNIT_VIEW`          | Ver unidades      |
| `RESERVATION_VIEW`   | Ver reservas      |
| `RESERVATION_CREATE` | Crear reservas    |
| `RESERVATION_EDIT`   | Editar reservas   |
| `RESERVATION_DELETE` | Eliminar reservas |

---

### 3. Scopes

Un scope define **a qué recursos** aplica un role assignment. Cada role assignment tiene exactamente un scope.

| Tipo de scope | Significado                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| `TENANT`      | El rol aplica a todo el tenant (todas las propiedades y unidades)             |
| `PROPERTY`    | El rol aplica solo a propiedades específicas, identificadas por `resourceIds` |
| `UNIT`        | El rol aplica solo a unidades específicas, identificadas por `resourceIds`    |

Un único miembro del personal puede tener **múltiples role assignments**. Ejemplo: ADMIN en la Propiedad A, STAFF en la Propiedad B.

---

### 4. Permisos en el JWT

Los permisos se **resuelven al iniciar sesión** y se insertan directamente en el access token JWT. Los guards nunca hacen una consulta a la base de datos por request — leen lo que ya está en el token.

**Estructura del payload JWT:**

```json
{
  "userId": "...",
  "email": "staff@hotel.com",
  "tenantId": "...",
  "activePlan": "LymonOne",
  "isOwner": false,
  "emailVerified": true,
  "roleAssignments": [
    {
      "roleId": "...",
      "roleName": "ADMIN",
      "permissions": ["PROPERTY_VIEW", "PROPERTY_EDIT", "..."],
      "scope": {
        "type": "PROPERTY",
        "resourceIds": ["prop_abc123"]
      }
    }
  ]
}
```

Los owners tienen `isOwner: true` y `roleAssignments: []` — el array vacío es intencional; todos los permisos están implícitos.

Tiempos de vida de los tokens:

- **Access token**: 15 minutos
- **Refresh token**: 7 días

---

## Endpoints de la API

### `POST /auth/register`

Registra un nuevo tenant y crea la cuenta del owner.

**Cuerpo del request:**

```json
{
  "tenantName": "Hotel Playa",
  "email": "owner@hotel.com",
  "password": "SecurePass123!",
  "planType": "LymonOne"
}
```

**Respuesta `201`:**

```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "tenantId": "...",
    "userId": "...",
    "email": "owner@hotel.com",
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

Se envía un email de verificación automáticamente. La cuenta puede autenticarse de inmediato pero algunas funcionalidades pueden requerir `emailVerified: true`.

---

### `POST /auth/login`

Autentica cualquier usuario (owner o staff). Los permisos se resuelven y se insertan en los tokens retornados.

**Cuerpo del request:**

```json
{
  "email": "staff@hotel.com",
  "password": "SecurePass123!"
}
```

**Respuesta `200`:**

```json
{
  "message": "Login successful",
  "data": {
    "userId": "...",
    "email": "staff@hotel.com",
    "tenantId": "...",
    "isOwner": false,
    "emailVerified": true,
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

---

### `GET /auth/verify-email?token=<jwt>`

Verifica la dirección de email desde el enlace enviado al registrarse. El parámetro `token` es el JWT del email de verificación.

**Respuesta `200`:**

```json
{
  "message": "Email verified successfully. You can now access all features."
}
```

---

### `GET /auth/me`

Retorna el payload JWT completo y decodificado del usuario autenticado actualmente. Requiere `Authorization: Bearer <access_token>`.

---

### `POST /user/add-staff`

Invita a un miembro del personal al tenant. Requiere autenticación. Solo usuarios con `isOwner: true` o el permiso `TENANT_USERS_MANAGE` pueden llamar esto con sentido (el control de acceso se aplica en la lógica de negocio).

**Headers:** `Authorization: Bearer <access_token>`

**Cuerpo del request:**

```json
{
  "email": "staff@hotel.com",
  "password": "TempPass123!",
  "roleAssignments": [
    {
      "roleId": "<system_role_id>",
      "scope": {
        "type": "PROPERTY",
        "resourceIds": ["prop_abc123", "prop_def456"]
      }
    }
  ]
}
```

**Reglas del scope:**

- `type: "TENANT"` — `resourceIds` debe omitirse
- `type: "PROPERTY"` o `type: "UNIT"` — `resourceIds` es requerido y debe ser un array no vacío de IDs válidos que pertenezcan a este tenant
- Se requiere al menos un role assignment

**Respuesta `201`:**

```json
{
  "message": "Staff member added successfully"
}
```

**Casos de error:**

| Status | Motivo                                                             |
| ------ | ------------------------------------------------------------------ |
| `400`  | Role assignments faltantes, email duplicado, resourceIds inválidos |
| `403`  | El tenant alcanzó el límite de personal de su plan                 |
| `404`  | Tenant no encontrado                                               |

---

### `POST /user/change-password`

Cambia la contraseña del usuario autenticado.

**Headers:** `Authorization: Bearer <access_token>`

**Cuerpo del request:**

```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

---

## Uso de Guards (Backend — para desarrolladores)

### `JwtAuthGuard`

Aplicado globalmente. Todas las rutas están protegidas por defecto. Usar `@Public()` para excluir.

### `ScopeGuard` + `@RequireScope()`

Se aplica a rutas individuales que necesitan control de acceso a nivel de recurso. Debe usarse junto con `JwtAuthGuard`.

```typescript
// Requiere que el usuario tenga CUALQUIER rol que aplique a esta unidad específica
@UseGuards(JwtAuthGuard, ScopeGuard)
@RequireScope('UNIT', 'unitId')
@Get(':unitId')
getUnit(@Param('unitId') unitId: string) { ... }

// Requiere un permiso específico además del acceso por scope
@UseGuards(JwtAuthGuard, ScopeGuard)
@RequireScope('UNIT', 'unitId', Permission.UNIT_EDIT)
@Patch(':unitId')
updateUnit(@Param('unitId') unitId: string) { ... }
```

**Lógica de acceso (en orden):**

1. Si `user.isOwner === true` → **permitir** incondicionalmente
2. Buscar cualquier `roleAssignment` en el token donde:
   - `scope.type === 'TENANT'`, O
   - `scope.type` coincide con el tipo requerido Y `scope.resourceIds` incluye el ID del recurso solicitado
3. Si no hay assignment coincidente → **denegar** (`403`)
4. Si se especificó un `permission`, verificar también que `matchingAssignment.permissions` lo incluya → si no, **denegar** (`403`)

---

## Límites del Plan

El conteo de miembros del personal es aplicado por el plan de suscripción del tenant al momento de invitar.

| Plan         | Límite de personal |
| ------------ | ------------------ |
| `LymonOne`   | 2                  |
| `LymonPlus`  | 10                 |
| `LymonPrime` | Ilimitado          |

La verificación compara el número actual de usuarios no-owner en el tenant contra el límite del plan antes de guardar un nuevo miembro.

---

## Modelo de Datos

### Usuario (colección MongoDB `users`)

```
{
  email: string            // único por tenant
  tenantId: ObjectId
  passwordHash: string
  isOwner: boolean
  roleAssignments: [
    {
      roleId: string       // referencia a roles._id
      scope: {
        type: 'TENANT' | 'PROPERTY' | 'UNIT'
        resourceIds?: string[]   // presente solo para PROPERTY y UNIT
      }
    }
  ]
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}
```

Índice único en `{ email, tenantId }` — el mismo email puede existir en distintos tenants.

### Rol (colección MongoDB `roles`)

```
{
  name: string             // único, ej. "ADMIN", "STAFF"
  permissions: string[]    // array de valores del enum Permission
  isSystem: true           // siempre true; solo existen roles del sistema
  createdAt: Date
  updatedAt: Date
}
```

Los roles del sistema se insertan automáticamente al arrancar la aplicación mediante `RoleSeedService`. Si el rol ya existe, el seeding se omite (idempotente).
