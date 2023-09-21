import {
  IsString,
  Length,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  MaxLength,
} from 'class-validator';

export class CreateAlbumSesionDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  albumName: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 50)
  participants: string;

  @IsNotEmpty()
  @Length(8, 20)
  albumPassword: string;

  @IsString()
  @IsOptional()
  trailerVideo: string;

  @IsString()
  @IsOptional()
  mainVideo: string;
}

export class DeleteAlbumSesionDto {
  @IsNotEmpty()
  @IsNumber()
  albumId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  password: string;
}

export class GetPrivateAlbumDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 20)
  password: string;
}
