import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseConfigModule } from './infrastructure/common/persistence/mongoose/mongoose-config.module';
import { ColaboratorsModule } from './infrastructure/modules/colaborators.module';
import { ReservationsModule } from './infrastructure/modules/reservations.module';
import { RoomBlocksModule } from './infrastructure/modules/room-blocks.module';
import { AuthModule } from './infrastructure/modules/auth.module';
import { HotelsModule } from './infrastructure/modules/hotels.module';
import { RoomsModule } from './infrastructure/modules/rooms.module';
import { EmailModule } from './infrastructure/modules/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseConfigModule,
    ColaboratorsModule,
    ReservationsModule,
    RoomBlocksModule,
    AuthModule,
    HotelsModule,
    RoomsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
