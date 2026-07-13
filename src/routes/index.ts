import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import cartRoutes from './cart.routes';
import wishlistRoutes from './wishlist.routes';
import checkoutRoutes from './checkout.routes';
import orderRoutes from './order.routes';
import reviewRoutes from './review.routes';
import reviewStandaloneRoutes from './reviewStandalone.routes';
import couponRoutes from './coupon.routes';
import adminRoutes from './admin.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/products', reviewRoutes); // adds /products/:productId/reviews
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewStandaloneRoutes);
router.use('/coupons', couponRoutes);
router.use('/admin', adminRoutes);

// Phase 5+: AI shopping assistant, notifications, email...

export default router;
