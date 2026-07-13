import { Order, IOrder } from '../models/Order.model';

export class OrderRepository {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    return Order.create(data);
  }

  async findBySessionId(sessionId: string): Promise<IOrder | null> {
    return Order.findOne({ stripeSessionId: sessionId });
  }

  async findByUser(userId: string): Promise<IOrder[]> {
    return Order.find({ user: userId }).sort({ createdAt: -1 });
  }

  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id).populate('items.product', 'title slug images');
  }

  async updateStatus(id: string, status: IOrder['status']): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export const orderRepository = new OrderRepository();
