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
        createdAt: true,
        maxSessionCount: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      // here we only dont show special role user because i dont want him to get blocked or terminated as chef - or better to just select role: admin
      // where:{
      //   username: {
      //     not: 'admin'
      //   }
      // }
      where:{
        role: 'user'
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

// Get system settings
router.get('/settings', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    // Get the default session limit setting from the database
    // This could come from a Settings table, but for simplicity, we can use the first admin user's setting
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { maxSessionCount: true }
    });
    
    // Return the settings
    res.json({
      success: true,
      data: {
        defaultSessionLimit: adminUser?.maxSessionCount || 5 // Default to 5 if not found
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
});

// Update system settings
router.post('/settings', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { defaultSessionLimit } = req.body;
    
    // Validate input
    if (typeof defaultSessionLimit !== 'number' || defaultSessionLimit < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid default session limit'
      });
    }
    
    // Update the default session limit in the database
    // This will be used for new users
    await prisma.$executeRaw`
      UPDATE "user_wa" 
      SET "maxSessionCount" = ${defaultSessionLimit} 
      WHERE "id" NOT IN (
        SELECT "id" FROM "user_wa" ORDER BY "id" ASC LIMIT 1
      )
    `;
    
    // Save the default value in the admin user for future reference
    await prisma.user.update({
      where: { 
        id: 1 // Assuming the first user is an admin
      },
      data: { 
        maxSessionCount: defaultSessionLimit 
      }
    });
    
    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { defaultSessionLimit }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

export default router; 