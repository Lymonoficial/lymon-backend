import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegisterColaboratorUseCase } from '@/application/colaborators/use-cases/register-colaborator.use-case';
import { ColaboratorController } from '@/infrastructure/colaborators/controllers/colaborator.controller';
import { ColaboratorSchema } from '@/infrastructure/colaborators/persistence/mongoose/schemas/colaborator.schema';
import { ColaboratorRepository } from '@/infrastructure/colaborators/persistence/mongoose/repositories/colaborator.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Colaborator',
        schema: ColaboratorSchema,
      },
    ]),
  ],
  controllers: [ColaboratorController],
  providers: [
    RegisterColaboratorUseCase,
    { provide: 'IColaboratorRepository', useClass: ColaboratorRepository },
  ],
})
export class ColaboratorsModule {}
