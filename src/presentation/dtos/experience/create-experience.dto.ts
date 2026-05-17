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
import { ExperienceCategoryEnum } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceScopeEnum } from '@/domain/experience/value-objects/experience-scope.vo';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ExperienceLocationDto {
  @ApiProperty({
    example: 'Main lobby pickup point',
    description: 'Short place label shown to guests',
  })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiPropertyOptional({
    example: 'Cra 10 #20-30, Bogota',
    description: 'Optional detailed address',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 4.6097, minimum: -90, maximum: 90 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: -74.0817, minimum: -180, maximum: 180 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
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
  @ApiProperty({
    enum: ExperienceScopeEnum,
    example: ExperienceScopeEnum.PROPERTY,
    description:
      'Scope behavior: PROPERTY allows optional propertyId and optional unitIds filtering. TENANT is tenant-wide and must not include unitIds.',
  })
  @IsEnum(ExperienceScopeEnum)
  scope!: ExperienceScopeEnum;

  @ApiPropertyOptional({ example: '6650d0ef3f3d2d2d2d2d2d2d' })
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({
    description: [
      '**Rules for Scope:**',
      '* **PROPERTY scope + empty unitIds:** All units in property.',
      '* **PROPERTY scope + unitIds list:** Only listed units.',
      '* **TENANT scope + unitIds:** Forbidden.',
    ].join('\n'),
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

  @ApiProperty({ example: 2, minimum: 0.1 })
  @IsNumber()
  @Min(0.1)
  durationHours!: number;

  @ApiProperty({ example: 8, minimum: 1 })
  @IsInt()
  @Min(1)
  capacity!: number;

  @ApiProperty({ example: 'https://image.com/experience-cover.jpg' })
  @IsUrl()
  coverImageUrl!: string;

  @ApiProperty({ type: () => ExperienceLocationDto })
  @ValidateNested()
  @Type(() => ExperienceLocationDto)
  location!: ExperienceLocationDto;

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
}
