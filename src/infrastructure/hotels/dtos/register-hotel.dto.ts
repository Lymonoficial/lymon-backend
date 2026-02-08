import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  IsOptional,
  IsHexColor,
} from 'class-validator';

export class RegisterHotelDto {
  @ApiProperty({
    example: 'Hotel Paradise',
    description: 'Nombre del hotel',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'paradise-hotel',
    description:
      'Subdominio del hotel (solo letras minúsculas, números y guiones)',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'El subdominio solo puede contener letras minúsculas, números y guiones',
  })
  subdomain: string;

  @ApiProperty({
    example: 'Calle Principal 123, Ciudad, País',
    description: 'Ubicación del hotel',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'https://example.com/hotel-image.jpg',
    description: 'URL de la imagen del hotel',
    required: false,
  })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: '#FF5733',
    description: 'Color principal del hotel (formato hexadecimal)',
    required: false,
  })
  @IsHexColor()
  @IsOptional()
  primaryColor?: string;

  @ApiProperty({
    example: 'Un hotel de lujo con vistas al mar',
    description: 'Descripción del hotel',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
