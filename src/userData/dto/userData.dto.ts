import { IsString, Length, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDataDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  city: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  domesticNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  iternationalCountry: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  iternationalNumber: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  facebookLink: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  instagramLink: string;
}
