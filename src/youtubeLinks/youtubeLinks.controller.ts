import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Request,
  UseGuards,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';

import { JwtAuthGuard } from '../helpers/guards/RoleGuard';
import { Roles } from '../helpers/guards/role';
import { Role } from '../helpers/guards/role.enum';
import { YoutubeLinksService } from './youtubeLinks.service';
import { CreateYoutubeLinkDto } from './dto/youtubeLinks.dto';
import { ResponseRo, YoutubeLinksRo } from 'src/helpers/types';

@Controller('youtube-links/')
export class YoutubeLinksController {
  constructor(private readonly youtubeLinksService: YoutubeLinksService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async createYoutubeLinks(
    @Body(new ValidationPipe()) data: CreateYoutubeLinkDto,
    @Request() req: Request,
  ): Promise<ResponseRo> {
    return this.youtubeLinksService.createYoutubeLinks(data, req);
  }

  @Get()
  async getYoutubeLinks(): Promise<YoutubeLinksRo> {
    return this.youtubeLinksService.getYoutubeLinks();
  }
}
