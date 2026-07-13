import { Wishlist, IWishlist } from '../models/Wishlist.model';

export class WishlistRepository {
  async findByUser(userId: string): Promise<IWishlist | null> {
    return Wishlist.findOne({ user: userId }).populate(
      'products',
      'title slug images price finalPrice ratingsAverage ratingsCount stock brand discount'
    );
  }

  async create(userId: string): Promise<IWishlist> {
    return Wishlist.create({ user: userId, products: [] });
  }

  async save(wishlist: IWishlist): Promise<IWishlist> {
    return wishlist.save();
  }
}

export const wishlistRepository = new WishlistRepository();
