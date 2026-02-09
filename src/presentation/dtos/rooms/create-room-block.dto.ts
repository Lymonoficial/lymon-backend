import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  ArrayUnique,
  IsDateString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateRoomBlockDto {
  @ApiProperty({
    example: 'Microsoft Sales Conference 2026',
    description: 'Descriptive name for the room block',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  blockName: string;

  @ApiProperty({
    example: 'Microsoft Corp',
    description: 'Company name (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    example: 'Annual Sales Kickoff',
    description: 'Event name (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  eventName?: string;

  @ApiProperty({
    example: ['201', '202', '203', '204', '205'],
    description: 'Array of room numbers to block',
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  roomNumbers: string[];

  @ApiProperty({
    example: '2026-03-10',
    description: 'Block start date (YYYY-MM-DD)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-03-14',
    description: 'Block end date (YYYY-MM-DD)',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    example: '2026-03-05',
    description: 'Cutoff date for releasing unused rooms (optional)',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  cutoffDate?: string;

  @ApiProperty({
    example: 'salesmanager@hotel.com',
    description: 'Email/ID of the colaborator creating this block',
  })
  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @ApiProperty({
    example:
      'Negotiated rate: $120/night. Contact: John Doe (john@microsoft.com)',
    description: 'Additional notes or terms',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
