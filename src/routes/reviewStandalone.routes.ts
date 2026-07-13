import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { updateReviewSchema } from '../validators/review.validator';

const router = Router();

// Standalone /reviews/:id for edit/delete (doesn't need the product context)
router.patch('/:id', protect, validate(updateReviewSchema), reviewController.updateReview);
router.delete('/:id', protect, reviewController.deleteReview);

export default router;
