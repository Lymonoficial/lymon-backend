import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class UpdateShiftDto {
  @ApiPropertyOptional({
    example: 'Morning Front Desk',
    description: 'Optional shift name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({
    example: '680c79f38b4f98f4f6383b13',
    description: 'Property id where shift takes place',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    example: '2026-04-11',
    description: 'Shift start date in ISO format (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-05-11',
    description:
      'Shift end date in ISO format (YYYY-MM-DD). Use null for open-ended.',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  endDate?: string | null;

  @ApiPropertyOptional({
    example: '09:00',
    description: 'Shift start hour (24h HH:mm)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startHour?: string;

  @ApiPropertyOptional({
    example: '17:00',
    description: 'Shift end hour (24h HH:mm)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endHour?: string;

  @ApiPropertyOptional({
    example: 'Updated due to emergency coverage changes.',
    description: 'Optional internal note for this shift',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
