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
import { AlbumSesionService } from './albumSesion.service';

@Controller('album/')
export class AlbumSesionController {
  constructor(private readonly albumSesionService: AlbumSesionService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('images'))
  async createAlbumSesion(
    @Body() data: any,
    @Request() req: Request,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.albumSesionService.createAlbumSesion(data, req, imageFile);
  }
}
