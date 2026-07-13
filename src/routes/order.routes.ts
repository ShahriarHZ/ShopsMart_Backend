import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

export default router;
