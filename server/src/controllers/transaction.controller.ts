import { type Request, type Response, type NextFunction } from 'express';

import { AppError } from '@shared/errors.js';
import { type TransactionExportQuery, type TransactionQuery } from '@shared/types/index.js';

import { transactionsToCsv } from '../lib/csv.js';
import * as transactionService from '../services/transaction.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    // req.query is replaced by validate middleware with Zod-parsed TransactionQuery
    const result = await transactionService.list(userId, req.query as unknown as TransactionQuery);

    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    const transaction = await transactionService.create(userId, req.body);

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    const transaction = await transactionService.update(userId, req.params.id, req.body);

    res.json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    await transactionService.remove(userId, req.params.id);

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function exportCsv(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;
    if (!userId) throw AppError.unauthorized();

    const query = req.query as unknown as TransactionExportQuery;
    const allData = await transactionService.listAll(userId, query);
    const csv = transactionsToCsv(allData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}
