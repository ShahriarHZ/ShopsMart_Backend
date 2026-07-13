import { Response } from 'express';
import { cartService } from '../services/cart.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const getCart = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await cartService.getCart(req.user!.userId);
  ApiResponse.ok(res, 'Cart fetched', result);
});

export const addCartItem = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { productId, quantity, color, size } = req.body;
  const result = await cartService.addItem(req.user!.userId, productId, quantity, color, size);
  ApiResponse.ok(res, 'Item added to cart', result);
});

export const updateCartItem = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await cartService.updateItemQuantity(req.user!.userId, req.params.productId, req.body.quantity);
  ApiResponse.ok(res, 'Cart item updated', result);
});

export const removeCartItem = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await cartService.removeItem(req.user!.userId, req.params.productId);
  ApiResponse.ok(res, 'Item removed from cart', result);
});

export const clearCart = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await cartService.clearCart(req.user!.userId);
  ApiResponse.ok(res, 'Cart cleared');
});

export const applyCoupon = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await cartService.applyCoupon(req.user!.userId, req.body.code);
  ApiResponse.ok(res, 'Coupon applied', result);
});

export const removeCoupon = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await cartService.removeCoupon(req.user!.userId);
  ApiResponse.ok(res, 'Coupon removed', result);
});
