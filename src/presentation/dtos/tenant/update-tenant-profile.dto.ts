import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateTenantProfileDto {
  @ApiPropertyOptional({
    example: 'Hotel Paradise',
    description: 'Updated name of the tenant business',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '+52 55 1234 5678',
    description: 'Business contact phone number',
  })
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(30)
  contactPhone?: string | null;

  @ApiPropertyOptional({
    example: 'Av. Reforma 123, Ciudad de México',
    description: 'Physical address of the business',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string | null;

  @ApiPropertyOptional({
    example: 'https://www.myhotel.com',
    description: 'Business website URL',
  })
  @IsOptional()
  @IsUrl()
  website?: string | null;

  @ApiPropertyOptional({
    example: 'https://storage.example.com/logo.png',
    description: 'URL of the business logo (upload handled separately)',
  })
  @IsOptional()
  @IsUrl()
  logoUrl?: string | null;
}
