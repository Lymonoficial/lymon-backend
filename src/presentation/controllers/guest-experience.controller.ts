import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/infrastructure/auth/decorators/public.decorator';
import { GuestPublic } from '@/infrastructure/guest-auth/decorators/guest-public.decorator';
import { GuestJwtAuthGuard } from '@/infrastructure/guest-auth/guards/guest-jwt-auth.guard';
import { GetAvailableExperiencesQuery } from '@/application/experience/queries/GetAvailableExperiences/get-available-experiences.query';
import { GetAvailableExperiencesResult } from '@/application/experience/queries/GetAvailableExperiences/get-available-experiences.result';
import { GetAvailableExperiencesQueryDto } from '@/presentation/dtos/experience/get-available-experiences-query.dto';
import { GetAvailableExperienceByIdQuery } from '@/application/experience/queries/GetAvailableExperienceById/get-available-experience-by-id.query';
import { GetAvailableExperienceByIdResult } from '@/application/experience/queries/GetAvailableExperienceById/get-available-experience-by-id.result';
import {
  PublicExperienceBlackoutRangeDto,
  PublicExperienceDto,
  PublicExperienceLocationDto,
  PublicExperienceRecurrenceDto,
} from '@/application/experience/queries/shared/experience-read.dto';

@ApiTags('guest-experiences')
@Public()
@UseGuards(GuestJwtAuthGuard)
@Controller('guest/experiences')
export class GuestExperienceController {
  constructor(private readonly queryBus: QueryBus) {}

  @GuestPublic()
  @Get()
  @ApiOperation({ summary: 'List available experiences for guests' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of active experiences',
  })
  async findAvailable(
    @Query() query: GetAvailableExperiencesQueryDto,
  ): Promise<PublicExperienceCatalogListResult> {
    const result = await this.queryBus.execute<
      GetAvailableExperiencesQuery,
      GetAvailableExperiencesResult
    >(
      new GetAvailableExperiencesQuery(
        query.page ?? 1,
        query.limit ?? 10,
        query.tenantId,
        query.propertyId,
        query.category,
        query.sortByPrice,
      ),
    );

    return {
      experiences: result.experiences.map((experience) =>
        this.toCatalogExperienceDto(experience),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @GuestPublic()
  @Get(':id')
  @ApiOperation({ summary: 'Get public available experience by ID' })
  @ApiResponse({
    status: 200,
    description: 'Available experience retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Experience not found' })
  async findById(@Param('id') id: string) {
    const result = await this.queryBus.execute<
      GetAvailableExperienceByIdQuery,
      GetAvailableExperienceByIdResult
    >(new GetAvailableExperienceByIdQuery(id));

    return {
      data: {
        ...this.toCatalogExperienceDto(result.experience),
        propertyName: result.propertyName,
        units: result.units,
      },
    };
  }

  private toCatalogExperienceDto(
    experience: PublicExperienceDto,
  ): PublicExperienceCatalogDto {
    return {
      id: experience.id,
      tenantId: experience.tenantId,
      propertyId: experience.propertyId,
      name: experience.name,
      description: experience.description,
      category: experience.category,
      priceCop: experience.priceCop,
      durationHours: experience.durationHours,
      minimumParticipants: experience.minimumParticipants,
      capacity: experience.capacity,
      mediaUrls: experience.mediaUrls,
      location: experience.location
        ? new PublicExperienceLocationDto(
            experience.location.label,
            experience.location.address,
            experience.location.lat,
            experience.location.lng,
          )
        : null,
      availabilityType: experience.availabilityType,
      startAt: experience.startAt,
      endAt: experience.endAt,
      recurrence: experience.recurrence
        ? new PublicExperienceRecurrenceDto(
            experience.recurrence.daysOfWeek,
            experience.recurrence.startTime,
            experience.recurrence.endTime,
          )
        : null,
      blackoutRanges: experience.blackoutRanges.map(
        (range) =>
          new PublicExperienceBlackoutRangeDto(range.startAt, range.endAt),
      ),
      allowStandalonePurchase: experience.allowStandalonePurchase,
      allowReservationPurchase: experience.allowReservationPurchase,
      minNoticeHours: experience.minNoticeHours,
      purchaseCutoffHours: experience.purchaseCutoffHours,
    };
  }
}

interface PublicExperienceCatalogDto {
  id: string;
  tenantId: string;
  propertyId: string | null;
  name: string;
  description: string;
  category: string;
  priceCop: number;
  durationHours: number | null;
  minimumParticipants: number;
  capacity: number;
  mediaUrls: string[];
  location: PublicExperienceLocationDto | null;
  availabilityType: string;
  startAt: Date | null;
  endAt: Date | null;
  recurrence: PublicExperienceRecurrenceDto | null;
  blackoutRanges: PublicExperienceBlackoutRangeDto[];
  allowStandalonePurchase: boolean;
  allowReservationPurchase: boolean;
  minNoticeHours: number;
  purchaseCutoffHours: number;
}

interface PublicExperienceCatalogListResult {
  experiences: PublicExperienceCatalogDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
