import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateEmailTemplateDto } from 'src/infrastructure/dtos/create-email-template.dto';
import { UpdateEmailTemplateDto } from 'src/infrastructure/dtos/update-email-template.dto';
import { SendEmailDto } from 'src/infrastructure/dtos/send-email.dto';
import { CreateEmailTemplateUseCase } from 'src/application/use-cases/create-email-template.use-case';
import { UpdateEmailTemplateUseCase } from 'src/application/use-cases/update-email-template.use-case';
import { SendEmailUseCase } from 'src/application/use-cases/send-email.use-case';
import { GetEmailTemplatesUseCase } from 'src/application/use-cases/get-email-templates.use-case';
import { JwtAuthGuard } from 'src/infrastructure/auth/jwt-auth.guard';
import { EmailService } from 'src/application/services/email.service';

@ApiTags('Email Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('email-templates')
export class EmailController {
  constructor(
    private readonly createEmailTemplateUseCase: CreateEmailTemplateUseCase,
    private readonly updateEmailTemplateUseCase: UpdateEmailTemplateUseCase,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly getEmailTemplatesUseCase: GetEmailTemplatesUseCase,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva plantilla de correo' })
  @ApiResponse({
    status: 201,
    description: 'Plantilla de correo creada exitosamente',
  })
  async createTemplate(@Body() dto: CreateEmailTemplateDto) {
    return await this.createEmailTemplateUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las plantillas de un hotel' })
  @ApiResponse({
    status: 200,
    description: 'Lista de plantillas de correo',
  })
  async getTemplates(@Query('hotelId') hotelId: string) {
    return await this.getEmailTemplatesUseCase.execute(hotelId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una plantilla de correo' })
  @ApiResponse({
    status: 200,
    description: 'Plantilla de correo actualizada exitosamente',
  })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    return await this.updateEmailTemplateUseCase.execute(id, dto);
  }

  @Post('send')
  @ApiOperation({
    summary: 'Enviar un correo usando una plantilla',
    description:
      'Envía un correo electrónico al destinatario especificado usando la plantilla configurada para el tipo de correo',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo enviado exitosamente',
  })
  async sendEmail(@Body() dto: SendEmailDto) {
    await this.sendEmailUseCase.execute(dto);
    return {
      success: true,
      message: `Email sent successfully to ${dto.to}`,
    };
  }

  @Post('test')
  @ApiOperation({
    summary: 'Enviar correo de prueba',
    description:
      'Envía un correo de prueba para verificar la configuración de Outlook',
  })
  @ApiResponse({
    status: 200,
    description: 'Correo de prueba enviado exitosamente',
  })
  async sendTestEmail(@Body() body: { to: string }) {
    await this.emailService.sendTestEmail(body.to);
    return {
      success: true,
      message: `Test email sent successfully to ${body.to}`,
    };
  }
}
