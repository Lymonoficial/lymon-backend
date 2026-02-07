export class Colaborator {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly role: string,
    // public readonly hotelId: string,
    public readonly isActive: boolean,
    public readonly password: string,
  ) {}
}
