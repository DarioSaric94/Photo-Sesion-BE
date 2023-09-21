import {
  Body,
  Controller,
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
import { ResponseRo, UserDataRo } from '../../src/helpers/types';
import { UserDataService } from './userData.service';
import { CreateUserDataDto } from './dto/userData.dto';

@Controller('user-data/')
export class UserDataController {
  constructor(private readonly userDataService: UserDataService) {}

  @Post()
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createUserData(
    @Body(new ValidationPipe()) data: CreateUserDataDto,
    @Request() req: Request,
    @UploadedFile(new ValidationPipe()) imageFile: Express.Multer.File,
  ): Promise<ResponseRo> {
    return this.userDataService.createUserData(data, req, imageFile);
  }

  @Get()
  async getUserData(): Promise<UserDataRo> {
    return this.userDataService.getUserData();
  }
}
