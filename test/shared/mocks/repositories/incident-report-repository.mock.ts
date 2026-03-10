import { IncidentReportRepository } from '@/domain/incident-report/repositories/incident-report.repository';

export function createIncidentReportRepositoryMock(): jest.Mocked<IncidentReportRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByPropertyId: jest.fn(),
    findByCreatedBy: jest.fn(),
    delete: jest.fn(),
  };
}
