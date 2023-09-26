import { Test, TestingModule } from '@nestjs/testing';
import { UserDataController } from './userData.controller';
import { UserDataService } from './userData.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ResponseRo, UserDataRo } from 'src/helpers/types';
import { CreateUserDataDto } from './dto/userData.dto';

describe('UserDataController', () => {
  let controller: UserDataController;
  let service: UserDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDataController],
      providers: [PrismaService, UserDataService],
    }).compile();

    controller = module.get<UserDataController>(UserDataController);
    service = module.get<UserDataService>(UserDataService);
  });

  describe('createUserData', () => {
    it('should return statusCode: 200', async () => {
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
          authorization: 'Beared asdasd',
        },
      } as unknown as Request;
      const imageFile = {} as Express.Multer.File;

      jest.spyOn(service, 'createUserData').mockResolvedValue(expectedResult);

      const result = await controller.createUserData(request, req, imageFile);

      expect(result).toEqual(expectedResult);
      expect(service.createUserData).toHaveBeenCalledWith(
        request,
        req,
        imageFile,
      );
    });
  });

  describe('getUserData', () => {
    it('should return statusCode: 200', async () => {
      const expectedResult: UserDataRo = {
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

      jest.spyOn(service, 'getUserData').mockResolvedValue(expectedResult);

      const result = await controller.getUserData();

      expect(result).toEqual(expectedResult);
      expect(service.getUserData).toHaveBeenCalledWith();
    });
  });
});
