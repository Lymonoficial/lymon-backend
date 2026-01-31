import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RoomUnitDto {
  @ApiProperty({
    example: '101',
    description: 'Room number identifier',
  })
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @ApiProperty({
    example: 1,
    description: 'Floor number',
  })
  @IsNumber()
  @Min(0, { message: 'Floor number cannot be negative' })
  floor: number;
}

export class AssignRoomUnitsDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'ID of the hotel',
  })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({
    example: '507f1f77bcf86cd799439012',
    description: 'ID of the room type',
  })
  @IsString()
  @IsNotEmpty()
  roomTypeId: string;

  @ApiProperty({
    type: [RoomUnitDto],
    description: 'List of physical room units to assign',
    example: [
      { roomNumber: '101', floor: 1 },
      { roomNumber: '102', floor: 1 },
      { roomNumber: '201', floor: 2 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoomUnitDto)
  rooms: RoomUnitDto[];
}
