# ADR-001: Arquitectura limpia con Separación en Cuatro Capas

**Fecha:** 2026-01-01  
**Estado:** Aceptado

---

## Contexto

El backend de Lymon necesita soportar múltiples funcionalidades (autenticación, propiedades, unidades, tenants, reservas, facturación) que irán creciendo con el tiempo. Necesitábamos una estructura que impida que la lógica de negocio se filtre hacia los handlers HTTP o el código de base de datos, y que permita navegar el código con facilidad a medida que escala.

## Decisión

Adoptamos Clean Architecture (Robert C. Martin) con cuatro capas explícitas, aplicadas como carpetas de primer nivel bajo `src/`:

```
src/
  domain/          ← Reglas de negocio empresariales. Sin dependencias de framework.
  application/     ← Casos de uso. Orquesta los objetos del dominio.
  infrastructure/  ← Preocupaciones externas: MongoDB, JWT, email, bcrypt.
  presentation/    ← Interfaz HTTP: controllers, DTOs, Swagger.
```

**Regla de dependencia:** las dependencias apuntan únicamente hacia adentro. `infrastructure` depende de `application`, `application` depende de `domain`, nada depende de `presentation` salvo el bootstrap del framework.

Las interfaces (contratos de repositorio, contratos de servicio) se definen en `domain/` y `application/`. Las implementaciones concretas viven en `infrastructure/`. La capa de aplicación nunca importa directamente desde `infrastructure/` — depende de abstracciones inyectadas.

Ejemplo: la interfaz `UserRepository` vive en `src/domain/user/repositories/user.repository.ts`. `MongoUserRepository` vive en `src/infrastructure/persistence/repositories/`. El handler del caso de uso recibe `UserRepository` vía DI y no tiene conocimiento de MongoDB.

## Consecuencias

**Positivas:**

- Las reglas de negocio en la capa de dominio son testeables sin levantar una base de datos ni un servidor HTTP
- Cambiar MongoDB por otra base de datos solo requiere reemplazar archivos en `infrastructure/persistence/`
- Las carpetas por feature dentro de cada capa (`auth/`, `property/`, `unit/`, `tenant/`) mantienen el código relacionado co-ubicado

**Negativas:**

- Más boilerplate por feature: entidad + interfaz de repositorio + command + handler + schema + mongo repo + controller + DTO
- Los desarrolladores no familiarizados con Clean Architecture tienen una curva de aprendizaje
