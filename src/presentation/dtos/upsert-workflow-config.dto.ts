import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional } from 'class-validator';

export class UpsertWorkflowConfigDto {
  @ApiProperty({ description: 'Whether this workflow is enabled for the tenant' })
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({
    description: 'Workflow-specific parameters (e.g. { daysBeforeArrival: 2 })',
  })
  @IsOptional()
  @IsObject()
  params?: Record<string, unknown>;
}
