import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateRoomTypeDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the hotel',
  })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({
    example: 'Deluxe Suite',
    description: 'Name of the room type',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Spacious suite with ocean view and private balcony',
    description: 'Description of the room type',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 150.0,
    description: 'Base price per night in USD',
  })
  @IsNumber()
  @Min(0, { message: 'Base price cannot be negative' })
  basePrice: number;

  @ApiProperty({
    example: 4,
    description: 'Maximum number of guests',
  })
  @IsNumber()
  @Min(1, { message: 'Max occupancy must be at least 1' })
  maxOccupancy: number;

  @ApiProperty({
    example: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar'],
    description: 'List of amenities included',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];
}
