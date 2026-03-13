import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { CreateInventoryItemDto } from '@/presentation/dtos/create-inventory-item.dto';
import { RecordInventoryMovementDto } from '@/presentation/dtos/record-inventory-movement.dto';
import { CreateInventoryItemCommand } from '@/application/inventory/commands/create-inventory-item/create-inventory-item.command';
import { CreateInventoryItemResult } from '@/application/inventory/commands/create-inventory-item/create-inventory-item.result';
import { RecordInventoryMovementCommand } from '@/application/inventory/commands/record-inventory-movement/record-inventory-movement.command';
import { RecordInventoryMovementResult } from '@/application/inventory/commands/record-inventory-movement/record-inventory-movement.result';
import { GetInventoryItemsByPropertyQuery } from '@/application/inventory/queries/get-inventory-items-by-property/get-inventory-items-by-property.query';
import { GetInventoryItemsByPropertyResult } from '@/application/inventory/queries/get-inventory-items-by-property/get-inventory-items-by-property.result';
import { GetLowStockItemsByPropertyQuery } from '@/application/inventory/queries/get-low-stock-items-by-property/get-low-stock-items-by-property.query';
import { GetLowStockItemsByPropertyResult } from '@/application/inventory/queries/get-low-stock-items-by-property/get-low-stock-items-by-property.result';

@ApiTags('inventory')
@ApiBearerAuth('JWT-auth')
@Controller('properties/:propertyId/inventory')
export class InventoryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('items')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.PROPERTY_EDIT)
  @ApiOperation({ summary: 'Create a stock inventory item for a property' })
  @ApiResponse({
    status: 201,
    description: 'Inventory item created successfully',
  })
  async createItem(
    @CurrentUser() user: JwtPayload,
    @Param('propertyId') propertyId: string,
    @Body() dto: CreateInventoryItemDto,
  ) {
    const result = await this.commandBus.execute<
      CreateInventoryItemCommand,
      CreateInventoryItemResult
    >(
      new CreateInventoryItemCommand(
        user.tenantId,
        propertyId,
        dto.sku,
        dto.name,
        dto.category,
        dto.unit,
        dto.minStock,
        dto.initialStock ?? 0,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Inventory item created successfully',
      data: result,
    };
  }

  @Post('movements')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.PROPERTY_EDIT)
  @ApiOperation({ summary: 'Record stock movement (IN, OUT, ADJUSTMENT)' })
  @ApiResponse({
    status: 201,
    description: 'Inventory movement recorded successfully',
  })
  async recordMovement(
    @CurrentUser() user: JwtPayload,
    @Param('propertyId') propertyId: string,
    @Body() dto: RecordInventoryMovementDto,
  ) {
    const result = await this.commandBus.execute<
      RecordInventoryMovementCommand,
      RecordInventoryMovementResult
    >(
      new RecordInventoryMovementCommand(
        user.tenantId,
        propertyId,
        dto.itemId,
        dto.type,
        dto.quantity,
        dto.reason,
        dto.reference ?? null,
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Inventory movement recorded successfully',
      data: result,
    };
  }

  @Get('items')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.PROPERTY_VIEW)
  @ApiOperation({ summary: 'Get all inventory items by property' })
  @ApiResponse({
    status: 200,
    description: 'Inventory items retrieved successfully',
  })
  async getItems(
    @CurrentUser() user: JwtPayload,
    @Param('propertyId') propertyId: string,
  ) {
    const result = await this.queryBus.execute<
      GetInventoryItemsByPropertyQuery,
      GetInventoryItemsByPropertyResult
    >(new GetInventoryItemsByPropertyQuery(user.tenantId, propertyId));

    return {
      message: 'Inventory items retrieved successfully',
      data: result.items,
    };
  }

  @Get('alerts/low-stock')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.PROPERTY_VIEW)
  @ApiOperation({ summary: 'Get low stock alerts by property' })
  @ApiResponse({
    status: 200,
    description: 'Low stock items retrieved successfully',
  })
  async getLowStock(
    @CurrentUser() user: JwtPayload,
    @Param('propertyId') propertyId: string,
  ) {
    const result = await this.queryBus.execute<
      GetLowStockItemsByPropertyQuery,
      GetLowStockItemsByPropertyResult
    >(new GetLowStockItemsByPropertyQuery(user.tenantId, propertyId));

    return {
      message: 'Low stock items retrieved successfully',
      data: result.items,
    };
  }
}
