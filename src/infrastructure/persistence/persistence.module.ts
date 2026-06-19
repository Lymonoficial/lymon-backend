import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TenantDocument,
  TenantSchema,
} from '@/infrastructure/persistence/schemas/tenant.schema';
import {
  UserDocument,
  UserSchema,
} from '@/infrastructure/persistence/schemas/user.schema';
import {
  PropertyDocument,
  PropertySchema,
} from '@/infrastructure/persistence/schemas/property.schema';
import {
  UnitDocument,
  UnitSchema,
} from '@/infrastructure/persistence/schemas/unit.schema';
import {
  GuestDocument,
  GuestSchema,
} from '@/infrastructure/persistence/schemas/guest.schema';
import {
  GuestAccountDocument,
  GuestAccountSchema,
} from '@/infrastructure/persistence/schemas/guest-account.schema';
import {
  RoleDocument,
  RoleSchema,
} from '@/infrastructure/persistence/schemas/role.schema';
import {
  AuditLogDocument,
  AuditLogSchema,
} from '@/infrastructure/persistence/schemas/audit-log.schema';
import {
  IncidentReportDocument,
  IncidentReportSchema,
} from '@/infrastructure/persistence/schemas/incident-report.schema';
import {
  GuestNoteDocument,
  GuestNoteSchema,
} from '@/infrastructure/persistence/schemas/guest-note.schema';
import { GUEST_NOTE_REPOSITORY } from '@/domain/guest-note/repositories/guest-note.repository';
import { MongoGuestNoteRepository } from '@/infrastructure/persistence/repositories/mongo-guest-note.repository';
import { TENANT_REPOSITORY } from '@/domain/tenant/repositories/tenant.repository';
import { MongoTenantRepository } from '@/infrastructure/persistence/repositories/mongo-tenant.repository';
import { USER_REPOSITORY } from '@/domain/user/repositories/user.repository';
import { MongoUserRepository } from '@/infrastructure/persistence/repositories/mongo-user.repository';
import { PROPERTY_REPOSITORY } from '@/domain/property/repositories/property.repository';
import { MongoPropertyRepository } from '@/infrastructure/persistence/repositories/mongo-property.repository';
import { UNIT_REPOSITORY } from '@/domain/unit/repositories/unit.repository';
import { MongoUnitRepository } from '@/infrastructure/persistence/repositories/mongo-unit.repository';
import { GUEST_REPOSITORY } from '@/domain/guest/repositories/guest.repository';
import { MongoGuestRepository } from '@/infrastructure/persistence/repositories/mongo-guest.repository';
import { GUEST_ACCOUNT_REPOSITORY } from '@/domain/guest-account/repositories/guest-account.repository';
import { MongoGuestAccountRepository } from '@/infrastructure/persistence/repositories/mongo-guest-account.repository';
import { ROLE_REPOSITORY } from '@/domain/role/repositories/role.repository';
import { MongoRoleRepository } from '@/infrastructure/persistence/repositories/mongo-role.repository';
import { AUDIT_LOG_REPOSITORY } from '@/domain/audit/repositories/audit-log.repository';
import { MongoAuditLogRepository } from '@/infrastructure/persistence/repositories/mongo-audit-log.repository';
import { RoleSeedService } from '@/infrastructure/persistence/seeds/role-seed.service';
import { TRANSACTION_MANAGER } from '@/domain/shared/transaction-manager.interface';
import { MongoTransactionManager } from '@/infrastructure/persistence/transaction/mongo-transaction-manager';
import { INCIDENT_REPORT_REPOSITORY } from '@/domain/incident-report/repositories/incident-report.repository';
import { MongoIncidentReportRepository } from './repositories/mongo-incident-report.repository';
import {
  ReservationDocument,
  ReservationSchema,
} from '@/infrastructure/persistence/schemas/reservation.schema';
import { CartDocument, CartSchema } from '@/infrastructure/persistence/schemas/cart.schema';
import { CART_REPOSITORY } from '@/domain/cart/repositories/cart.repository';
import { MongoCartRepository } from '@/infrastructure/persistence/repositories/mongo-cart.repository';
import { RESERVATION_REPOSITORY } from '@/domain/reservation/repositories/reservation.repository';
import { GUEST_RESERVATIONS_READ_REPOSITORY } from '@/domain/reservation/repositories/guest-reservations-read.repository';
import { MongoReservationRepository } from './repositories/mongo-reservation.repository';
import {
  InventoryItemDocument,
  InventoryItemSchema,
} from '@/infrastructure/persistence/schemas/inventory-item.schema';
import {
  InventoryMovementDocument,
  InventoryMovementSchema,
} from '@/infrastructure/persistence/schemas/inventory-movement.schema';
import { INVENTORY_ITEM_REPOSITORY } from '@/domain/inventory/repositories/inventory-item.repository';
import { MongoInventoryItemRepository } from '@/infrastructure/persistence/repositories/mongo-inventory-item.repository';
import { INVENTORY_MOVEMENT_REPOSITORY } from '@/domain/inventory/repositories/inventory-movement.repository';
import { MongoInventoryMovementRepository } from '@/infrastructure/persistence/repositories/mongo-inventory-movement.repository';
import {
  GuestEmailDocument,
  GuestEmailSchema,
} from '@/infrastructure/persistence/schemas/guest-email.schema';
import { GUEST_EMAIL_REPOSITORY } from '@/domain/guest-email/repositories/guest-email.repository';
import { MongoGuestEmailRepository } from '@/infrastructure/persistence/repositories/mongo-guest-email.repository';
import {
  ShiftDocument,
  ShiftSchema,
} from '@/infrastructure/persistence/schemas/shift.schema';
import { SHIFT_REPOSITORY } from '@/domain/shift/repositories/shift.repository';
import { MongoShiftRepository } from '@/infrastructure/persistence/repositories/mongo-shift.repository';
import { SupplierDocument, SupplierSchema } from './schemas/supplier.schema';
import { SUPPLIER_REPOSITORY } from '@/domain/inventory/repositories/supplier.repository';
import { MongoSupplierRepository } from './repositories/mongo-supplier.repository';
import {
  InventoryItemCategoryDocument,
  InventoryItemCategorySchema,
} from '@/infrastructure/persistence/schemas/inventory-item-category.schema';
import { INVENTORY_ITEM_CATEGORY_REPOSITORY } from '@/domain/inventory/repositories/inventory-item-category.repository';
import { MongoInventoryItemCategoryRepository } from '@/infrastructure/persistence/repositories/mongo-inventory-item-category.repository';
import {
  GuestPreferenceCatalogItemDocument,
  GuestPreferenceCatalogItemSchema,
} from '@/infrastructure/persistence/schemas/guest-preference-catalog-item.schema';
import { GUEST_PREFERENCE_CATALOG_REPOSITORY } from '@/domain/guest-preference/repositories/guest-preference-catalog.repository';
import { MongoGuestPreferenceCatalogRepository } from '@/infrastructure/persistence/repositories/mongo-guest-preference-catalog.repository';
import {
  ExperienceDocument,
  ExperienceSchema,
} from '@/infrastructure/persistence/schemas/experience.schema';
import { EXPERIENCE_REPOSITORY } from '@/domain/experience/repositories/experience.repository';
import { MongoExperienceRepository } from '@/infrastructure/persistence/repositories/mongo-experience.repository';
import {
  PaymentSessionDocument,
  PaymentSessionSchema,
} from '@/infrastructure/persistence/schemas/payment-session.schema';
import { PAYMENT_SESSION_REPOSITORY } from '@/domain/payment/repositories/payment-session.repository';
import { MongoPaymentSessionRepository } from '@/infrastructure/persistence/repositories/mongo-payment-session.repository';
import {
  ExperiencePurchaseDocument,
  ExperiencePurchaseSchema,
} from '@/infrastructure/persistence/schemas/experience-purchase.schema';
import { EXPERIENCE_PURCHASE_REPOSITORY } from '@/domain/experience-purchase/repositories/experience-purchase.repository';
import { MongoExperiencePurchaseRepository } from '@/infrastructure/persistence/repositories/mongo-experience-purchase.repository';
import {
  GuestTagDocument,
  GuestTagSchema,
} from '@/infrastructure/persistence/schemas/guest-tag.schema';
import { GUEST_TAG_REPOSITORY } from '@/domain/guest-tag/repositories/guest-tag.repository';
import { MongoGuestTagRepository } from '@/infrastructure/persistence/repositories/mongo-guest-tag.repository';
import { GuestTagSeedService } from '@/infrastructure/persistence/seeds/guest-tag-seed.service';
import {
  UnitRatingDocument,
  UnitRatingSchema,
} from '@/infrastructure/persistence/schemas/unit-rating.schema';
import {
  RefundRequestDocument,
  RefundRequestSchema,
} from '@/infrastructure/persistence/schemas/refund-request.schema';
import { REFUND_REQUEST_REPOSITORY } from '@/domain/refund/repositories/refund-request.repository';
import { MongoRefundRequestRepository } from '@/infrastructure/persistence/repositories/mongo-refund-request.repository';
import { UNIT_RATING_REPOSITORY } from '@/domain/unit-rating/repositories/unit-rating.repository';
import { MongoUnitRatingRepository } from '@/infrastructure/persistence/repositories/mongo-unit-rating.repository';
import {
  GuestMessageDocument,
  GuestMessageSchema,
} from '@/infrastructure/persistence/schemas/guest-message.schema';
import { GUEST_MESSAGE_REPOSITORY } from '@/domain/guest-message/repositories/guest-message.repository';
import { MongoGuestMessageRepository } from '@/infrastructure/persistence/repositories/mongo-guest-message.repository';
import { GuestEmailBackfillMigration } from '@/infrastructure/migrations/guest-email-backfill.migration';
import {
  ConversationDocument,
  ConversationSchema,
} from '@/infrastructure/persistence/schemas/conversation.schema';
import { CONVERSATION_REPOSITORY } from '@/domain/conversation/repositories/conversation.repository';
import { MongoConversationRepository } from '@/infrastructure/persistence/repositories/mongo-conversation.repository';
import { ConversationBackfillMigration } from '@/infrastructure/migrations/conversation-backfill.migration';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TenantDocument.name, schema: TenantSchema },
      { name: UserDocument.name, schema: UserSchema },
      { name: PropertyDocument.name, schema: PropertySchema },
      { name: UnitDocument.name, schema: UnitSchema },
      { name: GuestDocument.name, schema: GuestSchema },
      { name: GuestAccountDocument.name, schema: GuestAccountSchema },
      { name: RoleDocument.name, schema: RoleSchema },
      { name: AuditLogDocument.name, schema: AuditLogSchema },
      { name: IncidentReportDocument.name, schema: IncidentReportSchema },
      { name: ReservationDocument.name, schema: ReservationSchema },
          { name: CartDocument.name, schema: CartSchema },
      { name: InventoryItemDocument.name, schema: InventoryItemSchema },
      {
        name: InventoryMovementDocument.name,
        schema: InventoryMovementSchema,
      },
      { name: SupplierDocument.name, schema: SupplierSchema },
      {
        name: InventoryItemCategoryDocument.name,
        schema: InventoryItemCategorySchema,
      },
      { name: GuestNoteDocument.name, schema: GuestNoteSchema },
      { name: GuestEmailDocument.name, schema: GuestEmailSchema },
      { name: ShiftDocument.name, schema: ShiftSchema },
      {
        name: GuestPreferenceCatalogItemDocument.name,
        schema: GuestPreferenceCatalogItemSchema,
      },
      { name: ExperienceDocument.name, schema: ExperienceSchema },
      { name: PaymentSessionDocument.name, schema: PaymentSessionSchema },
      {
        name: ExperiencePurchaseDocument.name,
        schema: ExperiencePurchaseSchema,
      },
      { name: GuestTagDocument.name, schema: GuestTagSchema },
      { name: UnitRatingDocument.name, schema: UnitRatingSchema },
      { name: RefundRequestDocument.name, schema: RefundRequestSchema },
      { name: GuestMessageDocument.name, schema: GuestMessageSchema },
      { name: ConversationDocument.name, schema: ConversationSchema },
    ]),
  ],
  providers: [
    {
      provide: TENANT_REPOSITORY,
      useClass: MongoTenantRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: PROPERTY_REPOSITORY,
      useClass: MongoPropertyRepository,
    },
    {
      provide: UNIT_REPOSITORY,
      useClass: MongoUnitRepository,
    },
    {
      provide: GUEST_REPOSITORY,
      useClass: MongoGuestRepository,
    },
    {
      provide: GUEST_ACCOUNT_REPOSITORY,
      useClass: MongoGuestAccountRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: MongoRoleRepository,
    },
    {
      provide: AUDIT_LOG_REPOSITORY,
      useClass: MongoAuditLogRepository,
    },
    {
      provide: TRANSACTION_MANAGER,
      useClass: MongoTransactionManager,
    },
    {
      provide: INCIDENT_REPORT_REPOSITORY,
      useClass: MongoIncidentReportRepository,
    },
    {
      provide: RESERVATION_REPOSITORY,
      useClass: MongoReservationRepository,
    },
    {
      provide: CART_REPOSITORY,
      useClass: MongoCartRepository,
    },
    {
      provide: GUEST_RESERVATIONS_READ_REPOSITORY,
      useExisting: RESERVATION_REPOSITORY,
    },
    {
      provide: INVENTORY_ITEM_REPOSITORY,
      useClass: MongoInventoryItemRepository,
    },
    {
      provide: INVENTORY_MOVEMENT_REPOSITORY,
      useClass: MongoInventoryMovementRepository,
    },
    {
      provide: SUPPLIER_REPOSITORY,
      useClass: MongoSupplierRepository,
    },
    {
      provide: INVENTORY_ITEM_CATEGORY_REPOSITORY,
      useClass: MongoInventoryItemCategoryRepository,
    },
    {
      provide: GUEST_NOTE_REPOSITORY,
      useClass: MongoGuestNoteRepository,
    },
    {
      provide: GUEST_EMAIL_REPOSITORY,
      useClass: MongoGuestEmailRepository,
    },
    {
      provide: SHIFT_REPOSITORY,
      useClass: MongoShiftRepository,
    },
    {
      provide: GUEST_PREFERENCE_CATALOG_REPOSITORY,
      useClass: MongoGuestPreferenceCatalogRepository,
    },
    {
      provide: EXPERIENCE_REPOSITORY,
      useClass: MongoExperienceRepository,
    },
    {
      provide: PAYMENT_SESSION_REPOSITORY,
      useClass: MongoPaymentSessionRepository,
    },
    {
      provide: EXPERIENCE_PURCHASE_REPOSITORY,
      useClass: MongoExperiencePurchaseRepository,
    },
    RoleSeedService,
    {
      provide: GUEST_TAG_REPOSITORY,
      useClass: MongoGuestTagRepository,
    },
    GuestTagSeedService,
    {
      provide: UNIT_RATING_REPOSITORY,
      useClass: MongoUnitRatingRepository,
    },
    {
      provide: REFUND_REQUEST_REPOSITORY,
      useClass: MongoRefundRequestRepository,
    },
    {
      provide: GUEST_MESSAGE_REPOSITORY,
      useClass: MongoGuestMessageRepository,
    },
    GuestEmailBackfillMigration,
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: MongoConversationRepository,
    },
    ConversationBackfillMigration,
  ],
  exports: [
    TENANT_REPOSITORY,
    USER_REPOSITORY,
    PROPERTY_REPOSITORY,
    UNIT_REPOSITORY,
    GUEST_REPOSITORY,
    GUEST_ACCOUNT_REPOSITORY,
    ROLE_REPOSITORY,
    AUDIT_LOG_REPOSITORY,
    TRANSACTION_MANAGER,
    INCIDENT_REPORT_REPOSITORY,
    RESERVATION_REPOSITORY,
    GUEST_RESERVATIONS_READ_REPOSITORY,
    INVENTORY_ITEM_REPOSITORY,
    INVENTORY_MOVEMENT_REPOSITORY,
    SUPPLIER_REPOSITORY,
    INVENTORY_ITEM_CATEGORY_REPOSITORY,
    GUEST_NOTE_REPOSITORY,
    GUEST_EMAIL_REPOSITORY,
    SHIFT_REPOSITORY,
    GUEST_PREFERENCE_CATALOG_REPOSITORY,
    EXPERIENCE_REPOSITORY,
    PAYMENT_SESSION_REPOSITORY,
    EXPERIENCE_PURCHASE_REPOSITORY,
    CART_REPOSITORY,
    GUEST_TAG_REPOSITORY,
    UNIT_RATING_REPOSITORY,
    REFUND_REQUEST_REPOSITORY,
    GUEST_MESSAGE_REPOSITORY,
    CONVERSATION_REPOSITORY,
  ],
})
export class PersistenceModule {}
