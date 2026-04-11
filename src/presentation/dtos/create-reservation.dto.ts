import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ManualReservationSourceEnum {
  MANUAL = 'MANUAL',
  DIRECT = 'DIRECT',
}

export class CreateReservationDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d2' })
  @IsMongoId()
  @IsNotEmpty()
  propertyId: string;

  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d3' })
  @IsMongoId()
  @IsNotEmpty()
  unitId: string;

  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d4' })
  @IsMongoId()
  @IsNotEmpty()
  guestId: string;

  @ApiProperty({ example: '2024-06-01' })
  @IsDateString()
  checkIn: string;

  @ApiProperty({ example: '2024-06-05' })
  @IsDateString()
  checkOut: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  guestsCount: number;

  @ApiProperty({
    enum: ManualReservationSourceEnum,
    example: ManualReservationSourceEnum.MANUAL,
  })
  @IsEnum(ManualReservationSourceEnum)
  source: ManualReservationSourceEnum;

  @ApiPropertyOptional({ example: 'Late check-in requested' })
  @IsString()
  @IsOptional()
  notes?: string;
}
