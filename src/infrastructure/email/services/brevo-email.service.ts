import {
  IEmailService,
  SendEmailParams,
  SendLowStockAlertEmailParams,
} from '@/application/shared/services/email.service';
import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';

@Injectable()
export class BrevoEmailService implements IEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);
  private readonly client: BrevoClient;
  private readonly defaultSender = {
    email: 'no-reply@lymon.com.co',
    name: 'Lymon',
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    if (!apiKey) throw new Error('BREVO_API_KEY is not configured');
    this.client = new BrevoClient({ apiKey });
  }
  async sendEmail(params: SendEmailParams): Promise<void> {
    try {
      await this.client.transactionalEmails.sendTransacEmail({
        htmlContent: params.htmlContent,
        sender: params.sender || this.defaultSender,
        subject: params.subject,
        to: params.to,
        cc: params.cc,
        bcc: params.bcc,
        ...(params.attachments &&
          params.attachments.length > 0 && { attachment: params.attachments }),
      });
      this.logger.log(`Email sent successfully to ${params.to[0].email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new Error('Failed to send email');
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const verificationUrl = `${appUrl}/auth/verify-email?token=${token}`;

    const htmlContent =
      this.emailTemplateService.renderVerifyEmailTemplate(verificationUrl);

    await this.sendEmail({
      to: [{ email, name: email }],
      subject: 'Verifica tu correo electrónico - Lymon',
      htmlContent,
    });
  }

  async sendRecoveryEmail(email: string, plainToken: string): Promise<void> {
    const appUrl = this.configService.get<string>('APP_URL');
    const recoveryUrl = `${appUrl}/recover-password/confirm?token=${plainToken}`;

    const htmlContent =
      this.emailTemplateService.renderRecoverPasswordTemplate(recoveryUrl);

    await this.sendEmail({
      to: [{ email, name: email }],
      subject: 'Recuperación de contraseña - Lymon',
      htmlContent,
    });
  }

  async sendLowStockAlertEmail(
    params: SendLowStockAlertEmailParams,
  ): Promise<void> {
    const difference = params.minStock - params.currentStock;
    const htmlContent = this.emailTemplateService.renderLowStockAlertTemplate({
      ownerName: params.ownerName,
      tenantName: params.tenantName,
      propertyName: params.propertyName,
      itemName: params.itemName,
      itemSku: params.itemSku,
      currentStock: params.currentStock,
      minStock: params.minStock,
      difference,
    });

    await this.sendEmail({
      to: [{ email: params.ownerEmail, name: params.ownerName }],
      subject: `Alerta: ${params.itemName} está por debajo de stock mínimo`,
      htmlContent,
    });
  }
}
