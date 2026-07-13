import { reviewRepository } from '../repositories/review.repository';
import { productRepository } from '../repositories/product.repository';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { IReview } from '../models/Review.model';

export class ReviewService {
  async create(
    productId: string,
    userId: string,
    rating: number,
    comment: string,
    images: string[] = []
  ): Promise<IReview> {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    const existing = await reviewRepository.findByUserAndProduct(userId, productId);
    if (existing) throw ApiError.conflict('You have already reviewed this product');

    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const review = await reviewRepository.create({
      product: productId as never,
      user: userId as never,
      userName: user.name,
      rating,
      comment,
      images,
    });

    await reviewRepository.recalculateProductRating(productId);
    return review;
  }

  async listForProduct(productId: string) {
    const [reviews, distribution] = await Promise.all([
      reviewRepository.findByProduct(productId),
      reviewRepository.getRatingDistribution(productId),
    ]);
    return { reviews, distribution };
  }

  async update(reviewId: string, userId: string, data: { rating?: number; comment?: string }): Promise<IReview> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (review.user.toString() !== userId) throw ApiError.forbidden('You can only edit your own review');

    const updated = await reviewRepository.updateById(reviewId, data);
    if (!updated) throw ApiError.notFound('Review not found');

    await reviewRepository.recalculateProductRating(review.product.toString());
    return updated;
  }

  async delete(reviewId: string, userId: string, isAdmin: boolean): Promise<void> {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw ApiError.notFound('Review not found');
    if (!isAdmin && review.user.toString() !== userId) {
      throw ApiError.forbidden('You can only delete your own review');
    }

    const productId = review.product.toString();
    await reviewRepository.deleteById(reviewId);
    await reviewRepository.recalculateProductRating(productId);
  }
}

export const reviewService = new ReviewService();
