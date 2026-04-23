import { CreateExperienceCommand } from '@/application/experience/commands/create-experience.command';
import { CreateExperienceResult } from '@/application/experience/commands/create-experience.result';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { CreateExperienceDto } from '@/presentation/dtos/create-experience.dto';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('experiences')
@ApiBearerAuth('JWT-auth')
@Controller('experiences')
export class ExperienceController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.PROPERTY_EDIT)
  @ApiOperation({ summary: 'Create a new experience' })
  @ApiBody({
    type: CreateExperienceDto,
    examples: {
      propertyScopedDateRange: {
        summary: 'Property-scoped transportation experience',
        value: {
          scope: 'PROPERTY',
          propertyId: '6650d0ef3f3d2d2d2d2d2d2d',
          unitIds: ['6650d0ef3f3d2d2d2d2d2d33'],
          name: 'Airport transfer',
          description: 'Private transfer from airport to property',
          category: 'TRANSPORTATION',
          priceCop: 120000,
          durationHours: 2,
          capacity: 8,
          coverImageUrl: 'https://image.com/experience-cover.jpg',
          location: {
            label: 'Main lobby pickup point',
            address: 'Cra 10 #20-30, Bogota',
            lat: 4.6097,
            lng: -74.0817,
          },
          availabilityType: 'DATE_RANGE',
          startAt: '2026-05-10T10:00:00.000Z',
          endAt: '2026-05-20T10:00:00.000Z',
          blackoutRanges: [
            {
              startAt: '2026-05-15T00:00:00.000Z',
              endAt: '2026-05-16T23:59:59.000Z',
            },
          ],
          allowStandalonePurchase: true,
          allowReservationPurchase: true,
        },
      },
      tenantRecurring: {
        summary: 'Tenant-level recurring transportation service',
        value: {
          scope: 'TENANT',
          name: 'Daily shuttle service',
          description: 'Recurring daily transportation service',
          category: 'TRANSPORTATION',
          priceCop: 80000,
          durationHours: 1,
          capacity: 12,
          coverImageUrl: 'https://image.com/tenant-shuttle.jpg',
          location: {
            label: 'Terminal norte',
            address: 'Terminal del Norte',
            lat: 4.7044,
            lng: -74.0848,
          },
          availabilityType: 'RECURRING',
          recurrence: {
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '08:00',
            endTime: '18:00',
          },
          allowStandalonePurchase: true,
          allowReservationPurchase: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Experience created successfully' })
  @ApiResponse({
    status: 400,
    description:
      'Validation error. Example rule violation: TENANT scope cannot include unitIds.',
    schema: {
      example: {
        statusCode: 400,
        message: 'unitIds require propertyId',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Property or unit not found' })
  @ApiResponse({ status: 409, description: 'Duplicated experience name' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateExperienceDto,
  ) {
    const command = new CreateExperienceCommand(
      user.tenantId,
      dto.scope,
      dto.propertyId,
      dto.unitIds,
      dto.name,
      dto.description,
      dto.category,
      dto.priceCop,
      dto.durationHours,
      dto.capacity,
      dto.coverImageUrl,
      dto.location,
      dto.availabilityType,
      dto.startAt,
      dto.endAt,
      dto.recurrence,
      dto.blackoutRanges,
      dto.allowStandalonePurchase,
      dto.allowReservationPurchase,
      user.userId,
      user.email,
    );

    const result = await this.commandBus.execute<
      CreateExperienceCommand,
      CreateExperienceResult
    >(command);

    return {
      message: 'Experience created successfully',
      data: {
        experienceId: result.experienceId,
      },
    };
  }
}
