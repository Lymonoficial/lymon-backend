import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplateType } from 'src/domain/entities/email-template.entity';

export class SendEmailDto {
  @ApiProperty({
    description: 'ID del hotel desde el cual se envía el correo',
    example: '675fb26f9154c4dde1c80aa1',
  })
  @IsString()
  @IsNotEmpty()
  hotelId: string;

  @ApiProperty({
    description: 'Tipo de plantilla de correo a utilizar',
    enum: EmailTemplateType,
    example: EmailTemplateType.WELCOME,
  })
  @IsEnum(EmailTemplateType)
  @IsNotEmpty()
  templateType: EmailTemplateType;

  @ApiProperty({
    description: 'Dirección de correo electrónico del destinatario',
    example: 'cliente@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @ApiProperty({
    description:
      'Variables para reemplazar en la plantilla (ej: {guestName: "Juan", hotelName: "Hotel Paradise"})',
    example: {
      guestName: 'Juan Pérez',
      hotelName: 'Hotel Paradise',
      checkInDate: '15 de febrero de 2026',
      roomNumber: '301',
    },
  })
  @IsObject()
  @IsNotEmpty()
  variables: Record<string, string>;
}
