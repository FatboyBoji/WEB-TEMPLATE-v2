import express from 'express';
import { BudgetController } from '../controllers/BudgetController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();
const budgetController = new BudgetController();

// Get all budget items (filtered by month/year if provided)
router.get('/', authenticateToken, (req, res) => budgetController.getBudgetItems(req, res));

// Create a new budget item
router.post('/', authenticateToken, (req, res) => budgetController.createBudgetItem(req, res));

// Delete a budget item
router.delete('/:id', authenticateToken, (req, res) => budgetController.deleteBudgetItem(req, res));

export default router; 