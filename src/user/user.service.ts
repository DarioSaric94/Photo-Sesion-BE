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
} from './dto/create-user.dto,';
import { TokenExpiredError } from 'jsonwebtoken';
import { generateToken } from '../helpers/utils/generateToken';
import { ResponseRo, UserRo } from '../../src/helpers/types';
import { getUserIdAndTokenFromRequest } from '../../src/helpers/utils/getUserIdAndTokenFromRequest';

@Injectable()
export class UserService {
  private transporter: nodemailer.Transporter;

  constructor(private prisma: PrismaService) {}

  async createUser(data: RegisterUserDto): Promise<UserRo> {
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
        throw new BadRequestException('User with same email already exists');
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
        message: 'Account created successfuly',
      };
    } catch (error) {
      throw error;
    }
  }

  async loginUser(data: LoginUserDto): Promise<UserRo> {
    try {
      const { email, password } = data;

      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { userData: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ${email} email does not exists`);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Wrong password');
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
        message: 'Loged in successfuly',
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserByToken(req: Request): Promise<UserRo> {
    try {
      const { userId, token } = await getUserIdAndTokenFromRequest(req);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ${userId} does not exists`);
      }

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
        throw new NotFoundException(`User with ${body.email} not exists`);
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

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const resetPasswordLink = `${process.env.APP_URL}auth/change-password?token=${tokenData.resetToken}`;
      const emailContent = `<div>Click the following link to reset your password: ${resetPasswordLink}<div>`;

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: body.email,
        subject: 'Password Reset',
        html: emailContent,
      });

      return {
        statusCode: 200,
        message: `Email confirmation has been sent to ${body.email}`,
      };
    } catch (error) {
      throw error;
    }
  }

  async changePassword(
    token: string,
    body: ChangePasswordDto,
  ): Promise<UserRo> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.SECRET_KEY,
      ) as jwt.JwtPayload;

      const user = await this.prisma.user.findFirst({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new NotFoundException('User does not exists');
      }

      const newToken = generateToken(user.id);

      const hashedPassword = await bcrypt.hash(body.password, 10);
      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
        include: { userData: true },
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
        message: 'Password changed successfuly',
      };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Oops! It seems that the password reset link has expired. Please request a new link to reset your password.',
        );
      }
      throw error;
    }
  }
}
