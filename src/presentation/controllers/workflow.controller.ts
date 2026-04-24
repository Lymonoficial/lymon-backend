import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Put,
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
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { PermissionGuard } from '@/infrastructure/auth/guards/permission.guard';
import { RequirePermission } from '@/infrastructure/auth/decorators/require-permission.decorator';
import { Permission } from '@/domain/role/value-objects/permission.vo';
import { CurrentUser } from '@/infrastructure/auth/decorators/current-user.decorator';
import { type JwtPayload } from '@/application/auth/services/jwt.service';
import { WorkflowType } from '@/domain/workflow/enums/workflow-type.enum';
import { UpsertWorkflowConfigDto } from '@/presentation/dtos/upsert-workflow-config.dto';
import { UpsertWorkflowConfigCommand } from '@/application/workflow/commands/upsert-workflow-config/upsert-workflow-config.command';
import { UpsertWorkflowConfigResult } from '@/application/workflow/commands/upsert-workflow-config/upsert-workflow-config.result';
import { GetWorkflowConfigsQuery } from '@/application/workflow/queries/get-workflow-configs/get-workflow-configs.query';
import { GetWorkflowConfigsResult } from '@/application/workflow/queries/get-workflow-configs/get-workflow-configs.result';
import { GetWorkflowExecutionsQuery } from '@/application/workflow/queries/get-workflow-executions/get-workflow-executions.query';
import { GetWorkflowExecutionsResult } from '@/application/workflow/queries/get-workflow-executions/get-workflow-executions.result';

@ApiTags('workflows')
@ApiBearerAuth('JWT-auth')
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('configs')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.WORKFLOW_MANAGE)
  @ApiOperation({ summary: 'List all workflow configs for the tenant' })
  @ApiResponse({ status: 200, description: 'Workflow configs retrieved' })
  async getConfigs(@CurrentUser() user: JwtPayload) {
    const result = await this.queryBus.execute<
      GetWorkflowConfigsQuery,
      GetWorkflowConfigsResult
    >(new GetWorkflowConfigsQuery(user.tenantId));

    return {
      message: 'Workflow configs retrieved successfully',
      data: result.configs,
    };
  }

  @Put('configs/:type')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.WORKFLOW_MANAGE)
  @ApiOperation({ summary: 'Enable/disable a workflow and update its params' })
  @ApiResponse({ status: 200, description: 'Workflow config updated' })
  async upsertConfig(
    @CurrentUser() user: JwtPayload,
    @Param('type') type: WorkflowType,
    @Body() dto: UpsertWorkflowConfigDto,
  ) {
    const result = await this.commandBus.execute<
      UpsertWorkflowConfigCommand,
      UpsertWorkflowConfigResult
    >(
      new UpsertWorkflowConfigCommand(
        user.tenantId,
        type,
        dto.enabled,
        dto.params ?? {},
        user.userId,
        user.email,
      ),
    );

    return {
      message: 'Workflow config updated successfully',
      data: result,
    };
  }

  @Get('executions')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission(Permission.WORKFLOW_MANAGE)
  @ApiOperation({ summary: 'Get workflow execution history for the tenant' })
  @ApiQuery({ name: 'type', required: false, enum: WorkflowType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Workflow executions retrieved' })
  async getExecutions(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: WorkflowType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    const result = await this.queryBus.execute<
      GetWorkflowExecutionsQuery,
      GetWorkflowExecutionsResult
    >(new GetWorkflowExecutionsQuery(user.tenantId, page, limit, type));

    return {
      message: 'Workflow executions retrieved successfully',
      data: result.executions,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
