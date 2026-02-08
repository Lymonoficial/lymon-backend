import {
  EmailTemplate,
  EmailTemplateType,
} from '../entities/email-template.entity';

export interface EmailTemplateRepository {
  findById(id: string): Promise<EmailTemplate | null>;
  findByHotelIdAndType(
    hotelId: string,
    type: EmailTemplateType,
  ): Promise<EmailTemplate | null>;
  findAllByHotelId(hotelId: string): Promise<EmailTemplate[]>;
  save(template: EmailTemplate): Promise<EmailTemplate>;
  update(id: string, template: Partial<EmailTemplate>): Promise<void>;
  delete(id: string): Promise<void>;
}
