import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetIncidentReportsByCreatorQuery } from './get-incident-reports-by-creator.query';
import { GetIncidentReportsByCreatorResult } from './get-incident-reports-by-creator.result';
import {
  INCIDENT_REPORT_REPOSITORY,
  type IncidentReportRepository,
} from '@/domain/incident-report/repositories/incident-report.repository';
import { IncidentReportDto } from '@/application/incident-report/queries/GetIncidentReportById/get-incident-report-by-id.result';

@QueryHandler(GetIncidentReportsByCreatorQuery)
export class GetIncidentReportsByCreatorQueryHandler implements IQueryHandler<
  GetIncidentReportsByCreatorQuery,
  GetIncidentReportsByCreatorResult
> {
  constructor(
    @Inject(INCIDENT_REPORT_REPOSITORY)
    private readonly reportRepository: IncidentReportRepository,
  ) {}

  async execute(
    query: GetIncidentReportsByCreatorQuery,
  ): Promise<GetIncidentReportsByCreatorResult> {
    const reports = await this.reportRepository.findByCreatedBy(
      query.tenantId,
      query.createdBy,
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

    return new GetIncidentReportsByCreatorResult(
      dtos,
      total,
      query.page,
      query.limit,
    );
  }
}
