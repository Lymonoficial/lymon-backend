import {
  ChannexAvailabilityEntry,
  ChannexBookingData,
  ChannexPropertyData,
  ChannexRoomTypeData,
  IChannexService,
} from '@/application/shared/services/channex.service';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

const CHANNEX_BASE_URL = 'https://staging.channex.io/api/v1';

@Injectable()
export class ChannexHttpService implements IChannexService {
  private readonly logger = new Logger(ChannexHttpService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get apiKey(): string {
    const key = this.configService.get<string>('CHANNEX_API_KEY');
    if (!key) throw new Error('CHANNEX_API_KEY is not configured');
    return key;
  }

  async createProperty(
    data: ChannexPropertyData,
  ): Promise<{ channexId: string }> {
    const body = {
      property: {
        title: data.title,
        currency: 'USD',
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country.slice(0, 2).toUpperCase(),
        zip_code: data.zipCode,
        latitude: String(data.lat),
        longitude: String(data.lng),
      },
    };

    this.logger.debug(
      `[CHANNEX] POST /properties body: ${JSON.stringify(body)}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${CHANNEX_BASE_URL}/properties`, body, {
          headers: { 'user-api-key': this.apiKey },
        }),
      );

      const channexId = response.data?.data?.id;
      if (!channexId) {
        throw new Error('Channex response missing property id');
      }

      this.logger.log(
        `[CHANNEX] Property created in Channex with id: ${channexId}`,
      );
      return { channexId };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      if (axiosError.response) {
        this.logger.error(
          `[CHANNEX] ${axiosError.response.status} response: ${JSON.stringify(axiosError.response.data)}`,
        );
      }
      throw error;
    }
  }

  async createRoomType(
    propertyChannexId: string,
    data: ChannexRoomTypeData,
  ): Promise<{ roomTypeId: string }> {
    const body = {
      room_type: {
        property_id: propertyChannexId,
        title: data.title,
        count_of_rooms: data.countOfRooms,
        occ_adults: data.occAdults,
        occ_children: 0,
        occ_infants: 0,
      },
    };

    this.logger.debug(
      `[CHANNEX] POST /room_types body: ${JSON.stringify(body)}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${CHANNEX_BASE_URL}/room_types`, body, {
          headers: { 'user-api-key': this.apiKey },
        }),
      );

      const roomTypeId = response.data?.data?.id;
      if (!roomTypeId) {
        throw new Error('Channex response missing room_type id');
      }

      this.logger.log(
        `[CHANNEX] Room type created in Channex with id: ${roomTypeId}`,
      );
      return { roomTypeId };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      if (axiosError.response) {
        this.logger.error(
          `[CHANNEX] ${axiosError.response.status} response: ${JSON.stringify(axiosError.response.data)}`,
        );
      }
      throw error;
    }
  }

  async updateAvailability(
    propertyChannexId: string,
    roomTypeId: string,
    entries: ChannexAvailabilityEntry[],
  ): Promise<void> {
    const body = {
      values: entries.map((e) => ({
        property_id: propertyChannexId,
        room_type_id: roomTypeId,
        date: e.date,
        availability: e.availability,
      })),
    };

    this.logger.debug(
      `[CHANNEX] POST /availability body: ${JSON.stringify(body)}`,
    );

    try {
      await firstValueFrom(
        this.httpService.post(`${CHANNEX_BASE_URL}/availability`, body, {
          headers: { 'user-api-key': this.apiKey },
        }),
      );
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      if (axiosError.response) {
        this.logger.error(
          `[CHANNEX] ${axiosError.response.status} response: ${JSON.stringify(axiosError.response.data)}`,
        );
      }
      throw error;
    }
  }

  async getBooking(bookingId: string): Promise<ChannexBookingData> {
    this.logger.debug(`[CHANNEX] GET /bookings/${bookingId}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${CHANNEX_BASE_URL}/bookings/${bookingId}`, {
          headers: { 'user-api-key': this.apiKey },
        }),
      );

      const data = response.data?.data;
      const attributes = data?.attributes ?? {};
      const included: Array<{ type: string; id: string; attributes: Record<string, unknown> }> =
        response.data?.included ?? [];

      const bookingRoom = included.find((i) => i.type === 'booking_room');
      const customer = included.find((i) => i.type === 'customer');

      return {
        bookingId: data?.id as string,
        propertyId: attributes.property_id as string,
        externalId: attributes.external_id as string,
        arrivalDate: attributes.arrival_date as string,
        departureDate: attributes.departure_date as string,
        roomTypeId: (bookingRoom?.attributes?.room_type_id ?? '') as string,
        guestsCount: (bookingRoom?.attributes?.occupancy ?? 1) as number,
        totalAmount: (attributes.total_price ?? 0) as number,
        customer: {
          firstName: (customer?.attributes?.first_name ?? '') as string,
          lastName: (customer?.attributes?.last_name ?? '') as string,
          email: (customer?.attributes?.email ?? '') as string,
          phone: (customer?.attributes?.phone ?? '') as string,
        },
      };
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      if (axiosError.response) {
        this.logger.error(
          `[CHANNEX] ${axiosError.response.status} response: ${JSON.stringify(axiosError.response.data)}`,
        );
      }
      throw error;
    }
  }

  async updateProperty(
    channexId: string,
    data: ChannexPropertyData,
  ): Promise<void> {
    const body = {
      property: {
        title: data.title,
        currency: 'USD',
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country.slice(0, 2).toUpperCase(),
        zip_code: data.zipCode,
        latitude: String(data.lat),
        longitude: String(data.lng),
      },
    };

    this.logger.debug(
      `[CHANNEX] PUT /properties/${channexId} body: ${JSON.stringify(body)}`,
    );

    try {
      await firstValueFrom(
        this.httpService.put(
          `${CHANNEX_BASE_URL}/properties/${channexId}`,
          body,
          { headers: { 'user-api-key': this.apiKey } },
        ),
      );
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: unknown; status?: number };
      };
      if (axiosError.response) {
        this.logger.error(
          `[CHANNEX] ${axiosError.response.status} response: ${JSON.stringify(axiosError.response.data)}`,
        );
      }
      throw error;
    }
  }
}
