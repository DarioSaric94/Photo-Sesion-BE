import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { YoutubeLinksService } from './youtubeLinks.service';
import { YoutubeLinksController } from './youtubeLinks.controller';

@Module({
  providers: [PrismaService, YoutubeLinksService],
  controllers: [YoutubeLinksController],
})
export class YoutubeLinksModule {}
