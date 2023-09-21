import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ChangePasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
} from './dto/create-user.dto,';
import { JwtAuthGuard } from '../../src/helpers/guards/RoleGuard';
import { Roles } from '../../src/helpers/guards/role';
import { Role } from '../../src/helpers/guards/role.enum';
import { ResponseRo, UserRo } from '../../src/helpers/types';

@Controller('auth/')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async createUser(
    @Body(new ValidationPipe()) user: RegisterUserDto,
  ): Promise<UserRo> {
    return this.userService.createUser(user);
  }

  @Post('login')
  async loginUser(@Body() user: LoginUserDto): Promise<UserRo> {
    return this.userService.loginUser(user);
  }

  @Get('user')
  @Roles(Role.Admin, Role.User)
  @UseGuards(JwtAuthGuard)
  async getUserByToken(@Request() req: Request): Promise<UserRo> {
    return this.userService.getUserByToken(req);
  }

  @Post('reset-password')
  async resetPassword(
    @Body(new ValidationPipe()) body: ResetPasswordDto,
  ): Promise<ResponseRo> {
    return this.userService.resetPassword(body);
  }

  @Post('change-password/:token')
  @Roles(Role.Admin, Role.User)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param('token') token: string,
    @Body(new ValidationPipe()) body: ChangePasswordDto,
  ): Promise<UserRo> {
    return this.userService.changePassword(token, body);
  }
}
