import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as cors from 'cors';
import { UserRoleSeed } from '../prisma/seed/userRole.seed';
import { UserModule } from './user/user.module';
import { UserDataModule } from './userData/userData.module';

@Module({
  imports: [UserModule, UserDataModule],
  providers: [PrismaService, UserRoleSeed],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cors({ origin: '*' })).forRoutes('*');
  }
}
