# ADR-002: CQRS

**Fecha:** 2026-01-01  
**Estado:** Aceptado

---

## Contexto

El módulo `@nestjs/cqrs` de NestJS soporta tanto Commands (operaciones de escritura) como Queries (operaciones de lectura) como objetos despachados por bus. Necesitábamos decidir si utilizar ambos lados de CQRS o solo uno.

## Decisión

Usamos `CqrsModule` de `@nestjs/cqrs` para todas las operaciones de escritura (mutaciones). Cada caso de uso es un par `Command` + `ICommandHandler` despachado a través del `CommandBus`.

Los handlers se registran en `ApplicationModule` bajo el array `CommandHandlers` y se proveen al contenedor de DI de NestJS.

```typescript
// application/application.module.ts
const CommandHandlers = [
  RegisterTenantHandler,
  LoginHandler,
  VerifyEmailHandler,
  ChangePasswordHandler,
  InviteStaffHandler,
];
```

## Consecuencias

**Positivas:**

- Los casos de uso son explícitos, nombrados y aislados — fáciles de encontrar y testear
- Cada handler tiene una única responsabilidad; el controller se mantiene delgado
- Agregar un nuevo caso de uso implica agregar un command + un archivo handler sin tocar código existente

**Negativas:**

- Pequeño overhead para operaciones simples que no necesitan el aislamiento
