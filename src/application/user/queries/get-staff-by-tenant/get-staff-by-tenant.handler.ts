import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStaffByTenantQuery } from './get-staff-by-tenant.query';
import { GetStaffByTenantResult, StaffDto } from './get-staff-by-tenant.result';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '@/domain/user/repositories/user.repository';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@QueryHandler(GetStaffByTenantQuery)
export class GetStaffByTenantHandler implements IQueryHandler<
  GetStaffByTenantQuery,
  GetStaffByTenantResult
> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetStaffByTenantQuery): Promise<GetStaffByTenantResult> {
    let tid: TenantId;
    try {
      tid = TenantId.createFromString(query.tenantId);
    } catch {
      return { items: [] };
    }

    const users = await this.userRepository.findByTenantId(tid);

    const items: StaffDto[] = users
      .filter((u) => !u.isOwner())
      .map((u) => ({
        id: u.getId()?.toString() ?? '',
        email: u.getEmail().toString(),
        isOwner: u.isOwner(),
        emailVerified: u.isEmailVerified(),
        roleAssignments: u.getRoleAssignments(),
      }));

    return { items };
  }
}
