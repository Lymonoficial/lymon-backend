import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

// Configurar DNS resolver para Windows (solución para error ECONNREFUSED)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

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
          retryWrites: true,
          w: 'majority',
          serverSelectionTimeoutMS: 5000,
        };
      },
    }),
  ],
})
export class MongooseConfigModule {}
