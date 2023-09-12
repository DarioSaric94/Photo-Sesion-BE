import * as jwt from 'jsonwebtoken';

export function generateToken(userId: number): string {
  const secretKey = process.env.SECRET_KEY;
  return jwt.sign({ userId }, secretKey);
}
