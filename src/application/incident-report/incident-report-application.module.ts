import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { CreateIncidentReportHandler } from '@/application/incident-report/commands/create-incident-report.handler';
import { UpdateIncidentReportHandler } from '@/application/incident-report/commands/update-incident-report.handler';
import { DeleteIncidentReportHandler } from '@/application/incident-report/commands/delete-incident-report.handler';
import { GetIncidentReportByIdQueryHandler } from '@/application/incident-report/queries/GetIncidentReportById/get-incident-report-by-id.query-handler';
import { GetIncidentReportsByPropertyQueryHandler } from '@/application/incident-report/queries/GetIncidentReportsByProperty/get-incident-reports-by-property.query-handler';
import { GetIncidentReportsByCreatorQueryHandler } from '@/application/incident-report/queries/GetIncidentReportsByCreator/get-incident-reports-by-creator.query-handler';

const CommandHandlers = [
  CreateIncidentReportHandler,
  UpdateIncidentReportHandler,
  DeleteIncidentReportHandler,
];
const QueryHandlers = [
  GetIncidentReportByIdQueryHandler,
  GetIncidentReportsByPropertyQueryHandler,
  GetIncidentReportsByCreatorQueryHandler,
];

@Module({
  imports: [CqrsModule, PersistenceModule],
  providers: [...CommandHandlers, ...QueryHandlers],
  exports: [...CommandHandlers, ...QueryHandlers],
})
export class IncidentReportApplicationModule {}
