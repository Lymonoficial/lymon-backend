import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type IColaboratorRepository } from '@/domain/colaborators/repositories/colaborator.repository';
import { RegisterColaboratorDto } from '@/infrastructure/colaborators/dtos/register-colaborator.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RegisterColaboratorUseCase {
  constructor(
    @Inject('IColaboratorRepository')
    private readonly repository: IColaboratorRepository,
  ) {}

  async execute(dto: RegisterColaboratorDto) {
    const existingColaborator = await this.repository.findByEmail(dto.email);
    if (existingColaborator) {
      throw new BadRequestException(
        'El correo electrónico ya está registrado.',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const newColaborator = {
      ...dto,
      password: hashedPassword,
      isActive: true,
    };

    return await this.repository.save(newColaborator);
  }
}
