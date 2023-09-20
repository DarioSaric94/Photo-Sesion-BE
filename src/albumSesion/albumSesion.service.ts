import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getUserIdAndTokenFromRequest } from '../helpers/utils/getUserIdAndTokenFromRequest';
import { createWriteStream, unlink, ensureDir, remove } from 'fs-extra';
import { join } from 'path';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AlbumSesionService {
  constructor(private prisma: PrismaService) {}

  async createAlbumSesion(
    data: any,
    req: Request,
    imageFile: Array<Express.Multer.File>,
  ) {
    try {
      const { userId } = await getUserIdAndTokenFromRequest(req);

      const participantFolderName = await data.participants
        .replace(/\s/g, '')
        .toLowerCase();

      const participantFolderPath = join(
        process.env.IMAGE_DIR_LOCATION,
        participantFolderName,
      );

      await ensureDir(participantFolderPath);

      const createAlbumSesion = await this.prisma.albumSesion.create({
        data: {
          albumName: data.albumName,
          participants: data.participants,
          albumPassword: data.albumPassword,
          userId,
        },
      });

      for (const file of imageFile) {
        const imageName = `${Date.now()}-${file.originalname}`;
        const imagePath = join(
          `${process.env.IMAGE_DIR_LOCATION}/${participantFolderName}`,
          imageName,
        );
        const imageUrl = `${process.env.APP_URL}${process.env.IMAGE_DIR_LOCATION}/${participantFolderName}/${imageName}`;

        const writeStream = createWriteStream(imagePath);
        writeStream.write(file.buffer);
        writeStream.end();

        await this.prisma.images.create({
          data: {
            image: imageUrl,
            albumSesion: { connect: { id: createAlbumSesion.id } },
          },
        });
      }
      return { statusCode: 201 };
    } catch (error) {
      throw error;
    }
  }

  async getAlbumSesions() {
    try {
      return await this.prisma.albumSesion.findMany({
        include: {
          images: {
            take: 1,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteAlbumSesion(data: any, req: Request) {
    try {
      const { albumId, password } = data;
      const { userId } = await getUserIdAndTokenFromRequest(req);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User does not exist`);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Wrong password');
      }

      const albumToDelete = await this.prisma.albumSesion.findUnique({
        where: { id: albumId },
        include: {
          images: true,
        },
      });

      if (!albumToDelete) {
        throw new NotFoundException('Album session not found');
      }

      // Get the folder path associated with the album session
      const participantFolderName = albumToDelete.participants
        .replace(/\s/g, '')
        .toLowerCase();
      const folderPath = join(
        process.env.IMAGE_DIR_LOCATION,
        participantFolderName,
      );

      // Delete the album session and its associated images from the database
      await this.prisma.albumSesion.delete({
        where: { id: albumId },
      });

      // Use fs-extra to remove the folder and its contents
      await remove(folderPath);

      return { statusCode: 204 };
    } catch (error) {
      throw error;
    }
  }
}
