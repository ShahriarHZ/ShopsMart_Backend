import { categoryRepository } from '../repositories/category.repository';
import { ApiError } from '../utils/ApiError';
import { generateUniqueSlug } from '../utils/slugify';
import { ICategory } from '../models/Category.model';
import { Types } from 'mongoose';

export class CategoryService {
  async create(data: { name: string; description?: string; parent?: string }): Promise<ICategory> {
    const slug = await generateUniqueSlug(data.name, (s) => categoryRepository.slugExists(s));
    const { parent, ...rest } = data;
    return categoryRepository.create({
      ...rest,
      slug,
      ...(parent ? { parent: new Types.ObjectId(parent) } : {}),
    });
  }

  async list(activeOnly = true): Promise<ICategory[]> {
    return categoryRepository.findAll(activeOnly);
  }

  async getById(id: string): Promise<ICategory> {
    const category = await categoryRepository.findById(id);
    if (!category) throw ApiError.notFound('Category not found');
    return category;
  }

  async update(id: string, data: Partial<{ name: string; description: string; parent: string }>): Promise<ICategory> {
    const existing = await this.getById(id);
    const { parent, ...rest } = data;
    const payload: Partial<ICategory> = { ...rest };
    if (parent) payload.parent = new Types.ObjectId(parent);
    if (data.name && data.name !== existing.name) {
      payload.slug = await generateUniqueSlug(data.name, (s) => categoryRepository.slugExists(s));
    }
    const updated = await categoryRepository.updateById(id, payload);
    if (!updated) throw ApiError.notFound('Category not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await categoryRepository.deleteById(id);
    if (!deleted) throw ApiError.notFound('Category not found');
  }
}

export const categoryService = new CategoryService();
