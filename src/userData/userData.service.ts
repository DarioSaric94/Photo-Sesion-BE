import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { join } from 'path';
import { createWriteStream, unlink } from 'fs-extra';
import { ResponseRo, UserDataRo } from 'src/helpers/types';
import { getUserIdAndTokenFromRequest } from '../../src/helpers/utils/getUserIdAndTokenFromRequest';
import { CreateUserDataDto } from './dto/userData.dto';

@Injectable()
export class UserDataService {
  constructor(private prisma: PrismaService) {}

  async createUserData(
    data: CreateUserDataDto,
    req: Request,
    imageFile: Express.Multer.File,
  ): Promise<ResponseRo> {
    try {
      const { userId } = await getUserIdAndTokenFromRequest(req);

      if (!userId) {
        throw new NotFoundException('User not found');
      }
      const existingUserData = await this.prisma.userData.findUnique({
        where: { userId },
      });

      if (existingUserData?.image && imageFile) {
        try {
          const imagePath = join(
            existingUserData.image.replace(process.env.APP_URL, ''),
          );
          await unlink(imagePath);
        } catch (error) {
          console.log(error);
        }
      }

      const imageName = imageFile && `${Date.now()}-${imageFile.originalname}`;
      const imagePath =
        imageFile && join(process.env.IMAGE_DIR_LOCATION, imageName);
      const imageUrl =
        imageFile &&
        `${process.env.APP_URL}${process.env.IMAGE_DIR_LOCATION}/${imageName}`;

      if (imageFile) {
        const writeStream = createWriteStream(imagePath);
        writeStream.write(imageFile.buffer);
        writeStream.end();
      }

      if (existingUserData) {
        await this.prisma.userData.update({
          where: { userId },
          data: {
            name: data.name,
            lastName: data.lastName,
            country: data.country,
            city: data.city,
            domesticNumber: data.domesticNumber,
            iternationalCountry: data.iternationalCountry,
            iternationalNumber: data.iternationalNumber,
            facebookLink: data.facebookLink,
            instagramLink: data.instagramLink,
            image: imageFile && imageUrl,
          },
        });
        return { statusCode: 200 };
      } else {
        await this.prisma.userData.create({
          data: {
            name: data.name,
            lastName: data.lastName,
            country: data.country,
            city: data.city,
            domesticNumber: data.domesticNumber,
            iternationalCountry: data.iternationalCountry,
            iternationalNumber: data.iternationalNumber,
            facebookLink: data.facebookLink,
            instagramLink: data.instagramLink,
            image: imageUrl,
            userId,
          },
        });

        return { statusCode: 200 };
      }
    } catch (error) {
      throw error;
    }
  }

  async getUserData(): Promise<UserDataRo> {
    try {
      const data = await this.prisma.userData.findFirst({
        include: { user: { select: { email: true } } },
      });
      if (!data) {
        return null;
      }

      const { user, ...userData } = data;
      return { ...userData, email: user.email };
    } catch (error) {
      throw error;
    }
  }
}
