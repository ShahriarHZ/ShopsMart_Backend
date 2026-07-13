import { FilterQuery } from 'mongoose';
import { Product, IProduct } from '../models/Product.model';
import { PaginationParams } from '../interfaces/pagination.interface';

export class ProductRepository {
  async create(data: Partial<IProduct>): Promise<IProduct> {
    return Product.create(data);
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id).populate('category', 'name slug');
  }

  async findBySlug(slug: string): Promise<IProduct | null> {
    return Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
  }

  async slugExists(slug: string): Promise<boolean> {
    return (await Product.exists({ slug })) !== null;
  }

  async skuExists(sku: string): Promise<boolean> {
    return (await Product.exists({ sku: sku.toUpperCase() })) !== null;
  }

  async findMany(
    filter: FilterQuery<IProduct>,
    sort: Record<string, 1 | -1>,
    pagination: PaginationParams
  ): Promise<{ items: IProduct[]; total: number }> {
    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Product.countDocuments(filter),
    ]);
    return { items, total };
  }

  async findRelated(category: string, excludeId: string, limit = 8): Promise<IProduct[]> {
    return Product.find({ category, _id: { $ne: excludeId }, isActive: true })
      .limit(limit)
      .select('title slug brand images price finalPrice discount stock ratingsAverage ratingsCount bestseller newArrival');
  }

  async updateById(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id: string): Promise<IProduct | null> {
    return Product.findByIdAndDelete(id);
  }

  async decrementStock(id: string, qty: number): Promise<void> {
    await Product.findByIdAndUpdate(id, { $inc: { stock: -qty } });
  }
}

export const productRepository = new ProductRepository();
