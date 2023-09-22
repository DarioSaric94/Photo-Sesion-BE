import { Test, TestingModule } from '@nestjs/testing';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { FileDto } from './dto/file.dto';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

describe('FileController', () => {
  let fileController: FileController;
  let fileService: FileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [PrismaService, FileService],
    }).compile();

    fileController = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  it('should be defined', () => {
    expect(fileController).toBeDefined();
  });

  describe('getImageFile', () => {
    it('should return an image file', async () => {
      const fileDto: FileDto = {
        albumPath: 'somePath',
        albumId: 1,
        albumPassword: 'somePassword',
      };
      const expectedResponse = { url: 'someUrl', sessionToken: 'someToken' };

      jest
        .spyOn(fileService, 'getImageFile')
        .mockResolvedValue(expectedResponse);

      const result = await fileController.getImageFile(fileDto);

      expect(result).toBe(expectedResponse);
    });
  });

  describe('unlockedImageFile', () => {
    it('should unlock an image file', async () => {
      const albumPath = 'somePath';
      const res: Response = {} as Response;
      const sessionToken = 'someToken';
      const albumId = 1;

      jest.spyOn(fileService, 'unlockedImageFile').mockResolvedValue();

      await fileController.unlockedImageFile(
        albumPath,
        res,
        sessionToken,
        albumId,
      );

      expect(fileService.unlockedImageFile).toHaveBeenCalledWith(
        albumPath,
        res,
        sessionToken,
        albumId,
      );
    });
  });
});
