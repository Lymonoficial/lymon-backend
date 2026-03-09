export class RegisterGuestAccountResult {
  constructor(
    public readonly guestAccountId: string,
    public readonly email: string,
    public readonly message: string,
  ) {}
}
