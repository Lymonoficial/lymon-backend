import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RegisterColaboratorUseCase } from 'src/application/use-cases/register-colaborator.use-case';
import { ColaboratorController } from 'src/infrastructure/controllers/colaborator/colaborator.controller';
import { ColaboratorSchema } from 'src/infrastructure/persistence/mongoose/colaborator.schema';
import { ColaboratorRepository } from 'src/infrastructure/persistence/mongoose/repositories/colaborator.repository';

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
