import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUnitRatingDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'Tenant ID' })
  @IsMongoId()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d2', description: 'Reservation ID' })
  @IsMongoId()
  @IsNotEmpty()
  reservationId: string;

  @ApiProperty({ example: 4, description: 'Rating score from 1 to 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rate: number;

  @ApiPropertyOptional({ example: 'Great place, very clean!', description: 'Optional review message', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  message?: string;
}
