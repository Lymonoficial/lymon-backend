export class User {
  constructor(
    public readonly id: string,
    public email: string,
    public password: string,
    public name: string,
    public createdAt: Date
  ) {}

  static create(params: {
    id: string;
    email: string;
    password: string;
    name: string;
  }): User {
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(params.email)) {
      throw new Error('Invalid email format');
    }

    if (params.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    return new User(
      params.id,
      params.email.toLowerCase(),
      params.password,
      params.name,
      new Date()
    );
  }
}
