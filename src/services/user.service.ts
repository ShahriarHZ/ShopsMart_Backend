import { userRepository } from '../repositories/user.repository';
import { uploadService } from './upload.service';
import { ApiError } from '../utils/ApiError';
import { IUser } from '../models/User.model';

export class UserService {
  async getProfile(userId: string): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; email?: string }): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    if (data.email && data.email.toLowerCase() !== user.email) {
      const existing = await userRepository.findByEmail(data.email);
      if (existing) throw ApiError.conflict('An account with this email already exists');
      user.email = data.email.toLowerCase();
      user.isEmailVerified = false; // re-verification would be required in a full email flow
    }
    if (data.name) user.name = data.name;

    return userRepository.save(user);
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<IUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');

    const uploaded = await uploadService.uploadBuffer(file.buffer, 'shopsmart-ai/avatars');
    user.avatar = uploaded.url;
    return userRepository.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw ApiError.unauthorized('Current password is incorrect');

    user.password = newPassword;
    user.tokenVersion += 1; // invalidate other sessions on password change
    await user.save();
  }
}

export const userService = new UserService();
