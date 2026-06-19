export class UpdateGuestProfileCommand {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
    public readonly fullName?: string,
    public readonly firstName?: string | null,
    public readonly lastName?: string | null,
    public readonly primaryEmail?: string,
    public readonly emails?: string[],
    public readonly phones?: Array<{
      number: string;
      type?: string;
      isPrimary?: boolean;
    }>,
    public readonly identity?: {
      documentType?: string;
      documentNumber?: string;
      countryCode?: string;
    },
  ) {}
}
