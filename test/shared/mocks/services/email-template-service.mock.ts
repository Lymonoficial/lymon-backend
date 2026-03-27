import { EmailTemplateService } from '@/infrastructure/common/email-template.service';

export const createEmailTemplateServiceMock = (): jest.Mocked<EmailTemplateService> => ({
  resolvePlaceholders: jest.fn((text, vars) => {
    if (!text) return '';
    return text.replace(/\{\{(.+?)\}\}/g, (match, key) => {
      const value = vars[key.trim()];
      return value !== undefined && value !== null ? String(value) : '';
    });
  }),
  renderTemplate: jest.fn((name, vars) => {
    // Basic mock rendering
    return `<html><body>Template: ${name}, Body: ${vars.body}</body></html>`;
  }),
  renderVerifyEmailTemplate: jest.fn(),
  renderRecoverPasswordTemplate: jest.fn(),
  renderLowStockAlertTemplate: jest.fn(),
} as any);
