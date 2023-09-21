import { IsString, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class CreateYoutubeLinkDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  youtubeLink1: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  youtubeLink2: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  youtubeLink3: string;

  @IsOptional()
  @IsNumber()
  albumId: number;
}
