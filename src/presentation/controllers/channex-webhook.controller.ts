import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { ProcessChannexBookingCommand } from '@/application/reservation/commands/process-channex-booking/process-channex-booking.command';
import {
  CHANNEX_SERVICE,
  type IChannexService,
} from '@/application/shared/services/channex.service';

interface ChannexWebhookPayload {
  event: string;
  payload: {
    booking_id?: string;
    revision_id?: string;
    property_id?: string;
  };
}

@Controller('channex')
export class ChannexWebhookController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService,
    @Inject(CHANNEX_SERVICE)
    private readonly channexService: IChannexService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Headers('x-channex-secret') secret: string,
    @Body() body: ChannexWebhookPayload,
  ): Promise<void> {
    const expected = this.configService.get<string>('CHANNEX_WEBHOOK_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const handledEvents = ['booking_new', 'booking_modification'];
    if (!handledEvents.includes(body?.event)) return;

    const bookingId = body.payload?.booking_id;
    if (!bookingId) return;

    const booking = await this.channexService.getBooking(bookingId);

    await this.commandBus.execute(
      new ProcessChannexBookingCommand(
        booking.bookingId,
        booking.externalId,
        booking.propertyId,
        booking.roomTypeId,
        booking.arrivalDate,
        booking.departureDate,
        booking.guestsCount,
        booking.totalAmount,
        booking.customer.firstName,
        booking.customer.lastName,
        booking.customer.email,
        booking.customer.phone,
      ),
    );
  }
}
