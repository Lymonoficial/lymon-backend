import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { CreateRoomTypeUseCase } from '@/application/rooms/use-cases/create-room-type.use-case';
import { AssignRoomUnitsUseCase } from '@/application/rooms/use-cases/assign-room-units.use-case';
import { CreateRoomUseCase } from '@/application/rooms/use-cases/create-room.use-case';
import { UpdateRoomPriceUseCase } from '@/application/rooms/use-cases/update-room-price.use-case';
import { CreateSpecialPriceUseCase } from '@/application/rooms/use-cases/create-special-price.use-case';
import { CreateRoomTypeDto } from '@/presentation/dtos/rooms/create-room-type.dto';
import { AssignRoomUnitsDto } from '@/presentation/dtos/rooms/assign-room-units.dto';
import { CreateRoomDto } from '@/presentation/dtos/rooms/create-room.dto';
import { UpdateRoomPriceDto } from '@/presentation/dtos/rooms/update-room-price.dto';
import { CreateSpecialPriceDto } from '@/presentation/dtos/rooms/create-special-price.dto';
import { JwtAuthGuard } from '@/presentation/guards/jwt-auth.guard';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomController {
  constructor(
    private readonly createRoomTypeUseCase: CreateRoomTypeUseCase,
    private readonly assignRoomUnitsUseCase: AssignRoomUnitsUseCase,
    private readonly createRoomUseCase: CreateRoomUseCase,
    private readonly updateRoomPriceUseCase: UpdateRoomPriceUseCase,
    private readonly createSpecialPriceUseCase: CreateSpecialPriceUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva habitación',
    description:
      'Permite al administrador crear una habitación con imagen, nombre, tipo y servicios',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Habitación creada exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o número de habitación duplicado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Se requiere token JWT',
  })
  async createRoom(@Body() dto: CreateRoomDto) {
    return await this.createRoomUseCase.execute(dto);
  }

  @Post('room-types')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo tipo de habitación',
    description:
      'Permite al administrador crear un tipo de habitación con especificaciones como nombre, precio, ocupación y servicios',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tipo de habitación creado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Se requiere token JWT',
  })
  async createRoomType(@Body() dto: CreateRoomTypeDto) {
    // Debug: ver qué recibe el servidor
    console.log('DTO recibido:', dto);
    console.log('Tipo de dto:', typeof dto);
    console.log('Keys:', Object.keys(dto));
    return await this.createRoomTypeUseCase.execute(dto);
  }

  @Post('room-types/assign-units')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Asignar unidades de habitación a un tipo',
    description:
      'Permite al administrador asignar unidades de habitación físicas (con números y pisos) a un tipo de habitación existente',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Unidades de habitación asignadas exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o números de habitación duplicados',
  })
  async assignRoomUnits(@Body() dto: AssignRoomUnitsDto) {
    return await this.assignRoomUnitsUseCase.execute(dto);
  }

  @Patch(':roomId/price')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar precio base de una habitación',
    description: 'Permite al gerente actualizar el precio base por noche de una habitación',
  })
  @ApiParam({
    name: 'roomId',
    description: 'ID de la habitación',
    example: '697d5623bce486a105fb4b99',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Precio actualizado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Habitación no encontrada o datos inválidos',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Se requiere token JWT',
  })
  async updateRoomPrice(
    @Param('roomId') roomId: string,
    @Body() dto: UpdateRoomPriceDto,
  ) {
    return await this.updateRoomPriceUseCase.execute(roomId, dto);
  }

  @Post('special-prices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear precio especial por fechas',
    description:
      'Permite al gerente configurar precios especiales para fechas específicas (temporadas altas, eventos, etc.)',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Precio especial creado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Datos inválidos o fechas incorrectas',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'No autorizado - Se requiere token JWT',
  })
  async createSpecialPrice(@Body() dto: CreateSpecialPriceDto) {
    return await this.createSpecialPriceUseCase.execute(dto);
  }
}
