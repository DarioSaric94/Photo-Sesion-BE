export interface ResponseRo {
  message?: string;
  statusCode?: number;
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

export interface PrivateAlbumSesionRo extends ResponseRo {
  album: AlbumSesionRo;
}

export interface Images {
  id: number;
  albumSesionId: number;
  image: string;
}

export interface UserDataRo {
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

export interface YoutubeLinksRo {
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

export interface GetImageFileRo extends ResponseRo {
  url: string;
  sessionToken: string;
}
