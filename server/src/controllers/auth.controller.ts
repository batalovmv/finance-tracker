import { type Request, type Response, type NextFunction } from 'express';

import { AppError, ErrorCode } from '@shared/errors.js';

import * as authService from '../services/auth.service.js';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const isProduction = process.env.NODE_ENV === 'production';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/api/auth',
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict',
    path: '/api/auth',
  });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body);

    setRefreshCookie(res, result.refreshToken);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body);

    setRefreshCookie(res, result.refreshToken);

    res.json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!token) {
      throw new AppError(ErrorCode.AUTH_TOKEN_INVALID, 'Refresh token not found', 401);
    }

    const result = await authService.refresh(token);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response, _next: NextFunction) {
  clearRefreshCookie(res);
  res.status(204).send();
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      throw AppError.unauthorized();
    }

    const user = await authService.getMe(userId);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
