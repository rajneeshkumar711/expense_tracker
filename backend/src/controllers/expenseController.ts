import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import prisma from '../config/database';
import { ExpenseStatus, Role } from '@prisma/client';
import { emitExpenseCreated, emitExpenseStatusChanged } from '../config/socket';

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { amount, category, description, date } = req.body;
    
    const receipt = req.file ? `/uploads/${req.file.filename}` : req.body.receipt;

    if (process.env.NODE_ENV === 'test') {
      console.log('Creating expense with userId:', req.user.id);
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
        receipt,
        userId: req.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    emitExpenseCreated(expense);

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { category, status, startDate, endDate, userId } = req.query;

    const where: any = {};

    if (req.user.role === Role.EMPLOYEE) {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId as string;
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExpenseStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    emitExpenseStatusChanged(updatedExpense);

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { startDate, endDate } = req.query;

    const where: any = {};

    if (req.user.role === Role.EMPLOYEE) {
      where.userId = req.user.id;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.date.lte = new Date(endDate as string);
      }
    }

    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const expensesByStatus = await prisma.expense.groupBy({
      by: ['status'],
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    const totalExpenses = await prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    let pendingCount = 0;
    if (req.user.role === Role.ADMIN) {
      pendingCount = await prisma.expense.count({
        where: {
          status: ExpenseStatus.PENDING,
        },
      });
    }

    res.json({
      byCategory: expensesByCategory.map((item) => ({
        category: item.category,
        total: item._sum.amount || 0,
        count: item._count.id,
      })),
      byStatus: expensesByStatus.map((item) => ({
        status: item.status,
        total: item._sum.amount || 0,
        count: item._count.id,
      })),
      total: totalExpenses._sum.amount || 0,
      count: totalExpenses._count.id,
      pendingCount,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
