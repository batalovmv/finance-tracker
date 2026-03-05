import { Router } from 'express';

import { authRoutes } from './auth.routes.js';
import { categoryRoutes } from './category.routes.js';
import { statisticsRoutes } from './statistics.routes.js';
import { transactionRoutes } from './transaction.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/statistics', statisticsRoutes);

export { router as apiRoutes };
