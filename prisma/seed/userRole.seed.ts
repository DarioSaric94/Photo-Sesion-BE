/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma.service';

@Injectable()
export class UserRoleSeed {
  constructor(private prisma: PrismaService) {}

  async seed() {
    try {
      await this.prisma.role.createMany({
        data: [{ type: 'admin' }, { type: 'user' }],
      });
      console.log('Roles Created');
    } catch (error) {
      console.log(error);
    }
  }
}
