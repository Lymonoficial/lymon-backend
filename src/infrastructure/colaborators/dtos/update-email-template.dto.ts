import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmailTemplateDto {
  @ApiProperty({
    description:
      'Asunto del correo (puede incluir variables con {{variable}})',
    example: '¡Bienvenido a {{hotelName}}!',
    required: false,
  })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({
    description:
      'Cuerpo del correo en HTML o texto plano (puede incluir variables con {{variable}})',
    example:
      '<h1>Hola {{guestName}}</h1><p>Gracias por elegir {{hotelName}}.</p>',
    required: false,
  })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({
    description: 'Si la plantilla está activa o no',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
