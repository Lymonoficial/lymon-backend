import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EmailTemplate,
  EmailTemplateType,
} from '@/domain/emails/entities/email-template.entity';
import { EmailTemplateRepository } from '@/domain/emails/repositories/email-template.repository';
import { EmailTemplateDocument } from '../schemas/email-template.schema';

@Injectable()
export class MongooseEmailTemplateRepository
  implements EmailTemplateRepository
{
  constructor(
    @InjectModel('EmailTemplate')
    private readonly emailTemplateModel: Model<EmailTemplateDocument>,
  ) {}

  async findById(id: string): Promise<EmailTemplate | null> {
    const doc = await this.emailTemplateModel.findById(id).exec();
    if (!doc) return null;

    return new EmailTemplate(
      doc._id.toString(),
      doc.hotelId,
      doc.type as EmailTemplateType,
      doc.subject,
      doc.body,
      doc.isActive,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findByHotelIdAndType(
    hotelId: string,
    type: EmailTemplateType,
  ): Promise<EmailTemplate | null> {
    const doc = await this.emailTemplateModel
      .findOne({ hotelId, type, isActive: true })
      .exec();
    if (!doc) return null;

    return new EmailTemplate(
      doc._id.toString(),
      doc.hotelId,
      doc.type as EmailTemplateType,
      doc.subject,
      doc.body,
      doc.isActive,
      doc.createdAt,
      doc.updatedAt,
    );
  }

  async findAllByHotelId(hotelId: string): Promise<EmailTemplate[]> {
    const docs = await this.emailTemplateModel.find({ hotelId }).exec();

    return docs.map(
      (doc) =>
        new EmailTemplate(
          doc._id.toString(),
          doc.hotelId,
          doc.type as EmailTemplateType,
          doc.subject,
          doc.body,
          doc.isActive,
          doc.createdAt,
          doc.updatedAt,
        ),
    );
  }

  async save(template: any): Promise<EmailTemplate> {
    const created = new this.emailTemplateModel(template);
    const saved = await created.save();

    return new EmailTemplate(
      saved._id.toString(),
      saved.hotelId,
      saved.type as EmailTemplateType,
      saved.subject,
      saved.body,
      saved.isActive,
      saved.createdAt,
      saved.updatedAt,
    );
  }

  async update(id: string, template: Partial<EmailTemplate>): Promise<void> {
    await this.emailTemplateModel.findByIdAndUpdate(id, template).exec();
  }

  async delete(id: string): Promise<void> {
    await this.emailTemplateModel.findByIdAndDelete(id).exec();
  }
}
