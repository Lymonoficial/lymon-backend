import { Body, Controller, Post, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterHotelUseCase } from '@/application/hotels/use-cases/register-hotel.use-case';
import { RegisterHotelDto } from '@/infrastructure/hotels/dtos/register-hotel.dto';
import { JwtAuthGuard } from '@/infrastructure/auth/jwt-auth.guard';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelController {
  constructor(private readonly registerHotelUseCase: RegisterHotelUseCase) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo hotel',
    description:
      'Permite al usuario autenticado registrar su hotel en la plataforma con un subdominio único',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hotel registrado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o subdominio ya en uso',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Se requiere token JWT',
  })
  async registerHotel(@Body() dto: RegisterHotelDto, @Request() req) {
    const userId = req.user.userId;
    return await this.registerHotelUseCase.execute(dto, userId);
  }
}
