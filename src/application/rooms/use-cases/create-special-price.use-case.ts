import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { SpecialPriceRepository } from '@/domain/rooms/repositories/special-price.repository';
import { SpecialPrice } from '@/domain/rooms/entities/special-price.entity';
import { CreateSpecialPriceDto } from '@/infrastructure/rooms/dtos/create-special-price.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CreateSpecialPriceUseCase {
  constructor(
    @Inject('SpecialPriceRepository')
    private readonly specialPriceRepository: SpecialPriceRepository,
  ) { }

  async execute(dto: CreateSpecialPriceDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Validar que la fecha de inicio sea antes que la de fin
    if (startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio debe ser anterior a la fecha de fin',
      );
    }

    // Validar que las fechas no sean del pasado
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser del pasado',
      );
    }

    const specialPriceId = randomUUID();

    const specialPrice = SpecialPrice.create({
      id: specialPriceId,
      roomId: dto.roomId,
      hotelId: dto.hotelId,
      startDate,
      endDate,
      price: dto.price,
      description: dto.description,
    });

    const savedSpecialPrice =
      await this.specialPriceRepository.create(specialPrice);

    return savedSpecialPrice;
  }
}
