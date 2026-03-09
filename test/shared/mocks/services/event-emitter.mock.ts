import { EventEmitter2 } from '@nestjs/event-emitter';

export function createEventEmitterMock(): jest.Mocked<
  Pick<EventEmitter2, 'emit'>
> {
  return {
    emit: jest.fn(),
  };
}
