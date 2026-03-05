import jwt from 'jsonwebtoken';

import { AUTH } from '@shared/constants.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret-change-in-production';

export type TokenPayload = {
  userId: string;
};

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: AUTH.ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: AUTH.REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): TokenPayload {
  // jwt.verify returns JwtPayload | string; we sign with { userId } so the shape is known
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  // jwt.verify returns JwtPayload | string; we sign with { userId } so the shape is known
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}
