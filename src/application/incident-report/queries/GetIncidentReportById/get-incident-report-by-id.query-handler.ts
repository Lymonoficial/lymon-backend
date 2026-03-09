import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetIncidentReportByIdQuery } from './get-incident-report-by-id.query';
import {
  GetIncidentReportByIdResult,
  IncidentReportDto,
} from './get-incident-report-by-id.result';
import {
  INCIDENT_REPORT_REPOSITORY,
  type IncidentReportRepository,
} from '@/domain/incident-report/repositories/incident-report.repository';
import { IncidentReportId } from '@/domain/incident-report/value-objects/incident-report-id.vo';

@QueryHandler(GetIncidentReportByIdQuery)
export class GetIncidentReportByIdQueryHandler implements IQueryHandler<
  GetIncidentReportByIdQuery,
  GetIncidentReportByIdResult
> {
  constructor(
    @Inject(INCIDENT_REPORT_REPOSITORY)
    private readonly reportRepository: IncidentReportRepository,
  ) {}

  async execute(
    query: GetIncidentReportByIdQuery,
  ): Promise<GetIncidentReportByIdResult> {
    const report = await this.reportRepository.findById(
      IncidentReportId.create(query.reportId),
    );

    if (!report) {
      throw new NotFoundException(
        `IncidentReport with id "${query.reportId}" not found`,
      );
    }

    if (report.getTenantId() !== query.tenantId) {
      throw new NotFoundException(
        `IncidentReport with id "${query.reportId}" not found`,
      );
    }

    return new GetIncidentReportByIdResult(
      new IncidentReportDto(
        report.getId()!.toString(),
        report.getTenantId(),
        report.getPropertyId(),
        report.getCreatedBy(),
        report.getTitle(),
        report.getDescription(),
        report.getAttachmentUrls(),
        report.getCreatedAt(),
        report.getUpdatedAt(),
      ),
    );
  }
}
