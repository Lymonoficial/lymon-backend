import { CreateUnitCommand } from '@/application/unit/commands/create-unit.command';
import { CreateUnitResult } from '@/application/unit/commands/create-unit.result';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUnitDto } from '@/presentation/dtos/create-unit.dto';

@ApiTags('units')
@ApiBearerAuth('JWT-auth')
@Controller('units')
export class UnitController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @ApiOperation({ summary: 'Create a new unit for a property' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  @ApiResponse({
    status: 403,
    description: 'Plan limit reached or property does not belong to tenant',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateUnitDto) {
    const command = new CreateUnitCommand(
      user.tenantId,
      dto.propertyId,
      dto.name,
      dto.description,
      dto.inventoryCount,
      dto.maxGuests,
      dto.standardGuests,
      dto.bedrooms,
      dto.bathroomsCount,
      dto.isShared,
      dto.amenities,
      dto.pricePerNight,
      dto.externalIds,
    );

    const result = await this.commandBus.execute<
      CreateUnitCommand,
      CreateUnitResult
    >(command);

    return {
      message: 'Unit created successfully',
      data: {
        unitId: result.unitId,
      },
    };
  }
}
