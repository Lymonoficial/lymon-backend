import { Test, TestingModule } from '@nestjs/testing';
import { ColaboratorController } from './colaborator.controller';

describe('ColaboratorController', () => {
  let controller: ColaboratorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ColaboratorController],
    }).compile();

    controller = module.get<ColaboratorController>(ColaboratorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
