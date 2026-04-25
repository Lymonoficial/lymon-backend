import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CreateShiftCommand } from '@/application/shift/commands/create-shift/create-shift.command';
import { CreateShiftCommandResult } from '@/application/shift/commands/create-shift/create-shift.result';
import { UpdateShiftCommand } from '@/application/shift/commands/update-shift/update-shift.command';
import { UpdateShiftCommandResult } from '@/application/shift/commands/update-shift/update-shift.result';
import { DeleteShiftCommand } from '@/application/shift/commands/delete-shift/delete-shift.command';
import { DeleteShiftCommandResult } from '@/application/shift/commands/delete-shift/delete-shift.result';
import { GetShiftsQuery } from '@/application/shift/queries/get-shifts/get-shifts.query';
import { type GetShiftsResult } from '@/application/shift/queries/get-shifts/get-shifts.result';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { CreateShiftDto } from '@/presentation/dtos/create-shift.dto';
import { GetShiftsDto } from '@/presentation/dtos/get-shifts.dto';
import { UpdateShiftDto } from '@/presentation/dtos/update-shift.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('shifts')
@ApiBearerAuth('JWT-auth')
@Controller('shifts')
export class ShiftsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List work shifts filtered by date and property' })
  @ApiResponse({ status: 200, description: 'Shifts returned successfully' })
  async getShifts(
    @CurrentUser() user: JwtPayload,
    @Query() dto: GetShiftsDto,
  ): Promise<{ data: GetShiftsResult }> {
    const canViewAllStaff =
      user.isOwner ||
      user.roleAssignments.some((assignment) =>
        assignment.permissions.includes(Permission.TENANT_USERS_MANAGE),
      );

    const result = await this.queryBus.execute<GetShiftsQuery, GetShiftsResult>(
      new GetShiftsQuery(
        user.tenantId,
        {
          dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
          dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
          propertyId: dto.propertyId,
        },
        user.userId,
        canViewAllStaff,
      ),
    );

    return { data: result };
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Create a work shift for a staff member' })
  @ApiResponse({ status: 201, description: 'Shift created successfully' })
  async createShift(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateShiftDto,
  ) {
    const result = await this.commandBus.execute<
      CreateShiftCommand,
      CreateShiftCommandResult
    >(
      new CreateShiftCommand(
        user.tenantId,
        dto.staffMemberIds ?? [],
        dto.propertyId,
        dto.startDate,
        dto.endDate ?? null,
        dto.startHour,
        dto.endHour,
        dto.name,
        dto.notes,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Shift created successfully',
      data: result,
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Update an existing work shift' })
  @ApiResponse({ status: 200, description: 'Shift updated successfully' })
  async updateShift(
    @CurrentUser() user: JwtPayload,
    @Param('id') shiftId: string,
    @Body() dto: UpdateShiftDto,
  ) {
    const result = await this.commandBus.execute<
      UpdateShiftCommand,
      UpdateShiftCommandResult
    >(
      new UpdateShiftCommand(
        shiftId,
        user.tenantId,
        dto.propertyId,
        dto.startDate,
        dto.endDate,
        dto.startHour,
        dto.endHour,
        dto.name,
        dto.notes,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Shift updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.TENANT_USERS_MANAGE)
  @ApiOperation({ summary: 'Delete a work shift' })
  @ApiResponse({ status: 200, description: 'Shift deleted successfully' })
  async deleteShift(
    @CurrentUser() user: JwtPayload,
    @Param('id') shiftId: string,
  ) {
    const result = await this.commandBus.execute<
      DeleteShiftCommand,
      DeleteShiftCommandResult
    >(new DeleteShiftCommand(shiftId, user.tenantId, user.userId, user.email));

    return {
      message: 'Shift deleted successfully',
      data: result,
    };
  }
}
