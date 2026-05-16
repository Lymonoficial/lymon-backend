import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateGuestIdentityDto {
  @ApiPropertyOptional({ example: 'passport' })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiPropertyOptional({ example: 'AB123456' })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  countryCode?: string;
}

class UpdateGuestPhoneDto {
  @ApiPropertyOptional({ example: '+12025550123' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({ example: 'mobile' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class UpdateGuestProfileDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string | null;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsEmail()
  primaryEmail?: string;

  @ApiPropertyOptional({ type: [String], example: ['john.alt@example.com'] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  emails?: string[];

  @ApiPropertyOptional({ type: [UpdateGuestPhoneDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateGuestPhoneDto)
  phones?: UpdateGuestPhoneDto[];

  @ApiPropertyOptional({ type: UpdateGuestIdentityDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateGuestIdentityDto)
  identity?: UpdateGuestIdentityDto;
}
