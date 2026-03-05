import { Router } from 'express';

import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
  transactionExportQuerySchema,
} from '@shared/schemas/transaction.js';

import * as transactionController from '../controllers/transaction.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(transactionQuerySchema, 'query'), transactionController.list);
router.get(
  '/export',
  validate(transactionExportQuerySchema, 'query'),
  transactionController.exportCsv,
);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.put('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.remove);

export { router as transactionRoutes };
