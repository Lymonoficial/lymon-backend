import { PersistenceModule } from '@/infrastructure/persistence/persistence.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterTenantHandler } from '@/application/tenant/commands/register-tenant.handler';
import { VerifyEmailHandler } from '@/application/user/commands/verify-email/verify-email.handler';
import { ChangePasswordHandler } from '@/application/user/commands/change-password/change-password.handler';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import { LoginHandler } from '@/application/auth/commands/login.handler';
import { RefreshTokenHandler } from '@/application/auth/commands/refresh-token.handler';
import { LogoutHandler } from '@/application/auth/commands/logout.handler';
import { RecoverPasswordHandler } from '@/application/auth/commands/recover-password.handler';
import { ConfirmRecoverPasswordHandler } from './auth/commands/confirm-recover-password.handler';
import { EmailModule } from '@/infrastructure/email/email.module';
import { PropertyApplicationModule } from '@/application/property/property-application.module';
import { UnitApplicationModule } from '@/application/unit/unit-application.module';
import { InviteStaffHandler } from '@/application/user/commands/invite-staff/invite-staff.handler';
import { AuditApplicationModule } from '@/application/audit/audit-application.module';
import { IncidentReportApplicationModule } from '@/application/incident-report/incident-report-application.module';
import { TenantApplicationModule } from '@/application/tenant/tenant-application.module';
import { GuestAuthApplicationModule } from '@/application/guest-auth/guest-auth-application.module';
import { RoleApplicationModule } from '@/application/role/role-application.module';
import { GuestApplicationModule } from '@/application/guest/guest-application.module';
import { ReservationApplicationModule } from '@/application/reservation/reservation-application.module';
import { InventoryApplicationModule } from '@/application/inventory/inventory-application.module';
import { GuestNoteApplicationModule } from '@/application/guest-note/guest-note-application.module';
import { GuestEmailApplicationModule } from '@/application/guest-email/guest-email-application.module';
import { UserApplicationModule } from '@/application/user/user-application.module';
import { CreateShiftCommandHandler } from '@/application/shift/commands/create-shift/create-shift.handler';
import { UpdateShiftCommandHandler } from '@/application/shift/commands/update-shift/update-shift.handler';

const CommandHandlers = [
  RegisterTenantHandler,
  LoginHandler,
  RefreshTokenHandler,
  LogoutHandler,
  RecoverPasswordHandler,
  ConfirmRecoverPasswordHandler,
  VerifyEmailHandler,
  ChangePasswordHandler,
  InviteStaffHandler,
  CreateShiftCommandHandler,
  UpdateShiftCommandHandler,
];
@Module({
  imports: [
    CqrsModule,
    PersistenceModule,
    AuthModule,
    EmailModule,
    PropertyApplicationModule,
    UnitApplicationModule,
    AuditApplicationModule,
    IncidentReportApplicationModule,
    TenantApplicationModule,
    GuestAuthApplicationModule,
    RoleApplicationModule,
    GuestApplicationModule,
    ReservationApplicationModule,
    InventoryApplicationModule,
    GuestNoteApplicationModule,
    GuestEmailApplicationModule,
    UserApplicationModule,
  ],
  providers: [...CommandHandlers],
  exports: [...CommandHandlers, GuestApplicationModule],
})
export class ApplicationModule {}
