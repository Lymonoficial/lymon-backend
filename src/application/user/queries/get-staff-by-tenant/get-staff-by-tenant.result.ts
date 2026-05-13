export interface StaffScopedResourceDto {
  id: string;
  name: string;
}

export type StaffScopeDto =
  | { type: 'TENANT' }
  | {
      type: 'PROPERTY';
      resourceIds: string[];
      resources: StaffScopedResourceDto[];
    }
  | {
      type: 'UNIT';
      resourceIds: string[];
      resources: StaffScopedResourceDto[];
    };

export interface StaffDto {
  id: string;
  email: string;
  isOwner: boolean;
  emailVerified: boolean;
  roleAssignments: Array<{ roleId: string; scope: StaffScopeDto }>;
}

export interface GetStaffByTenantResult {
  items: StaffDto[];
}
