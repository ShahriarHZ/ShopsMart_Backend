import Stripe from 'stripe';
import { env } from './env';

if (!env.stripe.secretKey) {
  // eslint-disable-next-line no-console
  console.warn('⚠️  STRIPE_SECRET_KEY is not set — checkout endpoints will fail until it is configured.');
}

export const stripe = new Stripe(env.stripe.secretKey ?? 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
});
