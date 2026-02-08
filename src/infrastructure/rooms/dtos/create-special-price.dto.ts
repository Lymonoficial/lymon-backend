import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateSpecialPriceDto {
  @ApiProperty({
    example: '697d5623bce486a105fb4b99',
    description: 'ID de la habitación',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    example: 'cff39b14-08f9-45ca-b702-e4bf12553c0d',
    description: 'ID del hotel',
  })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({
    example: '2026-12-20',
    description: 'Fecha de inicio (formato: YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2026-12-31',
    description: 'Fecha de fin (formato: YYYY-MM-DD)',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    example: 199.99,
    description: 'Precio especial por noche',
  })
  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 'Precio de temporada navideña',
    description: 'Descripción del precio especial',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
