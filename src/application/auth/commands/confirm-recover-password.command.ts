export class ConfirmRecoverPasswordCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
    public readonly newPasswordConfirmation: string,
  ) {}
}
