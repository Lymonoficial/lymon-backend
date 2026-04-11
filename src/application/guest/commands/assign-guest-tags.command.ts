export class AssignGuestTagsCommand {
  constructor(
    public readonly guestId: string,
    public readonly tags: string[],
    public readonly tenantId: string,
  ) {}
}
