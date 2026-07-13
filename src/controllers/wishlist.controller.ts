import { Response } from 'express';
import { wishlistService } from '../services/wishlist.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const getWishlist = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const wishlist = await wishlistService.getWishlist(req.user!.userId);
  ApiResponse.ok(res, 'Wishlist fetched', wishlist);
});

export const addToWishlist = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const wishlist = await wishlistService.addProduct(req.user!.userId, req.params.productId);
  ApiResponse.ok(res, 'Product added to wishlist', wishlist);
});

export const removeFromWishlist = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const wishlist = await wishlistService.removeProduct(req.user!.userId, req.params.productId);
  ApiResponse.ok(res, 'Product removed from wishlist', wishlist);
});

export const moveToCart = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await wishlistService.moveToCart(req.user!.userId, req.params.productId);
  ApiResponse.ok(res, 'Product moved to cart');
});
