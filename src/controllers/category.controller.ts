import { Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);
  ApiResponse.created(res, 'Category created', category);
});

export const listCategories = catchAsync(async (req: Request, res: Response) => {
  const activeOnly = req.query.all !== 'true';
  const categories = await categoryService.list(activeOnly);
  ApiResponse.ok(res, 'Categories fetched', categories);
});

export const getCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.getById(req.params.id);
  ApiResponse.ok(res, 'Category fetched', category);
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const category = await categoryService.update(req.params.id, req.body);
  ApiResponse.ok(res, 'Category updated', category);
});

export const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  await categoryService.delete(req.params.id);
  ApiResponse.ok(res, 'Category deleted');
});
