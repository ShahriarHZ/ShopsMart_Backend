import { Response } from 'express';
import { couponService } from '../services/coupon.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const createCoupon = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const coupon = await couponService.create(req.body);
  ApiResponse.created(res, 'Coupon created', coupon);
});

export const listCoupons = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const coupons = await couponService.list();
  ApiResponse.ok(res, 'Coupons fetched', coupons);
});

export const updateCoupon = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const coupon = await couponService.update(req.params.id, req.body);
  ApiResponse.ok(res, 'Coupon updated', coupon);
});

export const deleteCoupon = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await couponService.delete(req.params.id);
  ApiResponse.ok(res, 'Coupon deleted');
});
