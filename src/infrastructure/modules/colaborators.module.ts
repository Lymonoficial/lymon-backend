import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ColaboratorController } from '@/presentation/controllers/colaborators/colaborator.controller';
import { ColaboratorSchema } from '@/infrastructure/persistence/mongodb/colaborators/colaborator.schema';
import { ColaboratorRepository } from '@/infrastructure/persistence/mongodb/colaborators/colaborator.repository';
import { RegisterColaboratorUseCase } from '@/application/colaborators/use-cases/register-colaborator.use-case';

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
