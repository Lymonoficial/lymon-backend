import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGuestReservationDto {
  @ApiProperty({
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
    description: 'Tenant ID (property management company)',
  })
  @IsMongoId()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d2' })
  @IsMongoId()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d3' })
  @IsMongoId()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2026-06-05' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  guestsCount: number;

  @ApiPropertyOptional({ example: 'Late check-in requested' })
  @IsOptional()
  @IsString()
  notes?: string;
}
