import { Injectable } from '@nestjs/common';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';
import { IWorkflowHandler } from '../interfaces/workflow-handler.interface';

@Injectable()
export class WorkflowHandlerRegistry {
  private readonly registry = new Map<WorkflowType, IWorkflowHandler>();

  register(type: WorkflowType, handler: IWorkflowHandler): void {
    this.registry.set(type, handler);
  }

  get(type: WorkflowType): IWorkflowHandler | undefined {
    return this.registry.get(type);
  }
}
