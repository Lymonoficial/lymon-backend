import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UnassignStaffFromShiftDto {
  @ApiProperty({
    example: ['680c79f38b4f98f4f6383b12', '680c79f38b4f98f4f6383b14'],
    description: 'Staff member IDs to unassign from the shift',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  staffMemberIds!: string[];
}
