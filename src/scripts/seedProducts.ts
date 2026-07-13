/**
 * Bulk product importer. Edit src/data/products.seed.json with your real products,
 * then run: npm run seed:products
 *
 * Safe to re-run — products are matched by SKU, so already-imported ones are skipped
 * (not duplicated) and only new entries in the JSON get inserted.
 *
 * Category is matched by name (case-insensitive) and auto-created if it doesn't exist yet,
 * so you don't need to know or create category IDs by hand.
 *
 * Images: paste any publicly reachable image URLs (Unsplash, your own hosting, or URLs of
 * images you've already uploaded to Cloudinary elsewhere). This script stores them directly
 * without re-uploading — if you need Cloudinary-hosted, optimized copies, add products through
 * the admin "Add Product" UI instead, which handles the upload for you.
 */
import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../config/db';
import { Product } from '../models/Product.model';
import { Category } from '../models/Category.model';
import { generateUniqueSlug } from '../utils/slugify';
import { logger } from '../utils/logger';

interface SeedProduct {
  title: string;
  description: string;
  brand: string;
  category: string; // category NAME, not an id
  price: number;
  discount?: number;
  stock: number;
  sku: string;
  images: string[]; // plain URLs
  colors?: string[];
  sizes?: string[];
  specifications?: { key: string; value: string }[];
  featured?: boolean;
  bestseller?: boolean;
  newArrival?: boolean;
}

const categoryCache = new Map<string, string>(); // name (lowercase) -> categoryId

const getOrCreateCategory = async (name: string): Promise<string> => {
  const key = name.trim().toLowerCase();
  if (categoryCache.has(key)) return categoryCache.get(key)!;

  let category = await Category.findOne({ name: new RegExp(`^${name.trim()}$`, 'i') });
  if (!category) {
    const slug = await generateUniqueSlug(name, async (s) => (await Category.exists({ slug: s })) !== null);
    category = await Category.create({ name: name.trim(), slug });
    logger.info(`  Created new category: ${name}`);
  }

  categoryCache.set(key, category.id);
  return category.id;
};

const run = async (): Promise<void> => {
  await connectDB();

  const filePath = path.join(__dirname, '../data/products.seed.json');
  if (!fs.existsSync(filePath)) {
    logger.error(`Seed file not found at ${filePath}`);
    process.exit(1);
  }

  const products: SeedProduct[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  logger.info(`Found ${products.length} product(s) in seed file.`);

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const existing = await Product.findOne({ sku: p.sku.toUpperCase() });
    if (existing) {
      skipped++;
      continue;
    }

    const categoryId = await getOrCreateCategory(p.category);
    const slug = await generateUniqueSlug(p.title, async (s) => (await Product.exists({ slug: s })) !== null);

    await Product.create({
      title: p.title,
      slug,
      description: p.description,
      brand: p.brand,
      category: categoryId,
      images: p.images.map((url, i) => ({ url, publicId: `external-${p.sku}-${i}`, alt: p.title })),
      price: p.price,
      discount: p.discount ?? 0,
      stock: p.stock,
      sku: p.sku.toUpperCase(),
      colors: p.colors ?? [],
      sizes: p.sizes ?? [],
      specifications: p.specifications ?? [],
      featured: p.featured ?? false,
      bestseller: p.bestseller ?? false,
      newArrival: p.newArrival ?? false,
    });

    created++;
    logger.info(`  ✅ Created: ${p.title}`);
  }

  logger.info(`\nDone. ${created} product(s) created, ${skipped} already existed and were skipped.`);
  await disconnectDB();
  process.exit(0);
};

run().catch((err) => {
  logger.error('Product seeding failed', err);
  process.exit(1);
});