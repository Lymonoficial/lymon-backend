export interface EmailRecipient {
  email: string;
  name: string;
}

export interface SendEmailParams {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  sender?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
}

export interface IEmailService {
  sendEmail(params: SendEmailParams): Promise<void>;
  sendVerificationEmail(email: string, token: string): Promise<void>;
  sendRecoveryEmail(email: string, plainToken: string): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
