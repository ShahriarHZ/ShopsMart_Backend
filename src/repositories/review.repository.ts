import { Review, IReview } from '../models/Review.model';
import { Product } from '../models/Product.model';
import { Types } from 'mongoose';

export class ReviewRepository {
  async create(data: Partial<IReview>): Promise<IReview> {
    return Review.create(data);
  }

  async findByProduct(productId: string): Promise<IReview[]> {
    return Review.find({ product: productId }).sort({ createdAt: -1 });
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<IReview | null> {
    return Review.findOne({ user: userId, product: productId });
  }

  async findById(id: string): Promise<IReview | null> {
    return Review.findById(id);
  }

  async updateById(id: string, data: Partial<IReview>): Promise<IReview | null> {
    return Review.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id: string): Promise<IReview | null> {
    return Review.findByIdAndDelete(id);
  }

  /** Recomputes and stores the product's ratingsAverage + ratingsCount from its reviews. */
  async recalculateProductRating(productId: string): Promise<void> {
    const [stats] = await Review.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: stats ? Math.round(stats.avg * 10) / 10 : 0,
      ratingsCount: stats ? stats.count : 0,
    });
  }

  async getRatingDistribution(productId: string): Promise<Record<number, number>> {
    const results = await Review.aggregate([
      { $match: { product: new Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]);
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    results.forEach((r) => {
      distribution[r._id as number] = r.count;
    });
    return distribution;
  }
}

export const reviewRepository = new ReviewRepository();
