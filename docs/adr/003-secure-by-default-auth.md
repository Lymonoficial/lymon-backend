# ADR-003: JWT Auth Guard Aplicado Globalmente — Exclusión con @Public()

**Fecha:** 2026-01-01  
**Estado:** Aceptado

---

## Contexto

En una API de gestión hotelera, la gran mayoría de los endpoints requieren autenticación. El comportamiento inseguro por defecto — donde las rutas son públicas a menos que recuerdes agregar un guard — crea un alto riesgo de exponer accidentalmente endpoints sin protección.

## Decisión

`JwtAuthGuard` se registra como **guard global** a través de `APP_GUARD` en `AppModule`:

```typescript
// app.module.ts
providers: [
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
];
```

Todas las rutas están protegidas por defecto. Para hacer una ruta pública, los desarrolladores se excluyen explícitamente con el decorador `@Public()`:

```typescript
@Public()
@Post('login')
async login(...) { ... }
```

`JwtAuthGuard` lee el metadata `isPublic` establecido por `@Public()` y omite la validación de passport si está presente. Las rutas públicas actuales son: `POST /auth/register`, `POST /auth/login`, `GET /auth/verify-email`.

## Consecuencias

**Positivas:**

- Las nuevas rutas están protegidas por defecto — no hay riesgo de olvidar agregar un guard
- La postura de seguridad es explícita: hay que decidir conscientemente hacer algo público
- Punto de registro único; no hay repetición de `@UseGuards(JwtAuthGuard)` por controller

**Negativas:**

- Los desarrolladores deben recordar agregar `@Public()` en rutas intencionalmente abiertas (aunque el fallo — un 401 — es inmediatamente obvio durante el desarrollo)
