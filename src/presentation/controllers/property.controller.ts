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
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatePropertyDto } from '@/presentation/dtos/create-property.dto';

@ApiTags('properties')
@ApiBearerAuth('JWT-auth')
@Controller('properties')
export class PropertyController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
