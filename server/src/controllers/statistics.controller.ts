import { type Request, type Response, type NextFunction } from 'express';

import { AppError } from '@shared/errors.js';
import {
  type SummaryQuery,
  type ByCategoryQuery,
  type MonthlyTrendQuery,
} from '@shared/types/index.js';

import * as statisticsService from '../services/statistics.service.js';

export async function summary(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    // req.query is replaced by validate middleware with Zod-parsed SummaryQuery
    const data = await statisticsService.getSummary(userId, req.query as unknown as SummaryQuery);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function byCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    // req.query is replaced by validate middleware with Zod-parsed ByCategoryQuery
    const data = await statisticsService.getByCategory(
      userId,
      req.query as unknown as ByCategoryQuery,
    );

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function monthlyTrend(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    // req.query is replaced by validate middleware with Zod-parsed MonthlyTrendQuery
    const data = await statisticsService.getMonthlyTrend(
      userId,
      req.query as unknown as MonthlyTrendQuery,
    );

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
