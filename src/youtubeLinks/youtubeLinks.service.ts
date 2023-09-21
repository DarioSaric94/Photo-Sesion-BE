import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getUserIdAndTokenFromRequest } from '../helpers/utils/getUserIdAndTokenFromRequest';
import { CreateYoutubeLinkDto } from './dto/youtubeLinks.dto';
import { ResponseRo, YoutubeLinksRo } from 'src/helpers/types';

@Injectable()
export class YoutubeLinksService {
  constructor(private prisma: PrismaService) {}

  async createYoutubeLinks(
    data: CreateYoutubeLinkDto,
    req: Request,
  ): Promise<ResponseRo> {
    try {
      const { youtubeLink1, youtubeLink2, youtubeLink3, albumId } = data;
      const { userId } = await getUserIdAndTokenFromRequest(req);
      await this.prisma.youtubeLinks.upsert({
        where: { userId: userId },
        update: {
          youtubeLink1,
          youtubeLink2,
          youtubeLink3,
          albumId: albumId,
        },
        create: {
          youtubeLink1,
          youtubeLink2,
          youtubeLink3,
          albumId: albumId,
          userId: userId,
        },
      });
      return { statusCode: 200 };
    } catch (error) {
      throw error;
    }
  }

  async getYoutubeLinks(): Promise<YoutubeLinksRo> {
    try {
      const youtubeLinks = await this.prisma.youtubeLinks.findFirst();
      const albumsData = await this.prisma.albumSesion.findMany({
        select: {
          participants: true,
          id: true,
        },
      });
      const album = await this.prisma.albumSesion.findUnique({
        where: { id: youtubeLinks.albumId },
        include: {
          images: {
            take: 60,
          },
        },
      });
      return { youtubeLinks, albumsData, album };
    } catch (error) {
      throw error;
    }
  }
}
