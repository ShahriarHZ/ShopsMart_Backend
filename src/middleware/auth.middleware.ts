import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../interfaces/auth.interface';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { catchAsync } from '../utils/catchAsync';
import { User } from '../models/User.model';

export const protect = catchAsync(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.accessToken;

    if (!token) {
      throw ApiError.unauthorized('You are not logged in. Please log in to continue.');
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw ApiError.unauthorized('Invalid or expired token. Please log in again.');
    }

    const user = await User.findById(payload.userId).select('tokenVersion role');
    if (!user) {
      throw ApiError.unauthorized('User belonging to this token no longer exists.');
    }
    if (user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Session expired. Please log in again.');
    }

    req.user = payload;
    next();
  }
);

export const restrictTo = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };
};
