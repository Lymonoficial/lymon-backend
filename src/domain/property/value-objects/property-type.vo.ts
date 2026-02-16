export enum PropertyTypeEnum {
  HOTEL = 'HOTEL',
  CASA = 'CASA',
  APARTAMENTO = 'APARTAMENTO',
  VILLA = 'VILLA',
  HOSTAL = 'HOSTAL',
  GLAMPING = 'GLAMPING',
}

export class PropertyType {
  private readonly value: PropertyTypeEnum;

  private constructor(value: PropertyTypeEnum) {
    this.value = value;
  }

  static create(value: string): PropertyType {
    if (!Object.values(PropertyTypeEnum).includes(value as PropertyTypeEnum)) {
      throw new Error(`Invalid property type ${value}`);
    }
    return new PropertyType(value as PropertyTypeEnum);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PropertyType): boolean {
    return this.value === other.value;
  }

  isHotel(): boolean {
    return (
      this.value === PropertyTypeEnum.HOTEL ||
      this.value === PropertyTypeEnum.HOSTAL
    );
  }

  shouldAutoCreateUnit(): boolean {
    return (
      this.value === PropertyTypeEnum.CASA ||
      this.value === PropertyTypeEnum.APARTAMENTO ||
      this.value === PropertyTypeEnum.VILLA
    );
  }
}
