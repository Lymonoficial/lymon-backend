import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SaveGuestPreferencesDto {
  @ApiProperty({
    description: 'Create or update free-text notes for guest preferences',
    example: 'Guest prefers high floor and extra pillows',
  })
  @IsString()
  @IsNotEmpty()
  preferencesNotes: string;
}
