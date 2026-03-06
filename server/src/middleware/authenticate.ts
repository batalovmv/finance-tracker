import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const { TokenExpiredError } = jwt;

import { AppError, ErrorCode } from '@shared/errors.js';

import { verifyAccessToken } from '../lib/jwt.js';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(new AppError(ErrorCode.AUTH_TOKEN_EXPIRED, 'Token has expired', 401));
    }
    return next(new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Invalid token', 401));
  }
}
