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
      console.log('Refresh request body:', req.body);
      console.log('Refresh request query:', req.query);
      
      // First try to get token from body, then URL, then headers
      const refreshToken = 
        (req.body && req.body.refreshToken) || 
        (req.query && req.query.refreshToken as string) ||
        req.cookies?.refreshToken ||
        req.headers['x-refresh-token'];
      
      console.log('Refresh token request received');
      console.log('Request body:', req.body);
      console.log('Request headers:', req.headers);
      console.log('Request query:', req.query);
      
      if (!refreshToken) {
        console.log('No refresh token provided in:', {
          hasCookies: !!req.cookies,
          hasBody: !!req.body,
          bodyKeys: req.body ? Object.keys(req.body) : [],
          bodyType: typeof req.body,
          queryParams: req.query,
          contentType: req.headers['content-type']
        });
        
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }
      
      console.log('Refresh token first 10 chars:', refreshToken.substring(0, 10) + '...');
      
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;
      
      console.log('Attempting to refresh token');
      const tokens = await this.authService.refreshToken(refreshToken, userAgent, ipAddress);
      console.log('Token refreshed successfully');
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });
    } catch (error: unknown) {
      console.error('Token refresh error:', error);
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

  async verifySession(req: Request, res: Response): Promise<void> {
    try {
      console.log('Session verification request received');
      
      // Get refresh token from request body - just like logout
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        console.log('No refresh token provided for verification');
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }
      
      console.log('Verifying session with refresh token');
      
      // Use the existing refreshToken method to generate new tokens
      const tokens = await this.authService.refreshToken(
        refreshToken,
        req.headers['user-agent'],
        req.ip
      );
      
      res.status(200).json({
        success: true,
        message: 'Session verified and tokens refreshed',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });
    } catch (error: unknown) {
      console.error('Session verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Session verification failed';
      res.status(401).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  // Just check if the refresh token is still valid, without creating new tokens
  async checkSession(req: Request, res: Response): Promise<void> {
    try {
      console.log('Session check request received');
      
      // Get refresh token from request body
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        console.log('No refresh token provided for session check');
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }
      
      // Just verify the token without creating new ones
      const isValid = await this.authService.isRefreshTokenValid(refreshToken);
      
      if (isValid) {
        res.status(200).json({
          success: true,
          message: 'Session is valid'
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Session is invalid or expired'
        });
      }
    } catch (error: unknown) {
      console.error('Session check error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Session check failed';
      res.status(401).json({
        success: false,
        message: errorMessage,
      });
    }
  }

  // Only renew tokens if session is confirmed valid
  async renewSession(req: Request, res: Response): Promise<void> {
    try {
      console.log('Session renewal request received');
      
      // Get refresh token from request body
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        console.log('No refresh token provided for session renewal');
        res.status(401).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }
      
      // Generate new tokens using existing method
      const tokens = await this.authService.refreshToken(
        refreshToken,
        req.headers['user-agent'],
        req.ip
      );
      
      res.status(200).json({
        success: true,
        message: 'Session renewed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken
        }
      });
    } catch (error: unknown) {
      console.error('Session renewal error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Session renewal failed';
      res.status(401).json({
        success: false,
        message: errorMessage,
      });
    }
  }
} 