import { IncidentReport } from '@/domain/incident-report/entities/incident-report.entity';
import { IncidentReportId } from '@/domain/incident-report/value-objects/incident-report-id.vo';

export const INCIDENT_REPORT_REPOSITORY = 'INCIDENT_REPORT_REPOSITORY';

export interface IncidentReportRepository {
  save(report: IncidentReport): Promise<string>;
  findById(id: IncidentReportId): Promise<IncidentReport | null>;
  findByPropertyId(
    tenantId: string,
    propertyId: string,
  ): Promise<IncidentReport[]>;
  findByCreatedBy(
    tenantId: string,
    createdBy: string,
  ): Promise<IncidentReport[]>;
  delete(id: IncidentReportId): Promise<void>;
}
