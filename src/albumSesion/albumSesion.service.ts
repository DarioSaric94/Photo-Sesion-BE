import { PrismaService } from '../../prisma/prisma.service';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getUserIdAndTokenFromRequest } from '../helpers/utils/getUserIdAndTokenFromRequest';
import { createWriteStream, ensureDir, remove } from 'fs-extra';
import { join } from 'path';
import * as bcrypt from 'bcrypt';
import {
  CreateAlbumSesionDto,
  DeleteAlbumSesionDto,
  GetPrivateAlbumDto,
} from './dto/albumSesion.dto';
import { AlbumSesionRo, PrivateAlbumSesionRo } from '../../src/helpers/types';

@Injectable()
export class AlbumSesionService {
  constructor(private prisma: PrismaService) {}

  async createAlbumSesion(
    data: CreateAlbumSesionDto,
    req: Request,
    imageFile: Array<Express.Multer.File>,
  ): Promise<HttpStatus> {
    try {
      const { userId } = await getUserIdAndTokenFromRequest(req);

      const participantFolderName = data.participants
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
          trailerVideo: data.trailerVideo,
          mainVideo: data.mainVideo,
          albumPath: `${participantFolderName}`,
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
      return HttpStatus.CREATED;
    } catch (error) {
      throw error;
    }
  }

  async getAlbumSesions(): Promise<AlbumSesionRo[]> {
    try {
      const albumSesion = await this.prisma.albumSesion.findMany({
        select: {
          id: true,
          albumName: true,
          participants: true,
          mainVideo: true,
          trailerVideo: true,
          userId: true,
          albumPath: true,
          images: {
            take: 1,
          },
        },
      });

      if (!albumSesion) {
        return [];
      }

      return albumSesion;
    } catch (error) {
      throw error;
    }
  }

  async deleteAlbumSesion(
    data: DeleteAlbumSesionDto,
    req: Request,
  ): Promise<HttpStatus> {
    try {
      const { albumId, password } = data;
      const { userId } = await getUserIdAndTokenFromRequest(req);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User does not exist`);
      }

      if (!albumId) {
        throw new NotFoundException('Album session not found');
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

      const participantFolderName = albumToDelete.participants
        .replace(/\s/g, '')
        .toLowerCase();
      const folderPath = join(
        process.env.IMAGE_DIR_LOCATION,
        participantFolderName,
      );

      await this.prisma.albumSesion.delete({
        where: { id: albumId },
      });

      await remove(folderPath);

      return HttpStatus.NO_CONTENT;
    } catch (error) {
      throw error;
    }
  }

  async getPrivateAlbum(
    data: GetPrivateAlbumDto,
  ): Promise<PrivateAlbumSesionRo> {
    try {
      const { id, password } = data;

      const album = await this.prisma.albumSesion.findUnique({
        where: { id: Number(id) },
        include: {
          images: true,
        },
      });

      if (!album) {
        throw new NotFoundException('Album not found');
      }

      if (password !== album.albumPassword) {
        throw new BadRequestException('Wrong password');
      }

      return { status: HttpStatus.OK, album };
    } catch (error) {
      throw error;
    }
  }

  async getAlbumByIdByAdmin(
    req: Request,
    id: number,
  ): Promise<PrivateAlbumSesionRo> {
    try {
      const { userId } = await getUserIdAndTokenFromRequest(req);

      if (!userId) {
        throw new NotFoundException(`User does not exist`);
      }

      const album = await this.prisma.albumSesion.findUnique({
        where: {
          id,
        },
        include: {
          images: true,
        },
      });
      return { status: HttpStatus.OK, album };
    } catch (error) {
      throw error;
    }
  }
}
