import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CheckoutCartReservationItemDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty()
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

  @ApiProperty({ example: 200000 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pricePerNight: number;

  @ApiPropertyOptional({ example: 'Late check-in requested' })
  @IsOptional()
  @IsString()
  notes?: string;
}

class CheckoutCartExperienceItemDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  experienceId: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    description: 'ISO date string for fixed-date experiences',
  })
  @IsOptional()
  @IsDateString()
  selectedDate?: string;
}

export class CheckoutCartDto {
  @ApiPropertyOptional({ type: CheckoutCartReservationItemDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckoutCartReservationItemDto)
  reservationItem?: CheckoutCartReservationItemDto;

  @ApiPropertyOptional({ type: [CheckoutCartExperienceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutCartExperienceItemDto)
  experienceItems?: CheckoutCartExperienceItemDto[];
}
