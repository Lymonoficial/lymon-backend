import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GuestPreferenceCategoryEnum } from '@/domain/guest-preference/value-objects/guest-preference-category.vo';

export class GuestPreferenceItemDto {
  @ApiProperty({ description: 'ID of the catalog item' })
  @IsString()
  @IsNotEmpty()
  catalogItemId: string;

  @ApiProperty({ description: 'Label snapshot at the moment of assignment' })
  @IsString()
  @IsNotEmpty()
  labelSnapshot: string;

  @ApiProperty({ enum: GuestPreferenceCategoryEnum })
  @IsEnum(GuestPreferenceCategoryEnum)
  category: GuestPreferenceCategoryEnum;
}

export class SaveGuestPreferencesDto {
  @ApiProperty({
    description: 'List of preference items to assign to the guest',
    type: [GuestPreferenceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuestPreferenceItemDto)
  preferences: GuestPreferenceItemDto[];
}
