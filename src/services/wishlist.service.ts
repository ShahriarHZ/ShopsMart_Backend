import { wishlistRepository } from '../repositories/wishlist.repository';
import { productRepository } from '../repositories/product.repository';
import { cartService } from './cart.service';
import { ApiError } from '../utils/ApiError';
import { IWishlist } from '../models/Wishlist.model';

export class WishlistService {
  private async getOrCreate(userId: string): Promise<IWishlist> {
    let wishlist = await wishlistRepository.findByUser(userId);
    if (!wishlist) wishlist = await wishlistRepository.create(userId);
    return wishlist;
  }

  async getWishlist(userId: string): Promise<IWishlist> {
    return this.getOrCreate(userId);
  }

  async addProduct(userId: string, productId: string): Promise<IWishlist> {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');

    const wishlist = await this.getOrCreate(userId);
    const exists = wishlist.products.some((p) => p.toString() === productId);
    if (!exists) {
      wishlist.products.push(product._id as never);
      await wishlistRepository.save(wishlist);
    }
    return this.getOrCreate(userId);
  }

  async removeProduct(userId: string, productId: string): Promise<IWishlist> {
    const wishlist = await this.getOrCreate(userId);
    wishlist.products = wishlist.products.filter((p) => p.toString() !== productId) as typeof wishlist.products;
    await wishlistRepository.save(wishlist);
    return this.getOrCreate(userId);
  }

  async moveToCart(userId: string, productId: string): Promise<void> {
    await cartService.addItem(userId, productId, 1);
    await this.removeProduct(userId, productId);
  }
}

export const wishlistService = new WishlistService();
