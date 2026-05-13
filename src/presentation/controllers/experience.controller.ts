import { CreateExperienceCommand } from '@/application/experience/commands/create-experience.command';
import { CreateExperienceResult } from '@/application/experience/commands/create-experience.result';
import {
  ExperienceActor,
  UpdateExperienceCommand,
} from '@/application/experience/commands/update-experience/update-experience.command';
import { ExperienceChanges } from '@/domain/experience/entities/experience.entity';
import { pickDefined } from '@/presentation/common/utils/pick-defined.util';
import { DeleteExperienceCommand } from '@/application/experience/commands/delete-experience.command';
import { GetExperiencesByTenantQuery } from '@/application/experience/queries/GetExperiencesByTenant/get-experiences-by-tenant.query';
import { GetExperiencesByTenantResult } from '@/application/experience/queries/GetExperiencesByTenant/get-experiences-by-tenant.result';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { CreateExperienceDto } from '@/presentation/dtos/experience/create-experience.dto';
import { UpdateExperienceDto } from '@/presentation/dtos/experience/update-experience.dto';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  HttpCode,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('experiences')
@ApiBearerAuth('JWT-auth')
@Controller('experiences')
export class ExperienceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.PROPERTY_VIEW)
  @ApiOperation({ summary: 'List all experiences for current tenant' })
  @ApiQuery({
    name: 'propertyId',
    required: false,
    type: String,
    description: 'Optional property filter',
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
  @ApiResponse({
    status: 200,
    description: 'Experiences retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async getAll(
    @CurrentUser() user: JwtPayload,
    @Query('propertyId') propertyId: string | undefined,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.queryBus.execute<
      GetExperiencesByTenantQuery,
      GetExperiencesByTenantResult
    >(new GetExperiencesByTenantQuery(user.tenantId, page, limit, propertyId));

    return {
      message: 'Experiences retrieved successfully',
      data: {
        experiences: result.experiences,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    };
  }

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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.EXPERIENCE_EDIT)
  @ApiOperation({ summary: 'Update an existing experience' })
  @ApiResponse({ status: 200, description: 'Experience updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation error or no fields provided',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions or not the owner',
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateExperienceDto,
  ) {
    const changes: ExperienceChanges = {
      ...pickDefined({
        name: dto.name,
        description: dto.description,
        priceCop: dto.priceCop,
        durationHours: dto.durationHours,
        capacity: dto.capacity,
        coverImageUrl: dto.coverImageUrl,
        location: dto.location,
        availabilityType: dto.availabilityType,
        recurrence: dto.recurrence,
        allowStandalonePurchase: dto.allowStandalonePurchase,
        allowReservationPurchase: dto.allowReservationPurchase,
      }),
      ...(dto.startAt !== undefined && { startAt: new Date(dto.startAt) }),
      ...(dto.endAt !== undefined && { endAt: new Date(dto.endAt) }),
      ...(dto.blackoutRanges !== undefined && {
        blackoutRanges: dto.blackoutRanges.map((r) => ({
          startAt: new Date(r.startAt),
          endAt: new Date(r.endAt),
        })),
      }),
    };

    const actor: ExperienceActor = { id: user.userId, email: user.email };

    await this.commandBus.execute(
      new UpdateExperienceCommand(id, user.tenantId, changes, actor),
    );

    return { message: 'Experience updated successfully' };
  }

  @Delete(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.EXPERIENCE_DELETE)
  @ApiOperation({ summary: 'Delete an experience' })
  @ApiResponse({ status: 204, description: 'Experience deleted successfully' })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteExperienceCommand(id, user.tenantId, user.userId, user.email),
    );
  }
}
