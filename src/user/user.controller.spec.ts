import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ChangePasswordDto, RegisterUserDto } from './dto/create-user.dto,';
import { ResponseRo, UserRo } from '../../src/helpers/types';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [PrismaService, UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create new user', async () => {
      const expectedResult: UserRo = {
        userData: {
          id: 0,
          email: 'email',
          createdAt: undefined,
          role: 0,
          token: '',
        },
        statusCode: 201,
        message: 'Account created successfuly',
      };
      const createUser: RegisterUserDto = {
        email: 'email',
        password: 'password',
      };

      jest.spyOn(service, 'createUser').mockResolvedValue(expectedResult);

      const result = await controller.createUser(createUser);

      expect(result).toEqual(expectedResult);
      expect(service.createUser).toHaveBeenCalledWith(createUser);
    });
  });

  describe('loginUser', () => {
    it('should login user', async () => {
      const expectedResult: UserRo = {
        userData: {
          id: 0,
          email: 'email',
          createdAt: undefined,
          role: 0,
          token: '',
        },
        statusCode: 200,
        message: 'Loged in successfuly',
      };

      const loginUser: RegisterUserDto = {
        email: 'email',
        password: 'password',
      };

      jest.spyOn(service, 'loginUser').mockResolvedValue(expectedResult);

      const result = await controller.loginUser(loginUser);

      expect(result).toEqual(expectedResult);
      expect(service.loginUser).toHaveBeenCalledWith(loginUser);
    });
  });

  describe('getUserByToken', () => {
    it('should return user', async () => {
      const expectedResult: UserRo = {
        userData: {
          id: 0,
          email: 'email',
          createdAt: undefined,
          role: 0,
          token: '',
        },
        statusCode: 200,
        message: 'Loged in successfuly',
      };

      const req = {
        headers: {
          authorization: 'Beared asdasd',
        },
      } as unknown as Request;

      jest.spyOn(service, 'getUserByToken').mockResolvedValue(expectedResult);

      const result = await controller.getUserByToken(req);

      expect(result).toEqual(expectedResult);
      expect(service.getUserByToken).toHaveBeenCalledWith(req);
    });
  });

  describe('resetPassword', () => {
    it('should return statusCode 200 and message', async () => {
      const request = {
        email: 'email',
      };

      const expectedResult: ResponseRo = {
        statusCode: 200,
        message: `Email confirmation has been sent to "${request.email}"`,
      };

      jest.spyOn(service, 'resetPassword').mockResolvedValue(expectedResult);

      const result = await controller.resetPassword(request);

      expect(result).toEqual(expectedResult);
      expect(service.resetPassword).toHaveBeenCalledWith(request);
    });
  });

  describe('changePassword', () => {
    it('should return statusCode 201 and message and userData', async () => {
      const token = 'token';
      const request: ChangePasswordDto = {
        password: 'password',
      };

      const expectedResult: UserRo = {
        statusCode: 201,
        message: 'Password changed successfuly',
        userData: {
          id: 1,
          email: 'email',
          createdAt: undefined,
          role: 2,
          token: 'token',
        },
      };

      jest.spyOn(service, 'changePassword').mockResolvedValue(expectedResult);

      const result = await controller.changePassword(token, request);

      expect(result).toEqual(expectedResult);
      expect(service.changePassword).toHaveBeenCalledWith(token, request);
    });
  });
});
