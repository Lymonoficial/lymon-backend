export class GetGuestNotesByGuestIdQuery {
  constructor(
    public readonly tenantId: string,
    public readonly guestId: string,
  ) {}
}
