import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterColaboratorUseCase } from 'src/application/use-cases/register-colaborator.use-case';
import { RegisterColaboratorDto } from 'src/infrastructure/dtos/register-colaborator.dto';

@ApiTags('Colaborator')
@Controller('colaborator')
export class ColaboratorController {
  constructor(private readonly registerUseCase: RegisterColaboratorUseCase) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo colaborador en el hotel' })
  @ApiResponse({
    status: 201,
    description: 'Colaborador registrado exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async register(@Body() dto: RegisterColaboratorDto) {
    return await this.registerUseCase.execute(dto);
  }
}
