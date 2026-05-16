import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PresentationModule } from '@/presentation/presentation.module';
import { ApplicationModule } from '@/application/application.module';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AuthModule } from '@/infrastructure/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@/infrastructure/auth/guards/jwt-auth.guard';
import { AuditInfrastructureModule } from '@/infrastructure/audit/audit-infrastructure.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReservationInfrastructureModule } from '@/infrastructure/reservation/reservation-infrastructure.module';
import { InventoryInfrastructureModule } from '@/infrastructure/inventory/inventory-infrastructure.module';
import { GuestPreferenceInfrastructureModule } from '@/infrastructure/guest-preference/guest-preference-infrastructure.module';
import { ChannexInfrastructureModule } from '@/infrastructure/channex/channex-infrastructure.module';
import { PaymentModule } from '@/infrastructure/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    PresentationModule,
    ApplicationModule,
    AuditInfrastructureModule,
    ReservationInfrastructureModule,
    InventoryInfrastructureModule,
    GuestPreferenceInfrastructureModule,
    PaymentModule,
    ChannexInfrastructureModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
