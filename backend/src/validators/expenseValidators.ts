import { body } from 'express-validator';

export const createExpenseValidator = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .isIn([
      'TRAVEL',
      'FOOD',
      'OFFICE_SUPPLIES',
      'EQUIPMENT',
      'SOFTWARE',
      'TRAINING',
      'ENTERTAINMENT',
      'OTHER',
    ])
    .withMessage('Invalid category'),
  body('description')
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('receipt').optional().isString(),
];

export const updateExpenseStatusValidator = [
  body('status')
    .isIn(['PENDING', 'APPROVED', 'REJECTED'])
    .withMessage('Invalid status'),
];
