import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    example: 'room-type-id-123',
    description: 'ID del tipo de habitación',
  })
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @ApiProperty({
    example: 'hotel-id-456',
    description: 'ID del hotel',
  })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({
    example: '101',
    description: 'Número de la habitación',
  })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiProperty({
    example: 'Suite Presidencial',
    description: 'Nombre descriptivo de la habitación',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 1,
    description: 'Piso donde se encuentra la habitación',
  })
  @IsNumber()
  @Min(0)
  floor: number;

  @ApiProperty({
    example: 99.99,
    description: 'Precio base por noche',
  })
  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  basePrice: number;

  @ApiProperty({
    example: 'https://example.com/room-image.jpg',
    description: 'URL de la imagen de la habitación',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: ['WiFi', 'TV', 'Aire acondicionado', 'Minibar'],
    description: 'Lista de servicios incluidos en la habitación',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiProperty({
    example: 'Amplia suite con vista al mar y balcón privado',
    description: 'Descripción de la habitación',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
