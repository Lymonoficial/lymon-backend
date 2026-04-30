import { GetPropertiesByTenantQueryHandler } from '@/application/property/queries/GetPropertiesByTenant/get-properties-by-tenant.query-handler';
import { GetPropertiesByTenantQuery } from '@/application/property/queries/GetPropertiesByTenant/get-properties-by-tenant.query';
import { GetPropertiesByTenantResult } from '@/application/property/queries/GetPropertiesByTenant/get-properties-by-tenant.result';
import { PropertyRepository } from '@/domain/property/repositories/property.repository';
import { createPropertyRepositoryMock } from '@test/shared/mocks/repositories/property-repository.mock';
import { makeProperty } from '@test/shared/fixtures/property.fixture';

describe('GetPropertiesByTenantQueryHandler', () => {
  let handler: GetPropertiesByTenantQueryHandler;
  let propertyRepository: jest.Mocked<PropertyRepository>;

  beforeEach(() => {
    propertyRepository = createPropertyRepositoryMock();
    handler = new GetPropertiesByTenantQueryHandler(propertyRepository);
  });

  describe('when the tenant has properties', () => {
    it('returns paginated properties', async () => {
      const props = [
        makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9c1' }),
        makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9cd' }),
        makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9ce' }),
      ];
      propertyRepository.findByTenantId.mockResolvedValue(props);

      const result = await handler.execute(
        new GetPropertiesByTenantQuery('65f1a1a2b3c4d5e6f7a8b9c0', 1, 2),
      );

      expect(result).toBeInstanceOf(GetPropertiesByTenantResult);
      expect(result.properties).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('returns second page correctly', async () => {
      const props = [
        makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9c1' }),
        makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9cd' }),
        makeProperty({ id: '65f1a1a2b3c4d5e6f7a8b9ce' }),
      ];
      propertyRepository.findByTenantId.mockResolvedValue(props);

      const result = await handler.execute(
        new GetPropertiesByTenantQuery('65f1a1a2b3c4d5e6f7a8b9c0', 2, 2),
      );

      expect(result.properties).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.page).toBe(2);
    });
  });

  describe('when the tenant has no properties', () => {
    it('returns empty list with total 0', async () => {
      propertyRepository.findByTenantId.mockResolvedValue([]);

      const result = await handler.execute(
        new GetPropertiesByTenantQuery('65f1a1a2b3c4d5e6f7a8b9c0'),
      );

      expect(result).toBeInstanceOf(GetPropertiesByTenantResult);
      expect(result.properties).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
