export class Hotel {
  constructor(
    public readonly id: string,
    public name: string,
    public subdomain: string,
    public userId: string, // Cambio: ahora es userId en lugar de ownerEmail
    public location?: string,
    public image?: string,
    public primaryColor?: string,
    public description?: string,
    public createdAt?: Date
  ) {}

  static create(params: {
    id: string;
    name: string;
    subdomain: string;
    userId: string;
    location?: string;
    image?: string;
    primaryColor?: string;
    description?: string;
  }): Hotel {
    if (!params.subdomain.match(/^[a-z0-9-]+$/)) {
      throw new Error('Invalid subdomain format');
    }

    return new Hotel(
      params.id,
      params.name,
      params.subdomain,
      params.userId,
      params.location,
      params.image,
      params.primaryColor,
      params.description,
      new Date()
    );
  }
}
