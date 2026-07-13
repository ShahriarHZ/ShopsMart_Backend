import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route not found: ${req.originalUrl}`));
};

export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let error = err;

  if (!(error instanceof ApiError)) {
    logger.error('Unhandled error', err);
    error = ApiError.internal(env.isDev ? err.message : 'Something went wrong');
  }

  const apiError = error as ApiError;

  if (!apiError.isOperational) {
    logger.error(apiError.message, apiError.stack);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.errors ? { errors: apiError.errors } : {}),
    ...(env.isDev ? { stack: apiError.stack } : {}),
  });
};
