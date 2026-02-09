import { Test, TestingModule } from '@nestjs/testing';
import { HotelController } from './hotel.controller';
import { RegisterHotelUseCase } from '@/application/hotels/use-cases/register-hotel.use-case';
import { RegisterHotelDto } from '@/presentation/dtos/hotels/register-hotel.dto';
import { Hotel } from '@/domain/hotels/entities/hotel.entity';

describe('HotelController', () => {
  let controller: HotelController;
  let registerHotelUseCase: RegisterHotelUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelController],
      providers: [
        {
          provide: RegisterHotelUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HotelController>(HotelController);
    registerHotelUseCase =
      module.get<RegisterHotelUseCase>(RegisterHotelUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registerHotel', () => {
    it('should register a new hotel successfully', async () => {
      const dto: RegisterHotelDto = {
        name: 'Test Hotel',
        subdomain: 'test-hotel',
        ownerEmail: 'owner@testhotel.com',
        ownerPassword: 'SecurePass123!',
      };

      const expectedHotel = new Hotel(
        '123',
        dto.name,
        dto.subdomain,
        dto.ownerEmail,
        new Date(),
      );

      jest
        .spyOn(registerHotelUseCase, 'execute')
        .mockResolvedValue(expectedHotel);

      const result = await controller.registerHotel(dto);

      expect(result).toEqual(expectedHotel);
      expect(registerHotelUseCase.execute).toHaveBeenCalledWith(dto);
    });
  });
});
