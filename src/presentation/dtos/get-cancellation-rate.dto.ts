import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class GetCancellationRateDto {
  @ApiProperty({ description: 'Guest ID to filter metrics' })
  @IsMongoId()
  guestId: string;

  @ApiProperty({ description: 'Start date for filtering metrics' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date for filtering metrics' })
  @IsDateString()
  endDate: string;
}
