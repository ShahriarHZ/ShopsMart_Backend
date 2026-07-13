import { FilterQuery } from 'mongoose';
import { productRepository } from '../repositories/product.repository';
import { uploadService } from './upload.service';
import { ApiError } from '../utils/ApiError';
import { generateUniqueSlug } from '../utils/slugify';
import { parsePagination, buildPaginationMeta, PaginationMeta } from '../interfaces/pagination.interface';
import { ProductQuery } from '../interfaces/product.interface';
import { IProduct } from '../models/Product.model';

const SORT_WHITELIST = new Set(['price', 'finalPrice', 'createdAt', 'ratingsAverage', 'title']);

const parseSort = (sort?: string): Record<string, 1 | -1> => {
  if (!sort) return { createdAt: -1 };
  const direction: 1 | -1 = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');
  if (!SORT_WHITELIST.has(field)) return { createdAt: -1 };
  return { [field]: direction };
};

const buildFilter = (query: ProductQuery): FilterQuery<IProduct> => {
  const filter: FilterQuery<IProduct> = { isActive: true };

  if (query.search) filter.$text = { $search: query.search };
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = new RegExp(`^${query.brand}$`, 'i');
  if (query.featured === 'true') filter.featured = true;
  if (query.bestseller === 'true') filter.bestseller = true;
  if (query.newArrival === 'true') filter.newArrival = true;
  if (query.inStock === 'true') filter.stock = { $gt: 0 };

  if (query.minPrice || query.maxPrice) {
    filter.finalPrice = {};
    if (query.minPrice) filter.finalPrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.finalPrice.$lte = Number(query.maxPrice);
  }

  return filter;
};

export class ProductService {
  async create(
    data: Record<string, unknown>,
    files: Express.Multer.File[]
  ): Promise<IProduct> {
    if (!files || files.length === 0) {
      throw ApiError.badRequest('At least one product image is required');
    }

    const skuTaken = await productRepository.skuExists(data.sku as string);
    if (skuTaken) throw ApiError.conflict('A product with this SKU already exists');

    const slug = await generateUniqueSlug(data.title as string, (s) => productRepository.slugExists(s));
    const uploaded = await uploadService.uploadMany(files);
    const images = uploaded.map((img) => ({ url: img.url, publicId: img.publicId }));

    return productRepository.create({ ...data, slug, images } as Partial<IProduct>);
  }

  async list(query: ProductQuery): Promise<{ items: IProduct[]; meta: PaginationMeta }> {
    const pagination = parsePagination(query);
    const filter = buildFilter(query);
    const sort = parseSort(query.sort);

    const { items, total } = await productRepository.findMany(filter, sort, pagination);
    return { items, meta: buildPaginationMeta(total, pagination) };
  }

  async getById(id: string): Promise<IProduct> {
    const product = await productRepository.findById(id);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  }

  async getBySlug(slug: string): Promise<IProduct> {
    const product = await productRepository.findBySlug(slug);
    if (!product) throw ApiError.notFound('Product not found');
    return product;
  }

  async getRelated(slug: string): Promise<IProduct[]> {
    const product = await this.getBySlug(slug);
    return productRepository.findRelated(String(product.category), String(product._id));
  }

  async update(id: string, data: Partial<IProduct>, newFiles?: Express.Multer.File[]): Promise<IProduct> {
    const existing = await this.getById(id);
    const payload: Partial<IProduct> = { ...data };

    if (data.title && data.title !== existing.title) {
      payload.slug = await generateUniqueSlug(data.title, (s) => productRepository.slugExists(s));
    }

    if (data.price !== undefined || data.discount !== undefined) {
      const price = data.price ?? existing.price;
      const discount = data.discount ?? existing.discount;
      payload.finalPrice = Math.round((price - (price * discount) / 100) * 100) / 100;
    }

    if (newFiles && newFiles.length > 0) {
      const uploaded = await uploadService.uploadMany(newFiles);
      payload.images = [
        ...existing.images,
        ...uploaded.map((img) => ({ url: img.url, publicId: img.publicId })),
      ];
    }

    const updated = await productRepository.updateById(id, payload);
    if (!updated) throw ApiError.notFound('Product not found');
    return updated;
  }

  async delete(id: string): Promise<void> {
    const product = await this.getById(id);
    await uploadService.deleteMany(product.images.map((img) => img.publicId));
    await productRepository.deleteById(id);
  }

  async updateStock(id: string, stock: number): Promise<IProduct> {
    const updated = await productRepository.updateById(id, { stock });
    if (!updated) throw ApiError.notFound('Product not found');
    return updated;
  }
}

export const productService = new ProductService();
