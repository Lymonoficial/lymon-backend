import { Unit } from '@/domain/unit/entities/unit.entity';
import { UnitId } from '@/domain/unit/value-objects/unit-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';
import { PropertyId } from '@/domain/property/value-objects/property-id.vo';
import { ExternalIds } from '@/domain/unit/value-objects/external-ids.vo';
import {
  BedTypeEnum,
  type Bedroom,
} from '@/domain/unit/value-objects/bed-type.vo';

describe('Unit Entity', () => {
  const UNIT_ID = 'unit-123';
  const TENANT_ID = 'tenant-456';
  const PROPERTY_ID = 'property-789';

  // ─── Fixtures ────────────────────────────────────────────────────────────

  function createValidInput() {
    return {
      tenantId: TenantId.createFromString(TENANT_ID),
      propertyId: PropertyId.create(PROPERTY_ID),
      basicInfo: {
        name: 'Deluxe Suite',
        description: 'Ocean view suite with modern amenities',
      },
      inventoryConfig: {
        inventoryCount: 3,
      },
      capacityConfig: {
        maxGuests: 4,
        standardGuests: 2,
      },
      physicalFeatures: {
        bedrooms: [
          {
            roomName: 'Master Bedroom',
            beds: [{ type: BedTypeEnum.KING, count: 1 }],
          },
        ],
        bathroomsCount: 2,
        isShared: false,
      },
      pricingConfig: {
        pricePerNight: 250,
      },
      amenities: ['wifi', 'parking', 'kitchen'],
      externalIds: ExternalIds.create('airbnb-123', 'booking-456', 'vrbo-789'),
    };
  }

  // ─── Tests for Unit.create ──────────────────────────────────────────────

  describe('Unit.create', () => {
    it('should create a unit with valid input', () => {
      const input = createValidInput();

      const unit = Unit.create(input);

      expect(unit).toBeDefined();
      expect(unit.getId()).toBeNull();
      expect(unit.getTenantId().toString()).toBe(TENANT_ID);
      expect(unit.getPropertyId().toString()).toBe(PROPERTY_ID);
      expect(unit.getName()).toBe('Deluxe Suite');
      expect(unit.getDescription()).toBe('Ocean view suite with modern amenities');
      expect(unit.getInventoryCount()).toBe(3);
      expect(unit.getMaxGuests()).toBe(4);
      expect(unit.getStandardGuests()).toBe(2);
      expect(unit.getBathroomsCount()).toBe(2);
      expect(unit.getIsShared()).toBe(false);
      expect(unit.getPricePerNight()).toBe(250);
      expect(unit.getAmenities()).toEqual(['wifi', 'parking', 'kitchen']);
    });

    it('should trim name and description', () => {
      const input = createValidInput();
      input.basicInfo.name = '  Deluxe Suite  ';
      input.basicInfo.description = '  Ocean view  ';

      const unit = Unit.create(input);

      expect(unit.getName()).toBe('Deluxe Suite');
      expect(unit.getDescription()).toBe('Ocean view');
    });

    it('should set createdAt and updatedAt timestamps', () => {
      const input = createValidInput();
      const beforeCreate = new Date();

      const unit = Unit.create(input);

      const afterCreate = new Date();
      expect(unit.getCreatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(unit.getCreatedAt().getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(unit.getUpdatedAt().getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });

    describe('validation', () => {
      it('should throw error when name is empty', () => {
        const input = createValidInput();
        input.basicInfo.name = '';

        expect(() => Unit.create(input)).toThrow('Unit name cannot be empty');
      });

      it('should throw error when name is only whitespace', () => {
        const input = createValidInput();
        input.basicInfo.name = '   ';

        expect(() => Unit.create(input)).toThrow('Unit name cannot be empty');
      });

      it('should throw error when inventoryCount is less than 1', () => {
        const input = createValidInput();
        input.inventoryConfig.inventoryCount = 0;

        expect(() => Unit.create(input)).toThrow(
          'Inventory count must be at least 1',
        );
      });

      it('should throw error when inventoryCount is negative', () => {
        const input = createValidInput();
        input.inventoryConfig.inventoryCount = -5;

        expect(() => Unit.create(input)).toThrow(
          'Inventory count must be at least 1',
        );
      });

      it('should throw error when maxGuests is less than 1', () => {
        const input = createValidInput();
        input.capacityConfig.maxGuests = 0;

        expect(() => Unit.create(input)).toThrow(
          'Max guests must be at least 1',
        );
      });

      it('should throw error when standardGuests is less than 1', () => {
        const input = createValidInput();
        input.capacityConfig.standardGuests = 0;

        expect(() => Unit.create(input)).toThrow(
          'Standard guests must be between 1 and max guests',
        );
      });

      it('should throw error when standardGuests is greater than maxGuests', () => {
        const input = createValidInput();
        input.capacityConfig.maxGuests = 2;
        input.capacityConfig.standardGuests = 5;

        expect(() => Unit.create(input)).toThrow(
          'Standard guests must be between 1 and max guests',
        );
      });

      it('should throw error when pricePerNight is negative', () => {
        const input = createValidInput();
        input.pricingConfig.pricePerNight = -100;

        expect(() => Unit.create(input)).toThrow(
          'Price per night cannot be negative',
        );
      });
    });
  });

  // ─── Tests for Unit.reconstitute ────────────────────────────────────────

  describe('Unit.reconstitute', () => {
    it('should reconstitute a unit with valid input', () => {
      const createdAt = new Date('2030-01-01');
      const updatedAt = new Date('2030-02-01');
      const input = createValidInput();

      const unit = Unit.reconstitute({
        ...input,
        id: UnitId.create(UNIT_ID),
        timestamps: {
          createdAt,
          updatedAt,
        },
      });

      expect(unit).toBeDefined();
      expect(unit.getId()?.toString()).toBe(UNIT_ID);
      expect(unit.getTenantId().toString()).toBe(TENANT_ID);
      expect(unit.getPropertyId().toString()).toBe(PROPERTY_ID);
      expect(unit.getName()).toBe('Deluxe Suite');
      expect(unit.getCreatedAt()).toEqual(createdAt);
      expect(unit.getUpdatedAt()).toEqual(updatedAt);
    });

    it('should preserve original name and description without trimming', () => {
      const input = createValidInput();

      const unit = Unit.reconstitute({
        ...input,
        id: UnitId.create(UNIT_ID),
        basicInfo: {
          name: '  Deluxe Suite  ',
          description: '  Ocean view  ',
        },
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      expect(unit.getName()).toBe('  Deluxe Suite  ');
      expect(unit.getDescription()).toBe('  Ocean view  ');
    });
  });

  // ─── Tests for getter methods ────────────────────────────────────────────

  describe('Getter methods', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should return null for id on newly created unit', () => {
      expect(unit.getId()).toBeNull();
    });

    it('should return all values correctly', () => {
      expect(unit.getTenantId()).toBeDefined();
      expect(unit.getPropertyId()).toBeDefined();
      expect(unit.getName()).toBe('Deluxe Suite');
      expect(unit.getDescription()).toBe('Ocean view suite with modern amenities');
      expect(unit.getInventoryCount()).toBe(3);
      expect(unit.getMaxGuests()).toBe(4);
      expect(unit.getStandardGuests()).toBe(2);
      expect(unit.getBedrooms()).toHaveLength(1);
      expect(unit.getBathroomsCount()).toBe(2);
      expect(unit.getIsShared()).toBe(false);
      expect(unit.getAmenities()).toHaveLength(3);
      expect(unit.getPricePerNight()).toBe(250);
      expect(unit.getExternalIds()).toBeDefined();
      expect(unit.getCreatedAt()).toBeDefined();
      expect(unit.getUpdatedAt()).toBeDefined();
    });
  });

  // ─── Tests for updateDetails method ──────────────────────────────────────

  describe('updateDetails', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update name and description', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateDetails('New Suite', 'New description');

      expect(unit.getName()).toBe('New Suite');
      expect(unit.getDescription()).toBe('New description');
      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });

    it('should trim name when updating', () => {
      unit.updateDetails('  Trimmed Suite  ', 'Description');

      expect(unit.getName()).toBe('Trimmed Suite');
    });

    it('should not update name if it is empty', () => {
      const originalName = unit.getName();

      unit.updateDetails('', 'Description');

      expect(unit.getName()).toBe(originalName);
    });

    it('should trim description when updating', () => {
      unit.updateDetails('Suite', '  Trimmed description  ');

      expect(unit.getDescription()).toBe('Trimmed description');
    });

    it('should update only description if name is empty', () => {
      unit.updateDetails('', 'New description only');

      expect(unit.getName()).toBe('Deluxe Suite');
      expect(unit.getDescription()).toBe('New description only');
    });
  });

  // ─── Tests for updateCapacity method ─────────────────────────────────────

  describe('updateCapacity', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update capacity values', () => {
      unit.updateCapacity(5, 3);

      expect(unit.getMaxGuests()).toBe(5);
      expect(unit.getStandardGuests()).toBe(3);
    });

    it('should throw error when maxGuests is less than 1', () => {
      expect(() => unit.updateCapacity(0, 2)).toThrow(
        'Max guests must be at least 1',
      );
    });

    it('should throw error when standardGuests is less than 1', () => {
      expect(() => unit.updateCapacity(4, 0)).toThrow(
        'Standard guests must be between 1 and max guests',
      );
    });

    it('should throw error when standardGuests exceeds maxGuests', () => {
      expect(() => unit.updateCapacity(2, 5)).toThrow(
        'Standard guests must be between 1 and max guests',
      );
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateCapacity(5, 3);

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Tests for updateInventoryCount method ──────────────────────────────

  describe('updateInventoryCount', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update inventory count', () => {
      unit.updateInventoryCount(10);

      expect(unit.getInventoryCount()).toBe(10);
    });

    it('should throw error when inventoryCount is less than 1', () => {
      expect(() => unit.updateInventoryCount(0)).toThrow(
        'Inventory count must be at least 1',
      );
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateInventoryCount(5);

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Tests for updateBedrooms method ─────────────────────────────────────

  describe('updateBedrooms', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update bedrooms', () => {
      const newBedrooms: Bedroom[] = [
        {
          roomName: 'Suite 1',
          beds: [{ type: BedTypeEnum.QUEEN, count: 1 }],
        },
        {
          roomName: 'Suite 2',
          beds: [{ type: BedTypeEnum.DOUBLE, count: 2 }],
        },
      ];

      unit.updateBedrooms(newBedrooms);

      expect(unit.getBedrooms()).toHaveLength(2);
      expect(unit.getBedrooms()).toEqual(newBedrooms);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateBedrooms([]);

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Tests for updateBathroomsCount method ──────────────────────────────

  describe('updateBathroomsCount', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update bathrooms count', () => {
      unit.updateBathroomsCount(3);

      expect(unit.getBathroomsCount()).toBe(3);
    });

    it('should throw error when bathroomsCount is negative', () => {
      expect(() => unit.updateBathroomsCount(-1)).toThrow(
        'Bathrooms count cannot be negative',
      );
    });

    it('should allow zero bathrooms', () => {
      unit.updateBathroomsCount(0);

      expect(unit.getBathroomsCount()).toBe(0);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateBathroomsCount(1);

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Tests for updateShared method ──────────────────────────────────────

  describe('updateShared', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update shared status to true', () => {
      unit.updateShared(true);

      expect(unit.getIsShared()).toBe(true);
    });

    it('should update shared status to false', () => {
      unit.updateShared(false);

      expect(unit.getIsShared()).toBe(false);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateShared(true);

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Tests for updatePrice method ──────────────────────────────────────

  describe('updatePrice', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update price per night', () => {
      unit.updatePrice(350);

      expect(unit.getPricePerNight()).toBe(350);
    });

    it('should throw error when price is negative', () => {
      expect(() => unit.updatePrice(-50)).toThrow(
        'Price per night cannot be negative',
      );
    });

    it('should allow zero price', () => {
      unit.updatePrice(0);

      expect(unit.getPricePerNight()).toBe(0);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updatePrice(300);

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Tests for updateAmenities method ───────────────────────────────────

  describe('updateAmenities', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update amenities', () => {
      const newAmenities = ['pool', 'gym', 'spa'];

      unit.updateAmenities(newAmenities);

      expect(unit.getAmenities()).toEqual(newAmenities);
    });

    it('should clear amenities when passed empty array', () => {
      unit.updateAmenities([]);

      expect(unit.getAmenities()).toEqual([]);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateAmenities(['balcony']);

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Tests for updateExternalIds method ────────────────────────────────

  describe('updateExternalIds', () => {
    let unit: Unit;

    beforeEach(() => {
      const input = createValidInput();
      unit = Unit.create(input);
    });

    it('should update external IDs', () => {
      const newExternalIds = ExternalIds.create(
        'new-airbnb',
        'new-booking',
        'new-vrbo',
      );

      unit.updateExternalIds(newExternalIds);

      expect(unit.getExternalIds()).toEqual(newExternalIds);
    });

    it('should update updatedAt timestamp', () => {
      const originalUpdatedAt = unit.getUpdatedAt();

      unit.updateExternalIds(ExternalIds.create());

      expect(unit.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      );
    });
  });

  // ─── Integration tests ──────────────────────────────────────────────────

  describe('Integration tests', () => {
    it('should handle multiple sequential updates', () => {
      const input = createValidInput();
      const unit = Unit.create(input);

      unit.updateDetails('New Name', 'New Description');
      unit.updateCapacity(6, 4);
      unit.updatePrice(400);
      unit.updateAmenities(['wifi', 'pool']);

      expect(unit.getName()).toBe('New Name');
      expect(unit.getDescription()).toBe('New Description');
      expect(unit.getMaxGuests()).toBe(6);
      expect(unit.getStandardGuests()).toBe(4);
      expect(unit.getPricePerNight()).toBe(400);
      expect(unit.getAmenities()).toEqual(['wifi', 'pool']);
    });

    it('should maintain immutable IDs through updates', () => {
      const input = createValidInput();
      const unit = Unit.create(input);
      const originalTenantId = unit.getTenantId();
      const originalPropertyId = unit.getPropertyId();

      unit.updateDetails('New Name', 'New Description');
      unit.updatePrice(500);

      expect(unit.getTenantId()).toEqual(originalTenantId);
      expect(unit.getPropertyId()).toEqual(originalPropertyId);
    });
  });
});
