import { Inject, Injectable } from '@nestjs/common';
import { GUEST_REPOSITORY, type GuestRepository } from '@/domain/guest/repositories/guest.repository';
import { Guest } from '@/domain/guest/entities/guest.entity';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@Injectable()
export class SearchGuestsQuery {
  constructor(
    @Inject(GUEST_REPOSITORY)
    private readonly guestRepository: GuestRepository,
  ) {}

  async execute(tenantId: TenantId, term: string): Promise<Guest[]> {
    // 1. Limpiamos el texto de búsqueda (quitar espacios y pasar a minúsculas)
    const sanitizedTerm = term?.trim().toLowerCase();

    // 2. Si no hay término, devolvemos la lista general de ese hotel (tenant)
    if (!sanitizedTerm) {
      return this.guestRepository.findByTenantId(tenantId);
    }

    // 3. Ejecutamos la búsqueda filtrada
    return this.guestRepository.search(tenantId, sanitizedTerm);
  }
}