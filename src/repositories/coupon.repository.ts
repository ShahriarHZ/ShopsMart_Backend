import { Coupon, ICoupon } from '../models/Coupon.model';

export class CouponRepository {
  async create(data: Partial<ICoupon>): Promise<ICoupon> {
    return Coupon.create(data);
  }

  async findAll(): Promise<ICoupon[]> {
    return Coupon.find().sort({ createdAt: -1 });
  }

  async findByCode(code: string): Promise<ICoupon | null> {
    return Coupon.findOne({ code: code.toUpperCase() });
  }

  async findById(id: string): Promise<ICoupon | null> {
    return Coupon.findById(id);
  }

  async updateById(id: string, data: Partial<ICoupon>): Promise<ICoupon | null> {
    return Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async incrementUsage(id: string): Promise<void> {
    await Coupon.findByIdAndUpdate(id, { $inc: { usedCount: 1 } });
  }

  async deleteById(id: string): Promise<ICoupon | null> {
    return Coupon.findByIdAndDelete(id);
  }
}

export const couponRepository = new CouponRepository();
