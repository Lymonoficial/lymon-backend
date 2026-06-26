import { v4 as uuidv4 } from 'uuid';

export class ConversationId {
  private constructor(private readonly value: string) {}

  static create(): ConversationId {
    return new ConversationId(uuidv4());
  }

  static createFromString(value: string): ConversationId {
    if (!value || value.trim() === '') {
      throw new Error('ConversationId cannot be empty');
    }
    return new ConversationId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: ConversationId): boolean {
    return this.value === other.value;
  }
}
