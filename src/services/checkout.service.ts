import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { cartRepository } from '../repositories/cart.repository';
import { productRepository } from '../repositories/product.repository';
import { orderRepository } from '../repositories/order.repository';
import { couponRepository } from '../repositories/coupon.repository';
import { cartService } from './cart.service';
import { couponService } from './coupon.service';
import { ApiError } from '../utils/ApiError';
import { calculatePricing } from '../utils/pricing';
import { IShippingAddress } from '../models/Order.model';
import { logger } from '../utils/logger';

export class CheckoutService {
  async createCheckoutSession(userId: string, shippingAddress: IShippingAddress): Promise<string> {
    const cart = await cartRepository.findByUser(userId);
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty');
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = await couponService.safeCalculateDiscount(cart.couponCode, subtotal);
    const pricing = calculatePricing(subtotal, discount);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item) => {
      // item.product is populated with title/images from cartRepository.findByUser
      const product = item.product as unknown as { title: string; images: { url: string }[] };
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            images: product.images?.[0]?.url ? [product.images[0].url] : undefined,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (pricing.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(pricing.shippingCost * 100),
        },
        quantity: 1,
      });
    }
    if (pricing.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Estimated Tax' },
          unit_amount: Math.round(pricing.tax * 100),
        },
        quantity: 1,
      });
    }

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (pricing.discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: Math.round(pricing.discount * 100),
        currency: 'usd',
        duration: 'once',
        name: cart.couponCode ?? 'Discount',
      });
      discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      discounts,
      success_url: `${env.clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.clientUrl}/checkout/cancel`,
      metadata: {
        userId,
        shippingAddress: JSON.stringify(shippingAddress),
        couponCode: cart.couponCode ?? '',
      },
    });

    if (!session.url) throw ApiError.internal('Failed to create Stripe checkout session');
    return session.url;
  }

  /** Fallback for local dev without a webhook tunnel: verify + fulfill directly from the client redirect. */
  async confirmSession(sessionId: string, userId: string): Promise<void> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.userId !== userId) {
      throw ApiError.forbidden('This checkout session does not belong to you');
    }
    if (session.payment_status !== 'paid') {
      throw ApiError.badRequest('Payment has not completed for this session yet');
    }

    await this.fulfillOrder(session);
  }

  /** Called from the Stripe webhook on checkout.session.completed */
  async fulfillOrder(session: Stripe.Checkout.Session): Promise<void> {
    const userId = session.metadata?.userId;
    const shippingAddressRaw = session.metadata?.shippingAddress;

    if (!userId || !shippingAddressRaw) {
      logger.error('Webhook missing metadata — cannot fulfill order', session.id);
      return;
    }

    const existing = await orderRepository.findBySessionId(session.id);
    if (existing) {
      logger.info(`Order already exists for session ${session.id}, skipping duplicate fulfillment`);
      return;
    }

    const cart = await cartRepository.findByUser(userId);
    if (!cart || cart.items.length === 0) {
      logger.error(`No cart items found for user ${userId} at fulfillment time`);
      return;
    }

    const shippingAddress: IShippingAddress = JSON.parse(shippingAddressRaw);
    const couponCode = session.metadata?.couponCode || undefined;
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = await couponService.safeCalculateDiscount(couponCode, subtotal);
    const pricing = calculatePricing(subtotal, discount);

    const orderItems = cart.items.map((item) => {
      // cart came from cartRepository.findByUser(), so item.product is a POPULATED
      // Product document here (has title/images/etc) — we need its _id for the Order's
      // reference field, not the whole object.
      const product = item.product as unknown as { _id: string; title: string; images: { url: string }[] };
      return {
        product: product._id as never,
        title: product.title,
        image: product.images?.[0]?.url ?? '',
        price: item.price,
        quantity: item.quantity,
      };
    });

    try {
      await orderRepository.create({
        user: userId as never,
        items: orderItems,
        shippingAddress,
        subtotal: pricing.subtotal,
        shippingCost: pricing.shippingCost,
        tax: pricing.tax,
        discount: pricing.discount,
        total: pricing.total,
        couponCode,
        status: 'confirmed',
        paymentStatus: 'paid',
        stripeSessionId: session.id,
        stripePaymentIntentId:
          typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
      });
    } catch (err) {
      // Duplicate key on stripeSessionId means another concurrent request already created
      // this exact order (e.g. two near-simultaneous confirmation calls) — safe to ignore.
      const isDuplicateKey = (err as { code?: number }).code === 11000;
      if (!isDuplicateKey) throw err;
      logger.info(`Duplicate fulfillment prevented by unique index for session ${session.id}`);
      return;
    }

    if (couponCode) {
      const coupon = await couponRepository.findByCode(couponCode);
      if (coupon) await couponRepository.incrementUsage(coupon.id);
    }

    // Decrement stock for each purchased item (orderItems already holds the real product _id)
    await Promise.all(
      orderItems.map((item) => productRepository.decrementStock(String(item.product), item.quantity))
    );

    await cartService.clearCart(userId);

    // TODO (Phase 4): send order confirmation email via emailService
    logger.info(`✅ Order fulfilled for user ${userId}, session ${session.id}`);
  }
}

export const checkoutService = new CheckoutService();
