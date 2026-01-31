import { IsString, IsEnum, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplateType } from 'src/domain/entities/email-template.entity';

export class CreateEmailTemplateDto {
  @ApiProperty({
    description: 'ID del hotel al que pertenece la plantilla',
    example: '675fb26f9154c4dde1c80aa1',
  })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({
    description: 'Tipo de plantilla de correo',
    enum: EmailTemplateType,
    example: EmailTemplateType.WELCOME,
  })
  @IsEnum(EmailTemplateType)
  @IsNotEmpty()
  type: EmailTemplateType;

  @ApiProperty({
    description:
      'Asunto del correo (puede incluir variables con {{variable}})',
    example: '¡Bienvenido a {{hotelName}}!',
  })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    description:
      'Cuerpo del correo en HTML o texto plano (puede incluir variables con {{variable}})',
    example:
      '<h1>Hola {{guestName}}</h1><p>Gracias por elegir {{hotelName}}. Tu reserva para el {{checkInDate}} está confirmada.</p>',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'Si la plantilla está activa o no',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
