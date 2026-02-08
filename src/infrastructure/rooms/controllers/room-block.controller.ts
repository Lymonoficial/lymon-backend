import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRoomBlockUseCase } from '@/application/rooms/use-cases/create-room-block.use-case';
import { GetRoomBlocksByDateRangeUseCase } from '@/application/rooms/use-cases/get-room-blocks-by-date-range.use-case';
import { ReleaseRoomBlockUseCase } from '@/application/rooms/use-cases/release-room-block.use-case';
import { CreateRoomBlockDto } from '../dtos/create-room-block.dto';
import { GetRoomBlocksDto } from '@/infrastructure/rooms/dtos/get-room-blocks.dto';

@ApiTags('Room Blocks')
@Controller('room-blocks')
export class RoomBlockController {
  constructor(
    private readonly createRoomBlockUseCase: CreateRoomBlockUseCase,
    private readonly getRoomBlocksByDateRangeUseCase: GetRoomBlocksByDateRangeUseCase,
    private readonly releaseRoomBlockUseCase: ReleaseRoomBlockUseCase,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new room block for company or event',
    description:
      'Block multiple rooms for a company or event to prevent individual sales on external platforms',
  })
  @ApiResponse({
    status: 201,
    description: 'Room block created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or room conflicts',
  })
  async createBlock(@Body() dto: CreateRoomBlockDto) {
    return await this.createRoomBlockUseCase.execute(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get room blocks by date range',
    description:
      'Retrieve all room blocks within a date range for Gantt board visualization',
  })
  @ApiResponse({
    status: 200,
    description: 'Room blocks retrieved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date range or parameters',
  })
  async getBlocks(@Query() query: GetRoomBlocksDto) {
    return await this.getRoomBlocksByDateRangeUseCase.execute(query);
  }

  @Patch(':id/release')
  @ApiOperation({
    summary: 'Release a room block back to inventory',
    description:
      'Free up blocked rooms to make them available for individual bookings',
  })
  @ApiResponse({
    status: 200,
    description: 'Room block released successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Room block not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Block cannot be released (invalid status)',
  })
  async releaseBlock(@Param('id') id: string) {
    return await this.releaseRoomBlockUseCase.execute(id);
  }
}
