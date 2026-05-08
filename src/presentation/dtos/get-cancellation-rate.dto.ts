import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class GetCancellationRateDto {
  @ApiProperty({ description: 'Start date for filtering metrics' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for filtering metrics' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Optional property ID to filter by' })
  @IsOptional()
  @IsMongoId()
  propertyId?: string;
}
