import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token is required',
    });
  }
  
  try {
    const authService = new AuthService();
    const userData = await authService.verifyAccessToken(token);
    
    // Attach user data to request
    req.user = {
      userId: userData.userId,
      username: userData.username,
      role: userData.role
    };
    
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

export const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Authentication required',
      });
    }
    
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }
    
    next();
  };
}; 