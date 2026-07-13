import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { addCartItemSchema, updateCartItemSchema, cartItemParamSchema } from '../validators/cart.validator';

const router = Router();

router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', validate(addCartItemSchema), cartController.addCartItem);
router.patch('/items/:productId', validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/items/:productId', validate(cartItemParamSchema), cartController.removeCartItem);
router.delete('/', cartController.clearCart);
router.post('/coupon', cartController.applyCoupon);
router.delete('/coupon', cartController.removeCoupon);

export default router;
