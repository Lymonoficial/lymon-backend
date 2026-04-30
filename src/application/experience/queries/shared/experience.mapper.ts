import { Experience } from '@/domain/experience/entities/experience.entity';
import {
  PublicExperienceBlackoutRangeDto,
  PublicExperienceDto,
  PublicExperienceLocationDto,
  PublicExperienceRecurrenceDto,
} from '@/application/experience/queries/shared/experience-read.dto';

export function mapExperienceToPublicDto(
  experience: Experience,
): PublicExperienceDto {
  const recurrence = experience.getRecurrence();

  return new PublicExperienceDto(
    experience.getId()!.toString(),
    experience.getTenantId().toString(),
    experience.getScope().toString(),
    experience.getPropertyId()?.toString() ?? null,
    experience.getUnitIds().map((unitId) => unitId.toString()),
    experience.getName(),
    experience.getDescription(),
    experience.getCategory().toString(),
    experience.getPriceCop(),
    experience.getDurationHours(),
    experience.getCapacity(),
    experience.getCoverImageUrl(),
    new PublicExperienceLocationDto(
      experience.getLocation().label,
      experience.getLocation().address,
      experience.getLocation().lat,
      experience.getLocation().lng,
    ),
    experience.getAvailabilityType().toString(),
    experience.getStartAt(),
    experience.getEndAt(),
    recurrence
      ? new PublicExperienceRecurrenceDto(
          recurrence.daysOfWeek,
          recurrence.startTime,
          recurrence.endTime,
        )
      : null,
    experience
      .getBlackoutRanges()
      .map(
        (range) =>
          new PublicExperienceBlackoutRangeDto(range.startAt, range.endAt),
      ),
    experience.getAllowStandalonePurchase(),
    experience.getAllowReservationPurchase(),
    experience.getMinNoticeHours(),
    experience.getPurchaseCutoffHours(),
    experience.getStatus().toString(),
  );
}
