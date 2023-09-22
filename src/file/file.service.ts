import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs-extra';
import { join } from 'path';
import * as archiver from 'archiver';
import { FileDto } from './dto/file.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { generateToken } from '../../src/helpers/utils/generateToken';
import { GetImageFileRo } from 'src/helpers/types';

@Injectable()
export class FileService {
  constructor(private prisma: PrismaService) {}

  async getImageFile(data: FileDto): Promise<GetImageFileRo> {
    try {
      const albumData = await this.prisma.albumSesion.findUnique({
        where: { id: data.albumId },
      });

      if (!albumData) {
        throw new NotFoundException('Album does not exists');
      }

      if (albumData.albumPassword !== data.albumPassword) {
        throw new BadRequestException('Wrong Password');
      }

      const sessionToken = generateToken(data.albumId);

      await this.prisma.albumSessionToken.create({
        data: {
          albumSessionId: data.albumId,
          sessionToken,
        },
      });

      return { statusCode: 200, url: data.albumPath, sessionToken };
    } catch (error) {
      throw error;
    }
  }

  async unlockedImageFile(
    albumPath: string,
    res: Response,
    sessionToken: string,
    albumId: number,
  ): Promise<void> {
    try {
      const albumHasValidToken = await this.prisma.albumSessionToken.findFirst({
        where: {
          sessionToken: sessionToken,
          albumSessionId: albumId,
        },
      });

      if (!albumHasValidToken) {
        throw new NotFoundException('No tokens found');
      } else {
        await this.prisma.albumSessionToken.delete({
          where: {
            id: albumHasValidToken.id,
          },
        });
      }

      const folderPath = join(process.cwd(), 'images', albumPath);

      const archive = archiver('zip', {
        zlib: { level: 0 },
      });

      res.set({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${albumPath}.zip"`,
      });

      const files = await fs.promises.readdir(folderPath);

      if (!files || files.length === 0) {
        throw new NotFoundException('No files found in the folder');
      }

      for (const file of files) {
        const filePath = join(folderPath, file);

        archive.file(filePath, { name: file });
      }
      archive.pipe(res);

      archive.finalize();
    } catch (error) {
      throw error;
    }
  }
}
