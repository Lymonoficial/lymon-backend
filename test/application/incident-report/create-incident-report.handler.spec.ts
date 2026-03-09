import { CreateIncidentReportHandler } from '@/application/incident-report/commands/create-incident-report.handler';
import { CreateIncidentReportCommand } from '@/application/incident-report/commands/create-incident-report.command';
import { CreateIncidentReportResult } from '@/application/incident-report/commands/create-incident-report.result';
import { IncidentReportRepository } from '@/domain/incident-report/repositories/incident-report.repository';
import { createIncidentReportRepositoryMock } from '@test/shared/mocks/repositories/incident-report-repository.mock';
import { createEventEmitterMock } from '@test/shared/mocks/services/event-emitter.mock';

const REPORT_ID = 'report-001';

describe('CreateIncidentReportHandler', () => {
  let handler: CreateIncidentReportHandler;
  let reportRepository: jest.Mocked<IncidentReportRepository>;
  let eventEmitter: ReturnType<typeof createEventEmitterMock>;

  beforeEach(() => {
    reportRepository = createIncidentReportRepositoryMock();
    eventEmitter = createEventEmitterMock();

    handler = new CreateIncidentReportHandler(
      reportRepository,
      eventEmitter as any,
    );
  });

  describe('when creating a valid incident report', () => {
    it('saves the report and returns the reportId', async () => {
      reportRepository.save.mockResolvedValue(REPORT_ID);

      const result = await handler.execute(
        new CreateIncidentReportCommand(
          'tenant-123',
          'prop-001',
          'Broken window',
          'The window in room 3 is cracked',
          ['https://img.example.com/broken.jpg'],
          'user-456',
          'owner@example.com',
        ),
      );

      expect(result).toBeInstanceOf(CreateIncidentReportResult);
      expect(result.reportId).toBe(REPORT_ID);
      expect(reportRepository.save).toHaveBeenCalledTimes(1);
    });

    it('emits INCIDENT_REPORT_CREATED audit event', async () => {
      reportRepository.save.mockResolvedValue(REPORT_ID);

      await handler.execute(
        new CreateIncidentReportCommand(
          'tenant-123',
          'prop-001',
          'Broken window',
          'The window in room 3 is cracked',
          [],
          'user-456',
          'owner@example.com',
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ entityType: 'INCIDENT_REPORT' }),
      );
    });
  });
});
