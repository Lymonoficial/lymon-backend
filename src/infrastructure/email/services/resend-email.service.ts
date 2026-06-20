import {
  IEmailService,
  SendEmailParams,
  SendLowStockAlertEmailParams,
} from '@/application/shared/services/email.service';
import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';
import { EmailTemplateService } from '@/infrastructure/common/email-template.service';

@Injectable()
export class ResendEmailService implements IEmailService {
  private readonly logger = new Logger(ResendEmailService.name);
  private readonly client: Resend;

  private get defaultSender() {
    return {
      email:
        this.configService.get<string>('SENDER_EMAIL') ||
        'lymonoficial@lymon.com.co',
      name: 'Lymon',
    };
  }

  constructor(
    private readonly configService: ConfigService,
    private readonly emailTemplateService: EmailTemplateService,
  ) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') ?? '';
    if (!apiKey) throw new Error('RESEND_API_KEY is not configured');
    this.client = new Resend(apiKey);
  }

  async sendEmail(params: SendEmailParams): Promise<{ messageId: string }> {
    try {
      const sender = params.sender || this.defaultSender;
      const from = `${sender.name} <${sender.email}>`;

      const payload: Parameters<typeof this.client.emails.send>[0] = {
        from,
        to: params.to.map((r) => r.email),
        subject: params.subject,
        html: params.htmlContent,
      };

      if (params.cc && params.cc.length > 0) {
        payload.cc = params.cc.map((r) => r.email);
      }

      if (params.bcc && params.bcc.length > 0) {
        payload.bcc = params.bcc.map((r) => r.email);
      }

      if (params.attachments && params.attachments.length > 0) {
        payload.attachments = params.attachments.map((att) => ({
          filename: att.name,
          path: att.url,
        }));
      }

      const { data, error } = await this.client.emails.send(payload);

      if (error) {
        throw new Error(error.message);
      }

      const messageId = data?.id ?? 'SENT';
      this.logger.log(
        `[RESEND] Email enviado con éxito desde ${sender.email} a ${params.to[0].email} (ID: ${messageId})`,
      );
      return { messageId };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[RESEND_ERROR] Fallo al enviar email desde ${params.sender?.email || this.defaultSender.email}: ${message}`,
      );
      throw new Error(`Failed to send email: ${message}`);
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
