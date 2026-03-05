import { Router } from 'express';

import {
  createCategorySchema,
  updateCategorySchema,
  categoryQuerySchema,
} from '@shared/schemas/category.js';

import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';

const router = Router();

router.use(authenticate);

router.get('/', validate(categoryQuerySchema, 'query'), categoryController.list);
router.post('/', validate(createCategorySchema), categoryController.create);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', categoryController.remove);

export { router as categoryRoutes };
