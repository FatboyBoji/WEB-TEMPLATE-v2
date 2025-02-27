import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import UserController from '../controllers/UserController';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const userController = new UserController(prisma);

// User routes
router.get('/profile', authenticateToken, (req, res) => userController.getUserProfile(req, res));

// Add session limit route
router.patch('/:userId/session-limit', authenticateToken, requireRole('admin'), (req, res) => 
  userController.updateMaxSessionCount(req, res)
);

export default router; 