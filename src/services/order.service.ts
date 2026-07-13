import { orderRepository } from '../repositories/order.repository';
import { ApiError } from '../utils/ApiError';
import { IOrder } from '../models/Order.model';

export class OrderService {
  async getMyOrders(userId: string): Promise<IOrder[]> {
    return orderRepository.findByUser(userId);
  }

  async getById(id: string, userId: string, isAdmin: boolean): Promise<IOrder> {
    const order = await orderRepository.findById(id);
    if (!order) throw ApiError.notFound('Order not found');
    if (!isAdmin && order.user.toString() !== userId) {
      throw ApiError.forbidden('You do not have access to this order');
    }
    return order;
  }
}

export const orderService = new OrderService();
