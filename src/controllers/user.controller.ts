import { Response } from 'express';
import { userService } from '../services/user.service';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../interfaces/auth.interface';
import { IUser } from '../models/User.model';

const sanitizeUser = (user: IUser) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isEmailVerified: user.isEmailVerified,
});

export const getProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = await userService.getProfile(req.user!.userId);
  ApiResponse.ok(res, 'Profile fetched', sanitizeUser(user));
});

export const updateProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const user = await userService.updateProfile(req.user!.userId, req.body);
  ApiResponse.ok(res, 'Profile updated', sanitizeUser(user));
});

export const updateAvatar = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No image file provided');
  const user = await userService.updateAvatar(req.user!.userId, req.file);
  ApiResponse.ok(res, 'Avatar updated', sanitizeUser(user));
});

export const changePassword = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user!.userId, currentPassword, newPassword);
  ApiResponse.ok(res, 'Password changed successfully. Please log in again on other devices.');
});
