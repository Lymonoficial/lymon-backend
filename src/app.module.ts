import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseConfigModule } from './infrastructure/persistence/mongoose/mongoose-config.module';
import { ColaboratorsModule } from './infrastructure/modules/colaborators/colaborators.module';
import { ReservationsModule } from './infrastructure/modules/reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseConfigModule,
    ColaboratorsModule,
    ReservationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
