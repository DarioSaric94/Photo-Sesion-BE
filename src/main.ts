import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from 'prisma/prisma.service';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prismaService: PrismaService = app.get(PrismaService);

  app.use('/images', express.static('images'));

  await prismaService.$connect();

  await app.listen(3000);
}
bootstrap();
