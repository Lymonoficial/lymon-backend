import { Experience } from '@/domain/experience/entities/experience.entity';
import {
  PublicExperienceBlackoutRangeDto,
  PublicExperienceDto,
  PublicExperienceLocationDto,
  PublicExperienceRecurrenceDto,
} from '@/application/experience/queries/shared/experience-read.dto';

export function mapExperienceToPublicDto(
  experience: Experience,
  getPublicUrl: (key: string) => string,
): PublicExperienceDto {
  const recurrence = experience.getRecurrence();
  const location = experience.getLocation();

  return new PublicExperienceDto(
    experience.getId()!.toString(),
    experience.getTenantId().toString(),
    experience.getPropertyId()?.toString() ?? null,
    experience.getUnitIds().map((unitId) => unitId.toString()),
    experience.getName(),
    experience.getDescription(),
    experience.getCategory().toString(),
    experience.getPriceCop(),
    experience.getDurationHours(),
    experience.getMinimumParticipants(),
    experience.getCapacity(),
    location
      ? new PublicExperienceLocationDto(
          location.label,
          location.address,
          location.lat,
          location.lng,
        )
      : null,
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
    experience.getMediaKeys().map(getPublicUrl),
  );
}
