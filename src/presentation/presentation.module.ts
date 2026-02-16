import { ApplicationModule } from '@/application/application.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from '@/presentation/controllers/auth.controller';
import { UserController } from '@/presentation/controllers/user.controller';

@Module({
  imports: [CqrsModule, ApplicationModule],
  controllers: [AuthController, UserController],
})
export class PresentationModule {}
