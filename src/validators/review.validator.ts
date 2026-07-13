import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), 'Invalid id');

export const createReviewSchema = z.object({
  params: z.object({ productId: objectId }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().min(3).max(2000),
    images: z.array(z.string()).optional().default([]),
  }),
});

export const updateReviewSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5).optional(),
    comment: z.string().trim().min(3).max(2000).optional(),
  }),
});
