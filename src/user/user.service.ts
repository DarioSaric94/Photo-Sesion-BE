import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
  UpdateAdminDataDto,
} from './dto/create-user.dto,';
import { UserDataRo } from './interface/user.interface';
import { TokenExpiredError } from 'jsonwebtoken';
import { generateToken } from '../helpers/utils/generateToken';
import { join } from 'path';
import { createWriteStream, unlink } from 'fs-extra';
import { getUserIdAndTokenFromRequest } from '../helpers/utils/getUserIdAndTokenFromRequest';
import { ResponseRo } from 'src/helpers/types';

@Injectable()
export class UserService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {}

  async createUser(data: RegisterUserDto): Promise<UserDataRo> {
    try {
      const { email, password } = data;
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: {
            contains: email,
            mode: 'insensitive',
          },
        },
      });

      if (existingUser) {
        throw new BadRequestException('Korisnim sa tim emailom već postoji');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const token = generateToken(user.id);

      await this.prisma.token.create({
        data: {
          token,
          user: {
            connect: { id: user.id },
          },
        },
      });

      const { password: _, ...userData } = user;

      return {
        statusCode: 201,
        userData: { ...userData, token },
        message: 'Nalog je uspješno kreiran',
      };
    } catch (error) {
      throw error;
    }
  }

  async loginUser(data: LoginUserDto): Promise<UserDataRo> {
    try {
      const { email, password } = data;

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new NotFoundException(`Korisnik sa $${email} emailom ne postoji`);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Pogrešna lozinka');
      }

      const token = generateToken(user.id);

      await this.prisma.token.update({
        where: { userId: user.id },
        data: {
          token,
        },
      });

      const { password: _, ...userData } = user;

      return {
        statusCode: 200,
        userData: { ...userData, token },
        message: 'Uspješno ste ulogovani',
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserByToken(req: any): Promise<UserDataRo> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY,
      ) as jwt.JwtPayload;
      const userId = decoded?.userId;

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const { password: _, ...userData } = user;

      return {
        userData: { ...userData, token },
      };
    } catch (error) {
      throw error;
    }
  }

  async resetPassword(body: ResetPasswordDto): Promise<ResponseRo> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        throw new NotFoundException('Korisnik ne postoji');
      }
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: '5m',
      });

      const tokenData = await this.prisma.token.update({
        where: { userId: user.id },
        data: {
          resetToken: token,
        },
      });

      nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const resetPasswordLink = `${process.env.APP_URL}auth/change-password?token=${tokenData.resetToken}`;
      const emailContent = `<div>Click the following link to reset your password: ${resetPasswordLink}<div>`;

      await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: body.email,
        subject: 'Password Reset',
        html: emailContent,
      });

      return {
        statusCode: 200,
        message: `Potvrda na email ${body.email}  je poslana`,
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    token: string,
    body: ChangePasswordDto,
  ): Promise<UserDataRo> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY,
      ) as jwt.JwtPayload;

      const user = await this.prisma.user.findFirst({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new NotFoundException('Korisnik ne postoji');
      }

      const newToken = generateToken(user.id);

      const hashedPassword = await bcrypt.hash(body.password, 10);
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
      await this.prisma.token.update({
        where: { userId: user.id },
        data: {
          token: newToken,
        },
      });

      const { password, ...userData } = updatedUser;

      return {
        statusCode: 201,
        userData: { ...userData, token: newToken },
        message: 'Lozinka je promjenjena',
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Ups! Izgleda da je link za ponovno postavljanje lozinke istekao. Molimo zatražite novi link kako biste resetovali svoju lozinku',
        );
      }
      throw error;
    }
  }
}
