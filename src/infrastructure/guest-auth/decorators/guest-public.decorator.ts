import { SetMetadata } from '@nestjs/common';
import { GUEST_PUBLIC_KEY } from '@/infrastructure/guest-auth/guards/guest-jwt-auth.guard';

/**
 * Mark a guest-auth controller route as public (no guest JWT required).
 * Use on registration, login, and password recovery endpoints.
 */
export const GuestPublic = () => SetMetadata(GUEST_PUBLIC_KEY, true);
