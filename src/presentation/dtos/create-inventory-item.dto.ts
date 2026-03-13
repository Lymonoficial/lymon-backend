import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'SOAP-001' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 'Soap Bar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'TOILETRIES' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'piece' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ example: 20, minimum: 0 })
  @IsInt()
  @Min(0)
  minStock: number;

  @ApiProperty({ example: 150, minimum: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  initialStock?: number;
}
