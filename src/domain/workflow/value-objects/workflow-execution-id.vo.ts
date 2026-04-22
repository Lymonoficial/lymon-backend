export class WorkflowExecutionId {
  private constructor(private readonly value: string) {}

  static create(value: string): WorkflowExecutionId {
    if (!value || value.trim() === '') {
      throw new Error('WorkflowExecutionId cannot be empty');
    }
    return new WorkflowExecutionId(value.trim());
  }

  toString(): string {
    return this.value;
  }

  equals(other: WorkflowExecutionId): boolean {
    return this.value === other.value;
  }
}
