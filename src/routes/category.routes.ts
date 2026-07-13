import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { validate } from '../middleware/validate.middleware';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/product.validator';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:id', categoryController.getCategory);

router.post('/', protect, restrictTo('admin'), validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', protect, restrictTo('admin'), validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', protect, restrictTo('admin'), categoryController.deleteCategory);

export default router;
