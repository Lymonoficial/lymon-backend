import { Test, TestingModule } from '@nestjs/testing';
import { RoomBlockController } from './room-block.controller';

describe('RoomBlockController', () => {
  let controller: RoomBlockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomBlockController],
    }).compile();

    controller = module.get<RoomBlockController>(RoomBlockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
