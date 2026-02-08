export enum EmailTemplateType {
  WELCOME = 'welcome',
  ARRIVAL_INSTRUCTIONS = 'arrival_instructions',
  SATISFACTION_SURVEY = 'satisfaction_survey',
}

export class EmailTemplate {
  constructor(
    public readonly id: string,
    public readonly hotelId: string,
    public type: EmailTemplateType,
    public subject: string, // Asunto del correo
    public body: string, // Cuerpo del correo con variables {{variable}}
    public isActive: boolean,
    public readonly createdAt: Date,
    public updatedAt?: Date,
  ) {}

  static create(params: {
    id: string;
    hotelId: string;
    type: EmailTemplateType;
    subject: string;
    body: string;
    isActive?: boolean;
  }): EmailTemplate {
    if (!params.subject || params.subject.trim().length === 0) {
      throw new Error('Subject cannot be empty');
    }

    if (!params.body || params.body.trim().length === 0) {
      throw new Error('Body cannot be empty');
    }

    return new EmailTemplate(
      params.id,
      params.hotelId,
      params.type,
      params.subject,
      params.body,
      params.isActive ?? true,
      new Date(),
    );
  }

  updateTemplate(subject: string, body: string): void {
    if (!subject || subject.trim().length === 0) {
      throw new Error('Subject cannot be empty');
    }

    if (!body || body.trim().length === 0) {
      throw new Error('Body cannot be empty');
    }

    this.subject = subject;
    this.body = body;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  /**
   * Reemplaza variables en el cuerpo del correo
   * Ejemplo: body = "Hola {{name}}", variables = { name: "Juan" }
   * Resultado: "Hola Juan"
   */
  renderBody(variables: Record<string, string>): string {
    let renderedBody = this.body;
    
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedBody = renderedBody.replace(regex, variables[key]);
    });

    return renderedBody;
  }

  renderSubject(variables: Record<string, string>): string {
    let renderedSubject = this.subject;
    
    Object.keys(variables).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      renderedSubject = renderedSubject.replace(regex, variables[key]);
    });

    return renderedSubject;
  }
}
