import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const mongoUri = configService.get<string>('MONGO_URI');

        if (!mongoUri) {
          throw new Error('MONGO_URI is not defined in environment variables');
        }

        return {
          uri: mongoUri,
          dbName: 'lymon',
          retryWrites: true,
          w: 'majority',
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
  ],
})
export class MongooseConfigModule {}
