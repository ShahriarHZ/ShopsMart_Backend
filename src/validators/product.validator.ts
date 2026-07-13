import { z } from 'zod';
import { Types } from 'mongoose';

const objectId = z.string().refine((v) => Types.ObjectId.isValid(v), 'Invalid id');

export const createProductSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(200),
    description: z.string().trim().min(10).max(5000),
    brand: z.string().trim().min(1).max(100),
    category: objectId,
    price: z.coerce.number().positive('Price must be greater than 0'),
    discount: z.coerce.number().min(0).max(100).default(0),
    stock: z.coerce.number().int().min(0).default(0),
    sku: z.string().trim().min(3).max(50),
    specifications: z
      .array(z.object({ key: z.string().min(1), value: z.string().min(1) }))
      .optional()
      .default([]),
    colors: z.array(z.string()).optional().default([]),
    sizes: z.array(z.string()).optional().default([]),
    featured: z.coerce.boolean().optional().default(false),
    bestseller: z.coerce.boolean().optional().default(false),
    newArrival: z.coerce.boolean().optional().default(false),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: objectId }),
  body: createProductSchema.shape.body.partial(),
});

export const productIdSchema = z.object({
  params: z.object({ id: objectId }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.string().optional(), // e.g. "price", "-price", "createdAt"
    search: z.string().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    featured: z.string().optional(),
    bestseller: z.string().optional(),
    newArrival: z.string().optional(),
    inStock: z.string().optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(500).optional(),
    parent: objectId.optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: objectId }),
  body: createCategorySchema.shape.body.partial(),
});
