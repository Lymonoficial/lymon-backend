import { CreatePropertyCommand } from '@/application/property/commands/create-property.command';
import { CreatePropertyResult } from '@/application/property/commands/create-property.result';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import {
  Body,
  Controller,
  Post,
  Query,
  ParseBoolPipe,
  DefaultValuePipe,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatePropertyDto } from '@/presentation/dtos/create-property.dto';
import { GetPropertiesByTenantQuery } from '@/application/property/queries/GetPropertiesByTenant/get-properties-by-tenant.query';
import { GetPropertiesByTenantResult } from '@/application/property/queries/GetPropertiesByTenant/get-properties-by-tenant.result';

@ApiTags('properties')
@ApiBearerAuth('JWT-auth')
@Controller('properties')
export class PropertyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiQuery({
    name: 'autoCreateUnit',
    required: false,
    type: Boolean,
    description: 'Automatically create a unit if property type allows it',
  })
  @ApiResponse({ status: 201, description: 'Property created successfully' })
  @ApiResponse({ status: 403, description: 'Plan limit reached' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreatePropertyDto,
    @Query('autoCreateUnit', new DefaultValuePipe(false), ParseBoolPipe)
    autoCreateUnit: boolean,
  ) {
    const command = new CreatePropertyCommand(
      user.tenantId,
      dto.name,
      dto.description,
      dto.propertyType,
      dto.address,
      dto.city,
      dto.state,
      dto.country,
      dto.zipCode,
      dto.location,
      dto.checkInTime,
      dto.checkOutTime,
      dto.cancellationPolicy,
      dto.hostPhone,
      dto.hostEmail,
      autoCreateUnit,
      user.userId,
      user.email,
    );

    const result = await this.commandBus.execute<
      CreatePropertyCommand,
      CreatePropertyResult
    >(command);

    return {
      message: result.unitId
        ? 'Property and unit created successfully'
        : 'Property created successfully',
      data: {
        propertyId: result.propertyId,
        unitId: result.unitId,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all the properties for the current tenant' })
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
  @ApiResponse({
    status: 200,
    description: 'Properties retrieved successfully',
  })
  async getProperties(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const query = new GetPropertiesByTenantQuery(user.tenantId, page, limit);

    const result = await this.queryBus.execute<
      GetPropertiesByTenantQuery,
      GetPropertiesByTenantResult
    >(query);

    return {
      message: 'Properties retrieved successfully',
      data: result.properties,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }
}
