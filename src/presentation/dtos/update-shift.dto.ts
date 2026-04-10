import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateShiftDto {
  @ApiPropertyOptional({
    example: '680c79f38b4f98f4f6383b12',
    description: 'Assigned staff user id',
  })
  @IsOptional()
  @IsString()
  staffMemberId?: string;

  @ApiPropertyOptional({
    example: '680c79f38b4f98f4f6383b13',
    description: 'Property id where shift takes place',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    example: '2026-04-11',
    description: 'Shift date in ISO format (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ApiPropertyOptional({
    example: '09:00',
    description: 'Shift start time (24h HH:mm)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime?: string;

  @ApiPropertyOptional({
    example: '17:00',
    description: 'Shift end time (24h HH:mm)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime?: string;

  @ApiPropertyOptional({
    example: 'Updated due to emergency coverage changes.',
    description: 'Optional internal note for this shift',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
