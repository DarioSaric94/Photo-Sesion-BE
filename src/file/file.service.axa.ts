import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from './file.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { FileDto } from './dto/file.dto';
import { generateToken } from '../helpers/utils/generateToken';
import { join } from 'path';
import * as fsExtra from 'fs-extra';
import { Response } from 'express';

jest.mock('fs-extra', () => ({
  pathExists: jest.fn(),
  promises: {
    readdir: jest.fn(),
  },
}));
const prismaServiceMock = {
  albumSesion: {
    findUnique: jest.fn(),
  },
  albumSessionToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    delete: jest.fn(),
  },
};

const archiverMock = {
  pipe: jest.fn(),
  file: jest.fn(),
  finalize: jest.fn(),
};

const readdirSyncMock = jest.fn();

const responseMock = {
  set: jest.fn(),
  status: jest.fn(),
  send: jest.fn(),
} as unknown as Response;

jest.mock('../../src/helpers/utils/generateToken', () => ({
  generateToken: jest.fn(),
}));

describe('FileService', () => {
  let fileService: FileService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    fileService = module.get<FileService>(FileService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(fileService).toBeDefined();
  });

  describe('getImageFile', () => {
    it('should return image file data', async () => {
      const data: FileDto = {
        albumPath: 'somePath',
        albumId: 1,
        albumPassword: 'correctPassword',
      };

      const albumData = {
        id: 1,
        albumPassword: 'correctPassword',
      };

      const sessionToken = 'mocked-session-token';

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(albumData);
      (generateToken as jest.Mock).mockReturnValue(sessionToken);

      const result = await fileService.getImageFile(data);

      expect(result).toEqual({
        statusCode: 200,
        url: data.albumPath,
        sessionToken,
      });
    });

    it('should throw NotFoundException when album does not exist', async () => {
      const data: FileDto = {
        albumPath: 'somePath',
        albumId: 2,
        albumPassword: 'correctPassword',
      };

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(null);

      await expect(fileService.getImageFile(data)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when password is incorrect', async () => {
      const data: FileDto = {
        albumPath: 'somePath',
        albumId: 1,
        albumPassword: 'incorrectPassword',
      };

      const albumData = {
        id: 1,
        albumPassword: 'correctPassword',
      };

      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(albumData);

      await expect(fileService.getImageFile(data)).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('unlockedImageFile', () => {
    it('should unlock an image file', async () => {
      const albumPath = 'asdasd&sadsad';
      const sessionToken = 'mocked-session-token';
      const albumId = 25;

      const albumHasValidToken = {
        id: 25,
        sessionToken: 'mocked-session-token',
      };

      prismaServiceMock.albumSessionToken.create.mockResolvedValue(
        albumHasValidToken,
      );

      prismaServiceMock.albumSessionToken.findFirst.mockResolvedValue(
        albumHasValidToken,
      );

      await fileService.unlockedImageFile(
        albumPath,
        responseMock,
        sessionToken,
        albumId,
      );

      archiverMock.pipe.mockReturnThis();
      archiverMock.file.mockReturnThis();
      archiverMock.finalize.mockImplementation(() => {
        responseMock.status(200).send('Archive content');
      });

      expect(
        prismaServiceMock.albumSessionToken.findFirst,
      ).toHaveBeenCalledWith({
        where: {
          sessionToken: sessionToken,
          albumSessionId: albumId,
        },
      });
      expect(prismaServiceMock.albumSessionToken.delete).toHaveBeenCalledWith({
        where: {
          id: albumHasValidToken.id,
        },
      });

      const expectedFolderPath = join(process.cwd(), 'images', albumPath);
      expect(archiverMock.pipe).toHaveBeenCalledWith(responseMock);
      expect(archiverMock.file).toHaveBeenCalledWith(
        join(expectedFolderPath, 'file1.txt'),
        { name: 'file1.txt' },
      );
      expect(archiverMock.finalize).toHaveBeenCalled();

      expect(responseMock.set).toHaveBeenCalledWith({
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${albumPath}.zip"`,
      });

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(responseMock.send).toHaveBeenCalledWith('Archive content');
    });

    it('should handle case where no files are found in the folder', async () => {
      const albumPath = 'nonExistentPath';
      const sessionToken = 'mocked-session-token';
      const albumId = 3;

      (fsExtra.pathExists as jest.Mock).mockResolvedValue(false);

      prismaServiceMock.albumSessionToken.findFirst.mockResolvedValue({
        id: 3,
        sessionToken: 'mocked-session-token',
      });

      await expect(async () => {
        await fileService.unlockedImageFile(
          albumPath,
          responseMock,
          sessionToken,
          albumId,
        );
      }).rejects.toThrowError(NotFoundException);
    });
  });
});
