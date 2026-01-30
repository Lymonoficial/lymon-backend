import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  // IsMongoId,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export enum ColaboratorRole {
  GERENTE = 'Gerente',
  RECEPCIONISTA = 'Recepcionista',
  LIMPIEZA = 'Limpieza',
}

export class RegisterColaboratorDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del colaborador' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del colaborador' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'juan.perez@hotel.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '1234567891',
    description: 'Teléfono del colaborador',
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    enum: ColaboratorRole,
    example: ColaboratorRole.RECEPCIONISTA,
  })
  @IsEnum(ColaboratorRole)
  role: ColaboratorRole;

  /*
  @ApiProperty({ example: '987f7f9384' })
  @IsMongoId()
  hotelId: string;
  */

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del colaborador',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
