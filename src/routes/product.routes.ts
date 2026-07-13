import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middleware/validate.middleware';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from '../validators/product.validator';

const router = Router();

// Public
router.get('/', productController.listProducts);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/slug/:slug/related', productController.getRelatedProducts);
router.get('/:id', validate(productIdSchema), productController.getProductById);

// Admin only
router.post(
  '/',
  protect,
  restrictTo('admin'),
  upload.array('images', 8),
  validate(createProductSchema),
  productController.createProduct
);
router.patch(
  '/:id',
  protect,
  restrictTo('admin'),
  upload.array('images', 8),
  validate(updateProductSchema),
  productController.updateProduct
);
router.delete('/:id', protect, restrictTo('admin'), validate(productIdSchema), productController.deleteProduct);
router.patch('/:id/stock', protect, restrictTo('admin'), productController.updateStock);

export default router;
