import { BadRequestException } from '@nestjs/common';

// 1. Definimos los estados válidos
export enum GuestLifecycleStatus {
  NO_RESERVATION = 'NO_RESERVATION',
  UPCOMING_STAY = 'UPCOMING_STAY',
  CHECKED_IN = 'CHECKED_IN',
  PAST_GUEST = 'PAST_GUEST',
}

export class GuestLifecycleStatusVO {
  private readonly value: GuestLifecycleStatus;

  private constructor(value: GuestLifecycleStatus) {
    this.value = value;
  }

  // 2. Método estático para crear el objeto (Validador)
  public static create(value: string): GuestLifecycleStatusVO {
    if (!Object.values(GuestLifecycleStatus).includes(value as GuestLifecycleStatus)) {
      throw new BadRequestException(`Invalid lifecycle status: ${value}`);
    }
    return new GuestLifecycleStatusVO(value as GuestLifecycleStatus);
  }

  // 3. Método para obtener el valor como string
  public getValue(): GuestLifecycleStatus {
    return this.value;
  }

  public toString(): string {
    return this.value.toString();
  }

  // 4. Método para comparar estados fácilmente
  public equals(other: GuestLifecycleStatusVO): boolean {
    return this.value === other.getValue();
  }
}