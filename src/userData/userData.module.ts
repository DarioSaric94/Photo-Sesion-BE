import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDataService } from './userData.service';
import { UserDataController } from './userData.controller';

@Module({
  providers: [PrismaService, UserDataService],
  controllers: [UserDataController],
})
export class UserDataModule {}
