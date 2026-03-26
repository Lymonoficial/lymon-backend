import { IncidentReport } from '@/domain/incident-report/entities/incident-report.entity';
import { IncidentReportId } from '@/domain/incident-report/value-objects/incident-report-id.vo';

export const INCIDENT_REPORT_FIXTURE_DEFAULTS = {
  id: 'report-001',
  tenantId: 'tenant-123',
  propertyId: 'prop-001',
  createdBy: 'user-456',
  title: 'Broken window',
  description: 'The window in room 3 is cracked',
  attachmentUrls: [] as string[],
};

export function makeIncidentReport(
  overrides?: Partial<typeof INCIDENT_REPORT_FIXTURE_DEFAULTS>,
): IncidentReport {
  const merged = { ...INCIDENT_REPORT_FIXTURE_DEFAULTS, ...overrides };

  return IncidentReport.reconstitute({
    id: IncidentReportId.create(merged.id),
    tenantId: merged.tenantId,
    propertyId: merged.propertyId,
    createdBy: merged.createdBy,
    title: merged.title,
    description: merged.description,
    attachmentUrls: merged.attachmentUrls,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
