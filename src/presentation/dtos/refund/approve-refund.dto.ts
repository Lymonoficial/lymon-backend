import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ApproveRefundDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d2' })
  @IsMongoId()
  @IsNotEmpty()
  refundRequestId: string;
}
