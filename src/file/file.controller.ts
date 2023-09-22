import {
  Controller,
  Post,
  Body,
  Res,
  ValidationPipe,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileService } from './file.service';
import { Response } from 'express';
import { FileDto } from './dto/file.dto';
import { GetImageFileRo } from 'src/helpers/types';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  async getImageFile(@Body() data: FileDto): Promise<GetImageFileRo> {
    return await this.fileService.getImageFile(data);
  }

  @Get(':albumPath')
  async unlockedImageFile(
    @Param('albumPath') albumPath: string,
    @Res()
    res: Response,
    @Query('sessionToken') sessionToken: string,
    @Query('albumId', ParseIntPipe) albumId: number,
  ): Promise<void> {
    await this.fileService.unlockedImageFile(
      albumPath,
      res,
      sessionToken,
      albumId,
    );
  }
}
