import { CreateUnitCommand } from '@/application/unit/commands/create-unit.command';
import { CreateUnitResult } from '@/application/unit/commands/create-unit.result';
import { GetUnitsByPropertyQuery } from '@/application/unit/queries/GetUnitsByProperty/get-units-by-property.query';
import { GetUnitsByPropertyResult } from '@/application/unit/queries/GetUnitsByProperty/get-units-by-property.result';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUnitDto } from '@/presentation/dtos/create-unit.dto';

@ApiTags('units')
@ApiBearerAuth('JWT-auth')
@Controller('units')
export class UnitController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
      user.userId,
      user.email,
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

  @Get(':propertyId')
  @ApiOperation({ summary: 'Get all units for a property' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully' })
  @ApiResponse({
    status: 403,
    description: 'Property does not belong to tenant',
  })
  @ApiResponse({ status: 404, description: 'Property not found' })
  async getByProperty(
    @CurrentUser() user: JwtPayload,
    @Param('propertyId') propertyId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const query = new GetUnitsByPropertyQuery(
      user.tenantId,
      propertyId,
      page,
      limit,
    );

    const result = await this.queryBus.execute<
      GetUnitsByPropertyQuery,
      GetUnitsByPropertyResult
    >(query);

    return {
      message: 'Units retrieved successfully',
      data: {
        units: result.units,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }
}
