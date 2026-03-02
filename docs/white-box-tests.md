# Pruebas de Caja Blanca — Lymon Backend

> **Fecha:** 23 febrero 2026
> **Alcance:** Capa de Application (Command Handlers) y entidades de dominio.
> **Framework:** Jest + TypeScript
> **Convención:** Los tests viven en `test/application/<dominio>/` y acceden directamente a las clases del handler sin levantar el módulo NestJS.

**Leyenda:** `[IMPLEMENTADO]` — test existe en `test/` | `[PENDIENTE]` — test por desarrollar

---

## Índice

1. [US-001 — Registro de Tenant](#us-001--registro-de-tenant)
2. [US-002 — Inicio de sesión multi-tenant](#us-002--inicio-de-sesión-multi-tenant)
3. [US-001 / US-002 — Verificación de email](#us-001--us-002--verificación-de-email)
4. [US-004 — Gestión de perfil del Tenant](#us-004--gestión-de-perfil-del-tenant)
5. [US-005 / US-2 — Gestión y cambio de plan](#us-005--us-2--gestión-y-cambio-de-plan)
6. [US-009 — Aislamiento multi-tenant](#us-009--aislamiento-multi-tenant)
7. [US-010 — Auditoría y trazabilidad](#us-010--auditoría-y-trazabilidad)
8. [US-011 — Gestión de sesiones activas](#us-011--gestión-de-sesiones-activas)
9. [US-012 — Selección de contexto activo](#us-012--selección-de-contexto-activo)
10. [US-1 / US-2 — Límites de plan en creación de sitios](#us-1--us-2--límites-de-plan-en-creación-de-sitios)
11. [Cambio de contraseña](#cambio-de-contraseña)
12. [Entidades y Value Objects de dominio](#entidades-y-value-objects-de-dominio)

---

## US-001 — Registro de Tenant

**Archivo:** `test/application/tenant/register-tenant.handler.spec.ts`
**Sujeto:** `RegisterTenantHandler`

---

**Test T-001: RegisterTenantHandler - Email ya registrado** `[IMPLEMENTADO]`
Caso: Cuando el email del nuevo tenant ya existe en el sistema, el registro debe ser rechazado.

- El mock de `tenantRepository.exists` retorna `true`
- Se intenta ejecutar el handler con un `RegisterTenantCommand` válido

Resultado:
- Debe lanzar `ConflictException` sin intentar persistir ninguna entidad

---

**Test T-002: RegisterTenantHandler - Fallo al persistir el tenant** `[IMPLEMENTADO]`
Caso: Cuando el tenant no puede ser recuperado del repositorio tras el save (fallo de persistencia).

- El mock de `tenantRepository.exists` retorna `false`
- El mock de `tenantRepository.save` resuelve sin error
- El mock de `tenantRepository.findByOwnerEmail` retorna `null`

Resultado:
- Debe lanzar un error con el mensaje `'Failed to create a tenant'`

---

**Test T-003: RegisterTenantHandler - Fallo al persistir el usuario Owner** `[IMPLEMENTADO]`
Caso: Cuando el tenant se crea correctamente pero el usuario Owner no puede ser recuperado tras el save.

- El mock de `tenantRepository.exists` retorna `false`
- El mock de `tenantRepository.save` y `findByOwnerEmail` resuelven con un tenant válido
- El mock de `passwordHasher.hash` retorna un hash válido
- El mock de `userRepository.save` resuelve sin error
- El mock de `userRepository.findByEmail` retorna `null`

Resultado:
- Debe lanzar un error con el mensaje `'Failed to create user'`

---

**Test T-004: RegisterTenantHandler - Registro exitoso retorna result con tokens** `[IMPLEMENTADO]`
Caso: Cuando todos los datos son válidos y ambas entidades se persisten correctamente.

- El mock de `tenantRepository.exists` retorna `false`
- Los mocks de `tenantRepository` y `userRepository` resuelven con entidades válidas
- El mock de `passwordHasher.hash` retorna un hash
- Se ejecuta el handler con plan `TRIAL`

Resultado:
- Debe retornar una instancia de `RegisterTenantResult`
- Debe incluir `tenantId`, `userId`, `email`, `accessToken` y `refreshToken` con valores correctos

---

**Test T-005: RegisterTenantHandler - Envío de email de verificación** `[IMPLEMENTADO]`
Caso: Cuando el registro es exitoso, se debe notificar al usuario por correo.

- Todos los mocks configurados para flujo exitoso (igual que T-004)
- Se ejecuta el handler

Resultado:
- `emailService.sendVerificationEmail` debe haber sido llamado exactamente una vez
- El primer argumento debe ser el email del owner
- El segundo argumento debe ser un string (token de verificación)

---

**Test T-006: RegisterTenantHandler - Plan TRIAL aplica límite de 2 sitios** `[PENDIENTE]`
Caso: Cuando se registra un tenant con plan TRIAL, el límite de sitios debe quedar configurado en 2.

- Se registra un tenant con `planType: PlanTypeEnum.TRIAL`
- Flujo exitoso completo
- Se obtiene el tenant persistido

Resultado:
- `tenant.getPlan().getSiteLimit()` debe retornar `2`

---

**Test T-007: RegisterTenantHandler - Plan LYMON_ONE aplica límite de 5 sitios** `[PENDIENTE]`
Caso: Cuando se registra un tenant con plan LYMON_ONE, el límite de sitios debe quedar en 5.

- Se registra un tenant con `planType: PlanTypeEnum.LYMON_ONE`
- Flujo exitoso completo

Resultado:
- `tenant.getPlan().getSiteLimit()` debe retornar `5`

---

**Test T-008: RegisterTenantHandler - Plan LYMON_PLUS aplica límite de 20 sitios** `[PENDIENTE]`
Caso: Cuando se registra un tenant con plan LYMON_PLUS, el límite de sitios debe quedar en 20.

- Se registra un tenant con `planType: PlanTypeEnum.LYMON_PLUS`

Resultado:
- `tenant.getPlan().getSiteLimit()` debe retornar `20`

---

**Test T-009: RegisterTenantHandler - Plan LYMON_PRIME sin límite práctico** `[PENDIENTE]`
Caso: Cuando se registra con plan LYMON_PRIME, el límite de sitios debe ser ilimitado.

- Se registra un tenant con `planType: PlanTypeEnum.LYMON_PRIME`

Resultado:
- `tenant.getPlan().getSiteLimit()` debe retornar `Number.MAX_SAFE_INTEGER`

---

**Test T-010: RegisterTenantHandler - Tenant recién creado no tiene email verificado** `[PENDIENTE]`
Caso: Inmediatamente después del registro, el campo emailVerified del tenant debe ser false.

- Flujo exitoso completo con plan TRIAL
- Se obtiene el tenant persistido

Resultado:
- `tenant.isEmailVerified()` debe retornar `false`

---

**Test T-011: RegisterTenantHandler - Usuario Owner recién creado no tiene email verificado** `[PENDIENTE]`
Caso: El usuario Owner creado durante el registro debe tener emailVerified en false.

- Flujo exitoso completo
- Se obtiene el usuario persistido

Resultado:
- `user.isEmailVerified()` debe retornar `false`

---

**Test T-012: RegisterTenantHandler - Nombre de tenant vacío rechazado por dominio** `[PENDIENTE]`
Caso: El dominio no debe permitir crear un tenant con nombre vacío o solo espacios.

- El mock de `tenantRepository.exists` retorna `false`
- Se ejecuta el handler con `tenantName: ''`

Resultado:
- Debe lanzar un error con el mensaje `'Tenant name cannot be empty'`

---

**Test T-013: RegisterTenantHandler - Se genera tenantId no nulo al registrar** `[PENDIENTE]`
Caso: El sistema debe asignar automáticamente un identificador único al tenant.

- Flujo exitoso completo

Resultado:
- `result.tenantId` debe ser un string no vacío y no nulo

---

## US-002 — Inicio de sesión multi-tenant

**Archivo:** `test/application/auth/login.handler.spec.ts`
**Sujeto:** `LoginHandler`

---

**Test L-001: LoginHandler - Credenciales válidas** `[IMPLEMENTADO]`
Caso: Cuando se proporcionan email y contraseña correctos, debe generar tokens y retornar datos del usuario.

- El mock de `userRepository.findByEmail` retorna un usuario válido
- El mock de `passwordHasher.compare` retorna `true` (contraseña correcta)
- El mock de `tenantRepository.findById` retorna un tenant válido
- Se ejecuta el handler con el comando de login

Resultado:
- Debe retornar una instancia de `LoginResult`
- Debe incluir `userId`, `email`, `tenantId`, `role` (OWNER), `emailVerified` en `true`
- Debe generar `accessToken` y `refreshToken`

---

**Test L-002: LoginHandler - Usuario no existe** `[IMPLEMENTADO]`
Caso: Cuando el email no existe en la base de datos.

- El mock de `userRepository.findByEmail` retorna `null`
- Se intenta ejecutar el handler con credenciales

Resultado:
- Debe lanzar `UnauthorizedException` sin ejecutar `passwordHasher.compare` ni consultar el `tenantRepository`

---

**Test L-003: LoginHandler - Contraseña incorrecta** `[IMPLEMENTADO]`
Caso: Cuando el usuario existe pero la contraseña es incorrecta.

- El mock de `userRepository.findByEmail` retorna un usuario válido
- El mock de `passwordHasher.compare` retorna `false`
- Se intenta ejecutar el handler

Resultado:
- Debe lanzar `UnauthorizedException` sin consultar el `tenantRepository`

---

**Test L-004: LoginHandler - Tenant no existe** `[IMPLEMENTADO]`
Caso: Cuando el usuario y contraseña son válidos, pero el tenant asociado no existe.

- El mock de `userRepository.findByEmail` retorna un usuario válido
- El mock de `passwordHasher.compare` retorna `true`
- El mock de `tenantRepository.findById` retorna `null`
- Se ejecuta el handler

Resultado:
- Debe lanzar `UnauthorizedException`

---

**Test L-005: LoginHandler - Email no verificado retorna flag en false** `[PENDIENTE]`
Caso: Cuando el usuario existe y la contraseña es correcta pero no ha verificado su email, el login debe completarse con el flag en false.

- El mock de `userRepository.findByEmail` retorna un usuario con `emailVerified: false`
- El mock de `passwordHasher.compare` retorna `true`
- El mock de `tenantRepository.findById` retorna un tenant válido

Resultado:
- No debe lanzar ninguna excepción
- `result.emailVerified` debe ser `false`
- Debe retornar `accessToken` y `refreshToken`

---

**Test L-006: LoginHandler - Bloqueo tras X intentos fallidos** `[PENDIENTE]`
Caso: Cuando un usuario realiza un número de intentos fallidos que supera el umbral permitido.

- El mock de `userRepository.findByEmail` retorna un usuario con `failedLoginAttempts >= umbral`
- El mock de `passwordHasher.compare` retorna `false` en cada intento
- Se intenta ejecutar el handler el intento número X+1

Resultado:
- Debe lanzar `TooManyRequestsException` o `UnauthorizedException` con mensaje de cuenta bloqueada
- No debe ejecutar `tokenService.generateAccesToken`

---

**Test L-007: LoginHandler - Cuenta bloqueada impide acceso con credenciales correctas** `[PENDIENTE]`
Caso: Una vez que la cuenta está bloqueada, no debe ser posible autenticarse aunque la contraseña sea correcta.

- El mock de `userRepository.findByEmail` retorna un usuario en estado bloqueado
- El mock de `passwordHasher.compare` retorna `true`
- Se ejecuta el handler

Resultado:
- Debe lanzar excepción antes de generar tokens

---

**Test L-008: LoginHandler - Payload del JWT contiene tenantId y activePlan** `[PENDIENTE]`
Caso: El token generado debe embeber el contexto multi-tenant y el plan activo.

- El mock de `userRepository.findByEmail` retorna un usuario asociado a `tenantId: 'tenant-123'`
- El mock de `passwordHasher.compare` retorna `true`
- El mock de `tenantRepository.findById` retorna un tenant con plan `LYMON_ONE`
- Se ejecuta el handler

Resultado:
- `tokenService.generateAccesToken` debe haber sido llamado con un payload que contiene `tenantId: 'tenant-123'` y `activePlan: 'LYMON_ONE'`

---

## US-001 / US-002 — Verificación de email

**Archivo:** `test/application/user/verify-email.handler.spec.ts`
**Sujeto:** `VerifyEmailHandler`

---

**Test V-001: VerifyEmailHandler - Token inválido o expirado** `[IMPLEMENTADO]`
Caso: Cuando el token de verificación no es válido o ya expiró.

- El mock de `tokenService.verifyToken` lanza una excepción (`'jwt expired'`)
- Se ejecuta el handler con el token inválido

Resultado:
- Debe lanzar `UnauthorizedException`

---

**Test V-002: VerifyEmailHandler - Token válido pero usuario no existe** `[IMPLEMENTADO]`
Caso: Cuando el token es estructuralmente válido pero el usuario referenciado no existe en la base de datos.

- El mock de `tokenService.verifyToken` retorna un payload válido con `userId`
- El mock de `userRepository.findById` retorna `null`

Resultado:
- Debe lanzar `UnauthorizedException`

---

**Test V-003: VerifyEmailHandler - Email del usuario ya estaba verificado** `[IMPLEMENTADO]`
Caso: Cuando el usuario ya verificó su email previamente, la operación debe ser idempotente.

- El mock de `tokenService.verifyToken` retorna un payload válido
- El mock de `userRepository.findById` retorna un usuario con `emailVerified: true`
- Se ejecuta el handler

Resultado:
- Debe resolver con `undefined` sin errores
- `userRepository.save` no debe haber sido llamado

---

**Test V-004: VerifyEmailHandler - Verifica email del usuario y lo persiste** `[IMPLEMENTADO]`
Caso: Cuando el token es válido y el usuario no ha verificado su email.

- El mock de `tokenService.verifyToken` retorna un payload válido
- El mock de `userRepository.findById` retorna un usuario con `emailVerified: false`
- El mock de `tenantRepository.findById` retorna `null`
- Se ejecuta el handler

Resultado:
- `userRepository.save` debe haber sido llamado exactamente 1 vez

---

**Test V-005: VerifyEmailHandler - Verifica también el tenant si está sin verificar** `[IMPLEMENTADO]`
Caso: Cuando tanto el usuario como el tenant están pendientes de verificación.

- El mock de `tokenService.verifyToken` retorna un payload válido
- El mock de `userRepository.findById` retorna un usuario con `emailVerified: false`
- El mock de `tenantRepository.findById` retorna un tenant con `emailVerified: false`
- Se ejecuta el handler

Resultado:
- `tenantRepository.save` debe haber sido llamado exactamente 1 vez

---

**Test V-006: VerifyEmailHandler - No persiste tenant si ya estaba verificado** `[IMPLEMENTADO]`
Caso: Cuando el usuario no está verificado pero el tenant sí lo está.

- El mock de `tokenService.verifyToken` retorna un payload válido
- El mock de `userRepository.findById` retorna un usuario con `emailVerified: false`
- El mock de `tenantRepository.findById` retorna un tenant con `emailVerified: true`
- Se ejecuta el handler

Resultado:
- `tenantRepository.save` no debe haber sido llamado

---

**Test V-007: VerifyEmailHandler - Tenant no encontrado solo persiste usuario** `[IMPLEMENTADO]`
Caso: Cuando el tenant asociado al usuario no existe, igual debe verificarse el usuario.

- El mock de `tokenService.verifyToken` retorna un payload válido
- El mock de `userRepository.findById` retorna un usuario con `emailVerified: false`
- El mock de `tenantRepository.findById` retorna `null`
- Se ejecuta el handler

Resultado:
- `userRepository.save` debe haber sido llamado
- `tenantRepository.save` no debe haber sido llamado

---

**Test V-008: Integración - Login después de verificar email retorna emailVerified true** `[PENDIENTE]`
Caso: Tras completar el flujo de verificación, el siguiente login debe reflejar el cambio de estado.

- Se ejecuta `VerifyEmailHandler` con token válido y usuario no verificado
- A continuación se ejecuta `LoginHandler` con las mismas credenciales

Resultado:
- `result.emailVerified` del `LoginResult` debe ser `true`

---

## US-004 — Gestión de perfil del Tenant

**Archivo:** `test/application/tenant/update-tenant-profile.handler.spec.ts`
**Sujeto:** `UpdateTenantProfileHandler` _(handler pendiente de implementar)_

---

**Test TP-001: UpdateTenantProfileHandler - Tenant no encontrado** `[PENDIENTE]`
Caso: Cuando se intenta actualizar el perfil de un tenant que no existe en el sistema.

- El mock de `tenantRepository.findById` retorna `null`
- Se ejecuta el handler con un comando de actualización válido

Resultado:
- Debe lanzar `NotFoundException`

---

**Test TP-002: UpdateTenantProfileHandler - Usuario no es OWNER** `[PENDIENTE]`
Caso: Cuando un usuario con rol ADMIN o USER intenta modificar el perfil del tenant.

- El mock de `tenantRepository.findById` retorna un tenant válido
- El comando incluye `requestingUserRole: UserRoleEnum.ADMIN`
- Se ejecuta el handler

Resultado:
- Debe lanzar `ForbiddenException` sin persistir cambios

---

**Test TP-003: UpdateTenantProfileHandler - Owner de otro tenant** `[PENDIENTE]`
Caso: Cuando un OWNER intenta modificar el perfil de un tenant que no es el suyo.

- El mock de `tenantRepository.findById` retorna un tenant con `id: 'tenant-999'`
- El comando proviene de un usuario cuyo `tenantId` es `'tenant-123'`

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test TP-004: UpdateTenantProfileHandler - Nombre actualizado correctamente** `[PENDIENTE]`
Caso: Cuando el OWNER actualiza el nombre del tenant con un valor válido.

- El mock de `tenantRepository.findById` retorna el tenant del usuario
- El comando incluye `newName: 'Nuevo Nombre SA'`
- Se ejecuta el handler

Resultado:
- `tenantRepository.save` debe haber sido llamado con el tenant cuyo `getName()` es `'Nuevo Nombre SA'`

---

**Test TP-005: UpdateTenantProfileHandler - Nombre vacío rechazado por dominio** `[PENDIENTE]`
Caso: El dominio no debe permitir actualizar el nombre del tenant a un valor vacío.

- El mock de `tenantRepository.findById` retorna el tenant del usuario
- El comando incluye `newName: ''`
- Se ejecuta el handler

Resultado:
- Debe lanzar un error con el mensaje `'Tenant name cannot be empty'`
- `tenantRepository.save` no debe haber sido llamado

---

**Test TP-006: UpdateTenantProfileHandler - Actualización exitosa retorna confirmación** `[PENDIENTE]`
Caso: Cuando todos los datos son válidos y la actualización se completa.

- El mock de `tenantRepository.findById` retorna el tenant del usuario
- El comando contiene datos válidos de nombre, contacto y datos fiscales
- Se ejecuta el handler

Resultado:
- El resultado debe indicar `updated: true` o contener un mensaje de éxito
- `tenantRepository.save` debe haber sido llamado exactamente 1 vez

---

## US-005 / US-2 — Gestión y cambio de plan

**Archivo:** `test/application/tenant/change-plan.handler.spec.ts`
**Sujeto:** `ChangePlanHandler` _(handler pendiente de implementar)_

---

**Test CP-001: ChangePlanHandler - Upgrade de TRIAL a LYMON_ONE** `[PENDIENTE]`
Caso: Cuando el owner realiza un upgrade desde el plan TRIAL al plan LYMON_ONE, el límite de sitios debe aumentar.

- El mock de `tenantRepository.findById` retorna un tenant con plan `TRIAL`
- El comando solicita cambio a `LYMON_ONE`
- El mock del usuario retorna el owner del tenant
- Se ejecuta el handler

Resultado:
- `tenantRepository.save` debe haber sido llamado con el tenant actualizado
- `tenant.getPlan().getSiteLimit()` del tenant guardado debe retornar `5`

---

**Test CP-002: ChangePlanHandler - Upgrade de LYMON_ONE a LYMON_PLUS** `[PENDIENTE]`
Caso: Cuando se hace upgrade a LYMON_PLUS, el límite de sitios debe ser 20.

- El mock de `tenantRepository.findById` retorna un tenant con plan `LYMON_ONE`
- El comando solicita cambio a `LYMON_PLUS`

Resultado:
- El tenant persistido debe tener `getSiteLimit()` igual a `20`

---

**Test CP-003: ChangePlanHandler - Upgrade a LYMON_PRIME** `[PENDIENTE]`
Caso: Al migrar al plan más alto, no debe existir límite práctico de sitios.

- El mock retorna un tenant con cualquier plan inferior
- El comando solicita cambio a `LYMON_PRIME`

Resultado:
- El tenant persistido debe tener `getSiteLimit()` igual a `Number.MAX_SAFE_INTEGER`

---

**Test CP-004: ChangePlanHandler - Downgrade dentro del límite actual** `[PENDIENTE]`
Caso: Cuando el tenant hace downgrade y el número de sitios actuales cabe en el nuevo plan.

- El mock retorna tenant con plan `LYMON_PLUS` (20 sitios)
- Los contadores retornan `propertyCount: 2`, `unitCount: 1` (total 3 < 5)
- El comando solicita cambio a `LYMON_ONE`

Resultado:
- El plan se guarda correctamente sin bloqueos
- El resultado no debe indicar sitios excedentes

---

**Test CP-005: ChangePlanHandler - Downgrade con sitios excedentes** `[PENDIENTE]`
Caso: Cuando el downgrade deja al tenant con más sitios de los que permite el nuevo plan.

- El mock retorna tenant con plan `LYMON_PLUS`
- Los contadores retornan un total de 8 sitios
- El comando solicita downgrade a `LYMON_ONE` (límite 5)

Resultado:
- El plan se cambia a `LYMON_ONE`
- El resultado debe indicar `exceededSites: 3` (o equivalente)
- Los 3 sitios excedentes deben quedar marcados como bloqueados

---

**Test CP-006: ChangePlanHandler - Plan inválido rechazado** `[PENDIENTE]`
Caso: Cuando se solicita un cambio a un tipo de plan que no existe en el sistema.

- El comando incluye `planType: 'SUPER_PLAN'` (valor no válido)
- Se ejecuta el handler

Resultado:
- Debe lanzar un error con el mensaje `'Invalid plan type SUPER_PLAN'`

---

**Test CP-007: ChangePlanHandler - Cambio de plan se registra en historial** `[PENDIENTE]`
Caso: Todo cambio de plan debe quedar registrado para auditoría y consulta.

- Flujo de upgrade exitoso de TRIAL a LYMON_ONE
- Se ejecuta el handler

Resultado:
- El repositorio de historial debe haber sido llamado con el plan anterior (`TRIAL`) y el nuevo (`LYMON_ONE`)

---

**Test CP-008: ChangePlanHandler - Solo OWNER puede cambiar el plan** `[PENDIENTE]`
Caso: Usuarios con rol ADMIN o USER no están autorizados a cambiar el plan de suscripción.

- El mock retorna un usuario con `role: UserRoleEnum.ADMIN`
- Se ejecuta el handler

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test CP-009: Tenant.changePlan - Actualiza updatedAt en la entidad** `[PENDIENTE]`
Caso: Al llamar al método de dominio `changePlan`, el timestamp de actualización debe modificarse.

- Se crea un tenant con `Tenant.reconstitute` con una fecha de `updatedAt` conocida
- Se llama a `tenant.changePlan(PlanType.create('LYMON_ONE'))`

Resultado:
- `tenant.getPlan().toString()` debe ser `'LYMON_ONE'`
- El `updatedAt` del tenant debe ser posterior al valor anterior

---

## US-009 — Aislamiento multi-tenant

**Archivo:** `test/application/shared/tenant-isolation.spec.ts`
**Sujetos:** `CreateUnitHandler`, `CreatePropertyHandler`, repositories

---

**Test ISO-001: CreateUnitHandler - Propiedad de otro tenant** `[IMPLEMENTADO]`
Caso: Cuando un tenant intenta crear una unidad en una propiedad que pertenece a otro tenant.

- El mock de `tenantRepository.findById` retorna el tenant del usuario autenticado (`tenant-123`)
- El mock de `propertyRepository.findById` retorna una propiedad perteneciente a `tenant-999`
- Se ejecuta el handler con `tenantId: 'tenant-123'`

Resultado:
- Debe lanzar `ForbiddenException` sin persistir la unidad

---

**Test ISO-002: PropertyRepository - Listado filtrado por tenantId** `[PENDIENTE]`
Caso: Al listar propiedades, el repositorio solo debe devolver las correspondientes al tenant autenticado.

- El mock de `propertyRepository.findByTenantId` está configurado para retornar solo propiedades de `tenant-123`
- Se ejecuta el handler de listado con `tenantId: 'tenant-123'`

Resultado:
- Todas las propiedades retornadas deben tener `tenantId === 'tenant-123'`
- El mock de `findByTenantId` debe haber sido llamado con `'tenant-123'`

---

**Test ISO-003: UserRepository - Búsqueda de usuario de otro tenant** `[PENDIENTE]`
Caso: Un tenant no debe poder acceder a la información de usuarios pertenecientes a otro tenant.

- El mock de `userRepository.findById` retorna un usuario de `tenant-999`
- El comando proviene de un usuario de `tenant-123`

Resultado:
- Debe lanzar `ForbiddenException` o `NotFoundException`

---

**Test ISO-004: CreatePropertyHandler - tenantId de otro tenant en el comando** `[PENDIENTE]`
Caso: Cuando el comando de creación incluye un tenantId diferente al del usuario autenticado.

- El mock de `tenantRepository.findById` retorna `null` para el tenantId ajeno
- El token del usuario contiene `tenantId: 'tenant-123'` pero el comando usa `tenantId: 'tenant-999'`

Resultado:
- Debe lanzar `NotFoundException` o `ForbiddenException` antes de persistir

---

**Test ISO-005: Contadores de sitios son independientes por tenant** `[PENDIENTE]`
Caso: El límite del plan de un tenant no debe verse afectado por los sitios de otros tenants.

- El mock de `propertyRepository.countByTenantId('tenant-123')` retorna `1`
- El mock de `unitRepository.countByTenantId('tenant-123')` retorna `0`
- El mock de `tenantRepository.findById` retorna tenant con plan TRIAL (límite 2)
- Se ejecuta `CreatePropertyHandler` con `tenantId: 'tenant-123'`

Resultado:
- El handler debe permitir la creación (1 + 0 = 1 < 2)
- Los contadores no deben incluir sitios de otros tenants

---

**Test ISO-006: UnitRepository - Consulta de unidades de otro tenant retorna vacío** `[PENDIENTE]`
Caso: Al consultar unidades con el tenantId del usuario autenticado, no deben aparecer unidades de otros tenants.

- El mock de `unitRepository.findByTenantId('tenant-123')` retorna una lista vacía
- Se ejecuta el handler de listado con `tenantId: 'tenant-123'`

Resultado:
- El resultado debe ser una lista vacía
- `findByTenantId` debe haber sido llamado exclusivamente con `'tenant-123'`

---

## US-010 — Auditoría y trazabilidad

**Archivo:** `test/application/audit/audit-log.handler.spec.ts`
**Sujeto:** `AuditLogHandler` / `AuditService` _(pendientes de implementar)_

---

**Test AU-001: LoginHandler - Login exitoso genera entrada de auditoría** `[PENDIENTE]`
Caso: Cada inicio de sesión exitoso debe quedar registrado en el log de auditoría.

- Todos los mocks configurados para flujo de login exitoso
- El mock de `auditService.log` está disponible
- Se ejecuta el `LoginHandler`

Resultado:
- `auditService.log` debe haber sido llamado con `action: 'LOGIN'` y el `userId` correcto

---

**Test AU-002: LoginHandler - Login fallido genera entrada de auditoría** `[PENDIENTE]`
Caso: Los intentos de login fallidos también deben quedar registrados.

- El mock de `passwordHasher.compare` retorna `false`
- Se ejecuta el `LoginHandler`

Resultado:
- `auditService.log` debe haber sido llamado con `action: 'LOGIN_FAILED'`

---

**Test AU-003: CreatePropertyHandler - Creación de propiedad genera entrada de auditoría** `[PENDIENTE]`
Caso: La creación de una propiedad debe registrarse como acción en el log.

- Flujo de creación de propiedad exitoso
- Se ejecuta el `CreatePropertyHandler`

Resultado:
- `auditService.log` debe haber sido llamado con `entity: 'PROPERTY'` y `action: 'CREATE'`

---

**Test AU-004: ChangePlanHandler - Cambio de plan genera entrada de auditoría** `[PENDIENTE]`
Caso: Los cambios de plan de suscripción deben quedar trazados en el historial.

- Flujo de cambio de plan exitoso de TRIAL a LYMON_ONE
- Se ejecuta el `ChangePlanHandler`

Resultado:
- `auditService.log` debe haber sido llamado con el plan anterior y el nuevo plan en los datos del registro

---

**Test AU-005: GetAuditLogHandler - OWNER puede consultar el log** `[PENDIENTE]`
Caso: El rol OWNER debe tener acceso al historial de auditoría de su tenant.

- El mock de `userRepository.findById` retorna un usuario con `role: UserRoleEnum.OWNER`
- El mock de `auditRepository.findByTenantId` retorna una lista de registros
- Se ejecuta el handler de consulta

Resultado:
- Debe retornar la lista de registros de auditoría sin lanzar excepción

---

**Test AU-006: GetAuditLogHandler - USER sin acceso al log** `[PENDIENTE]`
Caso: Un usuario con rol USER no debe poder consultar el historial de auditoría.

- El mock de `userRepository.findById` retorna un usuario con `role: UserRoleEnum.USER`
- Se ejecuta el handler de consulta

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test AU-007: AuditLog - Registro incluye todos los campos requeridos** `[PENDIENTE]`
Caso: Cada entrada del log debe contener la información mínima para garantizar trazabilidad.

- Se crea un `AuditLog` con datos completos
- Se accede a sus propiedades

Resultado:
- `userId`, `tenantId`, `action`, `entity`, `entityId` y `timestamp` deben ser no nulos

---

**Test AU-008: GetAuditLogHandler - Log de un tenant no visible por otro** `[PENDIENTE]`
Caso: Los registros de auditoría deben estar completamente aislados por tenant.

- El mock de `auditRepository.findByTenantId('tenant-123')` retorna únicamente registros de ese tenant
- Se ejecuta el handler con `tenantId: 'tenant-123'`

Resultado:
- Todos los registros retornados deben tener `tenantId === 'tenant-123'`

---

## US-011 — Gestión de sesiones activas

**Archivo:** `test/application/auth/session-management.handler.spec.ts`
**Sujetos:** `LoginHandler`, `ListSessionsHandler`, `RevokeSessionHandler`, `LogoutHandler` _(pendientes de implementar)_

---

**Test SS-001: LoginHandler - Login crea registro de sesión activa** `[PENDIENTE]`
Caso: Cada login exitoso debe crear una entrada de sesión para permitir la gestión posterior.

- Flujo de login exitoso completo
- El mock de `sessionRepository.save` está disponible
- Se ejecuta el `LoginHandler`

Resultado:
- `sessionRepository.save` debe haber sido llamado con `userId` y el `refreshToken` generado

---

**Test SS-002: ListSessionsHandler - Lista solo sesiones del usuario autenticado** `[PENDIENTE]`
Caso: El usuario solo debe ver sus propias sesiones activas, no las de otros usuarios.

- El mock de `sessionRepository.findByUserId('user-456')` retorna 2 sesiones activas
- Se ejecuta el handler con `userId: 'user-456'`

Resultado:
- La lista retornada debe contener exactamente 2 sesiones
- `findByUserId` debe haber sido llamado con `'user-456'`

---

**Test SS-003: RevokeSessionHandler - Revocación individual de sesión** `[PENDIENTE]`
Caso: Al revocar una sesión específica, solo ese refresh token debe invalidarse.

- El mock de `sessionRepository.findById` retorna una sesión activa del usuario
- Se ejecuta el handler con `sessionId: 'session-1'`

Resultado:
- `sessionRepository.revoke` debe haber sido llamado con `'session-1'`
- Las demás sesiones del usuario no deben verse afectadas

---

**Test SS-004: RevokeAllSessionsHandler - Cierra todas las sesiones del usuario** `[PENDIENTE]`
Caso: Al cerrar todas las sesiones, todos los refresh tokens del usuario quedan invalidados.

- El mock de `sessionRepository.revokeAllByUserId` resuelve correctamente
- Se ejecuta el handler con `userId: 'user-456'`

Resultado:
- `sessionRepository.revokeAllByUserId` debe haber sido llamado con `'user-456'`

---

**Test SS-005: RefreshTokenHandler - Refresh token revocado rechaza la renovación** `[PENDIENTE]`
Caso: Si se intenta usar un refresh token previamente revocado, la renovación debe fallar.

- El mock de `sessionRepository.findByRefreshToken` retorna una sesión con `revoked: true`
- Se ejecuta el `RefreshTokenHandler` con el token revocado

Resultado:
- Debe lanzar `UnauthorizedException`

---

**Test SS-006: LogoutHandler - Cierre de sesión registra estado revocado** `[PENDIENTE]`
Caso: El logout debe marcar la sesión como cerrada e invalidar el refresh token.

- El mock de `sessionRepository.findByRefreshToken` retorna una sesión activa
- Se ejecuta el `LogoutHandler`

Resultado:
- La sesión debe quedar marcada como `revoked: true` en el repositorio
- Si la auditoría está activa, `auditService.log` debe haber sido llamado con `action: 'LOGOUT'`

---

## US-012 — Selección de contexto activo

**Archivo:** `test/application/context/set-active-context.handler.spec.ts`
**Sujeto:** `SetActiveContextHandler` _(pendiente de implementar)_

---

**Test CTX-001: SetActiveContextHandler - Selección de propiedad accesible** `[PENDIENTE]`
Caso: Cuando el usuario selecciona una propiedad válida que pertenece a su tenant.

- El mock de `propertyRepository.findById` retorna una propiedad del tenant del usuario
- Se ejecuta el handler con `propertyId: 'property-123'` y `tenantId: 'tenant-123'`

Resultado:
- `userPreferenceRepository.save` debe haber sido llamado con `propertyId: 'property-123'`
- No debe lanzar ninguna excepción

---

**Test CTX-002: SetActiveContextHandler - Selección de propiedad de otro tenant** `[PENDIENTE]`
Caso: El usuario no debe poder seleccionar como contexto una propiedad que no pertenece a su tenant.

- El mock de `propertyRepository.findById` retorna una propiedad de `tenant-999`
- El usuario pertenece a `tenant-123`

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test CTX-003: SetActiveContextHandler - Selección de unidad accesible** `[PENDIENTE]`
Caso: El usuario selecciona una unidad válida dentro de su tenant.

- El mock de `unitRepository.findById` retorna una unidad cuya propiedad pertenece al tenant del usuario
- Se ejecuta el handler con `unitId: 'unit-456'`

Resultado:
- El contexto guardado debe incluir `unitId: 'unit-456'`

---

**Test CTX-004: SetActiveContextHandler - Selección de unidad de otro tenant** `[PENDIENTE]`
Caso: Acceso cruzado de unidades entre tenants debe ser bloqueado.

- El mock de `unitRepository.findById` retorna una unidad de `tenant-999`
- El usuario pertenece a `tenant-123`

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test CTX-005: SetActiveContextHandler - Propiedad o unidad inexistente** `[PENDIENTE]`
Caso: Si el recurso solicitado no existe, se debe informar al cliente.

- El mock de `propertyRepository.findById` retorna `null`
- Se ejecuta el handler

Resultado:
- Debe lanzar `NotFoundException`

---

**Test CTX-006: GetActiveContextHandler - Contexto previo recuperado en nueva sesión** `[PENDIENTE]`
Caso: El contexto seleccionado por el usuario debe persistir entre sesiones.

- El mock de `userPreferenceRepository.findByUserId` retorna un objeto con `propertyId: 'property-123'`
- Se ejecuta el handler con `userId: 'user-456'`

Resultado:
- El resultado debe incluir `propertyId: 'property-123'`

---

## US-1 / US-2 — Límites de plan en creación de sitios

### Propiedad — `test/application/property/create-property.handler.spec.ts`

---

**Test P-001: CreatePropertyHandler - Tenant no encontrado** `[IMPLEMENTADO]`
Caso: Cuando el tenantId del comando no corresponde a ningún tenant registrado.

- El mock de `tenantRepository.findById` retorna `null`
- Se ejecuta el handler

Resultado:
- Debe lanzar `NotFoundException`

---

**Test P-002: CreatePropertyHandler - Límite del plan TRIAL alcanzado** `[IMPLEMENTADO]`
Caso: Cuando la suma de propiedades y unidades del tenant alcanza el límite del plan TRIAL (2 sitios).

- El mock de `tenantRepository.findById` retorna un tenant con plan TRIAL
- El mock de `propertyRepository.countByTenantId` retorna `1`
- El mock de `unitRepository.countByTenantId` retorna `1` (total: 2 >= límite 2)

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test P-003: CreatePropertyHandler - autoCreateUnit false solo guarda propiedad** `[IMPLEMENTADO]`
Caso: Cuando el flag autoCreateUnit es false, no debe crearse una unidad automáticamente.

- Los mocks de tenant y contadores configurados para flujo válido
- El mock de `propertyRepository.save` retorna `'property-123'`
- Se ejecuta el handler con `autoCreateUnit: false`

Resultado:
- `result.propertyId` debe ser `'property-123'`
- `result.unitId` debe ser `undefined`

---

**Test P-004: CreatePropertyHandler - autoCreateUnit true con tipo CASA** `[IMPLEMENTADO]`
Caso: Para tipos de propiedad que soportan autoCreateUnit, se deben crear ambas entidades en una transacción.

- Los mocks configurados para flujo exitoso
- `propertyRepository.save` retorna `'property-123'`
- `unitRepository.save` retorna `'unit-456'`
- Se ejecuta el handler con `autoCreateUnit: true` y `propertyType: CASA`

Resultado:
- `result.propertyId` debe ser `'property-123'`
- `result.unitId` debe ser `'unit-456'`

---

**Test P-005: CreatePropertyHandler - autoCreateUnit true con tipo HOTEL no crea unidad** `[IMPLEMENTADO]`
Caso: Para tipos de propiedad que no aplican autoCreateUnit (como HOTEL), no debe crearse unidad aunque el flag sea true.

- Los mocks configurados para flujo exitoso
- Se ejecuta el handler con `autoCreateUnit: true` y `propertyType: HOTEL`

Resultado:
- `result.propertyId` debe estar definido
- `result.unitId` debe ser `undefined`

---

**Test P-006: CreatePropertyHandler - Plan LYMON_ONE con sitios disponibles permite crear** `[PENDIENTE]`
Caso: Un tenant con plan LYMON_ONE y sitios disponibles debe poder crear propiedades sin restricción.

- El mock retorna tenant con plan LYMON_ONE (límite 5)
- Los contadores retornan `propertyCount: 2`, `unitCount: 1` (total 3 < 5)

Resultado:
- Debe retornar una instancia de `CreatePropertyResult` sin lanzar excepción

---

**Test P-007: CreatePropertyHandler - TransactionManager llamado al crear propiedad y unidad** `[PENDIENTE]`
Caso: Cuando se crean propiedad y unidad juntos, deben estar dentro de la misma transacción.

- Los mocks configurados para flujo con `autoCreateUnit: true` y `propertyType: CASA`
- Se ejecuta el handler

Resultado:
- `transactionManager.run` debe haber sido invocado exactamente 1 vez

---

### Unidad — `test/application/unit/create-unit.handler.spec.ts`

---

**Test U-001: CreateUnitHandler - Tenant no encontrado** `[IMPLEMENTADO]`
Caso: Cuando el tenantId proporcionado no corresponde a un tenant existente.

- El mock de `tenantRepository.findById` retorna `null`
- Se ejecuta el handler

Resultado:
- Debe lanzar `NotFoundException`

---

**Test U-002: CreateUnitHandler - Propiedad no encontrada** `[IMPLEMENTADO]`
Caso: Cuando la propiedad padre indicada en el comando no existe.

- El mock de `tenantRepository.findById` retorna un tenant válido
- El mock de `propertyRepository.findById` retorna `null`

Resultado:
- Debe lanzar `NotFoundException`

---

**Test U-003: CreateUnitHandler - Propiedad de otro tenant** `[IMPLEMENTADO]`
Caso: Cuando la propiedad existe pero pertenece a un tenant diferente al del usuario.

- El mock de `tenantRepository.findById` retorna el tenant del usuario (`tenant-123`)
- El mock de `propertyRepository.findById` retorna una propiedad con `tenantId: 'other-tenant-999'`

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test U-004: CreateUnitHandler - Límite del plan alcanzado** `[IMPLEMENTADO]`
Caso: Cuando la suma de propiedades y unidades del tenant alcanza el límite del plan activo.

- El mock retorna tenant con plan TRIAL (límite 2)
- Los contadores retornan `propertyCount: 1`, `unitCount: 1` (total: 2 >= 2)

Resultado:
- Debe lanzar `ForbiddenException`

---

**Test U-005: CreateUnitHandler - Todas las validaciones pasan** `[IMPLEMENTADO]`
Caso: Cuando el tenant existe, la propiedad le pertenece y hay sitios disponibles.

- Todos los mocks configurados para flujo exitoso
- El mock de `unitRepository.save` retorna `'unit-789'`

Resultado:
- Debe retornar una instancia de `CreateUnitResult`
- `result.unitId` debe ser `'unit-789'`

---

**Test U-006: CreateUnitHandler - Plan LYMON_PLUS con sitios disponibles** `[PENDIENTE]`
Caso: Un tenant con plan LYMON_PLUS y espacio disponible debe poder crear unidades sin restricción.

- El mock retorna tenant con plan LYMON_PLUS (límite 20)
- Los contadores retornan `propertyCount: 5`, `unitCount: 10` (total 15 < 20)
- `unitRepository.save` retorna `'unit-789'`

Resultado:
- `result.unitId` debe ser `'unit-789'`

---

## Cambio de contraseña

**Archivo:** `test/application/user/change-password.handler.spec.ts`
**Sujeto:** `ChangePasswordHandler`

---

**Test PWD-001: ChangePasswordHandler - Usuario no encontrado** `[PENDIENTE]`
Caso: Cuando el userId del comando no corresponde a ningún usuario registrado.

- El mock de `userRepository.findById` retorna `null`
- Se ejecuta el handler

Resultado:
- Debe lanzar `UnauthorizedException`

---

**Test PWD-002: ChangePasswordHandler - Contraseña actual incorrecta** `[PENDIENTE]`
Caso: Cuando la contraseña actual proporcionada no coincide con el hash almacenado.

- El mock de `userRepository.findById` retorna un usuario válido
- El mock de `passwordHasher.compare` retorna `false`

Resultado:
- Debe lanzar `UnauthorizedException` con mensaje `'Current password is invalid'`

---

**Test PWD-003: ChangePasswordHandler - Nueva contraseña igual a la actual** `[PENDIENTE]`
Caso: El sistema no debe permitir que el usuario establezca la misma contraseña que ya tiene.

- El mock de `userRepository.findById` retorna un usuario válido
- El primer `passwordHasher.compare` (contraseña actual) retorna `true`
- El segundo `passwordHasher.compare` (comparar nueva con actual) retorna `true`

Resultado:
- Debe lanzar `BadRequestException`

---

**Test PWD-004: ChangePasswordHandler - Cambio exitoso persiste nuevo hash** `[PENDIENTE]`
Caso: Cuando las validaciones pasan, el nuevo hash debe almacenarse correctamente.

- El mock de `userRepository.findById` retorna el usuario
- El primer `compare` retorna `true`, el segundo `false` (contraseñas distintas)
- El mock de `passwordHasher.hash` retorna `'new-hashed-password'`

Resultado:
- `userRepository.save` debe haber sido llamado
- `passwordHasher.hash` debe haber sido llamado con la nueva contraseña en texto plano

---

**Test PWD-005: ChangePasswordHandler - Cambio exitoso retorna confirmación** `[PENDIENTE]`
Caso: Tras un cambio exitoso, el handler debe retornar un resultado estructurado.

- Flujo exitoso completo (mocks configurados para pasar todas las validaciones)
- Se ejecuta el handler

Resultado:
- El resultado debe ser una instancia de `ChangePasswordResult`
- Debe incluir un mensaje de confirmación no vacío

---

## Entidades y Value Objects de dominio

> Tests unitarios puros sin mocks externos. Ubicación esperada: `test/domain/`.

---

### `PlanType` — `test/domain/tenant/plan-type.vo.spec.ts`

---

**Test PVO-001: PlanType.create - Valor TRIAL válido** `[PENDIENTE]`
Caso: La fábrica debe aceptar el valor `'TRIAL'` sin lanzar excepciones.

- Se llama a `PlanType.create('TRIAL')`

Resultado:
- No debe lanzar ninguna excepción
- El objeto instanciado debe existir

---

**Test PVO-002: PlanType.create - Valor inválido rechazado** `[PENDIENTE]`
Caso: La fábrica debe rechazar cualquier string que no sea un plan válido.

- Se llama a `PlanType.create('SUPER_PLAN')`

Resultado:
- Debe lanzar `Error('Invalid plan type SUPER_PLAN')`

---

**Test PVO-003: PlanType - TRIAL retorna límite de 2 sitios** `[PENDIENTE]`
Caso: El plan de prueba debe tener un límite restrictivo de 2 sitios.

- Se crea `PlanType.create('TRIAL')` y se llama a `getSiteLimit()`

Resultado:
- Debe retornar `2`

---

**Test PVO-004: PlanType - LYMON_ONE retorna límite de 5 sitios** `[PENDIENTE]`
Caso: El plan de entrada de pago debe permitir hasta 5 sitios.

- Se crea `PlanType.create('LYMON_ONE')` y se llama `getSiteLimit()`

Resultado:
- Debe retornar `5`

---

**Test PVO-005: PlanType - LYMON_PRIME retorna límite sin cota práctica** `[PENDIENTE]`
Caso: El plan premium no debe tener restricción aplicable de sitios.

- Se crea `PlanType.create('LYMON_PRIME')` y se llama `getSiteLimit()`

Resultado:
- Debe retornar `Number.MAX_SAFE_INTEGER`

---

**Test PVO-006: PlanType - isTrial retorna true para TRIAL** `[PENDIENTE]`
Caso: El método auxiliar `isTrial` debe identificar correctamente el plan de prueba.

- Se crea `PlanType.create('TRIAL')` y se llama `isTrial()`

Resultado:
- Debe retornar `true`

---

**Test PVO-007: PlanType - isTrial retorna false para planes de pago** `[PENDIENTE]`
Caso: Ningún plan de pago debe ser identificado como trial.

- Se crea `PlanType.create('LYMON_ONE')` y se llama `isTrial()`

Resultado:
- Debe retornar `false`

---

**Test PVO-008: PlanType - equals retorna true para el mismo valor** `[PENDIENTE]`
Caso: Dos instancias del mismo plan deben considerarse iguales por valor.

- Se crean `PlanType.create('LYMON_PLUS')` dos veces por separado
- Se llama `planA.equals(planB)`

Resultado:
- Debe retornar `true`

---

### `Tenant` — `test/domain/tenant/tenant.entity.spec.ts`

---

**Test TE-001: Tenant.create - Nombre vacío lanza error de dominio** `[PENDIENTE]`
Caso: La entidad de dominio debe proteger la invariante de nombre no vacío.

- Se llama a `Tenant.create('', Email.create('a@b.com'), PlanType.create('TRIAL'))`

Resultado:
- Debe lanzar `Error('Tenant name cannot be empty')`

---

**Test TE-002: Tenant.create - Inicia con emailVerified false** `[PENDIENTE]`
Caso: Un tenant recién creado no debe estar verificado hasta que complete el flujo de verificación.

- Se llama a `Tenant.create('Mi Empresa', email, plan)`

Resultado:
- `tenant.isEmailVerified()` debe retornar `false`

---

**Test TE-003: Tenant.verifyEmail - Actualiza estado a true** `[PENDIENTE]`
Caso: Llamar al método `verifyEmail` debe marcar el tenant como verificado.

- Se crea un tenant (no verificado)
- Se llama a `tenant.verifyEmail()`

Resultado:
- `tenant.isEmailVerified()` debe retornar `true`

---

**Test TE-004: Tenant.changePlan - Actualiza plan y updatedAt** `[PENDIENTE]`
Caso: El cambio de plan debe reflejarse en el estado de la entidad y en el timestamp.

- Se crea un tenant con plan TRIAL
- Se registra el `updatedAt` inicial
- Se llama a `tenant.changePlan(PlanType.create('LYMON_ONE'))`

Resultado:
- `tenant.getPlan().toString()` debe ser `'LYMON_ONE'`
- `updatedAt` del tenant debe ser posterior al valor inicial

---

### `User` — `test/domain/user/user.entity.spec.ts`

---

**Test UE-001: User.createOwner - Asigna rol OWNER** `[PENDIENTE]`
Caso: El factory method `createOwner` siempre debe crear un usuario con el rol correcto.

- Se llama a `User.createOwner(email, 'hashed', tenantId)`

Resultado:
- `user.getRole()` debe retornar `UserRoleEnum.OWNER`

---

**Test UE-002: User.createOwner - Email no verificado al crear** `[PENDIENTE]`
Caso: El usuario owner recién creado debe estar pendiente de verificación.

- Se llama a `User.createOwner(email, 'hashed', tenantId)`

Resultado:
- `user.isEmailVerified()` debe retornar `false`

---

**Test UE-003: User.verifyEmail - Actualiza estado a verificado** `[PENDIENTE]`
Caso: Invocar `verifyEmail` debe marcar el usuario como verificado.

- Se crea un usuario con `emailVerified: false`
- Se llama a `user.verifyEmail()`

Resultado:
- `user.isEmailVerified()` debe retornar `true`

---

**Test UE-004: UserId.createFromString - String vacío lanza error** `[PENDIENTE]`
Caso: El value object UserId debe proteger contra valores vacíos.

- Se llama a `UserId.createFromString('')`

Resultado:
- Debe lanzar `Error('UserId cannot be empty')`

---

## Resumen de cobertura

| User Story | Implementados | Pendientes | Total |
|------------|:---:|:---:|:---:|
| US-001 Registro de Tenant | 5 | 8 | 13 |
| US-002 Login multi-tenant | 4 | 4 | 8 |
| US-001/002 Verificación de email | 7 | 1 | 8 |
| US-004 Perfil del Tenant | 0 | 6 | 6 |
| US-005/US-2 Cambio de plan | 0 | 9 | 9 |
| US-009 Aislamiento multi-tenant | 1 | 5 | 6 |
| US-010 Auditoría | 0 | 8 | 8 |
| US-011 Sesiones activas | 0 | 6 | 6 |
| US-012 Contexto activo | 0 | 6 | 6 |
| US-1/US-2 Límites de plan (Property) | 5 | 2 | 7 |
| US-1/US-2 Límites de plan (Unit) | 5 | 1 | 6 |
| Cambio de contraseña | 0 | 5 | 5 |
| Domain Entities / VOs | 0 | 16 | 16 |
| **Total** | **27** | **77** | **104** |