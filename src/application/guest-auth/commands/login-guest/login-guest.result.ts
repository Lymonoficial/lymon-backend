export class GuestLoginResult {
  constructor(
    public readonly guestAccountId: string,
    public readonly email: string,
    public readonly emailVerified: boolean,
    public readonly accessToken: string,
    public readonly refreshToken: string,
  ) {}
}
