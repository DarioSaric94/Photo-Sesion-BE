import {
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Get,
  Param,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express/multer';
import { JwtAuthGuard } from '../helpers/guards/RoleGuard';
import { Roles } from '../helpers/guards/role';
import { Role } from '../helpers/guards/role.enum';
import { AlbumSesionService } from './albumSesion.service';
import {
  CreateAlbumSesionDto,
  DeleteAlbumSesionDto,
  GetPrivateAlbumDto,
} from './dto/albumSesion.dto';
import { AlbumSesionRo, PrivateAlbumSesionRo } from '../../src/helpers/types';

@Controller('album/')
export class AlbumSesionController {
  constructor(private readonly albumSesionService: AlbumSesionService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('image'))
  async createAlbumSesion(
    @Body(new ValidationPipe()) data: CreateAlbumSesionDto,
    @Request() req: Request,
    @UploadedFiles() imageFile: Array<Express.Multer.File>,
  ): Promise<{ statusCode: number }> {
    return this.albumSesionService.createAlbumSesion(data, req, imageFile);
  }

  @Get()
  async getAlbumSesions(): Promise<AlbumSesionRo[]> {
    return this.albumSesionService.getAlbumSesions();
  }

  @Post('delete')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async deleteAlbumSesion(
    @Body(new ValidationPipe()) data: DeleteAlbumSesionDto,
    @Request() req: Request,
  ): Promise<{ statusCode: number }> {
    return this.albumSesionService.deleteAlbumSesion(data, req);
  }

  @Post('private')
  async getPrivateAlbum(
    @Body(new ValidationPipe()) data: GetPrivateAlbumDto,
  ): Promise<PrivateAlbumSesionRo> {
    return this.albumSesionService.getPrivateAlbum(data);
  }

  @Get(':id')
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  async getAlbumByIdByAdmin(
    @Request() req: Request,
    @Param('id', ParseIntPipe) albumId: number,
  ): Promise<PrivateAlbumSesionRo> {
    return this.albumSesionService.getAlbumByIdByAdmin(req, albumId);
  }
}
