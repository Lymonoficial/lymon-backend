import {
  IEmailService,
  SendEmailParams,
} from '@/application/shared/services/email.service';
import { Injectable, Logger } from '@nestjs/common';
import { BrevoClient } from '@getbrevo/brevo';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BrevoEmailService implements IEmailService {
  private readonly logger = new Logger(BrevoEmailService.name);
  private readonly client: BrevoClient;
  private readonly defaultSender = {
    email: 'no-reply@lymon.com.co',
    name: 'Lymon',
  };

  constructor(private readonly configService: ConfigService) {
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background-color: #4CAF50; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Lymon!</h1>
            </div>
            <div class="content">
              <h2>Verifica tu correo electrónico</h2>
              <p>Gracias por registrarte en Lymon, tu plataforma de gestión de alojamientos turísticos.</p>
              <p>Para completar tu registro y acceder a todas las funcionalidades, por favor verifica tu correo electrónico haciendo clic en el siguiente botón:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar mi correo</a>
              </div>
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p><strong>Este enlace expirará en 24 horas.</strong></p>
            </div>
            <div class="footer">
              <p>Si no creaste una cuenta en Lymon, puedes ignorar este correo.</p>
              <p>&copy; 2026 Lymon. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: [{ email, name: email }],
      subject: 'Verifica tu correo electrónico - Lymon',
      htmlContent,
    });
  }
}
