import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

export class BudgetController {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getBudgetItems(req: Request, res: Response): Promise<void> {
    try {
      // Check if the user is authenticated before proceeding
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const userId = req.user.userId;
      const { month, year } = req.query;
      
      const items = await this.prisma.budgetItem.findMany({
        where: {
          userId,
          month: month ? Number(month) : undefined,
          year: year ? Number(year) : undefined
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      const summary = {
        totalIncome: 0,
        totalExpenses: 0,
        remainingBudget: 0
      };
      
      items.forEach(item => {
        if (item.itemType === 'income') {
          summary.totalIncome += item.amount;
        } else if (item.itemType === 'expense') {
          summary.totalExpenses += item.amount;
        }
      });
      
      summary.remainingBudget = summary.totalIncome - summary.totalExpenses;
      
      res.status(200).json({
        success: true,
        data: {
          items,
          summary
        }
      });
    } catch (error) {
      console.error('Error getting budget items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve budget items'
      });
    }
  }

  async createBudgetItem(req: Request, res: Response): Promise<void> {
    try {
      // Check if the user is authenticated before proceeding
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const userId = req.user.userId;
      const { name, amount, itemType, category, month, year } = req.body;
      
      const newItem = await this.prisma.budgetItem.create({
        data: {
          userId,
          name,
          amount: parseFloat(amount),
          itemType,
          category,
          month: Number(month),
          year: Number(year)
        }
      });
      
      res.status(201).json({
        success: true,
        message: 'Budget item created successfully',
        data: newItem
      });
    } catch (error) {
      console.error('Error creating budget item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create budget item'
      });
    }
  }

  async deleteBudgetItem(req: Request, res: Response): Promise<void> {
    try {
      // Check if the user is authenticated before proceeding
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      const userId = req.user.userId;
      const { id } = req.params;
      
      // Check if item exists and belongs to the user
      const item = await this.prisma.budgetItem.findFirst({
        where: {
          id,
          userId
        }
      });
      
      if (!item) {
        res.status(404).json({
          success: false,
          message: 'Budget item not found'
        });
        return;
      }
      
      await this.prisma.budgetItem.delete({
        where: { id }
      });
      
      res.status(200).json({
        success: true,
        message: 'Budget item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting budget item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete budget item'
      });
    }
  }
} 