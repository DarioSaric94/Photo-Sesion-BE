import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class FileDto {
  @IsNotEmpty()
  @IsString()
  albumPath: string;

  @IsNotEmpty()
  @IsNumber()
  albumId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  albumPassword: string;
}
