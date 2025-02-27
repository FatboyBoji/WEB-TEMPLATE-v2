import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { RegisterUserDto, UserCredentials, RefreshTokenDto } from '../types/auth.types';
import { sanitizeUser } from '../models/User';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterUserDto = req.body;
      const result = await this.authService.register(
        userData,
        req.headers['user-agent'],
        req.ip
      );
      
      res.status(201).json({
        success: true,
        message: 'User registered and logged in successfully',
        data: {
          user: {
            userId: result.user.id,
            username: result.user.username,
            role: result.user.role
          },
          tokens: result.tokens
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('Login attempt:', {
        username: req.body.username,
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      const credentials: UserCredentials = req.body;
      const result = await this.authService.login(
        credentials,
        req.headers['user-agent'],
        req.ip
      );
      
      console.log('Login successful for user:', req.body.username);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            userId: result.user.id,
            username: result.user.username,
            role: result.user.role
          },
          tokens: result.tokens
        }
      });
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      res.status(401).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      // Get refresh token from cookie or request body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }
      
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;
      
      const tokens = await this.authService.refreshToken(refreshToken, userAgent, ipAddress);
      
      // Set new refresh token as HTTP-only cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
      });
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken
        }
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(401).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Get the refresh token from cookies, headers, or request body
      const refreshToken = req.cookies.refreshToken || 
                           req.body.refreshToken || 
                           (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') && 
                            req.headers.authorization.split(' ')[1]);
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required for logout'
        });
        return;
      }
      
      console.log('Logging out with refresh token:', refreshToken);
      
      await this.authService.logout(refreshToken);
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }
  }

  async terminateUserSessions(userId: number): Promise<void> {
    await this.authService.terminateAllUserSessions(userId);
  }
} 