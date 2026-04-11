import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CreateShiftCommand } from '@/application/shift/commands/create-shift/create-shift.command';
import { CreateShiftCommandResult } from '@/application/shift/commands/create-shift/create-shift.result';
import { UpdateShiftCommand } from '@/application/shift/commands/update-shift/update-shift.command';
import { UpdateShiftCommandResult } from '@/application/shift/commands/update-shift/update-shift.result';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { CreateShiftDto } from '@/presentation/dtos/create-shift.dto';
import { UpdateShiftDto } from '@/presentation/dtos/update-shift.dto';
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
  constructor(private readonly commandBus: CommandBus) {}

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
}
