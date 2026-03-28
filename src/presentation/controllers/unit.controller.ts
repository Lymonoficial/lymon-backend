import { CreateUnitCommand } from '@/application/unit/commands/create-unit.command';
import { CreateUnitResult } from '@/application/unit/commands/create-unit.result';
import { DeleteUnitCommand } from '@/application/unit/commands/delete-unit.command';
import { UpdateUnitCommand } from '@/application/unit/commands/update-unit.command';
import { UpdateUnitResult } from '@/application/unit/commands/update-unit.result';
import { GetUnitsByPropertyQuery } from '@/application/unit/queries/GetUnitsByProperty/get-units-by-property.query';
import { GetUnitsByPropertyResult } from '@/application/unit/queries/GetUnitsByProperty/get-units-by-property.result';
import { GetPublicUnitsByTenantQuery } from '@/application/unit/queries/GetPublicUnitsByTenant/get-public-units-by-tenant.query';
import { GetPublicUnitsByTenantResult } from '@/application/unit/queries/GetPublicUnitsByTenant/get-public-units-by-tenant.result';
import { GetAllPublicUnitsQuery } from '@/application/unit/queries/GetAllPublicUnits/get-all-public-units.query';
import { GetAllPublicUnitsResult } from '@/application/unit/queries/GetAllPublicUnits/get-all-public-units.result';
import { GetPublicUnitByIdQuery } from '@/application/unit/queries/GetPublicUnitById/get-public-unit-by-id.query';
import { GetPublicUnitByIdResult } from '@/application/unit/queries/GetPublicUnitById/get-public-unit-by-id.result';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
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
import { UpdateUnitDto } from '@/presentation/dtos/update-unit.dto';

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

  @Patch(':unitId')
  @UseGuards(PermissionGuard)
  @RequirePermission(Permission.PROPERTY_EDIT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing unit' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  @ApiResponse({
    status: 409,
    description: 'Inventory change conflicts with active reservations',
  })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('unitId') unitId: string,
    @Body() dto: UpdateUnitDto,
  ) {
    const command = new UpdateUnitCommand(
      user.tenantId,
      unitId,
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
      UpdateUnitCommand,
      UpdateUnitResult
    >(command);

    return {
      message: 'Unit updated successfully',
      data: {
        unitId: result.unitId,
      },
    };
  }

  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Get all public units (no authentication required)',
  })
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
  async getAllPublic(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const query = new GetAllPublicUnitsQuery(page, limit);

    const result = await this.queryBus.execute<
      GetAllPublicUnitsQuery,
      GetAllPublicUnitsResult
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

  @Public()
  @Get('public/:tenantId')
  @ApiOperation({
    summary: 'Get all units for a tenant (public, no authentication required)',
  })
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
  async getPublicByTenant(
    @Param('tenantId') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const query = new GetPublicUnitsByTenantQuery(tenantId, page, limit);

    const result = await this.queryBus.execute<
      GetPublicUnitsByTenantQuery,
      GetPublicUnitsByTenantResult
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

  @Public()
  @Get('public/unit/:unitId')
  @ApiOperation({
    summary: 'Get a specific unit by ID (public, no authentication required)',
  })
  @ApiResponse({ status: 200, description: 'Unit retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async getPublicById(@Param('unitId') unitId: string) {
    const query = new GetPublicUnitByIdQuery(unitId);

    const result = await this.queryBus.execute<
      GetPublicUnitByIdQuery,
      GetPublicUnitByIdResult
    >(query);

    return {
      message: 'Unit retrieved successfully',
      data: {
        unit: result.unit,
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

  @Delete(':unitId')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.UNIT_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a unit' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 204, description: 'Unit deleted successfully' })
  @ApiResponse({ status: 404, description: 'Unit not found' })
  async deleteUnit(
    @CurrentUser() user: JwtPayload,
    @Param('unitId') unitId: string,
  ): Promise<void> {
    const command = new DeleteUnitCommand(
      user.tenantId,
      unitId,
      user.userId,
      user.email,
    );

    await this.commandBus.execute<DeleteUnitCommand, void>(command);
  }
}
