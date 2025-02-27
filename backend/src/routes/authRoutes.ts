import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireRole } from '../middleware/roleMiddleware';

const router = express.Router();
const authController = new AuthController();

// Register new user
router.post('/register', (req, res) => authController.register(req, res));

// Login user
router.post('/login', (req, res) => authController.login(req, res));

// Refresh token
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

// Logout user
router.post('/logout', (req, res) => {
  // Get the refresh token from cookies, headers, or request body
  const refreshToken = req.cookies.refreshToken || 
                       req.body.refreshToken || 
                       (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') && 
                        req.headers.authorization.split(' ')[1]);

  authController.logout(req, res);
});

// Get current user (protected route example)
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      userId: req.user?.userId,
      username: req.user?.username,
      role: req.user?.role
    }
  });
});

// Terminate all sessions for a user (admin only)
router.post('/terminate-sessions/:userId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    await authController.terminateUserSessions(userId);
    
    res.status(200).json({
      success: true,
      message: 'All user sessions terminated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to terminate user sessions'
    });
  }
});

// Add this new route
router.post('/verify-session', authController.verifySession.bind(authController));

// Add these new routes
router.post('/check-session', authController.checkSession.bind(authController));
router.post('/renew-session', authController.renewSession.bind(authController));

export default router; 