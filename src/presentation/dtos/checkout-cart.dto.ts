import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class CheckoutCartDto {
  @ApiProperty()
  @IsMongoId()
  tenantId: string;
}
