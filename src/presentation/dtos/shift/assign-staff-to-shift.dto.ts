import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignStaffToShiftDto {
  @ApiProperty({
    example: ['680c79f38b4f98f4f6383b12', '680c79f38b4f98f4f6383b14'],
    description: 'Staff member IDs to assign to the shift (additive)',
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  staffMemberIds!: string[];
}
