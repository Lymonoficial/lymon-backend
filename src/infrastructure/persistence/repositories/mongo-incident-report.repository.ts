import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IncidentReportRepository } from '@/domain/incident-report/repositories/incident-report.repository';
import { IncidentReport } from '@/domain/incident-report/entities/incident-report.entity';
import { IncidentReportId } from '@/domain/incident-report/value-objects/incident-report-id.vo';
import { IncidentReportDocument } from '@/infrastructure/persistence/schemas/incident-report.schema';

@Injectable()
export class MongoIncidentReportRepository implements IncidentReportRepository {
  constructor(
    @InjectModel(IncidentReportDocument.name)
    private readonly reportModel: Model<IncidentReportDocument>,
  ) {}

  async save(report: IncidentReport): Promise<string> {
    const id = report.getId()?.toString();

    const document = {
      tenantId: new Types.ObjectId(report.getTenantId()),
      propertyId: new Types.ObjectId(report.getPropertyId()),
      createdBy: new Types.ObjectId(report.getCreatedBy()),
      title: report.getTitle(),
      description: report.getDescription(),
      attachmentUrls: report.getAttachmentUrls(),
      updatedAt: report.getUpdatedAt(),
    };

    if (id) {
      await this.reportModel.findByIdAndUpdate(id, document, { new: true });
      return id;
    }

    const newDoc = new this.reportModel({
      ...document,
      createdAt: report.getCreatedAt(),
    });
    const saved = await newDoc.save();
    return saved._id.toString();
  }

  async findById(id: IncidentReportId): Promise<IncidentReport | null> {
    const doc = await this.reportModel.findOne({
      _id: id.toString(),
      deletedAt: null,
    });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByPropertyId(
    tenantId: string,
    propertyId: string,
  ): Promise<IncidentReport[]> {
    const docs = await this.reportModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        propertyId: new Types.ObjectId(propertyId),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async findByCreatedBy(
    tenantId: string,
    createdBy: string,
  ): Promise<IncidentReport[]> {
    const docs = await this.reportModel
      .find({
        tenantId: new Types.ObjectId(tenantId),
        createdBy: new Types.ObjectId(createdBy),
        deletedAt: null,
      })
      .sort({ createdAt: -1 });
    return docs.map((doc) => this.toDomain(doc));
  }

  async delete(id: IncidentReportId): Promise<void> {
    await this.reportModel.findByIdAndUpdate(id.toString(), {
      deletedAt: new Date(),
    });
  }

  private toDomain(doc: IncidentReportDocument): IncidentReport {
    return IncidentReport.reconstitute({
      id: IncidentReportId.create(doc._id.toString()),
      tenantId: doc.tenantId.toString(),
      propertyId: doc.propertyId.toString(),
      createdBy: doc.createdBy.toString(),
      title: doc.title,
      description: doc.description,
      attachmentUrls: doc.attachmentUrls ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
