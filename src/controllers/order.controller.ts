import { Response } from 'express';
import { orderService } from '../services/order.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../interfaces/auth.interface';

export const getMyOrders = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await orderService.getMyOrders(req.user!.userId);
  ApiResponse.ok(res, 'Orders fetched', orders);
});

export const getOrderById = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user!.role === 'admin';
  const order = await orderService.getById(req.params.id, req.user!.userId, isAdmin);
  ApiResponse.ok(res, 'Order fetched', order);
});
