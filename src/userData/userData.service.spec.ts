import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { UserDataService } from './userData.service';
import { ResponseRo, UserDataRo } from 'src/helpers/types';
import { CreateUserDataDto } from './dto/userData.dto';
import { NotFoundException } from '@nestjs/common';

const prismaServiceMock = {
  userData: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('UserDataService', () => {
  let userDataService: UserDataService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDataService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    userDataService = module.get<UserDataService>(UserDataService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userDataService).toBeDefined();
  });

  describe('createUser', () => {
    it('should return statusCode 200', async () => {
      const expectedResult: ResponseRo = {
        statusCode: 200,
      };
      const request: CreateUserDataDto = {
        name: '',
        lastName: '',
        country: '',
        city: '',
        domesticNumber: '',
        iternationalCountry: '',
        iternationalNumber: '',
        facebookLink: '',
        instagramLink: '',
      };

      const req = {
        headers: {
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4',
        },
      } as unknown as Request;
      const imageFile = {
        buffer: Buffer.from('your-binary-data-here'),
        originalname: 'image.jpg',
      } as Express.Multer.File;

      const findUniqueUserDataMock = {
        userId: 1,
        image: 'image',
      };

      const createUserDataMock = {
        name: '',
        lastName: '',
        country: '',
        city: '',
        domesticNumber: '',
        iternationalCountry: '',
        iternationalNumber: '',
        facebookLink: '',
        instagramLink: '',
        image: 'image',
      };

      prismaServiceMock.userData.findUnique.mockResolvedValue(
        findUniqueUserDataMock,
      );
      prismaServiceMock.userData.create.mockResolvedValue(createUserDataMock);

      const result = await userDataService.createUserData(
        request,
        req,
        imageFile,
      );

      expect(result).toEqual(expectedResult);
    });

    it('should return NotFoundException if user is not found', async () => {
      prismaServiceMock.userData.findUnique.mockResolvedValue(null);

      await expect(
        userDataService.createUserData(null, null, null),
      ).rejects.toThrowError(new NotFoundException('User not found'));
    });
  });

  describe('getUserData', () => {
    it('should return statusCode 200', async () => {
      const expectedResult: UserDataRo = {
        id: 1,
        name: 'name',
        lastName: 'lastName',
        email: 'email',
      };

      const findFirstUserDataMock = {
        id: 1,
        name: 'name',
        user: {
          email: 'email',
        },
        lastName: 'lastName',
      };

      prismaServiceMock.userData.findFirst.mockResolvedValue(
        findFirstUserDataMock,
      );

      const result = await userDataService.getUserData();

      expect(result).toEqual(expectedResult);
    });
  });
});
