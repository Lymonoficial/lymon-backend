import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GuestPreferenceItemDto {
  @ApiProperty({
    description: 'ID of the catalog item to assign as a preference',
    example: '64a1f2b3c4d5e6f7a8b9c0d1',
  })
  @IsString()
  @IsNotEmpty()
  catalogItemId: string;
}

export class SaveGuestPreferencesDto {
  @ApiProperty({
    description:
      'List of catalog item IDs to assign as preferences to the guest',
    type: [GuestPreferenceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestPreferenceItemDto)
  preferences: GuestPreferenceItemDto[];
}
