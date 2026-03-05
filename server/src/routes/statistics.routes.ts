import { Router } from 'express';

import {
  summaryQuerySchema,
  byCategoryQuerySchema,
  monthlyTrendQuerySchema,
} from '@shared/schemas/statistics.js';

import * as statisticsController from '../controllers/statistics.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/summary', validate(summaryQuerySchema, 'query'), statisticsController.summary);
router.get(
  '/by-category',
  validate(byCategoryQuerySchema, 'query'),
  statisticsController.byCategory,
);
router.get(
  '/monthly-trend',
  validate(monthlyTrendQuerySchema, 'query'),
  statisticsController.monthlyTrend,
);

export { router as statisticsRoutes };
