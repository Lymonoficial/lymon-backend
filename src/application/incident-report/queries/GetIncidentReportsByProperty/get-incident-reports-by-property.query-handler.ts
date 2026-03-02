import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetIncidentReportsByPropertyQuery } from './get-incident-reports-by-property.query';
import { GetIncidentReportsByPropertyResult } from './get-incident-reports-by-property.result';
import {
  INCIDENT_REPORT_REPOSITORY,
  type IncidentReportRepository,
} from '@/domain/incident-report/repositories/incident-report.repository';
import { IncidentReportDto } from '@/application/incident-report/queries/GetIncidentReportById/get-incident-report-by-id.result';

@QueryHandler(GetIncidentReportsByPropertyQuery)
export class GetIncidentReportsByPropertyQueryHandler implements IQueryHandler<
  GetIncidentReportsByPropertyQuery,
  GetIncidentReportsByPropertyResult
> {
  constructor(
    @Inject(INCIDENT_REPORT_REPOSITORY)
    private readonly reportRepository: IncidentReportRepository,
  ) {}

  async execute(
    query: GetIncidentReportsByPropertyQuery,
  ): Promise<GetIncidentReportsByPropertyResult> {
    const reports = await this.reportRepository.findByPropertyId(
      query.tenantId,
      query.propertyId,
    );

    const total = reports.length;
    const start = (query.page - 1) * query.limit;
    const paginated = reports.slice(start, start + query.limit);

    const dtos = paginated.map(
      (r) =>
        new IncidentReportDto(
          r.getId()!.toString(),
          r.getTenantId(),
          r.getPropertyId(),
          r.getCreatedBy(),
          r.getTitle(),
          r.getDescription(),
          r.getAttachmentUrls(),
          r.getCreatedAt(),
          r.getUpdatedAt(),
        ),
    );

    return new GetIncidentReportsByPropertyResult(
      dtos,
      total,
      query.page,
      query.limit,
    );
  }
}
