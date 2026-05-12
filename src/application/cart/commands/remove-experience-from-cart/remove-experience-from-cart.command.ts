export class RemoveExperienceFromCartCommand {
  constructor(
    readonly guestAccountId: string,
    readonly tenantId: string,
    readonly experienceId: string,
    readonly selectedDate?: Date | null,
  ) {}
}
