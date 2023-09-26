import { Test, TestingModule } from '@nestjs/testing';
import { AlbumSesionService } from './albumSesion.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAlbumSesionDto,
  DeleteAlbumSesionDto,
  GetPrivateAlbumDto,
} from './dto/albumSesion.dto';
import { AlbumSesionRo, PrivateAlbumSesionRo } from '../../src/helpers/types';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
  promises: {
    readdir: jest.fn(),
  },
  ensureDir: jest.fn(),
  remove: jest.fn(),
}));

const prismaServiceMock = {
  albumSesion: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  albumSessionToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('AlbumSesionService', () => {
  let albumSesionService: AlbumSesionService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlbumSesionService,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    albumSesionService = module.get<AlbumSesionService>(AlbumSesionService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(albumSesionService).toBeDefined();
  });

  describe('createAlbumSesion', () => {
    it('should return statusCode 201', async () => {
      const createAlbumData: CreateAlbumSesionDto = {
        albumName: 'albumName',
        participants: 'participants',
        albumPassword: 'albumPassword',
        trailerVideo: 'trailerVideo',
        mainVideo: 'mainVideo',
      };

      const req = {} as Request;
      const imageFile: Array<Express.Multer.File> = [];

      prismaServiceMock.albumSesion.create.mockResolvedValue(createAlbumData);

      const result = await albumSesionService.createAlbumSesion(
        createAlbumData,
        req,
        imageFile,
      );

      expect(result.statusCode).toBe(201);
    });
  });

  describe('getAlbumSesions', () => {
    it('should return an array of album sessions', async () => {
      const getAlbumsData: AlbumSesionRo[] = [
        {
          id: 1,
          albumName: 'Album 1',
          participants: 'Participants 1',
          userId: 1,
        },
        {
          id: 2,
          albumName: 'Album 2',
          participants: 'Participants 2',
          userId: 2,
        },
      ];

      prismaServiceMock.albumSesion.findMany.mockResolvedValue(getAlbumsData);

      const result = await albumSesionService.getAlbumSesions();

      expect(result).toEqual(getAlbumsData);
    });

    it('should return an empty array when no album sessions are found', async () => {
      prismaServiceMock.albumSesion.findMany.mockResolvedValue([]);

      const result = await albumSesionService.getAlbumSesions();

      expect(result).toEqual([]);
    });
  });

  describe('deleteAlbumSesion', () => {
    it('should return statusCode 204', async () => {
      const deleteAlbumSesion: DeleteAlbumSesionDto = {
        albumId: 1,
        password: 'password',
      };
      const userId = 1;

      const hashedPassword = await bcrypt.hash(deleteAlbumSesion.password, 10);
      const req = {} as Request;

      const albumToDelete = {
        id: deleteAlbumSesion.albumId,
        participants: 'Participants Test',
      };

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(albumToDelete);

      prismaServiceMock.user.findUnique.mockResolvedValue({
        id: userId,
        password: hashedPassword,
      });

      prismaServiceMock.albumSesion.delete.mockResolvedValue(albumToDelete);

      const result = await albumSesionService.deleteAlbumSesion(
        deleteAlbumSesion,
        req,
      );

      expect(result.statusCode).toBe(204);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      const deleteAlbumSesion: DeleteAlbumSesionDto = {
        albumId: 1,
        password: 'password',
      };
      const req = {} as Request;

      prismaServiceMock.user.findUnique.mockResolvedValue(null);

      await expect(
        albumSesionService.deleteAlbumSesion(deleteAlbumSesion, req),
      ).rejects.toThrowError(new NotFoundException('User does not exist'));
    });

    it('should throw BadRequestException if password is wrong', async () => {
      const deleteAlbumSesion: DeleteAlbumSesionDto = {
        albumId: 1,
        password: 'wrong_password',
      };
      const req = {} as Request;
      const userId = 1;
      const hashedPassword = 'hashed_password';

      prismaServiceMock.user.findUnique.mockResolvedValue({
        id: userId,
        password: hashedPassword,
      });

      await expect(
        albumSesionService.deleteAlbumSesion(deleteAlbumSesion, req),
      ).rejects.toThrowError(new BadRequestException('Wrong password'));
    });

    it('should throw NotFoundException if album session not found', async () => {
      const deleteAlbumSesion: DeleteAlbumSesionDto = {
        albumId: undefined,
        password: 'password',
      };
      const req = {} as Request;
      const userId = 1;
      const hashedPassword = 'hashed_password';

      prismaServiceMock.user.findUnique.mockResolvedValue({
        id: userId,
        password: hashedPassword,
      });

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(null);

      await expect(
        albumSesionService.deleteAlbumSesion(deleteAlbumSesion, req),
      ).rejects.toThrowError(new NotFoundException('Album session not found'));
    });
  });

  describe('getPrivateAlbum', () => {
    it('should return statusCode 200 & album', async () => {
      const expectedResult: PrivateAlbumSesionRo = {
        statusCode: 200,
        album: {
          id: 24,
          albumName: 'albumName',
          participants: 'participants',
          albumPassword: 'password',
          mainVideo: 'mainVideo',
          trailerVideo: 'trailerVideo',
          userId: 2,
          images: [],
        },
      };
      const getPrivateAlbum = {
        id: '24',
        password: 'password',
      };

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(
        expectedResult.album,
      );

      const result = await albumSesionService.getPrivateAlbum(getPrivateAlbum);

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if album isnt found', async () => {
      const deleteAlbumSesion: GetPrivateAlbumDto = {
        id: '1',
        password: 'password',
      };

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(null);

      await expect(
        albumSesionService.getPrivateAlbum(deleteAlbumSesion),
      ).rejects.toThrowError(new NotFoundException('Album not found'));
    });

    it('should throw NotFoundException if password is wrong', async () => {
      const deleteAlbumSesion: GetPrivateAlbumDto = {
        id: '1',
        password: 'password',
      };

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(
        deleteAlbumSesion,
      );

      await expect(
        albumSesionService.getPrivateAlbum(deleteAlbumSesion),
      ).rejects.toThrowError(new BadRequestException('Wrong password'));
    });
  });

  describe('getAlbumByIdByAdmin', () => {
    it('should return statusCode 200 & album', async () => {
      const expectedResult: PrivateAlbumSesionRo = {
        statusCode: 200,
        album: {
          id: 1,
          albumName: 'albumName',
          participants: 'participants',
          albumPassword: 'password',
          mainVideo: 'mainVideo',
          trailerVideo: 'trailerVideo',
          userId: 1,
          images: [],
        },
      };
      const req = {
        headers: {
          authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4',
        },
      } as unknown as Request;
      const albumId = 1;

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(
        expectedResult.album,
      );

      const result = await albumSesionService.getAlbumByIdByAdmin(req, albumId);

      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if user isnt found', async () => {
      const req = {
        headers: {
          authorization: 'Bearer asd',
        },
      } as unknown as Request;

      await expect(
        albumSesionService.getAlbumByIdByAdmin(req, 1),
      ).rejects.toThrowError(new NotFoundException('User does not exist'));
    });
  });
});
