import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ExperienceAvailabilityTypeEnum } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateExperienceLocationDto {
  @ApiPropertyOptional({ example: 'Main lobby pickup point' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({ example: 'Cra 10 #20-30, Bogota' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 4.6097, minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiPropertyOptional({ example: -74.0817, minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

class UpdateExperienceRecurrenceDto {
  @ApiPropertyOptional({ example: [1, 2, 3, 4, 5] })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek!: number[];

  @ApiPropertyOptional({ example: '08:00' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;
}

class UpdateExperienceBlackoutRangeDto {
  @ApiPropertyOptional({ example: '2026-05-15T00:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  startAt!: string;

  @ApiPropertyOptional({ example: '2026-05-16T23:59:59.000Z' })
  @IsString()
  @IsNotEmpty()
  endAt!: string;
}

export class UpdateExperienceDto {
  @ApiPropertyOptional({ example: 'Airport transfer' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: 'Private transfer from airport to property',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 120000, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  priceCop?: number;

  @ApiPropertyOptional({ example: 2, minimum: 0.1 })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  durationHours?: number;

  @ApiPropertyOptional({ example: 8, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ example: 'https://image.com/experience-cover.jpg' })
  @IsUrl()
  @IsOptional()
  coverImageUrl?: string;

  @ApiPropertyOptional({ type: () => UpdateExperienceLocationDto })
  @ValidateNested()
  @Type(() => UpdateExperienceLocationDto)
  @IsOptional()
  location?: UpdateExperienceLocationDto;

  @ApiPropertyOptional({ enum: ExperienceAvailabilityTypeEnum })
  @IsEnum(ExperienceAvailabilityTypeEnum)
  @IsOptional()
  availabilityType?: ExperienceAvailabilityTypeEnum;

  @ApiPropertyOptional({ example: '2026-05-10T10:00:00.000Z' })
  @IsString()
  @IsOptional()
  startAt?: string;

  @ApiPropertyOptional({ example: '2026-05-20T10:00:00.000Z' })
  @IsString()
  @IsOptional()
  endAt?: string;

  @ApiPropertyOptional({ type: () => UpdateExperienceRecurrenceDto })
  @ValidateNested()
  @Type(() => UpdateExperienceRecurrenceDto)
  @IsOptional()
  recurrence?: UpdateExperienceRecurrenceDto;

  @ApiPropertyOptional({ type: () => [UpdateExperienceBlackoutRangeDto] })
  @ValidateNested({ each: true })
  @Type(() => UpdateExperienceBlackoutRangeDto)
  @IsArray()
  @IsOptional()
  blackoutRanges?: UpdateExperienceBlackoutRangeDto[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowStandalonePurchase?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  allowReservationPurchase?: boolean;
}
