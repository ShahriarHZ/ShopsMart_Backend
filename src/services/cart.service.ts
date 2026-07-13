import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { couponService } from './coupon.service';
import { ApiError } from '../utils/ApiError';
import { calculatePricing, PricingBreakdown } from '../utils/pricing';
import { ICart } from '../models/Cart.model';

export interface CartWithTotals {
  cart: ICart;
  pricing: PricingBreakdown;
}

export class CartService {
  /** Raw (unpopulated) cart — safe for id comparisons and mutations. Creates one if missing. */
  private async getOrCreateRawCart(userId: string): Promise<ICart> {
    let cart = await cartRepository.findByUserRaw(userId);
    if (!cart) cart = await cartRepository.create(userId);
    return cart;
  }

  /** Populated cart for returning to the client (has product title/image/etc). */
  private async getPopulatedCart(userId: string): Promise<ICart> {
    const cart = await cartRepository.findByUser(userId);
    if (!cart) throw ApiError.internal('Cart unexpectedly missing after creation');
    return cart;
  }

  private async computeTotals(cart: ICart): Promise<PricingBreakdown> {
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = await couponService.safeCalculateDiscount(cart.couponCode, subtotal);
    return calculatePricing(subtotal, discount);
  }

  async getCart(userId: string): Promise<CartWithTotals> {
    await this.getOrCreateRawCart(userId); // ensure it exists
    const cart = await this.getPopulatedCart(userId);
    return { cart, pricing: await this.computeTotals(cart) };
  }

  async applyCoupon(userId: string, code: string): Promise<CartWithTotals> {
    const cart = await this.getOrCreateRawCart(userId);
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (subtotal === 0) throw ApiError.badRequest('Your cart is empty');

    // Validate now so a bad code gives an immediate error, not a silently-ignored one
    await couponService.validateAndCalculate(code, subtotal);

    cart.couponCode = code.toUpperCase();
    await cartRepository.save(cart);
    const populated = await this.getPopulatedCart(userId);
    return { cart: populated, pricing: await this.computeTotals(populated) };
  }

  async removeCoupon(userId: string): Promise<CartWithTotals> {
    const cart = await this.getOrCreateRawCart(userId);
    cart.couponCode = undefined;
    await cartRepository.save(cart);
    const populated = await this.getPopulatedCart(userId);
    return { cart: populated, pricing: await this.computeTotals(populated) };
  }

  async addItem(
    userId: string,
    productId: string,
    quantity: number,
    color?: string,
    size?: string
  ): Promise<CartWithTotals> {
    const product = await productRepository.findById(productId);
    if (!product) throw ApiError.notFound('Product not found');
    if (product.stock < quantity) throw ApiError.badRequest('Not enough stock available');

    const cart = await this.getOrCreateRawCart(userId);
    const existing = cart.items.find(
      (item) => item.product.toString() === productId && item.color === color && item.size === size
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({
        product: product._id as never,
        quantity,
        price: product.finalPrice,
        color,
        size,
      });
    }

    await cartRepository.save(cart);
    const populated = await this.getPopulatedCart(userId);
    return { cart: populated, pricing: await this.computeTotals(populated) };
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartWithTotals> {
    if (quantity < 1) throw ApiError.badRequest('Quantity must be at least 1');
    const cart = await this.getOrCreateRawCart(userId);
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) throw ApiError.notFound('Item not found in cart');

    item.quantity = quantity;
    await cartRepository.save(cart);
    const populated = await this.getPopulatedCart(userId);
    return { cart: populated, pricing: await this.computeTotals(populated) };
  }

  async removeItem(userId: string, productId: string): Promise<CartWithTotals> {
    const cart = await this.getOrCreateRawCart(userId);
    cart.items = cart.items.filter((i) => i.product.toString() !== productId) as typeof cart.items;
    await cartRepository.save(cart);
    const populated = await this.getPopulatedCart(userId);
    return { cart: populated, pricing: await this.computeTotals(populated) };
  }

  async clearCart(userId: string): Promise<void> {
    await cartRepository.clear(userId);
  }
}

export const cartService = new CartService();
