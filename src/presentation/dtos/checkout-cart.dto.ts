import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SetCartReservationDto } from './set-cart-reservation.dto';

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

  @ApiPropertyOptional({ description: 'ISO date string for fixed-date experiences' })
  @IsOptional()
  @IsDateString()
  selectedDate?: string;
}

export class CheckoutCartDto {
  @ApiPropertyOptional({ type: SetCartReservationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SetCartReservationDto)
  reservationItem?: SetCartReservationDto;

  @ApiPropertyOptional({ type: [CheckoutCartExperienceItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutCartExperienceItemDto)
  experienceItems?: CheckoutCartExperienceItemDto[];
}
