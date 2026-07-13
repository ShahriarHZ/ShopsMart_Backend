import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  CLIENT_URL: z.string().default('http://localhost:5173'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  COOKIE_SECRET: z.string().default('dev_cookie_secret'),
  BCRYPT_SALT_ROUNDS: z.string().default('12'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX: z.string().default('200'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const raw = parsed.data;

export const env = {
  nodeEnv: raw.NODE_ENV,
  port: Number(raw.PORT),
  clientUrl: raw.CLIENT_URL,

  mongoUri: raw.MONGODB_URI,

  jwt: {
    accessSecret: raw.JWT_ACCESS_SECRET,
    refreshSecret: raw.JWT_REFRESH_SECRET,
    accessExpiresIn: raw.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: raw.JWT_REFRESH_EXPIRES_IN,
  },

  cookieSecret: raw.COOKIE_SECRET,
  bcryptSaltRounds: Number(raw.BCRYPT_SALT_ROUNDS),

  cloudinary: {
    cloudName: raw.CLOUDINARY_CLOUD_NAME,
    apiKey: raw.CLOUDINARY_API_KEY,
    apiSecret: raw.CLOUDINARY_API_SECRET,
  },

  stripe: {
    secretKey: raw.STRIPE_SECRET_KEY,
    webhookSecret: raw.STRIPE_WEBHOOK_SECRET,
    publishableKey: raw.STRIPE_PUBLISHABLE_KEY,
  },

  smtp: {
    host: raw.SMTP_HOST,
    port: raw.SMTP_PORT ? Number(raw.SMTP_PORT) : undefined,
    user: raw.SMTP_USER,
    pass: raw.SMTP_PASS,
    from: raw.EMAIL_FROM,
  },

  ai: {
    openaiKey: raw.OPENAI_API_KEY,
    geminiKey: raw.GEMINI_API_KEY,
  },

  rateLimit: {
    windowMs: Number(raw.RATE_LIMIT_WINDOW_MS),
    max: Number(raw.RATE_LIMIT_MAX),
  },

  isProd: raw.NODE_ENV === 'production',
  isDev: raw.NODE_ENV === 'development',
} as const;
