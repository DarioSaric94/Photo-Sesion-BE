import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AlbumSesionService } from './albumSesion.service';
import { AlbumSesionController } from './albumSesion.controller';

@Module({
  providers: [PrismaService, AlbumSesionService],
  controllers: [AlbumSesionController],
})
export class AlbumSesionModule {}
