import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { YoutubeLinksService } from './youtubeLinks.service';
import { ResponseRo, YoutubeLinksRo } from 'src/helpers/types';
import { CreateYoutubeLinkDto } from './dto/youtubeLinks.dto';

const prismaServiceMock = {
  youtubeLinks: {
    upsert: jest.fn(),
    findFirst: jest.fn(),
  },
  albumSesion: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('YoutubeLinksService', () => {
  let youtubeLinksService: YoutubeLinksService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YoutubeLinksService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
      ],
    }).compile();

    youtubeLinksService = module.get<YoutubeLinksService>(YoutubeLinksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(youtubeLinksService).toBeDefined();
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

      const upsertYoutubeLinksMock = {
        youtubeLink1: 'youtubeLink1',
        youtubeLink2: 'youtubeLink2',
        youtubeLink3: 'youtubeLink3',
        albumId: 1,
        userId: 2,
      };

      prismaServiceMock.youtubeLinks.upsert.mockResolvedValue(
        upsertYoutubeLinksMock,
      );

      const req = {
        headers: {
          authorization:
            'Beared eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTY5NTMzOTYxMX0.8gpOzEHGzbspVQ87SMgLK_s_1VHy37K02ba3N1RfEX4',
        },
      } as unknown as Request;

      const result = await youtubeLinksService.createYoutubeLinks(request, req);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getYoutubeLinks', () => {
    it('should return youtubeLins, albumsData, album', async () => {
      const expectedResult: YoutubeLinksRo = {
        album: {
          id: 1,
          albumName: 'albumName',
          participants: 'participants',
          userId: 1,
          images: [],
        },
        albumsData: [
          {
            id: 1,
            participants: 'participants',
          },
        ],
        youtubeLinks: {
          id: 1,
          youtubeLink1: 'youtubeLink1',
          albumId: 1,
          userId: 2,
        },
      };

      const findFirstYoutubeLinksMock = {
        id: 1,
        youtubeLink1: 'youtubeLink1',
        albumId: 1,
        userId: 2,
      };

      const findManyAlbumSesions = [
        {
          id: 1,
          participants: 'participants',
        },
      ];

      const findUniqueAlbumSesion = {
        id: 1,
        albumName: 'albumName',
        participants: 'participants',
        userId: 1,
        images: [],
      };

      prismaServiceMock.youtubeLinks.findFirst.mockResolvedValue(
        findFirstYoutubeLinksMock,
      );
      prismaServiceMock.albumSesion.findMany.mockResolvedValue(
        findManyAlbumSesions,
      );
      prismaServiceMock.albumSesion.findUnique.mockResolvedValue(
        findUniqueAlbumSesion,
      );

      const result = await youtubeLinksService.getYoutubeLinks();

      expect(result).toEqual(expectedResult);
    });
  });
});
