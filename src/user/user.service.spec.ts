import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UserService } from './user.service';
import {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
} from './dto/create-user.dto,';
import { ResponseRo, UserRo } from '../../src/helpers/types';
import { generateToken } from '../../src/helpers/utils/generateToken';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

const prismaServiceMock = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  token: {
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UserService', () => {
  let userService: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should return statusCode 201 and user', async () => {
      const expectedResult: UserRo = {
        userData: {
          id: 1,
          email: 'email',
          createdAt: undefined,
          role: 2,
          token: generateToken(1),
        },
        statusCode: 201,
        message: 'Account created successfuly',
      };
      const createUserMock = {
        id: 1,
        email: 'email',
        password: 'password',
        createdAt: undefined,
        role: 2,
        token: 'asdasd',
      };

      const createUser: RegisterUserDto = {
        email: 'email',
        password: 'password',
      };

      const createToken = {
        token: 'asdasd',
        id: 1,
      };

      prismaServiceMock.user.create.mockResolvedValue(createUserMock);
      prismaServiceMock.token.create.mockResolvedValue(createToken);

      const result = await userService.createUser(createUser);

      expect(result).toEqual(expectedResult);
    });

    it('should return BadReqestException if user with same email exists', async () => {
      const createUser: RegisterUserDto = {
        email: 'email',
        password: 'password',
      };

      prismaServiceMock.user.findFirst.mockResolvedValue(createUser);

      await expect(userService.createUser(createUser)).rejects.toThrowError(
        new BadRequestException('User with same email already exists'),
      );
    });
  });

  describe('loginUser', () => {
    it('should return statusCode 200, message and user', async () => {
      const expectedResult: UserRo = {
        userData: {
          id: 1,
          email: 'email',
          createdAt: undefined,
          role: 2,
          token: generateToken(1),
        },
        statusCode: 200,
        message: 'Loged in successfuly',
      };
      const findUniqueUserMock = {
        id: 1,
        password: await bcrypt.hash('password', 10),
        createdAt: undefined,
        email: 'email',
        role: 2,
        token: 'asdasd',
      };

      const loginUser: LoginUserDto = {
        email: 'email',
        password: 'password',
      };

      const createToken = {
        token: generateToken(1),
        id: 1,
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(findUniqueUserMock);
      prismaServiceMock.token.update.mockResolvedValue(createToken);

      const result = await userService.loginUser(loginUser);

      expect(result).toEqual(expectedResult);
    });

    it('should return NotFoundException if user with same email exists', async () => {
      const loginUser: LoginUserDto = {
        email: 'email',
        password: 'password',
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(userService.loginUser(loginUser)).rejects.toThrowError(
        new NotFoundException(
          `User with ${loginUser.email} email does not exists`,
        ),
      );
    });

    it('should return BadReqestException if password is wrong', async () => {
      const loginUser: LoginUserDto = {
        email: 'email',
        password: 'password',
      };

      const findUniqueUserMock = {
        id: 1,
        password: 'password',
        createdAt: undefined,
        email: 'email',
        role: 2,
        token: 'asdasd',
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(findUniqueUserMock);

      await expect(userService.loginUser(loginUser)).rejects.toThrowError(
        new BadRequestException(`Wrong password`),
      );
    });
  });

  describe('getUserByToken', () => {
    it('should return user', async () => {
      const expectedResult: UserRo = {
        userData: {
          id: 1,
          email: 'email',
          createdAt: undefined,
          role: 2,
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4',
        },
      };

      const findUniqueUserMock = {
        id: 1,
        password: 'password',
        createdAt: undefined,
        email: 'email',
        role: 2,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4',
      };

      const req = {
        headers: {
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4',
        },
      } as unknown as Request;

      prismaServiceMock.user.findUnique.mockResolvedValue(findUniqueUserMock);

      const result = await userService.getUserByToken(req);

      expect(result).toEqual(expectedResult);
    });

    it('should return NotFoundException if user is not found', async () => {
      const req = {
        headers: {
          authorization: 'Bearer token',
        },
      } as unknown as Request;

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserByToken(req)).rejects.toThrowError(
        new NotFoundException(`User with ${null} does not exists`),
      );
    });
  });

  describe('resetPassword', () => {
    it('should return statusCode 200 and message', async () => {
      const request: ResetPasswordDto = {
        email: 'stalaric94@gmail.com',
      };

      const expectedResult: ResponseRo = {
        statusCode: 200,
        message: `Email confirmation has been sent to ${request.email}`,
      };

      const findUniqueUserMock = {
        id: 1,
        password: 'password',
        createdAt: undefined,
        email: 'email',
        role: 2,
        token: 'token',
      };

      const updateTokenMock = {
        userId: 1,
        resetToken: 'token',
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(findUniqueUserMock);
      prismaServiceMock.token.update.mockResolvedValue(updateTokenMock);

      const result = await userService.resetPassword(request);

      expect(result).toEqual(expectedResult);
    });

    it('should return NotFoundException if user is not found', async () => {
      const request: ResetPasswordDto = {
        email: 'stalaric94@gmail.com',
      };

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(userService.resetPassword(request)).rejects.toThrowError(
        new NotFoundException(`User with ${request.email} not exists`),
      );
    });
  });

  describe('changePassword', () => {
    it('should return statusCode 201, userData and message', async () => {
      const token: string =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4';

      const expectedResult: UserRo = {
        userData: {
          id: 1,
          email: 'email',
          createdAt: undefined,
          role: 2,
          token: generateToken(1),
        },
        statusCode: 201,
        message: 'Password changed successfuly',
      };
      const request: ChangePasswordDto = {
        password: 'password',
      };

      const findFirstUserMock = {
        id: 1,
      };

      const updateUserMock = {
        id: 1,
        createdAt: undefined,
        token: generateToken(1),
        password: await bcrypt.hash('password', 10),
        email: 'email',
        role: 2,
      };

      prismaServiceMock.user.findFirst.mockResolvedValue(findFirstUserMock);
      prismaServiceMock.user.update.mockResolvedValue(updateUserMock);

      const result = await userService.changePassword(token, request);

      expect(result).toEqual(expectedResult);
    });

    it('should return NotFoundException if user is not found', async () => {
      const token: string =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4';
      const request: ChangePasswordDto = {
        password: 'password',
      };

      prismaServiceMock.user.findFirst.mockResolvedValue(null);

      await expect(
        userService.changePassword(token, request),
      ).rejects.toThrowError(new NotFoundException(`User does not exists`));
    });

    it('should throw UnauthorizedException when the token is expired', async () => {
      const expiredToken: string =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTY4MjA2MiwiZXhwIjoxNjk1NjgyMzYyfQ.l7utvvF8q0uk36dfrPOVrtwlQEISJRAXHSNfHJR6cBs';
      const request: ChangePasswordDto = {
        password: 'password',
      };

      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new jwt.TokenExpiredError('Token expired', new Date());
      });

      await expect(
        userService.changePassword(expiredToken, request),
      ).rejects.toThrowError(
        new UnauthorizedException(
          'Oops! It seems that the password reset link has expired. Please request a new link to reset your password.',
        ),
      );

      jest.restoreAllMocks();
    });
  });
});
