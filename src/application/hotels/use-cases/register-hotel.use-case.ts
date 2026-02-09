import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { HotelRepository } from '@/domain/hotels/repositories/hotel.repository';
import { Hotel } from '@/domain/hotels/entities/hotel.entity';
import { randomUUID } from 'crypto';
import { RegisterHotelDto } from '@/presentation/dtos/hotels/register-hotel.dto';

@Injectable()
export class RegisterHotelUseCase {
  constructor(
    @Inject('HotelRepository')
    private readonly hotelRepository: HotelRepository,
  ) {}

  async execute(dto: RegisterHotelDto, userId: string): Promise<Hotel> {
    // Check if subdomain already exists
    const existingHotel = await this.hotelRepository.findBySubdomain(
      dto.subdomain,
    );

    if (existingHotel) {
      throw new BadRequestException(
        'El subdominio ya está en uso. Por favor elige otro.',
      );
    }

    // Generate hotel ID
    const hotelId = randomUUID();

    // Create hotel entity
    const hotel = Hotel.create({
      id: hotelId,
      name: dto.name,
      subdomain: dto.subdomain,
      userId: userId, // El usuario autenticado
      location: dto.location,
      image: dto.image,
      primaryColor: dto.primaryColor,
      description: dto.description,
    });

    // Save hotel
    await this.hotelRepository.save(hotel);

    return hotel;
  }
}
