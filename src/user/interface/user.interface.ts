import { ResponseRo } from 'src/helpers/types';

export interface UserDataRo extends ResponseRo {
  userData: User;
}

export interface User {
  id: number;
  email: string;
  createdAt: Date;
  role: number;
  token: string;
  image?: string;
}
