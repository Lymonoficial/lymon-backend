import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsMongoId, IsOptional, IsString, Min } from 'class-validator';

export class UpdateInventoryItemDto {
  @ApiPropertyOptional({ example: 'Soap Bar Premium' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '6650a1b2c3d4e5f6a7b8c9d0' })
  @IsOptional()
  @IsString()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'piece' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 30, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  minStock?: number;

  @ApiPropertyOptional({ example: 50, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  currentStock?: number;
}
