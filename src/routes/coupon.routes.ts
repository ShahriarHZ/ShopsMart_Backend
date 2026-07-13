import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createCouponSchema, updateCouponSchema } from '../validators/coupon.validator';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/', couponController.listCoupons);
router.post('/', validate(createCouponSchema), couponController.createCoupon);
router.patch('/:id', validate(updateCouponSchema), couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
