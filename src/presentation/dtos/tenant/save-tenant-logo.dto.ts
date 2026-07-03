import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SaveTenantLogoDto {
  @ApiProperty({
    example: 'tenants/65f1.../logo/1719236872000.png',
    description: 'R2 key returned by the presigned-url endpoint',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
