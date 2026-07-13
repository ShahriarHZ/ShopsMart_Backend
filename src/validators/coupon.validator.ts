import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().trim().min(3).max(30),
    description: z.string().trim().max(200).optional(),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.coerce.number().positive(),
    minPurchase: z.coerce.number().min(0).optional().default(0),
    usageLimit: z.coerce.number().int().positive().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({ id: z.string() }),
  body: createCouponSchema.shape.body.partial(),
});
