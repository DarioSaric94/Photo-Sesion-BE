import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getUserIdAndTokenFromRequest } from '../helpers/utils/getUserIdAndTokenFromRequest';

@Injectable()
export class AlbumSesionService {
  constructor(private prisma: PrismaService) {}

  async createAlbumSesion(
    data: any,
    req: Request,
    imageFile: Express.Multer.File,
  ) {
    try {
      const { userId } = await getUserIdAndTokenFromRequest(req);

      console.log(imageFile);
    } catch (error) {
      throw error;
    }
  }
}
