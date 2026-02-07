import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type IColaboratorRepository } from 'src/domain/colaborators/repositories/colaborator.repository';
import { RegisterColaboratorDto } from 'src/infrastructure/colaborators/dtos/register-colaborator.dto';
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

    const salt = await bcrypt.genSalt(20);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const newColaborator = {
      ...dto,
      password: hashedPassword,
      isActive: true,
    };

    return await this.repository.save(newColaborator);
  }
}
