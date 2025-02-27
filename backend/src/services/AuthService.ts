import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterUserDto, UserCredentials, TokenPayload, AuthTokens } from '../types/auth.types';
import { PasswordPolicyService } from './passwordPolicy';
import { RateLimiter } from './RateLimiter';

export class AuthService {
  private prisma: PrismaClient;
  private rateLimiter: RateLimiter;
  private readonly JWT_SECRET: string;
  private readonly ACCESS_TOKEN_EXPIRATION: string;
  private readonly REFRESH_TOKEN_EXPIRATION: string = '7d';

  constructor() {
    this.prisma = new PrismaClient();
    this.rateLimiter = new RateLimiter();
    this.JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
    this.ACCESS_TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '15m';
  }

  async register(userData: RegisterUserDto, userAgent?: string, ipAddress?: string): Promise<{ user: User; tokens: AuthTokens }> {
    // Validate password
    const passwordErrors = PasswordPolicyService.validatePassword(userData.password);
    if (passwordErrors.length > 0) {
      throw new Error(passwordErrors.join(', '));
    }

    // Check if username already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: userData.username },
          { email: userData.email }
        ]
      }
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    const newUser = await this.prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword,
        isActive: true // Set to active immediately
      }
    });

    // Auto-login: Create a session for the new user
    const tokens = await this.createSession(newUser, userAgent, ipAddress);

    return {
      user: newUser,
      tokens
    };
  }

  async login(credentials: UserCredentials, userAgent?: string, ipAddress?: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      console.log('AuthService login attempt:', credentials.username);
      
      const rateIdentifier = `${credentials.username}:${ipAddress}`;
      
      // Rate limiting check
      this.rateLimiter.checkRateLimit(rateIdentifier);

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { username: credentials.username }
      });

      console.log('User found:', !!user);
      
      if (!user) {
        throw new Error('Invalid username or password');
      }

      // Check if account is blocked
      if (user.isBlocked) {
        console.log('User account is blocked');
        throw new Error('Account is blocked. Please contact support.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);
      console.log('Password valid:', isPasswordValid);
      
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.prisma.user.update({
          where: { id: user.id },
          data: { 
            failedLoginAttempts: {
              increment: 1
            },
            updatedAt: new Date()
          }
        });
        
        throw new Error('Invalid username or password');
      }

      // Clear rate limiting attempts on successful login
      this.rateLimiter.clearAttempts(rateIdentifier);

      // Reset failed login attempts and set user to active on successful login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          failedLoginAttempts: 0,
          lastLogin: new Date(),
          isActive: true,
          updatedAt: new Date()
        }
      });

      // Create a new session with tokens
      const tokens = await this.createSession(user, userAgent, ipAddress);
      console.log('Session created with tokens');
      
      return {
        user,
        tokens
      };
    } catch (error) {
      console.error('AuthService login error:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<AuthTokens> {
    try {
      // Decode the token to get the sessionId
      const decoded = jwt.decode(refreshToken) as TokenPayload;
      
      if (!decoded || !decoded.sessionId) {
        throw new Error('Invalid refresh token format');
      }
      
      // Find the session by ID
      const session = await this.prisma.session.findUnique({
        where: { id: decoded.sessionId },
        include: { user: true }
      });

      if (!session) {
        console.log('Session not found:', decoded.sessionId);
        throw new Error('Session not found');
      }
      
      // Verify the refresh token matches
      if (session.refreshToken !== refreshToken) {
        console.log('Refresh token mismatch');
        throw new Error('Invalid refresh token');
      }

      // Check if token is expired
      if (new Date() > session.expiresAt) {
        console.log('Refresh token expired');
        await this.prisma.session.delete({
          where: { id: session.id }
        }).catch(err => console.warn('Failed to delete expired session:', err));
        
        throw new Error('Refresh token expired');
      }

      // Check if user is still active and not blocked
      if (!session.user.isActive || session.user.isBlocked) {
        console.log('User inactive or blocked');
        throw new Error(session.user.isBlocked ? 'Account is blocked' : 'Account is inactive');
      }

      // Check if token version matches
      if (session.user.tokenVersion !== decoded.tokenVersion) {
        console.log('Token version mismatch');
        throw new Error('Token version mismatch');
      }

      // Create new tokens
      const payload: TokenPayload = {
        userId: session.user.id,
        username: session.user.username,
        role: session.user.role,
        sessionId: session.id,
        tokenVersion: session.user.tokenVersion
      };

      // Generate new access token
      const newAccessToken = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRATION
      });

      // Generate new refresh token
      const newRefreshToken = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRATION
      });

      // Update session with new refresh token
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          refreshToken: newRefreshToken,
          userAgent: userAgent || session.userAgent,
          ipAddress: ipAddress || session.ipAddress,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Reset expiration to 7 days
        }
      }).catch(err => {
        console.error('Failed to update session:', err);
        throw new Error('Failed to refresh session');
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // Find the session to get the user ID
    const session = await this.prisma.session.findFirst({
      where: { refreshToken }
    });
    
    if (session) {
      // Update user to set isActive to false
      await this.prisma.user.update({
        where: { id: session.userId },
        data: { isActive: false }
      });
      
      // Delete the session
      await this.prisma.session.deleteMany({
        where: { refreshToken }
      });
    }
  }

  private async createSession(user: User, userAgent?: string, ipAddress?: string): Promise<AuthTokens> {
    // Create session in database first to get the session ID
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        refreshToken: '' // Will update this after creating tokens
      }
    });
    
    // Create payload for tokens including session ID
    const payload: TokenPayload = {
      userId: Number(user.id),
      username: user.username,
      role: user.role,
      sessionId: session.id, // Include the session ID in payload
      tokenVersion: user.tokenVersion
    };

    // Generate access token
    const accessToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRATION
    });

    // Generate refresh token
    const refreshToken = jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRATION
    });

    // Update the session with the refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken }
    });

    return {
      accessToken,
      refreshToken
    };
  }

  async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      
      // Get the current token version from the database
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (user.tokenVersion !== decoded.tokenVersion) {
        throw new Error('Token has been invalidated');
      }
      
      if (user.isBlocked) {
        throw new Error('Account is blocked');
      }
      
      return decoded;
    } catch (error) {
      // Make sure to properly pass on JWT errors
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw error;
      }
    }
  }

  async terminateAllUserSessions(userId: number): Promise<void> {
    // Increment the token version to invalidate all existing tokens
    await this.prisma.user.update({
      where: { id: userId },
      data: { 
        tokenVersion: {
          increment: 1
        },
        isActive: false
      }
    });
    
    // Delete all sessions for this user
    await this.prisma.session.deleteMany({
      where: { userId }
    });
  }

  // New method that just checks if refresh token is valid without creating new tokens
  async isRefreshTokenValid(refreshToken: string): Promise<boolean> {
    try {
      // Decode the token to get the sessionId
      const decoded = jwt.decode(refreshToken) as TokenPayload;
      
      if (!decoded || !decoded.sessionId) {
        return false;
      }
      
      // Find the session by ID
      const session = await this.prisma.session.findUnique({
        where: { id: decoded.sessionId },
        include: { user: true }
      });

      if (!session) {
        return false;
      }
      
      // Verify the refresh token matches
      if (session.refreshToken !== refreshToken) {
        return false;
      }

      // Check if token is expired
      if (new Date() > session.expiresAt) {
        return false;
      }

      // Check if user is still active and not blocked
      if (!session.user.isActive || session.user.isBlocked) {
        return false;
      }

      // Check if token version matches
      if (session.user.tokenVersion !== decoded.tokenVersion) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking refresh token validity:', error);
      return false;
    }
  }
} 