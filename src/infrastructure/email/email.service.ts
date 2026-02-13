import { IEmailService } from '@/application/tenant/commands/register-tenant.handler';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  constructor(private readonly configService: ConfigService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.configService.get('APP_URL')}/auth/verify-email?token=${token}`;

    this.logger.log(`Sending verification email to ${email}`);
    this.logger.log(`Verification URL: ${verificationUrl}`);

    // TODO: Implementar con un servicio real

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
