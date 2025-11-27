import { body } from 'express-validator';

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(['EMPLOYEE', 'ADMIN']).withMessage('Invalid role'),
];
