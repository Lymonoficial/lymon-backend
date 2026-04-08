export interface StaffDto {
  id: string;
  email: string;
  isOwner: boolean;
  emailVerified: boolean;
  roleAssignments: Array<{ roleId: string; scope: any }>;
}

export interface GetStaffByTenantResult {
  items: StaffDto[];
}
