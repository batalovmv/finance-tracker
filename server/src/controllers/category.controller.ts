import { type Request, type Response, type NextFunction } from 'express';

import { AppError } from '@shared/errors.js';
import { type CategoryQuery } from '@shared/types/index.js';

import * as categoryService from '../services/category.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    // req.query is replaced by validate middleware with Zod-parsed CategoryQuery
    const categories = await categoryService.list(userId, req.query as unknown as CategoryQuery);

    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    const category = await categoryService.create(userId, req.body);

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    const category = await categoryService.update(userId, req.params.id, req.body);

    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    await categoryService.remove(userId, req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
