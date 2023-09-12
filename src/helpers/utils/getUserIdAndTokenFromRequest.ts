import * as jwt from 'jsonwebtoken';

interface TokenData {
  userId: number | null;
  token: string | null;
}

export async function getUserIdAndTokenFromRequest(
  req: any,
): Promise<TokenData> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.SECRET_KEY) as jwt.JwtPayload;
    const userId = Number(decoded.userId);
    return { userId, token };
  } catch (error) {
    return { userId: null, token: null };
  }
}
