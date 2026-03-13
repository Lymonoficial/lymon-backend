import { InventoryMovementType } from '@/domain/inventory/value-objects/inventory-movement-type.vo';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RecordInventoryMovementDto {
  @ApiProperty({ example: '67c6c7f15fbad8ce3df4d7f1' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({
    enum: InventoryMovementType,
    example: InventoryMovementType.OUT,
  })
  @IsEnum(InventoryMovementType)
  type: InventoryMovementType;

  @ApiProperty({ example: 8 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 'HOUSEKEEPING_USAGE' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiProperty({ example: 'RES-12345', required: false })
  @IsOptional()
  @IsString()
  reference?: string;
}
