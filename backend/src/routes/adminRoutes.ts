import express from 'express';
import { prisma } from '../utils/db';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        isBlocked: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Update user (admin only)
router.patch('/users/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { isBlocked, role } = req.body;
    
    // Only allow updating certain fields
    const updateData: any = {};
    if (typeof isBlocked === 'boolean') updateData.isBlocked = isBlocked;
    if (role) updateData.role = role;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        isBlocked: true
      }
    });
    
    res.json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

export default router; 