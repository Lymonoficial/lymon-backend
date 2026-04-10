import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

interface TemplateVariables {
  [key: string]: string;
}

@Injectable()
export class EmailTemplateService {
  private readonly templatesDir = path.join(
    __dirname,
    '..',
    'common',
    'templates',
  );
  private readonly supportUrl: string;

  constructor(private readonly configService: ConfigService) {
    const supportUrl = this.configService.get<string>('SUPPORT_URL');
    if (!supportUrl) {
      throw new Error(
        'SUPPORT_URL environment variable is not configured. Please add SUPPORT_URL to your .env file.',
      );
    }
    this.supportUrl = supportUrl;
  }

  resolvePlaceholders(text: string, variables: any = {}): string {
    if (!text) return '';
    return text.replace(/\{\{(.+?)\}\}/g, (match, key) => {
      const value = variables[key.trim()];
      return value !== undefined && value !== null ? String(value) : '';
    });
  }

  renderTemplate(templateName: string, variables: any): string {
    const templatePath = path.join(this.templatesDir, `${templateName}.html`);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templateName}`);
    }
    const html = fs.readFileSync(templatePath, 'utf-8');
    return this.resolvePlaceholders(html, variables);
  }

  renderVerifyEmailTemplate(verificationUrl: string): string {
    return this.renderTemplate('verify-email', {
      verificationUrl,
      supportUrl: this.supportUrl,
    });
  }

  renderRecoverPasswordTemplate(recoveryUrl: string): string {
    return this.renderTemplate('recover-password', {
      recoveryUrl,
      supportUrl: this.supportUrl,
    });
  }

  renderLowStockAlertTemplate(variables: {
    ownerName: string;
    tenantName: string;
    propertyName: string;
    itemName: string;
    itemSku: string;
    currentStock: number;
    minStock: number;
    difference: number;
  }): string {
    return this.renderTemplate('low-stock-alert', {
      ownerName: variables.ownerName,
      tenantName: variables.tenantName,
      propertyName: variables.propertyName,
      itemName: variables.itemName,
      itemSku: variables.itemSku,
      currentStock: variables.currentStock.toString(),
      minStock: variables.minStock.toString(),
      difference: Math.abs(variables.difference).toString(),
      supportUrl: this.supportUrl,
    });
  }
}
