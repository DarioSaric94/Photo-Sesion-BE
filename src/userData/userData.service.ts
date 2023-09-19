import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { join } from 'path';
import { createWriteStream, unlink } from 'fs-extra';

import { TokenExpiredError } from 'jsonwebtoken';
import { generateToken } from '../helpers/utils/generateToken';
import { ResponseRo } from 'src/helpers/types';
import { getUserIdAndTokenFromRequest } from '../../src/helpers/utils/getUserIdAndTokenFromRequest';

@Injectable()
export class UserDataService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {}

  async createUserData(
    data: any,
    req: Request,
    imageFile: Express.Multer.File,
  ) {
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
        const userData = await this.prisma.userData.update({
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
        return { statusCode: 200, userData };
      } else {
        const userData = await this.prisma.userData.create({
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

        return { statusCode: 200, userData };
      }
    } catch (error) {
      throw error;
    }
  }

  async getUserData() {
    try {
      const userData = await this.prisma.userData.findFirst({
        include: { user: { select: { email: true } } },
      });
      if (!userData) {
        return null;
      }
      return { ...userData, email: userData.user.email };
    } catch (error) {
      throw error;
    }
  }
}
