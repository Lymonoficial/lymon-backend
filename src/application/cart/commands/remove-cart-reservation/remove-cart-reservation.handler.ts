import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveCartReservationCommand } from './remove-cart-reservation.command';
import {
  CART_REPOSITORY,
  type CartRepository,
} from '@/domain/cart/repositories/cart.repository';
import { GuestAccountId } from '@/domain/guest-account/value-objects/guest-account-id.vo';
import { TenantId } from '@/domain/tenant/value-objects/tenant-id.vo';

@CommandHandler(RemoveCartReservationCommand)
export class RemoveCartReservationHandler
  implements ICommandHandler<RemoveCartReservationCommand>
{
  constructor(
    @Inject(CART_REPOSITORY)
    private readonly cartRepository: CartRepository,
  ) {}

  async execute(command: RemoveCartReservationCommand): Promise<void> {
    const guestAccountId = GuestAccountId.createFromString(
      command.guestAccountId,
    );
    const tenantId = TenantId.createFromString(command.tenantId);

    const cart = await this.cartRepository.findOpenByGuestAndTenant(
      guestAccountId,
      tenantId,
    );
    if (!cart) {
      throw new NotFoundException('No open cart found');
    }

    cart.removeReservationItem();
    await this.cartRepository.save(cart);
  }
}
