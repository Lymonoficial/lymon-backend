import { Controller, Get, HttpStatus, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { GetSystemRolesQuery } from '@/application/role/queries/GetSystemRoles/get-system-roles.query';
import { GetSystemRolesResult } from '@/application/role/queries/GetSystemRoles/get-system-roles.result';

@ApiTags('roles')
@Controller('roles')
export class RoleController {
  constructor(private readonly queryBus: QueryBus) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all system roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all system roles with their permissions',
  })
  async getSystemRoles(): Promise<GetSystemRolesResult> {
    return this.queryBus.execute<GetSystemRolesQuery, GetSystemRolesResult>(
      new GetSystemRolesQuery(),
    );
  }
}
