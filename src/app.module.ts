import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseConfigModule } from './infrastructure/persistence/mongoose/mongoose-config.module';
import { AuthModule } from './infrastructure/modules/auth/auth.module';
import { HotelsModule } from './infrastructure/modules/hotels/hotels.module';
import { RoomsModule } from './infrastructure/modules/rooms/rooms.module';
import { EmailModule } from './infrastructure/modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseConfigModule,
    AuthModule,
    HotelsModule,
    RoomsModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
