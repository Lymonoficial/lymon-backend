import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGuestPreferencesDto {
  @ApiPropertyOptional({
    description: 'Update free-text notes for guest preferences',
    example: 'Guest prefers high floor and extra pillows',
  })
  @IsOptional()
  @IsString()
  preferencesNotes?: string;
}
