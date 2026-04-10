import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateShiftDto {
  @ApiProperty({
    example: '680c79f38b4f98f4f6383b12',
    description: 'Assigned staff user id',
  })
  @IsString()
  @IsNotEmpty()
  staffMemberId!: string;

  @ApiProperty({
    example: '680c79f38b4f98f4f6383b13',
    description: 'Property id where shift takes place',
  })
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @ApiProperty({
    example: '2026-04-11',
    description: 'Shift date in ISO format (YYYY-MM-DD)',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @ApiProperty({
    example: '09:00',
    description: 'Shift start time (24h HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @ApiProperty({
    example: '17:00',
    description: 'Shift end time (24h HH:mm)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;
}
