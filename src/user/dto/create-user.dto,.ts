import { IsEmail, Length } from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @Length(8, 20)
  password: string;
}
export class LoginUserDto {
  @IsEmail()
  email: string;

  @Length(8, 20)
  password: string;
}

export class ResetPasswordDto {
  @IsEmail()
  email: string;
}

export class ChangePasswordDto {
  @Length(8, 20)
  password: string;
}

export class UpdateAdminDataDto {}
