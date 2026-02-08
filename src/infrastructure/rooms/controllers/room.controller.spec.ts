import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from '../../rooms/controllers/room.controller';
import { CreateRoomTypeUseCase } from '@/application/rooms/use-cases/create-room-type.use-case';
import { AssignRoomUnitsUseCase } from '@/application/rooms/use-cases/assign-room-units.use-case';
import { CreateRoomTypeDto } from '@/infrastructure/rooms/dtos/create-room-type.dto';
import { AssignRoomUnitsDto } from '@/infrastructure/rooms/dtos/assign-room-units.dto';
import { RoomType } from '@/domain/rooms/entities/room-type.entity';
import { Room, RoomStatus } from '@/domain/rooms/entities/room.entity';

describe('RoomController', () => {
  let controller: RoomController;
  let createRoomTypeUseCase: CreateRoomTypeUseCase;
  let assignRoomUnitsUseCase: AssignRoomUnitsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: CreateRoomTypeUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: AssignRoomUnitsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    createRoomTypeUseCase = module.get<CreateRoomTypeUseCase>(
      CreateRoomTypeUseCase,
    );
    assignRoomUnitsUseCase = module.get<AssignRoomUnitsUseCase>(
      AssignRoomUnitsUseCase,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRoomType', () => {
    it('should create a new room type', async () => {
      const dto: CreateRoomTypeDto = {
        hotelId: '507f1f77bcf86cd799439011',
        name: 'Deluxe Suite',
        description: 'Spacious suite with ocean view',
        basePrice: 150.0,
        maxOccupancy: 4,
        amenities: ['Wi-Fi', 'TV', 'Air Conditioning'],
      };

      const expectedRoomType = new RoomType(
        '123',
        dto.hotelId,
        dto.name,
        dto.description,
        dto.basePrice,
        dto.maxOccupancy,
        dto.amenities || [],
        new Date(),
      );

      jest
        .spyOn(createRoomTypeUseCase, 'execute')
        .mockResolvedValue(expectedRoomType);

      const result = await controller.createRoomType(dto);

      expect(result).toEqual(expectedRoomType);
      expect(createRoomTypeUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('assignRoomUnits', () => {
    it('should assign room units to a room type', async () => {
      const dto: AssignRoomUnitsDto = {
        hotelId: '507f1f77bcf86cd799439011',
        roomTypeId: '507f1f77bcf86cd799439012',
        rooms: [
          { roomNumber: '101', floor: 1 },
          { roomNumber: '102', floor: 1 },
        ],
      };

      const expectedRooms = [
        new Room(
          '1',
          dto.roomTypeId,
          dto.hotelId,
          '101',
          1,
          RoomStatus.AVAILABLE,
          new Date(),
        ),
        new Room(
          '2',
          dto.roomTypeId,
          dto.hotelId,
          '102',
          1,
          RoomStatus.AVAILABLE,
          new Date(),
        ),
      ];

      jest
        .spyOn(assignRoomUnitsUseCase, 'execute')
        .mockResolvedValue(expectedRooms);

      const result = await controller.assignRoomUnits(dto);

      expect(result).toEqual(expectedRooms);
      expect(assignRoomUnitsUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });
});
