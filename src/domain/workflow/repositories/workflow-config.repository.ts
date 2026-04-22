import { WorkflowConfig } from '../entities/workflow-config.entity';
import { WorkflowType } from '../enums/workflow-type.enum';
import { WorkflowConfigId } from '../value-objects/workflow-config-id.vo';

export const WORKFLOW_CONFIG_REPOSITORY = 'WORKFLOW_CONFIG_REPOSITORY';

export interface WorkflowConfigRepository {
  save(config: WorkflowConfig): Promise<string>;
  findById(id: WorkflowConfigId): Promise<WorkflowConfig | null>;
  findByTenantAndType(
    tenantId: string,
    type: WorkflowType,
  ): Promise<WorkflowConfig | null>;
  findAllByTenant(tenantId: string): Promise<WorkflowConfig[]>;
  findEnabledByType(type: WorkflowType): Promise<WorkflowConfig[]>;
}
