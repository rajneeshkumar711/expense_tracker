import { Router } from 'express';
import {
  createExpense,
  getExpenses,
  updateExpenseStatus,
  getAnalytics,
} from '../controllers/expenseController';
import {
  createExpenseValidator,
  updateExpenseStatusValidator,
} from '../validators/expenseValidators';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('receipt'), createExpenseValidator, createExpense);
router.get('/', getExpenses);
router.patch('/:id/status', authorize(Role.ADMIN), updateExpenseStatusValidator, updateExpenseStatus);
router.get('/analytics', getAnalytics);

export default router;
