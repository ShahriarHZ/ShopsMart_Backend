import { Response } from 'express';
import { reviewService } from '../services/review.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const createReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { rating, comment, images } = req.body;
  const review = await reviewService.create(req.params.productId, req.user!.userId, rating, comment, images);
  ApiResponse.created(res, 'Review submitted', review);
});

export const listReviews = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await reviewService.listForProduct(req.params.productId);
  ApiResponse.ok(res, 'Reviews fetched', result);
});

export const updateReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const review = await reviewService.update(req.params.id, req.user!.userId, req.body);
  ApiResponse.ok(res, 'Review updated', review);
});

export const deleteReview = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  await reviewService.delete(req.params.id, req.user!.userId, isAdmin);
  ApiResponse.ok(res, 'Review deleted');
});
