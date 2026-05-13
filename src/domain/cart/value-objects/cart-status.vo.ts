export enum CartStatusEnum {
  OPEN = 'OPEN',
  CHECKED_OUT = 'CHECKED_OUT',
  EXPIRED = 'EXPIRED',
}

export class CartStatus {
  private constructor(private readonly value: CartStatusEnum) {}

  static create(value: CartStatusEnum): CartStatus {
    return new CartStatus(value);
  }

  static open(): CartStatus {
    return new CartStatus(CartStatusEnum.OPEN);
  }

  getValue(): CartStatusEnum {
    return this.value;
  }

  isOpen(): boolean {
    return this.value === CartStatusEnum.OPEN;
  }

  toString(): string {
    return this.value;
  }
}
