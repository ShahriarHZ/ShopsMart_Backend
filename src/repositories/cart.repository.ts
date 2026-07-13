import { Cart, ICart } from '../models/Cart.model';

export class CartRepository {
  async findByUser(userId: string): Promise<ICart | null> {
    return Cart.findOne({ user: userId }).populate('items.product', 'title slug images finalPrice stock');
  }

  /** Unpopulated — item.product stays a raw ObjectId, safe for comparisons/mutations. */
  async findByUserRaw(userId: string): Promise<ICart | null> {
    return Cart.findOne({ user: userId });
  }

  async create(userId: string): Promise<ICart> {
    return Cart.create({ user: userId, items: [] });
  }

  async save(cart: ICart): Promise<ICart> {
    return cart.save();
  }

  async clear(userId: string): Promise<void> {
    await Cart.findOneAndUpdate({ user: userId }, { items: [], couponCode: undefined });
  }
}

export const cartRepository = new CartRepository();
