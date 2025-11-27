export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ExpenseCategory {
  TRAVEL = 'TRAVEL',
  FOOD = 'FOOD',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES',
  EQUIPMENT = 'EQUIPMENT',
  SOFTWARE = 'SOFTWARE',
  TRAINING = 'TRAINING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  status: ExpenseStatus;
  receipt?: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateExpenseData {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  receipt?: string;
}

export interface Analytics {
  byCategory: {
    category: ExpenseCategory;
    total: number;
    count: number;
  }[];
  byStatus: {
    status: ExpenseStatus;
    total: number;
    count: number;
  }[];
  total: number;
  count: number;
  pendingCount: number;
}
