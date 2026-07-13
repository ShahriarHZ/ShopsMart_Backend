import { cloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

export interface UploadedImage {
  url: string;
  publicId: string;
}

const FOLDER = 'shopsmart-ai/products';

export class UploadService {
  async uploadBuffer(buffer: Buffer, folder: string = FOLDER): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
        (error, result) => {
          if (error || !result) {
            return reject(ApiError.internal(`Image upload failed: ${error?.message ?? 'unknown error'}`));
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );
      stream.end(buffer);
    });
  }

  async uploadMany(files: Express.Multer.File[], folder?: string): Promise<UploadedImage[]> {
    return Promise.all(files.map((file) => this.uploadBuffer(file.buffer, folder)));
  }

  async deleteByPublicId(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  async deleteMany(publicIds: string[]): Promise<void> {
    await Promise.all(publicIds.map((id) => this.deleteByPublicId(id)));
  }
}

export const uploadService = new UploadService();
