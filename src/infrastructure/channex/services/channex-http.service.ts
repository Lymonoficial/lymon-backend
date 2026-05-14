import {
  ChannexPropertyData,
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
}
