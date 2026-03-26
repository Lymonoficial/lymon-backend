import { IncidentReport } from '@/domain/incident-report/entities/incident-report.entity';
import { IncidentReportId } from '@/domain/incident-report/value-objects/incident-report-id.vo';
import { MongoIncidentReportRepository } from '@/infrastructure/persistence/repositories/mongo-incident-report.repository';

describe('MongoIncidentReportRepository', () => {
  const tenantId = '65f1a1a2b3c4d5e6f7a8b9c2';
  const propertyId = '65f1a1a2b3c4d5e6f7a8b9c3';
  const createdBy = '65f1a1a2b3c4d5e6f7a8b9c4';

  const makeExistingReport = () =>
    IncidentReport.reconstitute({
      id: IncidentReportId.create('65f1a1a2b3c4d5e6f7a8b9d1'),
      tenantId,
      propertyId,
      createdBy,
      title: 'Broken AC',
      description: 'The AC is leaking water',
      attachmentUrls: ['https://img.test/1.png'],
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-02T00:00:00Z'),
    });

  it('updates an existing report with findByIdAndUpdate', async () => {
    const reportModel: any = {
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    };

    const repository = new MongoIncidentReportRepository(reportModel);
    const report = makeExistingReport();

    const result = await repository.save(report);

    expect(reportModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(result).toBe('65f1a1a2b3c4d5e6f7a8b9d1');
  });

  it('creates a new report and returns generated id', async () => {
    const save = jest.fn().mockResolvedValue({
      _id: { toString: () => '65f1a1a2b3c4d5e6f7a8b9e1' },
    });

    const reportModel: any = jest.fn().mockImplementation(() => ({ save }));
    reportModel.findByIdAndUpdate = jest.fn();

    const repository = new MongoIncidentReportRepository(reportModel);
    const report = IncidentReport.create(
      tenantId,
      propertyId,
      createdBy,
      'Door lock issue',
      'Main door lock is stuck',
      [],
    );

    const result = await repository.save(report);

    expect(save).toHaveBeenCalledTimes(1);
    expect(result).toBe('65f1a1a2b3c4d5e6f7a8b9e1');
  });

  it('finds report by id and maps to domain', async () => {
    const doc: any = {
      _id: { toString: () => '65f1a1a2b3c4d5e6f7a8b9d1' },
      tenantId: { toString: () => tenantId },
      propertyId: { toString: () => propertyId },
      createdBy: { toString: () => createdBy },
      title: 'Broken AC',
      description: 'The AC is leaking water',
      attachmentUrls: ['https://img.test/1.png'],
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-02T00:00:00Z'),
    };

    const reportModel: any = {
      findOne: jest.fn().mockResolvedValue(doc),
    };

    const repository = new MongoIncidentReportRepository(reportModel);
    const report = await repository.findById(
      IncidentReportId.create('65f1a1a2b3c4d5e6f7a8b9d1'),
    );

    expect(report).not.toBeNull();
    expect(report?.getTitle()).toBe('Broken AC');
    expect(report?.getTenantId()).toBe(tenantId);
  });

  it('soft deletes report by id', async () => {
    const reportModel: any = {
      findByIdAndUpdate: jest.fn().mockResolvedValue({}),
    };

    const repository = new MongoIncidentReportRepository(reportModel);

    await repository.delete(
      IncidentReportId.create('65f1a1a2b3c4d5e6f7a8b9d1'),
    );

    expect(reportModel.findByIdAndUpdate).toHaveBeenCalledTimes(1);
    expect(reportModel.findByIdAndUpdate).toHaveBeenCalledWith(
      '65f1a1a2b3c4d5e6f7a8b9d1',
      expect.objectContaining({ deletedAt: expect.any(Date) }),
    );
  });
});
