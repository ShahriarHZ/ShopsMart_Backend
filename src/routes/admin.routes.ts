import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/dashboard/revenue', adminController.getRevenueTimeSeries);
router.get('/orders', adminController.listAllOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

export default router;
