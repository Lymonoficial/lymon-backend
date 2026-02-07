import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegisterColaboratorUseCase } from 'src/application/colaborators/use-cases/register-colaborator.use-case';
import { ColaboratorController } from 'src/infrastructure/colaborators/controllers/colaborator.controller';
import { ColaboratorSchema } from 'src/infrastructure/colaborators/colaborator.schema';
import { ColaboratorRepository } from 'src/infrastructure/colaborators/persistence/mongoose/repositories/colaborator.repository';

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
