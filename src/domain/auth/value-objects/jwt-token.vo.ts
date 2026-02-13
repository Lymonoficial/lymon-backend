export class JwtToken {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): JwtToken {
    if (!value || value.trim() === '') {
      throw new Error('JWT Token cannot be empty');
    }
    return new JwtToken(value);
  }

  toString(): string {
    return this.value;
  }
}
