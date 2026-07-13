import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { checkoutService } from '../services/checkout.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import { logger } from '../utils/logger';

export const createCheckoutSession = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const url = await checkoutService.createCheckoutSession(req.user!.userId, req.body.shippingAddress);
  ApiResponse.ok(res, 'Checkout session created', { url });
});

/**
 * Fallback for local dev (no webhook tunnel running): the frontend calls this right after
 * Stripe redirects back to /checkout/success. It re-verifies payment status directly with
 * Stripe's API before fulfilling — it does NOT trust the client, only the session_id + Stripe's
 * own record of payment_status. fulfillOrder() is idempotent, so if the real webhook also
 * fires (e.g. once you do set one up), it's a safe no-op the second time.
 */
export const confirmCheckoutSession = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) throw ApiError.badRequest('sessionId is required');
  await checkoutService.confirmSession(sessionId, req.user!.userId);
  ApiResponse.ok(res, 'Order confirmed');
});

/**
 * Stripe webhook — mounted with express.raw() BEFORE the global JSON body parser
 * (see app.ts) so the signature can be verified against the exact raw payload bytes.
 */
export const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'];
  if (!signature || !env.stripe.webhookSecret) {
    throw ApiError.badRequest('Missing Stripe signature or webhook secret not configured');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, signature, env.stripe.webhookSecret);
  } catch (err) {
    logger.error('Stripe webhook signature verification failed', err);
    res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await checkoutService.fulfillOrder(session);
  }

  res.json({ received: true });
});
