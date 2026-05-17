import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateIncidentReportDto {
  @ApiProperty({
    example: 'General damage',
    description: 'Title of the incident report',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'A glass was broken after the guests left.',
    description: 'Detailed description of the incident',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '64f1a2b3c4d5e6f7a8b9c0d2',
    description: 'ID of the property where the incident occurred',
  })
  @IsMongoId()
  propertyId: string;

  @ApiPropertyOptional({
    example: ['https://storage.example.com/photo1.jpg'],
    description:
      'URLs of files attached to this report (upload handled separately)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  attachmentUrls?: string[];
}
