import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getUserIdAndTokenFromRequest } from '../helpers/utils/getUserIdAndTokenFromRequest';

@Injectable()
export class YoutubeLinksService {
  constructor(private prisma: PrismaService) {}

  async createYoutubeLinks(data: any, req: Request) {
    try {
      const { youtubeLink1, youtubeLink2, youtubeLink3, albumId } = data;
      const { userId } = await getUserIdAndTokenFromRequest(req);
      await this.prisma.youtubeLinks.upsert({
        where: { userId: userId },
        update: {
          youtubeLink1,
          youtubeLink2,
          youtubeLink3,
          albumId,
        },
        create: {
          youtubeLink1,
          youtubeLink2,
          youtubeLink3,
          albumId,
          userId: userId,
        },
      });
      return { statusCode: 200 };
    } catch (error) {
      throw error;
    }
  }

  async getYoutubeLinks() {
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
          images: true,
        },
      });
      return { youtubeLinks, albumsData, album };
    } catch (error) {
      throw error;
    }
  }
}
