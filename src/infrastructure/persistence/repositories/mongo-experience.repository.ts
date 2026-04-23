import { Experience } from '@/domain/experience/entities/experience.entity';
import { ExperienceRepository } from '@/domain/experience/repositories/experience.repository';
import { ExperienceAvailabilityType } from '@/domain/experience/value-objects/experience-availability-type.vo';
import { ExperienceCategory } from '@/domain/experience/value-objects/experience-category.vo';
import { ExperienceId } from '@/domain/experience/value-objects/experience-id.vo';
import { ExperienceScope } from '@/domain/experience/value-objects/experience-scope.vo';
import { ExperienceStatus } from '@/domain/experience/value-objects/experience-status.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { TransactionContextData } from '@/domain/shared/transaction-manager.interface';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { ExperienceDocument } from '@/infrastructure/persistence/schemas/experience.schema';

@Injectable()
export class MongoExperienceRepository implements ExperienceRepository {
  constructor(
    @InjectModel(ExperienceDocument.name)
    private readonly experienceModel: Model<ExperienceDocument>,
  ) {}

  async save(
    experience: Experience,
    transactionContext?: TransactionContextData,
  ): Promise<string> {
    const id = experience.getId()?.toString();
    const session = transactionContext as ClientSession | undefined;
    const propertyId = experience.getPropertyId();

    const document = {
      tenantId: new Types.ObjectId(experience.getTenantId().toString()),
      propertyId: propertyId ? new Types.ObjectId(propertyId.toString()) : null,
      unitIds: experience
        .getUnitIds()
        .map((unitId) => new Types.ObjectId(unitId.toString())),
      scope: experience.getScope().toString(),
      name: experience.getName(),
      description: experience.getDescription(),
      category: experience.getCategory().toString(),
      priceCop: experience.getPriceCop(),
      durationHours: experience.getDurationHours(),
      capacity: experience.getCapacity(),
      coverImageUrl: experience.getCoverImageUrl(),
      location: experience.getLocation(),
      availabilityType: experience.getAvailabilityType().toString(),
      startAt: experience.getStartAt(),
      endAt: experience.getEndAt(),
      recurrence: experience.getRecurrence(),
      blackoutRanges: experience.getBlackoutRanges(),
      allowStandalonePurchase: experience.getAllowStandalonePurchase(),
      allowReservationPurchase: experience.getAllowReservationPurchase(),
      minNoticeHours: experience.getMinNoticeHours(),
      purchaseCutoffHours: experience.getPurchaseCutoffHours(),
      status: experience.getStatus().toString(),
      updatedAt: experience.getUpdatedAt(),
    };

    if (id) {
      await this.experienceModel.findByIdAndUpdate(id, document, {
        new: true,
        session,
      });

      return id;
    }

    const [created] = await this.experienceModel.create(
      [
        {
          ...document,
          createdAt: experience.getCreatedAt(),
        },
      ],
      { session },
    );

    return created._id.toString();
  }

  async findById(id: ExperienceId): Promise<Experience | null> {
    const document = await this.experienceModel.findOne({
      _id: new Types.ObjectId(id.toString()),
      deletedAt: null,
    });

    if (!document) {
      return null;
    }

    return this.toDomain(document);
  }

  async existsByPropertyIdAndName(
    propertyId: PropertyId,
    name: string,
  ): Promise<boolean> {
    const normalizedName = name.trim().toLowerCase();
    const matched = await this.experienceModel.findOne({
      propertyId: new Types.ObjectId(propertyId.toString()),
      deletedAt: null,
      $expr: {
        $eq: [{ $toLower: '$name' }, normalizedName],
      },
    });

    return !!matched;
  }

  private toDomain(document: ExperienceDocument): Experience {
    return Experience.reconstitute({
      id: ExperienceId.create(document._id.toString()),
      tenantId: TenantId.createFromString(document.tenantId.toString()),
      scope: ExperienceScope.create(document.scope),
      propertyId: document.propertyId
        ? PropertyId.create(document.propertyId.toString())
        : undefined,
      unitIds: (document.unitIds ?? []).map((unitId) =>
        UnitId.create(unitId.toString()),
      ),
      name: document.name,
      description: document.description,
      category: ExperienceCategory.create(document.category),
      priceCop: document.priceCop,
      durationHours: document.durationHours,
      capacity: document.capacity,
      coverImageUrl: document.coverImageUrl,
      location: {
        label: document.location.label,
        address: document.location.address,
        lat: document.location.lat,
        lng: document.location.lng,
      },
      availabilityType: ExperienceAvailabilityType.create(
        document.availabilityType,
      ),
      startAt: document.startAt ?? undefined,
      endAt: document.endAt ?? undefined,
      recurrence: document.recurrence
        ? {
            daysOfWeek: document.recurrence.daysOfWeek,
            startTime: document.recurrence.startTime,
            endTime: document.recurrence.endTime,
          }
        : undefined,
      blackoutRanges: (document.blackoutRanges ?? []).map((range) => ({
        startAt: range.startAt,
        endAt: range.endAt,
      })),
      allowStandalonePurchase: document.allowStandalonePurchase,
      allowReservationPurchase: document.allowReservationPurchase,
      minNoticeHours: document.minNoticeHours,
      purchaseCutoffHours: document.purchaseCutoffHours,
      status: ExperienceStatus.create(document.status),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.deletedAt ?? null,
    });
  }
}
