import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpsertWorkflowConfigCommand } from './upsert-workflow-config.command';
import { UpsertWorkflowConfigResult } from './upsert-workflow-config.result';
import {
  WORKFLOW_CONFIG_REPOSITORY,
  type WorkflowConfigRepository,
} from '@/domain/workflow/repositories/workflow-config.repository';
import { WorkflowConfig } from '@/domain/workflow/entities/workflow-config.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { WorkflowConfigId } from '@/domain/workflow/value-objects/workflow-config-id.vo';
import {
  AUDIT_LOG_EVENT,
  AuditLoggedEvent,
} from '@/infrastructure/audit/events/audit-logged.event';
import {
  AuditAction,
  AuditEntityType,
} from '@/domain/audit/value-objects/audit-action.vo';

@CommandHandler(UpsertWorkflowConfigCommand)
export class UpsertWorkflowConfigHandler
  implements
    ICommandHandler<UpsertWorkflowConfigCommand, UpsertWorkflowConfigResult>
{
  constructor(
    @Inject(WORKFLOW_CONFIG_REPOSITORY)
    private readonly workflowConfigRepository: WorkflowConfigRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(
    command: UpsertWorkflowConfigCommand,
  ): Promise<UpsertWorkflowConfigResult> {
    const tenantId = TenantId.createFromString(command.tenantId);

    let config = await this.workflowConfigRepository.findByTenantAndType(
      command.tenantId,
      command.workflowType,
    );

    if (!config) {
      config = WorkflowConfig.create({
        tenantId,
        workflowType: command.workflowType,
        params: command.params,
      });
    } else {
      config.updateParams(command.params);
    }

    if (command.enabled) {
      config.enable();
    } else {
      config.disable();
    }

    const configId = await this.workflowConfigRepository.save(config);

    config.setId(WorkflowConfigId.create(configId));

    this.eventEmitter.emit(
      AUDIT_LOG_EVENT,
      new AuditLoggedEvent(
        command.tenantId,
        command.actorId,
        command.actorEmail,
        AuditAction.WORKFLOW_CONFIG_UPDATED,
        AuditEntityType.WORKFLOW,
        configId,
        { workflowType: command.workflowType, enabled: command.enabled },
      ),
    );

    return new UpsertWorkflowConfigResult(configId);
  }
}
