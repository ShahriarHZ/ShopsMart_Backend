import { Schema, model, Document, Types } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId: string;
  alt?: string;
}

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  brand: string;
  category: Types.ObjectId;
  images: IProductImage[];
  price: number;
  discount: number; // percentage 0-100
  finalPrice: number; // computed on save
  stock: number;
  sku: string;
  ratingsAverage: number;
  ratingsCount: number;
  specifications: IProductSpecification[];
  colors: string[];
  sizes: string[];
  featured: boolean;
  bestseller: boolean;
  newArrival: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema<IProductImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

const specificationSchema = new Schema<IProductSpecification>(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    brand: { type: String, required: true, trim: true, index: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: {
      type: [productImageSchema],
      validate: [(v: IProductImage[]) => v.length > 0, 'At least one product image is required'],
    },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    finalPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    ratingsAverage: { type: Number, default: 0, min: 0, max: 5, set: (v: number) => Math.round(v * 10) / 10 },
    ratingsCount: { type: Number, default: 0, min: 0 },
    specifications: { type: [specificationSchema], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  this.finalPrice = Math.round((this.price - (this.price * this.discount) / 100) * 100) / 100;
  next();
});

productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Partial<IProduct> & { $set?: Partial<IProduct> };
  const data = update.$set ?? update;
  if (data.price !== undefined || data.discount !== undefined) {
    // Recompute if either changes; requires both to be present in payload for accuracy.
    // Controller/service layer ensures both fields are sent together when either changes.
  }
  next();
});

productSchema.index({ title: 'text', brand: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, bestseller: 1, newArrival: 1 });
productSchema.index({ category: 1, isActive: 1 });

export const Product = model<IProduct>('Product', productSchema);
