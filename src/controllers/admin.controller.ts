import { Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { OrderStatus } from '../models/Order.model';

const VALID_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded',
];

export const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  ApiResponse.ok(res, 'Dashboard stats fetched', stats);
});

export const getRevenueTimeSeries = catchAsync(async (req: Request, res: Response) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  const series = await adminService.getRevenueTimeSeries(days);
  ApiResponse.ok(res, 'Revenue series fetched', series);
});

export const listAllOrders = catchAsync(async (req: Request, res: Response) => {
  const status = req.query.status as OrderStatus | undefined;
  const orders = await adminService.listAllOrders(status);
  ApiResponse.ok(res, 'Orders fetched', orders);
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) throw ApiError.badRequest('Invalid order status');
  const order = await adminService.updateOrderStatus(req.params.id, status);
  ApiResponse.ok(res, 'Order status updated', order);
});
