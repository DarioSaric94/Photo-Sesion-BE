import { HttpStatus } from '@nestjs/common';

export interface ResponseRo {
  message?: string;
  status?: number;
}

export interface Status {
  status: HttpStatus;
}

export interface UserRo extends ResponseRo {
  userData: {
    id: number;
    email: string;
    createdAt: Date;
    role: number;
    token: string;
  };
}

export interface AlbumSesionRo {
  id: number;
  albumName: string;
  participants: string;
  mainVideo?: string;
  trailerVideo?: string;
  albumPassword?: string;
  userId: number;
  images?: Images[];
}

export interface PrivateAlbumSesionRo extends Status {
  album: AlbumSesionRo;
}

export interface Images {
  id: number;
  albumSesionId: number;
  image: string;
}

export interface UserDataRo extends ResponseRo {
  id?: number;
  name?: string;
  lastName?: string;
  image?: string;
  city?: string;
  country?: string;
  domesticNumber?: string;
  iternationalCountry?: string;
  iternationalNumber?: string;
  facebookLink?: string;
  instagramLink?: string;
  createdAt?: Date;
  email?: string;
}

export interface YoutubeLinksRo extends ResponseRo {
  album: AlbumSesionRo;
  albumsData?: AlbumsData[];
  youtubeLinks?: YoutubeLinks;
}

interface AlbumsData {
  id?: number;
  participants?: string;
}

interface YoutubeLinks {
  id: number;
  albumId: number;
  userId: number;
  youtubeLink1?: string;
  youtubeLink2?: string;
  youtubeLink3?: string;
}

export interface GetImageFileRo extends Status {
  url: string;
  sessionToken: string;
}
