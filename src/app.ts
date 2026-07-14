import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// xss-clean has no official types; imported via require in a small shim below
// eslint-disable-next-line @typescript-eslint/no-var-requires
const xss = require('xss-clean');

import { env } from './config/env';
import routes from './routes';
import { stripeWebhook } from './controllers/checkout.controller';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

export const createApp = (): Application => {
  const app = express();

  // Render (and most PaaS platforms) sit behind a reverse proxy — this tells Express to trust
  // the X-Forwarded-* headers it sets, which secure cookies and rate-limiting both rely on.
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet());

  // CORS — in development, allow any localhost/127.0.0.1 port (Vite's dev port can drift
  // if a previous instance is still lingering), while still requiring an exact match in production.
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // same-origin / non-browser requests (curl, Postman)
        if (env.isDev) {
          try {
            const { hostname } = new URL(origin);
            if (hostname === 'localhost' || hostname === '127.0.0.1') {
              return callback(null, true);
            }
          } catch {
            /* fall through to strict check below */
          }
        }
        if (origin === env.clientUrl) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
      },
      credentials: true,
    })
  );

  // Stripe webhook needs the RAW request body to verify its signature, so it must be
  // registered before express.json() parses the body into an object. Everything else
  // in the app uses the parsed JSON body as normal.
  app.post('/api/v1/checkout/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

  // Body parsing
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser(env.cookieSecret));

  // Sanitization
  app.use(mongoSanitize());
  app.use(xss());

  // Compression
  app.use(compression());

  // Logging
  if (env.isDev) {
    app.use(morgan('dev'));
  }

  // Rate limiting (applied to all /api routes)
  const limiter = rateLimit({
    windowMs: env.rateLimit.windowMs,
    max: env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
  });
  app.use('/api', limiter);

  // Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ success: true, message: 'ShopSmart AI API is healthy', uptime: process.uptime() });
  });

  // API routes
  app.use('/api/v1', routes);

  // 404 + error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
