import { Request } from 'express';
import { JwtPayload } from '../utils/jwt';

export type UserRole = 'customer' | 'admin';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
