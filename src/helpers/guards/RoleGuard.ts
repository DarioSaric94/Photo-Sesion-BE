import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly prismaService: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const roles = this.reflector.getAllAndOverride<number[]>('roles', [
      context.getHandler(),
      context.getClass,
    ]);

    if (!roles) {
      return false;
    }

    const token = request.headers.authorization?.replace('Bearer ', '');

    const decoded = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload;

    const id = decoded.userId;

    const user = await this.prismaService.user.findUnique({
      where: { id: id },
    });

    if (user) {
      const userRoles = [user.role];

      return roles.some((role) => userRoles.includes(role));
    }

    return false;
  }
}
