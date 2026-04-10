import { EmailTemplateService } from '@/infrastructure/common/email-template.service';

export const createEmailTemplateServiceMock =
  (): jest.Mocked<EmailTemplateService> =>
    ({
      resolvePlaceholders: jest.fn(
        (text: string, vars: Record<string, unknown>) => {
          if (!text) return '';
          return text.replace(
            /\{\{(.+?)\}\}/g,
            (_match: string, key: string) => {
              const value = vars[key.trim()];
              return value !== undefined && value !== null
                ? String(value as string | number | boolean)
                : '';
            },
          );
        },
      ),
      renderTemplate: jest.fn((name: string, vars: Record<string, unknown>) => {
        // Basic mock rendering
        return `<html><body>Template: ${name}, Body: ${String(vars['body'] as string | number | boolean)}</body></html>`;
      }),
      renderVerifyEmailTemplate: jest.fn(),
      renderRecoverPasswordTemplate: jest.fn(),
      renderLowStockAlertTemplate: jest.fn(),
    }) as unknown as jest.Mocked<EmailTemplateService>;
