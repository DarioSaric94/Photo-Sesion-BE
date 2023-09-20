import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
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
  @UseInterceptors(FilesInterceptor('image'))
  async createAlbumSesion(
    @Body() data: any,
    @Request() req: Request,
    @UploadedFiles() imageFile: Array<Express.Multer.File>,
  ) {
    return this.albumSesionService.createAlbumSesion(data, req, imageFile);
  }

  @Get()
  async getAlbumSesions() {
    return this.albumSesionService.getAlbumSesions();
  }

  @Post('delete')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async deleteAlbumSesion(@Body() data: any, @Request() req: Request) {
    return this.albumSesionService.deleteAlbumSesion(data, req);
  }
}
