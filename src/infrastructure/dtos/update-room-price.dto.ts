import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateRoomPriceDto {
  @ApiProperty({
    example: 149.99,
    description: 'Nuevo precio base por noche',
  })
  @IsNumber()
  @Min(0, { message: 'El precio no puede ser negativo' })
  @IsNotEmpty()
  basePrice: number;
}
