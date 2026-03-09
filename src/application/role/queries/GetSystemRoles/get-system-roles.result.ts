export class RoleDto {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly permissions: string[],
  ) {}
}

export class GetSystemRolesResult {
  constructor(public readonly roles: RoleDto[]) {}
}
