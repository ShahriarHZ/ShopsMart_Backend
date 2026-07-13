import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

mongoose.set('strictQuery', true);

let isConnected = false;

export const connectDB = async (retries = 5, delayMs = 3000): Promise<void> => {
  if (isConnected) return;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.mongoUri);
      isConnected = true;
      logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      logger.error(`❌ MongoDB connection attempt ${attempt}/${retries} failed`, error);
      if (attempt === retries) {
        logger.error('MongoDB connection failed after max retries. Exiting.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (!isConnected) return;
  await mongoose.connection.close();
  isConnected = false;
  logger.info('MongoDB connection closed');
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', err);
});
