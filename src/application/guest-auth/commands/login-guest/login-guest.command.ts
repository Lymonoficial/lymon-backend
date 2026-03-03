export class GuestLoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}
