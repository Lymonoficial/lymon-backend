import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetSystemRolesQuery } from './get-system-roles.query';
import { GetSystemRolesResult, RoleDto } from './get-system-roles.result';
import { ROLE_REPOSITORY } from '@/domain/role/repositories/role.repository';
import type { RoleRepository } from '@/domain/role/repositories/role.repository';

@QueryHandler(GetSystemRolesQuery)
export class GetSystemRolesQueryHandler implements IQueryHandler<
  GetSystemRolesQuery,
  GetSystemRolesResult
> {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(): Promise<GetSystemRolesResult> {
    const roles = await this.roleRepository.findSystemRoles();

    const dtos = roles.map(
      (role) =>
        new RoleDto(
          role.getId()?.toString() ?? '',
          role.getName(),
          role.getPermissions(),
        ),
    );

    return new GetSystemRolesResult(dtos);
  }
}
