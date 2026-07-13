import { Order, OrderStatus } from '../models/Order.model';
import { Product } from '../models/Product.model';
import { User } from '../models/User.model';
import { orderRepository } from '../repositories/order.repository';
import { ApiError } from '../utils/ApiError';

const LOW_STOCK_THRESHOLD = 5;

export class AdminService {
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      revenueAgg,
      monthlyRevenueAgg,
      totalOrders,
      totalProducts,
      totalUsers,
      bestSelling,
      recentOrders,
      lowStockProducts,
      outOfStockProducts,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Product.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product',
            title: { $first: '$items.title' },
            image: { $first: '$items.image' },
            totalSold: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
      Product.find({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD }, isActive: true })
        .select('title stock sku')
        .limit(10),
      Product.find({ stock: 0, isActive: true }).select('title stock sku').limit(10),
    ]);

    const totalRevenue = revenueAgg[0]?.total ?? 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.total ?? 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      monthlyRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      averageOrderValue,
      bestSellingProducts: bestSelling,
      recentOrders,
      lowStockProducts,
      outOfStockProducts,
    };
  }

  async getRevenueTimeSeries(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async listAllOrders(status?: OrderStatus) {
    const filter = status ? { status } : {};
    return Order.find(filter).sort({ createdAt: -1 }).populate('user', 'name email');
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const updated = await orderRepository.updateStatus(orderId, status);
    if (!updated) throw ApiError.notFound('Order not found');
    return updated;
  }
}

export const adminService = new AdminService();
