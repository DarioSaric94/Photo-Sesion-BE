import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getUserIdAndTokenFromRequest } from '../helpers/utils/getUserIdAndTokenFromRequest';

@Injectable()
export class YoutubeLinksService {
  constructor(private prisma: PrismaService) {}

  async createYoutubeLinks(data: any, req: Request) {
    try {
      const { youtubeLink1, youtubeLink2, youtubeLink3 } = data;
      const { userId } = await getUserIdAndTokenFromRequest(req);
      await this.prisma.youtubeLinks.upsert({
        where: { userId: userId },
        update: {
          youtubeLink1,
          youtubeLink2,
          youtubeLink3,
        },
        create: {
          youtubeLink1,
          youtubeLink2,
          youtubeLink3,
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
      return await this.prisma.youtubeLinks.findFirst();
    } catch (error) {
      throw error;
    }
  }
}
