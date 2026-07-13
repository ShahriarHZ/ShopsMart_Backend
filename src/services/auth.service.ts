import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { generateTokenPair } from '../utils/jwt';
import { RegisterInput, LoginInput, TokenPair } from '../interfaces/auth.interface';
import { IUser } from '../models/User.model';

export type { TokenPair };

const PASSWORD_RESET_EXPIRES_MS = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: IUser; tokens: TokenPair }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists.');
    }

    const user = await userRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: input.password,
    });

    const tokens = generateTokenPair({
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // TODO (Phase 2): send email verification link via emailService

    return { user, tokens };
  }

  async login(input: LoginInput): Promise<{ user: IUser; tokens: TokenPair }> {
    const user = await userRepository.findByEmail(input.email, true);
    if (!user || !(await user.comparePassword(input.password))) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const tokens = generateTokenPair({
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return { user, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    const { verifyRefreshToken } = await import('../utils/jwt');
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token.');
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw ApiError.unauthorized('Invalid or expired refresh token.');
    }

    return generateTokenPair({
      userId: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });
  }

  async logout(userId: string): Promise<void> {
    // Invalidate all existing refresh/access tokens for this user
    await userRepository.incrementTokenVersion(userId);
  }

  async forgotPassword(email: string): Promise<string | null> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Do not leak whether the email exists
      return null;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + PASSWORD_RESET_EXPIRES_MS);
    await userRepository.save(user);

    // TODO (Phase 2): send reset email via emailService
    return resetToken;
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const user = await userRepository.findByResetToken(hashedToken);

    if (!user) {
      throw ApiError.badRequest('Password reset token is invalid or has expired.');
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1; // invalidate old sessions
    await userRepository.save(user);
  }
}

export const authService = new AuthService();
