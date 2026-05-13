# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run build          # nest build → dist/
pnpm run start:dev      # watch mode
pnpm run lint           # ESLint --fix on src/ and test/
pnpm run format         # Prettier write on src/ and test/
pnpm run test           # Jest unit + integration
pnpm run test:watch     # Jest watch
pnpm run test:cov       # Jest coverage → coverage/
pnpm run test:e2e       # e2e suite (test/jest-e2e.json)
pnpm run sonar          # coverage + SonarScanner
```

Run a single test file:
```bash
pnpm test -- --testPathPattern="path/to/spec.ts"
```

## Architecture

NestJS backend following strict **DDD + CQRS**. Four physical layers:

```
src/
  domain/           # pure TS, no framework deps
  application/      # CQRS handlers
  infrastructure/   # Mongoose, auth, email, schedulers
  presentation/     # controllers, DTOs, filters
```

### domain/
- Entities have **private constructors** with `create()` (new) and `reconstitute()` (from persistence) factory methods.
- Repository contracts are TypeScript **interfaces** with exported string injection tokens (e.g., `TENANT_REPOSITORY`).
- `DomainException` is the only validation error type — caught globally and mapped to HTTP 400.

### application/
- One folder per aggregate, split into `commands/` and `queries/`.
- Each operation = its own folder with `<name>.command.ts` + `<name>.handler.ts` (or `.query`).
- Handlers implement `ICommandHandler` / `IQueryHandler` from `@nestjs/cqrs`.
- All mutating commands carry `actorId` + `actorEmail` for audit. Handlers emit `AuditLoggedEvent` after mutations.

### infrastructure/
- `persistence/repositories/` — `Mongo<Aggregate>Repository` implements domain interface; maps docs → domain entities via `toDomainEntity()` calling `Entity.reconstitute()`.
- Repository bindings: `{ provide: TENANT_REPOSITORY, useClass: MongoTenantRepository }`.
- **Dual auth**: staff/tenant uses global `JwtAuthGuard`; guest portal uses separate `GuestJwtAuthGuard` with its own strategy.

### presentation/
- DTOs use `class-validator` + `class-transformer`. `ValidationPipe` is global with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`.
- Swagger enabled only when `isDevelopment=true`, served at `/api/docs`.

## Testing

Tests mirror `src/` under `test/`. Path aliases: `@/` → `src/`, `@test/` → `test/`.

**Handlers are unit-tested without `TestingModule`** — instantiated directly with mock dependencies.

Key test utilities:
- `test/shared/fixtures/` — `create<Aggregate>Fixture()` factories using `reconstitute()`
- `test/shared/mocks/repositories/` — `jest.Mocked<TRepository>` factories
- `test/shared/mocks/services/` — mock email, token, event emitter, password hasher, transaction manager

## Environment

Required vars (see `.env.example`): `MONGODB_URI`, `JWT_SECRET`, `APP_URL`. Runtime also reads `PORT` (default 3000) and `isDevelopment`.

## Coding Guidelines

- **Cognitive Complexity**: No method or function may exceed a cognitive complexity of 15; refactor into smaller, flattened logical units if this threshold is reached.