export class WorkflowConfigId {
  private constructor(private readonly value: string) {}

  static create(value: string): WorkflowConfigId {
    if (!value || value.trim() === '') {
      throw new Error('WorkflowConfigId cannot be empty');
    }
    return new WorkflowConfigId(value.trim());
  }

  toString(): string {
    return this.value;
  }

  equals(other: WorkflowConfigId): boolean {
    return this.value === other.value;
  }
}
