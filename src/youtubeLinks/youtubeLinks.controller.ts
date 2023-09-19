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

@Controller('youtube-links/')
export class YoutubeLinksController {
  constructor(private readonly youtubeLinksService: YoutubeLinksService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async createYoutubeLinks(@Body() data: any, @Request() req: Request) {
    return this.youtubeLinksService.createYoutubeLinks(data, req);
  }

  @Get()
  async getYoutubeLinks() {
    return this.youtubeLinksService.getYoutubeLinks();
  }
}
