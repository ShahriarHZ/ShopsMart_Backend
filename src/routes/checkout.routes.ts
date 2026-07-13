import { Router } from 'express';
import * as checkoutController from '../controllers/checkout.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCheckoutSessionSchema } from '../validators/cart.validator';

const router = Router();

router.post(
  '/create-session',
  protect,
  validate(createCheckoutSessionSchema),
  checkoutController.createCheckoutSession
);

router.post('/confirm-session', protect, checkoutController.confirmCheckoutSession);

export default router;
