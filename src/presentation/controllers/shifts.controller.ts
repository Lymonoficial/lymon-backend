import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CreateShiftCommand } from '@/application/shift/commands/create-shift/create-shift.command';
import { CreateShiftCommandResult } from '@/application/shift/commands/create-shift/create-shift.result';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { CreateShiftDto } from '@/presentation/dtos/create-shift.dto';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
        dto.staffMemberId,
        dto.propertyId,
        dto.date,
        dto.startTime,
        dto.endTime,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Shift created successfully',
      data: result,
    };
  }
}
