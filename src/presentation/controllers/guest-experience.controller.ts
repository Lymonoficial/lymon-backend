import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { GuestJwtAuthGuard } from '@/infrastructure/guest-auth/guards/guest-jwt-auth.guard';
import { GetAvailableExperiencesQuery } from '@/application/experience/queries/GetAvailableExperiences/get-available-experiences.query';
import { GetAvailableExperiencesResult } from '@/application/experience/queries/GetAvailableExperiences/get-available-experiences.result';
import { GetAvailableExperiencesQueryDto } from '@/presentation/dtos/experience/get-available-experiences-query.dto';

@ApiTags('guest-experiences')
@ApiBearerAuth('GuestJWT-auth')
@Public()
@UseGuards(GuestJwtAuthGuard)
@Controller('guest/experiences')
export class GuestExperienceController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @ApiOperation({ summary: 'List available experiences for guests' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of active experiences',
  })
  async findAvailable(
    @Query() query: GetAvailableExperiencesQueryDto,
  ): Promise<GetAvailableExperiencesResult> {
    return this.queryBus.execute<
      GetAvailableExperiencesQuery,
      GetAvailableExperiencesResult
    >(
      new GetAvailableExperiencesQuery(
        query.page ?? 1,
        query.limit ?? 10,
        query.tenantId,
        query.propertyId,
        query.category,
      ),
    );
  }
}
