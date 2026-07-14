import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import { env } from '../config/env';
import { IUser } from '../models/User.model';

const REFRESH_COOKIE_NAME = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: env.isProd,
  // 'strict' works fine on localhost (same site, different ports), but frontend and backend
  // now live on genuinely different domains in production (vercel.app vs onrender.com) —
  // that requires 'none' (paired with secure:true, which is already set above) or the browser
  // will silently refuse to send the cookie back on any cross-origin request.
  sameSite: (env.isProd ? 'none' : 'strict') as 'none' | 'strict',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sanitizeUser = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
});

export const register = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.register(req.body);
  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, cookieOptions);
  ApiResponse.created(res, 'Registration successful', {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { user, tokens } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, cookieOptions);
  ApiResponse.ok(res, 'Login successful', {
    user: sanitizeUser(user),
    accessToken: tokens.accessToken,
  });
});

export const logout = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    await authService.logout(req.user.userId);
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  ApiResponse.ok(res, 'Logout successful');
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.forgotPassword(req.body.email);
  // Always return a generic success message to prevent email enumeration
  ApiResponse.ok(res, 'If an account with that email exists, a reset link has been sent.');
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token, req.body.password);
  ApiResponse.ok(res, 'Password has been reset successfully. Please log in again.');
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!token) {
    res.status(401).json({ success: false, message: 'No refresh token provided.' });
    return;
  }
  const tokens = await authService.refreshTokens(token);
  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, cookieOptions);
  ApiResponse.ok(res, 'Token refreshed', { accessToken: tokens.accessToken });
});

export const getMe = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  ApiResponse.ok(res, 'Current user fetched', { userId: req.user?.userId, role: req.user?.role });
});
