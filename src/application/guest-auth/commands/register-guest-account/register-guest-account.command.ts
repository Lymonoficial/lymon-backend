export class RegisterGuestAccountCommand {
  constructor(
    public readonly fullName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly firstName?: string | null,
    public readonly lastName?: string | null,
  ) {}
}
