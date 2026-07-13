import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), 'Invalid id');

export const addCartItemSchema = z.object({
  body: z.object({
    productId: objectId,
    quantity: z.coerce.number().int().min(1).default(1),
    color: z.string().optional(),
    size: z.string().optional(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({ productId: objectId }),
  body: z.object({
    quantity: z.coerce.number().int().min(1),
  }),
});

export const cartItemParamSchema = z.object({
  params: z.object({ productId: objectId }),
});

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  addressLine1: z.string().min(3),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(2),
  country: z.string().min(2),
});

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
  }),
});
