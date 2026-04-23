import { ApplicationModule } from '@/application/application.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from '@/presentation/controllers/auth.controller';
import { UserController } from '@/presentation/controllers/user.controller';
import { PropertyController } from '@/presentation/controllers/property.controller';
import { UnitController } from '@/presentation/controllers/unit.controller';
import { AuditController } from '@/presentation/controllers/audit.controller';
import { IncidentReportController } from '@/presentation/controllers/incident-report.controller';
import { TenantController } from '@/presentation/controllers/tenant.controller';
import { GuestAuthController } from '@/presentation/controllers/guest-auth.controller';
import { RoleController } from '@/presentation/controllers/role.controller';
import { GuestController } from '@/presentation/controllers/guest.controller';
import { CrmController } from '@/presentation/controllers/crm.controller';
import { ReservationController } from '@/presentation/controllers/reservation.controller';
import { GuestReservationController } from '@/presentation/controllers/guest-reservation.controller';
import { InventoryController } from '@/presentation/controllers/inventory.controller';
import { SuppliersController } from '@/presentation/controllers/suppliers.controller';
import { ShiftsController } from '@/presentation/controllers/shifts.controller';
import { ExperienceController } from '@/presentation/controllers/experience.controller';

@Module({
  imports: [CqrsModule, ApplicationModule],
  controllers: [
    AuthController,
    UserController,
    PropertyController,
    UnitController,
    AuditController,
    IncidentReportController,
    TenantController,
    GuestAuthController,
    GuestController,
    RoleController,
    CrmController,
    ReservationController,
    GuestReservationController,
    InventoryController,
    SuppliersController,
    ShiftsController,
    ExperienceController,
  ],
})
export class PresentationModule {}
