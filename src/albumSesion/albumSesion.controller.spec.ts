import { Test, TestingModule } from '@nestjs/testing';
import { AlbumSesionController } from './albumSesion.controller';
import { AlbumSesionService } from './albumSesion.service';
import {
  CreateAlbumSesionDto,
  DeleteAlbumSesionDto,
  GetPrivateAlbumDto,
} from './dto/albumSesion.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { AlbumSesionRo, PrivateAlbumSesionRo } from 'src/helpers/types';
import { JwtAuthGuard } from '../../src/helpers/guards/RoleGuard';
import { NotFoundException } from '@nestjs/common';

describe('AlbumSesionController', () => {
  let controller: AlbumSesionController;
  let service: AlbumSesionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlbumSesionController],
      providers: [PrismaService, AlbumSesionService],
    }).compile();

    controller = module.get<AlbumSesionController>(AlbumSesionController);
    service = module.get<AlbumSesionService>(AlbumSesionService);
  });

  describe('createAlbumSesion', () => {
    it('should create a new album session', async () => {
      const createAlbum: CreateAlbumSesionDto = {
        albumName: 'Test Album',
        participants: 'Test Participants',
        albumPassword: 'TestPassword123',
        trailerVideo: 'Test Trailer Video',
        mainVideo: 'Test Main Video',
      };
      const req = {} as Request;
      const imageFile = [] as Express.Multer.File[];

      const expectedResult = { statusCode: 200 };

      jest
        .spyOn(service, 'createAlbumSesion')
        .mockResolvedValue(expectedResult);

      const result = await controller.createAlbumSesion(
        createAlbum,
        req,
        imageFile,
      );

      expect(result).toEqual(expectedResult);
      expect(service.createAlbumSesion).toHaveBeenCalledWith(
        createAlbum,
        req,
        imageFile,
      );
    });
  });

  describe('getAlbumSesions', () => {
    it('should return album sessions', async () => {
      const expectedResult: AlbumSesionRo[] = [
        {
          id: 1,
          albumName: 'Album 1',
          participants: 'Participants 1',
          mainVideo: 'Main Video 1',
          trailerVideo: 'Trailer Video 1',
          userId: 1,
          images: [],
        },
      ];

      jest.spyOn(service, 'getAlbumSesions').mockResolvedValue(expectedResult);

      const result = await controller.getAlbumSesions();

      expect(result).toEqual(expectedResult);
      expect(service.getAlbumSesions).toHaveBeenCalledWith();
    });
  });

  describe('deleteAlbumSesion', () => {
    it('should delete album session', async () => {
      const deleteAlbum: DeleteAlbumSesionDto = {
        albumId: 1,
        password: 'password',
      };
      const req = {} as Request;

      const expectedResult = { statusCode: 204 };

      jest
        .spyOn(service, 'deleteAlbumSesion')
        .mockResolvedValue(expectedResult);

      const result = await controller.deleteAlbumSesion(deleteAlbum, req);

      expect(result).toEqual(expectedResult);
      expect(service.deleteAlbumSesion).toHaveBeenCalledWith(deleteAlbum, req);
    });
  });

  describe('getPrivateAlbum', () => {
    it('should return private album', async () => {
      const privateAlbumData: GetPrivateAlbumDto = {
        id: '1',
        password: '123123',
      };

      const expectedResult: PrivateAlbumSesionRo = {
        album: {
          id: 1,
          albumName: 'albumName',
          participants: 'participants',
          mainVideo: 'mainVideo',
          trailerVideo: 'trailerVideo',
          userId: 2,
          images: [],
        },
      };

      jest.spyOn(service, 'getPrivateAlbum').mockResolvedValue(expectedResult);

      const result = await controller.getPrivateAlbum(privateAlbumData);

      expect(result).toEqual(expectedResult);
      expect(service.getPrivateAlbum).toHaveBeenCalledWith(privateAlbumData);
    });
  });

  describe('getAlbumByIdByAdmin', () => {
    it('should return an album by ID for admin', async () => {
      const albumId = 1;
      const req = {} as Request;

      const expectedResult: PrivateAlbumSesionRo = {
        album: {
          id: albumId,
          albumName: 'albumName',
          participants: 'participants',
          mainVideo: 'mainVideo',
          trailerVideo: 'trailerVideo',
          userId: 123,
          images: [],
        },
      };

      jest
        .spyOn(service, 'getAlbumByIdByAdmin')
        .mockResolvedValue(expectedResult);

      jest.spyOn(JwtAuthGuard.prototype, 'canActivate').mockResolvedValue(true);

      const result = await controller.getAlbumByIdByAdmin(req, albumId);

      expect(result).toEqual(expectedResult);
      expect(service.getAlbumByIdByAdmin).toHaveBeenCalledWith(req, albumId);
    });

    it('should deny access for non-admin users', async () => {
      const albumId = 1;
      const req = {} as Request;

      jest
        .spyOn(JwtAuthGuard.prototype, 'canActivate')
        .mockResolvedValue(false);

      expect(async () => {
        await controller.getAlbumByIdByAdmin(req, albumId);
      }).rejects.toThrowError(new NotFoundException('User does not exist'));
    });
  });
});
