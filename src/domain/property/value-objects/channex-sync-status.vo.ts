export enum ChannexSyncStatusEnum {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED',
}

export class ChannexSyncStatus {
  private readonly value: ChannexSyncStatusEnum;

  private constructor(value: ChannexSyncStatusEnum) {
    this.value = value;
  }

  static create(value: string): ChannexSyncStatus {
    if (
      !Object.values(ChannexSyncStatusEnum).includes(
        value as ChannexSyncStatusEnum,
      )
    ) {
      throw new Error(`Invalid channex sync status: ${value}`);
    }
    return new ChannexSyncStatus(value as ChannexSyncStatusEnum);
  }

  static pending(): ChannexSyncStatus {
    return new ChannexSyncStatus(ChannexSyncStatusEnum.PENDING);
  }

  toString(): string {
    return this.value;
  }

  isPending(): boolean {
    return this.value === ChannexSyncStatusEnum.PENDING;
  }

  isSynced(): boolean {
    return this.value === ChannexSyncStatusEnum.SYNCED;
  }

  isFailed(): boolean {
    return this.value === ChannexSyncStatusEnum.FAILED;
  }
}
