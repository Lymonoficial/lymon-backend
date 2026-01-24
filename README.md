<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Descripción

Este proyecto es un backend construido con [NestJS](https://github.com/nestjs/nest), siguiendo los principios de **Arquitectura Limpia (Clean Architecture)**.

## Estructura del Proyecto y Arquitectura

El proyecto sigue una estructura modular basada en Clean Architecture para separar las responsabilidades y hacer el código más mantenible y testeable.

### `src/core`

Contiene la lógica de negocio pura y es el corazón de la aplicación. **No debe depender de frameworks externos** (como NestJS, TypeORM, etc.).

- **`domain/entities`**: Objetos fundamentales del negocio (ej. `User`, `Product`). Contienen reglas de negocio y estado.
- **`domain/repositories`**: Interfaces (contratos) que definen las operaciones de persistencia. La implementación real va en infrastructura.
- **`use-cases`**: Casos de uso de la aplicación. Orquestan el flujo de datos entre entidades y repositorios para cumplir una funcionalidad específica (ej. `RegisterUser`, `GetProduct`).

### `src/infrastructure`

Contiene la implementación de los detalles técnicos y la interacción con herramientas externas y frameworks.

- **`controllers`**: Controladores de NestJS que manejan las peticiones HTTP y llaman a los casos de uso.
- **`database`**:
  - **`models`**: Esquemas de base de datos (ej. TypeORM entities, Mongoose schemas).
  - **`mappers`**: Convierten datos entre modelos de base de datos y entidades del dominio.
  - **`repositories`**: Implementaciones concretas de las interfaces definidas en `core/domain/repositories`.
- **`common`**: Utilidades de infraestructura (filtros de excepciones, interceptores, etc.).

### `src/shared`

Código compartido que puede ser utilizado tanto por el `core` como por la `infrastructure`, como DTOs comunes, utilidades de fecha, etc.

---

## Guía de Commits (Conventional Commits)

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/) para mantener un historial de cambios limpio y legible.

**Formato:** `tipo(ámbito/scope): descripción corta`

### Tipos de Commits Comunes:

- **`feat`**: Una nueva funcionalidad.
  - _Ejemplo_: `feat(auth): implement login endpoint`
- **`fix`**: Corrección de un error (bug).
  - _Ejemplo_: `fix(users): resolve crash on user update`
- **`chore`**: Tareas rutinarias que no modifican código fuente o tests (actualización de dependencias, configuración de build).
  - _Ejemplo_: `chore(deps): update nestjs version`
- **`refactor`**: Cambios en el código que no añaden funcionalidad ni arreglan bugs (mejorar legibilidad, estructura).
  - _Ejemplo_: `refactor(core): simplify validation logic`
- **`docs`**: Cambios solo en la documentación.
  - _Ejemplo_: `docs(readme): update architecture section`
- **`test`**: Añadir o corregir tests.
  - _Ejemplo_: `test(auth): add unit tests for login use case`
- **`style`**: Cambios que no afectan el significado del código (espacios, formato, puntos y coma).

---

## Buenas Prácticas y Estándares de Código

### 1. Idioma

- **TODO** el código debe estar en **INGLÉS**.
- Nombres de variables, funciones, clases, archivos, comentarios y commits deben ser en inglés.

### 2. Responsabilidad Única (SRP)

- Cada clase y función debe tener **una sola responsabilidad**.
- Los Controladores solo deben manejar HTTP (recibir request, llamar caso de uso, devolver response). No deben tener lógica de negocio.
- Los Casos de Uso solo deben ejecutar una regla de negocio específica.

### 3. Nombramiento (Naming Conventions)

- **Clases e Interfaces**: `PascalCase` (ej. `UserController`, `AuthService`, `IUserRepository`).
- **Variables y Funciones**: `camelCase` (ej. `findUserById`, `isValid`).
- **Constantes**: `UPPER_SNAKE_CASE` (ej. `MAX_RETRY_COUNT`).
- **Archivos**: `kebab-case` (ej. `user-controller.ts`, `auth.service.ts`).

### 4. General

- Evitar "números mágicos" o strings "quemados" (hardcoded). Usar constantes o variables de configuración.
- Usar `async/await` en lugar de `.then()`.
- Manejar errores de forma explícita.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
