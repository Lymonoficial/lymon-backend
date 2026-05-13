import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class SetCartReservationDto {
  @ApiProperty()
  @IsMongoId()
  tenantId: string;

  @ApiProperty()
  @IsMongoId()
  reservationId: string;
}
