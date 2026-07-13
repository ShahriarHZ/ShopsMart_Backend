import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

// Nested under /products/:productId/reviews
router.get('/:productId/reviews', reviewController.listReviews);
router.post('/:productId/reviews', protect, validate(createReviewSchema), reviewController.createReview);

export default router;
