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

import { JwtAuthGuard } from '../../src/helpers/guards/RoleGuard';
import { Roles } from '../../src/helpers/guards/role';
import { Role } from '../../src/helpers/guards/role.enum';
import { ResponseRo } from 'src/helpers/types';
import { UserDataService } from './userData.service';

@Controller('user-data/')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createUserData(
    @Body() data: any,
    @Request() req: Request,
    @UploadedFile() imageFile: Express.Multer.File,
  ) {
    return this.userDataService.createUserData(data, req, imageFile);
  }

  @Get()
  async getUserData() {
    return this.userDataService.getUserData();
  }
}
