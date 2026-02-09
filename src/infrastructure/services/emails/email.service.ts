import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'gmail'; // gmail o outlook
    if (emailProvider === 'gmail') {
      // Configuración para Gmail (más simple)
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER || 'tu-email@gmail.com',
          pass: process.env.EMAIL_PASSWORD || '', // Contraseña de aplicación de Gmail
        },
      });
    } else if (emailProvider === 'outlook') {
      // Configuración para Outlook (requiere OAuth2 o contraseña de aplicación)
      this.transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER || 'Lymonoficial@outlook.com',
          pass: process.env.EMAIL_PASSWORD || '',
        },
        tls: {
          ciphers: 'SSLv3',
        },
      });
    } else {
      // Configuración personalizada con variables de entorno
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    // Verificar la conexión (sin bloquear el inicio)
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Email service is ready to send emails');
      this.logger.log(
        `📧 Using provider: ${process.env.EMAIL_PROVIDER || 'gmail'}`,
      );
    } catch (error) {
      this.logger.error('❌ Error connecting to email service:', error.message);

      const provider = process.env.EMAIL_PROVIDER || 'gmail';
      if (provider === 'gmail') {
        this.logger.warn('📧 Gmail Setup:');
        this.logger.warn('1. Go to: https://myaccount.google.com/security');
        this.logger.warn('2. Enable 2-Step Verification');
        this.logger.warn('3. Go to: https://myaccount.google.com/apppasswords');
        this.logger.warn('4. Create an App Password for "Mail"');
        this.logger.warn('5. Use that password in EMAIL_PASSWORD');
      } else if (provider === 'outlook') {
        this.logger.warn('📧 Outlook Setup:');
        this.logger.warn('1. Go to: https://account.microsoft.com/security');
        this.logger.warn('2. Enable 2-Step Verification');
        this.logger.warn('3. Create an App Password');
        this.logger.warn('4. Use that password in EMAIL_PASSWORD');
        this.logger.warn('OR use Gmail instead (set EMAIL_PROVIDER=gmail)');
      }
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const fromName = process.env.EMAIL_FROM_NAME || 'Lymon Hotel Management';
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      this.logger.log(`📧 Email sent successfully to ${options.to}`);
      this.logger.debug(`Message ID: ${info.messageId}`);

      return true;
    } catch (error) {
      this.logger.error(
        `❌ Error sending email to ${options.to}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Envía un correo de prueba para verificar la configuración
   */
  async sendTestEmail(to: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Prueba de configuración - Lymon',
      html: `
        <h1>¡Configuración exitosa!</h1>
        <p>Este es un correo de prueba para verificar que el servicio de correos está funcionando correctamente.</p>
        <p>Si recibiste este correo, significa que la configuración de Outlook está correcta.</p>
        <br>
        <p><strong>Lymon Hotel Management</strong></p>
      `,
    });
  }
}
