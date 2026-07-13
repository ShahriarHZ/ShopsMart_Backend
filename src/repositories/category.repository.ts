import { Category, ICategory } from '../models/Category.model';

export class CategoryRepository {
  async create(data: Partial<ICategory>): Promise<ICategory> {
    return Category.create(data);
  }

  async findAll(activeOnly = true): Promise<ICategory[]> {
    const filter = activeOnly ? { isActive: true } : {};
    return Category.find(filter).sort({ name: 1 });
  }

  async findById(id: string): Promise<ICategory | null> {
    return Category.findById(id);
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return Category.findOne({ slug });
  }

  async slugExists(slug: string): Promise<boolean> {
    return (await Category.exists({ slug })) !== null;
  }

  async updateById(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async deleteById(id: string): Promise<ICategory | null> {
    return Category.findByIdAndDelete(id);
  }
}

export const categoryRepository = new CategoryRepository();
