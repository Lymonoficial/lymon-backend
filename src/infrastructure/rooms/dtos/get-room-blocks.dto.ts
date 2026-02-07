import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { RoomBlockStatus } from 'src/domain/rooms/entities/room-block.entity';

export class GetRoomBlocksDto {
  @ApiProperty({
    example: '2026-03-01',
    description: 'Start date for filtering room blocks (ISO 8601 format)',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-03-31',
    description: 'End date for filtering room blocks (ISO 8601 format)',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    required: false,
    enum: RoomBlockStatus,
    description: 'Optional filter by block status',
  })
  @IsEnum(RoomBlockStatus)
  @IsOptional()
  status?: RoomBlockStatus;
}
