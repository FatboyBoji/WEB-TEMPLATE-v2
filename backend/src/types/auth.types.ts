export interface UserCredentials {
  username: string;
  password: string;
}

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: number;
  username: string;
  role: string;
  sessionId?: string;
  tokenVersion: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  tokenVersion: number;
  maxSessionCount: number;
} 