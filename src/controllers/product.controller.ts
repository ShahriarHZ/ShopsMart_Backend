import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const createProduct = catchAsync(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const product = await productService.create(req.body, files);
  ApiResponse.created(res, 'Product created', product);
});

export const listProducts = catchAsync(async (req: Request, res: Response) => {
  const { items, meta } = await productService.list(req.query);
  ApiResponse.ok(res, 'Products fetched', items, { pagination: meta });
});

export const getProductById = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getById(req.params.id);
  ApiResponse.ok(res, 'Product fetched', product);
});

export const getProductBySlug = catchAsync(async (req: Request, res: Response) => {
  const product = await productService.getBySlug(req.params.slug);
  ApiResponse.ok(res, 'Product fetched', product);
});

export const getRelatedProducts = catchAsync(async (req: Request, res: Response) => {
  const related = await productService.getRelated(req.params.slug);
  ApiResponse.ok(res, 'Related products fetched', related);
});

export const updateProduct = catchAsync(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const product = await productService.update(req.params.id, req.body, files);
  ApiResponse.ok(res, 'Product updated', product);
});

export const deleteProduct = catchAsync(async (req: Request, res: Response) => {
  await productService.delete(req.params.id);
  ApiResponse.ok(res, 'Product deleted');
});

export const updateStock = catchAsync(async (req: Request, res: Response) => {
  const { stock } = req.body;
  if (typeof stock !== 'number' || stock < 0) {
    throw ApiError.badRequest('Stock must be a non-negative number');
  }
  const product = await productService.updateStock(req.params.id, stock);
  ApiResponse.ok(res, 'Stock updated', product);
});

// Guard export in case an empty multipart request slips through validation
export const ensureImages = (req: Request): void => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  if (files.length === 0) throw ApiError.badRequest('At least one image file is required');
};
