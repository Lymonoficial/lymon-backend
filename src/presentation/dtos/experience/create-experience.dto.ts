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
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ExperienceAvailabilityTypeEnum } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategoryEnum } from '@/domain/experience/value-objects/experience-category.vo';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExperienceLocationDto {
  @ApiPropertyOptional({
    example: 'Main lobby pickup point',
    description: 'Short place label shown to guests',
  })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({
    example: 'Cra 10 #20-30, Bogota',
    description: 'Optional detailed address',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 4.6097, minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  lat?: number;

  @ApiPropertyOptional({ example: -74.0817, minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  lng?: number;
}

class ExperienceRecurrenceDto {
  @ApiProperty({
    example: [1, 2, 3, 4, 5],
    description: 'Week days in JS format (0=Sunday, 6=Saturday)',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek!: number[];

  @ApiProperty({
    example: '08:00',
    description: 'Recurring window start time in HH:mm',
  })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({
    example: '18:00',
    description: 'Recurring window end time in HH:mm',
  })
  @IsString()
  @IsNotEmpty()
  endTime!: string;
}

class ExperienceBlackoutRangeDto {
  @ApiProperty({
    example: '2026-05-15T00:00:00.000Z',
    format: 'date-time',
  })
  @IsString()
  @IsNotEmpty()
  startAt!: string;

  @ApiProperty({
    example: '2026-05-16T23:59:59.000Z',
    format: 'date-time',
  })
  @IsString()
  @IsNotEmpty()
  endAt!: string;
}

export class CreateExperienceDto {
  @ApiPropertyOptional({ example: '6650d0ef3f3d2d2d2d2d2d2d' })
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({
    description:
      'Optional list of unit IDs. Requires propertyId when provided.',
    type: [String],
    example: ['6650d0ef3f3d2d2d2d2d2d33'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  unitIds?: string[];

  @ApiProperty({ example: 'Airport transfer' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'Private transfer from airport to property',
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  description!: string;

  @ApiProperty({
    enum: ExperienceCategoryEnum,
    example: ExperienceCategoryEnum.TRANSPORTATION,
  })
  @IsEnum(ExperienceCategoryEnum)
  category!: ExperienceCategoryEnum;

  @ApiProperty({ example: 120000, minimum: 0.01 })
  @IsNumber()
  @Min(0.01)
  priceCop!: number;

  @ApiPropertyOptional({ example: 2, minimum: 0.1 })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  durationHours?: number;

  @ApiPropertyOptional({
    example: 2,
    minimum: 1,
    default: 1,
    description:
      'Minimum participants required for the experience to take place',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  minimumParticipants?: number;

  @ApiProperty({ example: 8, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiPropertyOptional({ type: () => ExperienceLocationDto })
  @ValidateNested()
  @Type(() => ExperienceLocationDto)
  @IsOptional()
  location?: ExperienceLocationDto;

  @ApiProperty({
    enum: ExperienceAvailabilityTypeEnum,
    example: ExperienceAvailabilityTypeEnum.DATE_RANGE,
  })
  @IsEnum(ExperienceAvailabilityTypeEnum)
  availabilityType!: ExperienceAvailabilityTypeEnum;

  @ApiPropertyOptional({
    example: '2026-05-10T10:00:00.000Z',
    format: 'date-time',
  })
  @IsString()
  @IsOptional()
  startAt?: string;

  @ApiPropertyOptional({
    example: '2026-05-20T10:00:00.000Z',
    format: 'date-time',
  })
  @IsString()
  @IsOptional()
  endAt?: string;

  @ApiPropertyOptional({ type: () => ExperienceRecurrenceDto })
  @ValidateNested()
  @Type(() => ExperienceRecurrenceDto)
  @IsOptional()
  recurrence?: ExperienceRecurrenceDto;

  @ApiPropertyOptional({
    type: () => [ExperienceBlackoutRangeDto],
    example: [
      {
        startAt: '2026-05-15T00:00:00.000Z',
        endAt: '2026-05-16T23:59:59.000Z',
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => ExperienceBlackoutRangeDto)
  @IsArray()
  @IsOptional()
  blackoutRanges?: ExperienceBlackoutRangeDto[];

  @ApiProperty({ example: true })
  @IsBoolean()
  allowStandalonePurchase!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  allowReservationPurchase!: boolean;

  @ApiPropertyOptional({
    example: ['tenantId/experiences/1234-photo.jpg'],
    description: 'R2 object keys for uploaded media files',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaKeys?: string[];
}
