import { UserRoleEnum, UserScope } from '@/domain/user/entities/user.entity';

export class InviteStaffCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly tenantId: string,
    public readonly role: UserRoleEnum,
    public readonly scope: UserScope,
  ) {}
}
