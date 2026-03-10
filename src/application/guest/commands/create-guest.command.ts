export class CreateGuestCommand {
  constructor(
    public readonly tenantId: string,
    public readonly fullName: string,
    public readonly primaryEmail: string,
    public readonly identity?: {
      documentType?: string;
      documentNumber?: string;
      countryCode?: string;
    },
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly emails?: string[],
    public readonly phones?: Array<{
      number: string;
      type?: string;
      isPrimary?: boolean;
    }>,
    public readonly tags?: string[],
    public readonly preferencesNotes?: string,
  ) {}
}
