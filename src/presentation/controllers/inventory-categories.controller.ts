import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { CreateInventoryItemCategoryDto } from '@/presentation/dtos/inventory/create-inventory-item-category.dto';
import { CreateInventoryItemCategoryCommand } from '@/application/inventory/commands/create-inventory-item-category/create-inventory-item-category.command';
import { CreateInventoryItemCategoryResult } from '@/application/inventory/commands/create-inventory-item-category/create-inventory-item-category.result';

@ApiTags('inventory-categories')
@ApiBearerAuth('JWT-auth')
@Controller('inventory/categories')
export class InventoryCategoriesController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.PROPERTY_EDIT)
  @ApiOperation({ summary: 'Create an inventory item category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async createCategory(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateInventoryItemCategoryDto,
  ) {
    const result = await this.commandBus.execute<
      CreateInventoryItemCategoryCommand,
      CreateInventoryItemCategoryResult
    >(
      new CreateInventoryItemCategoryCommand(
        user.tenantId,
        dto.name,
        dto.description ?? null,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Inventory item category created successfully',
      data: result,
    };
  }
}
