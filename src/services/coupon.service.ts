import { couponRepository } from '../repositories/coupon.repository';
import { ApiError } from '../utils/ApiError';
import { ICoupon } from '../models/Coupon.model';

export interface CouponInput {
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  usageLimit?: number | null;
  expiresAt?: string | null;
}

export class CouponService {
  async create(input: CouponInput): Promise<ICoupon> {
    const existing = await couponRepository.findByCode(input.code);
    if (existing) throw ApiError.conflict('A coupon with this code already exists');
    return couponRepository.create({
      ...input,
      code: input.code.toUpperCase(),
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });
  }

  async list(): Promise<ICoupon[]> {
    return couponRepository.findAll();
  }

  async update(id: string, input: Partial<CouponInput>): Promise<ICoupon> {
    const payload: Record<string, unknown> = { ...input };
    if (input.expiresAt !== undefined) {
      payload.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
    }
    const updated = await couponRepository.updateById(id, payload);
    if (!updated) throw ApiError.notFound('Coupon not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await couponRepository.deleteById(id);
    if (!deleted) throw ApiError.notFound('Coupon not found');
  }

  /** Validates a coupon code against a cart subtotal and returns the discount amount (not applied yet). */
  async validateAndCalculate(code: string, subtotal: number): Promise<{ coupon: ICoupon; discount: number }> {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive) throw ApiError.badRequest('Invalid or inactive coupon code');
    if (coupon.expiresAt && coupon.expiresAt < new Date()) throw ApiError.badRequest('This coupon has expired');
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest('This coupon has reached its usage limit');
    }
    if (subtotal < coupon.minPurchase) {
      throw ApiError.badRequest(`This coupon requires a minimum purchase of $${coupon.minPurchase.toFixed(2)}`);
    }

    const discount =
      coupon.discountType === 'percentage' ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;

    return { coupon, discount: Math.min(discount, subtotal) };
  }

  /** Best-effort discount calc for an already-applied cart coupon — returns 0 if it's no longer valid rather than throwing. */
  async safeCalculateDiscount(code: string | undefined, subtotal: number): Promise<number> {
    if (!code) return 0;
    try {
      const { discount } = await this.validateAndCalculate(code, subtotal);
      return discount;
    } catch {
      return 0;
    }
  }
}

export const couponService = new CouponService();
