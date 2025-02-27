import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

class UserController {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
        return;
      }
      
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true
        }
      });
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while fetching user profile'
      });
    }
  }

  async updateMaxSessionCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      const { maxSessionCount } = req.body;
      
      // Validate input
      if (isNaN(maxSessionCount) || maxSessionCount < 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid max session count. Must be a non-negative number.'
        });
        return;
      }
      
      // Update the user
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { maxSessionCount }
      });
      
      res.status(200).json({
        success: true,
        message: 'User session limit updated successfully',
        data: {
          userId: updatedUser.id,
          username: updatedUser.username,
          maxSessionCount: updatedUser.maxSessionCount
        }
      });
    } catch (error) {
      console.error('Error updating user session limit:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user session limit'
      });
    }
  }
}

export default UserController; 