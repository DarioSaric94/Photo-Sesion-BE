import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeLinksController } from './youtubeLinks.controller';
import { YoutubeLinksService } from './youtubeLinks.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ResponseRo, YoutubeLinksRo } from '../../src/helpers/types';
import { CreateYoutubeLinkDto } from './dto/youtubeLinks.dto';

describe('YoutubeLinksController', () => {
  let controller: YoutubeLinksController;
  let service: YoutubeLinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeLinksController],
      providers: [PrismaService, YoutubeLinksService],
    }).compile();

    controller = module.get<YoutubeLinksController>(YoutubeLinksController);
    service = module.get<YoutubeLinksService>(YoutubeLinksService);
  });

  describe('createYoutubeLinks', () => {
    it('should return statusCode: 200', async () => {
      const expectedResult: ResponseRo = {
        statusCode: 200,
      };
      const request: CreateYoutubeLinkDto = {
        youtubeLink1: 'youtubeLink1',
        youtubeLink2: 'youtubeLink2',
        youtubeLink3: 'youtubeLink3',
        albumId: 1,
      };

      const req = {
        headers: {
          authorization:
            'Beared eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4',
        },
      } as unknown as Request;

      jest
        .spyOn(service, 'createYoutubeLinks')
        .mockResolvedValue(expectedResult);

      const result = await controller.createYoutubeLinks(request, req);

      expect(result).toEqual(expectedResult);
      expect(service.createYoutubeLinks).toHaveBeenCalledWith(request, req);
    });
  });

  describe('getYoutubeLinks', () => {
    it('should return statusCode: 200', async () => {
      const expectedResult: YoutubeLinksRo = {
        album: {
          id: 1,
          albumName: 'albumName',
          participants: 'participants',
          userId: 1,
        },
        albumsData: [],
        youtubeLinks: {
          id: 1,
          albumId: 1,
          userId: 1,
        },
      };

      jest.spyOn(service, 'getYoutubeLinks').mockResolvedValue(expectedResult);

      const result = await controller.getYoutubeLinks();

      expect(result).toEqual(expectedResult);
      expect(service.getYoutubeLinks).toHaveBeenCalledWith();
    });
  });
});
